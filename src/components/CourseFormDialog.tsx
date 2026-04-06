import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface CourseFormData {
  name: string;
  university_id: string;
  study_level: string;
  domain: string;
  degree_type: string | null;
  duration: string;
  tuition_fees: number;
  currency: string;
  course_type: string | null;
  description: string | null;
}

interface EligibilityData {
  min_10th_marks: number | null;
  min_12th_marks: number | null;
  min_graduation_marks: number | null;
  min_ielts: number | null;
  min_ielts_bands: number | null;
  min_work_experience: number | null;
  required_degree: string | null;
  backlogs_allowed: number | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: any;
  eligibility?: any;
  onSave: (course: CourseFormData, eligibility: EligibilityData) => void;
  saving?: boolean;
}

const STUDY_LEVELS = ["Bachelor's", "Master's", 'PhD', 'Diploma', 'Certificate'];
const DOMAINS = ['Computer Science', 'Engineering', 'Business', 'Data Science', 'Economics', 'Health Sciences', 'Biology', 'Physics', 'Psychology', 'Education', 'Political Science', 'Architecture', 'Environmental Science'];
const CURRENCIES = ['USD', 'GBP', 'EUR', 'CAD', 'AUD'];

export function CourseFormDialog({ open, onOpenChange, course, eligibility, onSave, saving }: Props) {
  const [form, setForm] = useState<CourseFormData>({
    name: '', university_id: '', study_level: "Bachelor's", domain: 'Computer Science',
    degree_type: null, duration: '', tuition_fees: 0, currency: 'USD', course_type: 'Full-time', description: null,
  });
  const [elig, setElig] = useState<EligibilityData>({
    min_10th_marks: null, min_12th_marks: null, min_graduation_marks: null,
    min_ielts: null, min_ielts_bands: null, min_work_experience: null, required_degree: null, backlogs_allowed: null,
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-list'],
    queryFn: async () => {
      const { data } = await supabase.from('universities').select('id, name, country').order('name');
      return data || [];
    },
  });

  useEffect(() => {
    if (course) {
      setForm({
        name: course.name, university_id: course.university_id, study_level: course.study_level,
        domain: course.domain, degree_type: course.degree_type, duration: course.duration,
        tuition_fees: course.tuition_fees, currency: course.currency, course_type: course.course_type, description: course.description,
      });
    } else {
      setForm({ name: '', university_id: '', study_level: "Bachelor's", domain: 'Computer Science', degree_type: null, duration: '', tuition_fees: 0, currency: 'USD', course_type: 'Full-time', description: null });
    }
    if (eligibility) {
      setElig({
        min_10th_marks: eligibility.min_10th_marks, min_12th_marks: eligibility.min_12th_marks,
        min_graduation_marks: eligibility.min_graduation_marks, min_ielts: eligibility.min_ielts,
        min_ielts_bands: eligibility.min_ielts_bands, min_work_experience: eligibility.min_work_experience,
        required_degree: eligibility.required_degree, backlogs_allowed: eligibility.backlogs_allowed,
      });
    } else {
      setElig({ min_10th_marks: null, min_12th_marks: null, min_graduation_marks: null, min_ielts: null, min_ielts_bands: null, min_work_experience: null, required_degree: null, backlogs_allowed: null });
    }
  }, [course, eligibility, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form, elig);
  };

  const numField = (label: string, value: number | null, onChange: (v: number | null) => void) => (
    <div className="space-y-1">
      <Label className="text-sm">{label}</Label>
      <Input type="number" step="any" value={value ?? ''} onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course ? 'Edit Course' : 'Add Course'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Course Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>University *</Label>
            <Select value={form.university_id} onValueChange={(v) => setForm({ ...form, university_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select university" /></SelectTrigger>
              <SelectContent>
                {universities.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name} ({u.country})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Study Level *</Label>
              <Select value={form.study_level} onValueChange={(v) => setForm({ ...form, study_level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STUDY_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Domain *</Label>
              <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Duration *</Label>
              <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 2 years" required />
            </div>
            <div className="space-y-2">
              <Label>Tuition Fees *</Label>
              <Input type="number" value={form.tuition_fees} onChange={(e) => setForm({ ...form, tuition_fees: parseFloat(e.target.value) || 0 })} required />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Degree Type</Label>
              <Input value={form.degree_type || ''} onChange={(e) => setForm({ ...form, degree_type: e.target.value || null })} placeholder="e.g. BSc, MSc" />
            </div>
            <div className="space-y-2">
              <Label>Course Type</Label>
              <Select value={form.course_type || 'Full-time'} onValueChange={(v) => setForm({ ...form, course_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />
          <h3 className="text-sm font-semibold text-foreground">Eligibility Rules</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {numField('Min 10th %', elig.min_10th_marks, (v) => setElig({ ...elig, min_10th_marks: v }))}
            {numField('Min 12th %', elig.min_12th_marks, (v) => setElig({ ...elig, min_12th_marks: v }))}
            {numField('Min Graduation %', elig.min_graduation_marks, (v) => setElig({ ...elig, min_graduation_marks: v }))}
            {numField('Min IELTS', elig.min_ielts, (v) => setElig({ ...elig, min_ielts: v }))}
            {numField('Min IELTS Bands', elig.min_ielts_bands, (v) => setElig({ ...elig, min_ielts_bands: v }))}
            {numField('Min Work Exp (yrs)', elig.min_work_experience, (v) => setElig({ ...elig, min_work_experience: v ? Math.round(v) : null }))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm">Required Degree</Label>
              <Input value={elig.required_degree || ''} onChange={(e) => setElig({ ...elig, required_degree: e.target.value || null })} />
            </div>
            {numField('Backlogs Allowed', elig.backlogs_allowed, (v) => setElig({ ...elig, backlogs_allowed: v ? Math.round(v) : null }))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
