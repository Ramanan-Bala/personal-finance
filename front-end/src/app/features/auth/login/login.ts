import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CashlyLogo, ThemeSwitcher } from '@shared';
import {
  ChartPie,
  FingerprintPattern,
  Lock,
  LogIn,
  LucideAngularModule,
  PiggyBank,
  ShieldCheckIcon,
  UserPlus,
  Wallet,
} from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login',
  imports: [
    CashlyLogo,
    LucideAngularModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    ButtonModule,
    MessageModule,
    ThemeSwitcher,
    PasswordModule,
    CheckboxModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly pieChart = ChartPie;
  readonly piggyBank = PiggyBank;
  readonly wallet = Wallet;
  readonly logIn = LogIn;
  readonly userPlus = UserPlus;

  route = inject(Router);

  securityFeatures = [
    {
      icon: ShieldCheckIcon,
      text: '256-bit SSL Encryption',
    },
    {
      icon: Lock,
      text: 'Bank-Level Security',
    },
    {
      icon: FingerprintPattern,
      text: 'Two-Factor Authentication',
    },
  ];

  loginForm: FormGroup<{
    email: FormControl<string | null>;
    password: FormControl<string | null>;
  }> = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (this.loginForm.valid) {
      // Handle registration logic here
      console.log('Form Submitted', this.loginForm.value);
      this.route.navigate(['/app']);
    }
  }
}
