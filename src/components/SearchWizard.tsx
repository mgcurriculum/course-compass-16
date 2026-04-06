import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, ChevronLeft, Search } from 'lucide-react';
import type { StudentInput } from '@/lib/matching-engine';

const STUDY_LEVELS = ['Diploma', 'Advanced Diploma', "Bachelor's", 'Postgraduate Diploma', "Master's"];
const COUNTRIES = ['United Kingdom', 'United States', 'Canada', 'Australia', 'Germany'];
const DOMAINS = [
  'Computer Science', 'Engineering', 'Business', 'Data Science', 'Economics',
  'Health Sciences', 'Biology', 'Physics', 'Psychology', 'Education',
  'Political Science', 'Architecture', 'Environmental Science',
];

interface SearchWizardProps {
  onSearch: (input: StudentInput) => void;
  loading?: boolean;
}

export function SearchWizard({ onSearch, loading }: SearchWizardProps) {
  const [step, setStep] = useState(1);
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

  const toggleCountry = (c: string) => {
    setPreferredCountries(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };
  const toggleDomain = (d: string) => {
    setPreferredDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

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

  const needsDiploma = studyLevel === 'Diploma' || studyLevel === 'Advanced Diploma';
  const needsBachelors = studyLevel === "Bachelor's";
  const needsMasters = studyLevel === "Master's" || studyLevel === 'Postgraduate Diploma';

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Course Search</CardTitle>
            <CardDescription>Find the best courses for your student</CardDescription>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`h-2 w-8 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 1 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Study Level</Label>
            <div className="grid grid-cols-1 gap-2">
              {STUDY_LEVELS.map(level => (
                <button
                  key={level}
                  onClick={() => setStudyLevel(level)}
                  className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                    studyLevel === level
                      ? 'border-primary bg-primary/5 font-medium text-primary'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">Academic Details — {studyLevel}</Label>

            {needsDiploma && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="tenth" className="text-xs">10th Marks (%)</Label>
                  <Input id="tenth" type="number" min="0" max="100" value={tenthMarks} onChange={e => setTenthMarks(e.target.value)} placeholder="e.g. 75" />
                </div>
                {studyLevel === 'Advanced Diploma' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="twelfth" className="text-xs">12th Marks (%)</Label>
                    <Input id="twelfth" type="number" min="0" max="100" value={twelfthMarks} onChange={e => setTwelfthMarks(e.target.value)} placeholder="e.g. 70" />
                  </div>
                )}
              </>
            )}

            {needsBachelors && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="twelfth" className="text-xs">+2 Overall Marks (%)</Label>
                  <Input id="twelfth" type="number" min="0" max="100" value={twelfthMarks} onChange={e => setTwelfthMarks(e.target.value)} placeholder="e.g. 78" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="twelfthEng" className="text-xs">+2 English Marks</Label>
                  <Input id="twelfthEng" type="number" min="0" max="100" value={twelfthEnglishMarks} onChange={e => setTwelfthEnglishMarks(e.target.value)} placeholder="e.g. 65" />
                </div>
              </>
            )}

            {needsMasters && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="gradDeg" className="text-xs">Graduation Degree</Label>
                  <Input id="gradDeg" value={graduationDegree} onChange={e => setGraduationDegree(e.target.value)} placeholder="e.g. Computer Science" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gradMarks" className="text-xs">Graduation Marks (%)</Label>
                  <Input id="gradMarks" type="number" min="0" max="100" value={graduationMarks} onChange={e => setGraduationMarks(e.target.value)} placeholder="e.g. 72" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="workExp" className="text-xs">Work Experience (years)</Label>
                  <Input id="workExp" type="number" min="0" value={workExperience} onChange={e => setWorkExperience(e.target.value)} placeholder="e.g. 2" />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="ielts" className="text-xs">IELTS Score</Label>
              <Input id="ielts" type="number" min="0" max="9" step="0.5" value={ieltsScore} onChange={e => setIeltsScore(e.target.value)} placeholder="e.g. 7.0" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">Preferences (Optional)</Label>

            <div className="space-y-2">
              <Label className="text-xs">Preferred Countries</Label>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES.map(c => (
                  <Badge
                    key={c}
                    variant={preferredCountries.includes(c) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleCountry(c)}
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Preferred Domains</Label>
              <div className="flex flex-wrap gap-2">
                {DOMAINS.map(d => (
                  <Badge
                    key={d}
                    variant={preferredDomains.includes(d) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleDomain(d)}
                  >
                    {d}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Duration</Label>
                <Select value={preferredDuration} onValueChange={setPreferredDuration}>
                  <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 year">1 year</SelectItem>
                    <SelectItem value="2 years">2 years</SelectItem>
                    <SelectItem value="3 years">3 years</SelectItem>
                    <SelectItem value="4 years">4 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Course Type</Label>
                <Select value={preferredCourseType} onValueChange={setPreferredCourseType}>
                  <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Max Tuition Fee (USD equivalent)</Label>
              <Input type="number" min="0" value={maxTuitionFee} onChange={e => setMaxTuitionFee(e.target.value)} placeholder="e.g. 50000" />
            </div>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>

          {step < 3 ? (
            <Button
              size="sm"
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && !studyLevel}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleSearch} disabled={loading}>
              <Search className="mr-1 h-4 w-4" />
              {loading ? 'Searching...' : 'Search Courses'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
