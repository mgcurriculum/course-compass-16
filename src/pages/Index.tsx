import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SearchFilters } from '@/components/SearchFilters';
import { ResultsTable } from '@/components/ResultsTable';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useStudentContact } from '@/contexts/StudentContactContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCheck, X } from 'lucide-react';
import { matchCourses, type StudentInput, type CourseWithDetails, type MatchResult } from '@/lib/matching-engine';

export default function Index() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [results, setResults] = useState<MatchResult[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('saved_courses')
      .select('course_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setSavedIds(new Set(data.map(d => d.course_id)));
      });
  }, [user]);

  const handleSearch = async (input: StudentInput) => {
    setLoading(true);
    try {
      const { data: courses, error } = await supabase
        .from('courses')
        .select(`
          id, name, study_level, domain, degree_type, duration, tuition_fees, currency, course_type, description,
          universities!inner(name, country, city, ranking, partner_status),
          eligibility_rules(min_10th_marks, min_12th_marks, min_graduation_marks, required_degree, min_ielts, min_work_experience, backlogs_allowed),
          academic_cycles(intake_name, month, year, application_deadline)
        `)
        .eq('study_level', input.studyLevel);

      if (error) throw error;

      const coursesWithDetails: CourseWithDetails[] = (courses || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        study_level: c.study_level,
        domain: c.domain,
        degree_type: c.degree_type,
        duration: c.duration,
        tuition_fees: c.tuition_fees,
        currency: c.currency,
        course_type: c.course_type,
        description: c.description,
        university: c.universities,
        eligibility: c.eligibility_rules?.[0] ?? null,
        intakes: c.academic_cycles || [],
      }));

      const matched = matchCourses(input, coursesWithDetails);
      setResults(matched);
    } catch (err: any) {
      toast({ title: 'Search failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSaved = (courseId: string, _contactId: string) => {
    setSavedIds(prev => new Set(prev).add(courseId));
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 items-center border-b bg-card px-4">
        <SidebarTrigger className="mr-3" />
        <h1 className="text-lg font-semibold tracking-tight">Course Discovery</h1>
      </header>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <SearchFilters onSearch={handleSearch} loading={loading} />
        <div className="flex-1">
          <ResultsTable
            results={results}
            savedCourseIds={savedIds}
            onCourseSaved={handleCourseSaved}
          />
        </div>
      </div>
    </div>
  );
}
