import {Component} from '@angular/core';
import {Router, RouterModule, RouterOutlet} from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        RouterModule,
    ],
  standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent{

  constructor(private router: Router) {}

  shouldShowHeader (): boolean {
    return this.router.url !== '/login'
  }


}
