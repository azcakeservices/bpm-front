
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { RefundService } from '../../services/refund.service';
import { IRefundResponse } from '../../interfaces/IRefundResponse';
import { LoaderService } from '../../services/loader.service';
import { ToasterCustomService } from '../../services/toaster.service';

type RefundProduct =
  IRefundResponse['data'][number]['refundProducts'][number];

type CompanyCode = 'GM' | 'PROM';

type CompanyFilter = 'ALL' | CompanyCode;

interface RefundCompany {
  code: CompanyCode;
  name: string;
  products: RefundProduct[];
  totalRefundPrice: number;
  totalLineTotal: number;
}

@Component({
  selector: 'app-refund',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './refund.component.html',
  styleUrls: ['./refund.component.css']
})
export class RefundComponent {

  startDate: string = '';
  endDate: string = '';

  refunds: IRefundResponse | null = null;

  isLoading: boolean = false;

  errorMessage: string = '';

  selectedCompany: CompanyFilter = 'ALL';

  readonly today: string = this.formatLocalDate(new Date());

  loadedStartDate: string = '';
  loadedEndDate: string = '';

  companies: RefundCompany[] = [];

  visibleCompanies: RefundCompany[] = [];

  totalRecords: number = 0;

  totalRefundPrice: number = 0;

  totalLineTotal: number = 0;

  constructor(
    private refundService: RefundService,
    private loaderService: LoaderService,
    private toastrService: ToasterCustomService
  ) {}

  // =====================================
  // LOAD REFUNDS
  // =====================================

  onSubmit(): void {

    if (this.isLoading) {
      return;
    }

    if (!this.validateDates()) {
      return;
    }

    this.errorMessage = '';

    this.isLoading = true;

    this.refunds = null;

    this.resetReport();

    const startDate = this.startDate;
    const endDate = this.endDate;

    this.loaderService.show();

    this.toastrService.info('İadələr yüklənir');

    this.refundService
      .getDateRangeRefunds(startDate, endDate)
      .pipe(
        finalize(() => {

          this.isLoading = false;

          this.loaderService.hide();

        })
      )
      .subscribe({

        next: (response: IRefundResponse) => {

          this.refunds = response;

          this.loadedStartDate = startDate;

          this.loadedEndDate = endDate;

          this.prepareRefunds(response);

          this.toastrService.success(
            'İadələr yükləndi'
          );

        },

        error: () => {

          this.errorMessage =
            'İadələr yüklənən zaman xəta baş verdi. Yenidən cəhd edin.';

          this.toastrService.error(
            this.errorMessage
          );

        }

      });

  }

  // =====================================
  // PREPARE REPORT DATA
  // =====================================

  private prepareRefunds(
    response: IRefundResponse
  ): void {

    const companyDefinitions: {
      code: CompanyCode;
      name: string;
    }[] = [
      {
        code: 'GM',
        name: 'GrandMart'
      },
      {
        code: 'PROM',
        name: 'PROM'
      }
    ];

    this.companies = companyDefinitions.map(company => {

      const products = (response.data ?? [])
        .filter(item =>
          item.companyCode === company.code
        )
        .flatMap(item =>
          item.refundProducts ?? []
        )
        .sort((a, b) =>
          new Date(a.chechDate).getTime() -
          new Date(b.chechDate).getTime()
        );

      const totalRefundPrice = products.reduce(
        (sum, product) =>
          sum + (product.refundPrice ?? 0),
        0
      );

      const totalLineTotal = products.reduce(
        (sum, product) =>
          sum + (product.lineTotal ?? 0),
        0
      );

      return {
        code: company.code,
        name: company.name,
        products,
        totalRefundPrice,
        totalLineTotal
      };

    });

    this.selectCompany(this.selectedCompany);

  }

  // =====================================
  // COMPANY FILTER
  // =====================================

  selectCompany(company: CompanyFilter): void {

    this.selectedCompany = company;

    this.visibleCompanies =
      company === 'ALL'
        ? this.companies
        : this.companies.filter(
          item => item.code === company
        );

    this.calculateTotals();

  }

  // =====================================
  // SUMMARY CALCULATION
  // =====================================

  private calculateTotals(): void {

    this.totalRecords = this.visibleCompanies.reduce(
      (sum, company) =>
        sum + company.products.length,
      0
    );

    this.totalRefundPrice = this.visibleCompanies.reduce(
      (sum, company) =>
        sum + company.totalRefundPrice,
      0
    );

    this.totalLineTotal = this.visibleCompanies.reduce(
      (sum, company) =>
        sum + company.totalLineTotal,
      0
    );

  }

  // =====================================
  // RESET REPORT
  // =====================================

  private resetReport(): void {

    this.companies = [];

    this.visibleCompanies = [];

    this.totalRecords = 0;

    this.totalRefundPrice = 0;

    this.totalLineTotal = 0;

    this.loadedStartDate = '';

    this.loadedEndDate = '';

  }

  // =====================================
  // DATE VALIDATION
  // =====================================

  private validateDates(): boolean {

    if (!this.startDate || !this.endDate) {

      this.toastrService.error(
        'Tarix aralığını düzgün seçin'
      );

      return false;

    }

    if (this.startDate > this.endDate) {

      this.toastrService.error(
        'Başlanğıc tarix bitmə tarixindən böyük ola bilməz!'
      );

      return false;

    }

    if (
      this.startDate > this.today ||
      this.endDate > this.today
    ) {

      this.toastrService.error(
        'Gələcək tarix seçilə bilməz!'
      );

      return false;

    }

    return true;

  }

  // =====================================
  // LOCAL DATE FORMAT
  // =====================================

  private formatLocalDate(date: Date): string {

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
  // TRACK BY
  // =====================================

  trackByCompany(
    index: number,
    company: RefundCompany
  ): string {

    return company.code;

  }

}
