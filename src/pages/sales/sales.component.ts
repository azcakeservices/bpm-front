import { Component } from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {NgMultiSelectDropDownModule} from "ng-multiselect-dropdown";
import {SaleService} from "../../services/sale.service";
import {ISale} from "../../interfaces/ISale";

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    NgForOf,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    NgMultiSelectDropDownModule,
    NgIf
  ],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent {
  dataTypes: string[] = ['Təndir', 'Şirniyyat', 'Kulinariya'];
  selectedType: string[] = [];
  startDate: string = '';
  endDate: string = '';
  dropDownSettings: {} = {};
  sales: ISale[] = [];
  showDownloadButton: boolean = false;
  uniqueDates: string[] = [];
  branches: string[] = [];
  groupedData: { [key: string]: any } = {};
  errorMessage: string = '';

  constructor(private saleService: SaleService) {
    this.dropDownSettings = {
      singleSelection: true,
      itemsShowLimit: 70,
      allowSearchFilter: true,
      maxHeight: 150,
      unSelectAllText: 'Sıfırla',
      searchPlaceholderText: 'Satış növü üzrə axtar'
    }
  }
  onSubmit(){
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
    else {
      this.errorMessage = '';
      this.loadPayments();
    }
  }

  loadPayments(){
    this.saleService.getSales(this.startDate, this.endDate, this.selectedType[0]).subscribe(response => {
      this.sales = response;
      this.showDownloadButton = true;
      this.branches = [...response.map(sale => sale.branchName)]
      this.groupSalesByDate();
    })
  }

  groupSalesByDate(): void {
    this.sales.forEach(sale => {
      const saleDate = new Date(sale.saleDate).toISOString().split('T')[0]; // Преобразуем дату в стандартный формат YYYY-MM-DD
      if (!this.groupedData[saleDate]) {
        this.groupedData[saleDate] = {};
      }
      this.groupedData[saleDate][sale.branchName] = sale.amount;
    });

    // Получаем уникальные даты
    this.uniqueDates = Object.keys(this.groupedData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }

  getAmountForBranchAndDate(branch: string, date: string): string | null {
    const sale = this.sales.find(s => s.branchName === branch && s.saleDate === date);
    return sale ? sale.amount : null;
  }

  downloadExcel(){
    this.saleService.generateExcel(this.startDate, this.endDate, 'DailyBread').subscribe(response => {
      const base64 = response.body.base64;
      const fileName = response.body.fileName;
      this.downloadFile(base64, fileName);
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
