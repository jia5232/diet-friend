'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient, Profile } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  checkUsername: (username: string) => Promise<boolean>;
  checkEmail: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  // 프로필 가져오기
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  // 세션 초기화
  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      }

      setIsLoading(false);
    };

    initSession();

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // 아이디 중복 체크
  const checkUsername = async (username: string): Promise<boolean> => {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    return !data; // data가 없으면 사용 가능
  };

  // 이메일 중복 체크
  const checkEmail = async (email: string): Promise<boolean> => {
    const { data } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    return !data; // data가 없으면 사용 가능
  };

  // 회원가입
  const signUp = async (email: string, password: string, username: string) => {
    // 이메일 중복 체크
    const isEmailAvailable = await checkEmail(email);
    if (!isEmailAvailable) {
      return { error: '이미 가입된 이메일입니다.' };
    }

    // 아이디 중복 체크
    const isUsernameAvailable = await checkUsername(username);
    if (!isUsernameAvailable) {
      return { error: '이미 사용 중인 아이디입니다.' };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username, // 트리거에서 사용할 username
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { error: '이미 가입된 이메일입니다.' };
      }
      return { error: error.message };
    }

    return { error: null };
  };

  // 로그인
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
      }
      return { error: error.message };
    }

    return { error: null };
  };

  // 로그아웃
  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  // 비밀번호 재설정
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        checkUsername,
        checkEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
