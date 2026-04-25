import { Suspense } from "react";
import { HelpBackLink } from "./HelpBackLink";

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full px-4 pb-28 pt-6">
      <Suspense fallback={<div className="mb-6 h-5" aria-hidden />}>
        <HelpBackLink />
      </Suspense>
      {children}
    </div>
  );
}
