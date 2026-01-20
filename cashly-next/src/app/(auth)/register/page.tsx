"use client";

import {
  CashlyLogo,
  fadeScaleInVariants,
  leftToRightVariants,
  staggerContainerVariants,
  ThemeSwitcher,
} from "@/shared";
import { passwordValidator } from "@/shared/validators/password";
import { Button } from "@radix-ui/themes";
import {
  ChartLine,
  ChartPie,
  Check,
  DollarSign,
  LogIn,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  passwordMismatch?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string) => {
    let error = "";

    switch (field) {
      case "fullName":
        if (!value) error = "Full name is required";
        else if (value.length < 2) error = "Minimum length is 2 characters";
        else if (value.length > 50) error = "Maximum length is 50 characters";
        break;

      case "email":
        if (!value) error = "Email is required";
        else if (!value.includes("@")) error = "Please enter a valid email";
        break;

      case "password":
        if (!value) {
          error = "Password is required";
        } else {
          const passErrors = passwordValidator(value);
          if (Object.keys(passErrors).length > 0) {
            // Return first error message
            if ("tooShort" in passErrors) {
              const e = passErrors.tooShort as Record<string, boolean | object>;
              error = `Minimum length is ${e.requiredLength} characters`;
            } else if ("missingUppercase" in passErrors) {
              error = "Must include at least one uppercase letter";
            } else if ("missingLowercase" in passErrors) {
              error = "Must include at least one lowercase letter";
            } else if ("missingNumber" in passErrors) {
              error = "Must include at least one number";
            } else if ("missingSpecial" in passErrors) {
              error = "Must include at least one special character (@$!%*?&)";
            }
          }
        }
        break;

      case "confirmPassword":
        if (!value) error = "Confirm password is required";
        break;
    }

    return error;
  };

  const handleBlur = (field: string, value: string) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, value);
    setErrors({ ...errors, [field]: error });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate all fields
    Object.entries(formData).forEach(([field, value]) => {
      const error = validateField(field, value);
      if (error) {
        newErrors[field as keyof FormErrors] = error;
        isValid = false;
      }
    });

    // Check password match
    if (
      formData.password !== formData.confirmPassword &&
      formData.password &&
      formData.confirmPassword
    ) {
      newErrors.passwordMismatch = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (isValid && !newErrors.passwordMismatch) {
      console.log("Form Submitted", formData);
      router.push("/app/dashboard");
    }
  };

  const info = [
    {
      title: "Track All Your Accounts",
      description:
        "Connect and monitor all your financial accounts in one place",
    },
    {
      title: "Smart Analytics",
      description:
        "Get insights into your spending patterns and financial health",
    },
    {
      title: "Secure & Private",
      description: "Bank-level encryption keeps your financial data safe",
    },
  ];

  return (
    <div className="bg-bg flex min-h-screen">
      {/* Left Panel */}
      <div className="dark:bg-card relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-emerald-500 to-emerald-600 p-12 lg:flex lg:w-1/2 dark:bg-none">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20">
            <ChartPie className="h-32 w-32 text-white" />
          </div>
          <div className="absolute bottom-32 left-20">
            <ChartLine className="h-40 w-40 text-white" />
          </div>
          <div className="absolute top-1/2 right-1/3">
            <DollarSign className="h-24 w-24 text-white" />
          </div>
        </div>

        <CashlyLogo size="md" showWordMark variant="light" className="z-10" />

        <motion.div
          {...staggerContainerVariants}
          className="relative z-10 text-white"
        >
          <motion.div {...leftToRightVariants}>
            <h1 className="mb-4 text-4xl">Start your financial journey</h1>
            <p className="mb-8 text-lg text-emerald-50 opacity-90">
              Join thousands of users who are taking control of their finances
              with Cashly.
            </p>
          </motion.div>

          <div className="space-y-4">
            {info.map((feature, index) => (
              <motion.div
                key={index}
                {...leftToRightVariants}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg">{feature.title}</h3>
                  <p className="text-sm text-emerald-50 opacity-80">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <div className=""></div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-end p-5">
          <ThemeSwitcher />
        </div>

        <motion.div
          {...fadeScaleInVariants}
          className="flex flex-1 items-center justify-center p-8 fade-in"
        >
          <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center lg:hidden">
              <CashlyLogo size="lg" showWordMark variant="default" />
            </div>

            <div className="border-border bg-card rounded-2xl border p-8 shadow-lg">
              <div className="mb-8">
                <h2 className="text-foreground mb-2">Create your account</h2>
                <p className="text-muted-foreground text-sm">
                  Get started with Cashly for free
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="fullName"
                    className="text-foreground text-sm font-medium"
                  >
                    Full name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    className="text-foreground placeholder-muted-foreground border-border bg-bg rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={(e) => handleBlur("fullName", e.target.value)}
                  />
                  {touched.fullName && errors.fullName && (
                    <p className="text-xs text-red-500">{errors.fullName}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="email"
                    className="text-foreground text-sm font-medium"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="text-foreground placeholder-muted-foreground border-border bg-bg rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={(e) => handleBlur("email", e.target.value)}
                  />
                  {touched.email && errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="password"
                    className="text-foreground text-sm font-medium"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="text-foreground placeholder-muted-foreground border-border bg-bg rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={(e) => handleBlur("password", e.target.value)}
                  />
                  {touched.password && errors.password && (
                    <p className="text-xs text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-foreground text-sm font-medium"
                  >
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="text-foreground placeholder-muted-foreground border-border bg-bg rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={(e) =>
                      handleBlur("confirmPassword", e.target.value)
                    }
                  />
                  {touched.confirmPassword &&
                    (errors.confirmPassword || errors.passwordMismatch) && (
                      <p className="text-xs text-red-500">
                        {errors.confirmPassword || errors.passwordMismatch}
                      </p>
                    )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="3"
                  disabled={
                    Object.keys(errors).length > 0 &&
                    Object.keys(touched).length > 0
                  }
                >
                  <UserPlus className="h-4 w-4" />
                  Create account
                </Button>
              </form>

              <div className="mt-6 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="border-border w-full border-t"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-card text-muted-foreground px-4">
                      Have an account?
                    </span>
                  </div>
                </div>

                <Link href="/login">
                  <Button
                    color="gray"
                    variant="soft"
                    className="w-full text-primary"
                    size="3"
                  >
                    <LogIn className="h-4 w-4" />
                    Log in
                  </Button>
                </Link>
              </div>
            </div>

            <p className="text-foreground mt-8 text-center text-xs">
              By creating an account, you agree to our Terms of Service and
              Privacy Policy
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
