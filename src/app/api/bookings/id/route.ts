import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import { getSession } from '@/lib/auth';

// DELETE /api/bookings/[id] - Cancel a booking
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Only the creator or admin can cancel
    if (booking.bookedBy.toString() !== session._id && !['ADMIN', 'IT_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    booking.status = 'CANCELLED';
    await booking.save();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/bookings/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: PATCH for updating a booking
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Similar permission checks, then update fields
}