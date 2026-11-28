import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private config: any = {};

  constructor(private http: HttpClient) {}

  async loadConfig() {
    this.config = await firstValueFrom(
      this.http.get('/assets/config.json')
    );
  }

  get apiUrl() {
    return this.config?.apiUrls || {};
  }

  get apiUrlProduction() {
    return this.config?.apiUrlsProduction;
  }

  get gatewayUrl(): string {
    return this.config?.gatewayUrl || '';
  }

  isBackendRequest(url: string): boolean {

    if (!this.gatewayUrl) {
      return false;
    }

    return url.startsWith(this.gatewayUrl);
  }

  isLoginRequest(url: string): boolean {
    return url === this.apiUrlProduction?.authService;
  }
}
