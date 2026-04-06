ALTER TABLE public.student_contacts
  ADD COLUMN IF NOT EXISTS educational_qualification text,
  ADD COLUMN IF NOT EXISTS graduated_year integer,
  ADD COLUMN IF NOT EXISTS ielts_score numeric,
  ADD COLUMN IF NOT EXISTS work_experience integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS preferred_countries text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_domains text[] DEFAULT '{}';