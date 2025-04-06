import {Injectable} from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
} from "@angular/router";
import {AuthService} from "../services/auth.service";

@Injectable({
  providedIn: 'root'
})

export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as string[];
    if (this.authService.hasAnyRole(expectedRoles)){
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
