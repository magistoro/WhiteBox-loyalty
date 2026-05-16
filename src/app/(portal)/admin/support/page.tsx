import { Headphones, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSupportDeskPage() {
  return (
    <div className="space-y-5">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-sm text-muted-foreground">
          <Headphones className="h-4 w-4" /> Support-only workspace
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Support desk</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Safe workspace for support employees. Passport verification, finance, database and admin settings are intentionally unavailable here.
        </p>
      </div>
      <Card className="border-white/10 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5" /> Guard rails
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">No passport access</div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">No finance approvals</div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">No database/admin settings</div>
        </CardContent>
      </Card>
    </div>
  );
}
