"use client";

import {
  CashlyLogo,
  fadeScaleInVariants,
  leftToRightVariants,
  ThemeSwitcher,
  useAuth,
} from "@/shared";
import { Button, Heading } from "@radix-ui/themes";
import {
  ChartPie,
  Fingerprint,
  Loader2,
  Lock,
  LogIn,
  PiggyBank,
  ShieldCheck,
  UserPlus,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type LoginStep = "LOGIN" | "VERIFY_2FA";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<LoginStep>("LOGIN");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login, verify2fa } = useAuth();

  const isValid = useMemo<boolean>(() => {
    if (step === "LOGIN") {
      return (
        !!email && !!password && Object.values(errors).every((error) => !error)
      );
    }
    return otp.length === 6;
  }, [email, password, otp, step, errors]);

  const validateEmail = (value: string) => {
    if (!value) return "Email is required";
    if (!value.includes("@")) return "Please enter a valid email";
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    return "";
  };

  const handleBlur = (field: string, value: string) => {
    setTouched({ ...touched, [field]: true });
    let error = "";

    if (field === "email") {
      error = validateEmail(value);
    } else if (field === "password") {
      error = validatePassword(value);
    }

    setErrors({ ...errors, [field]: error });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (step === "LOGIN") {
      const emailError = validateEmail(email);
      const passwordError = validatePassword(password);

      if (emailError || passwordError) {
        setErrors({ email: emailError, password: passwordError });
        return;
      }
      setIsLoading(true);
      try {
        const result = await login({ email, password });
        if (result && "twoFactorRequired" in result) {
          setStep("VERIFY_2FA");
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        await verify2fa({ email, otp });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const securityFeatures = [
    { icon: ShieldCheck, text: "256-bit SSL Encryption" },
    { icon: Lock, text: "Bank-Level Security" },
    { icon: Fingerprint, text: "Two-Factor Authentication" },
  ];

  return (
    <div className="bg-bg flex min-h-screen">
      {/* Left Panel */}
      <div className="dark:bg-card relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-emerald-500 to-emerald-600 p-12 lg:flex lg:w-1/2 dark:bg-none">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20">
            <ChartPie className="h-32 w-32 text-white" />
          </div>
          <div className="absolute right-20 bottom-32">
            <PiggyBank className="h-32 w-32 text-white" />
          </div>
          <div className="absolute top-1/2 left-1/3">
            <Wallet className="h-32 w-32 text-white" />
          </div>
        </div>

        <CashlyLogo size="md" showWordMark variant="light" className="z-10" />

        <motion.div
          {...leftToRightVariants}
          className="relative z-10 text-white"
        >
          <h1 className="mb-4 text-4xl">Welcome back to Cashly</h1>
          <p className="text-lg text-emerald-50 opacity-90">
            Track your finances, manage your budget, and achieve your financial
            goals with ease.
          </p>
        </motion.div>

        <div className="relative z-10 flex gap-8 text-emerald-50">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white"></div>
            <span className="text-sm">Secure & Private</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white"></div>
            <span className="text-sm">Easy to Use</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white"></div>
            <span className="text-sm">Always Free</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 flex-col relative">
        <div className="flex justify-end p-5 sm:block absolute top-5 right-5">
          <ThemeSwitcher />
        </div>

        <motion.div
          {...fadeScaleInVariants}
          className="flex flex-1 items-center justify-center p-8"
        >
          <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center lg:hidden">
              <CashlyLogo size="lg" showWordMark variant="default" />
            </div>

            <div className="border-border bg-card rounded-2xl border p-8 shadow-lg">
              {step === "LOGIN" ? (
                <>
                  <div className="mb-8">
                    <Heading mb="2">Log in to your account</Heading>
                    <p className="text-muted-foreground sm:text-sm text-xs">
                      Enter your credentials to access your dashboard
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
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
                        className="text-foreground placeholder-muted-foreground border-border bg-bg rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={(e) => handleBlur("email", e.target.value)}
                      />
                      {touched.email && errors.email && (
                        <p className="text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="password"
                          className="text-foreground text-sm font-medium"
                        >
                          Password
                        </label>
                        <Link
                          href="/forgot-password"
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="text-foreground placeholder-muted-foreground border-border bg-bg rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={(e) => handleBlur("password", e.target.value)}
                      />
                      {touched.password && errors.password && (
                        <p className="text-xs text-red-500">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      size="3"
                      type="submit"
                      disabled={!isValid || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        <>
                          <LogIn className="h-4 w-4" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </form>
                  <div className="mt-6">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="border-border w-full border-t"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-card text-muted-foreground px-4">
                          New to Cashly?
                        </span>
                      </div>
                    </div>

                    <Link href="/register">
                      <Button
                        className="w-full text-primary"
                        color="gray"
                        variant="soft"
                        size="3"
                      >
                        <UserPlus className="h-4 w-4" />
                        Create Account
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <Heading mb="2">Two-Factor Authentication</Heading>
                    <p className="text-muted-foreground sm:text-sm text-xs">
                      We've sent a 6-digit verification code to your email
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="otp"
                        className="text-foreground text-center text-sm font-medium"
                      >
                        Verification Code
                      </label>
                      <input
                        id="otp"
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        className="text-foreground placeholder-muted-foreground border-border bg-bg rounded-lg border px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                        }
                        autoFocus
                      />
                    </div>
                    <Button
                      className="w-full"
                      size="3"
                      type="submit"
                      disabled={!isValid || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Continue"
                      )}
                    </Button>
                  </form>
                </>
              )}
              {/* Security Features */}
              <div className="pt-8 flex flex-wrap items-center justify-center gap-6">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <feature.icon className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground text-xs">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
