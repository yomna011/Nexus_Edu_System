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

const MONGODB_URI = process.env.MONGODB_URI!;

async function seedTestUsers() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');



  // Departments
  let csDept = await Department.findOne({ code: 'CS' });
  if (!csDept) {
    csDept = await Department.create({
      name: 'Computer Science',
      code: 'CS',
      college: 'Faculty of Engineering',
      status: 'active',
    });
    console.log('Created CS department');
  }

  let mathDept = await Department.findOne({ code: 'MATH' });
  if (!mathDept) {
    mathDept = await Department.create({
      name: 'Mathematics',
      code: 'MATH',
      college: 'Faculty of Science',
      status: 'active',
    });
    console.log('Created MATH department');
  }

  // Rooms
  const rooms = [
    { name: 'Room 101', building: 'Science Hall', type: 'CLASSROOM', capacity: 40 },
    { name: 'Lab A', building: 'Tech Wing', type: 'LAB', capacity: 25 },
    { name: 'Lecture Hall 1', building: 'Main Building', type: 'LECTURE_HALL', capacity: 120 },
  ];
  for (const room of rooms) {
    await Room.findOneAndUpdate(
      { name: room.name, building: room.building },
      room,
      { upsert: true }
    );
  }
  console.log('Rooms ensured');

  // active Semester
  let semester = await Semester.findOne({ name: 'Fall 2026', academicYear: '2026' });
  if (!semester) {
    semester = await Semester.create({
      name: 'Fall 2026',
      termType: 'FALL',
      academicYear: '2026',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-12-20'),
      addDropDeadline: new Date('2026-09-15'),
      finalExamStart: new Date('2026-12-10'),
      status: 'active',
      isRegistrationTerm: true,
    });
    console.log('Created active semester:', semester.name);
  }

  // Sample Courses 
  const coursesData = [
    {
      code: 'CS101',
      title: 'Introduction to Programming',
      creditHours: 3,
      type: 'CORE',
      department: csDept._id,
      semester: semester._id,
      schedule: { day: 'MON', startTime: '10:00', endTime: '11:30', room: 'Room 101' },
      capacity: 30,
    },
    {
      code: 'CS201',
      title: 'Data Structures',
      creditHours: 4,
      type: 'CORE',
      department: csDept._id,
      semester: semester._id,
      schedule: { day: 'WED', startTime: '13:00', endTime: '14:30', room: 'Lab A' },
      capacity: 25,
    },
    {
      code: 'MATH101',
      title: 'Calculus I',
      creditHours: 4,
      type: 'CORE',
      department: mathDept._id,
      semester: semester._id,
      schedule: { day: 'TUE', startTime: '09:00', endTime: '10:30', room: 'Lecture Hall 1' },
      capacity: 40,
    },
  ];

  for (const c of coursesData) {
    await Course.findOneAndUpdate(
      { code: c.code, semester: semester._id },
      c,
      { upsert: true }
    );
  }
  console.log('Courses ensured');

  // Retrieve course IDs for later assignment (for professor/TA)
  const cs101 = await Course.findOne({ code: 'CS101', semester: semester._id });
  const cs201 = await Course.findOne({ code: 'CS201', semester: semester._id });
  const math101 = await Course.findOne({ code: 'MATH101', semester: semester._id });

  
  // Student
  const studentPassword = await bcrypt.hash('Student123!', 10);
  const student = await User.findOneAndUpdate(
    { email: 'student@nexusedu.edu' },
    {
      name: 'John Student',
      email: 'student@nexusedu.edu',
      password: studentPassword,
      role: 'STUDENT',
      department: csDept._id,
      forcePasswordChange: false, // for easy testing
    },
    { upsert: true, new: true }
  );
  console.log('Student user ready:', student.email);

  // Professor
  const professorPassword = await bcrypt.hash('Professor123!', 10);
  const professor = await User.findOneAndUpdate(
    { email: 'professor@nexusedu.edu' },
    {
      name: 'Dr. Jane Smith',
      email: 'professor@nexusedu.edu',
      password: professorPassword,
      role: 'PROFESSOR',
      department: csDept._id,
      officeHours: 'Mon/Wed 2-4 PM',
      forcePasswordChange: false,
    },
    { upsert: true, new: true }
  );
  console.log('Professor user ready:', professor.email);

  // Teaching Assistant
  const taPassword = await bcrypt.hash('TA123!', 10);
  const ta = await User.findOneAndUpdate(
    { email: 'ta@nexusedu.edu' },
    {
      name: 'Mike TA',
      email: 'ta@nexusedu.edu',
      password: taPassword,
      role: 'TA',
      department: csDept._id,
      officeHours: 'Tue/Thu 10-12 AM',
      forcePasswordChange: false,
    },
    { upsert: true, new: true }
  );
  console.log('TA user ready:', ta.email);

  // ------------------------------------------------------------------------
  // 3. Assign courses to Professor and TA (optional)
  // ------------------------------------------------------------------------
  if (cs101 && cs201) {
    await Course.updateMany(
      { _id: { $in: [cs101._id, cs201._id] } },
      { instructor: professor._id }
    );
    console.log('Assigned CS101 and CS201 to Professor');
  }

  if (math101) {
    await Course.updateMany(
      { _id: math101._id },
      { instructor: ta._id }
    );
    console.log('Assigned MATH101 to TA');
  }

  // ------------------------------------------------------------------------
  // 4. (Optional) Enroll student in some courses for testing
  // ------------------------------------------------------------------------
  // This would require an Enrollment model; skipping for brevity.
  // If you have a Cart/Enrollment mechanism, you could add it here.

  await mongoose.disconnect();
  console.log('Seeding test users completed.');
}

seedTestUsers().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});