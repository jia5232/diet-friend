'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from './BottomNav';

const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  useEffect(() => {
    // 로딩 중이면 아무것도 안 함
    if (isLoading) return;

    // 로그인 안 된 사용자가 보호된 페이지 접근 시 로그인으로
    if (!user && !isAuthPage) {
      router.push('/login');
    }

    // 로그인 된 사용자가 인증 페이지 접근 시 홈으로
    if (user && isAuthPage) {
      router.push('/');
    }
  }, [user, isLoading, isAuthPage, router]);

  // 로딩 중
  if (isLoading) {
    return (
      <main className="flex-1 max-w-md mx-auto w-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="text-5xl">🐰</span>
          <p className="text-pink-400 mt-4">로딩 중...</p>
        </div>
      </main>
    );
  }

  // 비로그인 사용자가 보호된 페이지 접근 시 (리다이렉트 전까지)
  if (!user && !isAuthPage) {
    return (
      <main className="flex-1 max-w-md mx-auto w-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="text-5xl">🐰</span>
          <p className="text-pink-400 mt-4">로그인이 필요해요</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className={`flex-1 max-w-md mx-auto w-full ${!isAuthPage ? 'pb-nav' : ''}`}>
        {children}
      </main>
      {!isAuthPage && <BottomNav />}
    </>
  );
}
