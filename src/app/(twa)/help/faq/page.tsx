import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Loyalty Wallet",
  description: "Frequently asked questions",
};

const items = [
  {
    q: "How do I earn points?",
    a: "Make qualifying purchases at partner locations, scan your QR code at checkout when prompted, or complete subscription benefits described in each offer.",
  },
  {
    q: "Where can I see my balance?",
    a: "Your total balance appears on the Home screen. Per-partner progress is shown on partner cards and in your wallet.",
  },
  {
    q: "How do I redeem rewards?",
    a: "Open a partner’s loyalty card, check your progress toward the next reward, and follow the in-app instructions when you’re eligible for a redemption.",
  },
  {
    q: "Is my data secure?",
    a: "We use industry-standard practices to protect your account. Review our Privacy Policy for details on what we collect and how we use it.",
  },
];

export default function FaqPage() {
  return (
    <article className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">FAQ</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Quick answers to common questions about Loyalty Wallet.
      </p>
      <ul className="space-y-6">
        {items.map(({ q, a }) => (
          <li key={q} className="glass rounded-xl border border-white/10 p-4">
            <h2 className="mb-2 text-sm font-semibold">{q}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}
