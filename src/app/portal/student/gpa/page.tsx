"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Award, BookOpen, AlertCircle } from "lucide-react";

export default function StudentGPAPage() {
  const [loading, setLoading] = useState(true);
  const [gpaData, setGpaData] = useState<any>(null);

  useEffect(() => {
    const fetchGpaData = async () => {
      try {
        const res = await fetch("/api/student/gpa");
        if (res.ok) {
          const data = await res.json();
          setGpaData(data);
        } else {
          throw new Error("Failed to fetch GPA");
        }
      } catch (error) {
        toast.error("Unable to retrieve academic standing");
      } finally {
        setLoading(false);
      }
    };
    fetchGpaData();
  }, []);

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Academic Standing
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            View your semester and cumulative GPA
          </p>
        </div>
        <Badge
          variant="outline"
          className="px-4 py-1 text-sm bg-primary/10 w-fit"
        >
          <GraduationCap className="w-4 h-4 mr-2 text-primary" />
          Official Transcript
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cumulative GPA Card */}
        <Card className="bg-gradient-to-br from-primary/5 via-background to-background border-primary/20 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
              <Award className="w-5 h-5" />
              Cumulative GPA
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-14 w-32" />
            ) : (
              <div className="flex items-end gap-3">
                <span className="text-6xl font-black tracking-tighter">
                  {gpaData?.cumulativeGPA?.toFixed(2) || "0.00"}
                </span>
                <span className="text-xl text-muted-foreground mb-2">
                  / 4.00
                </span>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              Aggregate of all historical semester data based on verified
              credits.
            </p>
          </CardContent>
        </Card>

        {/* Current/Latest Semester GPA Card */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              Recent Semester GPA
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-14 w-32" />
            ) : (
              <div className="flex items-end gap-3">
                <span className="text-5xl font-bold tracking-tight">
                  {gpaData?.currentSemesterGPA?.toFixed(2) || "0.00"}
                </span>
                <span className="text-lg text-muted-foreground mb-1">
                  / 4.00
                </span>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              GPA calculated based on your most recently completed courses.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Semester Breakdown */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Semester Breakdown
        </h2>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : gpaData?.semesterBreakdown?.length > 0 ? (
          <div className="grid gap-6">
            {gpaData.semesterBreakdown.map((sem: any) => (
              <Card
                key={sem.semester.id}
                className="overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="bg-muted/30 p-6 md:w-1/3 flex flex-col justify-center border-b md:border-b-0 md:border-r">
                    <h3 className="font-bold text-xl">{sem.semester.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {sem.semester.academicYear} • {sem.semester.termType}
                    </p>
                    <div className="mt-auto flex items-baseline gap-2">
                      <span className="text-3xl font-bold">
                        {sem.gpa.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">GPA</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {sem.credits} Credits Earned
                    </p>
                  </div>
                  <div className="p-6 md:w-2/3">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                      Course Grades
                    </h4>
                    <div className="grid gap-3">
                      {sem.courses?.length > 0 ? (
                        sem.courses.map((course: any) => (
                          <div
                            key={course.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-background/50"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {course.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {course.code}
                              </span>
                            </div>
                            <Badge
                              variant="secondary"
                              className="font-bold text-sm"
                            >
                              {course.grade}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm flex items-center text-muted-foreground gap-2">
                          <AlertCircle className="w-4 h-4" />
                          No official course grades available for this semester.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-dashed">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">
              No Academic Records
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              You do not have any verified grades recorded yet. Your GPA will
              appear here once grades are finalized at the end of the semester.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
