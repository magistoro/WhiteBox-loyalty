import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CompanyCompliancePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Company compliance</h1>
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Policy and obligations</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placeholder for contract obligations, moderation cases, and policy guidance for partners.
        </CardContent>
      </Card>
    </div>
  );
}
