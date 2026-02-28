"use client";

import { CashlyLogo } from "@/shared";
import { Github, Linkedin, Twitter } from "lucide-react";

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

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-foreground mb-4 font-semibold">{title}</h3>
      <ul className="space-y-2">
        {links.map((link, i) => (
          <li key={i}>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FooterSection() {
  return (
    <footer className="border-muted border-t bg-card">
      <div className="container mx-auto px-6 py-12 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <CashlyLogo size="md" showWordMark variant="default" />
            <p className="text-muted-foreground my-4 max-w-sm">
              Your trusted partner in personal finance management. Take control
              of your money with confidence.
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
          <FooterLinkGroup title="Product" links={footerLinks.product} />
          <FooterLinkGroup title="Company" links={footerLinks.company} />
          <FooterLinkGroup title="Legal" links={footerLinks.legal} />
        </div>
        <div className="border-muted border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-muted-foreground text-sm">
              &copy; 2025 Cashly. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {["Privacy", "Terms", "Cookies"].map((item) => (
                <button
                  key={item}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
