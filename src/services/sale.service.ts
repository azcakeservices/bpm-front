import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ISale} from "../interfaces/ISale";
import {ConfigService} from "./config.service";
import {ISaleResponse} from "../interfaces/ISaleResponse";
import {ISaleOfRentalDailyTotal} from "../interfaces/ISaleOfRentalDailyTotal";

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private readonly api: string = ''
  private readonly saleApi: string = ''
  constructor(private http: HttpClient, private config: ConfigService){
    // this.api = this.config.apiUrlProduction.saleService
    this.saleApi = this.config.apiUrlProduction.paymentReceiver
  }

  getSales(dateFrom: string, dateTo: string, saleType: string): Observable<ISale[]>{
    let sale: string = '';
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

    return this.http.post<ISale[]>(`${this.api}/${sale}/get`, dateRange);
  }

  getSaleByDate(date: string):Observable<ISaleResponse>{
    return this.http.get<ISaleResponse>(`${this.saleApi}/get-sales?date=${date}`);
  }

  getRangeSales(dateFrom: string, dateTo: string):Observable<ISaleOfRentalDailyTotal>{
    return this.http.get<ISaleOfRentalDailyTotal>(`${this.saleApi}/dateRangeSales?parameters=${dateFrom}&parameters=${dateTo}`)
  }

  // generateExcel(startDate: string, endDate: string, saleType: string){
  //   const body = {
  //     from: startDate,
  //     to: endDate,
  //   }
  //
  //   return this.http.post<any>(`${this.api}/${saleType}/generateExcel`, body, {observe: 'response'})
  // }

  downloadExcel(sale: ISaleResponse){
    return this.http.post<any>(`${this.saleApi}/GetAsExcel`, sale, {observe: 'response'})
  }

  downloadRangeExcel(sale: ISaleOfRentalDailyTotal){
    return this.http.post<any>('http://10.0.100.100:5050/gateway/api/SalesReport/GenerateRangeSales', sale, {observe: 'response'})
  }
}
