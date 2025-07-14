import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SaleService } from '../../services/sale.service';
import { ISaleOfRentalDailyTotal } from '../../interfaces/ISaleOfRentalDailyTotal';
import { LoaderService } from '../../services/loader.service';
import { DecimalPipe, NgForOf, NgIf } from "@angular/common";
import { ToasterCustomService } from "../../services/toaster.service";
import * as dateUtils from "../../app/shared/utils/date-utils";
import { IPreparedRangeSale } from "../../interfaces/IPreparedRangeSale";

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
  errorMessage: string = '';
  protected preparedSale: IPreparedRangeSale[] = [];

  constructor(
    private saleService: SaleService,
    private loaderService: LoaderService,
    private toastrService: ToasterCustomService
  ) {}

  ngOnInit() {
    this.loaderService.show();
    this.toastrService.info('Satışlar yüklənir');
    this.saleService.getRangeSales(dateUtils.getTodayAsString(), dateUtils.getTodayAsString())
      .subscribe(response => {
        this.sales = response;
        this.prepareSales(response);
        this.toastrService.success('Satışlar yükləndi');
        this.loaderService.hide();
      });
  }

  onSubmit() {
    if (!this.startDate || !this.endDate){
      this.toastrService.error('Tarix aralığını seçin!');
      return;
    }
    if (this.startDate > dateUtils.getTodayAsString()) {
      this.toastrService.error('Raportun başlama tarixi bugündən artıq ola bilməz!');
      return;
    }
    if (this.endDate > dateUtils.getTodayAsString()) {
      this.toastrService.error('Raportun bitmə tarixi bugündən artıq ola bilməz!');
      return;
    }
    if (this.startDate > this.endDate) {
      this.toastrService.error('Başlama tarixi bitmə tarixindən böyük ola bilməz!');
      return;
    }

    this.loaderService.show();
    this.toastrService.info('Satışlar yüklənir, zəhmət olmasa bir qədər gözləyin');
    this.sales = null;
    this.saleService.getRangeSales(this.startDate, this.endDate).subscribe(
      response => {
        console.log(response)
        this.sales = response;
        this.prepareSales(response);
        this.toastrService.success('Satışlar yükləndi');
        this.loaderService.hide();
      },
      error => {
        this.errorMessage = 'Xəta baş verdi';
        this.toastrService.error(error);
        this.loaderService.hide();
      }
    );
  }

  private prepareSales(response: ISaleOfRentalDailyTotal) {
    this.preparedSale = [];

    const categories = [
      { key: 'Kulinariya', contractName: 'Azcake Kulinariya' },
      { key: 'Şirniyyat', contractName: 'ARENDA AZCAKE SHIRNIYYAT' },
      { key: 'Təndir', contractName: 'ARENDA AZCAKE TENDIR' }
    ];

    for (const { key, contractName } of categories) {
      const filtered = response.data
        .flatMap(s => s.sales)
        .filter(s => s.contractName === contractName);

      const dateMap = new Map<string, Map<string, number>>();

      for (const sale of filtered) {
        const date = this.formatDateToYyyyMmDd(sale.saleDate);
        const branch = sale.branchName;
        const total = sale.total ?? 0;

        if (!dateMap.has(date)) {
          dateMap.set(date, new Map());
        }

        const branchMap = dateMap.get(date)!;
        branchMap.set(branch, (branchMap.get(branch) ?? 0) + total);
      }

      for (const [date, branchMap] of dateMap.entries()) {
        const sales = Array.from(branchMap.entries()).map(([branchName, total]) => ({
          branchName,
          total
        }));

        this.preparedSale.push({
          date,
          category: key,
          sales
        });
      }
    }

    this.preparedSale.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  getSaleByCategory(category: string): IPreparedRangeSale[] {
    return this.preparedSale.filter(s => s.category === category);
  }

  getBranchesByCategory(category: string): string[] {
    const branches = this.getSaleByCategory(category)
      .flatMap(s => s.sales.map(sale => sale.branchName));
    return Array.from(new Set(branches)).sort();
  }

  getTotalByBranch(sales: { branchName: string; total: number }[], branch: string): number {
    const found = sales.find(s => s.branchName === branch);
    return found ? found.total : 0;
  }

  formatDateToYyyyMmDd(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  downloadExcel() {
    this.loaderService.show();
    this.saleService.downloadRangeExcel(this.sales!)
      .subscribe(response => {
        const base64 = response.body.base64;
        const fileName = response.body.fileName;
        this.downloadFile(base64, fileName);
        this.toastrService.success(`Fayl Yüklənmələr qovluğuna əlavə edildi: ${fileName}`);
        this.loaderService.hide();
      });
  }

  private downloadFile(base64: string, fileName: string) {
    const linkSource = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  getTotalForAllCategories(): number {
    return this.preparedSale
      .flatMap(item => item.sales)
      .reduce((sum, sale) => sum + (sale.total || 0), 0);
  }

}
