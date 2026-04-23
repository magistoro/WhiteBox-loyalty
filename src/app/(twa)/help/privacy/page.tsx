import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Loyalty Wallet",
  description: "Privacy policy",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="text-muted-foreground mb-6 text-sm">Last updated: February 2026</p>
      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section className="glass rounded-xl border border-white/10 p-4">
          <h2 className="text-foreground mb-2 font-semibold">What we collect</h2>
          <p>
            We collect information you provide (name, email, authentication data), usage data
            related to loyalty activity, and device or app diagnostics needed to operate the
            service securely.
          </p>
        </section>
        <section className="glass rounded-xl border border-white/10 p-4">
          <h2 className="text-foreground mb-2 font-semibold">How we use data</h2>
          <p>
            Data is used to run your account, show balances and rewards, improve the product,
            comply with law, and communicate important service messages. Marketing messages
            are optional and controlled in your notification settings.
          </p>
        </section>
        <section className="glass rounded-xl border border-white/10 p-4">
          <h2 className="text-foreground mb-2 font-semibold">Sharing</h2>
          <p>
            We do not sell your personal information. We may share data with partners strictly
            to deliver loyalty benefits you choose, or with processors who help us host and
            secure the platform, under contract.
          </p>
        </section>
        <section className="glass rounded-xl border border-white/10 p-4">
          <h2 className="text-foreground mb-2 font-semibold">Your choices</h2>
          <p>
            You can update profile information, manage linked accounts, and request account
            deletion subject to legal retention requirements. Contact support for data access
            requests where applicable.
          </p>
        </section>
      </div>
    </article>
  );
}
