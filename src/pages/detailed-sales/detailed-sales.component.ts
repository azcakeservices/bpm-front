import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import {DetailedSalesService} from "../../services/detailed-sales.service";

@Component({
  selector: 'app-detailed-sales',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './detailed-sales.component.html',
  styleUrl: './detailed-sales.component.css'
})
export class DetailedSalesComponent {
  saleDate: string = '';
  errorMessage: string = '';
  constructor(private detailedSalesService: DetailedSalesService) {}
  onSubmit(){
    console.log('Submitting...');
    this.downloadExcel()
  }
  downloadExcel(){
    console.log('Download Excel');
    this.detailedSalesService.generateExcel(this.saleDate).subscribe(response => {
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
}
