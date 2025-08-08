import { Component } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { LoaderComponent } from '../loader/loader.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [HeaderComponent, LoaderComponent, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {}
