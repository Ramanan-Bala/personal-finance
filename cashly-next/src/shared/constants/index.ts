import {
  Banknote,
  Briefcase,
  Car,
  Coffee,
  CreditCard,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Home as HomeIcon,
  Lightbulb,
  ShoppingBag,
  Tag,
  Utensils,
} from "lucide-react";

export const ICON_MAP: Record<
  string,
  React.ComponentType<{ size?: number | string; className?: string }>
> = {
  Banknote,
  Briefcase,
  Car,
  Coffee,
  CreditCard,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Home: HomeIcon,
  Lightbulb,
  ShoppingBag,
  Utensils,
  Tag,
};
