import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { CourseFormDialog } from '@/components/CourseFormDialog';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

export default function Courses() {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [editingEligibility, setEditingEligibility] = useState<any>(null);

  if (userRole !== 'admin') return <Navigate to="/" replace />;

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*, universities(name, country)')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: eligibilityMap = {} } = useQuery({
    queryKey: ['admin-eligibility'],
    queryFn: async () => {
      const { data } = await supabase.from('eligibility_rules').select('*');
      const map: Record<string, any> = {};
      (data || []).forEach((e) => { map[e.course_id] = e; });
      return map;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ courseData, eligData }: { courseData: any; eligData: any }) => {
      if (editingCourse) {
        const { error } = await supabase.from('courses').update(courseData).eq('id', editingCourse.id);
        if (error) throw error;
        // Upsert eligibility
        const existingElig = eligibilityMap[editingCourse.id];
        if (existingElig) {
          await supabase.from('eligibility_rules').update(eligData).eq('id', existingElig.id);
        } else {
          await supabase.from('eligibility_rules').insert({ ...eligData, course_id: editingCourse.id });
        }
      } else {
        const { data: newCourse, error } = await supabase.from('courses').insert(courseData).select().single();
        if (error) throw error;
        await supabase.from('eligibility_rules').insert({ ...eligData, course_id: newCourse.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-eligibility'] });
      setDialogOpen(false);
      setEditingCourse(null);
      setEditingEligibility(null);
      toast.success(editingCourse ? 'Course updated' : 'Course added');
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Delete eligibility first, then course
      await supabase.from('eligibility_rules').delete().eq('course_id', id);
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-eligibility'] });
      toast.success('Course deleted');
    },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (course: any) => {
    setEditingCourse(course);
    setEditingEligibility(eligibilityMap[course.id] || null);
    setDialogOpen(true);
  };

  return (
    <div className="flex-1 overflow-auto">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 backdrop-blur px-6 py-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold text-foreground">Courses</h1>
          <Badge variant="secondary">{courses.length}</Badge>
        </div>
        <Button size="sm" onClick={() => { setEditingCourse(null); setEditingEligibility(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Course
        </Button>
      </header>

      <div className="p-6">
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
              ) : courses.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No courses yet</TableCell></TableRow>
              ) : courses.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{c.name}</TableCell>
                  <TableCell className="text-sm">{c.universities?.name}</TableCell>
                  <TableCell><Badge variant="outline">{c.domain}</Badge></TableCell>
                  <TableCell>{c.study_level}</TableCell>
                  <TableCell>{c.currency} {c.tuition_fees?.toLocaleString()}</TableCell>
                  <TableCell>{c.duration}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete this course?')) deleteMutation.mutate(c.id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <CourseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        course={editingCourse}
        eligibility={editingEligibility}
        onSave={(courseData, eligData) => saveMutation.mutate({ courseData, eligData })}
        saving={saveMutation.isPending}
      />
    </div>
  );
}
