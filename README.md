# Sahyadri Family Restaurant & Bar Menu

A lightweight React + Vite menu application for a restaurant and bar. It renders a digital menu with category navigation, search, and separate AC / Non-AC pricing views for food and drinks.

## Project overview

This app is built with:

- React 19
- Vite
- TypeScript
- Tailwind CSS
- lucide-react

The app uses a static menu data model defined in `src/menu.ts` and renders it through `src/App.tsx`.

## Folder structure

```text
src/
  App.tsx        # Main UI and routing
  menu.ts        # Menu definitions, pricing data, and data parsing
  section.ts     # AC / Non-AC section detection using URL or session storage
  index.css      # Global styles and theme tokens
  main.tsx       # React bootstrapping
```

## Core concepts

### 1. Menu data model

The menu definitions are stored as TypeScript objects and arrays. Key types include:

- `Price`: a price row with optional label and numeric value
- `Item`: a menu item with name, description, AC price, optional non-AC price, and diet tag
- `Group`: a diet group under a category
- `Category`: a menu category with slug, title, subtitle, icon, and one or more item groups
- `DrinkSection`: a drinks grouping such as Scotch, Beer, Wine, or Cold Drinks

The data source is in `src/menu.ts` and is structured for both food and beverage pricing.

### 2. AC and Non-AC pricing

Food pricing supports both section-specific values:

- `prices`: AC price list
- `nonAcPrices?: Price[] | null`: Non-AC price list

When the app is in the Non-AC section, it prefers `nonAcPrices` if present. Otherwise it falls back to `prices`.

This behavior is implemented in `src/App.tsx`:

```ts
<PriceView prices={SECTION === 'nonac' && item.nonAcPrices !== undefined ? item.nonAcPrices : item.prices} />
```

The current section is resolved in `src/section.ts` by checking:

- query string parameter `?s=ac` or `?s=nonac`
- otherwise a saved `sessionStorage` value
- otherwise a default of `ac`

### 3. Parsing and normalization

Food menu entries are parsed from compact string formats like:

```ts
Paneer Chilly = Full 270 / Half 160
Chicken Tandoori = Half 260 / Full 460
```

The parser in `src/menu.ts` understands:

- plain numeric prices
- split prices like `Full 270 / Half 160`
- APS values (`APS` means "as per size")
- optional chef picks (`*` suffix)
- diet inference from item names

Drink menu entries are created from a structured `name|desc|pricing` text format and then matched to section-specific Non-AC pricing using normalized names.

## Rendering flow

1. `src/main.tsx` mounts the React app.
2. `src/App.tsx` reads the route and section.
3. The app chooses between:
   - landing page
   - food menu index
   - food category listing
   - drinks menu
4. `PriceView` renders the label and price values in a consistent tabular format.
5. Search is applied against item names and descriptions.

## Design notes

This project is intentionally static and content-driven rather than database-backed. That makes it easy to update menu items and prices directly in the TypeScript files without needing a backend.

The styling is theme-based and uses CSS variables for colors and layout consistency. The app is designed for phone-style menu browsing and QR-scanned restaurant access.

## Running the app locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Production build

```bash
npm run build
```

This runs TypeScript validation and creates a production bundle.

## Notes for future maintainers

- Update menu prices in `src/menu.ts`
- Keep food and drink names consistent if using the Non-AC pricing override map
- Prefer adding new categories/sections by preserving the existing `slug`, `title`, and item structure
- Test the UI after changing price data because many values are duplicated across sections and sections are conditionally rendered

## Useful references

- `src/menu.ts` — source of truth for all menu data and pricing
- `src/App.tsx` — page layout, routing, and menu display logic
- `src/section.ts` — AC vs Non-AC section selection
