import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Course from '@/models/Course';
import { hashPassword } from '@/lib/auth';
import { generateEmail, generateTemporaryPassword } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roles = searchParams.get('role')?.split(',') || [];

    const users = await User.find({ role: { $in: ['PROFESSOR', 'TA'] } })
      .populate('department')
      .lean();

    const userIds = users.map(u => u._id);
    const allCourses = await Course.find({
      instructor: { $in: userIds }
    }).lean();
    const staffWithCourses = users.map(user => {
      return {
        ...user,
        courses: allCourses.filter(course =>
          course.instructor?.toString() === user._id.toString()
        )
      };
    });

    return NextResponse.json(staffWithCourses);
  }
  catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, nationalId, departmentId, role } = await req.json();

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    let email = generateEmail(firstName, lastName);

    let exists = await User.findOne({ email });
    let counter = 1;
    const baseEmail = email;
    while (exists) {
      email = `${baseEmail.split('@')[0]}${counter}@nexusedu.edu`;
      exists = await User.findOne({ email });
      counter++;
    }

    const tempPassword = generateTemporaryPassword();
    const hashed = await hashPassword(tempPassword);

    const user = await User.create({
      name,
      email,
      password: hashed,
      nationalId,
      department: departmentId || null,
      role,
      forcePasswordChange: true,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        temporaryPassword: tempPassword,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 400 }
    );
  }
}