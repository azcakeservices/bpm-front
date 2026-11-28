import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {Observable} from "rxjs";
import {ConfigService} from "./config.service";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private router: Router
  ) {}

  login(username: string, password: string): Observable<any> {

    const api = this.config.apiUrlProduction.authService;

    return this.http.post<any>(
      api,
      { username, password }
    );
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getUserRoles(): string[] {
    const rolesJson = localStorage.getItem('roles');
    if (!rolesJson) return [];
    try {
      const roles = JSON.parse(rolesJson);
      return roles.map((r: any) => r.roleName);
    }
    catch {
      return [];
    }
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  hasAnyRole(allowedRoles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return allowedRoles.some(r => userRoles.includes(r));
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  private decodeToken(token: string) {
    try {
      const parts = token.split('.');

      if (parts.length !== 3) {
        return null;
      }

      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');

      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');

      const bytes = Uint8Array.from(atob(padded), char => char.charCodeAt(0));

      const payload = new TextDecoder().decode(bytes);

      return JSON.parse(payload);
    }
    catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const token = this.getToken();

    if (!token) {
      return true;
    }

    const payload = this.decodeToken(token);

    if (
      !payload ||
      typeof payload.exp !== 'number' ||
      !Number.isFinite(payload.exp)
    ) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);

    return currentTime >= payload.exp;
  }
}
