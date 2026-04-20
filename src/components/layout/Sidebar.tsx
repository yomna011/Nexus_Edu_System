'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  Building2, 
  UserPlus,
  BookMarked,
  ShoppingCart,
  Loader2,
   DoorOpen,
   Megaphone,
   Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { name: 'Dashboard', href: '/portal/admin/dashboard', icon: LayoutDashboard },
  { name: 'Departments', href: '/portal/admin/departments', icon: Building2 },
  { name: 'Provision User', href: '/portal/admin/users/provision', icon: UserPlus },
  { name: 'Courses', href: '/portal/admin/courses', icon: BookOpen },
  { name: 'Semesters', href: '/portal/admin/semesters', icon: Calendar },
  { name: 'Rooms', href: '/portal/admin/rooms', icon: DoorOpen },
   { name: 'Announcements', href: '/portal/admin/announcements', icon: Megaphone },
];

const studentNav: NavItem[] = [
  { name: 'Dashboard', href: '/portal/student/dashboard', icon: LayoutDashboard },
  { name: 'Catalog', href: '/portal/student/catalog', icon: BookMarked },
  { name: 'Cart', href: '/portal/student/cart', icon: ShoppingCart },
  { name: 'Directory', href: '/portal/student/directory', icon: Users },
];

const staffNav: NavItem[] = [
  { name: 'Dashboard', href: '/portal/staff/dashboard', icon: LayoutDashboard },
  { name: 'Directory', href: '/portal/staff/directory', icon: Users },
  { name: 'Booking', href: '/portal/staff/calendar', icon: Clock  },
  { name: 'Available Rooms', href: '/portal/staff/available', icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const session = await res.json();
          setUserRole(session.role);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  // Determine navigation based on actual user role
  let navItems: NavItem[] = [];
  if (userRole === 'ADMIN' || userRole === 'IT_ADMIN') {
    navItems = adminNav;
  } else if (userRole === 'STUDENT') {
    navItems = studentNav;
  } else if (userRole === 'PROFESSOR' || userRole === 'TA') {
    navItems = staffNav;
  }

  if (loading) {
    return (
      <div className="w-64 bg-white border-r flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-primary">Nexus Edu</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isactive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isactive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}