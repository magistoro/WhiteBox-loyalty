import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminCompliancePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Compliance</h1>
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Rights and obligations</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placeholder for moderation workflows, policy enforcement, legal holds, and user rights requests.
        </CardContent>
      </Card>
    </div>
  );
}
