import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Department from '@/models/Department';
import Course from '@/models/Course';
import User from '@/models/User';
import mongoose from 'mongoose';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    await dbConnect();
    const { id } = await params;
    const data = await req.json();

    if (data.status === 'inactive') {
      const deptObjectId = new mongoose.Types.ObjectId(id);

      const [activeCourses] = await Promise.all([
        Course.countDocuments({ 
          department: deptObjectId, 
        })
      ]);

      console.log(`Deactivation Attempt for ${id}:`, { activeCourses });

      if (activeCourses > 0) {
        return NextResponse.json(
          { 
            error: `Protection Violation: Found ${activeCourses} active courses. Please migrate or deactivate them first.` 
          }, 
          { status: 400 }
        );
      }
    }

    const department = await Department.findByIdAndUpdate(
      id, 
      data, 
      { returnDocument: 'after' }
    ).populate('headOfDepartment', 'name email');

    return NextResponse.json(department);

  } catch (error: any) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  await dbConnect();
  const { id } = await context.params;

  const activeCourses = await Course.countDocuments({ department: id });
  const activeStudents = await User.countDocuments({ department: id });

  if (activeCourses > 0 || activeStudents > 0) {
    return NextResponse.json(
      { error: 'Cannot delete department with active courses or students' },
      { status: 400 }
    );
  }

  await Department.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest, context: RouteContext) {
  await dbConnect();
  const { id } = await context.params;
  
  const department = await Department.findById(id).populate('headOfDepartment', 'name email');
  if (!department) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  return NextResponse.json(department);
}