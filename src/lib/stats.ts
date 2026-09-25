import type { Order } from "./store";

function mostCommon(values: string[]): string | null {
  if (!values.length) {
    return null;
  }
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1])[0][0];
}

export function getStats(orders: Order[]) {
  const items = orders.flatMap((order) => order.items);
  const pages = items.reduce((sum, item) => sum + item.pages, 0);
  return {
    averagePages: items.length > 0 ? Math.round(pages / items.length) : 0,
    bookCount: items.length,
    favoriteAuthor: mostCommon(items.map((item) => item.author.pt)),
    favoriteGenre: mostCommon(items.map((item) => item.genre)),
    hours: pages > 0 ? Math.max(1, Math.round(pages / 40)) : 0,
    orderCount: orders.length,
    pages,
    pretendSpend: orders.reduce((sum, order) => sum + order.totalPrice, 0),
  };
}
