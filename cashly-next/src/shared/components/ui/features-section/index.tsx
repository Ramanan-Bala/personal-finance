"use client";

import {
  bottomToTopVariants,
  staggerContainerVariants,
  viewPortOnce,
} from "@/shared";
import { BarChart3, ChartColumn, ChartPie, Wallet } from "lucide-react";
import { motion } from "motion/react";

const features = [
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

export function FeaturesSection() {
  return (
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
  );
}
