import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(
  request: Request,
  { params }: any
) {
  try {
    await dbConnect();
    
    // Await params for Next.js 15+ compatibility
    const resolvedParams = await params;
    
    // We populate the department to get its full name instead of just the ID
    const student = await User.findOne({ _id: resolvedParams.id, role: 'STUDENT' })
      .populate('department', 'name code')
      .lean();
      
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch student profile' }, { status: 500 });
  }
}
