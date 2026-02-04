# WhiteBox — Services & Data Access

> All data access and helper logic currently live in `lib/mockData.ts`. There are no standalone service modules.

---

## Data Accessors (lib/mockData.ts)

### Balance

| Function | Purpose |
|----------|---------|
| `getTotalBalance()` | Sum of `balance` across all companies |

### Companies

| Function | Purpose |
|----------|---------|
| `getCompanyById(id: string)` | Return company by ID or `undefined` |
| `getCompaniesByCategory(categoryId: CategoryId \| null)` | Filter companies by category; `null` = all |
| `getCompaniesBySearch(query: string, categoryId: CategoryId \| null)` | Filter by search query (company name) and optional category |

### Transactions

| Function | Purpose |
|----------|---------|
| `getTransactionsByCompany(companyId: string)` | Transactions for a specific company |

### Subscriptions

| Function | Purpose |
|----------|---------|
| `getSubscriptionById(id: string)` | Return subscription by ID or `undefined` |
| `getSubscriptionsByCompany(companyId: string)` | Subscriptions for a company (direct match or category match) |
| `getSubscriptionsForMarketplace(categoryId: CategoryId \| null)` | Subscriptions for marketplace; filter by category |

### Categories

| Function | Purpose |
|----------|---------|
| `getCategoryById(id: CategoryId)` | Return category by ID or `undefined` |

### Utilities

| Function | Purpose |
|----------|---------|
| `isExpiringSoon(expiringDate?: string)` | `true` if date is within 1 year from now |

---

## Data Flow

```
UI Components
     │
     ▼
lib/mockData.ts (getCompanyById, getTotalBalance, etc.)
     │
     ▼
In-memory arrays (companies, subscriptions, transactions, etc.)
```

- No API calls or persistence; all data is mock/in-memory.
- Data is read-only from the UI; no mutators (create/update/delete) are exported.

---

## Usage by Page

| Page | mockData imports |
|------|------------------|
| Home | `categories`, `activeSubscriptions`, `getTotalBalance`, `getCompaniesBySearch`, `getSubscriptionById`, `getCategoryById` |
| Companies | `companies`, `categories`, `getCompaniesBySearch`, `getCategoryById` |
| History | `transactions` |
| Map | `companies`, `categories`, `getCompaniesByCategory`, `getCategoryById` |
| Marketplace | `subscriptions`, `categories`, `getSubscriptionsForMarketplace`, `getCategoryById` |
| Marketplace [id] | `getSubscriptionById`, `getCategoryById`, `getCompanyById` |
| Scan | — |
| Settings | — |
| Wallet [id] | `getCompanyById`, `getSubscriptionsByCompany`, `getCategoryById`, `isExpiringSoon` |

---

## Deprecated / Removed

- `subscriptionService.ts` — deleted; logic folded into `mockData.ts`.
