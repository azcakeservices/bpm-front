import { Injectable } from '@angular/core';
import { ToastrService, IndividualConfig } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToasterCustomService {

  private readonly defaultConfig: Partial<IndividualConfig> = {
    closeButton: true,
    progressBar: true,
    progressAnimation: 'decreasing',
    positionClass: 'toast-top-right',
    timeOut: 4000,
    extendedTimeOut: 1500,
    tapToDismiss: false,
    newestOnTop: true,
    easeTime: 250,
    enableHtml: false
  };

  constructor(private toastr: ToastrService) {}

  success(message: string): void {
    this.toastr.success(
      message,
      'Uğurlu',
      {
        ...this.defaultConfig,
        timeOut: 4000
      }
    );
  }

  error(message: string): void {
    this.toastr.error(
      message,
      'Xəta',
      {
        ...this.defaultConfig,
        timeOut: 7000
      }
    );
  }

  warning(message: string): void {
    this.toastr.warning(
      message,
      'Diqqət',
      {
        ...this.defaultConfig,
        timeOut: 5000
      }
    );
  }

  info(message: string): void {
    this.toastr.info(
      message,
      'Məlumat',
      {
        ...this.defaultConfig,
        timeOut: 3000
      }
    );
  }

  clear(): void {
    this.toastr.clear();
  }

}
