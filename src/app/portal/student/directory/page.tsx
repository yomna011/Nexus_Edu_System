'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Mail, MapPin, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function DirectoryPage() {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filter, setFilter] = useState({ search: '', department: 'ALL' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staffRes, deptRes] = await Promise.all([
          fetch('/api/users?role=PROFESSOR,TA'),
          fetch('/api/departments'),
        ]);
        const staffData = await staffRes.json();
        const deptData = await deptRes.json();
        setStaff(staffData);
        setDepartments(deptData);
      } catch (error) {
        toast.error('Failed to load directory');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredStaff = staff.filter((s: any) => {
    // Updated condition: department filter now uses 'ALL' sentinel
    if (filter.department !== 'ALL' && s.department?._id !== filter.department) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        s.name.toLowerCase().includes(searchLower) ||
        s.email.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) return <div className="p-6">Loading directory...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Academic Staff Directory</h1>
        <p className="text-muted-foreground">
          Find professors, TAs, and their contact information
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          />
        </div>
        <Select
          value={filter.department}
          onValueChange={(v) => setFilter({ ...filter, department: v })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Departments</SelectItem> 
            {departments.map((dept: any) => (
              <SelectItem key={dept._id} value={dept._id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faculty & Teaching Assistants</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Office Hours</TableHead>
                <TableHead>Assigned Courses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((person: any) => (
                <TableRow key={person._id}>
                  <TableCell className="font-medium">{person.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{person.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${person.email}`} className="text-sm hover:underline">
                        {person.email}
                      </a>
                    </div>
                  </TableCell>

                  <TableCell>
                    {person.department?.name || '—'}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-sm">
                        {person.officeHours || 'Not specified'}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {person.courses?.map((course: any) => (
                        <div key={course._id} className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] font-mono">
                            {course.code}
                          </Badge>
                          <span className="text-sm truncate max-w-[150px]" title={course.title}>
                            {course.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}