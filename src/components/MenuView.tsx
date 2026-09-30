"use client";

import { useState } from "react";
import Navbar, { SORT_FNS, type Filters, type MenuItem } from "./navbar";

export default function MenuView({ items }: { items: MenuItem[] }) {
  const [filters, setFilters] = useState<Filters>({
    category: "All items",
    sort: "veg",
    query: "",
  });

  const visible = items
    .filter(
      (i) =>
        filters.category === "All items" ||
        (filters.category === "Mutton" ? i.type === "mutton" : i.category === filters.category)
    )
    .filter((i) => i.name.toLowerCase().includes(filters.query.toLowerCase()))
    .filter(
      (i) =>
        filters.category === "Mutton" ||
        filters.sort === "price_low_to_high" ||
        filters.sort === "price_high_to_low" ||
        i.type === filters.sort
    )
    .sort(SORT_FNS[filters.sort]);

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#F4F1EE]">
      <Navbar items={items} onChange={setFilters} />

      <main className="space-y-3 px-4 py-4">
        {visible.length === 0 && (
          <p className="text-center text-sm text-gray-500">No items found</p>
        )}

        {visible.map((item) => (
          <div
            key={item.no}
            className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-gray-500">{item.category}</p>
            </div>
            <p className="font-bold text-[#C0392B]">
              {item.price === null ? "APS" : `₹${item.price}`}
            </p>
          </div>
        ))}
      </main>
    </div>
  );
}