# WhiteBox — UI Components & Routes

> UI component hierarchy, routes, and layout structure.

---

## Route Structure

| Path | Page | Layout |
|------|------|--------|
| `/` | Home | Root + TWA |
| `/companies` | All Partners | Root + TWA |
| `/history` | Transaction History | Root + TWA |
| `/map` | Partner Map | Root + TWA |
| `/marketplace` | Subscriptions | Root + TWA |
| `/marketplace/[id]` | Subscription Detail | Root + TWA (no BottomNav) |
| `/scan` | QR Scan | Root + TWA |
| `/settings` | Settings | Root + TWA |
| `/wallet/[id]` | Company Loyalty Card | Root + TWA (no BottomNav) |

---

## Layout Hierarchy

```
RootLayout (app/layout.tsx)
  └── html.dark, body.twa
       └── div.twa-viewport
            └── TWALayout (app/(twa)/layout.tsx)
                 ├── main (flex-1 overflow-x-hidden pb-24)
                 │    └── PageTransition
                 │         └── {children} (page content)
                 └── BottomNav (fixed bottom)
```

---

## BottomNav Visibility

BottomNav is hidden on:
- `/wallet/*` (company loyalty detail)
- `/marketplace/[id]` (subscription detail)

Visible on: Home, Map, Scan, History, Settings.

---

## Component Hierarchy

### Shared Layout

```
BottomNav
  ├── FAB (Scan) — fixed above bar
  └── Nav items: Home, Map, History, Profile
```

```
PageTransition
  └── AnimatePresence + motion.div (route-keyed)
```

### UI Primitives (shadcn/ui)

| Component | Exports | Usage |
|-----------|---------|-------|
| Badge | `Badge`, `badgeVariants` | Category labels, status |
| Button | `Button`, `buttonVariants` | CTAs, links, actions |
| Card | `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`, `CardDescription`, `CardAction` | Content containers |
| Input | `Input` | Search, forms |
| Progress | `Progress` | Points-to-reward bar |
| ScrollArea | `ScrollArea`, `ScrollBar` | History, filter lists |
| Sheet | `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetTrigger`, etc. | Bottom filter drawer (Map) |
| Tabs | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `tabsListVariants` | Available, not heavily used |

---

## Page → Components Mapping

| Page | Components Used |
|------|-----------------|
| Home | Card, Progress, Badge, Button, Input, Link |
| Companies | Card, Progress, Badge, Button, Input, Link |
| History | Card, Badge, ScrollArea |
| Map | Card, Badge, Button, ScrollArea, Sheet, MockMap (local) |
| Marketplace | Card, Badge, Button, ScrollArea, Link |
| Marketplace [id] | Card, Button, ScrollArea, Link |
| Scan | Card, Button |
| Settings | Card |
| Wallet [id] | Card, Progress, Button, Badge, Link |

---

## Motion / Animation

- **Framer Motion**: `motion.div`, `AnimatePresence`, stagger children
- **PageTransition**: Route changes with fade + vertical slide
- **BottomNav**: FAB spring animation; pill for active tab
- **Map**: Marker scale animation on select
- **Sheet**: Slide-in-from-bottom (via CSS in globals.css)

---

## Design Tokens

- `.twa` — Telegram-style dark theme (oklch)
- `.glass` — Glassmorphism (backdrop-blur, semi-transparent)
- `.twa-viewport` — Max 430px, mobile-first
- CSS vars: `--twa-bg`, `--twa-surface`, `--twa-glass`, `--twa-border`, `--twa-glow`
