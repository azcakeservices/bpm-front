import { Component } from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    RouterLinkActive
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  currentDate: string = ''
  userName: string = ''
  constructor(private router: Router) {}
  signOut(){
    localStorage.removeItem('authToken');
    this.router.navigate(['/login'])

  }

  ngOnInit(){
    this.userName = localStorage.getItem('user') ?? ''
    this.updateDateTime()
    setInterval(() => {
      this.updateDateTime()
    }, 1000)
  }

  updateDateTime(){
    const now = new Date()
    this.currentDate = now.toLocaleString()
  }
}
