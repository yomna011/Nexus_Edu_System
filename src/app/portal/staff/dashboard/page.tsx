'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  Users,
  Clock,
  MapPin,
  ArrowRight,
  GraduationCap,
  Bell,
  Mail,
  Building2,
  DoorOpen,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function StaffDashboard() {
  const [loading, setLoading] = useState(true);
  const [staffData, setStaffData] = useState<any>(null);
  const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
  const [activeSemester, setactiveSemester] = useState<any>(null);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [myBookings, setMyBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch session (staff details)
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        setStaffData(session);

        // 2. Fetch active semester
        const semRes = await fetch('/api/semesters?active=true');
        const semData = await semRes.json();
        const activeSem = semData[0] || null;
        setactiveSemester(activeSem);

        // 3. Fetch courses assigned to this staff member for the active semester
        if (activeSem && session?._id) {
          const coursesRes = await fetch(`/api/courses?instructor=${session._id}&semesterId=${activeSem._id}`);
          if (coursesRes.ok) {
            const coursesData = await coursesRes.json();
            setAssignedCourses(coursesData);

            const total = coursesData.reduce((sum: number, course: any) => sum + (course.enrolledCount || 0), 0);
            setTotalStudents(total);

            const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase().slice(0, 3);
            const todayCourses = coursesData.filter((course: any) => course.schedule?.day === today);
            setTodaySchedule(todayCourses);
          }
        }

        // 4. Fetch my room bookings (upcoming)
        const bookingsRes = await fetch('/api/bookings');
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          const myUpcoming = bookingsData.filter((b: any) =>
            b.bookedBy?._id === session._id && new Date(b.endTime) > new Date()
          );
          setMyBookings(myUpcoming);
        }
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const roleLabel = staffData?.role === 'PROFESSOR' ? 'Professor' : 'Teaching Assistant';
  const initials = staffData?.name
    ? staffData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header with Profile */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {staffData?.name?.split(' ')[0] || 'Staff'}!
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-sm">
                {roleLabel}
              </Badge>
              {staffData?.department && (
                <Badge variant="secondary" className="text-sm">
                  <Building2 className="mr-1 h-3 w-3" />
                  {staffData.department.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/portal/staff/directory">
              <Users className="mr-2 h-4 w-4" />
              Directory
            </Link>
          </Button>
          <Button asChild>
            <Link href="/portal/staff/calendar">
              <Calendar className="mr-2 h-4 w-4" />
              Room Calendar
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Teaching</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{assignedCourses.length}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {activeSemester?.name || 'No active semester'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totalStudents}</div>
            )}
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Office Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-sm font-medium">
                {staffData?.officeHours || 'Not set'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {staffData?.officeHours ? 'By appointment' : 'Contact department'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{todaySchedule.length}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Teaching Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Teaching Schedule</CardTitle>
            <CardDescription>
              Your assigned courses for {activeSemester?.name || 'current semester'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : assignedCourses.length > 0 ? (
              <div className="space-y-3">
                {assignedCourses.map((course) => (
                  <div key={course._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{course.code} - {course.title}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.schedule?.day} {course.schedule?.startTime}-{course.schedule?.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {course.schedule?.room || 'TBA'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{course.enrolledCount || 0} students</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{course.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No courses assigned</h3>
                <p className="text-sm text-muted-foreground">
                  You don't have any teaching assignments for this semester.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Today, Bookings & Contact Info */}
        <div className="space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle>Today's Classes</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-20 w-full" />
              ) : todaySchedule.length > 0 ? (
                <div className="space-y-3">
                  {todaySchedule.map((course) => (
                    <div key={course._id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{course.code}</p>
                        <p className="text-sm text-muted-foreground">
                          {course.schedule?.startTime}-{course.schedule?.endTime} • {course.schedule?.room}
                        </p>
                      </div>
                      <Badge>{course.enrolledCount || 0} students</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No classes scheduled today
                </p>
              )}
            </CardContent>
          </Card>

          {/* My Upcoming Room Bookings - NEW SECTION */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DoorOpen className="h-5 w-5" />
                My Upcoming Bookings
              </CardTitle>
              <CardDescription>Rooms you have reserved</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-20 w-full" />
              ) : myBookings.length > 0 ? (
                <div className="space-y-3">
                  {myBookings.slice(0, 3).map((booking) => (
                    <div key={booking._id} className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium">{booking.title}</p>
                      <div className="text-sm text-muted-foreground space-y-1 mt-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleTimeString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {booking.room?.name} ({booking.room?.building})
                        </div>
                        {booking.course && (
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-3 w-3" />
                            {booking.course.code}: {booking.course.title}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming room bookings.
                </p>
              )}
              <Button asChild variant="link" className="mt-2 p-0">
                <Link href="/portal/staff/calendar">Book a room →</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Contact & Department Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{staffData?.email || 'Loading...'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {staffData?.department?.name || 'No department assigned'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Office Hours: {staffData?.officeHours || 'Not specified'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Link to Full Calendar */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Need to book a room?</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Check real‑time availability of classrooms and labs.
                  </p>
                  <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/portal/staff/calendar">
                      View Room Calendar <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}