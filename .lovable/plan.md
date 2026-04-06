

# Course Detail Page, Student Profiles & UI Modernization

## Summary
Add a course detail page, student contact capture on save, student profile search, new filter fields, and modernize the UI across the app.

## Database Changes

### 1. New `student_contacts` table
Stores student info captured when saving a course. Mobile number is the unique identifier.

```sql
CREATE TABLE public.student_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  student_name text NOT NULL,
  mobile text NOT NULL UNIQUE,
  email text NOT NULL,
  dob date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_contacts ENABLE ROW LEVEL SECURITY;
-- RLS: authenticated users can CRUD their own, admins can view all
```

### 2. Modify `saved_courses` table
Add `student_contact_id` (FK to `student_contacts`) so each saved course is linked to a student contact.

### 3. Add `brochure_url` and `website` columns to `courses` table
- `brochure_url text` — link to downloadable brochure PDF
- University `website` column already exists on `universities` table

## New Pages & Components

### 4. Course Detail Page (`/course/:id`)
- Full-page view of a single course with all details
- Sections: Overview, Eligibility Requirements, Intakes/Deadlines, University Info
- Show university website link (clickable, opens in new tab)
- "Download Brochure" button (links to `brochure_url` if available, disabled otherwise)
- "Save Course" button that triggers the student contact dialog
- Add route in `App.tsx`

### 5. Student Contact Dialog (Modal)
When user clicks "Save/Shortlist" on a course (from results table or detail page):
- Modal asks for: Student Name, Mobile Number, Email, Date of Birth
- If mobile number already exists in `student_contacts`, auto-fill the rest
- On submit: upsert into `student_contacts`, then insert into `saved_courses` with `student_contact_id`
- This replaces the current direct-save behavior

### 6. Student Profiles Page (`/students`)
- Searchable list of all student contacts (search by name, mobile, email)
- Click a student to see their profile + all saved courses
- Add to sidebar navigation
- Admin/counselor accessible

## Filter Enhancements

### 7. Add to `SearchFilters.tsx`
- **Years of Experience**: number input (already exists as "Work Exp" for Master's, but make it always visible)
- **Date of Birth**: date picker input (stored on student contact, used for age-based filtering if needed)

## UI Modernization

### 8. Visual refresh across components
- **SearchFilters**: Add subtle gradients on the card header, use rounded-xl cards, softer shadows (`shadow-sm`), pill-shaped badges for countries/domains, smoother transitions
- **ResultsTable**: Add hover row highlights, subtle alternating row colors, rounded avatar-style university initials, progress-bar style match score instead of plain text, card-style on mobile
- **Header**: Gradient accent bar or subtle brand color strip
- **Buttons**: Use gradient primary buttons, rounded-lg
- **Overall**: Increase spacing, use `tracking-tight` on headings, add `transition-all` on interactive elements
- **Login page**: Modernize with a side illustration or gradient panel

## Technical Details

### Files to create
- `src/pages/CourseDetail.tsx` — course detail page
- `src/components/StudentContactDialog.tsx` — modal for capturing student info
- `src/pages/Students.tsx` — student profiles list + detail view

### Files to modify
- `src/App.tsx` — add routes for `/course/:id` and `/students`
- `src/components/AppSidebar.tsx` — add Students nav item
- `src/components/ResultsTable.tsx` — add "View" link to course detail, modernize styling, change save to open dialog
- `src/components/SearchFilters.tsx` — add experience + DOB fields, modernize styling
- `src/pages/Index.tsx` — pass dialog handler, modernize layout
- `src/pages/Shortlisted.tsx` — modernize styling
- `src/pages/Login.tsx` — modernize layout
- `src/index.css` — refined color tokens, subtle gradients

### Migration
- Create `student_contacts` table with RLS
- Add `student_contact_id` to `saved_courses`
- Add `brochure_url` to `courses`

