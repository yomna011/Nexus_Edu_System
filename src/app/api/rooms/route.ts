import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';

export async function GET() {
  await dbConnect();
  const rooms = await Room.find({ status: 'AVAILABLE' });
  return NextResponse.json(rooms);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  const room = await Room.create(data);
  return NextResponse.json(room, { status: 201 });
}