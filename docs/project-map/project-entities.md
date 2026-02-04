# WhiteBox — Core Entities & Types

> Domain types, interfaces, and relationships for the loyalty wallet application.

---

## Type Definitions

### `TransactionType`
```ts
type TransactionType = "earn" | "spend";
```
Distinguishes earning points from spending/redeeming.

---

### `TransactionStatus`
```ts
type TransactionStatus = "active" | "expired";
```
Indicates whether points from the transaction are still usable.

---

### `Transaction`
```ts
interface Transaction {
  id: string;
  type: TransactionType;
  companyId: string;
  companyName: string;
  amount: number;
  date: string;           // ISO 8601
  status: TransactionStatus;
  description?: string;
}
```
Single earn or spend event at a partner.

---

### `CategoryId`
```ts
type CategoryId =
  | "coffee" | "barber" | "food" | "fitness"
  | "beauty" | "pharmacy" | "retail" | "other";
```
Enum-like IDs for partner categories.

---

### `Category`
```ts
interface Category {
  id: CategoryId;
  name: string;
  slug: string;
  icon?: string;
}
```
Category metadata for partners and subscriptions.

---

### `MapLocation`
```ts
interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
}
```
Geographic coordinates and optional address.

---

### `Company`
```ts
interface Company {
  id: string;
  name: string;
  categoryId: CategoryId;
  balance: number;          // User's points at this partner
  pointsToNextReward: number;
  pointsPerReward: number;
  expiringPoints?: number;
  expiringDate?: string;    // ISO date
  location?: MapLocation;
  subscriptionIds?: string[];
}
```
Partner / merchant with loyalty points and optional location.

---

### `Subscription`
```ts
interface Subscription {
  id: string;
  name: string;
  description: string;
  price: number;
  priceLabel: string;
  renewalPeriod: "day" | "week" | "month";
  renewalLabel: string;
  benefits: string[];
  companyId?: string;       // Partner-specific
  categoryId?: CategoryId;
  image?: string;
}
```
Subscription plan that can be category-wide or partner-specific.

---

### Active Subscription (runtime shape)

```ts
{
  subscriptionId: string;
  activatedAt: string;      // ISO
  expiresAt: string;
  renewPeriodDays: number;
  willAutoRenew: boolean;
  status: "active" | string;
  companyIds: string[];     // Partners where active
}
```
Used for active subscriptions display (not a named export in mockData).

---

## Entity Relationships

```
Category
  ├── Company.categoryId
  └── Subscription.categoryId

Company
  ├── Transaction.companyId
  ├── Company.subscriptionIds → Subscription.id
  └── Subscription.companyId (optional, for partner-specific plans)

Subscription
  ├── Company.subscriptionIds
  └── ActiveSubscription.subscriptionId
```

---

## Mock Data Arrays

| Export | Type | Count |
|--------|------|-------|
| `categories` | `Category[]` | 8 |
| `companies` | `Company[]` | 19 |
| `subscriptions` | `Subscription[]` | 6 |
| `activeSubscriptions` | Array | 2 |
| `transactions` | `Transaction[]` | 10 |

---

## Key Relationships

1. **Company ↔ Category**  
   Each company has a `categoryId`; categories group companies.

2. **Company ↔ Subscription**  
   Companies list `subscriptionIds`; subscriptions can have optional `companyId`.

3. **Transaction ↔ Company**  
   Each transaction references `companyId` and `companyName`.

4. **Active subscription ↔ Subscription**  
   `subscriptionId` links to a `Subscription`; `companyIds` lists where it applies.
