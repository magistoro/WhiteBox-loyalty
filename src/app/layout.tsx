import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark twa bg-[var(--twa-bg)] text-foreground`}
      >
        <div className="twa-viewport flex flex-col min-h-[100dvh]">
          {children}
        </div>
      </body>
    </html>
  );
}
