import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordValidator(min = 8, max = 20): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v: string = control.value ?? '';
    if (!v) return null; // leave required check to Validators.required

    const errors: ValidationErrors = {};
    if (v.length < min) errors['tooShort'] = { requiredLength: min, actualLength: v.length };
    if (v.length > max) errors['tooLong'] = { requiredLength: max, actualLength: v.length };
    if (!/[A-Z]/.test(v)) errors['missingUppercase'] = true;
    if (!/[a-z]/.test(v)) errors['missingLowercase'] = true;
    if (!/\d/.test(v)) errors['missingNumber'] = true;
    if (!/[@$!%*?&]/.test(v)) errors['missingSpecial'] = { allowed: '@$!%*?&' };

    return Object.keys(errors).length ? errors : null;
  };
}
