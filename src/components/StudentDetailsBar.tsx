import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ChevronDown, ChevronUp, Loader2, Search, UserCheck, UserPlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useStudentContact } from '@/contexts/StudentContactContext';

interface StudentContact {
  id: string;
  student_name: string;
  mobile: string;
  email: string;
  dob: string | null;
}

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

  const [contacts, setContacts] = useState<StudentContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!user || !open) return;
    supabase
      .from('student_contacts')
      .select('id, student_name, mobile, email, dob')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        if (data) setContacts(data);
      });
  }, [user, open]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return contacts.slice(0, 10);
    const q = searchQuery.toLowerCase();
    return contacts.filter(
      c => c.student_name.toLowerCase().includes(q) || c.mobile.includes(q) || c.email.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [contacts, searchQuery]);

  const selectExisting = (c: StudentContact) => {
    setActiveContact({ id: c.id, student_name: c.student_name, mobile: c.mobile, email: c.email });
    setSearchQuery('');
    setShowDropdown(false);
    setOpen(false);
    toast({ title: 'Student set: ' + c.student_name });
  };

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
    setSearchQuery('');
    setOpen(true);
  };

  if (activeContact && !open) {
    return (
      <Card className="border-primary/15 bg-primary/[0.03]">
        <CardContent className="flex items-center gap-3 py-3 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <UserCheck className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-base font-medium text-foreground">{activeContact.student_name}</span>
          <span className="text-sm text-muted-foreground">{activeContact.mobile}</span>
          <span className="text-sm text-muted-foreground hidden sm:inline">{activeContact.email}</span>
          <Button variant="ghost" size="sm" className="ml-auto text-xs text-muted-foreground hover:text-foreground" onClick={handleChange}>
            Change
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-border/50">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              <span className="font-semibold text-base">Student Details</span>
            </div>
            {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-5 px-5 space-y-4">
            {/* Search existing */}
            {contacts.length > 0 && (
              <div className="relative">
                <Label className="text-sm text-muted-foreground mb-1.5 block">Search existing student</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, mobile, or email..."
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    className="pl-9"
                  />
                </div>
                {showDropdown && filtered.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg max-h-48 overflow-y-auto">
                    {filtered.map(c => (
                      <button
                        key={c.id}
                        className="w-full text-left px-3 py-2.5 hover:bg-muted/50 text-sm flex items-center justify-between gap-2 transition-colors"
                        onMouseDown={() => selectExisting(c)}
                      >
                        <span className="font-medium truncate">{c.student_name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{c.mobile}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {contacts.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border/60" />
                <span className="text-sm text-muted-foreground">or enter new details</span>
                <div className="flex-1 h-px bg-border/60" />
              </div>
            )}

            {/* Manual entry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sd-mobile" className="text-sm text-muted-foreground">Mobile *</Label>
                <Input
                  id="sd-mobile"
                  type="tel"
                  placeholder="9876543210"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  onBlur={() => lookupMobile(mobile)}
                />
                {lookingUp && <p className="text-sm text-muted-foreground">Looking up...</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sd-name" className="text-sm text-muted-foreground">Student Name *</Label>
                <Input id="sd-name" placeholder="Full name" value={studentName} onChange={e => setStudentName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sd-email" className="text-sm text-muted-foreground">Email *</Label>
                <Input id="sd-email" type="email" placeholder="student@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Date of Birth</Label>
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
              <Button onClick={handleSetStudent} disabled={loading} size="sm" className="shadow-sm">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Set Student
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setOpen(false)}>
                Skip for Now
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
