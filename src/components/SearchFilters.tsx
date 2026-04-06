import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import type { StudentInput } from '@/lib/matching-engine';

const STUDY_LEVELS = ['Diploma', 'Advanced Diploma', "Bachelor's", 'Postgraduate Diploma', "Master's"];
const COUNTRIES = ['United Kingdom', 'United States', 'Canada', 'Australia', 'Germany'];
const DOMAINS = [
  'Computer Science', 'Engineering', 'Business', 'Data Science', 'Economics',
  'Health Sciences', 'Biology', 'Physics', 'Psychology', 'Education',
  'Political Science', 'Architecture', 'Environmental Science',
];

interface SearchFiltersProps {
  onSearch: (input: StudentInput) => void;
  loading?: boolean;
}

export function SearchFilters({ onSearch, loading }: SearchFiltersProps) {
  const [open, setOpen] = useState(true);
  const [studyLevel, setStudyLevel] = useState('');
  const [tenthMarks, setTenthMarks] = useState('');
  const [twelfthMarks, setTwelfthMarks] = useState('');
  const [twelfthEnglishMarks, setTwelfthEnglishMarks] = useState('');
  const [graduationDegree, setGraduationDegree] = useState('');
  const [graduationMarks, setGraduationMarks] = useState('');
  const [ieltsScore, setIeltsScore] = useState('');
  const [workExperience, setWorkExperience] = useState('');
  const [preferredCountries, setPreferredCountries] = useState<string[]>([]);
  const [preferredDomains, setPreferredDomains] = useState<string[]>([]);
  const [preferredDuration, setPreferredDuration] = useState('');
  const [preferredCourseType, setPreferredCourseType] = useState('');
  const [maxTuitionFee, setMaxTuitionFee] = useState('');

  const toggleCountry = (c: string) =>
    setPreferredCountries(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const toggleDomain = (d: string) =>
    setPreferredDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const needsDiploma = studyLevel === 'Diploma' || studyLevel === 'Advanced Diploma';
  const needsBachelors = studyLevel === "Bachelor's";
  const needsMasters = studyLevel === "Master's" || studyLevel === 'Postgraduate Diploma';

  const handleSearch = () => {
    const input: StudentInput = {
      studyLevel,
      tenthMarks: tenthMarks ? Number(tenthMarks) : undefined,
      twelfthMarks: twelfthMarks ? Number(twelfthMarks) : undefined,
      twelfthEnglishMarks: twelfthEnglishMarks ? Number(twelfthEnglishMarks) : undefined,
      graduationDegree: graduationDegree || undefined,
      graduationMarks: graduationMarks ? Number(graduationMarks) : undefined,
      ieltsScore: ieltsScore ? Number(ieltsScore) : undefined,
      workExperience: workExperience ? Number(workExperience) : undefined,
      preferredCountries: preferredCountries.length ? preferredCountries : undefined,
      preferredDomains: preferredDomains.length ? preferredDomains : undefined,
      preferredDuration: preferredDuration || undefined,
      preferredCourseType: preferredCourseType || undefined,
      maxTuitionFee: maxTuitionFee ? Number(maxTuitionFee) : undefined,
    };
    onSearch(input);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="rounded-xl shadow-sm overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between bg-gradient-to-r from-primary/5 to-transparent px-6 py-3 text-left transition-colors hover:from-primary/10">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold tracking-tight">Search Filters</span>
              {!open && studyLevel && (
                <Badge variant="secondary" className="ml-2 text-xs">{studyLevel}</Badge>
              )}
            </div>
            {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Row 1: Study Level + Academic Fields + IELTS + Experience */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Study Level</Label>
                <Select value={studyLevel} onValueChange={setStudyLevel}>
                  <SelectTrigger className="rounded-lg"><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    {STUDY_LEVELS.map(l => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {needsDiploma && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">10th Marks (%)</Label>
                  <Input className="rounded-lg" type="number" min="0" max="100" value={tenthMarks} onChange={e => setTenthMarks(e.target.value)} placeholder="e.g. 75" />
                </div>
              )}

              {(needsDiploma && studyLevel === 'Advanced Diploma') && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">12th Marks (%)</Label>
                  <Input className="rounded-lg" type="number" min="0" max="100" value={twelfthMarks} onChange={e => setTwelfthMarks(e.target.value)} placeholder="e.g. 70" />
                </div>
              )}

              {needsBachelors && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">+2 Overall (%)</Label>
                    <Input className="rounded-lg" type="number" min="0" max="100" value={twelfthMarks} onChange={e => setTwelfthMarks(e.target.value)} placeholder="e.g. 78" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">+2 English</Label>
                    <Input className="rounded-lg" type="number" min="0" max="100" value={twelfthEnglishMarks} onChange={e => setTwelfthEnglishMarks(e.target.value)} placeholder="e.g. 65" />
                  </div>
                </>
              )}

              {needsMasters && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Grad Degree</Label>
                    <Input className="rounded-lg" value={graduationDegree} onChange={e => setGraduationDegree(e.target.value)} placeholder="e.g. CS" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Grad Marks (%)</Label>
                    <Input className="rounded-lg" type="number" min="0" max="100" value={graduationMarks} onChange={e => setGraduationMarks(e.target.value)} placeholder="e.g. 72" />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">IELTS Score</Label>
                <Input className="rounded-lg" type="number" min="0" max="9" step="0.5" value={ieltsScore} onChange={e => setIeltsScore(e.target.value)} placeholder="e.g. 7.0" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Work Exp (yrs)</Label>
                <Input className="rounded-lg" type="number" min="0" value={workExperience} onChange={e => setWorkExperience(e.target.value)} placeholder="e.g. 2" />
              </div>
            </div>

            {/* Row 2: Countries */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Preferred Countries</Label>
              <div className="flex flex-wrap gap-1.5">
                {COUNTRIES.map(c => (
                  <Badge
                    key={c}
                    variant={preferredCountries.includes(c) ? 'default' : 'outline'}
                    className="cursor-pointer rounded-full text-xs transition-all hover:shadow-sm"
                    onClick={() => toggleCountry(c)}
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Row 3: Domains */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Preferred Domains</Label>
              <div className="flex flex-wrap gap-1.5">
                {DOMAINS.map(d => (
                  <Badge
                    key={d}
                    variant={preferredDomains.includes(d) ? 'default' : 'outline'}
                    className="cursor-pointer rounded-full text-xs transition-all hover:shadow-sm"
                    onClick={() => toggleDomain(d)}
                  >
                    {d}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Row 4: Duration, Type, Max Fee, Search */}
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-36 space-y-1.5">
                <Label className="text-xs font-medium">Duration</Label>
                <Select value={preferredDuration} onValueChange={setPreferredDuration}>
                  <SelectTrigger className="rounded-lg"><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 year">1 year</SelectItem>
                    <SelectItem value="2 years">2 years</SelectItem>
                    <SelectItem value="3 years">3 years</SelectItem>
                    <SelectItem value="4 years">4 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-36 space-y-1.5">
                <Label className="text-xs font-medium">Course Type</Label>
                <Select value={preferredCourseType} onValueChange={setPreferredCourseType}>
                  <SelectTrigger className="rounded-lg"><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40 space-y-1.5">
                <Label className="text-xs font-medium">Max Tuition (USD)</Label>
                <Input className="rounded-lg" type="number" min="0" value={maxTuitionFee} onChange={e => setMaxTuitionFee(e.target.value)} placeholder="e.g. 50000" />
              </div>
              <Button onClick={handleSearch} disabled={loading || !studyLevel} className="ml-auto rounded-lg bg-gradient-to-r from-primary to-primary/90 shadow-sm transition-all hover:shadow-md">
                <Search className="mr-1.5 h-4 w-4" />
                {loading ? 'Searching...' : 'Search Courses'}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
