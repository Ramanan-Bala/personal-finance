"use client";

import {
  CashlyLogo,
  CTASection,
  fadeInVariants,
  FeaturesSection,
  FooterSection,
  HeroSection,
  ThemeSwitcher,
  useAuth,
} from "@/shared";
import { Button } from "@radix-ui/themes";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const onGetStartedClick = () => {
    router.push(isAuthenticated ? "/dashboard" : "/login");
  };

  return (
    <div className="bg-bg min-h-screen space-y-24">
      <nav className="fixed top-0 right-0 left-0 z-50 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-sm transition-all duration-300 sm:px-0">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <CashlyLogo size="sm" showWordMark variant="default" />
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

      <motion.section
        {...fadeInVariants}
        className="to-background relative overflow-hidden bg-linear-to-b from-emerald-200 px-4 py-24 dark:from-emerald-900"
      >
        <HeroSection
          onGetStartedClick={onGetStartedClick}
          isLoading={isLoading}
          isAuthenticated={isAuthenticated}
        />
      </motion.section>

      <FeaturesSection />
      <CTASection
        onGetStartedClick={onGetStartedClick}
        isLoading={isLoading}
        isAuthenticated={isAuthenticated}
      />
      <FooterSection />
    </div>
  );
}
