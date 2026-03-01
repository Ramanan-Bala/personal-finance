"use client";

import {
  CashlyLogo,
  fadeScaleInVariants,
  leftToRightVariants,
  staggerContainerVariants,
  ThemeSwitcher,
  useAuth,
} from "@/shared";
import { passwordValidator } from "@/shared/validators/password";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@radix-ui/themes";
import {
  ChartLine,
  ChartPie,
  Check,
  DollarSign,
  Loader2,
  LogIn,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Minimum length is 2 characters")
      .max(50, "Maximum length is 50 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email"),
    password: z
      .string()
      .min(1, "Password is required")
      .superRefine((val, ctx) => {
        const passErrors = passwordValidator(val);
        if (Object.keys(passErrors).length > 0) {
          if ("tooShort" in passErrors) {
            const e = passErrors.tooShort as Record<string, any>;
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Minimum length is ${e.requiredLength} characters`,
            });
          } else if ("missingUppercase" in passErrors) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Must include at least one uppercase letter",
            });
          } else if ("missingLowercase" in passErrors) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Must include at least one lowercase letter",
            });
          } else if ("missingNumber" in passErrors) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Must include at least one number",
            });
          } else if ("missingSpecial" in passErrors) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Must include at least one special character (@$!%*?&)",
            });
          }
        }
      }),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["passwordMismatch"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const info = [
  {
    title: "Track All Your Accounts",
    description: "Connect and monitor all your financial accounts in one place",
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

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const { register: registerUser, isAuthenticated } = useAuth();

  // Find the password mismatch error from root schema refinement
  // In react-hook-form with zodResolver, root errors might be under "root" or a specific path
  const passwordMismatchError = (errors as any).passwordMismatch?.message;

  if (isAuthenticated) {
    redirect("/dashboard");
  }

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
          className="fade-in flex flex-1 items-center justify-center p-8"
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

              <form onSubmit={handleSubmit(registerUser)} className="space-y-5">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="fullName"
                    className="text-foreground text-sm font-medium"
                  >
                    Full name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    className="text-foreground placeholder-muted-foreground border-border bg-bg focus:ring-primary rounded-lg border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">
                      {errors.name.message}
                    </p>
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
                    type="email"
                    placeholder="you@example.com"
                    className="text-foreground placeholder-muted-foreground border-border bg-bg focus:ring-primary rounded-lg border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message}
                    </p>
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
                    type="password"
                    placeholder="••••••••"
                    className="text-foreground placeholder-muted-foreground border-border bg-bg focus:ring-primary rounded-lg border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500">
                      {errors.password.message}
                    </p>
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
                    type="password"
                    placeholder="••••••••"
                    className="text-foreground placeholder-muted-foreground border-border bg-bg focus:ring-primary rounded-lg border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
                    {...register("confirmPassword")}
                  />
                  {(errors.confirmPassword || passwordMismatchError) && (
                    <p className="text-xs text-red-500">
                      {errors.confirmPassword?.message || passwordMismatchError}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="3"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Create account
                    </>
                  )}
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
                    className="text-primary w-full"
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
