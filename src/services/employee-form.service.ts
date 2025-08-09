import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ConfigService} from "./config.service";
import {Observable} from "rxjs";
import {IEmployeeForm} from "../interfaces/employee form/IEmployeeForm";

@Injectable({
  providedIn: 'root'
})
export class EmployeeFormService {
  private readonly api: string = ''
  constructor(private http: HttpClient, private config: ConfigService) {
    this.api = this.config.apiUrlProduction.employeeFormService
  }

  getEmployeeForms(): Observable<IEmployeeForm[]> {
    return this.http.get<IEmployeeForm[]>(`${this.api}`);
  }

  getEmployeeForm(id: string): Observable<IEmployeeForm> {
    return this.http.get<IEmployeeForm>(`${this.api}/${id}`);
  }

  deleteEmployeeForm(id: string){
    return this.http.delete<any>(`${this.api}/${id}`);
  }

  createEmployeeForm(body: any): Observable<string> {
    return this.http.post(`${this.api}`, body, { responseType: 'text' });
  }

  updateEmployeeForm(id: string, body: any): Observable<IEmployeeForm> {
    return this.http.put<IEmployeeForm>(`${this.api}/${id}`, body);
  }

}
