'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  DailyDiet,
  ExerciseRecord,
  ChatMessage,
  Settings,
  MealType,
  MealRecord,
  DEFAULT_SETTINGS,
  createEmptyDailyDiet,
  getTodayString,
  QuickExercise,
} from '@/types';
import {
  loadExerciseRecords,
  saveExerciseRecords,
  loadChatMessages,
  saveChatMessages,
  loadSettings,
  saveSettings,
} from '@/lib/storage';
import { createClient } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface DietContextType {
  // 식단 관련
  dietRecords: DailyDiet[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  getDailyDiet: (date: string) => DailyDiet;
  updateMeal: (date: string, mealType: MealType, mealRecord: MealRecord) => void;
  getTotalCalories: (date: string) => number;
  getCompletedMealsCount: (date: string) => number;

  // 운동 관련
  exerciseRecords: ExerciseRecord[];
  addExercise: (exercise: Omit<ExerciseRecord, 'id' | 'timestamp'>) => void;

  // 채팅 관련
  chatMessages: ChatMessage[];
  addChatMessage: (role: 'user' | 'assistant', content: string) => void;
  clearChatMessages: () => void;

  // 설정 관련
  settings: Settings;
  updateTargetCalories: (calories: number) => void;
  addQuickExercise: (exercise: Omit<QuickExercise, 'id'>) => void;
  removeQuickExercise: (id: string) => void;

  // 로딩 상태
  isLoaded: boolean;
}

const DietContext = createContext<DietContextType | undefined>(undefined);

export const useDiet = () => {
  const context = useContext(DietContext);
  if (!context) {
    throw new Error('useDiet must be used within a DietProvider');
  }
  return context;
};

interface DietProviderProps {
  children: ReactNode;
}

export const DietProvider = ({ children }: DietProviderProps) => {
  const { user } = useAuth();
  const supabase = createClient();

  const [dietRecords, setDietRecords] = useState<DailyDiet[]>([]);
  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecord[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [isLoaded, setIsLoaded] = useState(false);

  // Supabase에서 식단 데이터 로드
  const loadDietFromSupabase = useCallback(async () => {
    if (!user) {
      setDietRecords([]);
      return;
    }

    const { data, error } = await supabase
      .from('diet_records')
      .select('*')
      .eq('user_id', user.id);

    if (!error && data) {
      const records: DailyDiet[] = data.map((record) => ({
        date: record.date,
        meals: record.meals,
      }));
      setDietRecords(records);
    }
  }, [user, supabase]);

  // 초기 데이터 로드
  useEffect(() => {
    // 로컬 데이터 로드 (운동, 채팅, 설정)
    setExerciseRecords(loadExerciseRecords());
    setChatMessages(loadChatMessages());
    setSettings(loadSettings());

    // Supabase 데이터 로드 (식단)
    if (user) {
      loadDietFromSupabase().then(() => setIsLoaded(true));
    } else {
      setIsLoaded(true);
    }
  }, [user, loadDietFromSupabase]);

  // 특정 날짜의 식단 가져오기
  const getDailyDiet = useCallback(
    (date: string): DailyDiet => {
      const existing = dietRecords.find((d) => d.date === date);
      return existing || createEmptyDailyDiet(date);
    },
    [dietRecords]
  );

  // 식사 업데이트 (Supabase)
  const updateMeal = useCallback(
    async (date: string, mealType: MealType, mealRecord: MealRecord) => {
      if (!user) return;

      const existingIndex = dietRecords.findIndex((d) => d.date === date);
      let newMeals;

      if (existingIndex >= 0) {
        newMeals = {
          ...dietRecords[existingIndex].meals,
          [mealType]: mealRecord,
        };
      } else {
        const newDaily = createEmptyDailyDiet(date);
        newDaily.meals[mealType] = mealRecord;
        newMeals = newDaily.meals;
      }

      // Supabase upsert
      const { error } = await supabase
        .from('diet_records')
        .upsert(
          {
            user_id: user.id,
            date: date,
            meals: newMeals,
          },
          {
            onConflict: 'user_id,date',
          }
        );

      if (!error) {
        // 로컬 상태 업데이트
        setDietRecords((prev) => {
          if (existingIndex >= 0) {
            const newRecords = [...prev];
            newRecords[existingIndex] = { date, meals: newMeals };
            return newRecords;
          } else {
            return [...prev, { date, meals: newMeals }];
          }
        });
      }
    },
    [user, dietRecords, supabase]
  );

  // 하루 총 칼로리 계산
  const getTotalCalories = useCallback(
    (date: string): number => {
      const daily = getDailyDiet(date);
      return Object.values(daily.meals).reduce((sum, meal) => {
        return sum + (meal.calories || 0);
      }, 0);
    },
    [getDailyDiet]
  );

  // 완료된 끼니 수 계산
  const getCompletedMealsCount = useCallback(
    (date: string): number => {
      const daily = getDailyDiet(date);
      return Object.values(daily.meals).filter((meal) => meal.status !== 'empty').length;
    },
    [getDailyDiet]
  );

  // 운동 추가 (로컬)
  const addExercise = useCallback((exercise: Omit<ExerciseRecord, 'id' | 'timestamp'>) => {
    setExerciseRecords((prev) => {
      const newExercise: ExerciseRecord = {
        ...exercise,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      const newRecords = [...prev, newExercise];
      saveExerciseRecords(newRecords);
      return newRecords;
    });
  }, []);

  // 채팅 메시지 추가 (로컬)
  const addChatMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    setChatMessages((prev) => {
      const newMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: Date.now(),
      };
      const newMessages = [...prev, newMessage];
      saveChatMessages(newMessages);
      return newMessages;
    });
  }, []);

  // 채팅 메시지 초기화
  const clearChatMessages = useCallback(() => {
    setChatMessages([]);
    saveChatMessages([]);
  }, []);

  // 목표 칼로리 업데이트
  const updateTargetCalories = useCallback((calories: number) => {
    setSettings((prev) => {
      const newSettings = { ...prev, targetCalories: calories };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  // 퀵 운동 추가
  const addQuickExercise = useCallback((exercise: Omit<QuickExercise, 'id'>) => {
    setSettings((prev) => {
      const newExercise: QuickExercise = {
        ...exercise,
        id: crypto.randomUUID(),
      };
      const newSettings = {
        ...prev,
        quickExercises: [...prev.quickExercises, newExercise],
      };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  // 퀵 운동 삭제
  const removeQuickExercise = useCallback((id: string) => {
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        quickExercises: prev.quickExercises.filter((e) => e.id !== id),
      };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  const value: DietContextType = {
    dietRecords,
    selectedDate,
    setSelectedDate,
    getDailyDiet,
    updateMeal,
    getTotalCalories,
    getCompletedMealsCount,
    exerciseRecords,
    addExercise,
    chatMessages,
    addChatMessage,
    clearChatMessages,
    settings,
    updateTargetCalories,
    addQuickExercise,
    removeQuickExercise,
    isLoaded,
  };

  return <DietContext.Provider value={value}>{children}</DietContext.Provider>;
};
