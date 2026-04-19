import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Department from '@/models/Department';

export async function GET() {
  await dbConnect();
  const departments = await Department.find().populate('headOfDepartment', 'name email');
  return NextResponse.json(departments);
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    const department = await Department.create(data);
    return NextResponse.json(department, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Department code already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}