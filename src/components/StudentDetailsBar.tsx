import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, ChevronDown, ChevronUp, Loader2, Search, UserCheck, UserPlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useStudentContact } from '@/contexts/StudentContactContext';

const QUALIFICATIONS = ['10th', '12th', 'Diploma', "Bachelor's", "Master's"];
const COUNTRIES = ['United Kingdom', 'United States', 'Canada', 'Australia', 'Germany'];
const DOMAINS = [
  'Computer Science', 'Engineering', 'Business', 'Data Science', 'Economics',
  'Health Sciences', 'Biology', 'Physics', 'Psychology', 'Education',
  'Political Science', 'Architecture', 'Environmental Science',
];

interface StudentContact {
  id: string;
  student_name: string;
  mobile: string;
  email: string;
  dob: string | null;
  educational_qualification: string | null;
  graduated_year: number | null;
  ielts_score: number | null;
  work_experience: number | null;
  preferred_countries: string[] | null;
  preferred_domains: string[] | null;
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
  const [educationalQualification, setEducationalQualification] = useState('');
  const [graduatedYear, setGraduatedYear] = useState('');
  const [ieltsScore, setIeltsScore] = useState('');
  const [workExperience, setWorkExperience] = useState('');
  const [preferredCountries, setPreferredCountries] = useState<string[]>([]);
  const [preferredDomains, setPreferredDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);

  const [contacts, setContacts] = useState<StudentContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!user || !open) return;
    supabase
      .from('student_contacts')
      .select('id, student_name, mobile, email, dob, educational_qualification, graduated_year, ielts_score, work_experience, preferred_countries, preferred_domains')
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
    setActiveContact({
      id: c.id, student_name: c.student_name, mobile: c.mobile, email: c.email,
      educational_qualification: c.educational_qualification || undefined,
      graduated_year: c.graduated_year || undefined,
      ielts_score: c.ielts_score || undefined,
      work_experience: c.work_experience || undefined,
      preferred_countries: c.preferred_countries || undefined,
      preferred_domains: c.preferred_domains || undefined,
    });
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
      setEducationalQualification(data.educational_qualification || '');
      setGraduatedYear(data.graduated_year?.toString() || '');
      setIeltsScore(data.ielts_score?.toString() || '');
      setWorkExperience(data.work_experience?.toString() || '');
      setPreferredCountries(data.preferred_countries || []);
      setPreferredDomains(data.preferred_domains || []);
    }
    setLookingUp(false);
  };

  const toggleCountry = (c: string) =>
    setPreferredCountries(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const toggleDomain = (d: string) =>
    setPreferredDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

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
            educational_qualification: educationalQualification || null,
            graduated_year: graduatedYear ? Number(graduatedYear) : null,
            ielts_score: ieltsScore ? Number(ieltsScore) : null,
            work_experience: workExperience ? Number(workExperience) : 0,
            preferred_countries: preferredCountries.length ? preferredCountries : [],
            preferred_domains: preferredDomains.length ? preferredDomains : [],
          },
          { onConflict: 'mobile' }
        )
        .select('id')
        .single();
      if (error) throw error;
      setActiveContact({
        id: contact.id,
        student_name: studentName.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        educational_qualification: educationalQualification || undefined,
        graduated_year: graduatedYear ? Number(graduatedYear) : undefined,
        ielts_score: ieltsScore ? Number(ieltsScore) : undefined,
        work_experience: workExperience ? Number(workExperience) : undefined,
        preferred_countries: preferredCountries.length ? preferredCountries : undefined,
        preferred_domains: preferredDomains.length ? preferredDomains : undefined,
      });
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
    setEducationalQualification('');
    setGraduatedYear('');
    setIeltsScore('');
    setWorkExperience('');
    setPreferredCountries([]);
    setPreferredDomains([]);
    setSearchQuery('');
    setOpen(true);
  };

  if (activeContact && !open) {
    return (
      <Card className="border-primary/15 bg-primary/[0.03]">
        <CardContent className="flex items-center gap-3 py-3 px-4 flex-wrap">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <UserCheck className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-base font-medium text-foreground">{activeContact.student_name}</span>
          <span className="text-sm text-muted-foreground">{activeContact.mobile}</span>
          <span className="text-sm text-muted-foreground hidden sm:inline">{activeContact.email}</span>
          {activeContact.educational_qualification && (
            <Badge variant="secondary" className="text-sm font-normal">{activeContact.educational_qualification}</Badge>
          )}
          {activeContact.ielts_score && (
            <Badge variant="outline" className="text-sm font-normal">IELTS {activeContact.ielts_score}</Badge>
          )}
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

            {/* Row 1: Basic info */}
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

            {/* Row 2: Academic info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Educational Qualification</Label>
                <Select value={educationalQualification} onValueChange={setEducationalQualification}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    {QUALIFICATIONS.map(q => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Graduated Year</Label>
                <Input type="number" min="1990" max="2030" placeholder="2023" value={graduatedYear} onChange={e => setGraduatedYear(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">IELTS Score</Label>
                <Input type="number" min="0" max="9" step="0.5" placeholder="7.0" value={ieltsScore} onChange={e => setIeltsScore(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Work Experience (yrs)</Label>
                <Input type="number" min="0" placeholder="2" value={workExperience} onChange={e => setWorkExperience(e.target.value)} />
              </div>
            </div>

            {/* Row 3: Preferred Countries */}
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Preferred Countries</Label>
              <div className="flex flex-wrap gap-1.5">
                {COUNTRIES.map(c => (
                  <Badge
                    key={c}
                    variant={preferredCountries.includes(c) ? 'default' : 'outline'}
                    className="cursor-pointer text-sm font-normal transition-all hover:shadow-sm"
                    onClick={() => toggleCountry(c)}
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Row 4: Preferred Domains */}
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Preferred Domains</Label>
              <div className="flex flex-wrap gap-1.5">
                {DOMAINS.map(d => (
                  <Badge
                    key={d}
                    variant={preferredDomains.includes(d) ? 'default' : 'outline'}
                    className="cursor-pointer text-sm font-normal transition-all hover:shadow-sm"
                    onClick={() => toggleDomain(d)}
                  >
                    {d}
                  </Badge>
                ))}
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
