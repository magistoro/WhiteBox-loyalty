"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  Minus,
  Plus,
  RotateCcw,
  Shield,
  Building2,
  Link2,
  ChevronDown,
  LayoutGrid,
  User as UserIcon,
  Tags,
  BadgeDollarSign,
  GitMerge,
  KeyRound,
  LogIn,
  MailCheck,
  Wallet,
  ClipboardList,
  MapPin,
  Sparkles,
  Ticket,
  Megaphone,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

type SchemaPreset = {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  visibleNodes: string[];
};

const NODE_W = 240;
const HEADER_H = 34;
const ROW_H = 22;
const PADDING = 8;
const MIN_ZOOM = 0.45;
const MAX_ZOOM = 2.5;

const nodes: Node[] = [
  { id: "User", title: "User", subtitle: "identity", fields: ["id", "uuid", "telegramId?", "email", "role", "accountStatus"], x: 120, y: 100, color: "rgba(34,211,238,0.24)" },
  { id: "Category", title: "Category", subtitle: "dictionary", fields: ["id", "slug", "name", "icon"], x: 500, y: 90, color: "rgba(16,185,129,0.24)" },
  { id: "Company", title: "Company", subtitle: "partner", fields: ["id", "slug", "categoryId", "ownerUserId?", "subscriptionSpendPolicy"], x: 880, y: 90, color: "rgba(56,189,248,0.24)" },
  { id: "Subscription", title: "Subscription", subtitle: "catalog", fields: ["id", "uuid", "slug", "price", "companyId?", "categoryId?"], x: 1260, y: 90, color: "rgba(99,102,241,0.24)" },
  { id: "CompanyLocation", title: "CompanyLocation", subtitle: "branches/map", fields: ["id", "uuid", "companyId", "address", "latitude", "longitude", "openTime", "workingDays"], x: 1640, y: 80, color: "rgba(45,212,191,0.24)" },
  { id: "UserProfilePreference", title: "UserProfilePreference", subtitle: "profile", fields: ["id", "userId", "onboardingCompletedAt?", "profileVisibility", "marketingOptIn"], x: 80, y: 390, color: "rgba(125,211,252,0.22)" },
  { id: "UserFavoriteCategory", title: "UserFavoriteCategory", subtitle: "pivot", fields: ["id", "userId", "categoryId"], x: 420, y: 390, color: "rgba(20,184,166,0.24)" },
  { id: "CompanyCategory", title: "CompanyCategory", subtitle: "pivot", fields: ["id", "companyId", "categoryId"], x: 760, y: 390, color: "rgba(6,182,212,0.24)" },
  { id: "CompanyLevelRule", title: "CompanyLevelRule", subtitle: "levels", fields: ["id", "companyId", "levelName", "minTotalSpend", "cashbackPercent"], x: 1100, y: 390, color: "rgba(14,165,233,0.24)" },
  { id: "UserCompany", title: "UserCompany", subtitle: "points balance", fields: ["id", "userId", "companyId", "balance", "pointsToNextReward?"], x: 1440, y: 390, color: "rgba(217,70,239,0.22)" },
  { id: "UserSubscription", title: "UserSubscription", subtitle: "active/archive", fields: ["id", "userId", "subscriptionId", "status", "expiresAt?", "willAutoRenew"], x: 1780, y: 390, color: "rgba(139,92,246,0.24)" },
  { id: "PromoCode", title: "PromoCode", subtitle: "growth", fields: ["id", "code", "rewardType", "points", "companyId?", "subscriptionId?"], x: 120, y: 720, color: "rgba(250,204,21,0.24)" },
  { id: "PromoCodeRedemption", title: "PromoCodeRedemption", subtitle: "growth ledger", fields: ["id", "promoCodeId", "userId", "redeemedAt"], x: 480, y: 720, color: "rgba(234,179,8,0.22)" },
  { id: "ReferralCampaign", title: "ReferralCampaign", subtitle: "growth rules", fields: ["id", "title", "inviterBonusPoints", "invitedBonusPoints", "bonusCompanyId?"], x: 840, y: 720, color: "rgba(132,204,22,0.24)" },
  { id: "ReferralInvite", title: "ReferralInvite", subtitle: "invite ledger", fields: ["id", "code", "inviterUserId", "invitedUserId?", "status"], x: 1200, y: 720, color: "rgba(163,230,53,0.22)" },
  { id: "LoyaltyTransaction", title: "LoyaltyTransaction", subtitle: "points ledger", fields: ["id", "uuid", "userId", "companyId", "type", "status", "amount"], x: 1560, y: 720, color: "rgba(244,114,182,0.24)" },
  { id: "RefreshToken", title: "RefreshToken", subtitle: "session", fields: ["id", "tokenHash", "userId", "expiresAt", "revokedAt?"], x: 120, y: 1060, color: "rgba(251,191,36,0.24)" },
  { id: "OAuthAccount", title: "OAuthAccount", subtitle: "federation", fields: ["id", "provider", "providerAccountId", "userId", "expiresAt?"], x: 480, y: 1060, color: "rgba(251,146,60,0.24)" },
  { id: "LoginEvent", title: "LoginEvent", subtitle: "security", fields: ["id", "userId", "ipAddress?", "countryCode?", "createdAt"], x: 840, y: 1060, color: "rgba(249,115,22,0.24)" },
  { id: "EmailChangeRequest", title: "EmailChangeRequest", subtitle: "security", fields: ["id", "userId", "requestedByUserId", "tokenHash", "expiresAt"], x: 1200, y: 1060, color: "rgba(251,113,133,0.24)" },
  { id: "AuditEvent", title: "AuditEvent", subtitle: "ops/security", fields: ["id", "workspace", "category", "actorUserId?", "targetUserId?", "result"], x: 1560, y: 1060, color: "rgba(148,163,184,0.24)" },
];

const edges: Edge[] = [
  { from: "Category", to: "Company", label: "1:N" },
  { from: "Category", to: "Subscription", label: "1:N" },
  { from: "Company", to: "Subscription", label: "1:N" },
  { from: "Company", to: "CompanyLocation", label: "1:N" },
  { from: "User", to: "Company", label: "1:1 owner" },
  { from: "User", to: "UserProfilePreference", label: "1:1" },
  { from: "User", to: "UserFavoriteCategory", label: "1:N" },
  { from: "Category", to: "UserFavoriteCategory", label: "1:N" },
  { from: "Company", to: "CompanyCategory", label: "1:N" },
  { from: "Category", to: "CompanyCategory", label: "1:N" },
  { from: "Company", to: "CompanyLevelRule", label: "1:N" },
  { from: "User", to: "UserCompany", label: "1:N" },
  { from: "Company", to: "UserCompany", label: "1:N" },
  { from: "User", to: "UserSubscription", label: "1:N" },
  { from: "Subscription", to: "UserSubscription", label: "1:N" },
  { from: "Company", to: "PromoCode", label: "1:N points" },
  { from: "Subscription", to: "PromoCode", label: "1:N promo" },
  { from: "PromoCode", to: "PromoCodeRedemption", label: "1:N" },
  { from: "User", to: "PromoCodeRedemption", label: "1:N" },
  { from: "Company", to: "ReferralCampaign", label: "1:N bonus" },
  { from: "User", to: "ReferralInvite", label: "1:N inviter" },
  { from: "User", to: "ReferralInvite", label: "1:1 invited" },
  { from: "User", to: "RefreshToken", label: "1:N" },
  { from: "User", to: "OAuthAccount", label: "1:N" },
  { from: "User", to: "LoginEvent", label: "1:N" },
  { from: "User", to: "EmailChangeRequest", label: "1:N target" },
  { from: "User", to: "EmailChangeRequest", label: "1:N requester" },
  { from: "User", to: "LoyaltyTransaction", label: "1:N" },
  { from: "Company", to: "LoyaltyTransaction", label: "1:N" },
  { from: "User", to: "AuditEvent", label: "1:N actor" },
  { from: "User", to: "AuditEvent", label: "1:N target" },
];

const presets: SchemaPreset[] = [
  {
    id: "all",
    label: "Full Schema",
    description: "All models and all relations",
    icon: LayoutGrid,
    visibleNodes: nodes.map((n) => n.id),
  },
  {
    id: "company-flow",
    label: "Company, Locations + Subscriptions",
    description: "Partners, branches, categories and paid plans",
    icon: Building2,
    visibleNodes: ["User", "Category", "Company", "CompanyLocation", "Subscription", "UserCompany", "UserSubscription", "CompanyCategory", "CompanyLevelRule"],
  },
  {
    id: "security",
    label: "Security & Access",
    description: "Auth, sessions and security events",
    icon: Shield,
    visibleNodes: ["User", "RefreshToken", "OAuthAccount", "LoginEvent", "EmailChangeRequest", "AuditEvent"],
  },
  {
    id: "loyalty",
    label: "Loyalty Structure",
    description: "Categories, companies and loyalty transactions",
    icon: Link2,
    visibleNodes: ["User", "Category", "Company", "CompanyLocation", "CompanyCategory", "UserCompany", "LoyaltyTransaction", "UserFavoriteCategory", "CompanyLevelRule"],
  },
  {
    id: "growth",
    label: "Growth: Promo + Referral",
    description: "Promo code redemption and invite-a-friend rules",
    icon: Megaphone,
    visibleNodes: ["User", "Company", "Subscription", "PromoCode", "PromoCodeRedemption", "ReferralCampaign", "ReferralInvite", "LoyaltyTransaction", "UserCompany"],
  },
  {
    id: "map",
    label: "Map + Branches",
    description: "Company addresses, map markers and category context",
    icon: MapPin,
    visibleNodes: ["Company", "CompanyLocation", "Category", "CompanyCategory", "UserCompany", "LoyaltyTransaction", "Subscription"],
  },
];

const nodeMeta: Record<
  string,
  {
    group: "core" | "map" | "links" | "growth" | "security" | "finance";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  User: { group: "core", icon: UserIcon },
  Category: { group: "core", icon: Tags },
  Company: { group: "core", icon: Building2 },
  Subscription: { group: "core", icon: BadgeDollarSign },
  CompanyLocation: { group: "map", icon: MapPin },
  UserProfilePreference: { group: "links", icon: Sparkles },
  UserFavoriteCategory: { group: "links", icon: GitMerge },
  CompanyCategory: { group: "links", icon: GitMerge },
  CompanyLevelRule: { group: "links", icon: GitMerge },
  UserCompany: { group: "links", icon: GitMerge },
  UserSubscription: { group: "links", icon: GitMerge },
  PromoCode: { group: "growth", icon: Ticket },
  PromoCodeRedemption: { group: "growth", icon: Ticket },
  ReferralCampaign: { group: "growth", icon: Megaphone },
  ReferralInvite: { group: "growth", icon: UsersRound },
  RefreshToken: { group: "security", icon: KeyRound },
  OAuthAccount: { group: "security", icon: KeyRound },
  LoginEvent: { group: "security", icon: LogIn },
  EmailChangeRequest: { group: "security", icon: MailCheck },
  LoyaltyTransaction: { group: "finance", icon: Wallet },
  AuditEvent: { group: "finance", icon: ClipboardList },
};

const nodeGroups = [
  { id: "core", label: "Core Models", icon: LayoutGrid },
  { id: "map", label: "Location / Map Models", icon: MapPin },
  { id: "links", label: "Pivot / Link Models", icon: Link2 },
  { id: "growth", label: "Growth Models", icon: Megaphone },
  { id: "security", label: "Security Models", icon: Shield },
  { id: "finance", label: "Finance / Ops Models", icon: Wallet },
] as const;

function nodeHeight(node: Node) {
  return HEADER_H + node.fields.length * ROW_H + PADDING * 2;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function AdminDatabasePage() {
  const [zoom, setZoom] = useState(0.82);
  const [offset, setOffset] = useState({ x: 24, y: 16 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [hiddenNodes, setHiddenNodes] = useState<Set<string>>(new Set());
  const [presetOpen, setPresetOpen] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string>("all");
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef(zoom);
  const offsetRef = useRef(offset);

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), []);
  const visibleNodes = useMemo(
    () => nodes.filter((node) => !hiddenNodes.has(node.id)),
    [hiddenNodes],
  );
  const visibleEdges = useMemo(
    () =>
      edges.filter(
        (edge) => !hiddenNodes.has(edge.from) && !hiddenNodes.has(edge.to),
      ),
    [hiddenNodes],
  );

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  function setZoomAt(nextZoom: number, clientX?: number, clientY?: number) {
    const clampedZoom = clamp(Number(nextZoom.toFixed(3)), MIN_ZOOM, MAX_ZOOM);
    if (!viewportRef.current || clientX === undefined || clientY === undefined) {
      setZoom(clampedZoom);
      return;
    }
    const rect = viewportRef.current.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const currentOffset = offsetRef.current;
    const currentZoom = zoomRef.current;
    const worldX = (localX - currentOffset.x) / currentZoom;
    const worldY = (localY - currentOffset.y) / currentZoom;
    setOffset({
      x: Math.round(localX - worldX * clampedZoom),
      y: Math.round(localY - worldY * clampedZoom),
    });
    setZoom(clampedZoom);
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      event.stopPropagation();
      const delta = event.deltaY < 0 ? 0.09 : -0.09;
      setZoomAt(zoomRef.current + delta, event.clientX, event.clientY);
    }

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, []);

  function zoomIn() {
    setZoomAt(zoom + 0.1);
  }

  function zoomOut() {
    setZoomAt(zoom - 0.1);
  }

  function resetView() {
    setZoom(0.82);
    setOffset({ x: 24, y: 16 });
    setFocusedNodeId(null);
  }

  function focusNode(nodeId: string) {
    const node = byId.get(nodeId);
    const viewport = viewportRef.current;
    if (!node || !viewport || hiddenNodes.has(nodeId)) return;
    const rect = viewport.getBoundingClientRect();
    const nodeH = nodeHeight(node);
    const centerX = node.x + NODE_W / 2;
    const centerY = node.y + nodeH / 2;
    setOffset({
      x: Math.round(rect.width / 2 - centerX * zoom),
      y: Math.round(rect.height / 2 - centerY * zoom),
    });
    setFocusedNodeId(node.id);
  }

  function toggleNodeVisibility(nodeId: string) {
    setHiddenNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
    if (focusedNodeId === nodeId) {
      setFocusedNodeId(null);
    }
    setActivePresetId("custom");
  }

  function applyPreset(preset: SchemaPreset) {
    const visibleSet = new Set(preset.visibleNodes);
    setHiddenNodes(new Set(nodes.filter((n) => !visibleSet.has(n.id)).map((n) => n.id)));
    setActivePresetId(preset.id);
    setPresetOpen(false);
    setFocusedNodeId(null);
  }

  const activePresetLabel = presets.find((p) => p.id === activePresetId)?.label ?? "Custom";

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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Prisma schema visualizer (synced with schema.prisma)</CardTitle>
            <div className="relative">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setPresetOpen((v) => !v)}
                className="gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                View preset: {activePresetLabel}
                <ChevronDown className={cn("h-4 w-4 transition-transform", presetOpen && "rotate-180")} />
              </Button>
              {presetOpen && (
                <div className="absolute right-0 top-10 z-20 w-80 rounded-xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl backdrop-blur">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                        activePresetId === preset.id ? "bg-primary/20" : "hover:bg-white/5",
                      )}
                    >
                      <span className="mt-0.5 rounded-md border border-white/10 bg-white/5 p-1.5">
                        <preset.icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-medium">{preset.label}</span>
                        <span className="block text-xs text-muted-foreground">{preset.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {nodeGroups.map((group) => {
              const items = nodes.filter((node) => nodeMeta[node.id]?.group === group.id);
              if (!items.length) return null;
              return (
                <div key={group.id} className="rounded-xl border border-white/10 bg-muted/10 p-2.5">
                  <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <group.icon className="h-3.5 w-3.5" />
                    {group.label}
                    <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px]">
                      {items.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((node) => {
                      const hidden = hiddenNodes.has(node.id);
                      const NodeIcon = nodeMeta[node.id]?.icon ?? LayoutGrid;
                      return (
                        <div key={node.id} className="inline-flex items-center rounded-md border border-white/10 bg-muted/20 pr-1">
                          <Button
                            variant={focusedNodeId === node.id && !hidden ? "default" : "secondary"}
                            size="sm"
                            onClick={() => focusNode(node.id)}
                            className="h-8 gap-1.5 rounded-r-none border-r border-white/10"
                            disabled={hidden}
                          >
                            <NodeIcon className="h-3.5 w-3.5" />
                            {node.id}
                          </Button>
                          <button
                            type="button"
                            onClick={() => toggleNodeVisibility(node.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                            title={hidden ? "Show table" : "Hide table"}
                          >
                            {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div
            ref={viewportRef}
            className={cn(
              "relative h-[74vh] min-h-[560px] cursor-grab overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.09)_1px,transparent_0)] [background-size:24px_24px] overscroll-none touch-none select-none",
              dragStart && "cursor-grabbing",
            )}
            onPointerDown={(e) => {
              if (e.pointerType === "mouse" && e.button !== 0) return;
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              const currentOffset = offsetRef.current;
              setDragStart({ x: e.clientX - currentOffset.x, y: e.clientY - currentOffset.y });
            }}
            onPointerMove={(e) => {
              if (!dragStart) return;
              e.preventDefault();
              setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
            }}
            onPointerUp={(e) => {
              if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId);
              }
              setDragStart(null);
            }}
            onPointerCancel={() => setDragStart(null)}
          >
            <svg className="absolute inset-0 h-full w-full">
              <g
                style={{ transition: dragStart ? "none" : "transform 260ms ease" }}
                transform={`translate(${offset.x},${offset.y}) scale(${zoom})`}
              >
                {visibleEdges.map((edge, index) => {
                  const from = byId.get(edge.from);
                  const to = byId.get(edge.to);
                  if (!from || !to) return null;
                  const x1 = from.x + NODE_W / 2;
                  const y1 = from.y + nodeHeight(from);
                  const x2 = to.x + NODE_W / 2;
                  const y2 = to.y;
                  const cx1 = x1;
                  const cy1 = y1 + 90;
                  const cx2 = x2;
                  const cy2 = y2 - 90;
                  const midX = (x1 + x2) / 2 + (index % 2 === 0 ? 10 : -10);
                  const midY = (y1 + y2) / 2;
                  return (
                    <g key={`${edge.from}-${edge.to}-${index}`}>
                      <path
                        d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                        fill="none"
                        stroke="rgba(186,230,253,0.45)"
                        strokeWidth="1.5"
                      />
                      <rect
                        x={midX - 30}
                        y={midY - 10}
                        width="60"
                        height="20"
                        rx="6"
                        fill="rgba(15,23,42,0.88)"
                      />
                      <text
                        x={midX}
                        y={midY + 4}
                        textAnchor="middle"
                        fontSize="10"
                        fill="rgba(224,242,254,0.95)"
                      >
                        {edge.label}
                      </text>
                    </g>
                  );
                })}

                {visibleNodes.map((node) => (
                  <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                    <rect
                      width={NODE_W}
                      height={nodeHeight(node)}
                      rx="12"
                      fill="rgba(2,6,23,0.88)"
                      stroke={
                        focusedNodeId === node.id
                          ? "rgba(56,189,248,0.95)"
                          : "rgba(255,255,255,0.14)"
                      }
                      strokeWidth={focusedNodeId === node.id ? "2" : "1"}
                    />
                    <rect width={NODE_W} height={HEADER_H + 2} rx="12" fill={node.color} />
                    <text x="14" y="21" fill="white" fontSize="13" fontWeight="700">
                      {node.title}
                    </text>
                    <text
                      x="14"
                      y="33"
                      fill="rgba(203,213,225,0.95)"
                      fontSize="10"
                    >
                      {node.subtitle}
                    </text>
                    {node.fields.map((field, i) => (
                      <g key={field}>
                        <line
                          x1={0}
                          x2={NODE_W}
                          y1={HEADER_H + PADDING + i * ROW_H}
                          y2={HEADER_H + PADDING + i * ROW_H}
                          stroke="rgba(255,255,255,0.07)"
                        />
                        <text
                          x="14"
                          y={HEADER_H + PADDING + i * ROW_H + 15}
                          fill="rgba(226,232,240,0.95)"
                          fontSize="11"
                        >
                          {field}
                        </text>
                      </g>
                    ))}
                  </g>
                ))}
              </g>
            </svg>

            <div className="pointer-events-none absolute bottom-3 right-3 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-muted-foreground">
              Drag to pan | wheel to zoom | visible: {visibleNodes.length}/{nodes.length} |{" "}
              {(zoom * 100).toFixed(0)}%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
