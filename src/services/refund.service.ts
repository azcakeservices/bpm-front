import { Injectable } from '@angular/core';
import {ConfigService} from "./config.service";
import {HttpClient} from "@angular/common/http";
import {IRefundResponse} from "../interfaces/IRefundResponse";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RefundService {
  private readonly api: string = '';
  constructor(private config: ConfigService, private http: HttpClient) {
    this.api = this.config.apiUrlProduction.refundService;
  }

  getDateRangeRefunds(startDate: string, endDate: string): Observable<IRefundResponse>{
    return this.http.get<IRefundResponse>(`${this.api}/dateRangeRefunds?startDate=${startDate}&endDate=${endDate}`);
  }
}
