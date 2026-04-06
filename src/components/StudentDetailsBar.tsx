import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ChevronDown, ChevronUp, Loader2, UserCheck, UserPlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useStudentContact } from '@/contexts/StudentContactContext';

export function StudentDetailsBar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { activeContact, setActiveContact, clearContact } = useStudentContact();
  const [open, setOpen] = useState(!activeContact);
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

  const handleSetStudent = async () => {
    if (!user) return;
    if (!studentName.trim() || !mobile.trim() || !email.trim()) {
      toast({ title: 'Please fill Name, Mobile & Email', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { data: contact, error } = await supabase
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
      if (error) throw error;
      setActiveContact({ id: contact.id, student_name: studentName.trim(), mobile: mobile.trim(), email: email.trim() });
      setOpen(false);
      toast({ title: 'Student set: ' + studentName.trim() });
    } catch (err: any) {
      toast({ title: 'Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = () => {
    clearContact();
    setStudentName('');
    setMobile('');
    setEmail('');
    setDob(undefined);
    setOpen(true);
  };

  if (activeContact && !open) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-3 py-3 px-4">
          <UserCheck className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Student:</span>
          <Badge variant="secondary">{activeContact.student_name}</Badge>
          <span className="text-xs text-muted-foreground">{activeContact.mobile}</span>
          <span className="text-xs text-muted-foreground">{activeContact.email}</span>
          <Button variant="outline" size="sm" className="ml-auto" onClick={handleChange}>Change</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Student Details</span>
            </div>
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sd-mobile" className="text-xs">Mobile *</Label>
                <Input
                  id="sd-mobile"
                  type="tel"
                  placeholder="9876543210"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  onBlur={() => lookupMobile(mobile)}
                />
                {lookingUp && <p className="text-xs text-muted-foreground">Looking up...</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sd-name" className="text-xs">Student Name *</Label>
                <Input id="sd-name" placeholder="Full name" value={studentName} onChange={e => setStudentName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sd-email" className="text-xs">Email *</Label>
                <Input id="sd-email" type="email" placeholder="student@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal h-10', !dob && 'text-muted-foreground')}>
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
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleSetStudent} disabled={loading} size="sm">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Set Student
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Skip for Now
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
