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
import {UnauthorizedComponent} from "../pages/unauthorized/unauthorized.component";
import {RoleGuard} from "../guard/role.guard";
import {PageNotFoundComponent} from "../pages/page-not-found/page-not-found.component";

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'sale', component: SaleComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['Admin', 'SaleViewer'] } },
  { path: 'sale-range', component: SaleRangeComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['Admin', 'RangeSaleViewer'] } },
  { path: 'branches', component: BranchesComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['Admin', 'BranchViewer'] } },
  { path: 'detailed-sales', component: DetailedSalesComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['Admin', 'DetailedSaleViewer'] } },
  { path: 'refund', component: RefundComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['Admin', 'RefundViewer'] } },
  { path: 'admin', component: AdminPanelComponent, canActivate: [AuthGuard, RoleGuard],  data: { roles: ['Admin'] }},
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];
