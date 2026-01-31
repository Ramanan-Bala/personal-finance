import { AuthProvider, Toaster } from "@/shared";
import { FontProvider } from "@/shared/providers/font-provider";
import { ThemeProvider } from "@/shared/providers/theme-provider";
import { Theme } from "@radix-ui/themes";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cashly - Personal Finance Management",
  description:
    "Track your finances, manage your budget, and achieve your financial goals with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Theme accentColor="green" radius="large">
          <ThemeProvider>
            <AuthProvider>
              <FontProvider initialFont="source-sans">
                {children}
                <Toaster />
              </FontProvider>
            </AuthProvider>
          </ThemeProvider>
        </Theme>
      </body>
    </html>
  );
}
