import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Room from '@/models/Room';          // <-- Ensure Room is imported
import Course from '@/models/Course';      // <-- Import Course for resolution
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const query: any = {};
    if (roomId) query.room = roomId;
    if (start && end) {
      query.startTime = { $lt: new Date(end) };
      query.endTime = { $gt: new Date(start) };
    }

    const bookings = await Booking.find(query)
      .populate('room', 'name building status')
      .sort({ startTime: 1 });

    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['PROFESSOR', 'TA', 'ADMIN', 'IT_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const data = await req.json();

    // Clean up empty strings
    if (data.course === '') delete data.course;
    if (data.description === '') delete data.description;

    // Resolve course code to ObjectId if needed
    if (data.course && typeof data.course === 'string' && !data.course.match(/^[0-9a-fA-F]{24}$/)) {
      const courseDoc = await Course.findOne({ code: data.course.toUpperCase() });
      if (courseDoc) {
        data.course = courseDoc._id;
      } else {
        delete data.course; // Course not found, remove field
      }
    }

    // Validate required fields
    if (!data.room || !data.title || !data.startTime || !data.endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate room exists
    const roomExists = await Room.findById(data.room);
    if (!roomExists) {
      return NextResponse.json({ error: 'Room not found' }, { status: 400 });
    }

    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    if (end <= start) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
    }

    if (data.isRecurring && data.recurringEndDate && data.recurringDays && Array.isArray(data.recurringDays)) {
      const endRecurrence = new Date(data.recurringEndDate);
      endRecurrence.setHours(23, 59, 59, 999);
      
      let currentDate = new Date(start);
      const slots = [];
      
      while (currentDate <= endRecurrence) {
        if (data.recurringDays.includes(currentDate.getDay())) {
          const slotStart = new Date(currentDate);
          slotStart.setHours(start.getHours(), start.getMinutes(), 0, 0);
          
          const slotEnd = new Date(currentDate);
          slotEnd.setHours(end.getHours(), end.getMinutes(), 0, 0);
          
          slots.push({ startTime: slotStart, endTime: slotEnd });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      if (slots.length === 0) {
        return NextResponse.json({ error: 'No dates matched the recurrence pattern' }, { status: 400 });
      }

      const orConditions = slots.map(slot => ({
        startTime: { $lt: slot.endTime },
        endTime: { $gt: slot.startTime },
      }));

      const overlapping = await Booking.find({
        room: data.room,
        status: 'APPROVED',
        $or: orConditions
      });

      if (overlapping.length > 0) {
        const conflictingDates = Array.from(new Set(overlapping.map(b => b.startTime.toLocaleDateString()))).join(', ');
        return NextResponse.json(
          { error: `Conflict: The room is already booked on ${conflictingDates}` },
          { status: 409 }
        );
      }

      const bookingsToCreate = slots.map(slot => ({
        room: data.room,
        title: data.title,
        description: data.description,
        course: data.course,
        startTime: slot.startTime,
        endTime: slot.endTime,
        bookedBy: session._id,
        status: 'APPROVED',
      }));

      const bookings = await Booking.insertMany(bookingsToCreate);
      
      if (data.course) {
        try {
          await Course.findByIdAndUpdate(data.course, { 'schedule.room': roomExists.name }, { new: true });
        } catch (e) {}
      }

      return NextResponse.json(bookings, { status: 201 });
    }

    // Single booking
    const overlapping = await Booking.findOne({
      room: data.room,
      status: 'APPROVED',
      $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }],
    });

    if (overlapping) {
      return NextResponse.json(
        { error: 'Room is already booked during this time' },
        { status: 409 }
      );
    }

    const booking = await Booking.create({
      ...data,
      bookedBy: session._id,
      status: 'APPROVED',
    });

    if (data.course) {
      try {
        await Course.findByIdAndUpdate(
          data.course,
          { 'schedule.room': roomExists.name },
          { new: true }
        );
      } catch (courseError) {
        console.error('Failed to update course room:', courseError);
      }
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/bookings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}