'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  Building2,
  Calendar,
  UserPlus,
  GraduationCap,
  ClipboardList,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// Stat Card Component
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  loading,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="mt-2 flex items-center text-xs text-green-600">
            <TrendingUp className="mr-1 h-3 w-3" />
            +{trend.value}% {trend.label}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Quick Action Card
function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
  color,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-all hover:shadow-md hover:border-primary/50 cursor-pointer h-full">
        <CardContent className="p-6">
          <div className={`rounded-full w-12 h-12 flex items-center justify-center ${color} mb-4`}>
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <div className="flex items-center text-sm text-primary">
            Manage <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalProfessors: 0,
    totalCourses: 0,
    activeDepartments: 0,
    activeSemester: '',
    pendingRegistrations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch counts from various endpoints
        const [studentsRes, professorsRes, coursesRes, deptsRes, semestersRes] =
          await Promise.all([
            fetch('/api/users?role=STUDENT'),
            fetch('/api/users?role=PROFESSOR,TA'),
            fetch('/api/courses'),
            fetch('/api/departments'),
            fetch('/api/semesters?active=true'),
          ]);

        const students = await studentsRes.json();
        const professors = await professorsRes.json();
        const courses = await coursesRes.json();
        const departments = await deptsRes.json();
        const activeSemesters = await semestersRes.json();

        setStats({
          totalStudents: students.length,
          totalProfessors: professors.length,
          totalCourses: courses.length,
          activeDepartments: departments.filter((d: any) => d.status === 'active').length,
          activeSemester: activeSemesters[0]?.name || 'None',
          pendingRegistrations: 0, // Could be from a registrations endpoint
        });

        // Mock recent activity (replace with actual API if available)
        setRecentActivity([
          { id: 1, action: 'New course created', detail: 'CS301 - Machine Learning', time: '2 hours ago' },
          { id: 2, action: 'Department updated', detail: 'Computer Science', time: '5 hours ago' },
          { id: 3, action: 'User provisioned', detail: 'Sarah Johnson (Student)', time: 'Yesterday' },
          { id: 4, action: 'Semester activated', detail: 'Fall 2026', time: '2 days ago' },
        ]);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'Departments',
      description: 'Create and manage academic departments',
      href: '/portal/admin/departments',
      icon: Building2,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Provision User',
      description: 'Add new students, professors, or staff',
      href: '/portal/admin/users/provision',
      icon: UserPlus,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Courses',
      description: 'Manage master course database',
      href: '/portal/admin/courses',
      icon: BookOpen,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Semesters',
      description: 'Create and activate academic terms',
      href: '/portal/admin/semesters',
      icon: Calendar,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's what's happening with your university today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          description="Enrolled across all programs"
          icon={GraduationCap}
          trend={{ value: 12, label: 'from last month' }}
          loading={loading}
        />
        <StatCard
          title="Faculty & TAs"
          value={stats.totalProfessors}
          description="Teaching staff"
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="active Courses"
          value={stats.totalCourses}
          description={`Current semester: ${stats.activeSemester}`}
          icon={BookOpen}
          loading={loading}
        />
        <StatCard
          title="Departments"
          value={stats.activeDepartments}
          description="active departments"
          icon={Building2}
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <QuickActionCard key={action.href} {...action} />
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across the system</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="rounded-full bg-muted p-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.action}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.detail}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status & Info */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current operational metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Registration Period</span>
              <Badge variant="outline" className="bg-green-50">
                active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Current Semester</span>
              <span className="font-medium">{stats.activeSemester || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending Registrations</span>
              <span className="font-medium">{stats.pendingRegistrations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Status</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Online
              </Badge>
            </div>
            <div className="pt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/portal/admin/semesters">
                  <Calendar className="mr-2 h-4 w-4" />
                  Manage Semesters
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}