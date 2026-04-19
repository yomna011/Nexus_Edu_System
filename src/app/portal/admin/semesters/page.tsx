// 'use client';

// import { useEffect, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { Plus, CheckCircle } from 'lucide-react';
// import { toast } from 'sonner';
// import { formatDate } from '@/lib/utils';

// export default function SemestersPage() {
//   const [semesters, setSemesters] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [form, setForm] = useState({
//     name: '',
//     termType: 'FALL',
//     academicYear: new Date().getFullYear().toString(),
//     startDate: '',
//     endDate: '',
//     addDropDeadline: '',
//     finalExamStart: '',
//   });
//   const { toast } = useToast();

//   const fetchSemesters = async () => {
//     const res = await fetch('/api/semesters');
//     const data = await res.json();
//     setSemesters(data);
//   };

//   useEffect(() => { fetchSemesters(); }, []);

//   const handleCreate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const res = await fetch('/api/semesters', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(form),
//     });
//     if (res.ok) {
//       toast({ title: 'Semester created' });
//       setOpen(false);
//       fetchSemesters();
//     } else {
//       const data = await res.json();
//       toast({ title: 'Error', description: data.error, variant: 'destructive' });
//     }
//   };

//   const handleActivate = async (id: string) => {
//     const res = await fetch(`/api/semesters/${id}`, {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ status: 'ACTIVE' }),
//     });
//     if (res.ok) {
//       toast({ title: 'Semester activated' });
//       fetchSemesters();
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">Semester Management</h1>
//         <Dialog open={open} onOpenChange={setOpen}>
//           <DialogTrigger asChild>
//             <Button><Plus className="mr-2 h-4 w-4" /> New Semester</Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-md">
//             <DialogHeader><DialogTitle>Create Semester</DialogTitle></DialogHeader>
//             <form onSubmit={handleCreate} className="space-y-4">
//               <div>
//                 <Label>Name (e.g., Fall 2026)</Label>
//                 <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
//               </div>
//               <div>
//                 <Label>Term Type</Label>
//                 <Select value={form.termType} onValueChange={v => setForm({...form, termType: v})}>
//                   <SelectTrigger><SelectValue /></SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="FALL">Fall</SelectItem>
//                     <SelectItem value="SPRING">Spring</SelectItem>
//                     <SelectItem value="SUMMER">Summer</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div>
//                 <Label>Academic Year</Label>
//                 <Input value={form.academicYear} onChange={e => setForm({...form, academicYear: e.target.value})} required />
//               </div>
//               <div>
//                 <Label>Start Date</Label>
//                 <Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required />
//               </div>
//               <div>
//                 <Label>End Date</Label>
//                 <Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required />
//               </div>
//               <div>
//                 <Label>Add/Drop Deadline</Label>
//                 <Input type="date" value={form.addDropDeadline} onChange={e => setForm({...form, addDropDeadline: e.target.value})} required />
//               </div>
//               <div>
//                 <Label>Final Exam Week Start</Label>
//                 <Input type="date" value={form.finalExamStart} onChange={e => setForm({...form, finalExamStart: e.target.value})} required />
//               </div>
//               <Button type="submit">Create</Button>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <Card>
//         <CardHeader><CardTitle>All Semesters</CardTitle></CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Type</TableHead>
//                 <TableHead>Dates</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {semesters.map((sem: any) => (
//                 <TableRow key={sem._id}>
//                   <TableCell className="font-medium">{sem.name}</TableCell>
//                   <TableCell>{sem.termType}</TableCell>
//                   <TableCell>{formatDate(sem.startDate)} - {formatDate(sem.endDate)}</TableCell>
//                   <TableCell>
//                     <Badge variant={sem.status === 'ACTIVE' ? 'default' : 'secondary'}>
//                       {sem.status}
//                     </Badge>
//                   </TableCell>
//                   <TableCell>
//                     {sem.status === 'DRAFT' && (
//                       <Button size="sm" onClick={() => handleActivate(sem._id)}>
//                         <CheckCircle className="mr-1 h-4 w-4" /> Activate
//                       </Button>
//                     )}
//                   </TableCell>
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
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

export default function SemestersPage() {
  const [semesters, setSemesters] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    termType: 'FALL',
    academicYear: new Date().getFullYear().toString(),
    startDate: '',
    endDate: '',
    addDropDeadline: '',
    finalExamStart: '',
  });

  const fetchSemesters = async () => {
    const res = await fetch('/api/semesters');
    const data = await res.json();
    setSemesters(data);
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/semesters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success('Semester created');
      setOpen(false);
      fetchSemesters();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Failed to create semester');
    }
  };

  const handleActivate = async (id: string) => {
    const res = await fetch(`/api/semesters/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACTIVE' }),
    });
    if (res.ok) {
      toast.success('Semester activated');
      fetchSemesters();
    } else {
      toast.error('Failed to activate semester');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Semester Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Semester</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Create Semester</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Name (e.g., Fall 2026)</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div>
                <Label>Term Type</Label>
                <Select value={form.termType} onValueChange={v => setForm({...form, termType: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FALL">Fall</SelectItem>
                    <SelectItem value="SPRING">Spring</SelectItem>
                    <SelectItem value="SUMMER">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Academic Year</Label>
                <Input value={form.academicYear} onChange={e => setForm({...form, academicYear: e.target.value})} required />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required />
              </div>
              <div>
                <Label>Add/Drop Deadline</Label>
                <Input type="date" value={form.addDropDeadline} onChange={e => setForm({...form, addDropDeadline: e.target.value})} required />
              </div>
              <div>
                <Label>Final Exam Week Start</Label>
                <Input type="date" value={form.finalExamStart} onChange={e => setForm({...form, finalExamStart: e.target.value})} required />
              </div>
              <Button type="submit">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>All Semesters</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {semesters.map((sem: any) => (
                <TableRow key={sem._id}>
                  <TableCell className="font-medium">{sem.name}</TableCell>
                  <TableCell>{sem.termType}</TableCell>
                  <TableCell>{formatDate(sem.startDate)} - {formatDate(sem.endDate)}</TableCell>
                  <TableCell>
                    <Badge variant={sem.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {sem.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {sem.status === 'DRAFT' && (
                      <Button size="sm" onClick={() => handleActivate(sem._id)}>
                        <CheckCircle className="mr-1 h-4 w-4" /> Activate
                      </Button>
                    )}
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