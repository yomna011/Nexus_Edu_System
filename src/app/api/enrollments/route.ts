import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Cart from '@/models/Cart';
import Course from '@/models/Course';
import Semester from '@/models/Semester';
import { getSession } from '@/lib/auth';

// POST /api/enrollments - Enroll student in all courses currently in cart
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  // Get active registration semester
  const activeSemester = await Semester.findOne({ isRegistrationTerm: true });
  if (!activeSemester) {
    return NextResponse.json({ error: 'No active registration period' }, { status: 400 });
  }

  // Get student's cart with populated courses
  const cart = await Cart.findOne({
    student: session._id,
    semester: activeSemester._id,
  }).populate('items.course');

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  const enrolledCourses = [];
  const errors = [];

  for (const item of cart.items) {
    const course = item.course as any;

    // Check capacity
    if (course.enrolledCount >= course.capacity) {
      errors.push(`${course.code} is full`);
      continue;
    }

    // Check for existing enrollment
    const existing = await Enrollment.findOne({
      student: session._id,
      course: course._id,
      semester: activeSemester._id,
    });

    if (existing) {
      errors.push(`Already enrolled in ${course.code}`);
      continue;
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: session._id,
      course: course._id,
      semester: activeSemester._id,
      status: 'ENROLLED',
    });

    // Increment course enrolled count
    await Course.findByIdAndUpdate(course._id, {
      $inc: { enrolledCount: 1 },
    });

    enrolledCourses.push(course.code);
  }

  // Clear the cart after processing
  cart.items = [];
  await cart.save();

  if (enrolledCourses.length === 0) {
    return NextResponse.json(
      { error: 'No courses enrolled', details: errors },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    enrolled: enrolledCourses,
    errors: errors.length > 0 ? errors : undefined,
  });
}

// GET /api/enrollments - Get current student's enrollments for active semester
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const activeSemester = await Semester.findOne({ isRegistrationTerm: true });
  const query: any = { student: session._id };
  if (activeSemester) {
    query.semester = activeSemester._id;
  }

  const enrollments = await Enrollment.find(query)
    .populate('course')
    .populate('semester');
  return NextResponse.json(enrollments);
}