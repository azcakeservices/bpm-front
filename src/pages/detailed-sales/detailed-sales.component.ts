import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  IDropdownSettings,
  NgMultiSelectDropDownModule
} from 'ng-multiselect-dropdown';

import { DetailedSalesService } from '../../services/detailed-sales.service';
import { LoaderService } from '../../services/loader.service';
import { ToasterCustomService } from '../../services/toaster.service';
import { BranchService } from '../../services/branch.service';

import { IBranchResponse } from '../../interfaces/IBranchResponse';
import { ISaleResponse } from '../../interfaces/ISaleResponse';
import { IDailySale } from '../../interfaces/IDailySale';

import * as dateUtils from '../../app/shared/utils/date-utils';


type SortColumn =
  | 'branchName'
  | 'saleDate'
  | 'productName'
  | 'barcode'
  | 'price'
  | 'quantity'
  | 'total';

type FilterColumn =
  | 'branchName'
  | 'productName'
  | 'barcode'
  | 'contractName';


@Component({
  selector: 'app-detailed-sales',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgMultiSelectDropDownModule
  ],
  templateUrl: './detailed-sales.component.html',
  styleUrls: ['./detailed-sales.component.css']
})
export class DetailedSalesComponent implements OnInit {

  // ==========================================
  // DATE & STATE
  // ==========================================

  readonly today = dateUtils.getTodayAsString();

  date = this.today;
  loadedDate = '';

  isLoading = false;
  isExporting = false;
  isBranchesLoading = false;

  errorMessage = '';


  // ==========================================
  // SALES
  // ==========================================

  sales: ISaleResponse | null = null;

  allSales: IDailySale[] = [];
  filteredSales: IDailySale[] = [];


  // ==========================================
  // BRANCHES
  // ==========================================

  branchesResponse: IBranchResponse | null = null;

  allBranches: {
    branchName: string;
    branchCode: string;
  }[] = [];

  selectedBranchCode = '';
  loadedBranchCode = '';


  // ==========================================
  // FILTER OPTIONS
  // ==========================================

  filteredBranches: string[] = [];
  filteredProducts: string[] = [];
  filteredBarcodes: string[] = [];
  filteredContracts: string[] = [];

  filters = this.createEmptyFilters();


  // ==========================================
  // STATISTICS
  // ==========================================

  totalAmount = 0;
  totalQuantity = 0;
  totalRecords = 0;

  uniqueProductCount = 0;
  uniqueBranchCount = 0;


  // ==========================================
  // SORTING
  // ==========================================

  sortColumn: SortColumn | '' = '';

  sortDirection: 'asc' | 'desc' = 'asc';

  readonly columns: {
    key: SortColumn;
    label: string;
    numeric: boolean;
  }[] = [
    {
      key: 'branchName',
      label: 'Mağaza',
      numeric: false
    },
    {
      key: 'saleDate',
      label: 'Tarix',
      numeric: false
    },
    {
      key: 'productName',
      label: 'Məhsul adı',
      numeric: false
    },
    {
      key: 'barcode',
      label: 'Barkod',
      numeric: false
    },
    {
      key: 'price',
      label: 'Bir məhsulun qiyməti',
      numeric: true
    },
    {
      key: 'quantity',
      label: 'Toplam satış sayı',
      numeric: true
    },
    {
      key: 'total',
      label: 'Toplam məbləğ',
      numeric: true
    }
  ];


  // ==========================================
  // DROPDOWN SETTINGS
  // ==========================================

  readonly dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    itemsShowLimit: 1,
    allowSearchFilter: true,
    enableCheckAll: true,
    maxHeight: 220,
    selectAllText: 'Hamısını seç',
    unSelectAllText: 'Sıfırla',
    searchPlaceholderText: 'Axtar...',
    noDataAvailablePlaceholderText: 'Məlumat yoxdur'
  };


  constructor(
    private detailedSalesService: DetailedSalesService,
    private loaderService: LoaderService,
    private toastrService: ToasterCustomService,
    private branchService: BranchService
  ) {}


  // ==========================================
  // INITIALIZATION
  // ==========================================

  ngOnInit(): void {

    this.loadBranches();
    this.loadSales(this.today, '');

  }


  // ==========================================
  // LOAD BRANCHES
  // ==========================================

  loadBranches(): void {

    if (this.isBranchesLoading) {
      return;
    }

    this.isBranchesLoading = true;

    this.branchService
      .getBranches()
      .pipe(
        finalize(() => {
          this.isBranchesLoading = false;
        })
      )
      .subscribe({

        next: (response: IBranchResponse) => {

          this.branchesResponse = response;

          const branches = (response.data ?? [])
            .flatMap(group => group.branches ?? []);

          const uniqueBranches = new Map<
            string,
            {
              branchName: string;
              branchCode: string;
            }
          >();

          for (const branch of branches) {

            uniqueBranches.set(
              branch.branchCode,
              {
                branchName: branch.branchName,
                branchCode: branch.branchCode
              }
            );

          }

          this.allBranches = Array
            .from(uniqueBranches.values())
            .sort((a, b) =>
              a.branchName.localeCompare(
                b.branchName,
                'az'
              )
            );

        },

        error: () => {

          this.toastrService.error(
            'Filiallar yüklənən zaman xəta baş verdi.'
          );

        }

      });

  }


  // ==========================================
  // FORM SUBMIT
  // ==========================================

  onSubmit(): void {

    if (this.isLoading || this.isExporting) {
      return;
    }

    this.errorMessage = '';

    if (!this.date) {

      this.showError('Tarixi seçin!');
      return;

    }

    if (this.date > dateUtils.getTodayAsString()) {

      this.showError(
        'Satış tarixi bugünkü tarixdən böyük ola bilməz!'
      );

      return;

    }

    this.loadSales(
      this.date,
      this.selectedBranchCode
    );

  }


  // ==========================================
  // LOAD SALES
  // ==========================================

  private loadSales(
    date: string,
    branchCode: string
  ): void {

    if (this.isLoading || this.isExporting) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.resetReport();

    this.loaderService.show();

    this.toastrService.info(
      'Satışlar yüklənir, zəhmət olmasa gözləyin.'
    );

    this.detailedSalesService
      .getDetailedSale(date, branchCode)
      .pipe(
        finalize(() => {

          this.isLoading = false;
          this.loaderService.hide();

        })
      )
      .subscribe({

        next: (response: ISaleResponse) => {

          this.sales = response;

          this.loadedDate = date;
          this.loadedBranchCode = branchCode;

          this.allSales = (response.data ?? [])
            .flatMap(group => group.dailySales ?? []);

          this.filteredSales = [...this.allSales];

          this.prepareFilterOptions();
          this.calculateStatistics();

          if (this.allSales.length > 0) {

            this.toastrService.success(
              'Satışlar uğurla yükləndi.'
            );

          } else {

            this.toastrService.warning(
              'Seçilmiş tarix üzrə satış tapılmadı.'
            );

          }

        },

        error: () => {

          this.showError(
            'Satışlar yüklənən zaman xəta baş verdi. ' +
            'Zəhmət olmasa, yenidən cəhd edin.'
          );

        }

      });

  }


  // ==========================================
  // FILTER OPTIONS
  // ==========================================

  private createEmptyFilters() {

    return {
      branchName: [] as string[],
      productName: [] as string[],
      barcode: [] as string[],
      contracts: [] as string[]
    };

  }


  private prepareFilterOptions(): void {

    this.filteredBranches =
      this.getUniqueValues('branchName');

    this.filteredProducts =
      this.getUniqueValues('productName');

    this.filteredBarcodes =
      this.getUniqueValues('barcode');

    this.filteredContracts =
      this.getUniqueValues('contractName');

  }


  private getUniqueValues(
    column: FilterColumn
  ): string[] {

    const values = this.allSales
      .map(sale => String(sale[column] ?? ''))
      .filter(value => value.trim().length > 0);

    return Array
      .from(new Set(values))
      .sort((a, b) => a.localeCompare(b, 'az'));

  }


  // ==========================================
  // APPLY FILTERS
  // ==========================================

  applyFilters(): void {

    const branches = new Set(
      this.filters.branchName
    );

    const products = new Set(
      this.filters.productName
    );

    const barcodes = new Set(
      this.filters.barcode
    );

    const contracts = new Set(
      this.filters.contracts
    );

    this.filteredSales = this.allSales.filter(sale => {

      const matchesBranch =
        branches.size === 0 ||
        branches.has(sale.branchName);

      const matchesProduct =
        products.size === 0 ||
        products.has(sale.productName);

      const matchesBarcode =
        barcodes.size === 0 ||
        barcodes.has(sale.barcode);

      const matchesContract =
        contracts.size === 0 ||
        contracts.has(sale.contractName);

      return (
        matchesBranch &&
        matchesProduct &&
        matchesBarcode &&
        matchesContract
      );

    });

    this.applySorting();
    this.calculateStatistics();

  }


  clearFilters(): void {

    this.filters = this.createEmptyFilters();

    this.applyFilters();

  }


  get activeFilterCount(): number {

    return [
      this.filters.branchName,
      this.filters.productName,
      this.filters.barcode,
      this.filters.contracts
    ].filter(values => values.length > 0).length;

  }


  get hasActiveFilters(): boolean {

    return this.activeFilterCount > 0;

  }


  // ==========================================
  // STATISTICS
  // ==========================================

  private calculateStatistics(): void {

    this.totalRecords = this.filteredSales.length;

    this.totalAmount = this.filteredSales.reduce(
      (sum, sale) => sum + (sale.total ?? 0),
      0
    );

    this.totalQuantity = this.filteredSales.reduce(
      (sum, sale) => sum + (sale.quantity ?? 0),
      0
    );

    this.uniqueProductCount = new Set(
      this.filteredSales
        .map(sale =>
          sale.productCode ||
          sale.barcode ||
          sale.productName
        )
        .filter(Boolean)
    ).size;

    this.uniqueBranchCount = new Set(
      this.filteredSales
        .map(sale =>
          sale.branchCode || sale.branchName
        )
        .filter(Boolean)
    ).size;

  }


  getTotal(dailySales: IDailySale[]): number {

    return dailySales.reduce(
      (sum, sale) => sum + (sale.total ?? 0),
      0
    );

  }


  // ==========================================
  // SORTING
  // ==========================================

  sortData(column: SortColumn): void {

    if (this.sortColumn === column) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortColumn = column;
      this.sortDirection = 'asc';

    }

    this.applySorting();

  }


  private applySorting(): void {

    const column = this.sortColumn;

    if (!column) {
      return;
    }

    const direction =
      this.sortDirection === 'asc' ? 1 : -1;

    this.filteredSales = [...this.filteredSales]
      .sort((a, b) => {

        const valueA = a[column];
        const valueB = b[column];

        if (valueA == null && valueB == null) {
          return 0;
        }

        if (valueA == null) {
          return 1;
        }

        if (valueB == null) {
          return -1;
        }

        if (column === 'saleDate') {

          return (
            new Date(a.saleDate).getTime() -
            new Date(b.saleDate).getTime()
          ) * direction;

        }

        if (
          typeof valueA === 'number' &&
          typeof valueB === 'number'
        ) {

          return (valueA - valueB) * direction;

        }

        return String(valueA)
            .localeCompare(String(valueB), 'az')
          * direction;

      });

  }


  getSortIndicator(column: SortColumn): string {

    if (this.sortColumn !== column) {
      return '↕';
    }

    return this.sortDirection === 'asc'
      ? '▲'
      : '▼';

  }


  getAriaSort(
    column: SortColumn
  ): 'none' | 'ascending' | 'descending' {

    if (this.sortColumn !== column) {
      return 'none';
    }

    return this.sortDirection === 'asc'
      ? 'ascending'
      : 'descending';

  }


  // ==========================================
  // EXCEL EXPORT
  // ==========================================

  downloadExcel(): void {

    if (
      !this.sales ||
      this.filteredSales.length === 0 ||
      this.isLoading ||
      this.isExporting
    ) {
      return;
    }

    this.isExporting = true;

    this.loaderService.show();

    this.toastrService.info(
      'Excel faylı hazırlanır...'
    );

    const selectedSales = new Set(
      this.filteredSales
    );

    // Сохраняем оригинальный ISaleResponse.
    // Интерфейс backend не изменяем.

    const updatedSales = {

      ...this.sales,

      data: this.sales.data.map(group => ({

        ...group,

        dailySales: (group.dailySales ?? [])
          .filter(sale => selectedSales.has(sale))

      }))

    } as ISaleResponse;

    this.detailedSalesService
      .downloadExcel(updatedSales)
      .pipe(
        finalize(() => {

          this.isExporting = false;
          this.loaderService.hide();

        })
      )
      .subscribe({

        next: response => {

          const base64 = response.body?.base64;
          const fileName = response.body?.fileName;

          if (!base64 || !fileName) {

            this.toastrService.error(
              'Excel faylı əldə edilmədi.'
            );

            return;

          }

          try {

            this.downloadFile(base64, fileName);

            this.toastrService.success(
              `Fayl yüklənməsi başladıldı: ${fileName}`
            );

          } catch {

            this.toastrService.error(
              'Excel faylı yüklənərkən xəta baş verdi.'
            );

          }

        },

        error: () => {

          this.toastrService.error(
            'Excel faylı hazırlanarkən xəta baş verdi.'
          );

        }

      });

  }


  private downloadFile(
    base64: string,
    fileName: string
  ): void {

    const binary = atob(base64);

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {

      bytes[i] = binary.charCodeAt(i);

    }

    const blob = new Blob(
      [bytes],
      {
        type:
          'application/vnd.openxmlformats-officedocument.' +
          'spreadsheetml.sheet'
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

  }


  // ==========================================
  // RESET REPORT
  // ==========================================

  private resetReport(): void {

    this.sales = null;

    this.loadedDate = '';
    this.loadedBranchCode = '';

    this.allSales = [];
    this.filteredSales = [];

    this.filteredBranches = [];
    this.filteredProducts = [];
    this.filteredBarcodes = [];
    this.filteredContracts = [];

    this.filters = this.createEmptyFilters();

    this.sortColumn = '';
    this.sortDirection = 'asc';

    this.calculateStatistics();

  }


  // ==========================================
  // HELPERS
  // ==========================================

  get loadedBranchName(): string {

    if (!this.loadedBranchCode) {
      return 'Bütün filiallar';
    }

    return this.allBranches.find(
      branch =>
        branch.branchCode === this.loadedBranchCode
    )?.branchName ?? this.loadedBranchCode;

  }


  private showError(message: string): void {

    this.errorMessage = message;

    this.toastrService.error(message);

  }


  trackBySale(
    index: number,
    sale: IDailySale
  ): IDailySale {

    return sale;

  }

}
