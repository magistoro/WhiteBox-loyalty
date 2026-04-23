import type { Metadata } from "next";
import { Handshake, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Partnership | Loyalty Wallet",
  description: "Partnership opportunities with WhiteBox",
};

const benefits = [
  "Co-branded promotions for your audience",
  "Shared loyalty campaigns and bonus mechanics",
  "Partner visibility in WhiteBox discovery sections",
];

export default function PartnershipPage() {
  return (
    <article className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Partnership</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Grow together with campaigns, referral mechanics and shared rewards.
      </p>
      <section className="glass rounded-xl border border-white/10 p-4">
        <div className="mb-4 flex items-center gap-2">
          <Handshake className="h-5 w-5 text-primary" />
          <p className="text-sm font-semibold">Why partner with WhiteBox</p>
        </div>
        <ul className="space-y-2">
          {benefits.map((item) => (
            <li key={item} className="text-muted-foreground flex items-start gap-2 text-sm">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Button className="mt-4 w-full">Request partnership</Button>
      </section>
    </article>
  );
}
