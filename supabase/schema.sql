-- ============================================
-- 빼빼 데이터베이스 스키마
-- 모든 테이블 초기화 후 재생성
-- ============================================

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 기존 함수 삭제
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 기존 테이블 삭제 (의존성 순서대로)
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS diet_records CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- 테이블 생성
-- ============================================

-- 프로필 테이블
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 식단 기록 테이블
CREATE TABLE diet_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meals JSONB NOT NULL DEFAULT '{}',
  weight DECIMAL(5,2), -- 체중 (kg)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 친구 관계 테이블
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- ============================================
-- 회원가입 트리거 (프로필 자동 생성)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- RLS (Row Level Security) 활성화
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Profiles 정책
-- ============================================

CREATE POLICY "프로필 조회는 누구나" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "본인 프로필만 수정" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- Diet Records 정책
-- ============================================

CREATE POLICY "본인 식단 조회" ON diet_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "친구 식단 조회" ON diet_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friendships
      WHERE friendships.user_id = auth.uid()
      AND friendships.friend_id = diet_records.user_id
      AND friendships.status = 'accepted'
    )
  );

CREATE POLICY "본인 식단만 추가" ON diet_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "본인 식단만 수정" ON diet_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "본인 식단만 삭제" ON diet_records
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Friendships 정책
-- ============================================

CREATE POLICY "본인 친구 관계 조회" ON friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "친구 요청 보내기" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "받은 요청 수락/거절" ON friendships
  FOR UPDATE USING (auth.uid() = friend_id);

CREATE POLICY "본인 친구 관계 삭제" ON friendships
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- ============================================
-- 인덱스
-- ============================================

CREATE INDEX idx_diet_records_user_date ON diet_records(user_id, date);
CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_friendships_friend ON friendships(friend_id);
CREATE INDEX idx_profiles_username ON profiles(username);
