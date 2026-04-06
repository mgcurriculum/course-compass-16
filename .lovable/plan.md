

# Student Details First, Then Search Filters

## What changes
Restructure the main page flow so student details (Name, Email, Mobile, DOB) appear as the first section at the top, with a "Skip for Now" option. Once filled (or skipped), the search filters and results show below.

## Layout

```text
┌──────────────────────────────────────────────┐
│  Header: Course Discovery                    │
├──────────────────────────────────────────────┤
│  Student Details Card (collapsible)          │
│  ┌────────┬──────────┬──────────┬──────────┐ │
│  │ Name   │ Mobile   │ Email    │ DOB      │ │
│  └────────┴──────────┴──────────┴──────────┘ │
│  [Set Student]              [Skip for Now]   │
├──────────────────────────────────────────────┤
│  Search Filters (collapsible)                │
├──────────────────────────────────────────────┤
│  Results Table                               │
└──────────────────────────────────────────────┘
```

## Technical details

### 1. Create `src/components/StudentDetailsBar.tsx`
- A collapsible card (similar style to SearchFilters) with 4 fields in a grid: Student Name, Mobile, Email, DOB
- Mobile field does a lookup on blur (reuse existing logic from StudentContactDialog) — if contact exists, auto-fills name/email/DOB
- Two buttons: "Set Student" (upserts to `student_contacts` and sets active contact in context) and "Skip for Now" (collapses the card, leaves no active contact)
- When `activeContact` is already set, show a summary bar instead (name, mobile) with a "Change" button
- On "Set Student", the card collapses and shows the summary bar

### 2. Update `src/pages/Index.tsx`
- Render `StudentDetailsBar` above `SearchFilters`
- Remove the existing `activeContact` indicator bar (it moves into `StudentDetailsBar`)
- When saving courses, if contact was skipped, the existing `StudentContactDialog` still triggers; if contact is set, saves directly (existing behavior)

### 3. Update `src/components/ResultsTable.tsx`
- No changes needed — it already checks `activeContact` from context and either saves directly or opens the dialog

### Files
- **Create**: `src/components/StudentDetailsBar.tsx`
- **Modify**: `src/pages/Index.tsx` — add StudentDetailsBar, remove inline contact indicator

