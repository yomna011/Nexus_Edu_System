'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
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
    isRecurring: false,
    recurringEndDate: '',
    recurringDays: [] as number[],
  });
  const [loading, setLoading] = useState(false);

  const { min, max } = useMemo(() => ({
    min: moment().set({ hour: 8, minute: 0, second: 0, millisecond: 0 }).toDate(),
    max: moment().set({ hour: 20, minute: 0, second: 0, millisecond: 0 }).toDate(),
  }), []);

  const components = useMemo(() => ({
    header: ({ label }: any) => (
      <div className="py-3 font-bold text-xs text-slate-600 bg-slate-50 uppercase tracking-widest">
        {label}
      </div>
    ),
    timeSlotWrapper: ({ children }: any) => (
      <div className="hover:bg-slate-50 transition-colors">{children}</div>
    ),
  }), []);

  const eventPropGetter = useCallback(() => ({
    className: "!bg-primary !border-primary-foreground/20 rounded-md shadow-sm text-xs",
    style: {
      backgroundColor: '#3b82f6',
    }
  }), []);

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
      startTime: moment(start).format('YYYY-MM-DDTHH:mm'),
      endTime: moment(end).format('HH:mm'),
    });
    setOpen(true);
  };

  const handleSelectEvent = (event: any) => {
    toast.info(`${event.title}\n${moment(event.start).format('LT')} - ${moment(event.end).format('LT')}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const startDatePart = form.startTime.split('T')[0];
    const fullEndTime = form.endTime.includes('T') ? form.endTime : `${startDatePart}T${form.endTime}`;
    const payload = { ...form, endTime: fullEndTime };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Room booked successfully');
        setOpen(false);
        setForm({ room: '', title: '', description: '', startTime: '', endTime: '', course: '', isRecurring: false, recurringEndDate: '', recurringDays: [] });
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
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Remove default header borders for our custom component */
        .rbc-header {
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 0 !important;
        }
        /* Style the left-side time column */
        .rbc-time-gutter .rbc-timeslot-group {
          border-bottom: 1px solid #f1f5f9 !important;
          font-size: 0.75rem !important;
          color: #64748b !important;
          font-weight: 500 !important;
          padding-right: 8px !important;
        }
        /* Clean up the grid lines */
        .rbc-time-content {
          border-top: 2px solid #e2e8f0 !important;
        }
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #f1f5f9 !important;
        }
        /* Style the "Today" highlight */
        .rbc-today {
          background-color: #f8fafc !important;
        }
      `}} />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Room Booking Calendar</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-sm"><Plus className="mr-2 h-4 w-4" /> Book Room</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Book a Room</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Room</Label>
                <Select value={form.room} onValueChange={(v) => setForm({ ...form, room: v })} required>
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
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
                </div>
              </div>
              <div>
                <Label>Course (optional)</Label>
                <Input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} placeholder="Course ID" />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isRecurring" 
                  checked={form.isRecurring} 
                  onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isRecurring" className="cursor-pointer">Book multiple recurring days</Label>
              </div>

              {form.isRecurring && (
                <div className="space-y-4 p-4 border rounded-md bg-slate-50">
                  <div>
                    <Label>Recurrence End Date</Label>
                    <Input 
                      type="date" 
                      value={form.recurringEndDate} 
                      onChange={(e) => setForm({ ...form, recurringEndDate: e.target.value })} 
                      required={form.isRecurring} 
                    />
                  </div>
                  <div>
                    <Label>Days of the Week</Label>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {[
                        { label: 'Mon', value: 1 },
                        { label: 'Tue', value: 2 },
                        { label: 'Wed', value: 3 },
                        { label: 'Thu', value: 4 },
                        { label: 'Fri', value: 5 },
                        { label: 'Sat', value: 6 },
                        { label: 'Sun', value: 0 },
                      ].map((day) => (
                        <label key={day.value} className="flex items-center space-x-1 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={form.recurringDays.includes(day.value)}
                            onChange={(e) => {
                              const newDays = e.target.checked 
                                ? [...form.recurringDays, day.value]
                                : form.recurringDays.filter(d => d !== day.value);
                              setForm({ ...form, recurringDays: newDays });
                            }}
                          />
                          <span className="text-sm">{day.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Booking...' : 'Confirm Booking'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 h-full overflow-hidden shadow-sm">
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
          min={min}
          max={max}
          components={components}
          eventPropGetter={eventPropGetter}
        />
      </div>
    </div>
  );
}