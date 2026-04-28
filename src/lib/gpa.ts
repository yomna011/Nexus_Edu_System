export const getGradePoints = (
  grade: string | undefined,
  isHonors: boolean = false,
): number | null => {
  if (!grade) return null;

  const basePoints: Record<string, number> = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    F: 0.0,
  };

  const g = grade.toUpperCase();
  if (!(g in basePoints)) return null;

  let points = basePoints[g];

  // Add honors weighting if applicable (and not failing)
  if (isHonors && points > 0) {
    points += 0.5; // Example: Honors gives an extra 0.5 weight
  }

  return points;
};

export interface ICourseItem {
  creditHours: number;
  isHonors?: boolean;
}

export interface IEnrollmentItem {
  grade?: string;
  course: ICourseItem;
}

export const calculateGPA = (enrollments: IEnrollmentItem[]): number => {
  let totalQualityPoints = 0;
  let totalCredits = 0;

  for (const enrollment of enrollments) {
    const points = getGradePoints(enrollment.grade, enrollment.course.isHonors);
    if (points !== null) {
      totalQualityPoints += points * enrollment.course.creditHours;
      totalCredits += enrollment.course.creditHours;
    }
  }

  if (totalCredits === 0) return 0;
  return Number((totalQualityPoints / totalCredits).toFixed(2));
};
