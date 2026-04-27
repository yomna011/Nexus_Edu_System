import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const room = await Room.findById(params.id);
  return NextResponse.json(room);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const data = await req.json();
  const room = await Room.findByIdAndUpdate(params.id, data, { new: true });
  return NextResponse.json(room);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  // Optional: Check if room has active bookings before deletion
  await Room.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}