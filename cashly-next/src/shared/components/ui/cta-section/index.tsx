"use client";

import { bottomToTopVariants } from "@/shared";
import { Button } from "@radix-ui/themes";
import { ArrowRight, BadgeCheck, Lock, Shield } from "lucide-react";
import { motion } from "motion/react";

interface CTASectionProps {
  onGetStartedClick: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

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

export function CTASection({
  onGetStartedClick,
  isLoading,
  isAuthenticated,
}: CTASectionProps) {
  const buttonLabel = isLoading
    ? "Loading..."
    : isAuthenticated
      ? "Dashboard"
      : "Get Started Free";

  return (
    <>
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
              {buttonLabel}
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
            No credit card required &bull; Free forever plan available
          </motion.p>
        </div>
      </motion.section>

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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {badges.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={i}
                  {...bottomToTopVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ amount: 0.5 }}
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
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
