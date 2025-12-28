import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'logo',
  imports: [CommonModule],
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class CashlyLogo {
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  showWordMark = input<boolean>(false);
  variant = input<'default' | 'light' | 'dark'>('default');
  className = input<string>('');

  sizeClasses: { [key: string]: { container: string; text: string; icon: string } } = {
    sm: { container: 'w-8 h-8', text: 'text-lg', icon: 'w-4 h-4' },
    md: { container: 'w-10 h-10', text: 'text-xl', icon: 'w-5 h-5' },
    lg: { container: 'w-12 h-12', text: 'text-2xl', icon: 'w-6 h-6' },
    xl: { container: 'w-16 h-16', text: 'text-3xl', icon: 'w-8 h-8' },
  };

  variantClasses: { [key: string]: { bg: string; icon: string; text: string } } = {
    default: {
      bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      icon: 'text-white',
      text: 'text-white',
    },
    light: {
      bg: 'bg-white/20 backdrop-blur-sm',
      icon: 'text-white',
      text: 'text-white',
    },
    dark: {
      bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      icon: 'text-white',
      text: 'text-black',
    },
  };

  currentSize = computed(() => this.sizeClasses[this.size()]);
  currentVariant = computed(() => this.variantClasses[this.variant()]);
}
