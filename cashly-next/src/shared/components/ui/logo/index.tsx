import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showWordMark?: boolean;
  variant?: "default" | "light" | "dark";
  className?: string;
}

const sizeClasses = {
  sm: { container: "w-8 h-8", text: "text-lg", icon: "w-4 h-4" },
  md: { container: "w-10 h-10", text: "text-xl", icon: "w-5 h-5" },
  lg: { container: "w-12 h-12", text: "text-2xl", icon: "w-6 h-6" },
  xl: { container: "w-16 h-16", text: "text-3xl", icon: "w-8 h-8" },
};

const variantClasses = {
  default: {
    bg: "bg-gradient-to-br from-emerald-400 to-emerald-500",
    icon: "text-white",
  },
  light: {
    bg: "bg-gradient-to-br from-emerald-400 to-emerald-500",
    icon: "text-white",
  },
  dark: {
    bg: "bg-gradient-to-br from-emerald-400 to-emerald-500",
    icon: "text-white",
  },
};

export function CashlyLogo({
  size = "md",
  showWordMark = false,
  variant = "default",
  className = "",
}: LogoProps) {
  const currentSize = sizeClasses[size];
  const currentVariant = variantClasses[variant];

  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${currentVariant.bg}`}
      >
        <span
          className={`font-heading text-xl font-bold ${currentVariant.icon}`}
        >
          C
        </span>
      </div>
      {showWordMark && (
        <span className="font-heading text-xl font-semibold">Cashly</span>
      )}
    </Link>
  );
}
