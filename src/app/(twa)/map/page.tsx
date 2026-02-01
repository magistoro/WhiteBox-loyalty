"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  companies,
  categories,
  getCompaniesByCategory,
  getCategoryById,
} from "@/lib/mockData";
import type { CategoryId } from "@/lib/mockData";
import type { Company } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MapPin, Filter, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock map: grid of dots representing partner locations (clustering placeholder)
function MockMap({
  partners,
  selectedId,
  onSelect,
}: {
  partners: Company[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  // Normalize lat/lng to 0-100 for display (mock viewport)
  const lats = partners.map((p) => p.location?.lat ?? 50);
  const lngs = partners.map((p) => p.location?.lng ?? 30);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const rangeLat = maxLat - minLat || 0.01;
  const rangeLng = maxLng - minLng || 0.01;
  const pad = 0.1;
  const scaleX = (v: number) => ((v - minLng) / rangeLng) * (100 - 2 * pad) + pad;
  const scaleY = (v: number) => 100 - (((v - minLat) / rangeLat) * (100 - 2 * pad) + pad);

  return (
    <div className="relative h-[280px] w-full overflow-hidden rounded-2xl bg-muted/30 border border-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      {partners.filter((p) => p.location).map((p) => {
        const x = scaleX(p.location!.lng);
        const y = scaleY(p.location!.lat);
        const isSelected = selectedId === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={p.name}
          >
            <motion.span
              className={cn(
                "block rounded-full border-2 border-white shadow-lg",
                isSelected ? "bg-primary h-4 w-4" : "bg-primary/80 h-3 w-3"
              )}
              animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            />
          </button>
        );
      })}
      <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-background/80 backdrop-blur px-2 py-1.5 text-[10px] text-muted-foreground">
        Map (mock) — {partners.length} partner{partners.length !== 1 ? "s" : ""} • tap marker to preview
      </div>
    </div>
  );
}

export default function MapPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredPartners = useMemo(
    () => getCompaniesByCategory(selectedCategory).filter((c) => c.location),
    [selectedCategory]
  );

  const selectedPartner = selectedPartnerId
    ? companies.find((c) => c.id === selectedPartnerId)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-full px-4 pt-6 pb-4"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Map</h1>
        </div>
        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="glass border-white/10">
              <Filter className="h-4 w-4 mr-1" />
              Categories
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
            <SheetHeader>
              <SheetTitle>Filter by category</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[240px] pr-4 mt-4">
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(null);
                    setFilterOpen(false);
                  }}
                  className={cn(
                    "rounded-xl px-4 py-3 text-left font-medium transition-colors",
                    selectedCategory === null
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  All categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setFilterOpen(false);
                    }}
                    className={cn(
                      "rounded-xl px-4 py-3 text-left font-medium transition-colors",
                      selectedCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {selectedCategory && (
        <p className="text-sm text-muted-foreground mb-2">
          Showing: {getCategoryById(selectedCategory)?.name ?? "All"}
        </p>
      )}

      <MockMap
        partners={filteredPartners}
        selectedId={selectedPartnerId}
        onSelect={setSelectedPartnerId}
      />

      {/* Partner preview card (fixed at bottom when one selected) */}
      <AnimatePresence>
        {selectedPartner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="mt-4"
          >
            <Card className="glass border-white/10 overflow-hidden">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{selectedPartner.name}</p>
                  {getCategoryById(selectedPartner.categoryId) && (
                    <Badge variant="secondary" className="mt-1 text-[10px] font-normal">
                      {getCategoryById(selectedPartner.categoryId)!.name}
                    </Badge>
                  )}
                  {selectedPartner.location?.address && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {selectedPartner.location.address}
                    </p>
                  )}
                </div>
                <Link href={`/wallet/${selectedPartner.id}`}>
                  <Button size="sm">Open</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredPartners.length === 0 && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          No partners with locations in this category.
        </p>
      )}
    </motion.div>
  );
}
