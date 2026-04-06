

# Increase Text Size Across Course Discovery Page

## Problem
Labels, placeholders, badges, and headings throughout the Student Details bar, Search Filters, and page header are using `text-xs` (12px) and `text-sm` (14px), making them hard to read.

## Changes

### 1. `src/components/StudentDetailsBar.tsx`
- Section heading "Student Details": `text-sm` → `text-base font-semibold`
- All `Label` elements: `text-xs` → `text-sm`
- "Search existing student" label: `text-xs` → `text-sm`
- Search input placeholder: already fine (inherits base)
- Divider text "or enter new details": `text-xs` → `text-sm`
- Active contact summary: name `text-sm` → `text-base`, mobile/email `text-xs` → `text-sm`
- Button text: ensure `text-sm` minimum
- Dropdown items: `text-sm` (already fine)
- "Looking up..." text: `text-xs` → `text-sm`

### 2. `src/components/SearchFilters.tsx`
- Section heading "Search Filters": `text-sm` → `text-base font-semibold`
- All `Label` elements: `text-xs` → `text-sm`
- Badge toggles (countries/domains): `text-xs` → `text-sm`
- Collapsed badge: `text-xs` → `text-sm`

### 3. `src/pages/Index.tsx`
- Header title: `text-base` → `text-lg`
- Header icon: `h-4 w-4` → `h-5 w-5`

### Files modified
- `src/components/StudentDetailsBar.tsx`
- `src/components/SearchFilters.tsx`
- `src/pages/Index.tsx`

