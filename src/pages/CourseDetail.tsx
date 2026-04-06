import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useStudentContact } from '@/contexts/StudentContactContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StudentContactDialog } from '@/components/StudentContactDialog';
import { ArrowLeft, BookmarkPlus, Download, ExternalLink, GraduationCap, MapPin, Calendar, Clock, DollarSign, Loader2 } from 'lucide-react';
import type { MatchResult, CourseWithDetails } from '@/lib/matching-engine';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { activeContact } = useStudentContact();
  const [course, setCourse] = useState<(CourseWithDetails & { brochure_url?: string | null }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id, name, study_level, domain, degree_type, duration, tuition_fees, currency, course_type, description, brochure_url,
          universities!inner(name, country, city, ranking, partner_status, website),
          eligibility_rules(min_10th_marks, min_12th_marks, min_graduation_marks, required_degree, min_ielts, min_work_experience, backlogs_allowed),
          academic_cycles(intake_name, month, year, application_deadline)
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        setCourse({
          id: data.id,
          name: data.name,
          study_level: data.study_level,
          domain: data.domain,
          degree_type: data.degree_type,
          duration: data.duration,
          tuition_fees: data.tuition_fees,
          currency: data.currency,
          course_type: data.course_type,
          description: data.description,
          brochure_url: (data as any).brochure_url,
          university: data.universities as any,
          eligibility: (data.eligibility_rules as any)?.[0] ?? null,
          intakes: (data.academic_cycles as any) || [],
        });
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Course not found</p>
        <Button variant="outline" onClick={() => navigate('/')}>Go Back</Button>
      </div>
    );
  }

  const uni = course.university as any;
  const elig = course.eligibility;

  const mockResult: MatchResult = {
    course,
    matchScore: 0,
    eligibilityStatus: 'Eligible',
    eligibilitySummary: '',
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 items-center gap-3 border-b bg-card px-4">
        <SidebarTrigger />
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold tracking-tight truncate">{course.name}</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Hero */}
          <div className="rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{course.name}</h2>
                <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  {uni.name}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">{course.study_level}</Badge>
                  <Badge variant="outline">{course.domain}</Badge>
                  {course.course_type && <Badge variant="outline">{course.course_type}</Badge>}
                  {uni.partner_status && <Badge className="bg-primary/20 text-primary">Partner</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setDialogOpen(true)}>
                  <BookmarkPlus className="mr-2 h-4 w-4" /> Save Course
                </Button>
                {course.brochure_url && (
                  <Button variant="outline" asChild>
                    <a href={course.brochure_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" /> Brochure
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Overview */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader><CardTitle className="text-base">Overview</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> Duration: {course.duration}</div>
                <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /> Fees: {course.currency} {course.tuition_fees.toLocaleString()}</div>
                {course.degree_type && <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-muted-foreground" /> Degree: {course.degree_type}</div>}
                {course.description && (
                  <>
                    <Separator />
                    <p className="text-muted-foreground">{course.description}</p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* University */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader><CardTitle className="text-base">University</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="font-medium">{uni.name}</p>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {uni.city}, {uni.country}</div>
                {uni.ranking && <p>Ranking: #{uni.ranking}</p>}
                {uni.website && (
                  <a href={uni.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" /> Visit Website
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Eligibility */}
            {elig && (
              <Card className="rounded-xl shadow-sm">
                <CardHeader><CardTitle className="text-base">Eligibility Requirements</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {elig.min_10th_marks != null && <p>10th Marks: ≥ {elig.min_10th_marks}%</p>}
                  {elig.min_12th_marks != null && <p>12th Marks: ≥ {elig.min_12th_marks}%</p>}
                  {elig.min_graduation_marks != null && <p>Graduation Marks: ≥ {elig.min_graduation_marks}%</p>}
                  {elig.required_degree && <p>Required Degree: {elig.required_degree}</p>}
                  {elig.min_ielts != null && <p>IELTS: ≥ {elig.min_ielts}</p>}
                  {elig.min_work_experience != null && elig.min_work_experience > 0 && <p>Work Exp: ≥ {elig.min_work_experience} years</p>}
                  {elig.backlogs_allowed != null && <p>Backlogs Allowed: {elig.backlogs_allowed}</p>}
                </CardContent>
              </Card>
            )}

            {/* Intakes */}
            {course.intakes.length > 0 && (
              <Card className="rounded-xl shadow-sm">
                <CardHeader><CardTitle className="text-base">Intakes & Deadlines</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {course.intakes.map((intake, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{intake.intake_name} {intake.year}</span>
                      </div>
                      {intake.application_deadline && (
                        <span className="text-xs text-muted-foreground">Deadline: {intake.application_deadline}</span>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <StudentContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        result={mockResult}
        onSaved={() => {}}
      />
    </div>
  );
}
