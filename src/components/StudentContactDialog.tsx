import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useStudentContact } from '@/contexts/StudentContactContext';
import type { MatchResult } from '@/lib/matching-engine';

interface StudentContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: MatchResult | null;
  onSaved: (courseId: string, contactId: string) => void;
}

export function StudentContactDialog({ open, onOpenChange, result, onSaved }: StudentContactDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { setActiveContact } = useStudentContact();
  const [studentName, setStudentName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);

  const lookupMobile = async (mobileNum: string) => {
    if (mobileNum.length < 10) return;
    setLookingUp(true);
    const { data } = await supabase
      .from('student_contacts')
      .select('*')
      .eq('mobile', mobileNum)
      .maybeSingle();
    if (data) {
      setStudentName(data.student_name);
      setEmail(data.email);
      if (data.dob) setDob(new Date(data.dob));
    }
    setLookingUp(false);
  };

  const handleSubmit = async () => {
    if (!user || !result) return;
    if (!studentName.trim() || !mobile.trim() || !email.trim()) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      // Upsert student contact
      const { data: contact, error: contactErr } = await supabase
        .from('student_contacts')
        .upsert(
          {
            user_id: user.id,
            student_name: studentName.trim(),
            mobile: mobile.trim(),
            email: email.trim(),
            dob: dob ? format(dob, 'yyyy-MM-dd') : null,
          },
          { onConflict: 'mobile' }
        )
        .select('id')
        .single();

      if (contactErr) throw contactErr;

      // Save course linked to contact
      const { error: saveErr } = await supabase.from('saved_courses').insert({
        user_id: user.id,
        course_id: result.course.id,
        match_score: result.matchScore,
        eligibility_status: result.eligibilityStatus,
        student_contact_id: contact.id,
      });

      if (saveErr) throw saveErr;

      toast({ title: 'Course saved for ' + studentName });
      // Set active contact so future saves skip the dialog
      setActiveContact({ id: contact.id, student_name: studentName.trim(), mobile: mobile.trim(), email: email.trim() });
      onSaved(result.course.id, contact.id);
      onOpenChange(false);
      // Reset form
      setStudentName('');
      setMobile('');
      setEmail('');
      setDob(undefined);
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Save Course for Student
          </DialogTitle>
          <DialogDescription>
            Enter student details to save <span className="font-medium">{result?.course.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number *</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="e.g. 9876543210"
              value={mobile}
              onChange={e => {
                setMobile(e.target.value);
                if (e.target.value.length >= 10) lookupMobile(e.target.value);
              }}
              required
            />
            {lookingUp && <p className="text-xs text-muted-foreground">Looking up...</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentName">Student Name *</Label>
            <Input
              id="studentName"
              placeholder="Full name"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn('w-full justify-start text-left font-normal', !dob && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dob ? format(dob, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dob}
                  onSelect={setDob}
                  disabled={date => date > new Date() || date < new Date('1980-01-01')}
                  initialFocus
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Course
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
