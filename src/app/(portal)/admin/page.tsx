import { Activity, BellRing, ChartColumnIncreasing, CircleDollarSign, ClipboardList, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminPortalPage() {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/15 via-emerald-500/10 to-sky-500/5 p-6 lg:p-8">
        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" aria-hidden />
        <div className="absolute -bottom-24 right-20 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl" aria-hidden />
        <div className="relative z-10 space-y-3">
          <Badge variant="secondary" className="border-white/20 bg-white/10 text-white">
            WhiteBox Admin Dashboard
          </Badge>
          <h1 className="max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            Good morning team. Here is the current platform pulse.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            This is a visual preview dashboard. Metrics are mock for now and ready to be wired later.
          </p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Active users", value: "12,840", delta: "+12.4%", icon: Users },
          { title: "Revenue today", value: "$7,230", delta: "+8.1%", icon: CircleDollarSign },
          { title: "Security score", value: "98.2%", delta: "Stable", icon: ShieldCheck },
          { title: "Open incidents", value: "03", delta: "-2", icon: BellRing },
        ].map((item) => (
          <Card key={item.title} className="glass border-white/10">
            <CardContent className="flex items-start justify-between py-5">
              <div>
                <p className="text-xs text-muted-foreground">{item.title}</p>
                <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                <p className="mt-1 text-xs text-emerald-300">{item.delta}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                <item.icon className="h-5 w-5 text-cyan-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ChartColumnIncreasing className="h-4 w-4 text-cyan-300" />
              Weekly performance trend
            </CardTitle>
            <CardDescription>Conversion, retention and partner activity overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid h-44 grid-cols-7 items-end gap-2">
              {[52, 66, 58, 78, 62, 86, 80].map((h, i) => (
                <div
                  key={i}
                  className="rounded-md bg-gradient-to-t from-cyan-500/70 to-emerald-400/80"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4 text-cyan-300" />
              Team focus today
            </CardTitle>
            <CardDescription>Priority board preview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              "Onboard 3 new partners in Food category",
              "Review flagged payment disputes",
              "Prepare compliance report draft",
              "Validate new QR subscription flow",
            ].map((task, idx) => (
              <div key={task} className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="mt-0.5 text-xs text-cyan-300">0{idx + 1}</span>
                <p>{task}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="glass border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Product readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Admin panel structure is now desktop-first and ready for functional wiring.
          </CardContent>
        </Card>
        <Card className="glass border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-cyan-300" />
              System health
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            No critical alerts. API and auth modules are nominal in preview mode.
          </CardContent>
        </Card>
        <Card className="glass border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-cyan-300" />
              Team alignment
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Shared dashboard helps operations, compliance and support work from one view.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
