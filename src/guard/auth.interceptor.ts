import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';
import { throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { ConfigService } from '../services/config.service';
import { ToasterCustomService } from '../services/toaster.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {

  const config = inject(ConfigService);


  if (!config.isBackendRequest(req.url)) {
    return next(req);
  }

  if (config.isLoginRequest(req.url)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const toaster = inject(ToasterCustomService);

  const token = authService.getToken();
  const isExpired = authService.isTokenExpired();

  if (!token || isExpired) {

    authService.logout();

    if (token) {
      toaster.warning(
        'Sessiyanız etibarlı deyil. Yenidən daxil olun.'
      );
    }

    return throwError(() => new HttpErrorResponse({
      status: 401,
      statusText: 'Invalid session',
      url: req.url
    }));
  }

  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(cloned);
};
