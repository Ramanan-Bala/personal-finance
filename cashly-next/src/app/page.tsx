"use client";

import {
  bottomToTopVariants,
  CashlyLogo,
  fadeInVariants,
  leftToRightVariants,
  staggerContainerVariants,
  ThemeSwitcher,
  useAuth,
  viewPortComplete,
  viewPortOnce,
} from "@/shared";
import { Button } from "@radix-ui/themes";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ChartColumn,
  ChartPie,
  CircleCheck,
  Github,
  Linkedin,
  Lock,
  Shield,
  TrendingUp,
  Twitter,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
}

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const isNavigatingToDashboard = isAuthenticated && !isLoading;

  const features: Feature[] = [
    {
      icon: Wallet,
      title: "Manage Multiple Accounts",
      description:
        "Connect and track all your bank accounts, credit cards, and digital wallets in one secure dashboard.",
    },
    {
      icon: ChartColumn,
      title: "Track Daily Ledger",
      description:
        "Monitor every transaction with chronological views and running balances for complete financial visibility.",
    },
    {
      icon: ChartPie,
      title: "Lend & Debt Management",
      description:
        "Keep track of money you've lent or borrowed with smart reminders and settlement tracking.",
    },
    {
      icon: BarChart3,
      title: "Smart Analytics & Reports",
      description:
        "Get actionable insights with beautiful charts, spending patterns, and personalized financial recommendations.",
    },
  ];

  const stats: Stat[] = [
    { value: "50K+", label: "Active Users" },
    { value: "$2M+", label: "Tracked Monthly" },
    { value: "4.9/5", label: "User Rating" },
    { value: "99.9%", label: "Uptime" },
  ];

  const badges = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "256-bit SSL encryption protects your data",
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "Your financial data never leaves our secure servers",
    },
    {
      icon: BadgeCheck,
      title: "GDPR Compliant",
      description: "Full compliance with data protection regulations",
    },
  ];

  const footerLinks = {
    product: [
      { label: "Features", href: "#features" },
      { label: "Dashboard", href: "#" },
      { label: "Pricing", href: "#" },
    ],
    company: [
      { label: "About Us", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Careers", href: "#" },
    ],
    legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Security", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  const onGetStartedClick = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="bg-bg min-h-screen space-y-24">
      {/* Navbar */}
      <nav className="fixed top-0 right-0 left-0 z-50 backdrop-blur-sm transition-all duration-300 py-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CashlyLogo size="sm" showWordMark variant="default" />
            </div>

            <div className="hidden items-center gap-8 md:flex">
              <ThemeSwitcher />
              <Button size="3" onClick={onGetStartedClick}>
                {isLoading
                  ? "..."
                  : isAuthenticated
                    ? "Dashboard"
                    : "Get Started"}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        {...fadeInVariants}
        className="to-background relative overflow-hidden bg-linear-to-b from-emerald-200 px-6 py-24 dark:from-emerald-900"
      >
        <div className="relative z-10 container mx-auto grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div>
            <motion.div {...staggerContainerVariants}>
              <motion.div
                {...leftToRightVariants}
                className="text-foreground mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-200 px-4 py-2 dark:bg-emerald-700"
              >
                <CircleCheck className="h-4 w-4" />
                <span className="text-sm">
                  Free to start, no credit card required
                </span>
              </motion.div>

              <motion.h1
                {...leftToRightVariants}
                className="text-foreground font-bold mb-6 text-5xl lg:text-6xl"
              >
                Smart Money,
                <br />
                <span className="text-primary">Simplified.</span>
              </motion.h1>

              <motion.p
                {...leftToRightVariants}
                className="text-muted-foreground mb-8 text-xl"
              >
                Track income, expenses, and lending in one place. Take control
                of your financial future with intelligent insights and
                effortless management.
              </motion.p>

              <motion.div
                {...leftToRightVariants}
                className="flex flex-wrap gap-4"
              >
                <Button size="4" onClick={onGetStartedClick}>
                  {isLoading
                    ? "Loading..."
                    : isAuthenticated
                      ? "Dashboard"
                      : "Get Started"}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <div className="border-border mt-12 grid grid-cols-2 gap-6 border-t pt-12 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-foreground mb-1 text-2xl font-bold">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Dashboard Preview */}
          <div className="relative">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="border-border bg-bg rounded-3xl border p-8 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-700">
                    <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-100" />
                  </div>
                  <div>
                    <div className="text-foreground text-sm">Total Balance</div>
                    <div className="text-foreground text-2xl font-bold">
                      $24,850.00
                    </div>
                  </div>
                </div>
                <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-100" />
              </div>

              <div className="space-y-3">
                {[
                  { name: "Income", amount: "+$4,200", color: "emerald" },
                  { name: "Expenses", amount: "-$1,850", color: "red" },
                  { name: "Savings", amount: "+$2,350", color: "blue" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-card flex items-center justify-between rounded-lg p-3"
                  >
                    <span className="text-foreground">{item.name}</span>
                    <span
                      className={
                        item.color === "emerald"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : item.color === "red"
                            ? "text-red-600 dark:text-red-400"
                            : "text-blue-600 dark:text-blue-400"
                      }
                    >
                      {item.amount}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.35,
              }}
              className="absolute -top-6 -right-6 rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-600 p-4 shadow-xl"
            >
              <ChartPie className="h-8 w-8 text-white" />
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute -bottom-6 -left-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl dark:bg-emerald-950 dark:border-emerald-700"
            >
              <ChartColumn className="h-8 w-8 text-emerald-600" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="bg-bg px-6 pb-12">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1 } }}
            className="mb-16 text-center"
          >
            <h2 className="text-foreground mb-4 text-4xl font-bold">
              Everything you need to manage your money
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Powerful features designed to give you complete control over your
              finances
            </p>
          </motion.div>

          <motion.div
            {...staggerContainerVariants}
            {...viewPortOnce}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  {...bottomToTopVariants}
                  whileHover={{ y: -10 }}
                  className="group border-border bg-card cursor-pointer rounded-2xl border p-6 hover:shadow-xl"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-linear-to-br from-emerald-100 to-emerald-200 transition-all group-hover:from-emerald-500 group-hover:to-emerald-600">
                    <Icon className="h-7 w-7 text-emerald-600 transition-colors group-hover:text-white" />
                  </div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section className="bg-bg relative overflow-hidden px-6 pb-12">
        <div className="floating-container">
          <div className="shape square"></div>
          <div className="shape circle"></div>
          <div className="shape solid"></div>
        </div>
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.h2
            {...bottomToTopVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.5 }}
            className="text-foreground mb-6 text-4xl font-bold lg:text-5xl"
          >
            Ready to take control of your finances?
          </motion.h2>
          <motion.p
            {...bottomToTopVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.5 }}
            className="text-muted-foreground mb-10 text-xl opacity-90"
          >
            Join thousands of users who are already managing their money smarter
            with Cashly. Get started for free today.
          </motion.p>
          <motion.div
            {...bottomToTopVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.5 }}
          >
            <Button onClick={onGetStartedClick} size="4">
              {isLoading
                ? "Loading..."
                : isAuthenticated
                  ? "Dashboard"
                  : "Get Started Free"}
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Button>
          </motion.div>
          <motion.p
            {...bottomToTopVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.5 }}
            className="text-muted-foreground mt-6 text-sm"
          >
            No credit card required • Free forever plan available
          </motion.p>
        </div>
      </motion.section>

      {/* Security Section */}
      <section className="bg-bg pb-12">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            {...bottomToTopVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="text-foreground mb-2 text-2xl font-bold md:text-3xl">
              Your Security is Our Priority
            </h2>
            <p className="text-muted-foreground">
              Trusted by thousands of users worldwide
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainerVariants.variants}
            initial="hidden"
            whileInView="visible"
            {...viewPortComplete}
            className="grid grid-cols-1 gap-8 md:grid-cols-3"
          >
            {badges.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <div key={i}>
                  <motion.div
                    {...bottomToTopVariants}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="bg-emerald-100 dark:bg-emerald-900 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                      <Icon className="h-7 w-7 text-emerald-600 dark:text-emerald-300" />
                    </div>
                    <h3 className="text-foreground mb-2 text-lg font-semibold">
                      {badge.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {badge.description}
                    </p>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-muted border-t bg-card">
        <div className="container mx-auto px-6 py-12 lg:px-8">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <CashlyLogo size="md" showWordMark variant="default" />
              <p className="text-muted-foreground my-4 max-w-sm">
                Your trusted partner in personal finance management. Take
                control of your money with confidence.
              </p>
              <div className="flex items-center gap-3">
                {socialLinks.map((social, i) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={i}
                      href={social.href}
                      className="bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex h-10 w-10 items-center justify-center rounded-lg"
                      aria-label={social.label}
                    >
                      <Icon className="text-foreground h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-foreground mb-4 font-semibold">Product</h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link, i) => (
                  <li key={i}>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-foreground mb-4 font-semibold">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link, i) => (
                  <li key={i}>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-foreground mb-4 font-semibold">Legal</h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link, i) => (
                  <li key={i}>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-muted border-t pt-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-muted-foreground text-sm">
                © 2025 Cashly. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Privacy
                </button>
                <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Terms
                </button>
                <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Cookies
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
