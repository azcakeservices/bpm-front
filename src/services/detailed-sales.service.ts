import {Injectable} from '@angular/core';
import {ConfigService} from "./config.service";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ISaleResponse} from "../interfaces/ISaleResponse";

@Injectable({
  providedIn: 'root'
})
export class DetailedSalesService {
  private readonly api: string = '';

  constructor(private http: HttpClient, private config: ConfigService) {
    this.api = this.config.apiUrlProduction.paymentReceiver
  }

  getDetailedSale(date: string, branchName: string = ''):Observable<ISaleResponse>{
    const fullUrl = branchName == ''
      ? `${this.api}/getDetailedSales?parameters=${date}`
      : `${this.api}/getDetailedSales?parameters=${branchName}&parameters=${date}`;
    return this.http.get<ISaleResponse>(`${fullUrl}`)
  }

  downloadExcel(sale: ISaleResponse):Observable<any>{
    return this.http.post<any>(`http://10.0.100.100:1030/api/FilesGenerator/GenerateDetailedSale`, sale, {observe: 'response'})
  }

}
