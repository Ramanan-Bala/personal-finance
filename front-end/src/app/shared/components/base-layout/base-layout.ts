import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {
  ArrowLeftRight,
  BookOpen,
  HandCoins,
  LayoutDashboard,
  LucideAngularModule,
  LucideIconData,
  Settings,
} from 'lucide-angular';
import { CashlyLogo } from '../../logo/logo';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';

interface MenuItem {
  icon: LucideIconData;
  label: string;
  url: string;
}

@Component({
  selector: 'app-base-layout',
  imports: [CommonModule, CashlyLogo, LucideAngularModule, RouterOutlet, ThemeSwitcher],
  templateUrl: './base-layout.html',
  styleUrl: './base-layout.css',
})
export class BaseLayout {
  currentPage = 'Dashboard';
  isOpen = true;

  menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', url: '/app/dashboard' },
    { icon: BookOpen, label: 'Ledger', url: '/app/ledger' },
    { icon: ArrowLeftRight, label: 'Income & Expenses', url: '/app/income-expenses' },
    { icon: HandCoins, label: 'Lend/Debt', url: '/app/lend-debt' },
    { icon: Settings, label: 'Settings', url: '/app/settings' },
  ];

  route = inject(Router);

  handleNavigate(page: MenuItem): void {
    this.currentPage = page.label;
    this.route.navigate([page.url]);
  }
}
