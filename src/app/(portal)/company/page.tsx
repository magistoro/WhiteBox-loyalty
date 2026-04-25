import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CompanyPortalPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Company dashboard</h1>
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Overview</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placeholder for company KPIs, subscriber growth, and offer performance.
        </CardContent>
      </Card>
    </div>
  );
}
