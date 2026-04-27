import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Application from '@/models/Applications';
import { getSession } from '@/lib/auth';

// ================= GET =================
export async function GET(req: Request) {
  await mongoose.connect(process.env.MONGODB_URI!);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const applications = await Application.find(
    status ? { status } : {}
  )
    .populate('student', 'name')
    .sort({ submissionDate: -1 });

  const formatted = applications.map((app: any) => ({
    id: app._id,
    studentName: app.student?.name,
    submissionDate: app.submissionDate,
    status: app.status,
  }));

  return NextResponse.json(formatted);
}

export async function PATCH(req: Request) {
  await mongoose.connect(process.env.MONGODB_URI!);

  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { id, status } = body;

  const now = new Date();

  const updated = await Application.findByIdAndUpdate(
    id,
    {
      status,
      statusUpdatedAt: now,
      updatedBy: session._id,

      $push: {
        statusHistory: {
          status,
          changedAt: now,
          changedBy: session._id,
        },
      },
    },
    { new: true }
  );

  return NextResponse.json(updated);
}