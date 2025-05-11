import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../services/auth.service";
import { NgForOf, NgIf } from "@angular/common";

interface MenuItem {
  label: string;
  link?: string;
  roles: string[];
  children?: MenuItem[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    RouterLinkActive,
    NgForOf,
    NgIf
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  currentDate!: string;
  menuOpen: boolean = false;
  userName: string = '';
  department: string = '';
  visibleMenuItems: MenuItem[] = [];
  openedCategories = new Set<string>();

  menuItems: MenuItem[] = [
    { label: 'Ana səhifə', link: '/home', roles: [] },
    { label: 'Filiallar', link: '/branches', roles: ['Admin', 'BranchViewer'] },
    {
      label: 'Satışlar',
      roles: [],
      children: [
        { label: 'Gündəlik', link: '/payments/daily', roles: ['Admin', 'SaleViewer'] },
        { label: 'Aralıq', link: '/payments/range', roles: ['Admin', 'RangeSaleViewer'] },
        { label: 'Detallı', link: '/payments/detailed', roles: ['Admin', 'DetailedSaleViewer'] }
      ]
    },
    { label: 'İadələr', link: '/refund', roles: ['Admin', 'RefundViewer'] },
    { label: 'Admin', link: '/admin', roles: ['Admin'] }
  ];

  constructor(private auth: AuthService) {}

  ngOnInit() {
    const user = localStorage.getItem('user');

    if (user) {
      const userData = JSON.parse(user);
      this.userName = userData['displayName'] ?? '';
      this.department = this.getValueByKey('department');
    }

    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000);

    this.visibleMenuItems = this.menuItems
      .filter(item => this.hasAccess(item.roles))
      .map(item => ({
        ...item,
        children: item.children
          ? item.children.filter(child => this.hasAccess(child.roles))
          : []
      }))
      .filter(item => !item.children || item.children.length > 0 || item.link);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (!this.menuOpen) {
      this.openedCategories.clear();
    }
  }

  toggleCategory(label: string) {
    if (this.openedCategories.has(label)) {
      this.openedCategories.delete(label);
    } else {
      this.openedCategories.add(label);
    }
  }

  isCategoryOpened(label: string): boolean {
    return this.openedCategories.has(label);
  }

  getValueByKey(key: string) {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData[key];
    }
  }

  updateDateTime() {
    const now = new Date();
    this.currentDate = now.toLocaleString();
  }

  signOut() {
    this.auth.logout();
  }

  hasAccess(roles: string[]): boolean {
    return roles.length === 0 || this.auth.hasAnyRole(roles);
  }
}


