
-- 1. Create student_contacts table
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

-- RLS: authenticated users can manage contacts they created
CREATE POLICY "Users manage own contacts" ON public.student_contacts
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS: admins can view all contacts
CREATE POLICY "Admins view all contacts" ON public.student_contacts
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_student_contacts_updated_at
  BEFORE UPDATE ON public.student_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Add student_contact_id to saved_courses
ALTER TABLE public.saved_courses
  ADD COLUMN student_contact_id uuid REFERENCES public.student_contacts(id);

-- 3. Add brochure_url to courses
ALTER TABLE public.courses
  ADD COLUMN brochure_url text;
