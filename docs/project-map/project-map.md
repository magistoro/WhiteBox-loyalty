# WhiteBox — Project Map

> **Project**: WhiteBox (Loyalty Wallet TWA)  
> **Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS, Radix UI, Framer Motion  
> **Target**: Telegram Web App (TWA) — multi-vendor loyalty program

---

## Folder Structure

```
WhiteBox/
├── .gitignore
├── components.json           # shadcn/ui configuration
├── eslint.config.mjs
├── next.config.ts            # Next.js config
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── tsconfig.json             # TypeScript config
├── README.md
│
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (Geist fonts, TWA viewport)
│   │   ├── globals.css             # Tailwind + TWA theme + glassmorphism
│   │   ├── favicon.ico
│   │   │
│   │   └── (twa)/                  # Route group (no URL segment)
│   │       ├── layout.tsx          # TWA layout: PageTransition + BottomNav
│   │       ├── page.tsx            # Home
│   │       ├── companies/page.tsx  # All partners
│   │       ├── history/page.tsx    # Transaction history
│   │       ├── map/page.tsx        # Partner map
│   │       ├── marketplace/page.tsx
│   │       ├── marketplace/[id]/page.tsx  # Subscription detail
│   │       ├── scan/page.tsx       # QR scan (placeholder)
│   │       ├── settings/page.tsx
│   │       └── wallet/[id]/page.tsx       # Company loyalty card
│   │
│   ├── components/
│   │   ├── BottomNav.tsx           # Bottom nav + central FAB
│   │   ├── PageTransition.tsx      # Route transition wrapper
│   │   └── ui/                     # shadcn/ui primitives
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── progress.tsx
│   │       ├── scroll-area.tsx
│   │       ├── sheet.tsx
│   │       └── tabs.tsx
│   │
│   └── lib/
│       ├── mockData.ts             # Domain types, mock data, data accessors
│       └── utils.ts                # cn() for Tailwind class merging
│
└── docs/
    └── project-map/
        ├── project-map.md
        ├── project-entities.md
        ├── project-services.md
        ├── project-ui.md
        └── project-architecture.md
```

---

## Folder Descriptions

| Path | Purpose |
|------|---------|
| `src/app` | Next.js App Router: layouts, pages, global styles |
| `src/app/(twa)` | Route group for TWA screens; shares layout with BottomNav |
| `src/components` | Shared React components |
| `src/components/ui` | shadcn/ui components (Radix-based primitives) |
| `src/lib` | Utilities, mock data, domain logic |
| `public` | Static assets |

---

## File Descriptions

### Root / Config

| File | Purpose |
|------|---------|
| `package.json` | Dependencies: Next.js 16, React 19, Framer Motion, Radix UI, Tailwind, lucide-react |
| `next.config.ts` | Next.js configuration |
| `tsconfig.json` | TypeScript; path alias `@/*` → `./src/*` |
| `components.json` | shadcn/ui component config |
| `postcss.config.mjs` | PostCSS for Tailwind |
| `eslint.config.mjs` | ESLint rules |

### App

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout: Geist fonts, dark mode, TWA viewport |
| `app/globals.css` | Tailwind base, design tokens, `.twa` theme, glassmorphism, sheet animations |
| `app/(twa)/layout.tsx` | Wraps children in PageTransition; includes BottomNav |
| `app/(twa)/page.tsx` | Home: total balance, active subscriptions, loyalty cards preview |
| `app/(twa)/companies/page.tsx` | All partners with search + category filter |
| `app/(twa)/history/page.tsx` | Transaction list (earn/spend) |
| `app/(twa)/map/page.tsx` | Mock map + category filter; partner preview |
| `app/(twa)/marketplace/page.tsx` | Subscription catalog with category filter |
| `app/(twa)/marketplace/[id]/page.tsx` | Subscription detail |
| `app/(twa)/scan/page.tsx` | QR scan placeholder |
| `app/(twa)/settings/page.tsx` | Settings placeholder |
| `app/(twa)/wallet/[id]/page.tsx` | Company loyalty card detail |

### Components

| File | Purpose |
|------|---------|
| `BottomNav.tsx` | Bottom nav (Home, Map, History, Profile); central FAB for Scan |
| `PageTransition.tsx` | AnimatePresence + motion for route transitions |
| `ui/badge.tsx` | Badge with variants (default, secondary, destructive, etc.) |
| `ui/button.tsx` | Button with variants and sizes |
| `ui/card.tsx` | Card, CardHeader, CardContent, CardTitle, etc. |
| `ui/input.tsx` | Styled input |
| `ui/progress.tsx` | Radix progress bar |
| `ui/scroll-area.tsx` | Radix scroll area |
| `ui/sheet.tsx` | Bottom/top/side drawer (Radix Dialog) |
| `ui/tabs.tsx` | Radix tabs |

### Lib

| File | Purpose |
|------|---------|
| `mockData.ts` | Types, mock companies/subscriptions/transactions, data accessor helpers |
| `utils.ts` | `cn()` for merging Tailwind classes |

---

## Architectural Layers

| Layer | Files |
|-------|-------|
| **UI** | `app/**/*.tsx`, `components/**/*.tsx` |
| **Data / domain** | `lib/mockData.ts` |
| **Utils** | `lib/utils.ts` |
| **Infra** | `next.config.ts`, `tsconfig.json`, `globals.css` |

---

## Notes

- `subscriptionService.ts` was removed; data access lives in `mockData.ts`.
- TWA route group `(twa)` does not add a URL segment; `/` maps to `(twa)/page.tsx`.

---

## Maintenance

When the project structure changes (new routes, components, services, or entities), update the docs in `/docs/project-map/`:

1. **project-map.md** — folder tree, file list, folder/file descriptions
2. **project-entities.md** — types, interfaces, relationships
3. **project-services.md** — data accessors, services, data flow
4. **project-ui.md** — routes, layout, component hierarchy
5. **project-architecture.md** — stack, layers, patterns (only if architecture shifts)
