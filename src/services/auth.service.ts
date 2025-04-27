import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {Observable} from "rxjs";
import {ConfigService} from "./config.service";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api: string = '';

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private router: Router) {
    this.api = this.config.apiUrlProduction.authService
  }

  login(username: string, password:string): Observable<any>{
    return this.http.post<any>(`${this.api}`, {username, password});
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return  !!localStorage.getItem('authToken');
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
}
