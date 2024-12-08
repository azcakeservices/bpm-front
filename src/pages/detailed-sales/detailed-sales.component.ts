import { Component, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { DecimalPipe, NgForOf, NgIf } from "@angular/common";
import { DetailedSalesService } from "../../services/detailed-sales.service";
import { LoaderService } from "../../services/loader.service";
import { ToasterCustomService } from "../../services/toaster.service";
import { BranchService } from "../../services/branch.service";
import { IBranchResponse } from "../../interfaces/IBranchResponse";
import { ISaleResponse } from "../../interfaces/ISaleResponse";
import {NgMultiSelectDropDownModule} from "ng-multiselect-dropdown";
import * as dateUtils from '../../app/shared/utils/date-utils'

@Component({
  selector: 'app-detailed-sales',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    DecimalPipe,
    NgMultiSelectDropDownModule
  ],
  templateUrl: './detailed-sales.component.html',
  styleUrls: ['./detailed-sales.component.css'],
})
export class DetailedSalesComponent implements OnInit {
  date: string = '';
  selectedBranch: string = '';
  branchesResponse: IBranchResponse | null = null;
  branches: any[] = [];
  products: any[] = [];
  barcodes: any[] = [];
  contracts: any[] = [];

  sales: ISaleResponse | null = null;
  filteredSales: any[] = [];
  errorMessage: string = '';
  dropdownSettings: {} = {};

  filters = {
    branchName: '',
    productName: '',
    barcode: '',
    contracts: ''
  };

  constructor(
    private detailedSalesService: DetailedSalesService,
    private loaderService: LoaderService,
    private toastrService: ToasterCustomService,
    private branchService: BranchService
  ) {
    this.dropdownSettings = {
      singleSelect: false,
      itemsShowLimit: 1,
      allowSearchFilter: true,
      allowClear: true,
      maxHeight: 150,
      unSelectAllText: 'Sıfırla',
      selectAllText: 'Hamısını seç',
      searchText: 'asdasd'
    }
  }

  ngOnInit(): void {
    // this.loadBranches();
    this.detailedSalesService.getDetailedSale(dateUtils.getTodayAsString()).subscribe(response => {
      this.sales = response;
      this.filteredSales = this.sales.data[0]?.dailySales || [];
      this.branches = this.getUniqueValues('branchName');
      this.products = this.getUniqueValues('productName')
      this.barcodes = this.getUniqueValues('barcode');
      this.contracts = this.getUniqueValues('contractName');
      this.loaderService.hide();
    })
  }

  loadBranches(): void {
    this.loaderService.show();
    this.branchService.getBranches().subscribe({
      next: (data: IBranchResponse) => {
        this.branchesResponse = data;
        this.branches = this.branchesResponse.data.flatMap(branch => branch.branches);
        this.loaderService.hide();
      },
      error: () => {
        this.toastrService.error('Ошибка при загрузке магазинов.');
        this.loaderService.hide();
      }
    });
  }

  onSubmit(): void {
    if (!this.date) {
      this.toastrService.error('Дата должна быть выбрана!');
      return;
    }
    this.loaderService.show();
    this.detailedSalesService.getDetailedSale(this.date, this.selectedBranch).subscribe({
      next: (response) => {
        this.sales = response;
        this.filteredSales = this.sales.data[0]?.dailySales || [];
        this.loaderService.hide();
        this.branches = this.getUniqueValues('branchName');
        this.products = this.getUniqueValues('productName');
        this.barcodes = this.getUniqueValues('barcode');
        this.contracts = this.getUniqueValues('contractName');
      },
      error: () => {
        this.toastrService.error('Xəta baş verdi, bir daha cəhd edin. Xəta təkrarlanarsa İT ilə əlaqə saxlayın.');
        this.loaderService.hide();
      }
    });
  }

  getUniqueValues(column: string): string[] {
    if (!this.filteredSales) return [];
    return Array.from(new Set(this.filteredSales.map(sale => sale[column])));
  }

  applyFilters(): void {
    this.filteredSales = this.sales?.data[0]?.dailySales.filter(sale => {
      const { branchName, productName, barcode, contracts } = this.filters;

      if (
        (!branchName || branchName.length === 0) &&
        (!productName || productName.length === 0) &&
        (!barcode || barcode.length === 0) &&
        (!contracts || contracts.length === 0)
      ) {
        return true;
      }

      const matchesBranch = !branchName || branchName.length === 0 || branchName.includes(sale.branchName);
      const matchesProduct = !productName || productName.length === 0 || productName.includes(sale.productName);
      const matchesBarcode = !barcode || barcode.length === 0 || barcode.includes(sale.barcode);
      const matchesContracts = !contracts || contracts.length === 0 || contracts.includes(sale.contractName);

      return matchesBranch && matchesProduct && matchesBarcode && matchesContracts;
    }) || [];

    this.updateFilterOptions();
  }


  private updateFilterOptions(): void {
    this.branches = this.getUniqueValues('branchName');
    this.products = this.getUniqueValues('productName');
    this.barcodes = this.getUniqueValues('barcode');
    this.contracts = this.getUniqueValues('contractName');
  }




  downloadExcel(){
    this.loaderService.show();
    this.detailedSalesService.downloadExcel(this.sales!).subscribe(response => {
      const base64 = response.body.base64;
      const fileName = response.body.fileName;
      this.downloadFile(base64, fileName);
      this.toastrService.success(`Fayl Yüklənmələr qovluğuna əlavə edildi: ${fileName}`)
      this.loaderService.hide()
    }, () => {
      this.toastrService.error('Xəta baş verdi, bir daha cəhd edin')
      this.loaderService.hide()
    })
  }

  private downloadFile(base64: string, fileName: string){
    const linkSource = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }
}
