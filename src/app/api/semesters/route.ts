import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Semester from '@/models/Semester';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const active = searchParams.get('active');
  const query: any = {};
  if (active === 'true') query.status = 'ACTIVE';
  const semesters = await Semester.find(query).sort({ createdAt: -1 });
  return NextResponse.json(semesters);
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();

    if (new Date(data.endDate) <= new Date(data.startDate)) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }
    if (new Date(data.addDropDeadline) < new Date(data.startDate)) {
      return NextResponse.json({ error: 'Add/Drop deadline cannot be before start date' }, { status: 400 });
    }

    const overlapping = await Semester.findOne({
      startDate: { $lte: data.endDate },
      endDate: { $gte: data.startDate },
    });
    if (overlapping) {
      return NextResponse.json({ error: 'Semester dates overlap with existing semester' }, { status: 400 });
    }

    const semester = await Semester.create(data);
    return NextResponse.json(semester, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create semester' }, { status: 400 });
  }
}