// 식사 타입
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// 식사 상태
export type MealStatus = 'empty' | 'fasting' | 'eaten';

// 개별 식사 기록
export interface MealRecord {
  status: MealStatus;
  menu?: string;
  calories?: number;
}

// 하루 식단 기록
export interface DailyDiet {
  date: string; // YYYY-MM-DD
  meals: {
    breakfast: MealRecord;
    lunch: MealRecord;
    dinner: MealRecord;
    snack: MealRecord;
  };
}

// 운동 기록
export interface ExerciseRecord {
  id: string;
  name: string;
  reps?: number;
  duration?: number; // 분 단위
  calories?: number;
  timestamp: number;
}

// 채팅 메시지
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// 퀵 운동 버튼
export interface QuickExercise {
  id: string;
  name: string;
  emoji: string;
}

// 설정
export interface Settings {
  targetCalories: number;
  quickExercises: QuickExercise[];
}

// 앱 전체 상태
export interface AppState {
  dietRecords: DailyDiet[];
  exerciseRecords: ExerciseRecord[];
  chatMessages: ChatMessage[];
  settings: Settings;
}

// 캘린더 뷰 타입
export type CalendarViewType = 'month' | 'week' | 'day';

// 식사 이름 매핑
export const MEAL_NAMES: Record<MealType, string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  snack: '간식',
};

// 식사 이모지 매핑
export const MEAL_EMOJIS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍪',
};

// 기본 설정
export const DEFAULT_SETTINGS: Settings = {
  targetCalories: 1800,
  quickExercises: [
    { id: '1', name: '스쿼트 30개', emoji: '🏋️' },
    { id: '2', name: '플랭크 1분', emoji: '💪' },
    { id: '3', name: '런지 20개', emoji: '🦵' },
    { id: '4', name: '팔굽혀펴기 15개', emoji: '💥' },
  ],
};

// 빈 식사 기록
export const EMPTY_MEAL: MealRecord = {
  status: 'empty',
};

// KST 기준 날짜 문자열 반환 (YYYY-MM-DD)
export const getDateStringKST = (date: Date): string => {
  const kstOffset = 9 * 60; // KST는 UTC+9
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const kstDate = new Date(utc + kstOffset * 60000);

  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, '0');
  const day = String(kstDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

// KST 기준 오늘 날짜 (YYYY-MM-DD)
export const getTodayString = (): string => {
  return getDateStringKST(new Date());
};

// KST 기준 현재 Date 객체 반환
export const getKSTDate = (): Date => {
  const now = new Date();
  const kstOffset = 9 * 60;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + kstOffset * 60000);
};

// 빈 하루 기록 생성
export const createEmptyDailyDiet = (date: string): DailyDiet => ({
  date,
  meals: {
    breakfast: { ...EMPTY_MEAL },
    lunch: { ...EMPTY_MEAL },
    dinner: { ...EMPTY_MEAL },
    snack: { ...EMPTY_MEAL },
  },
});
