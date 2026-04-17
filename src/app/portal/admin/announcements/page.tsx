'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'INFO',
    targetAudience: ['ALL'],
    expiresAt: '',
    isActive: true,
  });

  const fetchAnnouncements = async () => {
    const res = await fetch('/api/announcements?all=true');
    const data = await res.json();
    setAnnouncements(data);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? 'PATCH' : 'POST';
    const url = editing ? `/api/announcements/${editing._id}` : '/api/announcements';

    const payload = {
      ...form,
      targetAudience: Array.isArray(form.targetAudience) ? form.targetAudience : [form.targetAudience],
      expiresAt: form.expiresAt || undefined,
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(editing ? 'Announcement updated' : 'Announcement created');
      setOpen(false);
      setEditing(null);
      setForm({ title: '', message: '', type: 'INFO', targetAudience: ['ALL'], expiresAt: '', isActive: true });
      fetchAnnouncements();
    } else {
      toast.error('Failed to save announcement');
    }
  };

  const handleDelete = async (id: string) => {
   if (!confirm('Are you sure?')) return;
  const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } else {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (ann: any) => {
    setEditing(ann);
    setForm({
      title: ann.title,
      message: ann.message,
      type: ann.type,
      targetAudience: ann.targetAudience,
      expiresAt: ann.expiresAt ? new Date(ann.expiresAt).toISOString().split('T')[0] : '',
      isActive: ann.isActive,
    });
    setOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Announcement</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={4} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INFO">Information</SelectItem>
                      <SelectItem value="WARNING">Warning</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                      <SelectItem value="EVENT">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Audience</Label>
                  <Select value={form.targetAudience[0]} onValueChange={v => setForm({...form, targetAudience: [v]})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Everyone</SelectItem>
                      <SelectItem value="STUDENT">Students</SelectItem>
                      <SelectItem value="PROFESSOR">Professors</SelectItem>
                      <SelectItem value="TA">Teaching Assistants</SelectItem>
                      <SelectItem value="ADMIN">Administrators</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Expiration Date (optional)</Label>
                  <Input type="date" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch checked={form.isActive} onCheckedChange={v => setForm({...form, isActive: v})} />
                  <Label>Active</Label>
                </div>
              </div>
              <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>All Announcements</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map((ann: any) => (
                <TableRow key={ann._id}>
                  <TableCell className="font-medium">{ann.title}</TableCell>
                  <TableCell>
                    <Badge variant={
                      ann.type === 'URGENT' ? 'destructive' : 
                      ann.type === 'WARNING' ? 'secondary' : 
                      'default'
                    }>
                      {ann.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{ann.targetAudience.join(', ')}</TableCell>
                  <TableCell>{ann.expiresAt ? new Date(ann.expiresAt).toLocaleDateString() : 'Never'}</TableCell>
                  <TableCell>
                    <Badge variant={ann.isActive ? 'default' : 'secondary'}>
                      {ann.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(ann)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(ann._id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}