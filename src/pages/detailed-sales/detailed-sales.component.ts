import { Component, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { DatePipe, DecimalPipe, NgForOf, NgIf } from "@angular/common";
import { DetailedSalesService } from "../../services/detailed-sales.service";
import { LoaderService } from "../../services/loader.service";
import { ToasterCustomService } from "../../services/toaster.service";
import { BranchService } from "../../services/branch.service";
import { IBranchResponse } from "../../interfaces/IBranchResponse";
import { ISaleResponse } from "../../interfaces/ISaleResponse";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import * as dateUtils from '../../app/shared/utils/date-utils';
import { IDailySale } from "../../interfaces/IDailySale";

@Component({
  selector: 'app-detailed-sales',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    DecimalPipe,
    NgMultiSelectDropDownModule,
    DatePipe
  ],
  templateUrl: './detailed-sales.component.html',
  styleUrls: ['./detailed-sales.component.css'],
})
export class DetailedSalesComponent implements OnInit {
  date: string = '';
  emptySales: string = 'Cari gün üçün satışlar yüklənməyib!';
  allBranches = [{ branchName: '', branchCode: '' }];
  branchesResponse: IBranchResponse | null = null;
  filteredBranches: any[] = [];
  filteredProducts: any[] = [];
  filteredBarcodes: any[] = [];
  filteredContracts: any[] = [];
  currentSort: string = '';

  sales: ISaleResponse | null = null;
  filteredSales: IDailySale[] = [];
  errorMessage: string = '';
  dropdownSettings: {} = {};

  filters = {
    branchName: '',
    productName: '',
    barcode: '',
    contracts: ''
  };

  selectedBranchCode = '';

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

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
    };
  }

  ngOnInit(): void {
    this.loadBranches();
    this.detailedSalesService.getDetailedSale(dateUtils.getTodayAsString()).subscribe(response => {
      this.sales = response;
      this.filteredSales = this.sales.data[0]?.dailySales || [];
      this.filteredBranches = this.getUniqueValues('branchName');
      this.filteredProducts = this.getUniqueValues('productName');
      this.filteredBarcodes = this.getUniqueValues('barcode');
      this.filteredContracts = this.getUniqueValues('contractName');
      this.loaderService.hide();
    });
  }

  loadBranches(): void {
    this.loaderService.show();
    this.branchService.getBranches().subscribe({
      next: (data: IBranchResponse) => {
        this.branchesResponse = data;
        this.filteredBranches = this.branchesResponse.data.flatMap(branch => branch.branches);
        this.allBranches = data.data[0].branches.map(b => ({
          branchName: b.branchName,
          branchCode: b.branchCode
        }));
        this.loaderService.hide();
      },
      error: () => {
        this.toastrService.error('Mağazalar yüklənən zaman xəta baş verdi.');
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
    this.resetFilters();
    this.detailedSalesService.getDetailedSale(this.date, this.selectedBranchCode).subscribe({
      next: (response) => {
        this.sales = response;
        this.filteredSales = this.sales.data[0]?.dailySales || [];
        this.loaderService.hide();
        this.filteredBranches = this.getUniqueValues('branchName');
        this.filteredProducts = this.getUniqueValues('productName');
        this.filteredBarcodes = this.getUniqueValues('barcode');
        this.filteredContracts = this.getUniqueValues('contractName');
      },
      error: () => {
        this.toastrService.error('Xəta baş verdi, bir daha cəhd edin. Xəта təkrarlanarsa İТ ilə əlaqə saxlayın.');
        this.loaderService.hide();
      }
    });
  }

  getUniqueValues(column: string): string[] {
    if (!this.filteredSales) return [];
    return Array.from(
      new Set(
        this.filteredSales.map(sale => sale[column as keyof IDailySale] as string)
      )
    );
  }


  applyFilters(): void {
    this.filteredSales = this.sales?.data[0]?.dailySales.filter(sale => {
      const { branchName, productName, barcode, contracts } = this.filters;
      const matchesBranch = !branchName || branchName.length === 0 || branchName.includes(sale.branchName);
      const matchesProduct = !productName || productName.length === 0 || productName.includes(sale.productName);
      const matchesBarcode = !barcode || barcode.length === 0 || barcode.includes(sale.barcode);
      const matchesContracts = !contracts || contracts.length === 0 || contracts.includes(sale.contractName);
      return matchesBranch && matchesProduct && matchesBarcode && matchesContracts;
    }) || [];

    this.updateFilterOptions();
  }

  private updateFilterOptions(): void {
    this.filteredBranches = this.getUniqueValues('branchName');
    this.filteredProducts = this.getUniqueValues('productName');
    this.filteredBarcodes = this.getUniqueValues('barcode');
    this.filteredContracts = this.getUniqueValues('contractName');
  }

  downloadExcel() {
    this.loaderService.show();

    const updatedSales = {
      ...this.sales!,
      data: this.sales!.data.map(d => ({
        ...d,
        dailySales: this.filteredSales
      })) as any
    };

    this.detailedSalesService.downloadExcel(updatedSales).subscribe(response => {
      const base64 = response.body.base64;
      const fileName = response.body.fileName;
      this.downloadFile(base64, fileName);
      this.toastrService.success(`Fayl Yüklənmələr qovluğuna əlavə edildi: ${fileName}`);
      this.loaderService.hide();
    }, () => {
      this.toastrService.error('Xəta baş verdi, bir daha cəhd edin');
      this.loaderService.hide();
    });
  }


  private downloadFile(base64: string, fileName: string) {
    const linkSource = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  getTotal(dailySales: IDailySale[]): number {
    return dailySales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  }

  private resetFilters() {
    this.sales = null;
    this.filteredSales = [];
    this.filteredBranches = [];
    this.filteredProducts = [];
    this.filteredBarcodes = [];
    this.filteredContracts = [];
  }

  sortData(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredSales.sort((a, b) => {
      const valueA = a[column as keyof IDailySale];
      const valueB = b[column as keyof IDailySale];

      if (valueA == null) return 1;
      if (valueB == null) return -1;

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const result = valueA.localeCompare(valueB);
        return this.sortDirection === 'asc' ? result : -result;
      }

      const numA = parseFloat(valueA as any);
      const numB = parseFloat(valueB as any);
      const result = numA - numB;
      return this.sortDirection === 'asc' ? result : -result;
    });
  }


  getSortIndicator(column: string): string {
    if (this.sortColumn === column) {
      return this.sortDirection === 'asc' ? '▲' : '▼';
    }
    return '';
  }
}
