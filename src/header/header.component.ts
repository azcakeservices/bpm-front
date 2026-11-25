import {
  Component,
  OnInit,
  OnDestroy,
  HostListener
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

interface MenuItem {
  label: string;
  icon?: string;
  link?: string;
  roles: string[];
  children?: MenuItem[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {

  currentDate: string = '';
  currentTime: string = '';

  menuOpen: boolean = false;

  userName: string = '';
  department: string = '';
  userInitials: string = '';

  readonly currentYear = new Date().getFullYear();

  visibleMenuItems: MenuItem[] = [];

  openedCategories = new Set<string>();

  private clockInterval?: ReturnType<typeof setInterval>;

  menuItems: MenuItem[] = [
    {
      label: 'Ana səhifə',
      icon: 'home',
      link: '/home',
      roles: []
    },
    {
      label: 'Filiallar',
      icon: 'store',
      link: '/branches',
      roles: ['Admin', 'BranchViewer']
    },
    {
      label: 'Satışlar',
      icon: 'chart',
      roles: [],
      children: [
        {
          label: 'Gündəlik',
          link: '/payments/daily',
          roles: ['Admin', 'SaleViewer']
        },
        {
          label: 'Aralıq',
          link: '/payments/range',
          roles: ['Admin', 'RangeSaleViewer']
        },
        {
          label: 'Detallı',
          link: '/payments/detailed',
          roles: ['Admin', 'DetailedSaleViewer']
        }
      ]
    },
    {
      label: 'İadələr',
      icon: 'refund',
      link: '/refund',
      roles: ['Admin', 'RefundViewer']
    },
    {
      label: 'Admin',
      icon: 'shield',
      link: '/admin',
      roles: ['Admin']
    }
  ];

  constructor(private auth: AuthService) {}

  ngOnInit(): void {

    this.loadUser();

    this.prepareMenu();

    this.updateDateTime();

    this.clockInterval = setInterval(() => {
      this.updateDateTime();
    }, 1000);

  }

  ngOnDestroy(): void {

    if (this.clockInterval !== undefined) {
      clearInterval(this.clockInterval);
    }

  }

  private loadUser(): void {

    const user = localStorage.getItem('user');

    if (!user) {
      this.userInitials = 'U';
      return;
    }

    try {

      const userData = JSON.parse(user);

      this.userName = userData['displayName'] ?? '';

      this.department = userData['department'] ?? '';

      this.userInitials = this.getInitials(this.userName);

    } catch {

      this.userName = '';
      this.department = '';
      this.userInitials = 'U';

    }

  }

  private getInitials(name: string): string {

    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0))
      .join('')
      .toLocaleUpperCase('az') || 'U';

  }

  private prepareMenu(): void {

    this.visibleMenuItems = this.menuItems
      .filter(item => this.hasAccess(item.roles))
      .map(item => ({
        ...item,
        children: item.children
          ? item.children.filter(child =>
            this.hasAccess(child.roles)
          )
          : undefined
      }))
      .filter(item =>
        !!item.link ||
        (item.children?.length ?? 0) > 0
      );

  }

  toggleMenu(): void {

    this.menuOpen = !this.menuOpen;

  }

  closeMenu(): void {

    this.menuOpen = false;

  }

  toggleCategory(label: string): void {

    if (this.openedCategories.has(label)) {

      this.openedCategories.delete(label);

    } else {

      this.openedCategories.add(label);

    }

  }

  isCategoryOpened(label: string): boolean {

    return this.openedCategories.has(label);

  }

  @HostListener('document:keydown.escape')
  onEscape(): void {

    if (this.menuOpen) {
      this.closeMenu();
    }

  }

  updateDateTime(): void {

    const now = new Date();

    this.currentDate = now.toLocaleDateString('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    this.currentTime = now.toLocaleTimeString('az-AZ', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

  }

  signOut(): void {

    this.closeMenu();

    this.auth.logout();

  }

  hasAccess(roles: string[]): boolean {

    return roles.length === 0 ||
      this.auth.hasAnyRole(roles);

  }

}
