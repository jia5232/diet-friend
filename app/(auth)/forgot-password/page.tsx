'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    const { error } = await resetPassword(email);

    setIsLoading(false);

    if (error) {
      setError(error);
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-pink-50 to-white">
        <div className="w-full max-w-sm text-center">
          <div className="card rounded-2xl p-6">
            <span className="text-5xl">📧</span>
            <h2 className="text-xl font-bold text-gray-800 mt-4">이메일을 확인해주세요</h2>
            <p className="text-gray-500 text-sm mt-2">
              {email}로 비밀번호 재설정 링크를 보냈어요.
            </p>
            <Link
              href="/login"
              className="block mt-6 py-3 rounded-xl btn-primary font-medium"
            >
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-pink-50 to-white">
      <div className="w-full max-w-sm">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">비밀번호 찾기</h1>
          <p className="text-gray-400 text-sm mt-2">
            가입한 이메일로 재설정 링크를 보내드려요
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="card rounded-2xl p-6 space-y-4">
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

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl btn-primary font-medium disabled:opacity-50"
          >
            {isLoading ? '전송 중...' : '재설정 링크 보내기'}
          </button>
        </form>

        {/* 로그인 링크 */}
        <p className="text-center text-gray-400 text-sm mt-6">
          <Link href="/login" className="text-pink-500 font-medium">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
