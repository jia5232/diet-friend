'use client';

import { useState } from 'react';
import { useDiet } from '@/contexts/DietContext';

export default function SettingsPage() {
  const {
    settings,
    updateTargetCalories,
    addQuickExercise,
    removeQuickExercise,
    isLoaded,
  } = useDiet();

  const [caloriesInput, setCaloriesInput] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseEmoji, setNewExerciseEmoji] = useState('💪');

  const emojiOptions = ['💪', '🏃', '🚴', '🏋️', '🧘', '🤸', '⚡', '🔥', '🦵', '💥'];

  const handleUpdateCalories = () => {
    const calories = parseInt(caloriesInput);
    if (calories > 0 && calories <= 10000) {
      updateTargetCalories(calories);
      setCaloriesInput('');
    }
  };

  const handleAddExercise = () => {
    if (newExerciseName.trim()) {
      addQuickExercise({
        name: newExerciseName.trim(),
        emoji: newExerciseEmoji,
      });
      setNewExerciseName('');
      setNewExerciseEmoji('💪');
      setShowAddModal(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="text-5xl">⚙️</span>
          <p className="text-pink-500 mt-4 font-medium">로딩중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5">
      {/* 헤더 */}
      <div className="text-center pt-2">
        <h1 className="text-2xl font-bold text-gray-800">설정</h1>
        <p className="text-gray-400 text-sm mt-1">나만의 목표를 설정해요</p>
      </div>

      {/* 목표 칼로리 설정 */}
      <div className="card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🎯</span>
          <h2 className="text-lg font-bold text-gray-800">목표 칼로리</h2>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600 text-sm">현재 목표</span>
          <span className="text-2xl font-bold text-pink-500">
            {settings.targetCalories.toLocaleString()} kcal
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            value={caloriesInput}
            onChange={(e) => setCaloriesInput(e.target.value)}
            placeholder="새 목표 (예: 1800)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
          <button
            onClick={handleUpdateCalories}
            disabled={!caloriesInput}
            className="px-5 py-2.5 rounded-xl btn-primary text-sm font-medium disabled:opacity-50"
          >
            변경
          </button>
        </div>

        {/* 추천 칼로리 버튼 */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[1200, 1500, 1800, 2000, 2500].map((cal) => (
            <button
              key={cal}
              onClick={() => updateTargetCalories(cal)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                settings.targetCalories === cal
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cal.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* 퀵 운동 버튼 관리 */}
      <div className="card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h2 className="text-lg font-bold text-gray-800">퀵 운동 버튼</h2>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 text-sm btn-secondary rounded-full"
          >
            + 추가
          </button>
        </div>

        {settings.quickExercises.length === 0 ? (
          <p className="text-gray-400 text-center py-4 text-sm">
            아직 등록된 운동이 없어요
          </p>
        ) : (
          <div className="space-y-2">
            {settings.quickExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{exercise.emoji}</span>
                  <span className="font-medium text-gray-700 text-sm">{exercise.name}</span>
                </div>
                <button
                  onClick={() => removeQuickExercise(exercise.id)}
                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-50 transition-colors text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 앱 정보 */}
      <div className="card-pink rounded-2xl p-5 text-center">
        <span className="text-4xl">💖</span>
        <p className="text-gray-800 font-bold text-lg mt-2">빼빼</p>
        <p className="text-gray-400 text-xs mt-1">v1.0.0</p>
      </div>

      {/* 운동 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              퀵 운동 추가
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-1.5">
                  운동 이름
                </label>
                <input
                  type="text"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder="예: 스쿼트 30개"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm font-medium mb-1.5">
                  이모지 선택
                </label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewExerciseEmoji(emoji)}
                      className={`w-10 h-10 rounded-xl text-xl transition-all ${
                        newExerciseEmoji === emoji
                          ? 'bg-pink-500 scale-105'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl btn-secondary text-sm font-medium"
              >
                취소
              </button>
              <button
                onClick={handleAddExercise}
                disabled={!newExerciseName.trim()}
                className="flex-1 py-2.5 rounded-xl btn-primary text-sm font-medium disabled:opacity-50"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
