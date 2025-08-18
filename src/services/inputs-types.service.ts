import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ConfigService} from "./config.service";
import {IInputsTypes} from "../interfaces/InputsTypes/IInputsTypes";
import {Observable} from "rxjs";
import {IEmployeeForm} from "../interfaces/employee form/IEmployeeForm";

@Injectable({
  providedIn: 'root'
})
export class InputsTypesService {
  private readonly api: string = '';

  constructor(private http: HttpClient, private config: ConfigService) {
    this.api = config.apiUrlProduction.inputsTypesService;
  }

  getAll(): Observable<IInputsTypes[]>{
    return this.http.get<IInputsTypes[]>(`${this.api}`);
  }

  getById(id: string): Observable<IEmployeeForm> {
    return this.http.get<IEmployeeForm>(`${this.api}/${id}`);
  }

  disable(id: string): Observable<string> {
    return this.http.patch<string>(`${this.api}/Disable/${id}`, {});
  }

  enable(id: string): Observable<string> {
    return this.http.patch<string>(`${this.api}/Enable/${id}`, {});
  }

  edit(id: string, body: {}) {
    // return this.http.patch<IEmployeeForm>(`${this.api}/${id}`, body);
  }

  create(body: {}){
    return this.http.post(`${this.api}`, body);
  }

  delete(id: string): Observable<string> {
    return this.http.delete<string>(`${this.api}/${id}`);
  }
}
