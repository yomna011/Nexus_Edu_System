'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, ChevronRight, Clock, Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';

interface Room {
  _id: string;
  name: string;
  building: string;
  status: 'AVAILABLE' | 'MAINTENANCE';
}

interface Booking {
  _id: string;
  room: any;
  startTime: string | Date;
  endTime: string | Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

export default function AvailabilityCalendar() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/bookings')
      ]);

      const roomsData = await roomsRes.json();
      const bookingsData = await bookingsRes.json();

      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
      toast.error('Failed to sync with database');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getId = (val: any): string | null => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (val._id) return String(val._id);
    if (val.$oid) return String(val.$oid);
    return String(val);
  };

  const getAvailableRoomsForSlot = (dayName: string, timeSlot: string) => {
    const startOfWeek = moment(currentDate).startOf('isoWeek');
    const targetDay = startOfWeek.clone().add(DAYS.indexOf(dayName), 'days');
    const [hours, minutes] = timeSlot.split(':');

    const slotStart = targetDay.clone().set({
      hour: parseInt(hours),
      minute: parseInt(minutes),
      second: 0,
      millisecond: 0
    });

    const slotEnd = slotStart.clone().add(1, 'hour');
    const sStart = slotStart.valueOf();
    const sEnd = slotEnd.valueOf();

    return rooms.filter((room) => {
      if (room.status === 'MAINTENANCE') return false;
      const roomId = getId(room._id);
      const isOccupied = bookings.some((b) => {
        const bRoomId = getId(b.room);
        if (bRoomId !== roomId) return false;
        if (b.status !== 'APPROVED') return false;
        const bStart = moment(b.startTime).valueOf();
        const bEnd = moment(b.endTime).valueOf();
        return bStart < sEnd && bEnd > sStart;
      });

      return !isOccupied;
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Room Availability</h1>
          <p className="text-sm font-medium text-slate-500">
            {moment(currentDate).startOf('isoWeek').format('MMM D')} — {moment(currentDate).endOf('isoWeek').format('MMM D, YYYY')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="font-semibold"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-none border-r"
              onClick={() => setCurrentDate(moment(currentDate).subtract(1, 'week').toDate())}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-none"
              onClick={() => setCurrentDate(moment(currentDate).add(1, 'week').toDate())}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card className="shadow-xl border-none overflow-hidden ring-1 ring-slate-200">
        <CardContent className="p-0">
          {/* Header Row - Styled like Page 2 with Num then Name */}
          <div className="grid grid-cols-8 border-b bg-slate-50">
            <div className="py-3 border-r flex items-center justify-center font-bold text-xs text-slate-600 uppercase tracking-widest">
              <Clock className="w-3 h-3 mr-2" /> Slot
            </div>
            {DAYS.map((day, index) => {
              const cellDate = moment(currentDate).startOf('isoWeek').add(index, 'days');
              return (
                <div key={day} className="py-3 text-center border-r last:border-0 font-bold text-xs text-slate-600 uppercase tracking-widest">
                   <span className="mr-1 text-slate-400">{cellDate.format('D')}</span> {day}
                </div>
              );
            })}
          </div>

          {/* Time Rows */}
          {TIME_SLOTS.map((slot) => (
            <div key={slot} className="grid grid-cols-8 border-b last:border-0 group">
              {/* Time Gutter - Consistent with Page 2 */}
              <div className="p-4 border-r bg-slate-50/50 font-medium text-[0.75rem] text-slate-500 flex items-center justify-center">
                {slot}
              </div>

              {DAYS.map((day) => {
                const available = getAvailableRoomsForSlot(day, slot);
                const count = available.length;
                const totalRooms = rooms.length;

                let statusColor = "text-orange-600 bg-orange-50 hover:bg-orange-100";
                let badgeColor = "text-orange-500";
                
                if (count === totalRooms && totalRooms > 0) {
                  statusColor = "text-emerald-600 bg-emerald-50 hover:bg-emerald-100";
                  badgeColor = "text-emerald-500";
                } else if (count === 0) {
                  statusColor = "text-rose-600 bg-rose-50 hover:bg-rose-100";
                  badgeColor = "text-rose-500";
                }

                return (
                  <div
                    key={`${day}-${slot}`}
                    className="p-1 border-r last:border-0 bg-white transition-colors min-h-[80px]"
                  >
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className={`group flex flex-col items-center justify-center w-full h-full rounded-lg transition-all active:scale-95 ${statusColor}`}>
                          <span className="font-black text-xl leading-none">{count}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-tighter ${badgeColor}`}>
                            {count === 0 ? 'Full' : 'Available'}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0 shadow-2xl border-slate-200">
                        <div className="bg-slate-800 p-2 text-white text-[10px] font-bold uppercase flex justify-between px-4">
                          <span>Room Status</span>
                          <span>{slot}</span>
                        </div>
                        <div className="p-1 max-h-60 overflow-y-auto">
                          {count > 0 ? (
                            available.map((room) => (
                              <div
                                key={room._id}
                                className="flex items-center gap-3 p-3 border-b last:border-0 hover:bg-slate-50 transition-colors"
                              >
                                <Building2 className="w-4 h-4 text-blue-600" />
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-800">{room.name}</span>
                                  <span className="text-[10px] text-slate-500">{room.building}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-sm text-slate-500 font-medium">
                              No rooms available for this slot.
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                );
              })}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}