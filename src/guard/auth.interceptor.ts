import { HttpInterceptorFn } from "@angular/common/http";

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = localStorage.getItem('authToken');
  if (authToken){
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`),
    });
    return next(cloned);
  }
  return next(req)
}
