import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import Department from '@/models/Department';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    await dbConnect();
    const resolvedParams = await params; 
    const id = resolvedParams.id; 
    
    const data = await req.json();
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: 'Invalid Course ID format' }, { status: 400 });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).populate('department', 'name code');

    if (!updatedCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCourse);
  } catch (error: any) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}