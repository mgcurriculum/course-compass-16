import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, Users, ArrowLeft, Loader2, Phone, Mail, Calendar, MessageCircle, Send } from 'lucide-react';
import { shareViaWhatsApp, shareViaEmail } from '@/lib/share-utils';
import { format } from 'date-fns';

interface StudentContact {
  id: string;
  student_name: string;
  mobile: string;
  email: string;
  dob: string | null;
  created_at: string;
}

interface SavedCourseForStudent {
  id: string;
  match_score: number | null;
  eligibility_status: string | null;
  created_at: string;
  course: {
    name: string;
    university: { name: string; country: string };
    duration: string;
    tuition_fees: number;
    currency: string;
  };
}

export default function Students() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<StudentContact[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<StudentContact | null>(null);
  const [savedCourses, setSavedCourses] = useState<SavedCourseForStudent[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('student_contacts')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setContacts(data);
      setLoading(false);
    })();
  }, [user]);

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    return c.student_name.toLowerCase().includes(q) || c.mobile.includes(q) || c.email.toLowerCase().includes(q);
  });

  const viewStudent = async (contact: StudentContact) => {
    setSelectedContact(contact);
    setLoadingCourses(true);
    const { data } = await supabase
      .from('saved_courses')
      .select(`
        id, match_score, eligibility_status, created_at,
        courses!inner(name, duration, tuition_fees, currency,
          universities!inner(name, country)
        )
      `)
      .eq('student_contact_id', contact.id)
      .order('created_at', { ascending: false });

    if (data) {
      setSavedCourses(
        data.map((d: any) => ({
          id: d.id,
          match_score: d.match_score,
          eligibility_status: d.eligibility_status,
          created_at: d.created_at,
          course: {
            ...d.courses,
            university: d.courses.universities,
          },
        }))
      );
    }
    setLoadingCourses(false);
  };

  if (selectedContact) {
    return (
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b bg-card px-4">
          <SidebarTrigger />
          <Button variant="ghost" size="icon" onClick={() => setSelectedContact(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold tracking-tight">{selectedContact.student_name}</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <Card className="rounded-xl shadow-sm">
              <CardContent className="flex flex-wrap items-center gap-6 pt-6">
                <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /> {selectedContact.mobile}</div>
                <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /> {selectedContact.email}</div>
                {selectedContact.dob && (
                  <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /> {format(new Date(selectedContact.dob), 'PPP')}</div>
                )}
                <div className="ml-auto flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => shareViaWhatsApp(
                      selectedContact,
                      savedCourses.map(sc => ({ ...sc.course, match_score: sc.match_score, eligibility_status: sc.eligibility_status }))
                    )}
                  >
                    <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => shareViaEmail(
                      selectedContact,
                      savedCourses.map(sc => ({ ...sc.course, match_score: sc.match_score, eligibility_status: sc.eligibility_status }))
                    )}
                  >
                    <Send className="mr-1.5 h-4 w-4" /> Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm">
              <CardHeader><CardTitle className="text-base">Saved Courses ({savedCourses.length})</CardTitle></CardHeader>
              <CardContent>
                {loadingCourses ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : savedCourses.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No saved courses yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>University</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Fees</TableHead>
                        <TableHead className="text-center">Match</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {savedCourses.map(sc => (
                        <TableRow key={sc.id}>
                          <TableCell className="font-medium">{sc.course.university.name}</TableCell>
                          <TableCell>{sc.course.name}</TableCell>
                          <TableCell>{sc.course.duration}</TableCell>
                          <TableCell>{sc.course.currency} {sc.course.tuition_fees.toLocaleString()}</TableCell>
                          <TableCell className="text-center">{sc.match_score != null ? `${sc.match_score}%` : '—'}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={sc.eligibility_status === 'Eligible' ? 'default' : 'outline'}>
                              {sc.eligibility_status || '—'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 items-center gap-3 border-b bg-card px-4">
        <SidebarTrigger />
        <Users className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold tracking-tight">Student Profiles</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, mobile, or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">{search ? 'No students match your search' : 'No student contacts yet'}</p>
            </div>
          ) : (
            <div className="rounded-xl border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(c => (
                    <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => viewStudent(c)}>
                      <TableCell className="font-medium">{c.student_name}</TableCell>
                      <TableCell>{c.mobile}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.dob ? format(new Date(c.dob), 'dd MMM yyyy') : '—'}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{format(new Date(c.created_at), 'dd MMM yyyy')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
