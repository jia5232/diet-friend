'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 회원가입 후 리다이렉트 시 메시지 표시
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('회원가입이 완료되었습니다. 로그인해주세요.');
    }
  }, [searchParams]);

  // 이미 로그인 되어있으면 홈으로
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    const { error } = await signIn(email, password);

    setIsLoading(false);

    if (error) {
      setError(error);
      return;
    }

    router.push('/');
  };

  return (
    <div className="w-full max-w-sm">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-pink-500">빼빼</h1>
        <p className="text-gray-400 text-sm mt-2">로그인하고 기록을 시작해요</p>
      </div>

      {/* 성공 메시지 */}
      {success && (
        <div className="bg-green-50 text-green-600 text-sm p-3 rounded-xl mb-4 text-center">
          {success}
        </div>
      )}

      {/* 폼 */}
      <form onSubmit={handleLogin} className="card rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-gray-600 text-sm font-medium mb-1.5">
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
          />
        </div>

        <div>
          <label className="block text-gray-600 text-sm font-medium mb-1.5">
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl btn-primary font-medium disabled:opacity-50"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>

        <Link
          href="/forgot-password"
          className="block text-center text-gray-400 text-sm hover:text-pink-500"
        >
          비밀번호를 잊으셨나요?
        </Link>
      </form>

      {/* 회원가입 링크 */}
      <p className="text-center text-gray-400 text-sm mt-6">
        아직 계정이 없으신가요?{' '}
        <Link href="/signup" className="text-pink-500 font-medium">
          회원가입
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-pink-50 to-white">
      <Suspense fallback={<div className="text-pink-400">로딩 중...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
