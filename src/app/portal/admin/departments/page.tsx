'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription 
} from '@/components/ui/dialog';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Switch } from '@/components/ui/switch';
import { Plus, UserCheck, UserPlus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [assigningDept, setAssigningDept] = useState<any>(null);
  const [deptToDelete, setDeptToDelete] = useState<any>(null);
  
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [form, setForm] = useState({ name: '', code: '', college: '', headOfDepartment: '', status: 'active' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, staffRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/users?role=staff')
      ]);
      setDepartments(await deptRes.json());
      setStaff(await staffRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success('Department created');
      setIsCreateOpen(false);
      setForm({ name: '', code: '', college: '', headOfDepartment: '', status: 'active' });
      fetchData();
    } else {
      const data = await res.json();
      toast.error(data.error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const res = await fetch(`/api/departments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      toast.success(`Status updated to ${newStatus}`);
      fetchData();
    } else {
      const err = await res.json();
      toast.error(err.error);
    }
  };

  const handleAssignHOD = async () => {
    const res = await fetch(`/api/departments/${assigningDept._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ headOfDepartment: selectedStaffId }),
    });
    if (res.ok) {
      toast.success('HOD assigned');
      setAssigningDept(null);
      setSelectedStaffId('');
      fetchData();
    }
  };

  const confirmDelete = async () => {
    const res = await fetch(`/api/departments/${deptToDelete._id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      toast.success("Department deleted");
      fetchData();
    } else {
      toast.error(data.error);
    }
    setDeptToDelete(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4" /> New Department</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Department</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <Input placeholder="Code" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required />
              <Input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <Input placeholder="College" value={form.college} onChange={e => setForm({...form, college: e.target.value})} required />
              <select className="w-full border p-2 rounded text-sm bg-white" value={form.headOfDepartment} onChange={e => setForm({...form, headOfDepartment: e.target.value})}>
                <option value="">Initial HOD (Optional)</option>
                {staff.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <Button type="submit" className="w-full">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? <Loader2 className="animate-spin mx-auto" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>HOD</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept: any) => (
                  <TableRow key={dept._id}>
                    <TableCell className="font-bold">{dept.code}</TableCell>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>
                      {dept.headOfDepartment ? (
                        <span className="flex items-center gap-1"><UserCheck className="h-4 text-blue-500"/> {dept.headOfDepartment.name}</span>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => setAssigningDept(dept)}>Assign</Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${dept.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{dept.status}</span>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-[10px]">Active</Label>
                        <Switch checked={dept.status === 'active'} onCheckedChange={() => handleToggleStatus(dept._id, dept.status)} />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setDeptToDelete(dept)}><Trash2 className="h-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={!!assigningDept} onOpenChange={() => setAssigningDept(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign HOD</DialogTitle></DialogHeader>
          <select className="w-full border p-2 rounded mt-4 bg-white" value={selectedStaffId} onChange={e => setSelectedStaffId(e.target.value)}>
            <option value="">Select Staff...</option>
            {staff.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <Button onClick={handleAssignHOD} className="mt-4">Confirm</Button>
        </DialogContent>
      </Dialog>

      {/* AlertDialog for Delete */}
      <AlertDialog open={!!deptToDelete} onOpenChange={() => setDeptToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete {deptToDelete?.name}. Deletion is blocked if students or courses are linked.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}