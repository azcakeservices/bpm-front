import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ISale} from "../interfaces/ISale";
import {ConfigService} from "./config.service";

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private readonly api: string = ''
  constructor(private http: HttpClient, private config: ConfigService){
    this.api = this.config.apiUrlProduction.saleService
  }

  getSales(dateFrom: string, dateTo: string, saleType: string): Observable<ISale[]>{
    let sale: string = '';
    console.log(saleType)
    switch (saleType) {
      case 'Təndir':
        sale = 'DailyBread';
        break;
      case 'Şirniyyat':
        sale = 'DailySweet';
        break;
      case 'Kulinariya':
        sale = 'DailyCook';
        break;
      default:
        throw new Error(`Unknown sale type: ${saleType}`);
    }

    const dateRange = {
      dateFrom,
      dateTo
    };

    console.log(`Sale type: ${sale}, Date range:`, dateRange);
    return this.http.post<ISale[]>(`${this.api}/${sale}/get`, dateRange);
  }

  generateExcel(startDate: string, endDate: string, saleType: string){
    const body = {
      from: startDate,
      to: endDate,
    }

    return this.http.post<any>(`${this.api}/${saleType}/generateExcel`, body, {observe: 'response'})
  }

}
