import {Injectable} from '@angular/core';
import {ConfigService} from "./config.service";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class DetailedSalesService {
  private readonly api: string = '';

  constructor(private http: HttpClient, private config: ConfigService) {
    this.api = this.config.apiUrlProduction.saleService
  }

  generateExcel(date: string){
    const body = {
      date
    }

    return this.http.post<any>(`${this.api}/DailySale/get`, body, {observe: 'response'})
  }

}
