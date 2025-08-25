import { Component } from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {CommonModule, NgIf} from "@angular/common";
import {LoaderService} from "../../services/loader.service";

@Component({
    selector: 'app-login',
    imports: [
        CommonModule,
        FormsModule,
        NgIf
    ],
    standalone: true,
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})

export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router, private loader: LoaderService) {}

  login(){
    this.loader.show();
    this.authService.login(this.username, this.password).subscribe(
      response => {
        console.log(response)
        if (response.status === 'Success'){
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('user', JSON.stringify(response.user))
          localStorage.setItem('roles', JSON.stringify(response.roles))
          this.loader.hide();
        this.router.navigate(['/branches'])
      }
    },
      error => {
        this.errorMessage = 'Invalid username or password';
      })
  }

  togglePassword(){
    this.showPassword = !this.showPassword;
  }
}
