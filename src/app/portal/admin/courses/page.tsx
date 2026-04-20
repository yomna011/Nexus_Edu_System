'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: '',
    title: '',
    creditHours: 3,
    type: 'CORE',
    department: '',
  });

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    const res = await fetch('/api/departments');
    const data = await res.json();
    setDepartments(data);
  };

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, []);

  const filteredCourses = courses.filter((course: any) =>
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ code: '', title: '', creditHours: 3, type: 'CORE', department: '' });
    setOpen(true);
  };

  const handleOpenEdit = (course: any) => {
    setEditingId(course._id);
    setForm({
      code: course.code,
      title: course.title,
      creditHours: course.creditHours,
      type: course.type,
      department: course.department?._id || course.department,
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/courses/${editingId}` : '/api/courses';

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success(editingId ? 'Course updated successfully' : 'Course created successfully');
      setOpen(false);
      fetchCourses();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Operation failed');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Master Course Database</h1>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" /> New Course
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <div className="relative w-full max-w-sm mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code or title..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course: any) => (
                    <TableRow key={course._id}>
                      <TableCell className="font-bold">{course.code}</TableCell>
                      <TableCell>{course.title}</TableCell>
                      <TableCell>{course.creditHours}</TableCell>
                      <TableCell>{course.type}</TableCell>
                      <TableCell>{course.department?.code || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(course)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No courses found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Course' : 'Create New Course'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the details for this course.' : 'Add a new course to the catalog.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Course Code</Label>
              <Input id="code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="credits">Credit Hours</Label>
                <Input id="credits" type="number" value={form.creditHours} onChange={e => setForm({ ...form, creditHours: parseInt(e.target.value) })} required />
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CORE">Core</SelectItem>
                    <SelectItem value="ELECTIVE">Elective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Department</Label>
              <Select value={form.department} onValueChange={v => setForm({ ...form, department: v })}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((dept: any) => (
                    <SelectItem key={dept._id} value={dept._id}>{dept.code} - {dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              {editingId ? 'Update Course' : 'Create Course'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}