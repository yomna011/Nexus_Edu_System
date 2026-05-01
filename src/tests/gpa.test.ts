import { calculateGPA, getGradePoints } from "../lib/gpa";

describe("GPA Calculation Logic", () => {
  test("getGradePoints should return correct points for standard grades", () => {
    expect(getGradePoints("A")).toBe(4.0);
    expect(getGradePoints("B+")).toBe(3.3);
    expect(getGradePoints("F")).toBe(0.0);
  });

  test("getGradePoints should handle honors weighting", () => {
    expect(getGradePoints("A", true)).toBe(4.5);
    expect(getGradePoints("B", true)).toBe(3.5);
    expect(getGradePoints("F", true)).toBe(0.0); // F shouldn't get honors boost
  });

  test("calculateGPA should calculate weighted average correctly", () => {
    const enrollments = [
      {
        grade: "A",
        course: { creditHours: 3, isHonors: false },
      },
      {
        grade: "B",
        course: { creditHours: 4, isHonors: true }, // (3.0 + 0.5) = 3.5
      },
    ];

    // ((3 * 4.0) + (4 * 3.5)) / 7 = (12 + 14) / 7 = 3.714...
    expect(calculateGPA(enrollments)).toBe(3.71);
  });

  test("calculateGPA should return 0 if no credits", () => {
    expect(calculateGPA([])).toBe(0);
  });

  test("calculateGPA should ignore courses with no grade", () => {
    const enrollments = [
      {
        grade: undefined,
        course: { creditHours: 3 },
      },
      {
        grade: "A",
        course: { creditHours: 3 },
      },
    ];
    expect(calculateGPA(enrollments)).toBe(4.0);
  });
});
