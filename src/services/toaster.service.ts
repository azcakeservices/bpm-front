import { Injectable } from '@angular/core';
import {ToastrService} from "ngx-toastr";

@Injectable({
  providedIn: 'root'
})
export class ToasterCustomService {

  constructor(private toastr: ToastrService) { }

  success (message: string){
    this.toastr.success(message, 'Success', {closeButton: true})
  }

  error (message: string){
    this.toastr.error(message, 'Error', {closeButton: true})
  }

  warning (message: string){
    this.toastr.warning(message, 'Warning', {closeButton: true})
  }

  info (message: string){
    this.toastr.info(message, 'Info', {closeButton: true})
  }
}
