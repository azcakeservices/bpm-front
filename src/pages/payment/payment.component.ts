import {Component} from '@angular/core';
import {IPayment} from "../../interfaces/IPayment";
import {PaymentService} from "../../services/payment.service";
import {FormsModule} from "@angular/forms";
import {CommonModule, DatePipe, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgForOf,
    DatePipe,
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent {
  payments: IPayment[] = []
  startDate: string = '';
  endDate: string = '';
  errorMessage: string = '';
  showDownloadButton: boolean = false;
  filter = {
    branchName: '',
    productName: '',
    statementDate: ''
  }

  constructor(private paymentService: PaymentService) {}

  onSubmit() {
    if (this.startDate > this.endDate){
      this.errorMessage = 'Başlanğıc tarix bitmə tarixindən böyük ola bilməz!'
      return;
    }
    else if (this.startDate > this.getTodayAsString()){
      this.errorMessage = 'Başlanğıc tarix bugündən böyük ola bilməz';
      return;
    }
    else if(!this.startDate || !this.endDate){
      this.errorMessage = 'Tarix aralığını düzgün seçin';
      return;
    }
    else{
      this.errorMessage = '';
      this.loadPayments();
    }
  }

  private loadPayments(){
    this.paymentService.getPaymentsByDate(this.startDate, this.endDate).subscribe(response => {
      console.log(response)
      this.payments = response;
      this.showDownloadButton = true;
    })
  }

  filteredPayments(){
    return this.payments.filter(payment => {
      return this.matchFilter(payment.branchName, this.filter.branchName) &&
        this.matchFilter(payment.productName, this.filter.productName) &&
        this.matchDateFilter(payment.statementDate, this.filter.statementDate);
    })
  }

  matchFilter(item: string, filterValue: string) {
    if (!filterValue) return true;
    return item.toString().toLowerCase().includes(filterValue.toLowerCase());
  }

  matchDateFilter(itemDate: string, filterDate: string) {
    if (!filterDate) return true;
    const formattedDate = new Date(itemDate).toISOString().split('T')[0];
    return formattedDate.includes(filterDate);
  }

  clearFilters() {
    this.filter = {
      branchName: '',
      productName: '',
      statementDate: ''
    };
  }

  downloadExcel(){
    this.paymentService.generateExcel(this.startDate, this.endDate).subscribe(response => {
      const base64Data = response.body.base64;
      const fileName = response.body.fileName;
      this.downloadFile(base64Data, fileName)
    })
  }

  private downloadFile(base64Data: string, fileName: string){
    const linkSource = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click()
  }

  private getTodayAsString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}
