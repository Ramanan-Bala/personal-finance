import { icons, Tag } from "lucide-react";

export const ICON_MAP = new Proxy(
  {},
  {
    get(_target, prop: string) {
      if (prop in icons) return icons[prop as keyof typeof icons];
      return Tag;
    },
    has(_target, prop: string) {
      return prop in icons;
    },
  },
) as Record<
  string,
  React.ComponentType<{ size?: number | string; className?: string }>
>;

export const CARD_COLOR_MAP = {
  gray: {
    bg: "bg-gray-400/5",
    border: "border-gray-400/10",
    iconBg: "bg-gray-400/20",
    text: "text-gray-400",
  },
  blue: {
    bg: "bg-blue-400/5",
    border: "border-blue-400/10",
    iconBg: "bg-blue-400/20",
    text: "text-blue-400",
  },
  green: {
    bg: "bg-emerald-400/5",
    border: "border-emerald-400/10",
    iconBg: "bg-emerald-400/20",
    text: "text-emerald-400",
  },
  red: {
    bg: "bg-red-400/5",
    border: "border-red-400/10",
    iconBg: "bg-red-400/20",
    text: "text-red-400",
  },
  orange: {
    bg: "bg-orange-400/5",
    border: "border-orange-400/10",
    iconBg: "bg-orange-400/20",
    text: "text-orange-400",
  },
};
