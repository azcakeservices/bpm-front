import {Injectable} from '@angular/core';
import {ConfigService} from "../config.service";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RolesService{
  private readonly api: string = '';
  constructor(private config: ConfigService, private http: HttpClient) {
    this.api = this.config.apiUrlProduction.roleService
  }

  getAllRoles(): Observable<any>{
    console.log(localStorage.getItem('authToken'))
    return this.http.get<any>(`${this.api}`)
  }
}
