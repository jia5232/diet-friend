'use client';

import { useDiet } from '@/contexts/DietContext';

interface QuickButtonsProps {
  onSelect: (text: string) => void;
}

export default function QuickButtons({ onSelect }: QuickButtonsProps) {
  const { settings } = useDiet();

  if (settings.quickExercises.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {settings.quickExercises.map((exercise) => (
        <button
          key={exercise.id}
          onClick={() => onSelect(`${exercise.name} 할거야`)}
          className="choice-btn px-4 py-2 rounded-full text-sm font-medium"
        >
          {exercise.emoji} {exercise.name}
        </button>
      ))}
    </div>
  );
}
