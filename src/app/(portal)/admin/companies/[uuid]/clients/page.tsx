"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  adminListCompanyClients,
  type AdminCompanyClientRow, type AdminCompanyClientsResponse,
} from "@/lib/api/admin-client";

function fmt(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function fmtDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "n/a";
  return d.toLocaleString("ru-RU");
}

export default function AdminCompanyClientsPage() {
  const params = useParams<{ uuid: string }>();
  const companyUserUuid = params.uuid;

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AdminCompanyClientRow[]>([]);
  const [meta, setMeta] = useState<AdminCompanyClientsResponse>({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    sortBy: "updatedAt",
    sortDir: "desc",
  });
  const [error, setError] = useState<string | null>(null);
  const [expandedUserUuid, setExpandedUserUuid] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<AdminCompanyClientsResponse["sortBy"]>("updatedAt");
  const [sortDir, setSortDir] = useState<AdminCompanyClientsResponse["sortDir"]>("desc");

  async function load(opts?: { search?: string; nextPage?: number; nextSortBy?: AdminCompanyClientsResponse["sortBy"]; nextSortDir?: AdminCompanyClientsResponse["sortDir"] }) {
    setLoading(true);
    const nextPage = opts?.nextPage ?? page;
    const nextSortBy = opts?.nextSortBy ?? sortBy;
    const nextSortDir = opts?.nextSortDir ?? sortDir;
    const res = await adminListCompanyClients(companyUserUuid, {
      query: opts?.search ?? query,
      page: nextPage,
      limit: meta.limit,
      sortBy: nextSortBy,
      sortDir: nextSortDir,
    });
    if (!res.ok) {
      setError(String(res.message));
      setRows([]);
      setLoading(false);
      return;
    }
    setRows(res.data.items);
    setMeta(res.data);
    setPage(res.data.page);
    setSortBy(res.data.sortBy);
    setSortDir(res.data.sortDir);
    setError(null);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await adminListCompanyClients(companyUserUuid, {
        page: 1,
        limit: 20,
        sortBy: "updatedAt",
        sortDir: "desc",
      });
      if (cancelled) return;
      if (!res.ok) {
        setError(String(res.message));
        setRows([]);
        setLoading(false);
        return;
      }
      setRows(res.data.items);
      setMeta(res.data);
      setPage(res.data.page);
      setSortBy(res.data.sortBy);
      setSortDir(res.data.sortDir);
      setError(null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [companyUserUuid]);

  function onSort(column: AdminCompanyClientsResponse["sortBy"]) {
    const nextDir: AdminCompanyClientsResponse["sortDir"] =
      column === sortBy && sortDir === "asc" ? "desc" : "asc";
    void load({ nextPage: 1, nextSortBy: column, nextSortDir: nextDir });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
            <Link href={`/admin/companies/${companyUserUuid}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to company workspace
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Company clients</h1>
        </div>
        <Badge variant="outline" className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {rows.length} clients
        </Badge>
      </div>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Search and client records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by name, email, uuid"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button variant="secondary" onClick={() => void load({ search: query, nextPage: 1 })} className="sm:min-w-28">
              Search
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {loading && <p className="text-sm text-muted-foreground">Loading clients...</p>}

          {!loading && (
            <div className="overflow-x-auto">
              <table className="min-w-[1080px] w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2">
                      <button type="button" onClick={() => onSort("name")} className="inline-flex items-center gap-1 hover:text-foreground">
                        Client
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
                      <button type="button" onClick={() => onSort("balance")} className="inline-flex items-center gap-1 hover:text-foreground">
                        Balance
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    <th>
                      <button type="button" onClick={() => onSort("earned")} className="inline-flex items-center gap-1 hover:text-foreground">
                        Earned
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    <th>
                      <button type="button" onClick={() => onSort("spent")} className="inline-flex items-center gap-1 hover:text-foreground">
                        Spent
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    <th>
                      <button type="button" onClick={() => onSort("level")} className="inline-flex items-center gap-1 hover:text-foreground">
                        Level
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const expanded = expandedUserUuid === row.userUuid;
                    return (
                      <Fragment key={row.userUuid}>
                        <tr className="border-t border-white/10">
                          <td className="py-2">
                            <div className="flex flex-col">
                              <span className="font-medium">{row.name}</span>
                              <span className="font-mono text-xs text-muted-foreground">{row.userUuid}</span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap">{row.email}</td>
                          <td>{fmt(row.balance)}</td>
                          <td className="text-emerald-300">{fmt(row.totalEarnedPoints)}</td>
                          <td className="text-amber-300">{fmt(row.totalSpentPoints)}</td>
                          <td>{row.currentLevel?.levelName ?? "No level"}</td>
                          <td>
                            <Badge variant={row.accountStatus === "ACTIVE" ? "default" : "destructive"}>
                              {row.accountStatus}
                            </Badge>
                          </td>
                          <td className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setExpandedUserUuid((prev) => (prev === row.userUuid ? null : row.userUuid))
                                }
                              >
                                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                              <Button asChild size="sm" variant="secondary">
                                <Link href={`/admin/users/${row.userUuid}`}>
                                  Open
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="border-t border-white/5 bg-muted/10">
                            <td colSpan={8} className="p-3">
                              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-lg border border-white/10 bg-background/50 p-3">
                                  <p className="mb-1 text-xs text-muted-foreground">Points earned</p>
                                  <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300">
                                    <TrendingUp className="h-4 w-4" />
                                    {fmt(row.totalEarnedPoints)}
                                  </p>
                                </div>
                                <div className="rounded-lg border border-white/10 bg-background/50 p-3">
                                  <p className="mb-1 text-xs text-muted-foreground">Points spent</p>
                                  <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300">
                                    <TrendingDown className="h-4 w-4" />
                                    {fmt(row.totalSpentPoints)}
                                  </p>
                                </div>
                                <div className="rounded-lg border border-white/10 bg-background/50 p-3">
                                  <p className="mb-1 text-xs text-muted-foreground">Current level</p>
                                  <p className="text-sm font-semibold">
                                    {row.currentLevel
                                      ? `${row.currentLevel.levelName} (${row.currentLevel.cashbackPercent}%)`
                                      : "No level"}
                                  </p>
                                </div>
                                <div className="rounded-lg border border-white/10 bg-background/50 p-3">
                                  <p className="mb-1 text-xs text-muted-foreground">Company link updated</p>
                                  <p className="text-sm font-semibold">{fmtDate(row.linkUpdatedAt)}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Showing {rows.length} of {meta.total} clients · page {meta.page} / {Math.max(1, meta.totalPages)}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={meta.page <= 1}
                    onClick={() => void load({ nextPage: meta.page - 1 })}
                  >
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
              {rows.length === 0 && (
                <p className="pt-4 text-sm text-muted-foreground">
                  No clients found for this company.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
