/**
 * Note: These tests assume a testing environment like Jest with 
 * a mocked database and session helper.
 */

import { GET } from "./route";
import { getSession } from "@/lib/auth";
import Enrollment from "@/models/Enrollment";
import { NextResponse } from "next/server";

jest.mock("@/lib/auth");
jest.mock("@/models/Enrollment");
jest.mock("@/lib/db", () => jest.fn());

describe("GPA API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 401 if user is not a student", async () => {
    (getSession as jest.Mock).mockResolvedValue({ role: "STAFF" });
    const response = await GET();
    expect(response.status).toBe(401);
  });

  test("should only fetch OFFICIAL grades for the logged-in student", async () => {
    const mockStudentId = "student123";
    (getSession as jest.Mock).mockResolvedValue({ _id: mockStudentId, role: "STUDENT" });
    
    const mockFind = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      })
    });
    (Enrollment.find as jest.Mock) = mockFind;

    await GET();

    expect(mockFind).toHaveBeenCalledWith(expect.objectContaining({
      student: mockStudentId,
      gradeStatus: "OFFICIAL"
    }));
  });

  test("should include course details in the response", async () => {
    (getSession as jest.Mock).mockResolvedValue({ _id: "s1", role: "STUDENT" });
    
    const mockEnrollments = [
      {
        grade: "A",
        course: { _id: "c1", name: "CS101", code: "CS101", creditHours: 3 },
        semester: { _id: "sem1", name: "Fall 2025", academicYear: "2025-26", termType: "Fall" }
      }
    ];

    (Enrollment.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockEnrollments)
      })
    });

    const response = await GET();
    const data = await response.json();

    expect(data.semesterBreakdown[0].courses[0]).toEqual({
      id: "c1",
      name: "CS101",
      code: "CS101",
      grade: "A"
    });
  });
});
