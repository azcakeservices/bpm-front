import { Component } from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {CommonModule, NgIf} from "@angular/common";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = ''

  constructor(private authService: AuthService, private router: Router) {}

  login(){
    this.authService.login(this.username, this.password).subscribe(
      response => {
        if (response.message === 'Success'){
          // localStorage.setItem('authToken', response.token);
          localStorage.setItem('user', JSON.stringify(response.user))
        this.router.navigate(['/branches'])
      }
    },
      error => {
        this.errorMessage = 'Invalid username or password';
      })
  }
}
