import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Semester from '@/models/Semester';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: 'Invalid semester id' },
      { status: 400 }
    );
  }

  const semester = await Semester.findById(id);

  if (!semester) {
    return NextResponse.json(
      { error: `Semester not found with id: ${id}` },
      { status: 404 }
    );
  }

  return NextResponse.json(semester);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await context.params;
    const data = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid semester id' },
        { status: 400 }
      );
    }

    if (data.status?.toLowerCase() === 'active') {
      const targetSemester = await Semester.findById(id);

      if (!targetSemester) {
        return NextResponse.json(
          { error: `Semester not found with id: ${id}` },
          { status: 404 }
        );
      }

      // كل الترمات التانية تبقى Draft ومش Registration Term
      await Semester.updateMany(
        { _id: { $ne: id } },
        {
          $set: {
            status: 'DRAFT',
            isRegistrationTerm: false,
          },
        }
      );

      // الترم اللي دوست عليه بس يبقى Active و Registration Term
      const activatedSemester = await Semester.findByIdAndUpdate(
        id,
        {
          $set: {
            status: 'ACTIVE',
            isRegistrationTerm: true,
          },
        },
        { new: true }
      );

      return NextResponse.json(activatedSemester);
    }

    const semester = await Semester.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!semester) {
      return NextResponse.json(
        { error: `Semester not found with id: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(semester);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'Failed to update semester' },
      { status: 400 }
    );
  }
}v