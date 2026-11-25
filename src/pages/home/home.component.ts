import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

type HomeModule = {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: string;
  roles: string[];
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  // ==========================================
  // USER INFORMATION
  // ==========================================

  userName = '';
  department = '';

  isAdmin = false;

  currentDate = '';

  readonly currentYear = new Date().getFullYear();


  // ==========================================
  // MODULES
  // ==========================================

  visibleModules: HomeModule[] = [];

  readonly modules: HomeModule[] = [
    {
      id: '01',
      title: 'Filiallar',
      description:
        'Filialların siyahısı, məlumatları və cari statusları.',
      route: '/branches',
      icon: 'store',
      roles: ['Admin', 'BranchViewer']
    },
    {
      id: '02',
      title: 'Gündəlik satışlar',
      description:
        'Məhsullar üzrə gündəlik satış hesabatları.',
      route: '/payments/daily',
      icon: 'daily-sales',
      roles: ['Admin', 'SaleViewer']
    },
    {
      id: '03',
      title: 'Aralıq satışlar',
      description:
        'Tarix aralığı üzrə filialların satış göstəricilərinin təhlili.',
      route: '/payments/range',
      icon: 'range-sales',
      roles: ['Admin', 'RangeSaleViewer']
    },
    {
      id: '04',
      title: 'Detallı satışlar',
      description:
        'Ətraflı satış məlumatları, filterlər və Excel hesabatları.',
      route: '/payments/detailed',
      icon: 'detailed-sales',
      roles: ['Admin', 'DetailedSaleViewer']
    },
    {
      id: '05',
      title: 'İadələr',
      description:
        'Məhsul iadələrinin hesabatı və təhlili.',
      route: '/refund',
      icon: 'refund',
      roles: ['Admin', 'RefundViewer']
    },
    {
      id: '06',
      title: 'Admin panel',
      description:
        'İstifadəçilərin, rolların və giriş hüquqlarının idarə edilməsi.',
      route: '/admin',
      icon: 'admin',
      roles: ['Admin']
    }
  ];


  constructor(
    private auth: AuthService
  ) {}


  // ==========================================
  // INITIALIZATION
  // ==========================================

  ngOnInit(): void {

    this.loadUser();

    this.prepareModules();

    this.prepareDate();

    this.isAdmin = this.auth.hasAnyRole(['Admin']);

  }


  // ==========================================
  // LOAD USER
  // ==========================================

  private loadUser(): void {

    const user = localStorage.getItem('user');

    if (!user) {
      return;
    }

    try {

      const userData = JSON.parse(user);

      this.userName =
        typeof userData?.displayName === 'string'
          ? userData.displayName.trim()
          : '';

      this.department =
        typeof userData?.department === 'string'
          ? userData.department.trim()
          : '';

    } catch {

      this.userName = '';
      this.department = '';

    }

  }


  // ==========================================
  // DATE
  // ==========================================

  private prepareDate(): void {

    this.currentDate = new Intl.DateTimeFormat(
      'az-AZ',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long'
      }
    ).format(new Date());

  }


  // ==========================================
  // PERMISSIONS
  // ==========================================

  hasAccess(roles: string[]): boolean {

    return roles.length === 0 ||
      this.auth.hasAnyRole(roles);

  }


  private prepareModules(): void {

    this.visibleModules = this.modules.filter(
      module => this.hasAccess(module.roles)
    );

  }


  // ==========================================
  // HELPERS
  // ==========================================

  get accessLevel(): string {

    return this.isAdmin
      ? 'Administrator'
      : 'İstifadəçi';

  }


  get moduleCount(): number {

    return this.visibleModules.length;

  }


  trackByModule(
    index: number,
    module: HomeModule
  ): string {

    return module.id;

  }

}
