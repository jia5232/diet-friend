'use client';

import { useState } from 'react';
import { MealType, MealRecord, MEAL_NAMES, MEAL_EMOJIS } from '@/types';
import { useDiet } from '@/contexts/DietContext';

interface MealCardProps {
  mealType: MealType;
  date: string;
}

export default function MealCard({ mealType, date }: MealCardProps) {
  const { getDailyDiet, updateMeal } = useDiet();
  const [showModal, setShowModal] = useState(false);
  const [menu, setMenu] = useState('');
  const [calories, setCalories] = useState('');

  const dailyDiet = getDailyDiet(date);
  const meal = dailyDiet.meals[mealType];

  const handleFasting = () => {
    updateMeal(date, mealType, { status: 'fasting' });
  };

  const handleEaten = () => {
    setShowModal(true);
  };

  const handleSaveMeal = () => {
    updateMeal(date, mealType, {
      status: 'eaten',
      menu: menu || '기록함',
      calories: parseInt(calories) || 0,
    });
    setShowModal(false);
    setMenu('');
    setCalories('');
  };

  const handleReset = () => {
    updateMeal(date, mealType, { status: 'empty' });
  };

  const getStatusStyle = () => {
    switch (meal.status) {
      case 'fasting':
        return 'bg-gray-50 border-gray-200';
      case 'eaten':
        return 'bg-pink-50 border-pink-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

  return (
    <>
      <div
        className={`rounded-2xl p-4 border transition-all hover:shadow-md ${getStatusStyle()}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{MEAL_EMOJIS[mealType]}</span>
            <span className="font-bold text-gray-700">{MEAL_NAMES[mealType]}</span>
          </div>
          {meal.status !== 'empty' && (
            <button
              onClick={handleReset}
              className="text-xs text-gray-400 hover:text-pink-500 transition-colors"
            >
              초기화
            </button>
          )}
        </div>

        {meal.status === 'empty' ? (
          <div className="flex gap-2">
            <button
              onClick={handleFasting}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-all active:scale-95"
            >
              단식
            </button>
            <button
              onClick={handleEaten}
              className="flex-1 py-2.5 rounded-xl btn-primary text-sm font-medium active:scale-95"
            >
              먹었어
            </button>
          </div>
        ) : meal.status === 'fasting' ? (
          <div className="text-center py-2">
            <p className="text-gray-500 font-medium text-sm">단식 완료</p>
          </div>
        ) : (
          <div className="text-center py-1">
            <p className="text-gray-700 font-medium text-sm">{meal.menu}</p>
            {meal.calories && meal.calories > 0 && (
              <p className="text-pink-500 text-xs font-bold mt-1">{meal.calories} kcal</p>
            )}
          </div>
        )}
      </div>

      {/* 입력 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl animate-slideUp">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              {MEAL_EMOJIS[mealType]} {MEAL_NAMES[mealType]} 기록
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-1.5">
                  메뉴
                </label>
                <input
                  type="text"
                  value={menu}
                  onChange={(e) => setMenu(e.target.value)}
                  placeholder="예: 샐러드, 닭가슴살"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm font-medium mb-1.5">
                  칼로리 (선택)
                </label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="예: 350"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl btn-secondary text-sm font-medium"
              >
                취소
              </button>
              <button
                onClick={handleSaveMeal}
                className="flex-1 py-2.5 rounded-xl btn-primary text-sm font-medium"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
