import { Routes } from '@angular/router';
import {HomeComponent} from "../pages/home/home.component";
import {LoginComponent} from "../pages/login/login.component";
import {BranchesComponent} from "../pages/branches/branches.component";
import {SalesComponent} from "../pages/sales/sales.component";
import {AuthGuard} from "../guard/auth.guard";
import {PaymentComponent} from "../pages/payment/payment.component";

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'sales', component: SalesComponent, canActivate: [AuthGuard] },
  { path: 'branches', component: BranchesComponent, canActivate: [AuthGuard]},
  { path: 'payments', component: PaymentComponent, canActivate: [AuthGuard]},
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login'}
];
