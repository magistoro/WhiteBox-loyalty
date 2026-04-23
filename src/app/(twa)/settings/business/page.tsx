import type { Metadata } from "next";
import { BarChart3, Megaphone, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "For Business | Loyalty Wallet",
  description: "Business solutions for partner brands",
};

const businessFeatures = [
  {
    title: "Loyalty campaigns",
    text: "Launch point multipliers, welcome offers and retention rewards.",
    icon: Megaphone,
  },
  {
    title: "Analytics dashboard",
    text: "Track repeat purchases, redemption rates and customer lifetime value.",
    icon: BarChart3,
  },
  {
    title: "Multi-location support",
    text: "Manage branches, teams and catalog rules in one place.",
    icon: Store,
  },
];

export default function BusinessPage() {
  return (
    <article className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">For business</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Tools for brands and merchants who want to run modern loyalty programs.
      </p>
      <div className="space-y-3">
        {businessFeatures.map(({ title, text, icon: Icon }) => (
          <section key={title} className="glass rounded-xl border border-white/10 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">{title}</h2>
            </div>
            <p className="text-muted-foreground text-sm">{text}</p>
          </section>
        ))}
      </div>
      <Button className="mt-4 w-full">Talk to sales</Button>
    </article>
  );
}
