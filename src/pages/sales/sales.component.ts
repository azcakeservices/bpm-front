import { Component } from '@angular/core';
import {DatePipe, NgForOf, TitleCasePipe} from "@angular/common";
import {SaleService} from "../../services/sale.service";
import {ISale} from "../../interfaces/ISale";

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    NgForOf,
    DatePipe,
    TitleCasePipe
  ],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent {
  sales: ISale[] = []
  constructor(private saleService: SaleService) {}
  ngOnInit(): void {
    this.loadSales()
  }

  loadSales(): void {
    this.saleService.getSales().subscribe({
      next: (data: ISale[]) => {
        this.sales = data
      }
    })
  }
}
