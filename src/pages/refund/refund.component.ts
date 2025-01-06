import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RefundService } from '../../services/refund.service';
import { IRefundResponse } from '../../interfaces/IRefundResponse';
import { DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { LoaderService } from '../../services/loader.service';
import { ToasterCustomService } from '../../services/toaster.service';

@Component({
  selector: 'app-refund',
  standalone: true,
  imports: [FormsModule, NgIf, NgForOf, DecimalPipe],
  templateUrl: './refund.component.html',
  styleUrls: ['./refund.component.css'],
})
export class RefundComponent {
  startDate: string = '';
  endDate: string = '';
  refunds: IRefundResponse | null = null;

  constructor(
    private refundService: RefundService,
    private loaderService: LoaderService,
    private toastrService: ToasterCustomService
  ) {}

  onSubmit() {
    if (!this.validateDates()) {
      return;
    }
    this.loaderService.show();
    this.toastrService.info('İadələr yüklənir');
    this.refundService.getDateRangeRefunds(this.startDate, this.endDate).subscribe(
      (response) => {
        this.refunds = response;
        this.loaderService.hide();
        this.toastrService.success('İadələr yükləndi');
        console.log(this.refunds);
      },
      (error) => {
        this.toastrService.error(`Xəta baş verdi: ${error}`);
      }
    );
  }

  private validateDates(): boolean {
    if (!this.startDate || !this.endDate) {
      this.toastrService.error('Tarix aralığını düzgün seçin');
      return false;
    }
    if (this.startDate > this.endDate) {
      this.toastrService.error('Başlanğıc tarix bitmə tarixindən böyük ola bilməz!');
      return false;
    }
    return true;
  }

  getSortedRefunds(companyCode: string) {
    return this.refunds?.data
      .filter((data) => data.companyCode === companyCode)
      .flatMap((data) => data.refundProducts)
      .sort((a, b) => new Date(a.chechDate).getTime() - new Date(b.chechDate).getTime()) || [];
  }

  getTotalRefundPrice(companyCode: string): number {
    return this.getSortedRefunds(companyCode).reduce((sum, ref) => sum + ref.refundPrice, 0);
  }

  getTotalLineTotal(companyCode: string): number {
    return this.getSortedRefunds(companyCode).reduce((sum, ref) => sum + ref.lineTotal, 0);
  }
}
