

# Rebrand to Edroots International + UI Modernization

## Summary
Rebrand the entire product from "SACDMS" to **Edroots International** with a refined, minimal aesthetic. Update color palette to a sophisticated teal/emerald tone, modernize all page layouts with cleaner spacing, softer cards, and subtle animations.

## Branding Changes

### Identity
- Product name: **Edroots International**
- Tagline: "Your Gateway to Global Education"
- Replace all `SACDMS` references across sidebar, login page, and page titles
- Update `index.html` title and meta tags

### Color Palette
Shift from generic blue to a distinctive teal/emerald brand color:
- Primary: `195 85% 35%` (deep teal — professional, education-oriented)
- Sidebar: Dark navy with teal accents
- Subtle warm grays for backgrounds instead of cold blue-grays

## UI Modernization

### Global (`src/index.css`)
- Refined color tokens with the new teal palette
- Slightly larger border radius (`0.75rem`)
- Softer shadows and border colors

### Login Page (`src/pages/Login.tsx`)
- Replace GraduationCap branding with "Edroots International" text and a clean globe/education icon
- Update copy: tagline, feature bullets
- Cleaner left panel gradient using new brand colors

### Sidebar (`src/components/AppSidebar.tsx`)
- Replace "SACDMS" with "Edroots" brand name
- Use a minimal text logo instead of icon-heavy approach

### Main Page (`src/pages/Index.tsx`)
- Header: "Course Discovery" with Edroots branding
- Cleaner spacing between StudentDetailsBar, SearchFilters, and ResultsTable

### StudentDetailsBar (`src/components/StudentDetailsBar.tsx`)
- Softer card styling, subtle border highlights
- Cleaner active student indicator

### SearchFilters (`src/components/SearchFilters.tsx`)
- Minimalist filter card with lighter background
- Cleaner badge toggles for countries/domains

### ResultsTable (`src/components/ResultsTable.tsx`)
- Cleaner table with subtle hover states
- Refined status badges without emoji (use colored dots instead)
- Smoother progress bars for match scores

### CourseDetail (`src/pages/CourseDetail.tsx`)
- Cleaner hero section with brand gradient
- Better card spacing and typography

### Shortlisted (`src/pages/Shortlisted.tsx`)
- Consistent with new table styling
- Cleaner empty state

### `index.html`
- Title: "Edroots International — Study Abroad Platform"
- Update meta description and OG tags

## Files Modified
- `index.html` — title + meta
- `src/index.css` — new color tokens
- `src/pages/Login.tsx` — rebrand + modernize
- `src/components/AppSidebar.tsx` — rebrand
- `src/pages/Index.tsx` — header rebrand
- `src/components/StudentDetailsBar.tsx` — styling refresh
- `src/components/SearchFilters.tsx` — styling refresh
- `src/components/ResultsTable.tsx` — cleaner table, no emoji badges
- `src/pages/CourseDetail.tsx` — styling refresh
- `src/pages/Shortlisted.tsx` — styling refresh
- `.lovable/memory/index.md` — update brand name

