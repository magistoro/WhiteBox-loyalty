# WhiteBox - UI Components and Routes

## Route structure

| Path | Purpose | Access |
|---|---|---|
| `/` | TWA home | CLIENT |
| `/login` | Login page | Public |
| `/register` | Registration page | Public |
| `/companies` | Partners list | CLIENT |
| `/marketplace` | Subscription catalog | CLIENT |
| `/marketplace/[id]` | Subscription details | CLIENT |
| `/wallet/[id]` | Loyalty card details | CLIENT |
| `/map` | Partners map | CLIENT |
| `/history` | Points history | CLIENT |
| `/scan` | QR scan surface | CLIENT |
| `/settings` + subpages | User settings | CLIENT |
| `/help/*` | Help and legal pages | Public |
| `/company` + subpages | Company workspace | COMPANY / ADMIN |
| `/admin` | Admin dashboard | ADMIN |
| `/admin/users` | Users table and search | ADMIN |
| `/admin/users/[uuid]` | Full user profile CRUD | ADMIN |
| `/admin/categories` | Categories CRUD | ADMIN |
| `/admin/companies` | Company accounts directory | ADMIN |
| `/admin/companies/[uuid]` | Company profile + subscriptions CRUD | ADMIN |
| `/admin/subscriptions` | Subscription stats and UUID lookup | ADMIN |
| `/admin/database` | Interactive DB schema map | ADMIN |
| `/admin/payments` | Payments placeholder | ADMIN |
| `/admin/compliance` | Compliance placeholder | ADMIN |
| `/admin/audit` | Audit placeholder | ADMIN |

## Layout hierarchy

- `app/layout.tsx`: root shell, global dark theme and typography.
- `app/(twa)/layout.tsx`: mobile viewport (`.twa-viewport`), `PageTransition`, `BottomNav`.
- `app/(portal)/layout.tsx`: desktop workspace with left sidebar, brand/logo, section menu.
- `app/(auth)/layout.tsx`: centered auth forms.

## Admin UX notes

- Admin and company consoles are desktop-first; they are not constrained by TWA mobile width.
- Left menu includes `Dashboard`, user and subscription tools, operations pages, and `Database map`.
- Users table is read-only for role/status in-place; editing is moved to `/admin/users/[uuid]`.
- Sensitive fields are protected in profile view: password/email are not directly editable, and account deletion schedule is read-only with explicit reactivation action.

## Key components

- `src/components/brand/WhiteBoxLogo.tsx` - brand logo used in portal sidebar.
- `src/components/ui/select-field.tsx` - styled select control with consistent dropdown arrow.
- `src/components/PageTransition.tsx` - route-level animation wrapper.
- `src/components/BottomNav.tsx` - TWA mobile bottom navigation.
