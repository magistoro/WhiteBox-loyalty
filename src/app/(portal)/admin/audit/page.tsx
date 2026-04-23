import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAuditPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Administrative traceability</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placeholder for immutable action log: account role changes, security events, and admin operations.
        </CardContent>
      </Card>
    </div>
  );
}
