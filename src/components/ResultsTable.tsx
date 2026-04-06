import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { BookmarkPlus, BookmarkCheck, ChevronUp, ChevronDown, Info } from 'lucide-react';
import type { MatchResult } from '@/lib/matching-engine';

interface ResultsTableProps {
  results: MatchResult[];
  savedCourseIds: Set<string>;
  onToggleSave: (result: MatchResult) => void;
}

type SortField = 'matchScore' | 'tuition_fees' | 'name' | 'university';
type SortDir = 'asc' | 'desc';

export function ResultsTable({ results, savedCourseIds, onToggleSave }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>('matchScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
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
        return <Badge className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]">✅ Eligible</Badge>;
      case 'Borderline':
        return <Badge className="bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]">⚠️ Borderline</Badge>;
      default:
        return <Badge variant="destructive">❌ Not Eligible</Badge>;
    }
  };

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card p-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">No results yet</p>
        <p className="text-sm text-muted-foreground">Use the search wizard to find matching courses</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{results.length} courses found</p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('university')}>
                University <SortIcon field="university" />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                Course <SortIcon field="name" />
              </TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('tuition_fees')}>
                Fees <SortIcon field="tuition_fees" />
              </TableHead>
              <TableHead>Intake</TableHead>
              <TableHead className="cursor-pointer text-center" onClick={() => toggleSort('matchScore')}>
                Match <SortIcon field="matchScore" />
              </TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(result => (
              <TableRow key={result.course.id}>
                <TableCell className="font-medium">{result.course.university.name}</TableCell>
                <TableCell>{result.course.name}</TableCell>
                <TableCell>{result.course.university.country}</TableCell>
                <TableCell>{result.course.duration}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {result.course.currency} {result.course.tuition_fees.toLocaleString()}
                </TableCell>
                <TableCell>
                  {result.course.intakes.map(i => (
                    <span key={`${i.intake_name}-${i.year}`} className="block text-xs">
                      {i.intake_name} {i.year}
                    </span>
                  ))}
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm font-semibold">{result.matchScore}%</span>
                </TableCell>
                <TableCell className="text-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1">
                        {statusBadge(result.eligibilityStatus)}
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">{result.eligibilitySummary}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onToggleSave(result)}
                  >
                    {savedCourseIds.has(result.course.id) ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <BookmarkPlus className="h-4 w-4" />
                    )}
                  </Button>
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
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
