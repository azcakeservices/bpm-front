import {Component, OnInit} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {AuthService} from "../services/auth.service";
import {NgForOf, NgIf} from "@angular/common";

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

  menuItems = [
    { label: 'Ana səhifə', link: '/home', roles: []},
    { label: 'Filiallar', link: '/branches', roles: ['Admin', 'BranchViewer']},
    { label: 'Satışlar', link: '/sale', roles: ['Admin', 'SaleViewer']},
    { label: 'Aralığ satışlar', link: '/sale-range', roles: ['Admin', 'RangeSaleViewer']},
    { label: 'Gündəlik Detallı Satışlar', link: '/detailed-sales', roles: ['Admin', 'DetailedSaleViewer']},
    { label: 'İadələr', link: '/refund', roles: ['Admin', 'RefundViewer']},
    { label: 'Admin', link: '/admin', roles: ['Admin']}
  ];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    const user = localStorage.getItem('user');

    if (user){
      const userData = JSON.parse(user);
      this.userName = userData['displayName'] ?? '';
      this.department = this.getValueByKey('department');
    }

    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  getValueByKey(key: string) {
    const user = localStorage.getItem('user');
    if (user){
      const userData = JSON.parse(user);
      return userData[key];
    }
  }

  updateDateTime() {
    const now = new Date();
    this.currentDate = now.toLocaleString();
  }

  signOut(){
    this.auth.logout();
  }

  hasAccess(roles: string[]): boolean {
    return roles.length === 0 || this.auth.hasAnyRole(roles);
  }

  get visibleMenuItems() {
    return this.menuItems.filter(item => this.hasAccess(item.roles));
  }
}
