"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminListCompanyUsers, type AdminCompanyUser } from "@/lib/api/admin-client";

export default function AdminCompaniesPage() {
  const [query, setQuery] = useState("");
  const [companies, setCompanies] = useState<AdminCompanyUser[]>([]);

  async function load() {
    setCompanies(await adminListCompanyUsers(query));
  }

  useEffect(() => {
    let ignore = false;
    void (async () => {
      const rows = await adminListCompanyUsers();
      if (!ignore) setCompanies(rows);
    })();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Companies</h1>
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Company accounts directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Search companies by name, email, uuid"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button variant="secondary" onClick={() => void load()} className="sm:min-w-28">
              Search
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Account</th>
                  <th>Email</th>
                  <th>UUID</th>
                  <th>Status</th>
                  <th>Company profile</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.uuid} className="border-t border-white/10">
                    <td className="py-2 font-medium">{c.name}</td>
                    <td className="whitespace-nowrap">{c.email}</td>
                    <td className="font-mono text-xs">{c.uuid}</td>
                    <td>{c.accountStatus}</td>
                    <td>{c.managedCompany ? c.managedCompany.name : "Not configured"}</td>
                    <td className="text-right">
                      <Button asChild variant="secondary" size="sm">
                        <Link href={`/admin/companies/${c.uuid}`}>Manage</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {companies.length === 0 && (
            <p className="pt-4 text-sm text-muted-foreground">No company accounts found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
