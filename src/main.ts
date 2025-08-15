import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { AuthInterceptor } from "./guard/auth.interceptor";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { routes } from "./app/app.routes";
import { ConfigService } from "./services/config.service";
import { importProvidersFrom, inject, provideAppInitializer } from "@angular/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import { ToastrModule } from "ngx-toastr";

function intializeApp(config: ConfigService){
  return () => config.loadConfig()
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    importProvidersFrom(ToastrModule.forRoot({
      timeOut: 3000,
      preventDuplicates: true,
      positionClass: 'toast-top-right'
    })),
    ConfigService,
    provideAppInitializer(() => {
        const initializerFn = (intializeApp)(inject(ConfigService));
        return initializerFn();
      }),
    provideAnimations()
  ]
}).catch(err => console.log(err));
