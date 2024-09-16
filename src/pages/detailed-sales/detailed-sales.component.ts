import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";

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
  showDownloadButton: boolean = false;
  errorMessage: string = '';
  onSubmit(){
    console.log('Submitting...');
  }
  downloadExcel(){
    console.log('Download Excel');
  }
}
