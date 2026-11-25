import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  username: string = '';
  password: string = '';
  errorMessage: string = '';

  isLoading: boolean = false;
  showPassword: boolean = false;

  readonly currentYear = new Date().getFullYear();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {

    if (this.isLoading) {
      return;
    }

    if (!this.username.trim() || !this.password) {
      this.errorMessage =
        'İstifadəçi adı və şifrəni daxil edin!';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.authService
      .login(this.username.trim(), this.password)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({

        next: response => {

          if (response.status === 'Success') {

            localStorage.setItem(
              'authToken',
              response.token
            );

            localStorage.setItem(
              'user',
              JSON.stringify(response.user)
            );

            localStorage.setItem(
              'roles',
              JSON.stringify(response.roles)
            );

            this.router.navigate(['/branches']);

          } else {

            this.errorMessage =
              'İstifadəçi adı və ya şifrə düzgün deyil!';

          }
        },

        error: error => {

          if (error.status === 401 || error.status === 403) {

            this.errorMessage =
              'İstifadəçi adı və ya şifrə düzgün deyil!';

          } else if (error.status === 0) {

            this.errorMessage =
              'Server ilə əlaqə qurmaq mümkün olmadı.';

          } else {

            this.errorMessage =
              'Xəta baş verdi. Yenidən cəhd edin!';

          }
        }

      });
  }
}
