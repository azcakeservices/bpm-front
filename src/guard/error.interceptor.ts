import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import {inject} from "@angular/core";
import {AuthService} from "../services/auth.service";
import {ToastrService} from "ngx-toastr";
import {ConfigService} from "../services/config.service";

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const toaster = inject(ToastrService);
  const config = inject(ConfigService);

  const requestToken = req.headers.get('Authorization');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const currentToken = localStorage.getItem('authToken');

      const isLoginRequest = config.isLoginRequest(req.url);

      if (
        error.status === 401 &&
        config.isBackendRequest(req.url) &&
        !isLoginRequest &&
        currentToken &&
        requestToken === `Bearer ${currentToken}`
      ) {
        authService.logout();

        toaster.warning(
          'Sessiyanız etibarlı deyil. Yenidən daxil olun.'
        );
      }

      return throwError(() => error);
    })
  )

};
