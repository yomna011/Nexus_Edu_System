import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Semester from "@/models/Semester";
import Course from "@/models/Course";
import { calculateGPA } from "@/lib/gpa";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Fetch all enrollments for the student that are OFFICIAL
    const enrollments = await Enrollment.find({
      student: session._id,
      gradeStatus: "OFFICIAL",
      grade: { $exists: true, $ne: null },
    })
      .populate({ path: "course", model: Course })
      .populate({ path: "semester", model: Semester });

    // Calculate Cumulative GPA
    const cumulativeGPA = calculateGPA(enrollments);

    // Group by semester
    const semesterData: Record<
      string,
      { semester: any; enrollments: any[]; gpa: number }
    > = {};

    enrollments.forEach((enr) => {
      const semId = enr.semester._id.toString();
      if (!semesterData[semId]) {
        semesterData[semId] = {
          semester: enr.semester,
          enrollments: [],
          gpa: 0,
        };
      }
      semesterData[semId].enrollments.push(enr);
    });

    // Calculate semester GPAs
    const semesterBreakdown = Object.values(semesterData).map((data) => ({
      semester: {
        id: data.semester._id,
        name: data.semester.name,
        academicYear: data.semester.academicYear,
        termType: data.semester.termType,
      },
      gpa: calculateGPA(data.enrollments),
      credits: data.enrollments.reduce(
        (sum, enr) => sum + (enr.course.creditHours || 0),
        0,
      ),
      courses: data.enrollments.map((enr) => ({
        id: enr.course._id,
        name: enr.course.name,
        code: enr.course.code,
        grade: enr.grade,
      })),
    }));

    // Sort semesterBreakdown by academicYear then termType (approximate start date)
    semesterBreakdown.sort((a, b) => {
      if (a.semester.academicYear !== b.semester.academicYear) {
        return a.semester.academicYear.localeCompare(b.semester.academicYear);
      }
      return a.semester.termType.localeCompare(b.semester.termType);
    });

    // Get current semester GPA (if they have grades for the active semester)
    // Usually, we'd find the latest semester or active semester
    const activeSemester = await Semester.findOne({ status: "active" });
    let currentSemesterGPA = 0;
    if (activeSemester) {
      const activeSemData = semesterBreakdown.find(
        (s) => s.semester.id.toString() === activeSemester._id.toString(),
      );
      if (activeSemData) {
        currentSemesterGPA = activeSemData.gpa;
      }
    } else if (semesterBreakdown.length > 0) {
      // Fallback to the last semester in the sorted list
      currentSemesterGPA = semesterBreakdown[semesterBreakdown.length - 1].gpa;
    }

    return NextResponse.json({
      cumulativeGPA,
      currentSemesterGPA,
      semesterBreakdown,
    });
  } catch (error) {
    console.error("GPA Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch GPA" }, { status: 500 });
  }
}
