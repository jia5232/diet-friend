'use client';

interface MealGaugeProps {
  completed: number;
  total?: number;
}

const GAUGE_MESSAGES = [
  { message: '시작해볼까요?', emoji: '✨' },
  { message: '좋아요! 시작이 반!', emoji: '👍' },
  { message: '잘하고 있어요!', emoji: '💪' },
  { message: '거의 다 왔어요!', emoji: '🎯' },
  { message: '완벽해요!', emoji: '🎉' },
];

export default function MealGauge({ completed, total = 4 }: MealGaugeProps) {
  const percentage = (completed / total) * 100;
  const gaugeInfo = GAUGE_MESSAGES[completed] || GAUGE_MESSAGES[GAUGE_MESSAGES.length - 1];

  return (
    <div className="card rounded-2xl p-5 animate-slideUp">
      <div className="text-center mb-4">
        <span className="text-3xl">{gaugeInfo.emoji}</span>
        <p className="text-gray-700 font-semibold mt-2">{gaugeInfo.message}</p>
      </div>

      {/* 게이지 바 */}
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className="absolute left-0 top-0 h-full bg-pink-400 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* 칸 표시 */}
      <div className="flex justify-between gap-2">
        {Array.from({ length: total }).map((_, index) => (
          <div
            key={index}
            className={`flex-1 h-2.5 rounded-full transition-all duration-300 ${
              index < completed
                ? 'bg-pink-400'
                : 'bg-gray-100'
            }`}
          />
        ))}
      </div>

      <p className="text-center text-pink-500 text-sm mt-3 font-medium">
        {completed} / {total} 완료
      </p>
    </div>
  );
}
