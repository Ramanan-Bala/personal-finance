import { AuthProvider, Toaster } from "@/shared";
import Eruda from "@/shared/components/eruda";
import { ServiceWorkerRegister } from "@/shared/components/sw-register";
import { FontProvider } from "@/shared/providers/font-provider";
import { ThemeProvider } from "@/shared/providers/theme-provider";
import { Theme } from "@radix-ui/themes";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cashly - Personal Finance Management",
  description:
    "Track your finances, manage your budget, and achieve your financial goals with ease.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cashly",
  },
};

export const viewport: Viewport = {
  themeColor: "#30a46c",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
      </head>
      <body>
        <Eruda />
        <Theme accentColor="green" radius="large">
          <ThemeProvider>
            <AuthProvider>
              <FontProvider initialFont="source-sans">
                {children}
                <Toaster />
                <ServiceWorkerRegister />
              </FontProvider>
            </AuthProvider>
          </ThemeProvider>
        </Theme>
        <Analytics />
      </body>
    </html>
  );
}
