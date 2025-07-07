export type QuizMode = 'quick' | 'standard' | 'deep';

export interface QuizModeConfig {
  name: string;
  questionCount: number;
  availableToFree: boolean;
}

export interface QuizOption {
  id: string;
  text: string;
  points: Record<string, number>;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export interface QuizResult {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  createdBy: string;
  creatorDisplayName?: string;
  tags: string[];
  questions: QuizQuestion[];
  results: QuizResult[];
  completions: number;
  likes: number;
  isTemplate?: boolean;
  templateId?: string;
}

export interface UserQuizResult {
  quizId: string;
  resultId: string;
  takenAt: string;
  answers: Record<string, string>;
}

export interface User {
  isPremium: boolean;
  quizzesTakenToday: number;
  quizResults: UserQuizResult[];
  lastReset: string;
  displayName: string;
  consecutiveLoginDays: number;
  lastLoginDate?: string;
}

export interface ShareMetadata {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
}