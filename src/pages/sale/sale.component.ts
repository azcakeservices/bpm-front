import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {LoaderService} from "../../services/loader.service";
import {SaleService} from "../../services/sale.service";
import {DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {ISaleResponse} from "../../interfaces/ISaleResponse";
import {IDailySale} from "../../interfaces/IDailySale";
import {ISaleData} from "../../interfaces/ISaleData";
import {ToasterCustomService} from "../../services/toaster.service";
import * as dateUtils from '../../app/shared/utils/date-utils';

@Component({
  selector: 'app-sale',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    DecimalPipe,
  ],
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.css'
})
export class SaleComponent implements OnInit{
  date: string = '';
  sales : ISaleResponse | null = null;
  errorMessage: string = '';
  filteredSales1: IDailySale[] = [];
  filteredSales2: IDailySale[] = [];
  filteredSales3: IDailySale[] = [];

  constructor(
    private loadService: LoaderService,
    private saleService: SaleService,
    private toastrService: ToasterCustomService
  ) {}

  ngOnInit() {
    this.loadService.show();
    console.log('OnInit')

    this.saleService.getSaleByDate(dateUtils.getTodayAsString()).subscribe(response => {
      this.sales = response;
      this.filterSales();
      this.toastrService.success('Bugünün satışları yükləndi')
      this.loadService.hide();
    })


  }

  onSubmit(){
    this.sales = null;
    this.filteredSales1 = this.filteredSales2 = this.filteredSales3 = []
    if (this.date > dateUtils.getTodayAsString() || !this.date){
      this.errorMessage = 'Tarixi düzgün seçin!'
      return;
    }
    this.errorMessage = ''
    this.loadService.show()
    this.toastrService.info('Satışlar yüklənir, zəhmət olmasa bir qədər gözləyin');
    this.saleService.getSaleByDate(this.date).subscribe(response => {
      console.log(response)
      this.sales = response;
      this.filterSales();
      this.toastrService.success('Satışlar yükləndi')
      this.loadService.hide();
    }, error => {
      this.errorMessage = 'Xəta baş verdi'
      this.toastrService.error(error)
      this.loadService.hide();
    })
  }

  private filterSales(){
    if (this.sales) {
      this.filteredSales1 = this.sales.data
        .flatMap((sale: ISaleData) => sale.dailySales ?? [])
        .filter(dailySale => dailySale.contractName === 'Azcake Kulinariya');

      this.filteredSales2 = this.sales.data
        .flatMap((sale: ISaleData) => sale.dailySales ?? [])
        .filter(dailySale => dailySale.contractName === 'ARENDA AZCAKE SHIRNIYYAT');

      this.filteredSales3 = this.sales.data
        .flatMap((sale: ISaleData) => sale.dailySales ?? [])
        .filter(dailySale => dailySale.contractName === 'ARENDA AZCAKE TENDIR');
    }
  }

  getTotal(dailySales: IDailySale[]): number {
    return dailySales.reduce((sum, sale) => sum + sale.total!, 0);
  }

  downloadExcel(){
    this.loadService.show();
    this.saleService.downloadExcel(this.sales!)
      .subscribe(response => {
        const base64 = response.body.base64;
        const fileName = response.body.fileName;
        this.downloadFile(base64, fileName);
        this.toastrService.success(`Fayl Yüklənmələr qovluğuna əlavə edildi: ${fileName}`)
        this.loadService.hide();
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
