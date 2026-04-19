import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { courseIds, semesterId } = await req.json();

    const result = await Course.updateMany(
      { _id: { $in: courseIds } },
      { semester: semesterId }
    );

    return NextResponse.json({ modified: result.modifiedCount });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add courses' }, { status: 400 });
  }
}