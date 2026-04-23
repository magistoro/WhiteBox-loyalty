"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CreditCard, Database, FileCheck, LayoutDashboard, Shield, Tag, Users } from "lucide-react";
import { WhiteBoxLogo } from "@/components/brand/WhiteBoxLogo";
import { PageTransition } from "@/components/PageTransition";
import { cn } from "@/lib/utils";

const adminMenu = [
  {
    group: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    group: "Users",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/companies", label: "Companies", icon: Building2 },
      { href: "/admin/categories", label: "Categories", icon: Tag },
    ],
  },
  {
    group: "Subscriptions",
    items: [{ href: "/admin/subscriptions", label: "Statistics & UUID lookup", icon: LayoutDashboard }],
  },
  {
    group: "Operations",
    items: [
      { href: "/admin/payments", label: "Payments", icon: CreditCard },
      { href: "/admin/compliance", label: "Compliance", icon: FileCheck },
      { href: "/admin/audit", label: "Audit log", icon: Shield },
      { href: "/admin/database", label: "Database map", icon: Database },
    ],
  },
];

const companyMenu = [
  { href: "/company", label: "Dashboard", icon: LayoutDashboard },
  { href: "/company/payments", label: "Payments", icon: CreditCard },
  { href: "/company/compliance", label: "Compliance", icon: FileCheck },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const menu = isAdmin
    ? adminMenu.flatMap((g) => g.items)
    : companyMenu;

  function isItemActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="mx-auto grid w-full max-w-[1600px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-muted/10 p-4 lg:sticky lg:top-0 lg:h-[100dvh] lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <Link href={isAdmin ? "/admin" : "/company"} className="mb-5 flex items-center gap-3">
            <WhiteBoxLogo />
            <div>
              <p className="text-xl font-semibold tracking-tight">WhiteBox</p>
              <p className="text-xs text-muted-foreground">{isAdmin ? "Admin workspace" : "Company workspace"}</p>
            </div>
          </Link>

          {isAdmin ? (
            <div className="space-y-4">
              {adminMenu.map((section) => (
                <div key={section.group}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {section.group}
                  </p>
                  <div className="flex flex-wrap gap-1.5 lg:block lg:space-y-1 lg:gap-0">
                    {section.items.map(({ href, label, icon: Icon }) => {
                      const active = isItemActive(href);
                      return (
                        <Link
                          key={href}
                          href={href}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors lg:flex",
                            active ? "bg-primary/15 text-primary" : "hover:bg-muted/20 text-muted-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {menu.map(({ href, label, icon: Icon }) => {
                const active = isItemActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors lg:flex",
                      active ? "bg-primary/15 text-primary" : "hover:bg-muted/20 text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </aside>

        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
