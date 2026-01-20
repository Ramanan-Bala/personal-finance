import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CashlyLogo, ThemeSwitcher } from '@shared';
import {
  ArrowRight,
  BadgeCheck,
  ChartColumn,
  ChartPie,
  CircleCheck,
  Github,
  Linkedin,
  Lock,
  LucideAngularModule,
  Shield,
  ShieldCheck,
  TrendingUp,
  Twitter,
  Wallet,
} from 'lucide-angular';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { ButtonModule } from 'primeng/button';

interface Feature {
  icon: any;
  title: string;
  description: string;
  color?: string;
}

interface Testimonial {
  name: string;
  role: string;
  image: string;
  quote: string;
}

interface Stat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-landing-page',
  imports: [
    CommonModule,
    LucideAngularModule,
    CashlyLogo,
    ButtonModule,
    ThemeSwitcher,
    AnimateOnScrollModule,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  readonly CircleCheck = CircleCheck;
  readonly Wallet = Wallet;
  readonly TrendingUp = TrendingUp;
  readonly PieChart = ChartPie;
  readonly ChartColumn = ChartColumn;
  readonly ArrowRight = ArrowRight;
  readonly Twitter = Twitter;
  readonly Github = Github;
  readonly Linkedin = Linkedin;

  router = inject(Router);

  isMobileMenuOpen = false;

  features: Feature[] = [
    {
      icon: Wallet,
      title: 'Manage Multiple Accounts',
      description:
        'Connect and track all your bank accounts, credit cards, and digital wallets in one secure dashboard.',
      color: 'emerald',
    },
    {
      icon: ChartColumn,
      title: 'Track Daily Ledger',
      description:
        'Monitor every transaction with chronological views and running balances for complete financial visibility.',
      color: 'blue',
    },
    {
      icon: ChartPie,
      title: 'Lend & Debt Management',
      description:
        "Keep track of money you've lent or borrowed with smart reminders and settlement tracking.",
      color: 'purple',
    },
    {
      icon: Shield,
      title: 'Smart Analytics & Reports',
      description:
        'Get actionable insights with beautiful charts, spending patterns, and personalized financial recommendations.',
      color: 'orange',
    },
  ];

  testimonials: Testimonial[] = [
    {
      name: 'Alex Johnson',
      role: 'Freelance Designer',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      quote:
        'Cashly transformed how I manage my freelance income. The analytics helped me save 30% more each month!',
    },
    {
      name: 'Maria Garcia',
      role: 'Small Business Owner',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      quote:
        "Finally, a finance app that's both powerful and easy to use. The debt tracking feature is a game-changer.",
    },
    {
      name: 'David Chen',
      role: 'Software Engineer',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      quote:
        'Clean interface, powerful features. Cashly makes financial planning feel effortless and even enjoyable.',
    },
  ];

  stats: Stat[] = [
    { value: '50K+', label: 'Active Users' },
    { value: '$2M+', label: 'Tracked Monthly' },
    { value: '4.9/5', label: 'User Rating' },
    { value: '99.9%', label: 'Uptime' },
  ];

  footerLinks = {
    product: [
      { label: 'Features', href: '/landing-page' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Pricing', href: '/landing-page' },
    ],
    company: [
      { label: 'About Us', href: '/landing-page' },
      { label: 'Contact', href: '/landing-page' },
      { label: 'Careers', href: '/landing-page' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/landing-page' },
      { label: 'Terms of Service', href: '/landing-page' },
      { label: 'Security', href: '/landing-page' },
    ],
  };

  badges = [
    {
      icon: ShieldCheck,
      title: 'Bank-Level Security',
      description: '256-bit SSL encryption protects your data',
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'Your financial data never leaves our secure servers',
    },
    {
      icon: BadgeCheck,
      title: 'GDPR Compliant',
      description: 'Full compliance with data protection regulations',
    },
  ];

  socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  animationDelay = [100, 200, 300, 400];

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onGetStartedClick() {
    this.router.navigate(['/register']);
  }
}
