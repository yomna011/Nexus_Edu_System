'use client';

import { useEffect, useState, useCallback } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const localizer = momentLocalizer(moment);

export default function RoomCalendarPage() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    room: '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    course: '',
  });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [bookingsRes, roomsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/rooms'),
      ]);

      if (!bookingsRes.ok) {
        const errorText = await bookingsRes.text();
        console.error('Bookings API error:', errorText);
        toast.error('Failed to load bookings');
        return;
      }
      if (!roomsRes.ok) {
        toast.error('Failed to load rooms');
        return;
      }

      const bookingsData = await bookingsRes.json();
      const roomsData = await roomsRes.json();

      const events = bookingsData.map((b: any) => ({
        id: b._id,
        title: `${b.title} (${b.room?.name || 'Room'})`,
        start: new Date(b.startTime),
        end: new Date(b.endTime),
        resource: b,
      }));
      setBookings(events);
      setRooms(roomsData);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Network error while loading calendar');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectSlot = ({ start, end }: any) => {
    setForm({
      ...form,
      startTime: start.toISOString().slice(0, 16),
      endTime: end.toISOString().slice(0, 16),
    });
    setOpen(true);
  };

  const handleSelectEvent = (event: any) => {
    toast.info(`${event.title}\n${moment(event.start).format('LT')} - ${moment(event.end).format('LT')}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Room booked successfully');
        setOpen(false);
        setForm({ room: '', title: '', description: '', startTime: '', endTime: '', course: '' });
        fetchData();
      } else {
        toast.error(data.error || 'Booking failed');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4 h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Room Booking Calendar</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Book Room</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Book a Room</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Room</Label>
                <Select value={form.room} onValueChange={(v) => setForm({...form, room: v})} required>
                  <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                  <SelectContent>
                    {rooms.map((room: any) => (
                      <SelectItem key={room._id} value={room._id}>
                        {room.name} ({room.building})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input type="datetime-local" value={form.startTime} onChange={(e) => setForm({...form, startTime: e.target.value})} required />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input type="datetime-local" value={form.endTime} onChange={(e) => setForm({...form, endTime: e.target.value})} required />
                </div>
              </div>
              <div>
                <Label>Course (optional)</Label>
                <Input value={form.course} onChange={(e) => setForm({...form, course: e.target.value})} placeholder="Course ID" />
              </div>
              <Button type="submit" disabled={loading}>{loading ? 'Booking...' : 'Confirm Booking'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border h-full">
        <BigCalendar
          localizer={localizer}
          events={bookings}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={view}
          onView={(newView) => setView(newView)}
          date={date}
          onNavigate={setDate}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
        />
      </div>
    </div>
  );
}