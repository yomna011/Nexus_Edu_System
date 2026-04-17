

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const [enrolling, setEnrolling] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    const res = await fetch('/api/cart');
    const data = await res.json();
    if (res.ok) {
      setCart(data);
    } else {
      setError(data.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const removeItem = async (courseId: string) => {
    const res = await fetch(`/api/cart/${courseId}`, { method: 'DELETE' });
    if (res.ok) {
      const data = await res.json();
      setCart(data);
      toast.success('Course removed from cart');
    } else {
      toast.error('Failed to remove course');
    }
  };

 const handleEnroll = async () => {
  setEnrolling(true);
  try {
    const res = await fetch('/api/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();

    if (!res.ok) {
      if (data.details) {
        toast.error(`Enrollment issues: ${data.details.join(', ')}`);
      } else {
        toast.error(data.error || 'Enrollment failed');
      }
    } else {
      toast.success(`Successfully enrolled in ${data.enrolled.length} course(s)`);
      if (data.errors?.length) {
        toast.warning(`Skipped: ${data.errors.join(', ')}`);
      }
      // Redirect to dashboard or refresh cart (now empty)
      router.push('/portal/student/dashboard');
    }
  } catch (error) {
    toast.error('Network error during enrollment');
  } finally {
    setEnrolling(false);
  }
};

  if (loading) {
    return <div className="p-6">Loading cart...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Registration Cart</h1>
        <div className="text-lg font-semibold">
          Total Credits: {cart?.totalCredits || 0}
        </div>
      </div>

      {cart?.items?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button className="mt-4" onClick={() => router.push('/portal/student/catalog')}>
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Selected Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map((item: any) => {
                    const course = item.course;
                    return (
                      <TableRow key={course._id}>
                        <TableCell className="font-medium">{course.code}</TableCell>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>{course.creditHours}</TableCell>
                        <TableCell>
                          {course.schedule ? (
                            `${course.schedule.day} ${course.schedule.startTime}-${course.schedule.endTime}`
                          ) : 'TBA'}
                        </TableCell>
                        <TableCell>{course.department?.code}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(course._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.push('/portal/student/catalog')}>
              Continue Registering
            </Button>
            <Button onClick={handleEnroll} disabled={enrolling}>
  {enrolling ? 'Enrolling...' : 'Proceed to Enroll'}
</Button>
          </div>
        </>
      )}
    </div>
  );
}