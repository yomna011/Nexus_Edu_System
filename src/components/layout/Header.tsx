'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function Header() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data))
      .catch(() => setUser(null));
  }, []);

  return (
    <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold">
        Welcome, {user?.name || 'User'}
      </h2> 
    </header>
  );
}