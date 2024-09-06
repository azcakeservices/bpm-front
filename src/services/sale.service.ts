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

  getSales(): Observable<ISale[]>{
    return this.http.get<ISale[]>(`${this.api}/GetAll`);
  }
}
