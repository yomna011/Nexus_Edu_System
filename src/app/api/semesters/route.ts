import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Semester from '@/models/Semester';

export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const active = searchParams.get('active');

  const query: any = {};

  // Used by student portal to show only published semesters
  // if (active === 'true') {
  //   query.status = 'active';
  //   query.isRegistrationTerm = true;
  // }

  if (active === 'true') {
  query.status = { $in: ['ACTIVE', 'active'] };
  query.isRegistrationTerm = { $in: [true, 'true'] };
}

  const semesters = await Semester.find(query).sort({ createdAt: -1 });

  return NextResponse.json(semesters);
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const data = await req.json();

    if (new Date(data.endDate) <= new Date(data.startDate)) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    if (new Date(data.addDropDeadline) < new Date(data.startDate)) {
      return NextResponse.json(
        { error: 'Add/Drop deadline cannot be before start date' },
        { status: 400 }
      );
    }

    const overlapping = await Semester.findOne({
      startDate: { $lte: data.endDate },
      endDate: { $gte: data.startDate },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: 'Semester dates overlap with existing semester' },
        { status: 400 }
      );
    }

    // New semesters should start as draft unless explicitly sent otherwise
    const semester = await Semester.create({
      ...data,
      status: data.status || 'draft',
      isRegistrationTerm: false,
    });

    return NextResponse.json(semester, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create semester' },
      { status: 400 }
    );
  }
}