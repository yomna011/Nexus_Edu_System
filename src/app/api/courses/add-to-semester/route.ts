import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import Semester from '@/models/Semester';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { courseIds, semesterId } = await req.json();

    const semester = await Semester.findById(semesterId);

    if (!semester) {
      return NextResponse.json(
        { error: 'Semester not found' },
        { status: 404 }
      );
    }

    const result = await Course.updateMany(
      { _id: { $in: courseIds } },
      { $set: { semester: semesterId } }
    );

    return NextResponse.json({ modified: result.modifiedCount });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add courses' },
      { status: 400 }
    );
  }
}