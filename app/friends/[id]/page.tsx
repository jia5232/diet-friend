'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase';
import { DailyDiet, MealType, getDateStringKST } from '@/types';

const mealTypeLabels: Record<MealType, string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  snack: '간식',
};

export default function FriendDietPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const friendName = searchParams.get('name') || '친구';
  const { user, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  const [dietRecords, setDietRecords] = useState<DailyDiet[]>([]);
  const [selectedDate, setSelectedDate] = useState(getDateStringKST(new Date()));
  const [isLoading, setIsLoading] = useState(true);

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 친구 식단 로드
  useEffect(() => {
    const loadFriendDiet = async () => {
      if (!user || !resolvedParams.id) return;

      // 친구 관계 확인
      const { data: friendship } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', user.id)
        .eq('friend_id', resolvedParams.id)
        .eq('status', 'accepted')
        .single();

      if (!friendship) {
        alert('친구가 아니거나 접근 권한이 없습니다.');
        router.push('/friends');
        return;
      }

      // 친구 식단 가져오기
      const { data, error } = await supabase
        .from('diet_records')
        .select('*')
        .eq('user_id', resolvedParams.id);

      if (!error && data) {
        const records: DailyDiet[] = data.map((record) => ({
          date: record.date,
          meals: record.meals,
        }));
        setDietRecords(records);
      }

      setIsLoading(false);
    };

    loadFriendDiet();
  }, [user, resolvedParams.id]);

  // 선택한 날짜의 식단
  const selectedDiet = dietRecords.find((d) => d.date === selectedDate);

  // 날짜 네비게이션
  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(getDateStringKST(date));
  };

  // 총 칼로리 계산
  const getTotalCalories = () => {
    if (!selectedDiet) return 0;
    return Object.values(selectedDiet.meals).reduce((sum, meal) => {
      return sum + (meal.calories || 0);
    }, 0);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="animate-pulse text-pink-400">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-4">
      {/* 헤더 */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push('/friends')}
          className="p-2 rounded-xl hover:bg-gray-100"
        >
          <span className="text-xl">←</span>
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold text-gray-800">{friendName}의 식단</h1>
        </div>
        <div className="w-10" />
      </div>

      {/* 날짜 선택 */}
      <div className="card rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100"
          >
            <span className="text-lg">◀</span>
          </button>
          <div className="text-center">
            <p className="font-bold text-gray-800">{selectedDate}</p>
          </div>
          <button
            onClick={() => changeDate(1)}
            className="p-2 rounded-xl hover:bg-gray-100"
          >
            <span className="text-lg">▶</span>
          </button>
        </div>
      </div>

      {/* 총 칼로리 */}
      <div className="card rounded-2xl p-4 mb-4 text-center">
        <p className="text-gray-500 text-sm">총 섭취 칼로리</p>
        <p className="text-2xl font-bold text-pink-500 mt-1">
          {getTotalCalories()} kcal
        </p>
      </div>

      {/* 끼니별 기록 */}
      <div className="space-y-3">
        {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((mealType) => {
          const meal = selectedDiet?.meals[mealType];
          const isEmpty = !meal || meal.status === 'empty';
          const isFasted = meal?.status === 'fasted';

          return (
            <div key={mealType} className="card rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-800">
                  {mealTypeLabels[mealType]}
                </p>
                {isEmpty ? (
                  <span className="text-gray-300 text-sm">기록 없음</span>
                ) : isFasted ? (
                  <span className="text-gray-400 text-sm">단식</span>
                ) : (
                  <span className="text-pink-500 font-medium">
                    {meal?.calories || 0} kcal
                  </span>
                )}
              </div>
              {!isEmpty && !isFasted && meal?.menu && (
                <p className="text-gray-500 text-sm mt-2">{meal.menu}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* 기록 없는 날 */}
      {!selectedDiet && (
        <div className="card rounded-2xl p-8 text-center mt-4">
          <p className="text-gray-400">이 날은 기록이 없어요</p>
        </div>
      )}
    </div>
  );
}
