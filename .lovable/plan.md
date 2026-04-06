

# Session-Persistent Student Contact + Seed Dummy Courses

## 1. Student contact persists per session

**Problem**: Every time a counselor clicks "Save Course", the dialog asks for student details again.

**Solution**: Store the active student contact in React state (lifted to `Index.tsx` or a context). After the first save, skip the dialog and directly save subsequent courses using the stored contact ID. Clear on logout.

### Changes
- **`src/components/ResultsTable.tsx`**: Accept an optional `activeContact` prop. If set, clicking save skips the dialog and directly inserts into `saved_courses` using that contact. If not set, open the dialog as before.
- **`src/components/StudentContactDialog.tsx`**: After successful save, return the full contact object (id, name, mobile, email) via `onSaved` callback.
- **`src/pages/Index.tsx`**: Hold `activeContact` state. When first save completes, store the contact. Pass it to `ResultsTable`. Show a small indicator bar ("Saving for: Student Name — Change") so the counselor knows which student is active and can switch.
- **`src/pages/CourseDetail.tsx`**: Same pattern — accept `activeContact` via a shared context or prop.
- Optionally create a lightweight `StudentContactContext` so both Index and CourseDetail share the active contact without prop drilling. Context clears on logout (listen to auth state).

## 2. Seed 20+ dummy courses across multiple universities

Insert sample data via the database insert tool covering multiple study levels (Bachelor's, Master's, Diploma), countries (UK, US, Canada, Australia), and domains (CS, Business, Engineering, Data Science). Include:
- 6-8 universities across different countries
- 20-30 courses spread across those universities
- Eligibility rules for each course
- Academic cycles (intakes) for each course

This ensures searches return meaningful results regardless of filter combination.

## Files

### Create
- `src/contexts/StudentContactContext.tsx` — context for active student contact (persists until logout)

### Modify
- `src/pages/Index.tsx` — wrap with context provider, show active student indicator
- `src/components/ResultsTable.tsx` — use context; skip dialog if contact active
- `src/components/StudentContactDialog.tsx` — return full contact on save
- `src/pages/CourseDetail.tsx` — use context for save button
- `src/App.tsx` — wrap routes with `StudentContactProvider`

### Data insert
- Insert ~8 universities, ~25 courses, eligibility rules, and academic cycles via database insert tool

