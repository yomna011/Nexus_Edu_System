'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Wrench } from 'lucide-react';
import { toast } from 'sonner';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    building: '',
    type: 'CLASSROOM',
    capacity: 30,
    equipment: '',
    status: 'AVAILABLE',
  });

  const fetchRooms = async () => {
    const res = await fetch('/api/rooms');
    const data = await res.json();
    setRooms(data);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingRoom ? 'PATCH' : 'POST';
    const url = editingRoom ? `/api/rooms/${editingRoom._id}` : '/api/rooms';
    
    const payload = {
      ...form,
      equipment: form.equipment.split(',').map(s => s.trim()).filter(Boolean),
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(editingRoom ? 'Room updated' : 'Room created');
      setOpen(false);
      setEditingRoom(null);
      setForm({ name: '', building: '', type: 'CLASSROOM', capacity: 30, equipment: '', status: 'AVAILABLE' });
      fetchRooms();
    } else {
      toast.error('Failed to save room');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Room deleted');
      fetchRooms();
    } else {
      toast.error('Cannot delete room (may have active bookings)');
    }
  };

  const openEdit = (room: any) => {
    setEditingRoom(room);
    setForm({
      name: room.name,
      building: room.building,
      type: room.type,
      capacity: room.capacity,
      equipment: room.equipment?.join(', ') || '',
      status: room.status,
    });
    setOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Room Management</h1>
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) setEditingRoom(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Room</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRoom ? 'Edit Room' : 'Create Room'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Room Name/Number</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div>
                <Label>Building</Label>
                <Input value={form.building} onChange={e => setForm({...form, building: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLASSROOM">Classroom</SelectItem>
                      <SelectItem value="LAB">Laboratory</SelectItem>
                      <SelectItem value="LECTURE_HALL">Lecture Hall</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: parseInt(e.target.value)})} required />
                </div>
              </div>
              <div>
                <Label>Equipment (comma-separated)</Label>
                <Input value={form.equipment} onChange={e => setForm({...form, equipment: e.target.value})} placeholder="Projector, Whiteboard, etc." />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">{editingRoom ? 'Update' : 'Create'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>All Rooms</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room: any) => (
                <TableRow key={room._id}>
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell>{room.building}</TableCell>
                  <TableCell>{room.type.replace('_', ' ')}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>{room.equipment?.join(', ') || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={room.status === 'AVAILABLE' ? 'default' : 'destructive'}>
                      {room.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(room)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(room._id)}>
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