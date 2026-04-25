import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";

export default function TWALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="twa-viewport flex min-h-[100dvh] flex-col">
      <main className="min-w-0 flex-1 overflow-x-hidden pb-24">
        <PageTransition>{children}</PageTransition>
      </main>
      <BottomNav />
    </div>
  );
}
