'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Search } from 'lucide-react';

export default function CatalogPage() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filter, setFilter] = useState({ department: 'ALL', type: 'ALL', search: '' });
  const [semester, setSemester] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const semRes = await fetch('/api/semesters?active=true');
        const semData = await semRes.json();
        if (semData.length > 0) {
          setSemester(semData[0]);
          const courseRes = await fetch(`/api/courses?semesterId=${semData[0]._id}`);
          const courseData = await courseRes.json();
          setCourses(courseData);
        }
        const deptRes = await fetch('/api/departments');
        const deptData = await deptRes.json();
        setDepartments(deptData);
      } catch (error) {
        toast.error('Failed to load catalog');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCourses = courses.filter((c: any) => {
    if (filter.type !== 'ALL' && c.type !== filter.type) return false;
    if (filter.department !== 'ALL' && c.department?._id !== filter.department) return false;
    if (filter.search && !c.title.toLowerCase().includes(filter.search.toLowerCase()) && !c.code.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const addToCart = async (courseId: string) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Cannot add to cart');
      } else {
        toast.success('Added to cart');
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) return <div className="p-6">Loading catalog...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Course Catalog</h1>
        {semester && (
          <p className="text-muted-foreground">
            {semester.name} • Registration open until {new Date(semester.addDropDeadline).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-9"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          />
        </div>
        <Select value={filter.type} onValueChange={(v) => setFilter({ ...filter, type: v })}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="CORE">Core</SelectItem>
            <SelectItem value="ELECTIVE">Elective</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter.department} onValueChange={(v) => setFilter({ ...filter, department: v })}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Departments</SelectItem>
            {departments.map((dept: any) => (
              <SelectItem key={dept._id} value={dept._id}>
                {dept.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course: any) => (
          <Card key={course._id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{course.code}</CardTitle>
                  <p className="text-sm text-muted-foreground">{course.title}</p>
                </div>
                <Badge variant={course.type === 'CORE' ? 'default' : 'secondary'}>
                  {course.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Credits:</span> {course.creditHours}
                </p>
                <p>
                  <span className="font-medium">Department:</span> {course.department?.name}
                </p>
                {course.schedule && (
                  <p>
                    <span className="font-medium">Schedule:</span> {course.schedule.day} {course.schedule.startTime}-{course.schedule.endTime}
                  </p>
                )}
                <p>
                  <span className="font-medium">Seats:</span> {course.enrolledCount}/{course.capacity}
                </p>
              </div>
              <Button className="w-full mt-4" onClick={() => addToCart(course._id)}>
                Register Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}