import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Download, Loader2, BookmarkCheck, MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStudentContact } from '@/contexts/StudentContactContext';
import { shareViaWhatsApp, shareViaEmail } from '@/lib/share-utils';

interface SavedCourse {
  id: string;
  course_id: string;
  match_score: number | null;
  eligibility_status: string | null;
  course: {
    name: string;
    study_level: string;
    domain: string;
    duration: string;
    tuition_fees: number;
    currency: string;
    university: {
      name: string;
      country: string;
    };
  };
}

export default function Shortlisted() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { activeContact } = useStudentContact();
  const [items, setItems] = useState<SavedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('saved_courses')
      .select(`
        id, course_id, match_score, eligibility_status,
        courses!inner(name, study_level, domain, duration, tuition_fees, currency,
          universities!inner(name, country)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setItems(
        data.map((d: any) => ({
          id: d.id,
          course_id: d.course_id,
          match_score: d.match_score,
          eligibility_status: d.eligibility_status,
          course: {
            ...d.courses,
            university: d.courses.universities,
          },
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchSaved(); }, [user]);

  const handleRemove = async (id: string) => {
    await supabase.from('saved_courses').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast({ title: 'Removed from shortlist' });
  };

  const handleExportCSV = () => {
    const headers = ['University', 'Course', 'Level', 'Domain', 'Country', 'Duration', 'Fees', 'Currency', 'Match %', 'Status'];
    const rows = items.map(i => [
      i.course.university.name,
      i.course.name,
      i.course.study_level,
      i.course.domain,
      i.course.university.country,
      i.course.duration,
      i.course.tuition_fees,
      i.course.currency,
      i.match_score ?? '',
      i.eligibility_status ?? '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shortlisted-courses.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusBadge = (status: string | null) => {
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
      case 'Not Eligible':
        return (
          <Badge variant="destructive" className="shadow-none font-normal">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-destructive-foreground/70" />
            Not Eligible
          </Badge>
        );
      default:
        return <Badge variant="outline" className="font-normal">—</Badge>;
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 items-center justify-between border-b border-border/60 bg-card/80 backdrop-blur-sm px-4">
        <div className="flex items-center">
          <SidebarTrigger className="mr-3" />
          <BookmarkCheck className="h-4 w-4 text-primary mr-2" />
          <h1 className="text-base font-semibold tracking-tight">Shortlisted Courses</h1>
        </div>
        {items.length > 0 && (
          <Button size="sm" variant="outline" onClick={handleExportCSV} className="shadow-sm">
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
          </Button>
        )}
      </header>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card p-16 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <BookmarkCheck className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-base font-medium text-foreground">No courses shortlisted yet</p>
            <p className="text-sm text-muted-foreground mt-1">Search and save courses from the Course Search page</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs font-medium text-muted-foreground">University</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Course</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Level</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Country</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Duration</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Fees</TableHead>
                  <TableHead className="text-center text-xs font-medium text-muted-foreground">Match</TableHead>
                  <TableHead className="text-center text-xs font-medium text-muted-foreground">Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id} className="transition-colors hover:bg-muted/20">
                    <TableCell className="text-sm font-medium">{item.course.university.name}</TableCell>
                    <TableCell className="text-sm">{item.course.name}</TableCell>
                    <TableCell className="text-sm">{item.course.study_level}</TableCell>
                    <TableCell className="text-sm">{item.course.university.country}</TableCell>
                    <TableCell className="text-sm">{item.course.duration}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{item.course.currency} {item.course.tuition_fees.toLocaleString()}</TableCell>
                    <TableCell className="text-center text-sm font-semibold">{item.match_score != null ? `${item.match_score}%` : '—'}</TableCell>
                    <TableCell className="text-center">{statusBadge(item.eligibility_status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemove(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
