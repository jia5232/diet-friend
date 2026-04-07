'use client';

import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';

const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  return (
    <>
      <main className={`flex-1 max-w-md mx-auto w-full ${!isAuthPage ? 'pb-nav' : ''}`}>
        {children}
      </main>
      {!isAuthPage && <BottomNav />}
    </>
  );
}
