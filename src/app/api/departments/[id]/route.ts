import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Department from '@/models/Department';
import Course from '@/models/Course';
import User from '@/models/User';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const department = await Department.findById(params.id).populate('headOfDepartment', 'name email');
  if (!department) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(department);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const data = await req.json();
  const department = await Department.findByIdAndUpdate(params.id, data, { new: true });
  return NextResponse.json(department);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  // Check if department has active courses or students
  const activeCourses = await Course.countDocuments({ department: params.id });
  const activeStudents = await User.countDocuments({ department: params.id });
  if (activeCourses > 0 || activeStudents > 0) {
    return NextResponse.json(
      { error: 'Cannot delete department with active courses or students' },
      { status: 400 }
    );
  }
  await Department.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}