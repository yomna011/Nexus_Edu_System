// 'use client';

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { toast } from 'sonner';

// export default function ProvisionUserPage() {
//   const [form, setForm] = useState({
//     name: '',
//     nationalId: '',
//     departmentId: '',
//     role: 'STUDENT',
//   });
//   const [createdUser, setCreatedUser] = useState<any>(null);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     const res = await fetch('/api/users', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(form),
//     });
//     const data = await res.json();
//     if (res.ok) {
//       setCreatedUser(data.user);
//       toast.success('User created successfully');
//     } else {
//       toast.error(data.error || 'Failed to create user');
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Provision New User</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader><CardTitle>User Details</CardTitle></CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <Label>Full Name</Label>
//                 <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
//               </div>
//               <div>
//                 <Label>National ID</Label>
//                 <Input value={form.nationalId} onChange={e => setForm({...form, nationalId: e.target.value})} />
//               </div>
//               <div>
//                 <Label>Department ID (optional)</Label>
//                 <Input value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})} />
//               </div>
//               <div>
//                 <Label>Role</Label>
//                 <Select value={form.role} onValueChange={v => setForm({...form, role: v})}>
//                   <SelectTrigger><SelectValue /></SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="STUDENT">Student</SelectItem>
//                     <SelectItem value="PROFESSOR">Professor</SelectItem>
//                     <SelectItem value="TA">Teaching Assistant</SelectItem>
//                     <SelectItem value="ADMIN">Admin</SelectItem>
//                     <SelectItem value="IT_ADMIN">IT Admin</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</Button>
//             </form>
//           </CardContent>
//         </Card>
//         {createdUser && (
//           <Card>
//             <CardHeader><CardTitle>Provisioning Success</CardTitle></CardHeader>
//             <CardContent>
//               <Alert>
//                 <AlertDescription>
//                   <p><strong>Email:</strong> {createdUser.email}</p>
//                   <p><strong>Temporary Password:</strong> {createdUser.temporaryPassword}</p>
//                   <p className="text-sm text-muted-foreground mt-2">Provide these credentials to the user securely.</p>
//                 </AlertDescription>
//               </Alert>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function ProvisionUserPage() {
  const [form, setForm] = useState({
  name: '',
  nationalId: '',
  departmentId: 'none',  // default to "none"
  role: 'STUDENT',
});
  const [departments, setDepartments] = useState([]);
  const [createdUser, setCreatedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch departments for dropdown
  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(setDepartments)
      .catch(() => toast.error('Failed to load departments'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setCreatedUser(data.user);
      toast.success('User created successfully');
      setForm({ name: '', nationalId: '', departmentId: 'none', role: 'STUDENT' });
    } else {
      toast.error(data.error || 'Failed to create user');
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Provision New User</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>User Details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div>
                <Label>National ID</Label>
                <Input value={form.nationalId} onChange={e => setForm({...form, nationalId: e.target.value})} />
              </div>
              <div>
                <Label>Department (optional)</Label>
                <Select
                  value={form.departmentId}
                  onValueChange={(v) => setForm({...form, departmentId: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {departments.map((dept: any) => (
                      <SelectItem key={dept._id} value={dept._id}>
                        {dept.code} - {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Role</Label>
                <Select value={form.role} onValueChange={v => setForm({...form, role: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="PROFESSOR">Professor</SelectItem>
                    <SelectItem value="TA">Teaching Assistant</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="IT_ADMIN">IT Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</Button>
            </form>
          </CardContent>
        </Card>
        {createdUser && (
          <Card>
            <CardHeader><CardTitle>Provisioning Success</CardTitle></CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  <p><strong>Email:</strong> {createdUser.email}</p>
                  <p><strong>Temporary Password:</strong> {createdUser.temporaryPassword}</p>
                  <p className="text-sm text-muted-foreground mt-2">Provide these credentials to the user securely.</p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}