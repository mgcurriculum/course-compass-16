

# Convert Search Wizard to Top Filter Bar

## What changes
Replace the current side-by-side layout (280px sidebar wizard + results table) with a single-page layout: a collapsible horizontal filter panel at the top, results table below it filling the rest of the page.

## Layout

```text
┌──────────────────────────────────────────────┐
│  Header: Course Discovery                    │
├──────────────────────────────────────────────┤
│  Filter Bar (collapsible)                    │
│  ┌─────────┬──────────┬──────────┬─────────┐ │
│  │Study Lvl│ Marks    │ IELTS   │Countries│ │
│  │ Select  │ Inputs   │ Input   │ Badges  │ │
│  ├─────────┴──────────┴──────────┴─────────┤ │
│  │ Domains (badges)  │Duration│Type│MaxFee │ │
│  ├─────────────────────────────────────────-┤ │
│  │              [Search Courses]            │ │
│  └──────────────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│  Results Table (full width, scrollable)      │
│                                              │
└──────────────────────────────────────────────┘
```

## Technical details

### 1. Rewrite `SearchWizard.tsx` as `SearchFilters.tsx`
- Remove the 3-step wizard; show all fields at once in a horizontal/grid layout
- Study Level: a `Select` dropdown
- Academic fields shown/hidden dynamically based on study level (same logic)
- All inputs arranged in a responsive grid (e.g. `grid-cols-2 md:grid-cols-4 lg:grid-cols-6`)
- Countries and Domains: badge toggles in flex-wrap rows
- Duration, Course Type, Max Fee: inline selects/inputs
- Single "Search Courses" button
- Wrap in a collapsible card so users can collapse filters after searching

### 2. Update `Index.tsx` layout
- Remove the side-by-side flex layout
- Render `SearchFilters` at the top (full width)
- Render `ResultsTable` below (full width, flex-1 with overflow scroll)

### Files modified
- `src/components/SearchWizard.tsx` — rewrite to single-panel filter layout (rename export)
- `src/pages/Index.tsx` — change from side-by-side to stacked vertical layout

