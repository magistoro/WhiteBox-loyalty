import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Payments control center</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placeholder for payment reconciliation, dispute processing, payout batches and provider health.
        </CardContent>
      </Card>
    </div>
  );
}
