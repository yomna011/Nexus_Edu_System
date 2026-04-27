import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Semester from '@/models/Semester';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const semester = await Semester.findById(params.id);
  return NextResponse.json(semester);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const data = await req.json();
  
  // If activating, ensure only one registration term
  if (data.status === 'active') {
    await Semester.updateMany(
      { isRegistrationTerm: true },
      { isRegistrationTerm: false }
    );
    data.isRegistrationTerm = true;
  }
  
  const semester = await Semester.findByIdAndUpdate(params.id, data, { new: true });
  return NextResponse.json(semester);
}