"use client";

import { useEffect, useState } from "react";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminListCategories,
  adminUpdateCategory,
  type AdminCategory,
} from "@/lib/api/admin-client";

type CategoryDraft = {
  slug: string;
  name: string;
  description: string;
  icon: string;
};

const emptyDraft: CategoryDraft = { slug: "", name: "", description: "", icon: "Circle" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [draft, setDraft] = useState<CategoryDraft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  async function load() {
    setCategories(await adminListCategories());
  }

  useEffect(() => {
    let ignore = false;
    void (async () => {
      const list = await adminListCategories();
      if (!ignore) setCategories(list);
    })();
    return () => {
      ignore = true;
    };
  }, []);

  async function createCategory() {
    const res = await adminCreateCategory({
      slug: draft.slug,
      name: draft.name,
      description: draft.description || undefined,
      icon: draft.icon,
    });
    if (!res.ok) {
      setError(String(res.message));
      return;
    }
    setDraft(emptyDraft);
    setError(null);
    await load();
  }

  async function updateCategory(id: number, patch: Partial<AdminCategory>) {
    setSavingId(id);
    const res = await adminUpdateCategory(id, patch);
    setSavingId(null);
    if (!res.ok) {
      setError(String(res.message));
      return;
    }
    setError(null);
    await load();
  }

  async function removeCategory(id: number) {
    const res = await adminDeleteCategory(id);
    if (!res.ok) {
      setError(String(res.message));
      return;
    }
    setError(null);
    await load();
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Categories</h1>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Create category</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Input placeholder="Slug" value={draft.slug} onChange={(e) => setDraft((p) => ({ ...p, slug: e.target.value }))} />
          <Input placeholder="Name" value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} />
          <Input placeholder="Description" value={draft.description} onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))} />
          <Input placeholder="Icon name (lucide)" value={draft.icon} onChange={(e) => setDraft((p) => ({ ...p, icon: e.target.value }))} />
          <Button onClick={() => void createCategory()} disabled={!draft.slug || !draft.name || !draft.icon}>
            Create
          </Button>
        </CardContent>
      </Card>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Category CRUD</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-xl border border-white/10 bg-muted/10 p-3">
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-lg bg-primary/15 p-1.5">
                  <CategoryIcon iconName={cat.icon} className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-semibold">{cat.name}</p>
              </div>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                <Input value={cat.slug} onChange={(e) => setCategories((prev) => prev.map((p) => p.id === cat.id ? { ...p, slug: e.target.value } : p))} />
                <Input value={cat.name} onChange={(e) => setCategories((prev) => prev.map((p) => p.id === cat.id ? { ...p, name: e.target.value } : p))} />
                <Input value={cat.description ?? ""} onChange={(e) => setCategories((prev) => prev.map((p) => p.id === cat.id ? { ...p, description: e.target.value } : p))} />
                <Input value={cat.icon} onChange={(e) => setCategories((prev) => prev.map((p) => p.id === cat.id ? { ...p, icon: e.target.value } : p))} />
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" onClick={() => void updateCategory(cat.id, { slug: cat.slug, name: cat.name, description: cat.description, icon: cat.icon })} disabled={savingId === cat.id}>
                  Save
                </Button>
                <Button variant="destructive" onClick={() => void removeCategory(cat.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
