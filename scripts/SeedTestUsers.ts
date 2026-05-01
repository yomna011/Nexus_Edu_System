import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

// Load environment variables
config({ path: process.cwd() + '/.env.local' });

import User from '../src/models/User';
import Department from '../src/models/Department';
import Room from '../src/models/Room';
import Semester from '../src/models/Semester';
import Course from '../src/models/Course';
import Enrollment from '../src/models/Enrollment';
import Application from '../src/models/Applications';

const MONGODB_URI = process.env.MONGODB_URI!;

async function seedTestUsers() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');



  // ── 1. Departments ──────────────────────────────────────────────────────
  const csDept = await Department.findOneAndUpdate(
    { code: 'CS' },
    { name: 'Computer Science', code: 'CS', college: 'Faculty of Engineering', status: 'active' },
    { upsert: true, new: true }
  );
  const mathDept = await Department.findOneAndUpdate(
    { code: 'MATH' },
    { name: 'Mathematics', code: 'MATH', college: 'Faculty of Science', status: 'active' },
    { upsert: true, new: true }
  );
  console.log('🏛️  Departments ready');

  // ── 2. Rooms ─────────────────────────────────────────────────────────────
  const rooms = [
    { name: 'Room 101', building: 'Science Hall', type: 'CLASSROOM', capacity: 40 },
    { name: 'Lab A', building: 'Tech Wing', type: 'LAB', capacity: 25 },
    { name: 'Lecture Hall 1', building: 'Main Building', type: 'LECTURE_HALL', capacity: 120 },
  ];
  for (const room of rooms) {
    await Room.findOneAndUpdate({ name: room.name, building: room.building }, room, { upsert: true });
  }
  console.log('Rooms ensured');

  // ── 3. Semesters (three terms to show multi-page transcript) ─────────────
  const semSpring25 = await Semester.findOneAndUpdate(
    { name: 'Spring 2025', academicYear: '2025' },
    {
      name: 'Spring 2025', termType: 'SPRING', academicYear: '2025',
      startDate: new Date('2025-01-20'), endDate: new Date('2025-05-30'),
      addDropDeadline: new Date('2025-02-03'), finalExamStart: new Date('2025-05-20'),
      status: 'ARCHIVED', isRegistrationTerm: false,
    },
    { upsert: true, new: true }
  );

  const semFall25 = await Semester.findOneAndUpdate(
    { name: 'Fall 2025', academicYear: '2025' },
    {
      name: 'Fall 2025', termType: 'FALL', academicYear: '2025',
      startDate: new Date('2025-09-01'), endDate: new Date('2025-12-20'),
      addDropDeadline: new Date('2025-09-15'), finalExamStart: new Date('2025-12-10'),
      status: 'ARCHIVED', isRegistrationTerm: false,
    },
    { upsert: true, new: true }
  );

  const semSpring26 = await Semester.findOneAndUpdate(
    { name: 'Spring 2026', academicYear: '2026' },
    {
      name: 'Spring 2026', termType: 'SPRING', academicYear: '2026',
      startDate: new Date('2026-01-20'), endDate: new Date('2026-05-30'),
      addDropDeadline: new Date('2026-02-03'), finalExamStart: new Date('2026-05-20'),
      status: 'active', isRegistrationTerm: true,
    },
    { upsert: true, new: true }
  );

  console.log('📅 Semesters ready: Spring 2025, Fall 2025, Spring 2026');

  // ── 4. Courses ────────────────────────────────────────────────────────────
  // Spring 2025 courses
  const sp25_cs101 = await Course.findOneAndUpdate(
    { code: 'CS101', semester: semSpring25._id },
    { code: 'CS101', title: 'Introduction to Programming', creditHours: 3, type: 'CORE', department: csDept._id, semester: semSpring25._id, capacity: 30 },
    { upsert: true, new: true }
  );
  const sp25_math101 = await Course.findOneAndUpdate(
    { code: 'MATH101', semester: semSpring25._id },
    { code: 'MATH101', title: 'Calculus I', creditHours: 4, type: 'CORE', department: mathDept._id, semester: semSpring25._id, capacity: 40 },
    { upsert: true, new: true }
  );
  const sp25_cs110 = await Course.findOneAndUpdate(
    { code: 'CS110', semester: semSpring25._id },
    { code: 'CS110', title: 'Discrete Mathematics', creditHours: 3, type: 'CORE', department: csDept._id, semester: semSpring25._id, capacity: 35 },
    { upsert: true, new: true }
  );

  // Fall 2025 courses
  const fa25_cs201 = await Course.findOneAndUpdate(
    { code: 'CS201', semester: semFall25._id },
    { code: 'CS201', title: 'Data Structures', creditHours: 4, type: 'CORE', department: csDept._id, semester: semFall25._id, capacity: 25, isHonors: true },
    { upsert: true, new: true }
  );
  const fa25_math201 = await Course.findOneAndUpdate(
    { code: 'MATH201', semester: semFall25._id },
    { code: 'MATH201', title: 'Calculus II', creditHours: 4, type: 'CORE', department: mathDept._id, semester: semFall25._id, capacity: 35 },
    { upsert: true, new: true }
  );
  const fa25_cs210 = await Course.findOneAndUpdate(
    { code: 'CS210', semester: semFall25._id },
    { code: 'CS210', title: 'Computer Organization', creditHours: 3, type: 'CORE', department: csDept._id, semester: semFall25._id, capacity: 30 },
    { upsert: true, new: true }
  );

  // Spring 2026 courses (active semester)
  const sp26_cs301 = await Course.findOneAndUpdate(
    { code: 'CS301', semester: semSpring26._id },
    { code: 'CS301', title: 'Algorithms & Complexity', creditHours: 4, type: 'CORE', department: csDept._id, semester: semSpring26._id, capacity: 30 },
    { upsert: true, new: true }
  );
  const sp26_cs350 = await Course.findOneAndUpdate(
    { code: 'CS350', semester: semSpring26._id },
    { code: 'CS350', title: 'Operating Systems', creditHours: 3, type: 'CORE', department: csDept._id, semester: semSpring26._id, capacity: 28, isHonors: true },
    { upsert: true, new: true }
  );
  const sp26_cs310 = await Course.findOneAndUpdate(
    { code: 'CS310', semester: semSpring26._id },
    { code: 'CS310', title: 'Database Systems', creditHours: 3, type: 'ELECTIVE', department: csDept._id, semester: semSpring26._id, capacity: 25 },
    { upsert: true, new: true }
  );

  console.log('📚 Courses ready (3 semesters × 3 courses each)');

  // ── 5. Users ──────────────────────────────────────────────────────────────

  // Admin user (can log in and test the Export Transcript button)
  const adminPw = await bcrypt.hash('Admin123!', 10);
  const admin = await User.findOneAndUpdate(
    { email: 'admin@nexusedu.edu' },
    {
      name: 'System Administrator',
      email: 'admin@nexusedu.edu',
      password: adminPw,
      role: 'IT_ADMIN',
      forcePasswordChange: false,
    },
    { upsert: true, new: true }
  );
  console.log('👤 Admin ready:', admin.email, '(password: Admin123!)');

  // Main test student – John Student (has grades across 3 semesters)
  const studentPw = await bcrypt.hash('Student123!', 10);
  const student = await User.findOneAndUpdate(
    { email: 'student@nexusedu.edu' },
    {
      name: 'John Student',
      email: 'student@nexusedu.edu',
      password: studentPw,
      role: 'STUDENT',
      department: csDept._id,
      nationalId: '29901011234567',
      forcePasswordChange: false,
    },
    { upsert: true, new: true }
  );
  console.log('🎓 Student ready:', student.email, '(password: Student123!)');

  // Second student – no grades (tests the empty-transcript edge case)
  const student2Pw = await bcrypt.hash('Student123!', 10);
  const student2 = await User.findOneAndUpdate(
    { email: 'newstudent@nexusedu.edu' },
    {
      name: 'Sara Newcomer',
      email: 'newstudent@nexusedu.edu',
      password: student2Pw,
      role: 'STUDENT',
      department: mathDept._id,
      nationalId: '30105029876543',
      forcePasswordChange: false,
    },
    { upsert: true, new: true }
  );
  console.log('🎓 Student2 ready:', student2.email, '(no grades – tests empty transcript)');

  // Professor
  const profPw = await bcrypt.hash('Professor123!', 10);
  const professor = await User.findOneAndUpdate(
    { email: 'professor@nexusedu.edu' },
    {
      name: 'Dr. Jane Smith',
      email: 'professor@nexusedu.edu',
      password: profPw,
      role: 'PROFESSOR',
      department: csDept._id,
      officeHours: 'Mon/Wed 2-4 PM',
      forcePasswordChange: false,
    },
    { upsert: true, new: true }
  );

  // TA
  const taPw = await bcrypt.hash('TA123!', 10);
  const ta = await User.findOneAndUpdate(
    { email: 'ta@nexusedu.edu' },
    {
      name: 'Mike TA',
      email: 'ta@nexusedu.edu',
      password: taPw,
      role: 'TA',
      department: csDept._id,
      officeHours: 'Tue/Thu 10-12 AM',
      forcePasswordChange: false,
    },
    { upsert: true, new: true }
  );
  console.log('👨‍🏫 Professor & TA ready');

  // Assign instructors
  await Course.updateMany({ _id: { $in: [fa25_cs201._id, sp26_cs301._id] } }, { instructor: professor._id });
  await Course.updateMany({ _id: { $in: [sp25_math101._id, fa25_math201._id] } }, { instructor: ta._id });

  // ── 6. Enrollments for John Student (3 full semesters of graded work) ─────
  //
  // Spring 2025:  CS101 A (3cr) | MATH101 B+ (4cr) | CS110 C+ (3cr)
  // Fall 2025:    CS201 A- Honors(4cr) | MATH201 F (4cr) | CS210 B (3cr)
  // Spring 2026:  CS301 A+ (4cr) | CS350 B+ Honors(3cr) | CS310 A- (3cr)
  //
  // Expected cumulative GPA (rough, without honors bump on F):
  //   Sp25:  (4.0×3) + (3.3×4) + (2.3×3) = 12 + 13.2 + 6.9 = 32.1 / 10 = 3.21
  //   Fa25:  ((3.7+0.5)×4) + (0×4) + (3.0×3) = 16.8 + 0 + 9 = 25.8 / 11 = 2.35
  //   Sp26:  (4.0×4) + ((3.3+0.5)×3) + (3.7×3) = 16 + 11.4 + 11.1 = 38.5 / 10 = 3.85
  //
  const enrollmentData = [
    // ── Spring 2025 ──
    { student: student._id, course: sp25_cs101._id, semester: semSpring25._id, status: 'COMPLETED', grade: 'A', gradeStatus: 'OFFICIAL' },
    { student: student._id, course: sp25_math101._id, semester: semSpring25._id, status: 'COMPLETED', grade: 'B+', gradeStatus: 'OFFICIAL' },
    { student: student._id, course: sp25_cs110._id, semester: semSpring25._id, status: 'COMPLETED', grade: 'C+', gradeStatus: 'OFFICIAL' },

    // ── Fall 2025 ──
    { student: student._id, course: fa25_cs201._id, semester: semFall25._id, status: 'COMPLETED', grade: 'A-', gradeStatus: 'OFFICIAL' }, // Honors
    { student: student._id, course: fa25_math201._id, semester: semFall25._id, status: 'COMPLETED', grade: 'F', gradeStatus: 'OFFICIAL' }, // ← F to test red highlight
    { student: student._id, course: fa25_cs210._id, semester: semFall25._id, status: 'COMPLETED', grade: 'B', gradeStatus: 'OFFICIAL' },

    // ── Spring 2026 (active) ──
    { student: student._id, course: sp26_cs301._id, semester: semSpring26._id, status: 'COMPLETED', grade: 'A+', gradeStatus: 'OFFICIAL' },
    { student: student._id, course: sp26_cs350._id, semester: semSpring26._id, status: 'COMPLETED', grade: 'B+', gradeStatus: 'OFFICIAL' }, // Honors
    { student: student._id, course: sp26_cs310._id, semester: semSpring26._id, status: 'COMPLETED', grade: 'A-', gradeStatus: 'OFFICIAL' },
  ];

  for (const enr of enrollmentData) {
    await Enrollment.findOneAndUpdate(
      { student: enr.student, course: enr.course, semester: enr.semester },
      enr,
      { upsert: true }
    );
  }
  console.log('📝 Enrollments seeded for John Student (9 courses across 3 semesters, includes 1 F grade)');

  // ── 7. Sample applications (unchanged) ────────────────────────────────────
  await Application.deleteMany({ student: student._id });
  await Application.insertMany([
    { student: student._id, status: 'SUBMITTED', submissionDate: new Date() },
    { student: student._id, status: 'SUBMITTED', submissionDate: new Date('2026-04-20') },
  ]);
  console.log('📋 Applications seeded');

  await mongoose.disconnect();

  console.log('\n─────────────────────────────────────────────');
  console.log('🌱 Seeding complete! Test accounts:');
  console.log('');
  console.log('  Admin  → admin@nexusedu.edu      / Admin123!');
  console.log('  Student (has grades) → student@nexusedu.edu    / Student123!');
  console.log('  Student (no grades)  → newstudent@nexusedu.edu / Student123!');
  console.log('');
  console.log('  Transcript test:');
  console.log('  1. Log in as admin@nexusedu.edu');
  console.log('  2. Go to /portal/admin/students');
  console.log('  3. Search "John" → View Profile → Export Transcript');
  console.log('  4. Open PDF with password: NexusOfficial2025');
  console.log('─────────────────────────────────────────────');
}

seedTestUsers().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
