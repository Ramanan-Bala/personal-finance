import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CashlyLogo, passwordValidator } from '@shared';
import { ChartLine, ChartPie, DollarSign, LucideAngularModule } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-register',
  imports: [
    LucideAngularModule,
    CashlyLogo,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    ButtonModule,
    MessageModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  readonly pieChart = ChartPie;
  readonly lineChart = ChartLine;
  readonly dollarSign = DollarSign;

  passwordMatchValidator: ValidatorFn = (group: AbstractControl) => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    var error: ValidationErrors = {};
    if (password !== confirmPassword) {
      error['passwordMismatch'] = true;
    }
    return Object.keys(error).length ? error : null;
  };

  registerForm: FormGroup<{
    fullName: FormControl<string | null>;
    email: FormControl<string | null>;
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
  }> = new FormGroup(
    {
      fullName: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        passwordValidator(),
      ]),
      confirmPassword: new FormControl('', Validators.required),
    },
    { validators: this.passwordMatchValidator },
  );

  onSubmit() {
    if (this.registerForm.valid) {
      // Handle registration logic here
      console.log('Form Submitted', this.registerForm.value);
    }
  }
}
