import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import {HTTP_INTERCEPTORS, provideHttpClient} from "@angular/common/http";
import {AuthInterceptor} from "./guard/auth.interceptor";
import {provideRouter, withComponentInputBinding} from "@angular/router";
import {routes} from "./app/app.routes";
import {ConfigService} from "./services/config.service";
import {APP_INITIALIZER} from "@angular/core";
import {provideAnimations} from "@angular/platform-browser/animations";

function intializeApp(config: ConfigService){
  return () => config.loadConfig()
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    ConfigService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: intializeApp,
      deps: [ConfigService],
      multi: true
    },
    provideAnimations()
  ]
}).catch(err => console.log(err));
