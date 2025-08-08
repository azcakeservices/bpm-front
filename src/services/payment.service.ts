import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ConfigService} from "./config.service";
import {IPayment} from "../interfaces/IPayment";


@Injectable({
  providedIn: 'root'
})

export class PaymentService {
  private readonly api: string = ''

  constructor(private http: HttpClient, private config: ConfigService) {
    this.api = config.apiUrlProduction.paymentService
  }

  generateExcel(startDate: string, endDate: string, branchList: string[]){
    const body =
    {
      from: startDate,
      to: endDate,
      branchList: branchList}

    return this.http.post<any>(`${this.api}/generateexcel`, body, {observe: 'response'})
  }

  getPaymentsWithFilters(startDate: string, endDate: string, branchList: string[]){
    const body = {
      from: startDate,
      to: endDate,
      branchList: branchList
    }
    return this.http.post<IPayment[]>(`${this.api}/getwithfilters`, body)
  }
}
