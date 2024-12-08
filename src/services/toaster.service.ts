import { Injectable } from '@angular/core';
import {ToastrService} from "ngx-toastr";

@Injectable({
  providedIn: 'root'
})
export class ToasterCustomService {

  constructor(private toastr: ToastrService) { }

  success (message: string){
    this.toastr.success(message, 'Uğurlu', {closeButton: true})
  }

  error (message: string){
    this.toastr.error(message, 'Xəta', {closeButton: true})
  }

  warning (message: string){
    this.toastr.warning(message, 'Diqqət', {closeButton: true})
  }

  info (message: string){
    this.toastr.info(message, 'Mılumat', {closeButton: true})
  }
}
