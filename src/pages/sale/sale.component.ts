import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {LoaderService} from "../../services/loader.service";
import {SaleService} from "../../services/sale.service";
import {DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {ISaleResponse} from "../../interfaces/ISaleResponse";
import {IDailySale} from "../../interfaces/IDailySale";
import {ISaleData} from "../../interfaces/ISaleData";

@Component({
  selector: 'app-sale',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    DecimalPipe
  ],
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.css'
})
export class SaleComponent {
  date: string = '';
  sales : ISaleResponse | null = null;
  errorMessage: string = '';
  filteredSales1: IDailySale[] = [];
  filteredSales2: IDailySale[] = [];
  filteredSales3: IDailySale[] = [];

  constructor(
    private loadService: LoaderService,
    private saleService: SaleService
  ) {}

  onSubmit(){
    this.sales = null
    if (this.date > this.getTodayAsString() || !this.date){
      this.errorMessage = 'Tarixi düzgün seçin!'
      return;
    }
    this.errorMessage = ''
    this.loadService.show()
    this.saleService.getSaleByDate(this.date).subscribe(response => {
      console.log(response)
      this.sales = response;
      this.filterSales();
      this.loadService.hide();
    }, error => {
      this.errorMessage = 'Xəta baş verdi'
      console.error(error)
    })
  }

  private getTodayAsString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  private filterSales(){
    if (this.sales) {
      this.filteredSales1 = this.sales.data
        .flatMap((sale: ISaleData) => sale.dailySales)
        .filter(dailySale => dailySale.contractName === 'Azcake Kulinariya');

      this.filteredSales2 = this.sales.data
        .flatMap((sale: ISaleData) => sale.dailySales)
        .filter(dailySale => dailySale.contractName === 'ARENDA AZCAKE SHIRNIYYAT');

      this.filteredSales3 = this.sales.data
        .flatMap((sale: ISaleData) => sale.dailySales)
        .filter(dailySale => dailySale.contractName === 'ARENDA AZCAKE TENDIR');
    }
  }
  getTotal(dailySales: IDailySale[]): number {
    return dailySales.reduce((sum, sale) => sum + sale.total, 0);
  }
}
