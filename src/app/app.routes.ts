import { Routes } from '@angular/router';
import { LoginComponent } from '../pages/login/login.component';
import { HomeComponent } from '../pages/home/home.component';
import { AuthGuard } from '../guard/auth.guard';
import { SaleComponent } from '../pages/sale/sale.component';
import { RoleGuard } from '../guard/role.guard';
import { SaleRangeComponent } from '../pages/sale-range/sale-range.component';
import { DetailedSalesComponent } from '../pages/detailed-sales/detailed-sales.component';
import { BranchesComponent } from '../pages/branches/branches.component';
import { RefundComponent } from '../pages/refund/refund.component';
import { AdminPanelComponent } from '../pages/admin-panel/admin-panel.component';
import { UnauthorizedComponent } from '../pages/unauthorized/unauthorized.component';
import { PageNotFoundComponent } from '../pages/page-not-found/page-not-found.component';
import { EmployeeFormComponent } from '../pages/employee-form/employee-form.component';
import { LayoutComponent } from '../components/layout/layout.component';
import {QuestionComponent} from "../pages/question/question.component";
import {InputsTypesComponent} from "../pages/inputs-types/inputs-types.component";

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        component: HomeComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'BranchViewer'] }
      },
      {
        path: 'payments',
        children: [
          { path: '', redirectTo: 'daily', pathMatch: 'full' },
          { path: 'daily', component: SaleComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'SaleViewer'] } },
          { path: 'range', component: SaleRangeComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'RangeSaleViewer'] } },
          { path: 'detailed', component: DetailedSalesComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'DetailedSaleViewer'] } },
        ]
      },
      {
        path: 'hr',
        children: [
          { path: '', redirectTo: 'home', pathMatch: 'full' },
          { path: 'employee-form', component: EmployeeFormComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'EmployeeFormViewer'] } },
          { path: 'questions', component: QuestionComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'QuestionViewer'] } },
          { path: 'input-types', component: InputsTypesComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'InputTypesViewer', 'InputTypesEditor'] } },
        ]
      },
      {
        path: 'branches',
        component: BranchesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'BranchViewer'] }
      },
      {
        path: 'refund',
        component: RefundComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'RefundViewer'] }
      },
      {
        path: 'admin',
        children: [
          { path: '', redirectTo: '', pathMatch: 'full' },
        ],
      }
    ]
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
];
