import { AppState, DEFAULT_SETTINGS, DailyDiet, ExerciseRecord, ChatMessage, Settings } from '@/types';

const STORAGE_KEYS = {
  DIET_RECORDS: 'diet-friend-diet-records',
  EXERCISE_RECORDS: 'diet-friend-exercise-records',
  CHAT_MESSAGES: 'diet-friend-chat-messages',
  SETTINGS: 'diet-friend-settings',
};

// LocalStorage에서 데이터 로드
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (error) {
    console.error(`Failed to load ${key} from storage:`, error);
  }
  return defaultValue;
};

// LocalStorage에 데이터 저장
export const saveToStorage = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to storage:`, error);
  }
};

// 식단 기록 로드
export const loadDietRecords = (): DailyDiet[] => {
  return loadFromStorage<DailyDiet[]>(STORAGE_KEYS.DIET_RECORDS, []);
};

// 식단 기록 저장
export const saveDietRecords = (records: DailyDiet[]): void => {
  saveToStorage(STORAGE_KEYS.DIET_RECORDS, records);
};

// 운동 기록 로드
export const loadExerciseRecords = (): ExerciseRecord[] => {
  return loadFromStorage<ExerciseRecord[]>(STORAGE_KEYS.EXERCISE_RECORDS, []);
};

// 운동 기록 저장
export const saveExerciseRecords = (records: ExerciseRecord[]): void => {
  saveToStorage(STORAGE_KEYS.EXERCISE_RECORDS, records);
};

// 채팅 메시지 로드
export const loadChatMessages = (): ChatMessage[] => {
  return loadFromStorage<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, []);
};

// 채팅 메시지 저장
export const saveChatMessages = (messages: ChatMessage[]): void => {
  saveToStorage(STORAGE_KEYS.CHAT_MESSAGES, messages);
};

// 설정 로드
export const loadSettings = (): Settings => {
  return loadFromStorage<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
};

// 설정 저장
export const saveSettings = (settings: Settings): void => {
  saveToStorage(STORAGE_KEYS.SETTINGS, settings);
};

// 전체 앱 상태 로드
export const loadAppState = (): AppState => {
  return {
    dietRecords: loadDietRecords(),
    exerciseRecords: loadExerciseRecords(),
    chatMessages: loadChatMessages(),
    settings: loadSettings(),
  };
};

// 모든 데이터 초기화
export const clearAllData = (): void => {
  if (typeof window === 'undefined') return;

  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};
