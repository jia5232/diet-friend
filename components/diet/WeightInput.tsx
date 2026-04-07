'use client';

import { useState, useEffect } from 'react';
import { useDiet } from '@/contexts/DietContext';

interface WeightInputProps {
  date: string;
}

export default function WeightInput({ date }: WeightInputProps) {
  const { getDailyDiet, updateWeight } = useDiet();
  const [weight, setWeight] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const dailyDiet = getDailyDiet(date);
  const currentWeight = dailyDiet.weight;

  useEffect(() => {
    setWeight(currentWeight?.toString() || '');
    setIsEditing(false);
  }, [date, currentWeight]);

  const handleSave = async () => {
    const weightNum = parseFloat(weight);
    if (weight && !isNaN(weightNum) && weightNum > 0 && weightNum < 500) {
      await updateWeight(date, weightNum);
      setIsEditing(false);
    } else if (!weight) {
      await updateWeight(date, undefined);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="card rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚖️</span>
          <span className="font-medium text-gray-800">오늘 체중</span>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="00.0"
              step="0.1"
              className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-right"
              autoFocus
            />
            <span className="text-gray-500 text-sm">kg</span>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-lg bg-pink-500 text-white text-sm font-medium"
            >
              저장
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 transition-colors"
          >
            {currentWeight ? (
              <>
                <span className="text-pink-500 font-bold">{currentWeight.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">kg</span>
              </>
            ) : (
              <span className="text-gray-400 text-sm">기록하기</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
