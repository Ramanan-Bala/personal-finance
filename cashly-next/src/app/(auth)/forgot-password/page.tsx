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
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type ResetStep = "REQUEST" | "VERIFY" | "SUCCESS";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<ResetStep>("REQUEST");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { forgotPassword, resetPassword } = useAuth();

  const isValid = useMemo(() => {
    if (step === "REQUEST") return email.includes("@");
    if (step === "VERIFY") return otp.length === 6 && newPassword.length >= 6;
    return true;
  }, [email, otp, newPassword, step]);

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await forgotPassword(email);
      setStep("VERIFY");
    } catch (err: any) {
      setError("Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await resetPassword({ email, otp, newPassword });
      setStep("SUCCESS");
    } catch (err: any) {
      setError("Incorrect code or session expired. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-bg flex min-h-screen">
      {/* Left Panel */}
      <div className="dark:bg-card relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-emerald-500 to-emerald-600 p-12 lg:flex lg:w-1/2 dark:bg-none">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 rotate-12">
            <KeyRound className="h-32 w-32 text-white" />
          </div>
          <div className="absolute right-20 bottom-32 -rotate-12">
            <ShieldAlert className="h-32 w-32 text-white" />
          </div>
        </div>

        <CashlyLogo size="md" showWordMark variant="light" className="z-10" />

        <motion.div
          {...leftToRightVariants}
          className="relative z-10 text-white"
        >
          <h1 className="mb-4 text-4xl">Recover your account</h1>
          <p className="text-lg text-emerald-50 opacity-90">
            Forgot your password? No worries. Follow the steps to safely reset
            your credentials.
          </p>
        </motion.div>

        <div className="relative z-10 text-emerald-50 text-sm opacity-80">
          Tip: Use a strong, unique password for better security.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 flex-col relative">
        <div className="flex justify-end p-5 absolute top-5 right-5">
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
              {step === "REQUEST" && (
                <>
                  <div className="mb-8">
                    <Heading mb="2">Forgot Password</Heading>
                    <p className="text-muted-foreground sm:text-sm text-xs">
                      Enter your email address and we'll send you a recovery
                      code
                    </p>
                  </div>

                  <form onSubmit={handleRequest} className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="email"
                        className="text-foreground text-sm font-medium"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="w-full text-foreground placeholder-muted-foreground border-border bg-bg rounded-lg border pl-10 pr-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        className="w-full"
                        size="3"
                        type="submit"
                        disabled={!isValid || isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Recovery Code"
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              )}

              {step === "VERIFY" && (
                <>
                  <div className="mb-8">
                    <Heading mb="2">Verify Identity</Heading>
                    <p className="text-muted-foreground sm:text-sm text-xs">
                      Enter the 6-digit code sent to <b>{email}</b> and set your
                      new password
                    </p>
                  </div>

                  <form onSubmit={handleReset} className="space-y-5">
                    <div className="flex flex-col gap-2 text-center">
                      <label
                        htmlFor="otp"
                        className="text-foreground text-sm font-medium"
                      >
                        Recovery Code
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
                        required
                        autoFocus
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="pass"
                        className="text-foreground text-sm font-medium"
                      >
                        New Password
                      </label>
                      <input
                        id="pass"
                        type="password"
                        placeholder="Min 6 characters"
                        className="text-foreground placeholder-muted-foreground border-border bg-bg rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>

                    {error && (
                      <p className="text-xs text-red-500 text-center">
                        {error}
                      </p>
                    )}

                    <div className="space-y-3">
                      <Button
                        className="w-full"
                        size="3"
                        type="submit"
                        disabled={!isValid || isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          "Reset Password"
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => setStep("REQUEST")}
                        disabled={isLoading}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to email entry
                      </Button>
                    </div>
                  </form>
                </>
              )}

              {step === "SUCCESS" && (
                <div className="text-center py-4">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <Heading mb="2">Password Reset!</Heading>
                  <p className="text-muted-foreground mb-8">
                    Your password has been successfully updated. You can now log
                    in with your new credentials.
                  </p>
                  <Button className="w-full" size="3" asChild>
                    <Link href="/login">Go to Login</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
