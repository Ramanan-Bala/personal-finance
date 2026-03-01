export function passwordValidator(
  value: string,
  min = 8,
  max = 20,
): Record<string, boolean | object> {
  const errors: Record<string, boolean | object> = {};

  if (!value) return errors;

  if (value.length < min)
    errors["tooShort"] = { requiredLength: min, actualLength: value.length };
  if (value.length > max)
    errors["tooLong"] = { requiredLength: max, actualLength: value.length };
  if (!/[A-Z]/.test(value)) errors["missingUppercase"] = true;
  if (!/[a-z]/.test(value)) errors["missingLowercase"] = true;
  if (!/\d/.test(value)) errors["missingNumber"] = true;
  if (!/[@$!%*?&]/.test(value))
    errors["missingSpecial"] = { allowed: "@$!%*?&" };

  return errors;
}
