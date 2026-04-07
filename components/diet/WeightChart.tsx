'use client';

import { useRef, useState } from 'react';
import { useDiet } from '@/contexts/DietContext';

type ViewType = 'week' | 'month';

export default function WeightChart() {
  const { getWeightHistory } = useDiet();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewType, setViewType] = useState<ViewType>('week');
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const days = viewType === 'week' ? 14 : 60;
  const weightData = getWeightHistory(days);

  // 드래그 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const x = e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  if (weightData.length === 0) {
    return (
      <div className="card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h3 className="font-bold text-gray-800">체중 변화</h3>
          </div>
        </div>
        <div className="text-center py-8 text-gray-400 text-sm">
          아직 기록된 체중이 없어요
        </div>
      </div>
    );
  }

  const minWeight = Math.min(...weightData.map((d) => d.weight)) - 1;
  const maxWeight = Math.max(...weightData.map((d) => d.weight)) + 1;
  const weightRange = maxWeight - minWeight;

  const chartHeight = 120;
  const barWidth = viewType === 'week' ? 40 : 25;

  // 최근 체중 변화
  const latestWeight = weightData[weightData.length - 1]?.weight;
  const previousWeight = weightData[weightData.length - 2]?.weight;
  const weightChange = latestWeight && previousWeight ? latestWeight - previousWeight : 0;

  return (
    <div className="card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <h3 className="font-bold text-gray-800">체중 변화</h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setViewType('week')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              viewType === 'week'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            2주
          </button>
          <button
            onClick={() => setViewType('month')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              viewType === 'month'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            2달
          </button>
        </div>
      </div>

      {/* 현재 체중 & 변화 */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-pink-500">{latestWeight?.toFixed(1)} kg</p>
          <p className="text-xs text-gray-400">최근 체중</p>
        </div>
        {weightChange !== 0 && (
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              weightChange < 0
                ? 'bg-green-100 text-green-600'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {weightChange > 0 ? '+' : ''}
            {weightChange.toFixed(1)} kg
          </div>
        )}
      </div>

      {/* 차트 영역 */}
      <div
        ref={scrollRef}
        className="overflow-x-auto cursor-grab active:cursor-grabbing scrollbar-hide"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div
          className="flex items-end gap-1 pb-6 pt-2"
          style={{ minWidth: weightData.length * (barWidth + 4) }}
        >
          {weightData.map((data, index) => {
            const height =
              ((data.weight - minWeight) / weightRange) * chartHeight;
            const date = new Date(data.date);
            const dayLabel = `${date.getMonth() + 1}/${date.getDate()}`;

            return (
              <div
                key={data.date}
                className="flex flex-col items-center"
                style={{ width: barWidth }}
              >
                <span className="text-xs text-gray-600 mb-1">
                  {data.weight.toFixed(1)}
                </span>
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    index === weightData.length - 1
                      ? 'bg-pink-500'
                      : 'bg-pink-200'
                  }`}
                  style={{ height: Math.max(height, 10) }}
                />
                <span className="text-xs text-gray-400 mt-1">{dayLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-2">
        좌우로 드래그해서 더 보기
      </p>
    </div>
  );
}
