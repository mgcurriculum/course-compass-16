

# Save Student Profile & Preferences with Contact

## Summary
Add educational qualification, graduated year, IELTS score, work experience, preferred countries, and preferred domains fields to the `student_contacts` table. When a counselor sets a student, these preferences are saved alongside the contact info and auto-loaded when selecting an existing student.

## Database Changes

Add new columns to `student_contacts`:

```sql
ALTER TABLE student_contacts
  ADD COLUMN educational_qualification text,
  ADD COLUMN graduated_year integer,
  ADD COLUMN ielts_score numeric,
  ADD COLUMN work_experience integer DEFAULT 0,
  ADD COLUMN preferred_countries text[] DEFAULT '{}',
  ADD COLUMN preferred_domains text[] DEFAULT '{}';
```

No new tables needed — extends the existing `student_contacts` table which already has RLS.

## UI Changes

### `src/components/StudentDetailsBar.tsx`
- Add new form fields below the existing Name/Mobile/Email/DOB row:
  - **Row 2**: Educational Qualification (select: 10th, 12th, Diploma, Bachelor's, Master's), Graduated Year (number input), IELTS Score (number input), Work Experience in years (number input)
  - **Row 3**: Preferred Countries (badge toggles, same list as SearchFilters), Preferred Domains (badge toggles, same list as SearchFilters)
- Save all new fields in the `upsert` call to `student_contacts`
- Auto-fill these fields when looking up by mobile or selecting existing student
- Show key preferences in the collapsed active contact summary (e.g. qualification + IELTS)

### `src/contexts/StudentContactContext.tsx`
- Extend `ActiveContact` interface to include the new fields so they're available app-wide

### `src/components/SearchFilters.tsx`
- When an active contact has preferences set, auto-populate the matching search filter fields (IELTS, work exp, countries, domains) as defaults

## Files Modified
- **Migration**: Add 6 columns to `student_contacts`
- `src/components/StudentDetailsBar.tsx` — add preference fields, save/load logic
- `src/contexts/StudentContactContext.tsx` — extend ActiveContact type
- `src/components/SearchFilters.tsx` — auto-fill from active contact preferences

