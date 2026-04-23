import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CompanyPaymentsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Company payments</h1>
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Settlements and payouts</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placeholder for payout status, invoices, and reconciliation for partner companies.
        </CardContent>
      </Card>
    </div>
  );
}
