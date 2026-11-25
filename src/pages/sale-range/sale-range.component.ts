
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { SaleService } from '../../services/sale.service';
import { ISaleOfRentalDailyTotal } from '../../interfaces/ISaleOfRentalDailyTotal';
import { LoaderService } from '../../services/loader.service';
import { ToasterCustomService } from '../../services/toaster.service';
import { IPreparedRangeSale } from '../../interfaces/IPreparedRangeSale';

import * as dateUtils from '../../app/shared/utils/date-utils';

type CategoryName = 'Şirniyyat' | 'Təndir' | 'Kulinariya';

type CategoryFilter = 'ALL' | CategoryName;

interface RangeSaleRow {
  date: string;
  branchTotals: Record<string, number>;
  total: number;
}

interface RangeSaleCategory {
  name: CategoryName;
  branches: string[];
  rows: RangeSaleRow[];
  branchTotals: Record<string, number>;
  total: number;
  percentage: number;
}

@Component({
  selector: 'app-sale-range',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './sale-range.component.html',
  styleUrl: './sale-range.component.css'
})
export class SaleRangeComponent implements OnInit {

  readonly today = dateUtils.getTodayAsString();

  startDate: string = this.today;
  endDate: string = this.today;

  loadedStartDate: string = '';
  loadedEndDate: string = '';

  sales: ISaleOfRentalDailyTotal | null = null;

  errorMessage: string = '';

  isLoading: boolean = false;
  isDownloading: boolean = false;

  totalByDate: Record<string, Record<string, number>> = {};

  protected preparedSale: IPreparedRangeSale[] = [];

  categoryReports: RangeSaleCategory[] = [];
  visibleCategories: RangeSaleCategory[] = [];

  selectedCategory: CategoryFilter = 'ALL';

  totalAmount: number = 0;
  totalDays: number = 0;
  totalBranches: number = 0;

  private readonly categories: {
    key: CategoryName;
    contractName: string;
  }[] = [
    {
      key: 'Şirniyyat',
      contractName: 'ARENDA AZCAKE SHIRNIYYAT'
    },
    {
      key: 'Təndir',
      contractName: 'ARENDA AZCAKE TENDIR'
    },
    {
      key: 'Kulinariya',
      contractName: 'Azcake Kulinariya'
    }
  ];

  constructor(
    private saleService: SaleService,
    private loaderService: LoaderService,
    private toastrService: ToasterCustomService
  ) {}

  // =====================================
  // INITIALIZATION
  // =====================================

  ngOnInit(): void {

    this.loadSales(this.startDate, this.endDate);

  }

  // =====================================
  // FORM SUBMIT
  // =====================================

  onSubmit(): void {

    if (this.isLoading || this.isDownloading) {
      return;
    }

    if (!this.validateDates()) {
      return;
    }

    this.loadSales(this.startDate, this.endDate);

  }

  // =====================================
  // DATE VALIDATION
  // =====================================

  private validateDates(): boolean {

    this.errorMessage = '';

    if (!this.startDate || !this.endDate) {

      this.errorMessage = 'Tarix aralığını seçin!';

    } else if (this.startDate > this.today) {

      this.errorMessage =
        'Hesabatın başlama tarixi bugündən artıq ola bilməz!';

    } else if (this.endDate > this.today) {

      this.errorMessage =
        'Hesabatın bitmə tarixi bugündən artıq ola bilməz!';

    } else if (this.startDate > this.endDate) {

      this.errorMessage =
        'Başlama tarixi bitmə tarixindən böyük ola bilməz!';

    }

    if (this.errorMessage) {

      this.toastrService.error(this.errorMessage);

      return false;

    }

    return true;

  }

  // =====================================
  // LOAD SALES
  // =====================================

  private loadSales(
    startDate: string,
    endDate: string
  ): void {

    if (this.isLoading || this.isDownloading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.resetReport();

    this.loaderService.show();

    this.toastrService.info(
      'Satışlar yüklənir, zəhmət olmasa bir qədər gözləyin'
    );

    this.saleService
      .getRangeSales(startDate, endDate)
      .pipe(
        finalize(() => {

          this.isLoading = false;

          this.loaderService.hide();

        })
      )
      .subscribe({

        next: (response: ISaleOfRentalDailyTotal) => {

          this.sales = response;

          this.loadedStartDate = startDate;
          this.loadedEndDate = endDate;

          this.prepareSales(response);

          this.totalByDate = this.getTotalByDate();

          this.prepareCategoryReports();

          this.calculateStatistics();

          this.selectCategory(this.selectedCategory);

          this.toastrService.success(
            'Satışlar yükləndi'
          );

        },

        error: () => {

          this.errorMessage =
            'Satışlar yüklənən zaman xəta baş verdi. Yenidən cəhd edin.';

          this.toastrService.error(this.errorMessage);

        }

      });

  }

  // =====================================
  // PREPARE SALES
  // =====================================

  private prepareSales(
    response: ISaleOfRentalDailyTotal
  ): void {

    this.preparedSale = [];

    const allSales = (response.data ?? [])
      .flatMap(item => item.sales ?? []);

    for (const { key, contractName } of this.categories) {

      const filtered = allSales.filter(
        sale => sale.contractName === contractName
      );

      const dateMap =
        new Map<string, Map<string, number>>();

      for (const sale of filtered) {

        const date =
          this.formatDateToYyyyMmDd(sale.saleDate);

        const branch = sale.branchName;

        const total = sale.total ?? 0;

        if (!dateMap.has(date)) {

          dateMap.set(date, new Map<string, number>());

        }

        const branchMap = dateMap.get(date)!;

        branchMap.set(
          branch,
          (branchMap.get(branch) ?? 0) + total
        );

      }

      for (const [date, branchMap] of dateMap.entries()) {

        const sales = Array.from(
          branchMap.entries()
        ).map(([branchName, total]) => ({
          branchName,
          total
        }));

        this.preparedSale.push({
          date,
          category: key,
          sales
        });

      }

    }

    this.preparedSale.sort(
      (a, b) => a.date.localeCompare(b.date)
    );

  }

  // =====================================
  // TOTAL BY DATE
  // =====================================

  getTotalByDate(): Record<string, Record<string, number>> {

    const result: Record<
      string,
      Record<string, number>
    > = {};

    for (const item of this.preparedSale) {

      result[item.category] ??= {};

      result[item.category][item.date] =
        item.sales.reduce(
          (sum, sale) => sum + (sale.total ?? 0),
          0
        );

    }

    return result;

  }

  // =====================================
  // PREPARE CATEGORY REPORTS
  // =====================================

  private prepareCategoryReports(): void {

    this.categoryReports = this.categories.map(
      category => {

        const categorySales = this.preparedSale.filter(
          item => item.category === category.key
        );

        const branches = Array.from(
          new Set(
            categorySales.flatMap(
              item => item.sales.map(
                sale => sale.branchName
              )
            )
          )
        ).sort();

        const branchTotals: Record<string, number> =
          Object.create(null);

        for (const branch of branches) {

          branchTotals[branch] = 0;

        }

        const rows: RangeSaleRow[] = categorySales.map(
          item => {

            const dailyBranchTotals: Record<string, number> =
              Object.create(null);

            for (const sale of item.sales) {

              const amount = sale.total ?? 0;

              dailyBranchTotals[sale.branchName] = amount;

              branchTotals[sale.branchName] =
                (branchTotals[sale.branchName] ?? 0) + amount;

            }

            return {

              date: item.date,

              branchTotals: dailyBranchTotals,

              total:
                this.totalByDate[category.key]?.[item.date] ?? 0

            };

          }
        );

        const total = rows.reduce(
          (sum, row) => sum + row.total,
          0
        );

        return {

          name: category.key,

          branches,

          rows,

          branchTotals,

          total,

          percentage: 0

        };

      }
    );

  }

  // =====================================
  // CALCULATE STATISTICS
  // =====================================

  private calculateStatistics(): void {

    this.totalAmount = this.categoryReports.reduce(
      (sum, category) => sum + category.total,
      0
    );

    this.totalBranches = new Set(
      this.categoryReports.flatMap(
        category => category.branches
      )
    ).size;

    const start = Date.parse(
      `${this.loadedStartDate}T00:00:00Z`
    );

    const end = Date.parse(
      `${this.loadedEndDate}T00:00:00Z`
    );

    this.totalDays =
      Math.round((end - start) / 86400000) + 1;

    this.categoryReports.forEach(category => {

      category.percentage =
        this.totalAmount !== 0
          ? (category.total / this.totalAmount) * 100
          : 0;

    });

  }

  // =====================================
  // CATEGORY FILTER
  // =====================================

  selectCategory(category: CategoryFilter): void {

    this.selectedCategory = category;

    this.visibleCategories =
      category === 'ALL'
        ? this.categoryReports
        : this.categoryReports.filter(
          item => item.name === category
        );

  }

  toggleCategory(category: CategoryName): void {

    this.selectCategory(
      this.selectedCategory === category
        ? 'ALL'
        : category
    );

  }

  // =====================================
  // RESET REPORT
  // =====================================

  private resetReport(): void {

    this.sales = null;

    this.preparedSale = [];

    this.totalByDate = {};

    this.categoryReports = [];

    this.visibleCategories = [];

    this.totalAmount = 0;

    this.totalDays = 0;

    this.totalBranches = 0;

    this.loadedStartDate = '';

    this.loadedEndDate = '';

  }

  // =====================================
  // DATE FORMAT
  // =====================================

  formatDateToYyyyMmDd(dateString: string): string {

    const date = new Date(dateString);

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;

  }

  // =====================================
  // GRAND TOTAL
  // =====================================

  getTotalForAllCategories(): number {

    return this.totalAmount;

  }

  // =====================================
  // EXCEL EXPORT
  // =====================================

  downloadExcel(): void {

    if (
      !this.sales ||
      this.isLoading ||
      this.isDownloading
    ) {
      return;
    }

    this.isDownloading = true;

    this.loaderService.show();

    this.saleService
      .downloadRangeExcel(this.sales)
      .pipe(
        finalize(() => {

          this.isDownloading = false;

          this.loaderService.hide();

        })
      )
      .subscribe({

        next: response => {

          const base64 = response.body?.base64;

          const fileName = response.body?.fileName;

          if (!base64 || !fileName) {

            this.toastrService.error(
              'Excel faylı əldə edilmədi'
            );

            return;

          }

          try {

            this.downloadFile(base64, fileName);

            this.toastrService.success(
              `Fayl endirməyə göndərildi: ${fileName}`
            );

          } catch {

            this.toastrService.error(
              'Excel faylı hazırlanarkən xəta baş verdi'
            );

          }

        },

        error: () => {

          this.toastrService.error(
            'Excel faylı yüklənən zaman xəta baş verdi!'
          );

        }

      });

  }

  // =====================================
  // DOWNLOAD FILE
  // =====================================

  private downloadFile(
    base64: string,
    fileName: string
  ): void {

    const binaryString = atob(base64);

    const bytes = new Uint8Array(
      binaryString.length
    );

    for (let i = 0; i < binaryString.length; i++) {

      bytes[i] = binaryString.charCodeAt(i);

    }

    const blob = new Blob(
      [bytes],
      {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    );

    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');

    downloadLink.href = url;

    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);

    downloadLink.click();

    downloadLink.remove();

    setTimeout(() => {

      URL.revokeObjectURL(url);

    }, 1000);

  }

  // =====================================
  // TRACK BY
  // =====================================

  trackByCategory(
    index: number,
    category: RangeSaleCategory
  ): string {

    return category.name;

  }

  trackByDate(
    index: number,
    row: RangeSaleRow
  ): string {

    return row.date;

  }

  trackByBranch(
    index: number,
    branch: string
  ): string {

    return branch;

  }

  getBranchAmount(
    totals: Record<string, number>,
    branch: string
  ): number {
    return totals[branch] ?? 0;
  }

}
