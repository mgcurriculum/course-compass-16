
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'counselor');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Universities
CREATE TABLE public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, country TEXT NOT NULL, city TEXT NOT NULL,
  ranking INT, website TEXT, partner_status BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth can view universities" ON public.universities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage universities" ON public.universities FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Courses
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  study_level TEXT NOT NULL CHECK (study_level IN ('Diploma', 'Advanced Diploma', 'Bachelor''s', 'Postgraduate Diploma', 'Master''s')),
  domain TEXT NOT NULL, degree_type TEXT, duration TEXT NOT NULL,
  tuition_fees NUMERIC NOT NULL, currency TEXT NOT NULL DEFAULT 'USD',
  course_type TEXT DEFAULT 'Full-time', description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth can view courses" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage courses" ON public.courses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Eligibility rules
CREATE TABLE public.eligibility_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL UNIQUE,
  min_10th_marks NUMERIC, min_12th_marks NUMERIC, min_graduation_marks NUMERIC,
  required_degree TEXT, min_ielts NUMERIC, min_ielts_bands NUMERIC,
  min_work_experience INT DEFAULT 0, backlogs_allowed INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.eligibility_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth can view eligibility" ON public.eligibility_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage eligibility" ON public.eligibility_rules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Academic cycles
CREATE TABLE public.academic_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  intake_name TEXT NOT NULL, month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL, application_deadline DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.academic_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth can view cycles" ON public.academic_cycles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage cycles" ON public.academic_cycles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Student profiles
CREATE TABLE public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT NOT NULL, study_level TEXT NOT NULL,
  tenth_marks NUMERIC, twelfth_marks NUMERIC, twelfth_english_marks NUMERIC,
  graduation_degree TEXT, graduation_marks NUMERIC, ielts_score NUMERIC,
  work_experience INT DEFAULT 0, preferred_countries TEXT[], preferred_domains TEXT[],
  preferred_duration TEXT, preferred_course_type TEXT, max_tuition_fee NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profiles" ON public.student_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own profiles" ON public.student_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profiles" ON public.student_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own profiles" ON public.student_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Saved courses
CREATE TABLE public.saved_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  student_profile_id UUID REFERENCES public.student_profiles(id) ON DELETE SET NULL,
  match_score NUMERIC, eligibility_status TEXT CHECK (eligibility_status IN ('Eligible', 'Borderline', 'Not Eligible')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id, student_profile_id)
);
ALTER TABLE public.saved_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own saved" ON public.saved_courses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users save courses" ON public.saved_courses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unsave courses" ON public.saved_courses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_universities_updated_at BEFORE UPDATE ON public.universities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_eligibility_rules_updated_at BEFORE UPDATE ON public.eligibility_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_academic_cycles_updated_at BEFORE UPDATE ON public.academic_cycles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_courses_study_level ON public.courses(study_level);
CREATE INDEX idx_courses_university_id ON public.courses(university_id);
CREATE INDEX idx_courses_domain ON public.courses(domain);
CREATE INDEX idx_eligibility_course_id ON public.eligibility_rules(course_id);
CREATE INDEX idx_academic_cycles_course_id ON public.academic_cycles(course_id);
CREATE INDEX idx_saved_courses_user ON public.saved_courses(user_id);
CREATE INDEX idx_student_profiles_user ON public.student_profiles(user_id);
