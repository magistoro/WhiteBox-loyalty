import type { Metadata } from "next";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact | Loyalty Wallet",
  description: "Contact support",
};

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Contact</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        We’re here to help with account issues, partners, and technical problems.
      </p>
      <div className="glass space-y-4 rounded-xl border border-white/10 p-5">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-muted-foreground text-sm">
              support@loyaltywallet.example — we aim to reply within 2 business days.
            </p>
          </div>
        </div>
        <p className="text-muted-foreground border-t border-white/10 pt-4 text-sm leading-relaxed">
          For urgent security concerns (e.g. suspected unauthorized access), mention
          “Security” in the subject line so we can prioritize your message.
        </p>
      </div>
    </article>
  );
}
