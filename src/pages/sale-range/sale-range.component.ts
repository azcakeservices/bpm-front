import {Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SaleService } from '../../services/sale.service';
import { ISaleOfRentalDailyTotal } from '../../interfaces/ISaleOfRentalDailyTotal';
import { LoaderService } from '../../services/loader.service';
import { IDailySale } from '../../interfaces/IDailySale';
import {DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {ToasterCustomService} from "../../services/toaster.service";
import * as dateUtils from "../../app/shared/utils/date-utils";

@Component({
  selector: 'app-sale-range',
  standalone: true,
  imports: [
    FormsModule,
    DecimalPipe,
    NgIf,
    NgForOf,
  ],
  templateUrl: './sale-range.component.html',
  styleUrl: './sale-range.component.css',
})
export class SaleRangeComponent implements OnInit {
  startDate = '';
  endDate = '';
  sales: ISaleOfRentalDailyTotal | null = null;
  filteredSales1: IDailySale[] = [];
  branches: string[] = [];
  errorMessage: string = '';

  salesDataByCategory: Record<string, {
    branches: string[];
    salesData: Record<string, number[]>;
  }> = {};

  constructor(
    private saleService: SaleService,
    private loaderService: LoaderService,
    private toastrService: ToasterCustomService
  ) {}

  ngOnInit() {
    this.loaderService.show();
    this.toastrService.info('Satışlar yüklənir')
    this.saleService.getRangeSales(dateUtils.getTodayAsString(), dateUtils.getTodayAsString()).subscribe(response => {
      this.sales = response;
      this.filterSales();
      this.prepareData();
      this.toastrService.success('Satışlar yükləndi')
      this.loaderService.hide();
    })
  }

  onSubmit() {
    if (!this.startDate || !this.endDate){
      this.toastrService.error('Tarix aralığını seçin!');
      return;
    }
    else if(this.startDate > dateUtils.getTodayAsString()) {
      this.toastrService.error('Raportun başlama tarixi bugündən artıq ola bilməz!');
      return;
    }
    else if (this.endDate > dateUtils.getTodayAsString()){
      this.toastrService.error('Raportun bitmə tarixi bugündən artıq ola bilməz!');
      return;
    }
    else if (this.startDate > this.endDate){
      this.toastrService.error('Başlama tarixi bitmə tarixindən böyük ola bilməz!')
      return;
    }
    this.loaderService.show();
    this.toastrService.info('Satışlar yüklənir, zəhmət olmasa bir qədər gözləyin');
    this.sales = null
    this.saleService.getRangeSales(this.startDate, this.endDate).subscribe(
      (response) => {
        this.sales = response;
        this.filterSales();
        this.prepareData();
        this.toastrService.success('Satışlar yükləndi')
        this.loaderService.hide();
      },
      (error) => {
        this.errorMessage = 'Xəta baş verdi';
        this.toastrService.error(error)
        this.loaderService.hide();
      }
    );
  }

  private filterSales() {
    if (this.sales) {
      this.filteredSales1 = this.sales.data
        .flatMap((saleData) => saleData.sales)
        .filter((dailySale) => dailySale.contractName === 'Azcake Kulinariya');
    }
  }

  prepareData() {
    if (this.sales && this.sales.data.length > 0) {
      const categories = [
        { key: 'Kulinariya', contractName: 'Azcake Kulinariya' },
        { key: 'Şirniyyat', contractName: 'ARENDA AZCAKE SHIRNIYYAT' },
        { key: 'Təndir', contractName: 'ARENDA AZCAKE TENDIR' }
      ];

      categories.forEach(({ key, contractName }) => {
        const filteredSales = this.sales?.data
          .flatMap(saleData => saleData.sales)
          .filter(sale => sale.contractName === contractName);

        const branches = Array.from(new Set(filteredSales!.map(sale => sale.branchName)));
        const salesData: Record<string, number[]> = {};

        // Группируем продажи по дате
        filteredSales!.forEach(sale => {
          const date = this.formatDateToYyyyMmDd(sale.saleDate);
          if (!salesData[date]) {
            salesData[date] = Array(branches.length).fill(0);
          }
          const branchIndex = branches.indexOf(sale.branchName);
          if (branchIndex !== -1) {
            salesData[date][branchIndex] += sale.total || 0;
          }
        });

        this.salesDataByCategory[key] = { branches, salesData };
      });

      console.log('Sales Data by Category:', this.salesDataByCategory);
    }
  }

  formatDateToYyyyMmDd(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getTotalForAllCategories(): number {
    let total = 0;

    Object.values(this.salesDataByCategory).forEach(categoryData => {
      Object.values(categoryData.salesData).forEach(salesForDate => {
        total += salesForDate.reduce((sum, value) => sum + value, 0);
      });
    });

    return total;
  }

  protected readonly Object = Object;

  downloadExcel(){
    this.loaderService.show();
    this.saleService.downloadRangeExcel(this.sales!)
      .subscribe(response => {
        const base64 = response.body.base64;
        const fileName = response.body.fileName;
        this.downloadFile(base64, fileName);
        this.toastrService.success(`Fayl Yüklənmələr qovluğuna əlavə edildi: ${fileName}`)
        this.loaderService.hide();
      })
  }

  private downloadFile(base64: string, fileName: string){
    const linkSource = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }
}
