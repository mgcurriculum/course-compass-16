import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { BookmarkPlus, BookmarkCheck, ChevronUp, ChevronDown, Info, Eye, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudentContact } from '@/contexts/StudentContactContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { StudentContactDialog } from '@/components/StudentContactDialog';
import type { MatchResult } from '@/lib/matching-engine';

interface ResultsTableProps {
  results: MatchResult[];
  savedCourseIds: Set<string>;
  onCourseSaved: (courseId: string, contactId: string) => void;
}

type SortField = 'matchScore' | 'tuition_fees' | 'name' | 'university';
type SortDir = 'asc' | 'desc';

export function ResultsTable({ results, savedCourseIds, onCourseSaved }: ResultsTableProps) {
  const navigate = useNavigate();
  const { activeContact } = useStudentContact();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sortField, setSortField] = useState<SortField>('matchScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<MatchResult | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const perPage = 15;

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'tuition_fees' ? 'asc' : 'desc');
    }
  };

  const sorted = [...results].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case 'matchScore': cmp = a.matchScore - b.matchScore; break;
      case 'tuition_fees': cmp = a.course.tuition_fees - b.course.tuition_fees; break;
      case 'name': cmp = a.course.name.localeCompare(b.course.name); break;
      case 'university': cmp = a.course.university.name.localeCompare(b.course.university.name); break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const paginated = sorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />;
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Eligible':
        return (
          <Badge className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border border-[hsl(var(--success))]/20 shadow-none font-normal">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--success))]" />
            Eligible
          </Badge>
        );
      case 'Borderline':
        return (
          <Badge className="bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border border-[hsl(var(--warning))]/20 shadow-none font-normal">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--warning))]" />
            Borderline
          </Badge>
        );
      default:
        return (
          <Badge variant="destructive" className="shadow-none font-normal">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-destructive-foreground/70" />
            Not Eligible
          </Badge>
        );
    }
  };

  const matchColor = (score: number) => {
    if (score >= 75) return 'bg-[hsl(var(--success))]';
    if (score >= 50) return 'bg-[hsl(var(--warning))]';
    return 'bg-destructive';
  };

  const handleSaveClick = async (result: MatchResult) => {
    if (activeContact && user) {
      setSavingId(result.course.id);
      try {
        const { error } = await supabase.from('saved_courses').insert({
          user_id: user.id,
          course_id: result.course.id,
          match_score: result.matchScore,
          eligibility_status: result.eligibilityStatus,
          student_contact_id: activeContact.id,
        });
        if (error) throw error;
        toast({ title: 'Course saved for ' + activeContact.student_name });
        onCourseSaved(result.course.id, activeContact.id);
      } catch (err: any) {
        toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
      } finally {
        setSavingId(null);
      }
    } else {
      setSelectedResult(result);
      setDialogOpen(true);
    }
  };

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card p-16 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Eye className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-base font-medium text-foreground">No results yet</p>
        <p className="text-sm text-muted-foreground mt-1">Use the search filters to find matching courses</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{results.length} courses found</p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="cursor-pointer select-none text-xs font-medium text-muted-foreground" onClick={() => toggleSort('university')}>
                University <SortIcon field="university" />
              </TableHead>
              <TableHead className="cursor-pointer select-none text-xs font-medium text-muted-foreground" onClick={() => toggleSort('name')}>
                Course <SortIcon field="name" />
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Country</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Duration</TableHead>
              <TableHead className="cursor-pointer select-none text-xs font-medium text-muted-foreground" onClick={() => toggleSort('tuition_fees')}>
                Fees <SortIcon field="tuition_fees" />
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Intake</TableHead>
              <TableHead className="cursor-pointer select-none text-center text-xs font-medium text-muted-foreground" onClick={() => toggleSort('matchScore')}>
                Match <SortIcon field="matchScore" />
              </TableHead>
              <TableHead className="text-center text-xs font-medium text-muted-foreground">Status</TableHead>
              <TableHead className="w-20 text-center text-xs font-medium text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(result => (
              <TableRow key={result.course.id} className="transition-colors hover:bg-muted/20">
                <TableCell className="text-sm font-medium">{result.course.university.name}</TableCell>
                <TableCell>
                  <button
                    className="text-left text-sm text-primary hover:underline font-medium"
                    onClick={() => navigate(`/course/${result.course.id}`)}
                  >
                    {result.course.name}
                  </button>
                </TableCell>
                <TableCell className="text-sm">{result.course.university.country}</TableCell>
                <TableCell className="text-sm">{result.course.duration}</TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {result.course.currency} {result.course.tuition_fees.toLocaleString()}
                </TableCell>
                <TableCell>
                  {result.course.intakes.map(i => (
                    <span key={`${i.intake_name}-${i.year}`} className="block text-xs text-muted-foreground">
                      {i.intake_name} {i.year}
                    </span>
                  ))}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-semibold">{result.matchScore}%</span>
                    <Progress value={result.matchScore} className={`h-1 w-14 ${matchColor(result.matchScore)}`} />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1">
                        {statusBadge(result.eligibilityStatus)}
                        <Info className="h-3 w-3 text-muted-foreground/50" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">{result.eligibilitySummary}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => navigate(`/course/${result.course.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => !savedCourseIds.has(result.course.id) && handleSaveClick(result)}
                      disabled={savedCourseIds.has(result.course.id) || savingId === result.course.id}
                    >
                      {savingId === result.course.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : savedCourseIds.has(result.course.id) ? (
                        <BookmarkCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <BookmarkPlus className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            Next
          </Button>
        </div>
      )}

      <StudentContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        result={selectedResult}
        onSaved={onCourseSaved}
      />
    </div>
  );
}
