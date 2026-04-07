'use client';

import { useDiet } from '@/contexts/DietContext';

interface DailySummaryProps {
  date: string;
}

export default function DailySummary({ date }: DailySummaryProps) {
  const { getTotalCalories, settings } = useDiet();

  const totalCalories = getTotalCalories(date);
  const targetCalories = settings.targetCalories;
  const percentage = Math.min((totalCalories / targetCalories) * 100, 100);
  const remaining = targetCalories - totalCalories;

  const getMessage = () => {
    if (totalCalories === 0) return { text: '오늘 기록을 시작해보세요!', emoji: '📝' };
    if (remaining > 500) return { text: '여유있게 잘 조절하고 있어요!', emoji: '👍' };
    if (remaining > 0) return { text: '목표에 거의 다 왔어요!', emoji: '🎯' };
    if (remaining >= -200) return { text: '목표 달성! 잘했어요!', emoji: '🎉' };
    return { text: '조금 넘었지만 괜찮아요!', emoji: '💪' };
  };

  const message = getMessage();

  return (
    <div className="card-pink rounded-2xl p-5 animate-slideUp">
      <div className="text-center mb-4">
        <span className="text-2xl">{message.emoji}</span>
        <p className="text-gray-700 font-medium mt-1">{message.text}</p>
      </div>

      <div className="flex justify-between items-end mb-3">
        <div>
          <p className="text-xs text-gray-400">섭취 칼로리</p>
          <p className="text-2xl font-bold text-pink-500">
            {totalCalories.toLocaleString()}
            <span className="text-sm font-normal text-gray-400 ml-1">kcal</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">목표</p>
          <p className="text-lg font-semibold text-gray-500">
            {targetCalories.toLocaleString()} kcal
          </p>
        </div>
      </div>

      {/* 프로그레스 바 */}
      <div className="relative h-3 bg-white rounded-full overflow-hidden border border-pink-100">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
            remaining >= 0 ? 'bg-pink-400' : 'bg-orange-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-center text-sm mt-3 font-medium">
        {remaining > 0 ? (
          <span className="text-pink-500">{remaining.toLocaleString()} kcal 남았어요</span>
        ) : remaining === 0 ? (
          <span className="text-green-500">딱 맞게 달성!</span>
        ) : (
          <span className="text-orange-500">{Math.abs(remaining).toLocaleString()} kcal 초과</span>
        )}
      </p>
    </div>
  );
}
