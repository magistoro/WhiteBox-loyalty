"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { adminCreateAccount, adminListUsers, type AdminUserRow } from "@/lib/api/admin-client";

type Role = "CLIENT" | "COMPANY" | "ADMIN";

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("CLIENT");

  async function load() {
    setUsers(await adminListUsers(undefined, query));
  }

  useEffect(() => {
    let ignore = false;
    void (async () => {
      const rows = await adminListUsers();
      if (!ignore) setUsers(rows);
    })();
    return () => {
      ignore = true;
    };
  }, []);

  async function onCreate() {
    setCreating(true);
    const res = await adminCreateAccount({ name, email, password, role });
    setCreating(false);
    if (!res.ok) return;
    setName("");
    setEmail("");
    setPassword("");
    setRole("CLIENT");
    await load();
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Users</h1>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Create account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 xl:grid-cols-[minmax(170px,1fr)_minmax(220px,1.2fr)_minmax(190px,1fr)_minmax(230px,0.9fr)]">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Temporary password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <SelectField
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="CLIENT">CLIENT</option>
              <option value="COMPANY">COMPANY</option>
              <option value="ADMIN">ADMIN</option>
            </SelectField>
            <Button
              onClick={onCreate}
              disabled={creating || !name || !email || password.length < 8}
              className="sm:min-w-24"
            >
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Search and user records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Search by name, email, uuid"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button variant="secondary" onClick={load} className="sm:min-w-28">
              Search
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>UUID</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.uuid} className="border-t border-white/10">
                    <td className="py-2 font-medium">{u.name}</td>
                    <td className="whitespace-nowrap">{u.email}</td>
                    <td className="font-mono text-xs">{u.uuid}</td>
                    <td>
                      <Badge variant="secondary" className="text-xs">{u.role}</Badge>
                    </td>
                    <td>
                      <Badge variant={u.accountStatus === "ACTIVE" ? "default" : "destructive"} className="text-xs">
                        {u.accountStatus}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <Button asChild variant="secondary" size="sm">
                        <Link href={`/admin/users/${u.uuid}`}>Open profile</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <p className="pt-4 text-sm text-muted-foreground">No users found for this search.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
