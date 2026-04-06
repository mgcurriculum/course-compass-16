

# Add "Search Existing Student" to StudentDetailsBar

## What changes
Add a searchable dropdown in the StudentDetailsBar that lets counselors pick a student from their already-saved `student_contacts` list, auto-filling all fields and setting the active contact instantly.

## Layout

```text
┌──────────────────────────────────────────────────────────┐
│  Student Details                                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 🔍 Search existing student... (type-ahead dropdown) │ │
│  └─────────────────────────────────────────────────────┘ │
│  ── or enter new details ──                              │
│  ┌──────────┬──────────┬──────────┬──────────┐           │
│  │ Mobile   │ Name     │ Email    │ DOB      │           │
│  └──────────┴──────────┴──────────┴──────────┘           │
│  [Set Student]                    [Skip for Now]         │
└──────────────────────────────────────────────────────────┘
```

## Technical details

### Modify `src/components/StudentDetailsBar.tsx`
- On component mount (when `open` is true), fetch all `student_contacts` for the current user
- Add a search input above the manual fields with a filtered dropdown list (search by name, mobile, email)
- Use a simple `Command` (cmdk) popover or a filtered list with `Input` — keeps it lightweight
- When a student is selected from the list:
  - Auto-fill name, mobile, email, DOB fields
  - Immediately call `setActiveContact` and collapse the card (same as "Set Student")
- Add a visual divider ("or enter new details") between the search and manual entry fields
- No new files needed — all changes in `StudentDetailsBar.tsx`

### Files
- **Modify**: `src/components/StudentDetailsBar.tsx`

