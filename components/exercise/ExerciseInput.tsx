'use client';

import { useState, FormEvent } from 'react';

interface ExerciseInputProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

export default function ExerciseInput({ onSubmit, disabled }: ExerciseInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="직접 입력�� 수도 있어요"
        disabled={disabled}
        className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 text-sm disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="px-5 py-2.5 rounded-full btn-primary text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {disabled ? '...' : '전송'}
      </button>
    </form>
  );
}
