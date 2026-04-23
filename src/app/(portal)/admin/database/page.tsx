"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Node = {
  id: string;
  title: string;
  subtitle: string;
  fields: string[];
  x: number;
  y: number;
  color: string;
};

type Edge = {
  from: string;
  to: string;
  label: string;
};

const NODE_W = 230;
const HEADER_H = 34;
const ROW_H = 22;
const PADDING = 8;

const nodes: Node[] = [
  { id: "User", title: "User", subtitle: "identity", fields: ["id", "uuid", "email", "role", "accountStatus"], x: 70, y: 80, color: "rgba(34,211,238,0.2)" },
  { id: "Category", title: "Category", subtitle: "dictionary", fields: ["id", "slug", "name", "icon"], x: 420, y: 70, color: "rgba(16,185,129,0.22)" },
  { id: "Company", title: "Company", subtitle: "partner", fields: ["id", "slug", "name", "categoryId"], x: 760, y: 80, color: "rgba(56,189,248,0.22)" },
  { id: "Subscription", title: "Subscription", subtitle: "catalog", fields: ["id", "uuid", "slug", "companyId?", "categoryId?"], x: 1090, y: 80, color: "rgba(99,102,241,0.22)" },
  { id: "UserFavoriteCategory", title: "UserFavoriteCategory", subtitle: "pivot", fields: ["id", "userId", "categoryId"], x: 260, y: 360, color: "rgba(20,184,166,0.22)" },
  { id: "UserCompany", title: "UserCompany", subtitle: "pivot", fields: ["id", "userId", "companyId", "balance"], x: 630, y: 360, color: "rgba(217,70,239,0.2)" },
  { id: "UserSubscription", title: "UserSubscription", subtitle: "pivot", fields: ["id", "userId", "subscriptionId", "status"], x: 980, y: 360, color: "rgba(139,92,246,0.22)" },
  { id: "RefreshToken", title: "RefreshToken", subtitle: "session", fields: ["id", "tokenHash", "userId", "revokedAt?"], x: 120, y: 610, color: "rgba(251,191,36,0.22)" },
  { id: "OAuthAccount", title: "OAuthAccount", subtitle: "federation", fields: ["id", "provider", "providerAccountId", "userId"], x: 460, y: 610, color: "rgba(251,146,60,0.22)" },
];

const edges: Edge[] = [
  { from: "Category", to: "Company", label: "1:N" },
  { from: "Category", to: "Subscription", label: "1:N" },
  { from: "Company", to: "Subscription", label: "1:N" },
  { from: "User", to: "UserFavoriteCategory", label: "1:N" },
  { from: "Category", to: "UserFavoriteCategory", label: "1:N" },
  { from: "User", to: "UserCompany", label: "1:N" },
  { from: "Company", to: "UserCompany", label: "1:N" },
  { from: "User", to: "UserSubscription", label: "1:N" },
  { from: "Subscription", to: "UserSubscription", label: "1:N" },
  { from: "User", to: "RefreshToken", label: "1:N" },
  { from: "User", to: "OAuthAccount", label: "1:N" },
];

function nodeHeight(node: Node) {
  return HEADER_H + node.fields.length * ROW_H + PADDING * 2;
}

export default function AdminDatabasePage() {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 36, y: 24 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), []);

  function zoomIn() {
    setZoom((z) => Math.min(2.2, Number((z + 0.1).toFixed(2))));
  }

  function zoomOut() {
    setZoom((z) => Math.max(0.55, Number((z - 0.1).toFixed(2))));
  }

  function resetView() {
    setZoom(1);
    setOffset({ x: 36, y: 24 });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Database map</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={zoomOut}>
            <Minus className="h-4 w-4" />
            Zoom out
          </Button>
          <Button variant="secondary" size="sm" onClick={zoomIn}>
            <Plus className="h-4 w-4" />
            Zoom in
          </Button>
          <Button variant="outline" size="sm" onClick={resetView}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Prisma schema visualizer</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="relative h-[72vh] min-h-[540px] overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.09)_1px,transparent_0)] [background-size:24px_24px]"
            onMouseDown={(e) => setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })}
            onMouseMove={(e) => {
              if (!dragStart) return;
              setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
            }}
            onMouseUp={() => setDragStart(null)}
            onMouseLeave={() => setDragStart(null)}
          >
            <svg className="absolute inset-0 h-full w-full">
              <g transform={`translate(${offset.x},${offset.y}) scale(${zoom})`}>
                {edges.map((edge) => {
                  const from = byId.get(edge.from);
                  const to = byId.get(edge.to);
                  if (!from || !to) return null;
                  const x1 = from.x + NODE_W / 2;
                  const y1 = from.y + nodeHeight(from);
                  const x2 = to.x + NODE_W / 2;
                  const y2 = to.y;
                  const cx1 = x1;
                  const cy1 = y1 + 80;
                  const cx2 = x2;
                  const cy2 = y2 - 80;
                  const midX = (x1 + x2) / 2;
                  const midY = (y1 + y2) / 2;
                  return (
                    <g key={`${edge.from}-${edge.to}`}>
                      <path
                        d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                        fill="none"
                        stroke="rgba(186,230,253,0.45)"
                        strokeWidth="1.5"
                      />
                      <rect x={midX - 18} y={midY - 10} width="36" height="20" rx="6" fill="rgba(15,23,42,0.8)" />
                      <text x={midX} y={midY + 4} textAnchor="middle" fontSize="10" fill="rgba(224,242,254,0.95)">
                        {edge.label}
                      </text>
                    </g>
                  );
                })}

                {nodes.map((node) => (
                  <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                    <rect width={NODE_W} height={nodeHeight(node)} rx="12" fill="rgba(2,6,23,0.85)" stroke="rgba(255,255,255,0.13)" />
                    <rect width={NODE_W} height={HEADER_H + 2} rx="12" fill={node.color} />
                    <text x="14" y="21" fill="white" fontSize="13" fontWeight="700">{node.title}</text>
                    <text x="14" y="33" fill="rgba(203,213,225,0.95)" fontSize="10">{node.subtitle}</text>
                    {node.fields.map((field, i) => (
                      <g key={field}>
                        <line
                          x1={0}
                          x2={NODE_W}
                          y1={HEADER_H + PADDING + i * ROW_H}
                          y2={HEADER_H + PADDING + i * ROW_H}
                          stroke="rgba(255,255,255,0.07)"
                        />
                        <text x="14" y={HEADER_H + PADDING + i * ROW_H + 15} fill="rgba(226,232,240,0.95)" fontSize="11">
                          {field}
                        </text>
                      </g>
                    ))}
                  </g>
                ))}
              </g>
            </svg>

            <div className="pointer-events-none absolute bottom-3 right-3 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-muted-foreground">
              Drag to pan • zoom: {(zoom * 100).toFixed(0)}%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
