import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { UniversityFormDialog } from '@/components/UniversityFormDialog';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';
import { Navigate } from 'react-router-dom';

type University = Tables<'universities'>;

export default function Universities() {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<University | null>(null);

  if (userRole !== 'admin') return <Navigate to="/" replace />;

  const { data: universities = [], isLoading } = useQuery({
    queryKey: ['admin-universities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('universities').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Omit<University, 'id' | 'created_at' | 'updated_at'>) => {
      if (editing) {
        const { error } = await supabase.from('universities').update(data).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('universities').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-universities'] });
      setDialogOpen(false);
      setEditing(null);
      toast.success(editing ? 'University updated' : 'University added');
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('universities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-universities'] });
      toast.success('University deleted');
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="flex-1 overflow-auto">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 backdrop-blur px-6 py-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold text-foreground">Universities</h1>
          <Badge variant="secondary">{universities.length}</Badge>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add University
        </Button>
      </header>

      <div className="p-6">
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Ranking</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
              ) : universities.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No universities yet</TableCell></TableRow>
              ) : universities.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.country}</TableCell>
                  <TableCell>{u.city}</TableCell>
                  <TableCell>{u.ranking ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={u.partner_status ? 'default' : 'outline'}>
                      {u.partner_status ? 'Partner' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(u); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete this university?')) deleteMutation.mutate(u.id); }}>
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

      <UniversityFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        university={editing}
        onSave={(data) => saveMutation.mutate(data)}
        saving={saveMutation.isPending}
      />
    </div>
  );
}
