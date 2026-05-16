"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import {
  adminCreateAccount,
  adminListUsers,
  type AdminRole,
  type AdminUserRow,
  type AdminUsersResponse,
} from "@/lib/api/admin-client";

type Role = AdminRole;
type UserSort = "name" | "email" | "role" | "status" | "createdAt";

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("CLIENT");
  const [expandedUserUuid, setExpandedUserUuid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<AdminUsersResponse>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    sortBy: "createdAt",
    sortDir: "desc",
  });
  const [sortBy, setSortBy] = useState<UserSort>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  async function load(opts?: {
    search?: string;
    nextPage?: number;
    nextSortBy?: UserSort;
    nextSortDir?: "asc" | "desc";
  }) {
    setLoading(true);
    const nextPage = opts?.nextPage ?? page;
    const nextSortBy = opts?.nextSortBy ?? sortBy;
    const nextSortDir = opts?.nextSortDir ?? sortDir;
    const data = await adminListUsers({
      query: opts?.search ?? query,
      page: nextPage,
      limit: meta.limit,
      sortBy: nextSortBy,
      sortDir: nextSortDir,
    });
    if (!data) {
      setUsers([]);
      setMeta((prev) => ({ ...prev, items: [], total: 0, totalPages: 0, page: 1 }));
      setLoading(false);
      return;
    }
    setUsers(data.items);
    setMeta(data);
    setPage(data.page);
    setSortBy(data.sortBy);
    setSortDir(data.sortDir);
    setLoading(false);
  }

  useEffect(() => {
    void load({ nextPage: 1, nextSortBy: "createdAt", nextSortDir: "desc" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSort(column: UserSort) {
    const nextDir: "asc" | "desc" = column === sortBy && sortDir === "asc" ? "desc" : "asc";
    void load({ nextPage: 1, nextSortBy: column, nextSortDir: nextDir });
  }

  async function onCreate() {
    setCreating(true);
    const res = await adminCreateAccount({ name, email, password, role });
    setCreating(false);
    if (!res.ok) return;
    setName("");
    setEmail("");
    setPassword("");
    setRole("CLIENT");
    await load({ nextPage: 1 });
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
            <SelectField value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="CLIENT">CLIENT</option>
              <option value="COMPANY">COMPANY</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="SUPPORT">SUPPORT</option>
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
        <CardContent className="space-y-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Search by name, email, uuid"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button variant="secondary" onClick={() => void load({ search: query, nextPage: 1 })} className="sm:min-w-28">
              Search
            </Button>
          </div>

          {loading && <p className="text-sm text-muted-foreground">Loading users...</p>}

          {!loading && users.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pl-3">
                      <button type="button" onClick={() => onSort("name")} className="inline-flex items-center gap-1 hover:text-foreground">
                        Name
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    <th>
                      <button type="button" onClick={() => onSort("email")} className="inline-flex items-center gap-1 hover:text-foreground">
                        Email
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    <th>
                      <button type="button" onClick={() => onSort("role")} className="inline-flex items-center gap-1 hover:text-foreground">
                        Role
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    <th>
                      <button type="button" onClick={() => onSort("status")} className="inline-flex items-center gap-1 hover:text-foreground">
                        Status
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    <th>
                      <button type="button" onClick={() => onSort("createdAt")} className="inline-flex items-center gap-1 hover:text-foreground">
                        Created
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    <th className="pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const expanded = expandedUserUuid === u.uuid;
                    return (
                      <Fragment key={u.uuid}>
                        <tr className="border-t border-white/10">
                          <td className="py-2 pl-3 font-medium">{u.name}</td>
                          <td className="whitespace-nowrap">{u.email}</td>
                          <td>
                            <Badge variant="secondary" className="text-xs">{u.role}</Badge>
                          </td>
                          <td>
                            <Badge variant={u.accountStatus === "ACTIVE" ? "default" : "destructive"} className="text-xs">
                              {u.accountStatus}
                            </Badge>
                          </td>
                          <td className="whitespace-nowrap text-xs text-muted-foreground">
                            {new Date(u.createdAt).toLocaleString("ru-RU")}
                          </td>
                          <td className="pr-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedUserUuid((prev) => (prev === u.uuid ? null : u.uuid))}
                              >
                                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                              <Button asChild variant="secondary" size="sm">
                                <Link href={`/admin/users/${u.uuid}`}>Open profile</Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="border-t border-white/5 bg-muted/10">
                            <td colSpan={6} className="px-3 py-3">
                              <div className="rounded-lg border border-white/10 bg-background/40 p-2.5">
                                <p className="text-[11px] text-muted-foreground">UUID</p>
                                <p className="font-mono text-xs">{u.uuid}</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && users.length === 0 && (
            <p className="pt-4 text-sm text-muted-foreground">No users found for this search.</p>
          )}

          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Showing {users.length} of {meta.total} users · page {meta.page} / {Math.max(1, meta.totalPages)}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" disabled={meta.page <= 1} onClick={() => void load({ nextPage: meta.page - 1 })}>
                Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={meta.page >= Math.max(1, meta.totalPages)}
                onClick={() => void load({ nextPage: meta.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

