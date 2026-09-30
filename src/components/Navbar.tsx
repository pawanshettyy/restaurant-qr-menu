"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, UtensilsCrossed } from "lucide-react";

export type MenuItem = {
  no: number;
  name: string;
  category: string;
  type: "veg" | "chicken" | "egg" | "seafood" | "mutton";
  price: number | null; // null = APS (as per size)
  popular?: boolean;
};

export const CATEGORIES: string[] = [
  "Soup",
  "Starter",
  "Tandoor Se",
  "Main Course",
  "Roti Ka Khazana",
  "Basmati Ki Bahar",
  "Chinese Ka Tadka",
  "Chinese Rice & Noodles",
  "Khane Ke Saath",
];

export const SORTS = [
  { key: "veg", label: "Veg" },
  { key: "chicken", label: "Chicken" },
  { key: "egg", label: "Egg" },
  { key: "seafood", label: "Seafood" },
  { key: "mutton", label: "Mutton" },
] as const;

export type SortKey = (typeof SORTS)[number]["key"];
export type PriceSortKey = "price_low_to_high" | "price_high_to_low";

export type Filters = {
  category: string;
  sort: SortKey | PriceSortKey;
  query: string;
};

// price === null means "APS" (as per size), so it always sorts last
const byPrice = (dir: 1 | -1) => (a: MenuItem, b: MenuItem): number => {
  if (a.price == null && b.price == null) return 0;
  if (a.price == null) return 1;
  if (b.price == null) return -1;
  return dir * (a.price - b.price);
};

// keys must match the keys in SORTS
export const SORT_FNS: Record<SortKey | PriceSortKey, (a: MenuItem, b: MenuItem) => number> = {
  veg: (a, b) => a.no - b.no,
  chicken: (a, b) => a.no - b.no,
  egg: (a, b) => a.no - b.no,
  seafood: (a, b) => a.no - b.no,
  mutton: (a, b) => a.no - b.no,
  price_low_to_high: byPrice(1),
  price_high_to_low: byPrice(-1),
};

type NavbarProps = {
  items: MenuItem[];
  onChange?: (filters: Filters) => void;
};

export default function Navbar({ items, onChange }: NavbarProps) {
  const [category, setCategory] = useState<string>("All items");
  const [sort, setSort] = useState<SortKey | PriceSortKey>("veg");
  const [query, setQuery] = useState<string>("");
  const [showPriceSorts, setShowPriceSorts] = useState(false);
  const categories = CATEGORIES.filter((currentCategory) =>
    items.some((item) => item.category === currentCategory)
  );

  const update = (next: Partial<Filters>): void =>
    onChange?.({ category, sort, query, ...next });

  return (
    <header className="sticky top-0 z-20 bg-[#F4F1EE] px-4 pt-3 pb-1 space-y-3">
      {/* Logo */}
      <div className="flex items-center gap-1.5 text-[#C0392B]">
        <UtensilsCrossed size={26} strokeWidth={2.5} />
        <span className="text-xl font-bold tracking-tight">Sahyadri</span>
      </div>

      {/* Search */}
      <div className="relative flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-sm">
        <Search size={18} className="text-gray-400" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            update({ query: e.target.value });
          }}
          placeholder="Search the menu"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
        <button
          type="button"
          aria-label="Sort by price"
          aria-expanded={showPriceSorts}
          onClick={() => setShowPriceSorts((visible) => !visible)}
          className="text-gray-500 transition hover:text-[#C0392B]"
        >
          <SlidersHorizontal size={18} />
        </button>
        {showPriceSorts && (
          <div className="absolute right-0 top-full z-30 mt-2 w-44 rounded-xl bg-white p-1 shadow-lg ring-1 ring-black/5">
            {[
              ["price_low_to_high", "Price: Low to High"],
              ["price_high_to_low", "Price: High to Low"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSort(key as PriceSortKey);
                  update({ sort: key as PriceSortKey });
                  setShowPriceSorts(false);
                }}
                className={`block w-full rounded-lg px-3 py-2 text-left text-xs transition hover:bg-[#F4F1EE]
                  ${sort === key ? "font-semibold text-[#C0392B]" : "text-gray-700"}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category */}
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => (
          <button
            key={c}
            aria-pressed={category === c}
            onClick={() => {
              setCategory(c);
              update({ category: c });
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition
              ${
                category === c
                  ? "bg-[#C0392B] text-white"
                  : "bg-white text-gray-800 border border-gray-200"
              }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Food type */}
      <div className="grid grid-cols-5 border-b border-gray-200">
        {SORTS.map(({ key, label }) => (
          <button
            key={key}
            aria-pressed={sort === key}
            onClick={() => {
              setSort(key);
              update({ sort: key });
            }}
            className={`px-1 py-2 text-[11px] leading-tight font-medium border-b-2 -mb-px transition
              ${
                sort === key
                  ? "border-[#C0392B] text-[#C0392B]"
                  : "border-transparent text-gray-600"
              }`}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}