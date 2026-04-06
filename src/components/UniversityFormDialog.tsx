import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { Tables } from '@/integrations/supabase/types';

type University = Tables<'universities'>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  university?: University | null;
  onSave: (data: Omit<University, 'id' | 'created_at' | 'updated_at'>) => void;
  saving?: boolean;
}

export function UniversityFormDialog({ open, onOpenChange, university, onSave, saving }: Props) {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [ranking, setRanking] = useState('');
  const [website, setWebsite] = useState('');
  const [partnerStatus, setPartnerStatus] = useState(false);

  useEffect(() => {
    if (university) {
      setName(university.name);
      setCountry(university.country);
      setCity(university.city);
      setRanking(university.ranking?.toString() || '');
      setWebsite(university.website || '');
      setPartnerStatus(university.partner_status);
    } else {
      setName(''); setCountry(''); setCity(''); setRanking(''); setWebsite(''); setPartnerStatus(false);
    }
  }, [university, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      country,
      city,
      ranking: ranking ? parseInt(ranking) : null,
      website: website || null,
      partner_status: partnerStatus,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{university ? 'Edit University' : 'Add University'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Country *</Label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>City *</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Ranking</Label>
              <Input type="number" value={ranking} onChange={(e) => setRanking(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={partnerStatus} onCheckedChange={setPartnerStatus} />
            <Label>Partner University</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
