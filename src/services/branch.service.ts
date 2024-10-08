import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {IBranch} from "../interfaces/IBranch";
import {ConfigService} from "./config.service";


@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private readonly api: string = ''
  constructor(private http: HttpClient, private config: ConfigService) {
    this.api = this.config.apiUrlProduction.branchService
  }

  getBranches(): Observable<IBranch[]> {
    return this.http.get<IBranch[]>(`${this.api}/getall`);
  }

  getActiveBranches(): Observable<IBranch[]> {
    return this.http.get<IBranch[]>(`${this.api}/GetActive`);
  }

  changeBranchStatus(name: string, location: string, address: string): Observable<void>{

    return this.http.post<void>(`${this.api}/ChangeStatus`,
      {
        "name": name,
        "location": location,
        "address": address
      })
  }
}
