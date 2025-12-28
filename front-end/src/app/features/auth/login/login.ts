import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CashlyLogo } from '@shared';
import { ChartPie, LucideAngularModule, PiggyBank, Wallet } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

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
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly pieChart = ChartPie;
  readonly piggyBank = PiggyBank;
  readonly wallet = Wallet;

  route = inject(Router);

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
