"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  ShoppingCart,
  BookMarked,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  User,
  Info,
  Bell,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [activeSemester, setactiveSemester] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [gpaData, setGpaData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch student session
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        setStudentData(session);

        // Fetch active semester
        const semRes = await fetch("/api/semesters?active=true");
        const semData = await semRes.json();
        setactiveSemester(semData[0] || null);

        // Fetch enrollments for active semester
        const enrollRes = await fetch("/api/enrollments");
        if (enrollRes.ok) {
          const enrollData = await enrollRes.json();
          // enrollData is an array of enrollments with populated course
          const courses = enrollData.map((e: any) => e.course);
          setEnrolledCourses(courses);
        }

        // Fetch cart count
        const cartRes = await fetch("/api/cart");
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          setCartCount(cartData.items?.length || 0);
        }

        // Fetch announcements for student
        const announceRes = await fetch("/api/announcements");
        if (announceRes.ok) {
          const announceData = await announceRes.json();
          setAnnouncements(announceData);
        }

        // Fetch GPA data
        const gpaRes = await fetch("/api/student/gpa");
        if (gpaRes.ok) {
          const gpaJson = await gpaRes.json();
          setGpaData(gpaJson);
        }
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate total enrolled credits
  const totalCredits = enrolledCourses.reduce(
    (sum, course) => sum + (course.creditHours || 0),
    0,
  );
  const maxCredits = 18; // Typical max per semester

  // Helper to get announcement icon based on type
  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case "URGENT":
        return <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />;
      case "WARNING":
        return <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />;
      case "EVENT":
        return <Bell className="h-5 w-5 text-green-500 shrink-0" />;
      default:
        return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
    }
  };

  // Format announcement date
  const formatAnnouncementDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {studentData?.name?.split(" ")[0] || "Student"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {activeSemester ? (
              <>
                Current semester:{" "}
                <span className="font-medium">{activeSemester.name}</span>
              </>
            ) : (
              "No active semester"
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/portal/student/gpa">
              <GraduationCap className="mr-2 h-4 w-4" />
              Academic Standing
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/portal/student/catalog">
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Catalog
            </Link>
          </Button>
          <Button asChild>
            <Link href="/portal/student/cart">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart ({cartCount})
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Enrolled Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            )}
            <p className="text-xs text-muted-foreground">Current semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Hours</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {totalCredits} / {maxCredits}
              </div>
            )}
            <Progress
              value={(totalCredits / maxCredits) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Registration Status
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {activeSemester?.isRegistrationTerm ? "Open" : "Closed"}
              <Badge
                variant={
                  activeSemester?.isRegistrationTerm ? "default" : "secondary"
                }
              >
                {activeSemester?.isRegistrationTerm ? "active" : "inactive"}
              </Badge>
            </div>
            {activeSemester?.addDropDeadline && (
              <p className="text-xs text-muted-foreground">
                Deadline:{" "}
                {new Date(activeSemester.addDropDeadline).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Academic Standing
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {gpaData?.cumulativeGPA >= 2.0
                    ? "Good"
                    : gpaData?.cumulativeGPA
                      ? "Probation"
                      : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cumulative GPA: {gpaData?.cumulativeGPA?.toFixed(2) || "0.00"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Enrolled Courses */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Current Enrollments</CardTitle>
              <CardDescription>
                Your registered courses for this semester
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/portal/student/catalog">
                Add Courses <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : enrolledCourses.length > 0 ? (
              <div className="space-y-3">
                {enrolledCourses.map((course) => (
                  <div
                    key={course._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {course.code} - {course.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {course.schedule?.day} {course.schedule?.startTime}-
                          {course.schedule?.endTime} •{" "}
                          {course.schedule?.room || "TBA"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {course.creditHours} credits
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {course.instructor?.name || "Staff"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No enrolled courses</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't enrolled in any courses for this semester.
                </p>
                <Button asChild>
                  <Link href="/portal/student/catalog">Browse Catalog</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Announcements & Deadlines */}
        <div className="space-y-6">
          {/* Important Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
              <CardDescription>Upcoming deadlines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeSemester ? (
                <>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Add/Drop Deadline</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          activeSemester.addDropDeadline,
                        ).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Final Exams Begin</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          activeSemester.finalExamStart,
                        ).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No active semester
                </p>
              )}
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
              <CardDescription>Latest updates for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : announcements.length > 0 ? (
                announcements.slice(0, 5).map((announcement) => (
                  <div key={announcement._id} className="flex gap-3">
                    {getAnnouncementIcon(announcement.type)}
                    <div className="space-y-1">
                      <p className="font-medium text-sm">
                        {announcement.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {announcement.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatAnnouncementDate(announcement.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No announcements at this time.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Tip */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <BookMarked className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Need help?</p>
                  <p className="text-sm text-muted-foreground">
                    Visit the course catalog to explore offerings or contact
                    your academic advisor.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
