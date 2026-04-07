'use client';

import { useDiet } from '@/contexts/DietContext';
import CalendarView from '@/components/diet/CalendarView';
import MealCard from '@/components/diet/MealCard';
import MealGauge from '@/components/diet/MealGauge';
import DailySummary from '@/components/diet/DailySummary';
import WeightInput from '@/components/diet/WeightInput';
import { MealType } from '@/types';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function DietPage() {
  const { selectedDate, setSelectedDate, getCompletedMealsCount, isLoaded } = useDiet();

  const completedMeals = getCompletedMealsCount(selectedDate);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="text-5xl">🍽️</span>
          <p className="text-pink-500 mt-4 font-medium">로딩중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5">
      {/* 헤더 */}
      <div className="text-center pt-2">
        <h1 className="text-2xl font-bold text-gray-800">식단 기록</h1>
        <p className="text-gray-400 text-sm mt-1">매일매일 기록해요</p>
      </div>

      {/* 캘린더 */}
      <CalendarView selectedDate={selectedDate} onDateSelect={setSelectedDate} />

      {/* 선택된 날짜 */}
      <div className="text-center">
        <span className="inline-block px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-medium">
          {formatDate(selectedDate)}
        </span>
      </div>

      {/* 체중 ���력 */}
      <WeightInput date={selectedDate} />

      {/* 게이�� */}
      <MealGauge completed={completedMeals} />

      {/* 끼니 카드들 */}
      <div className="grid grid-cols-2 gap-3">
        {MEAL_TYPES.map((mealType) => (
          <MealCard key={mealType} mealType={mealType} date={selectedDate} />
        ))}
      </div>

      {/* 하루 요약 */}
      <DailySummary date={selectedDate} />
    </div>
  );
}
