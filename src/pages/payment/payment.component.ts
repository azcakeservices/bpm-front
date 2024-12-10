import {Component} from '@angular/core';
import {IPayment} from "../../interfaces/IPayment";
import {PaymentService} from "../../services/payment.service";
import {FormsModule} from "@angular/forms";
import {CommonModule, DatePipe, NgForOf, NgIf} from "@angular/common";
import {NgMultiSelectDropDownModule} from "ng-multiselect-dropdown";
import {BranchService} from "../../services/branch.service";
import {LoaderService} from "../../services/loader.service";

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgForOf,
    DatePipe,
    NgMultiSelectDropDownModule
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent {
  payments: IPayment[] = []
  startDate: string = '';
  endDate: string = '';
  branches: string[] = [];
  selectedBranches: string[] = [];
  dropDownSettings: {} = {};
  errorMessage: string = '';
  showDownloadButton: boolean = false;
  filter = {
    branchName: '',
    productName: '',
    statementDate: '',
    barcode: ''
  }

  constructor(
    private paymentService: PaymentService,
    private branchService: BranchService,
    private loaderService: LoaderService) {
    this.loadBranches()
    this.dropDownSettings = {
      singleSelection: false,
      itemsShowLimit: 70,
      allowSearchFilter: true,
      maxHeight: 150,
      selectAllText: 'Bütün filiallar',
      unSelectAllText: 'Sıfırla',
      searchPlaceholderText: 'Filial adı üzrə axtar'
    }
  }

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

  private loadBranches(): void{
    this.branchService.getActiveBranches().subscribe(response => {
      this.branches = response.map(x => x.name);
    })
  }

  private loadPayments(){
    this.loaderService.show()
    this.paymentService.getPaymentsWithFilters(this.startDate, this.endDate, this.selectedBranches).subscribe(response => {
      this.payments = response;
      this.showDownloadButton = true
      this.loaderService.hide()
    })
  }

  filteredPayments(){
    return this.payments.filter(payment => {
      return this.matchFilter(payment.branchName, this.filter.branchName) &&
        this.matchFilter(payment.productName, this.filter.productName) &&
        this.matchDateFilter(payment.statementDate, this.filter.statementDate) &&
        this.matchFilter(payment.productBarcode, this.filter.barcode);
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
      statementDate: '',
      barcode: ''
    };
  }

  downloadExcel(){
    this.paymentService.generateExcel(this.startDate, this.endDate, this.selectedBranches).subscribe(response => {
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
