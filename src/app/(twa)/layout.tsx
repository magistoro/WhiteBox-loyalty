import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";

export default function TWALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex-1 overflow-x-hidden pb-24">
        <PageTransition>{children}</PageTransition>
      </main>
      <BottomNav />
    </>
  );
}
