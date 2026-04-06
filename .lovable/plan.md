
# Study Abroad Course Discovery & Management System (SACDMS)

## Phase 1: Core Search Engine + Foundation

### 1. Database Schema (Lovable Cloud / Supabase)
- **universities** — name, country, city, ranking, website, partner_status
- **courses** — name, university_id (FK), study_level, domain, degree_type, duration, tuition_fees, currency, description
- **eligibility_rules** — course_id (FK), min_10th_marks, min_12th_marks, min_graduation_marks, required_degree, min_ielts, min_ielts_bands, min_work_experience, backlogs_allowed
- **academic_cycles** — course_id (FK), intake_name, month, year, application_deadline
- **user_roles** — user_id, role (admin/counselor) with RLS
- **student_profiles** — counselor-created student snapshots
- **saved_courses** — user_id, course_id, student_profile_id

### 2. Authentication & Authorization
- Admin-only user creation (no public signup)
- Role-based access: Admin sees everything, Counselor sees search + shortlist
- Secure login with session management via Supabase Auth
- Seed an initial admin account

### 3. Counselor Dashboard — Step-Based Course Search
- **Step 1**: Select study level (Diploma → Master's)
- **Step 2**: Dynamic academic input fields based on level selected (marks, IELTS, degree, experience)
- **Step 3**: Preference filters — countries, domains, duration, course type, fee range
- **Results Table**: University, course, country, duration, fees, intake, match score (%), eligibility status (✅⚠️❌)
- Sorting, pagination, and filter reset
- Clean & professional UI with a sidebar filter panel and results table

### 4. Matching Engine
- Filter courses by study level first
- Apply eligibility rules (academic marks, IELTS, degree match)
- Score against preferences (country, domain, experience) using weighted criteria
- Return match percentage + status (Eligible / Borderline / Not Eligible)

### 5. Shortlisting & Export
- Save student profile with search criteria
- Shortlist individual courses from results
- Export shortlisted courses as PDF or Excel

### 6. Sample Data
- Seed ~20 universities across 5 countries (UK, US, Canada, Australia, Germany)
- Seed ~100 courses across various levels and domains
- Seed corresponding eligibility rules and intakes

## Phase 2 (Future): Admin Management Tools
- University CRUD + bulk CSV/Excel upload
- Course CRUD + bulk upload with validation (duplicate detection, required fields)
- Eligibility rule editor per course
- Academic cycle management
- User management (create/edit counselors)

## Design
- Clean, professional SaaS look — blues/grays, minimal chrome
- Sidebar navigation: Search, Shortlists, (Admin section for admins)
- Step-based search uses a wizard/stepper UI pattern
- Results use a data table with status badges and sortable columns
- Responsive but optimized for desktop (counselor workstation use)
