import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loyalty Wallet | TWA",
  description: "Multi-vendor loyalty program — your points, one place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased dark twa bg-[var(--twa-bg)] text-foreground">
        {children}
      </body>
    </html>
  );
}
