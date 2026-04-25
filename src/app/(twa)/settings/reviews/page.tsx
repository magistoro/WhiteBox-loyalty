import type { Metadata } from "next";
import { Star } from "lucide-react";

export const metadata: Metadata = {
  title: "My Reviews | Loyalty Wallet",
  description: "User reviews and ratings",
};

const reviewItems = [
  {
    id: "r1",
    company: "Coffee Shop",
    rating: 5,
    text: "Fast service and perfect flat white. Points credited instantly.",
    date: "2 days ago",
  },
  {
    id: "r2",
    company: "Power Gym",
    rating: 4,
    text: "Great classes and clean locker rooms. Would like more evening slots.",
    date: "1 week ago",
  },
  {
    id: "r3",
    company: "Classic Barber",
    rating: 5,
    text: "Excellent cut and friendly team. Booking was smooth.",
    date: "2 weeks ago",
  },
];

export default function ReviewsPage() {
  return (
    <article className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">My reviews</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Ratings and comments you left for partner businesses.
      </p>
      <ul className="space-y-3">
        {reviewItems.map((item) => (
          <li key={item.id} className="glass rounded-xl border border-white/10 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">{item.company}</p>
              <p className="text-muted-foreground text-xs">{item.date}</p>
            </div>
            <div className="mb-2 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={`${item.id}-${idx}`}
                  className={idx < item.rating ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4 text-muted-foreground"}
                />
              ))}
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}
