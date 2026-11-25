
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { LoaderService } from '../../services/loader.service';
import { SaleService } from '../../services/sale.service';
import { ISaleResponse } from '../../interfaces/ISaleResponse';
import { IDailySale } from '../../interfaces/IDailySale';
import { ToasterCustomService } from '../../services/toaster.service';

import * as dateUtils from '../../app/shared/utils/date-utils';

type CategoryName = 'Kulinariya' | 'Şirniyyat' | 'Təndir';

type CategoryFilter = 'ALL' | CategoryName;

interface SaleCategory {
  name: CategoryName;
  contractName: string;
  sales: IDailySale[];
  total: number;
  percentage: number;
}

@Component({
  selector: 'app-sale',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.css'
})
export class SaleComponent implements OnInit {

  readonly today = dateUtils.getTodayAsString();

  date: string = this.today;

  loadedDate: string = '';

  sales: ISaleResponse | null = null;

  errorMessage: string = '';

  isLoading: boolean = false;

  isDownloading: boolean = false;

  selectedCategory: CategoryFilter = 'ALL';

  categories: SaleCategory[] = [];

  visibleCategories: SaleCategory[] = [];

  totalAmount: number = 0;

  totalRecords: number = 0;

  private readonly categoryDefinitions: {
    name: CategoryName;
    contractName: string;
  }[] = [
    {
      name: 'Kulinariya',
      contractName: 'Azcake Kulinariya'
    },
    {
      name: 'Şirniyyat',
      contractName: 'ARENDA AZCAKE SHIRNIYYAT'
    },
    {
      name: 'Təndir',
      contractName: 'ARENDA AZCAKE TENDIR'
    }
  ];

  constructor(
    private loadService: LoaderService,
    private saleService: SaleService,
    private toastrService: ToasterCustomService
  ) {}

  // =====================================
  // INITIALIZATION
  // =====================================

  ngOnInit(): void {

    this.loadSales(this.today);

  }

  // =====================================
  // FORM SUBMIT
  // =====================================

  onSubmit(): void {

    if (this.isLoading || this.isDownloading) {
      return;
    }

    if (!this.date || this.date > this.today) {

      this.errorMessage = 'Tarixi düzgün seçin!';

      this.toastrService.error(this.errorMessage);

      return;

    }

    this.loadSales(this.date);

  }

  // =====================================
  // LOAD SALES
  // =====================================

  private loadSales(date: string): void {

    if (this.isLoading || this.isDownloading) {
      return;
    }

    this.errorMessage = '';

    this.isLoading = true;

    this.sales = null;

    this.resetReport();

    this.loadService.show();

    this.toastrService.info(
      'Satışlar yüklənir, zəhmət olmasa bir qədər gözləyin'
    );

    this.saleService
      .getSaleByDate(date)
      .pipe(
        finalize(() => {

          this.isLoading = false;

          this.loadService.hide();

        })
      )
      .subscribe({

        next: (response: ISaleResponse) => {

          this.sales = response;

          this.loadedDate = date;

          this.prepareSales(response);

          this.toastrService.success(
            date === this.today
              ? 'Bugünün satışları yükləndi'
              : 'Satışlar yükləndi'
          );

        },

        error: () => {

          this.errorMessage =
            'Satışlar yüklənən zaman xəta baş verdi. Yenidən cəhd edin.';

          this.toastrService.error(
            this.errorMessage
          );

        }

      });

  }

  // =====================================
  // PREPARE SALES
  // =====================================

  private prepareSales(
    response: ISaleResponse
  ): void {

    const allSales = (response.data ?? [])
      .flatMap(item => item.dailySales ?? []);

    this.categories = this.categoryDefinitions.map(
      category => {

        const categorySales = allSales.filter(
          sale =>
            sale.contractName === category.contractName
        );

        const total = categorySales.reduce(
          (sum, sale) => sum + (sale.total ?? 0),
          0
        );

        return {
          name: category.name,
          contractName: category.contractName,
          sales: categorySales,
          total: total,
          percentage: 0
        };

      }
    );

    this.totalAmount = this.categories.reduce(
      (sum, category) => sum + category.total,
      0
    );

    this.totalRecords = this.categories.reduce(
      (sum, category) => sum + category.sales.length,
      0
    );

    this.categories.forEach(category => {

      category.percentage =
        this.totalAmount !== 0
          ? (category.total / this.totalAmount) * 100
          : 0;

    });

    this.selectCategory(this.selectedCategory);

  }

  // =====================================
  // CATEGORY FILTER
  // =====================================

  selectCategory(category: CategoryFilter): void {

    this.selectedCategory = category;

    this.visibleCategories =
      category === 'ALL'
        ? this.categories
        : this.categories.filter(
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

    this.categories = [];

    this.visibleCategories = [];

    this.totalAmount = 0;

    this.totalRecords = 0;

    this.loadedDate = '';

  }

  // =====================================
  // EXCEL EXPORT
  // =====================================

  downloadExcel(): void {

    if (
      !this.sales ||
      this.isDownloading ||
      this.isLoading
    ) {
      return;
    }

    this.isDownloading = true;

    this.loadService.show();

    this.saleService
      .downloadExcel(this.sales)
      .pipe(
        finalize(() => {

          this.isDownloading = false;

          this.loadService.hide();

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
    category: SaleCategory
  ): string {

    return category.name;

  }

}
