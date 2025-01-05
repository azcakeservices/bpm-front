import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {Observable} from "rxjs";
import {ConfigService} from "./config.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api: string = '';

  constructor(private http: HttpClient, private config: ConfigService) {
    this.api = this.config.apiUrlProduction.authService
  }

  login(username: string, password:string): Observable<any>{
    return this.http.post<any>(`${this.api}`, {username, password});
  }

}
