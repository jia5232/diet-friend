'use client';

import { useDiet } from '@/contexts/DietContext';
import { getTodayString } from '@/types';
import Link from 'next/link';

export default function Home() {
  const { getTotalCalories, getCompletedMealsCount, settings, isLoaded } = useDiet();

  const today = getTodayString();
  const totalCalories = getTotalCalories(today);
  const completedMeals = getCompletedMealsCount(today);
  const targetCalories = settings.targetCalories;
  const remaining = targetCalories - totalCalories;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="text-5xl">🐰</span>
          <p className="text-pink-500 mt-4 font-medium">로딩중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-6 space-y-5">
      {/* 오늘의 요약 카드 */}
      <div className="card rounded-2xl p-5">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-400">
            {new Date().toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
          <h2 className="text-lg font-bold text-gray-800 mt-1">오늘의 기록</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* 식단 현황 */}
          <div className="bg-pink-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🍽️</span>
              <span className="text-gray-700 font-medium text-sm">식단</span>
            </div>
            <p className="text-2xl font-bold text-pink-500">{completedMeals}/4</p>
            <p className="text-xs text-gray-400 mt-1">끼니 완료</p>
          </div>

          {/* 칼로리 현황 */}
          <div className="bg-pink-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🔥</span>
              <span className="text-gray-700 font-medium text-sm">칼로리</span>
            </div>
            <p className="text-2xl font-bold text-pink-500">
              {totalCalories.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {remaining > 0 ? `${remaining.toLocaleString()} 남음` : '목표 달성!'}
            </p>
          </div>
        </div>

        {/* 프로그레스 */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>섭취량</span>
            <span>목표 {targetCalories.toLocaleString()} kcal</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((totalCalories / targetCalories) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 퀵 액션 버튼 */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/diet"
          className="bg-pink-100 border border-pink-200 rounded-2xl p-5 hover:bg-pink-150 transition-colors active:scale-95"
        >
          <span className="text-3xl mb-2 block">📝</span>
          <p className="font-bold text-pink-600">식단 기록</p>
          <p className="text-xs text-pink-400 mt-1">오늘 뭐 먹었어요?</p>
        </Link>

        <Link
          href="/exercise"
          className="bg-purple-100 border border-purple-200 rounded-2xl p-5 hover:bg-purple-150 transition-colors active:scale-95"
        >
          <span className="text-3xl mb-2 block">💪</span>
          <p className="font-bold text-purple-600">운동하기</p>
          <p className="text-xs text-purple-400 mt-1">코치와 함께!</p>
        </Link>
      </div>

      {/* 격려 메시지 */}
      <div className="card-pink rounded-2xl p-4 text-center">
        <span className="text-2xl">🐰</span>
        <p className="text-gray-700 font-medium mt-2 text-sm">
          {completedMeals === 0
            ? '오늘의 첫 기록을 시작해볼까요?'
            : completedMeals < 4
            ? '잘하고 있어요! 계속 기록해봐요!'
            : '오늘 식단 기록 완료! 완벽해요!'}
        </p>
      </div>

      {/* 팁 카드 */}
      <div className="card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">💡</span>
          <span className="text-gray-700 font-medium text-sm">오늘의 팁</span>
        </div>
        <p className="text-gray-500 text-sm">
          물을 충분히 마시면 포만감도 느끼고, 신진대사도 활발해져요! 하루 8잔 목표로 해봐요~
        </p>
      </div>
    </div>
  );
}
