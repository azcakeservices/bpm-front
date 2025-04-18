import { Routes } from '@angular/router';
import {HomeComponent} from "../pages/home/home.component";
import {LoginComponent} from "../pages/login/login.component";
import {BranchesComponent} from "../pages/branches/branches.component";
import {AuthGuard} from "../guard/auth.guard";
import {SaleComponent} from "../pages/sale/sale.component";
import {SaleRangeComponent} from "../pages/sale-range/sale-range.component";
import {DetailedSalesComponent} from "../pages/detailed-sales/detailed-sales.component";
import {AdminPanelComponent} from "../pages/admin-panel/admin-panel.component";
import {RefundComponent} from "../pages/refund/refund.component";

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'sale', component: SaleComponent, canActivate: [AuthGuard] },
  { path: 'sale-range', component: SaleRangeComponent, canActivate: [AuthGuard] },
  { path: 'branches', component: BranchesComponent, canActivate: [AuthGuard] },
  { path: 'detailed-sales', component: DetailedSalesComponent, canActivate: [AuthGuard] },
  { path: 'refund', component: RefundComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminPanelComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login'}
];
