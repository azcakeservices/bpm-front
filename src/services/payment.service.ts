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

  getPaymentsByDate(startDate: string, endDate: string){
    return this.http.get<IPayment[]>(`${this.api}/getbydate?from=${startDate}&to=${endDate}`)
  }

  generateExcel(startDate: string, endDate: string){
    return this.http.get<any>(`${this.api}/generateexcel?from=${startDate}&to=${endDate}`, {observe: 'response'})
  }
}
