"use client";

import { leftToRightVariants, staggerContainerVariants } from "@/shared";
import { Button } from "@radix-ui/themes";
import {
  ArrowRight,
  ChartColumn,
  ChartPie,
  CircleCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onGetStartedClick: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "$2M+", label: "Tracked Monthly" },
  { value: "4.9/5", label: "User Rating" },
  { value: "99.9%", label: "Uptime" },
];

export function HeroSection({
  onGetStartedClick,
  isLoading,
  isAuthenticated,
}: HeroSectionProps) {
  const buttonLabel = isLoading
    ? "Loading..."
    : isAuthenticated
      ? "Dashboard"
      : "Get Started";

  return (
    <div className="relative z-10 container mx-auto grid items-center gap-12 lg:grid-cols-2">
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
            className="text-foreground mb-6 text-5xl font-bold lg:text-6xl"
          >
            Smart Money,
            <br />
            <span className="text-primary">Simplified.</span>
          </motion.h1>

          <motion.p
            {...leftToRightVariants}
            className="text-muted-foreground mb-8 text-xl"
          >
            Track income, expenses, and lending in one place. Take control of
            your financial future with intelligent insights and effortless
            management.
          </motion.p>

          <motion.div {...leftToRightVariants} className="flex flex-wrap gap-4">
            <Button size="4" onClick={onGetStartedClick}>
              {buttonLabel}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>

        <div className="border-border mt-12 grid grid-cols-2 gap-6 border-t pt-12 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={i}>
              <div className="text-foreground mb-1 text-2xl font-bold">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
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
          className="absolute -bottom-6 -left-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-emerald-700 dark:bg-emerald-950"
        >
          <ChartColumn className="h-8 w-8 text-emerald-600" />
        </motion.div>
      </div>
    </div>
  );
}
