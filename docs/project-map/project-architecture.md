# WhiteBox — Architecture Overview

> High-level architecture, layered structure, and design patterns.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Components | Radix UI (shadcn/ui) |
| Animation | Framer Motion |
| Icons | lucide-react |
| Target | Telegram Web App (TWA) |

---

## Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│  UI Layer (app/*, components/*)                         │
│  Pages, layout, shared components, UI primitives        │
└─────────────────────────────────┬───────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────┐
│  Data / Domain Layer (lib/mockData.ts)                  │
│  Types, entities, mock data, accessor functions         │
└─────────────────────────────────┬───────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────┐
│  Utils (lib/utils.ts)                                   │
│  cn() for class merging                                 │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow

1. **Read-only**: UI imports from `mockData.ts` and calls accessor functions.
2. **No API layer**: All data is in-memory; no HTTP/WebSocket.
3. **No state management**: Local React state (useState, useMemo) per page.
4. **No persistence**: No DB or storage; mock data only.

---

## Key Design Patterns

### Route Groups
- `(twa)` groups all TWA screens without adding a URL segment.
- Shared layout (BottomNav, PageTransition) for all TWA routes.

### Composition
- Layout: RootLayout → TWALayout → PageTransition → page content.
- BottomNav conditionally hidden on detail pages.

### Mock-First
- Domain types and mock data in one module.
- Accessors abstract array lookups; UI does not import raw arrays directly.

### Component Library
- shadcn/ui: composable, Radix-based primitives.
- `cn()` for conditional and merged Tailwind classes.

### Mobile-First TWA
- Viewport max-width 430px.
- Dark theme, glassmorphism, bottom sheets.
- Bottom nav + central FAB.

---

## Directory Conventions

| Convention | Path |
|------------|------|
| Pages | `src/app/(twa)/**/page.tsx` |
| Layouts | `src/app/**/layout.tsx` |
| Shared components | `src/components/` |
| UI primitives | `src/components/ui/` |
| Data & types | `src/lib/mockData.ts` |
| Utilities | `src/lib/utils.ts` |
| Path alias | `@/*` → `src/*` |

---

## Future Considerations

- Replace `mockData.ts` with API/service layer for real backend.
- Add state management if cross-page state is needed.
- Implement actual QR scanning on `/scan`.
- Add real map integration (e.g. Google Maps) on Map page.
