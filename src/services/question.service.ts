import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ConfigService} from "./config.service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private readonly api: string = '';

  constructor(private http: HttpClient, private config: ConfigService) {
    this.api = config.apiUrlProduction.questionService;
  }

  getAll(): Observable<any>{
    return  this.http.get<any>(`${this.api}`);
  }

  create(body: {}){
    return this.http.post(`${this.api}`, body);
  }

  disable(id: string): Observable<string> {
    return this.http.patch<string>(`${this.api}/Disable/${id}`, {});
  }

  enable(id: string): Observable<string> {
    return this.http.patch<string>(`${this.api}/Enable/${id}`, {});
  }

  delete(id: string): Observable<string> {
    return this.http.delete<string>(`${this.api}/${id}`);
  }
}
