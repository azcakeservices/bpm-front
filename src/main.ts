import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { AuthInterceptor } from "./guard/auth.interceptor";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { routes } from "./app/app.routes";
import { ConfigService } from "./services/config.service";
import { APP_INITIALIZER, importProvidersFrom } from "@angular/core";
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
    {
      provide: APP_INITIALIZER,
      useFactory: intializeApp,
      deps: [ConfigService],
      multi: true
    },
    provideAnimations()
  ]
}).catch(err => console.log(err));
