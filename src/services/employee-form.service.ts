import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ConfigService} from "./config.service";

@Injectable({
  providedIn: 'root'
})
export class EmployeeFormService {
  private readonly api: string = ''
  constructor(private http: HttpClient, private config: ConfigService) {
    this.api = this.config.apiUrlProduction.employeeFormService
  }

  getEmployeeForms() {
    const url = `${this.api}`;
    console.log('url', url)
    return this.http.get<any>(`${this.api}`);
  }
}
