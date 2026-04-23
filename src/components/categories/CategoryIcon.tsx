"use client";

import {
  Baby,
  BookOpen,
  Car,
  Circle,
  Coffee,
  Dumbbell,
  Film,
  GraduationCap,
  Grid2x2,
  HeartPulse,
  Home,
  PawPrint,
  Pill,
  Plane,
  Scissors,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Trophy,
  Truck,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";

type Props = {
  iconName: string;
  className?: string;
};

const iconMap = {
  Baby,
  BookOpen,
  Car,
  Circle,
  Coffee,
  Dumbbell,
  Film,
  GraduationCap,
  Grid2x2,
  HeartPulse,
  Home,
  PawPrint,
  Pill,
  Plane,
  Scissors,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Trophy,
  Truck,
  UtensilsCrossed,
  Wrench,
} as const;

export function CategoryIcon({ iconName, className }: Props) {
  const Icon = iconMap[iconName as keyof typeof iconMap] ?? Circle;
  return <Icon className={className} />;
}
