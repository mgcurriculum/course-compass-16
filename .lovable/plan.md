

# Admin Backend + Analytics Dashboard

## Summary
Add two major features: (1) Admin pages to manage universities and courses (CRUD), and (2) an analytics dashboard showing insights on student preferences, course popularity, and country demand.

## New Pages

### 1. Universities Management (`src/pages/Universities.tsx`)
- Table listing all universities with Name, Country, City, Ranking, Partner Status
- "Add University" button opens a dialog/form with all fields
- Edit and Delete actions per row
- Admin-only access (check `userRole === 'admin'`)

### 2. Courses Management (`src/pages/Courses.tsx`)
- Table listing all courses with Name, University, Domain, Study Level, Fees, Duration
- "Add Course" button opens a multi-section form: basic info, eligibility rules, academic cycles
- Edit and Delete actions per row
- University selector dropdown (populated from universities table)
- Admin-only access

### 3. Dashboard (`src/pages/Dashboard.tsx`)
- Available to both admin and counselor roles
- Cards showing key metrics:
  - Total Students, Total Saved Courses, Total Universities, Total Courses
- Charts (using recharts, already available):
  - **Country Preferences**: Bar chart of most preferred countries across all student contacts
  - **Domain Preferences**: Bar chart of most preferred domains
  - **Top Courses**: Horizontal bar of most-saved courses
  - **Eligibility Distribution**: Pie chart of Eligible / Borderline / Not Eligible from saved_courses
- Data sourced from `student_contacts`, `saved_courses`, `courses`, `universities`

## Navigation Updates

### `src/components/AppSidebar.tsx`
- Add nav items:
  - "Dashboard" (icon: `BarChart3`) — all roles, first position
  - "Universities" (icon: `Building2`) — admin only
  - "Courses" (icon: `GraduationCap`) — admin only
- Conditionally show admin items based on `userRole` from `useAuth()`

### `src/App.tsx`
- Add routes: `/dashboard`, `/universities`, `/courses`

## Components

### `src/components/UniversityFormDialog.tsx`
- Dialog with fields: Name, Country, City, Ranking, Partner Status, Website
- Used for both Add and Edit

### `src/components/CourseFormDialog.tsx`
- Dialog with fields: Name, University (select), Study Level, Domain, Degree Type, Duration, Fees, Currency, Course Type, Description
- Expandable sections for Eligibility Rules and Academic Cycles

## No Database Changes
All tables already exist with proper RLS. Admin role already has ALL access on universities, courses, eligibility_rules, and academic_cycles.

## Files
- **Create**: `src/pages/Dashboard.tsx`, `src/pages/Universities.tsx`, `src/pages/Courses.tsx`, `src/components/UniversityFormDialog.tsx`, `src/components/CourseFormDialog.tsx`
- **Modify**: `src/components/AppSidebar.tsx` (add nav items, role-based visibility), `src/App.tsx` (add routes)

