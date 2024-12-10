import { Component } from '@angular/core';
import {AsyncPipe, NgIf} from "@angular/common";
import {LoaderService} from "../../services/loader.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe
  ],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css'
})
export class LoaderComponent {
  isLoading$: Observable<boolean>;
  constructor(private loaderService: LoaderService) {
    this.isLoading$ = this.loaderService.isLoading$;
  }
}
