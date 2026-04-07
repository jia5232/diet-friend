'use client';

import { useState } from 'react';
import { CalendarViewType, getDateStringKST, getKSTDate } from '@/types';
import { useDiet } from '@/contexts/DietContext';

interface CalendarViewProps {
  onDateSelect: (date: string) => void;
  selectedDate: string;
}

export default function CalendarView({ onDateSelect, selectedDate }: CalendarViewProps) {
  const [viewType, setViewType] = useState<CalendarViewType>('week');
  const { getCompletedMealsCount, getTotalCalories } = useDiet();

  const today = getKSTDate();
  const todayString = getDateStringKST(today);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getWeekDates = (): Date[] => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const selected = new Date(year, month - 1, day);
    const dayOfWeek = selected.getDay();
    const startOfWeek = new Date(selected);
    startOfWeek.setDate(selected.getDate() - dayOfWeek);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const getMonthDates = (): (Date | null)[][] => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    for (let i = 0; i < startPadding; i++) {
      currentWeek.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
      currentWeek.push(new Date(currentYear, currentMonth, day));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const getCalorieColor = (calories: number): string => {
    if (calories === 0) return 'text-gray-400';
    if (calories < 800) return 'text-green-600';
    if (calories < 1200) return 'text-blue-600';
    if (calories < 1600) return 'text-purple-600';
    if (calories < 2000) return 'text-pink-600';
    return 'text-red-500';
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  return (
    <div className="card rounded-2xl p-4 animate-slideUp">
      {/* 뷰 타입 선택 */}
      <div className="flex justify-center gap-2 mb-4">
        {(['month', 'week'] as CalendarViewType[]).map((type) => (
          <button
            key={type}
            onClick={() => setViewType(type)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              viewType === type
                ? 'btn-primary'
                : 'btn-secondary'
            }`}
          >
            {type === 'month' ? '월별' : '주간'}
          </button>
        ))}
      </div>

      {viewType === 'month' && (
        <>
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11);
                  setCurrentYear(currentYear - 1);
                } else {
                  setCurrentMonth(currentMonth - 1);
                }
              }}
              className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center hover:bg-pink-100 transition-colors text-pink-500"
            >
              ‹
            </button>
            <span className="font-bold text-gray-700 text-lg">
              {currentYear}년 {monthNames[currentMonth]}
            </span>
            <button
              onClick={() => {
                if (currentMonth === 11) {
                  setCurrentMonth(0);
                  setCurrentYear(currentYear + 1);
                } else {
                  setCurrentMonth(currentMonth + 1);
                }
              }}
              className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center hover:bg-pink-100 transition-colors text-pink-500"
            >
              ›
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, i) => (
              <div
                key={day}
                className={`text-center text-xs font-semibold py-1 ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="space-y-1">
            {getMonthDates().map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-cols-7 gap-1">
                {week.map((date, dayIdx) => {
                  if (!date) {
                    return <div key={dayIdx} className="w-full aspect-square" />;
                  }

                  const dateStr = formatDateString(date);
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === todayString;
                  const calories = getTotalCalories(dateStr);

                  return (
                    <button
                      key={dayIdx}
                      onClick={() => onDateSelect(dateStr)}
                      className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-pink-500 text-white shadow-md'
                          : isToday
                          ? 'bg-pink-50 border-2 border-pink-300'
                          : calories > 0
                          ? 'bg-gray-50 hover:bg-pink-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className={`text-sm font-medium ${
                          isSelected
                            ? 'text-white'
                            : isToday
                            ? 'text-pink-600'
                            : dayIdx === 0
                            ? 'text-red-400'
                            : dayIdx === 6
                            ? 'text-blue-400'
                            : 'text-gray-700'
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      {calories > 0 && (
                        <span
                          className={`text-[9px] font-bold ${
                            isSelected ? 'text-white/90' : getCalorieColor(calories)
                          }`}
                        >
                          {calories}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}

      {viewType === 'week' && (
        <div className="flex justify-around">
          {getWeekDates().map((date, idx) => {
            const dateStr = formatDateString(date);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayString;
            const completed = getCompletedMealsCount(dateStr);
            const calories = getTotalCalories(dateStr);

            return (
              <button
                key={idx}
                onClick={() => onDateSelect(dateStr)}
                className="flex flex-col items-center gap-1"
              >
                <span
                  className={`text-xs font-medium ${
                    idx === 0 ? 'text-red-400' : idx === 6 ? 'text-blue-400' : 'text-gray-400'
                  }`}
                >
                  {weekDays[idx]}
                </span>
                <div
                  className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-pink-500 text-white shadow-md'
                      : isToday
                      ? 'bg-pink-50 border-2 border-pink-300'
                      : 'bg-white border border-gray-100 hover:border-pink-200'
                  }`}
                >
                  <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                    {date.getDate()}
                  </span>
                  {calories > 0 && (
                    <span className={`text-[8px] font-medium ${isSelected ? 'text-white/80' : 'text-pink-500'}`}>
                      {calories}
                    </span>
                  )}
                </div>
                {completed > 0 && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.min(completed, 4) }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
