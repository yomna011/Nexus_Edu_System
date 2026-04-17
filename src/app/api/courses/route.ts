import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const semesterId = searchParams.get('semesterId');
    const departmentId = searchParams.get('departmentId');
    const type = searchParams.get('type');
    const instructor = searchParams.get('instructor'); // for staff dashboard

    const query: any = {};
    if (semesterId) query.semester = semesterId;
    if (departmentId) query.department = departmentId;
    if (type) query.type = type;
    if (instructor) query.instructor = instructor;

    const courses = await Course.find(query)
      .populate('department', 'name code')
      .populate('instructor', 'name email');
    return NextResponse.json(courses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    const course = await Course.create(data);
    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Course code already exists for this semester' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}