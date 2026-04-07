'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

type Step = 'email' | 'username' | 'password' | 'complete';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, checkUsername, checkEmail } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 이메일 유효성 검사
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // 아이디 유효성 검사 (영문, 숫자, _ 만 허용, 4-20자)
  const isValidUsername = (username: string) => {
    return /^[a-zA-Z0-9_]{4,20}$/.test(username);
  };

  // 비밀번호 유효성 검사 (8자 이상)
  const isValidPassword = (password: string) => {
    return password.length >= 8;
  };

  // 이메일 단계 처리
  const handleEmailNext = async () => {
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setIsLoading(true);
    const isAvailable = await checkEmail(email);
    setIsLoading(false);

    if (!isAvailable) {
      setError('이미 가입된 이메일입니다.');
      return;
    }

    setError('');
    setStep('username');
  };

  // 아이디 단계 처리
  const handleUsernameNext = async () => {
    if (!username) {
      setError('아이디를 입력해주세요.');
      return;
    }
    if (!isValidUsername(username)) {
      setError('아이디는 영문, 숫자, _만 사용 가능하며 4-20자여야 합니다.');
      return;
    }

    setIsLoading(true);
    const isAvailable = await checkUsername(username);
    setIsLoading(false);

    if (!isAvailable) {
      setError('이미 사용 중인 아이디입니다.');
      return;
    }

    setError('');
    setStep('password');
  };

  // 회원가입 처리
  const handleSignUp = async () => {
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    if (!isValidPassword(password)) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, username);
    setIsLoading(false);

    if (error) {
      setError(error);
      return;
    }

    // 회원가입 성공 - 이메일 확인 안내
    setStep('complete');
  };

  // 뒤로가기
  const handleBack = () => {
    setError('');
    if (step === 'username') setStep('email');
    if (step === 'password') setStep('username');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-pink-50 to-white">
      <div className="w-full max-w-sm">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">회원가입</h1>
          <p className="text-gray-400 text-sm mt-2">
            {step === 'email' && '이메일을 입력해주세요'}
            {step === 'username' && '아이디를 만들어주세요'}
            {step === 'password' && '비밀번호를 설정해주세요'}
            {step === 'complete' && '거의 다 됐어요!'}
          </p>
        </div>

        {/* 진행 표시 */}
        {step !== 'complete' && (
          <div className="flex justify-center gap-2 mb-8">
            {['email', 'username', 'password'].map((s, i) => (
              <div
                key={s}
                className={`w-16 h-1 rounded-full transition-colors ${
                  ['email', 'username', 'password'].indexOf(step) >= i
                    ? 'bg-pink-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}

        {/* 폼 */}
        <div className="card rounded-2xl p-6">
          {/* 이메일 단계 */}
          {step === 'email' && (
            <div className="space-y-4">
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
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailNext()}
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                onClick={handleEmailNext}
                disabled={isLoading}
                className="w-full py-3 rounded-xl btn-primary font-medium disabled:opacity-50"
              >
                {isLoading ? '확인 중...' : '다음'}
              </button>
            </div>
          )}

          {/* 아이디 단계 */}
          {step === 'username' && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-1.5">
                  아이디
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="영문, 숫자, _ (4-20자)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleUsernameNext()}
                />
                <p className="text-gray-400 text-xs mt-1">
                  친구가 이 아이디로 검색할 수 있어요
                </p>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-2">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 rounded-xl btn-secondary font-medium"
                >
                  이전
                </button>
                <button
                  onClick={handleUsernameNext}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl btn-primary font-medium disabled:opacity-50"
                >
                  {isLoading ? '확인 중...' : '다음'}
                </button>
              </div>
            </div>
          )}

          {/* 비밀번호 단계 */}
          {step === 'password' && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-1.5">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8자 이상"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm font-medium mb-1.5">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호 재입력"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-2">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 rounded-xl btn-secondary font-medium"
                >
                  이전
                </button>
                <button
                  onClick={handleSignUp}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl btn-primary font-medium disabled:opacity-50"
                >
                  {isLoading ? '가입 중...' : '가입하기'}
                </button>
              </div>
            </div>
          )}

          {/* 완료 단계 - 이메일 확인 안내 */}
          {step === 'complete' && (
            <div className="text-center space-y-4">
              <div className="text-5xl">📧</div>
              <h2 className="text-xl font-bold text-gray-800">
                이메일을 확인해주세요!
              </h2>
              <p className="text-gray-500 text-sm">
                <span className="font-medium text-pink-500">{email}</span>로
                <br />
                인증 메일을 보냈어요.
              </p>
              <div className="bg-pink-50 rounded-xl p-4 text-left">
                <p className="text-gray-600 text-sm">
                  1. 이메일함을 확인해주세요
                  <br />
                  2. <span className="font-medium">빼빼</span>에서 온 메일을 찾아요
                  <br />
                  3. 인증 링크를 클릭하면 완료!
                </p>
              </div>
              <p className="text-gray-400 text-xs">
                메일이 안 보이면 스팸함도 확인해주세요
              </p>
              <Link
                href="/login"
                className="block py-3 rounded-xl btn-primary font-medium"
              >
                로그인하러 가기
              </Link>
            </div>
          )}
        </div>

        {/* 로그인 링크 */}
        {step !== 'complete' && (
          <p className="text-center text-gray-400 text-sm mt-6">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-pink-500 font-medium">
              로그인
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
