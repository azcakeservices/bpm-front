import { Routes } from '@angular/router';
import {HomeComponent} from "../pages/home/home.component";
import {LoginComponent} from "../pages/login/login.component";
import {BranchesComponent} from "../pages/branches/branches.component";
import {AuthGuard} from "../guard/auth.guard";
import {SaleComponent} from "../pages/sale/sale.component";
import {SaleRangeComponent} from "../pages/sale-range/sale-range.component";
import {DetailedSalesComponent} from "../pages/detailed-sales/detailed-sales.component";

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'sale', component: SaleComponent, canActivate: [AuthGuard] },
  { path: 'sale-range', component: SaleRangeComponent, canActivate: [AuthGuard] },
  { path: 'branches', component: BranchesComponent, canActivate: [AuthGuard]},
  { path: 'detailed-sales', component: DetailedSalesComponent, canActivate: [AuthGuard]},
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login'}
  // { path: 'payments', component: PaymentComponent, canActivate: [AuthGuard]},
  // { path: 'sales', component: SalesComponent, canActivate: [AuthGuard] },
];
