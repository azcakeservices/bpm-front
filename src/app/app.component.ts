import { Component } from '@angular/core';
import {Router, RouterModule, RouterOutlet} from '@angular/router';
import {HeaderComponent} from "../header/header.component";
import {FooterComponent} from "../footer/footer.component";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    NgIf,
    RouterModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  constructor(private router: Router) {}

  shouldShowHeader (): boolean {
    return this.router.url !== '/login'
  }


}