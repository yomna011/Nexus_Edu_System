// 'use client';

// import { useEffect, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Plus } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';

// export default function CoursesPage() {
//   const [courses, setCourses] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [form, setForm] = useState({
//     code: '',
//     title: '',
//     creditHours: 3,
//     type: 'CORE',
//     department: '',
//   });
//   const { toast } = useToast();

//   const fetchCourses = async () => {
//     const res = await fetch('/api/courses');
//     const data = await res.json();
//     setCourses(data);
//   };

//   const fetchDepartments = async () => {
//     const res = await fetch('/api/departments');
//     const data = await res.json();
//     setDepartments(data);
//   };

//   useEffect(() => {
//     fetchCourses();
//     fetchDepartments();
//   }, []);

//   const handleCreate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const res = await fetch('/api/courses', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(form),
//     });
//     if (res.ok) {
//       toast({ title: 'Course created successfully' });
//       setOpen(false);
//       setForm({ code: '', title: '', creditHours: 3, type: 'CORE', department: '' });
//       fetchCourses();
//     } else {
//       const data = await res.json();
//       toast({ title: 'Error', description: data.error, variant: 'destructive' });
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">Master Course Database</h1>
//         <Dialog open={open} onOpenChange={setOpen}>
//           <DialogTrigger asChild>
//             <Button><Plus className="mr-2 h-4 w-4" /> New Course</Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader><DialogTitle>Create Course</DialogTitle></DialogHeader>
//             <form onSubmit={handleCreate} className="space-y-4">
//               <div>
//                 <Label>Course Code</Label>
//                 <Input value={form.code} onChange={e => setForm({...form, code: e.target.value})} required />
//               </div>
//               <div>
//                 <Label>Title</Label>
//                 <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
//               </div>
//               <div>
//                 <Label>Credit Hours</Label>
//                 <Input type="number" value={form.creditHours} onChange={e => setForm({...form, creditHours: parseInt(e.target.value)})} required />
//               </div>
//               <div>
//                 <Label>Type</Label>
//                 <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
//                   <SelectTrigger><SelectValue /></SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="CORE">Core</SelectItem>
//                     <SelectItem value="ELECTIVE">Elective</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div>
//                 <Label>Department</Label>
//                 <Select value={form.department} onValueChange={v => setForm({...form, department: v})}>
//                   <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
//                   <SelectContent>
//                     {departments.map((dept: any) => (
//                       <SelectItem key={dept._id} value={dept._id}>{dept.code} - {dept.name}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <Button type="submit">Create</Button>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <Card>
//         <CardHeader><CardTitle>All Courses</CardTitle></CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Code</TableHead>
//                 <TableHead>Title</TableHead>
//                 <TableHead>Credits</TableHead>
//                 <TableHead>Type</TableHead>
//                 <TableHead>Department</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {courses.map((course: any) => (
//                 <TableRow key={course._id}>
//                   <TableCell className="font-medium">{course.code}</TableCell>
//                   <TableCell>{course.title}</TableCell>
//                   <TableCell>{course.creditHours}</TableCell>
//                   <TableCell>{course.type}</TableCell>
//                   <TableCell>{course.department?.code}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: '',
    title: '',
    creditHours: 3,
    type: 'CORE',
    department: '',
  });

  const fetchCourses = async () => {
    const res = await fetch('/api/courses');
    const data = await res.json();
    setCourses(data);
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success('Course created successfully');
      setOpen(false);
      setForm({ code: '', title: '', creditHours: 3, type: 'CORE', department: '' });
      fetchCourses();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Failed to create course');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Master Course Database</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Course</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Course</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Course Code</Label>
                <Input value={form.code} onChange={e => setForm({...form, code: e.target.value})} required />
              </div>
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div>
                <Label>Credit Hours</Label>
                <Input type="number" value={form.creditHours} onChange={e => setForm({...form, creditHours: parseInt(e.target.value)})} required />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CORE">Core</SelectItem>
                    <SelectItem value="ELECTIVE">Elective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Select value={form.department} onValueChange={v => setForm({...form, department: v})}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((dept: any) => (
                      <SelectItem key={dept._id} value={dept._id}>{dept.code} - {dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>All Courses</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Department</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course: any) => (
                <TableRow key={course._id}>
                  <TableCell className="font-medium">{course.code}</TableCell>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.creditHours}</TableCell>
                  <TableCell>{course.type}</TableCell>
                  <TableCell>{course.department?.code}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}