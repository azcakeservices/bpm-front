import {Routes} from "@angular/router";
import {LoginComponent} from "../pages/login/login.component";
import {HomeComponent} from "../pages/home/home.component";
import {AuthGuard} from "../guard/auth.guard";
import {SaleComponent} from "../pages/sale/sale.component";
import {RoleGuard} from "../guard/role.guard";
import {SaleRangeComponent} from "../pages/sale-range/sale-range.component";
import {DetailedSalesComponent} from "../pages/detailed-sales/detailed-sales.component";
import {BranchesComponent} from "../pages/branches/branches.component";
import {RefundComponent} from "../pages/refund/refund.component";
import {AdminPanelComponent} from "../pages/admin-panel/admin-panel.component";
import {UnauthorizedComponent} from "../pages/unauthorized/unauthorized.component";
import {PageNotFoundComponent} from "../pages/page-not-found/page-not-found.component";

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  {
    path: 'payments',
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'daily', pathMatch: 'full' },
      { path: 'daily', component: SaleComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'SaleViewer'] } },
      { path: 'range', component: SaleRangeComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'RangeSaleViewer'] } },
      { path: 'detailed', component: DetailedSalesComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'DetailedSaleViewer'] } }
    ]
  },
  { path: 'branches', component: BranchesComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['Admin', 'BranchViewer'] } },
  { path: 'refund', component: RefundComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['Admin', 'RefundViewer'] } },
  { path: 'admin', component: AdminPanelComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['Admin'] }},
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];
