import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// 타입 정의
export interface Profile {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface DietRecord {
  id: string;
  user_id: string;
  date: string;
  meals: {
    breakfast: { status: string; menu?: string; calories?: number };
    lunch: { status: string; menu?: string; calories?: number };
    dinner: { status: string; menu?: string; calories?: number };
    snack: { status: string; menu?: string; calories?: number };
  };
  created_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}
