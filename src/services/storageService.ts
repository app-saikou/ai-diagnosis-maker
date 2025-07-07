import { Quiz, User } from '../types';

const QUIZZES_KEY = 'ai-diagnosis-quizzes';
const USER_KEY = 'ai-diagnosis-user';
const GUEST_QUIZ_KEY = 'ai-diagnosis-guest';

interface GuestQuizData {
  quizzesTakenToday: number;
  lastReset: string;
}

export const storageService = {
  saveQuizzes: (quizzes: Quiz[]) => {
    try {
      localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
    } catch (error) {
      console.error('Error saving quizzes to localStorage:', error);
    }
  },

  getQuizzes: (): Quiz[] | null => {
    try {
      const quizzesJSON = localStorage.getItem(QUIZZES_KEY);
      return quizzesJSON ? JSON.parse(quizzesJSON) : null;
    } catch (error) {
      console.error('Error getting quizzes from localStorage:', error);
      return null;
    }
  },

  saveUser: (user: User) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  },

  getUser: (): User | null => {
    try {
      const userJSON = localStorage.getItem(USER_KEY);
      return userJSON ? JSON.parse(userJSON) : null;
    } catch (error) {
      console.error('Error getting user from localStorage:', error);
      return null;
    }
  },

  saveGuestQuizData: (data: GuestQuizData) => {
    try {
      localStorage.setItem(GUEST_QUIZ_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving guest quiz data to localStorage:', error);
    }
  },

  getGuestQuizData: (): GuestQuizData => {
    try {
      const dataJSON = localStorage.getItem(GUEST_QUIZ_KEY);
      if (dataJSON) {
        return JSON.parse(dataJSON);
      }
    } catch (error) {
      console.error('Error getting guest quiz data from localStorage:', error);
    }
    return {
      quizzesTakenToday: 0,
      lastReset: new Date().toISOString().split('T')[0]
    };
  },

  clearStorage: () => {
    try {
      localStorage.removeItem(QUIZZES_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(GUEST_QUIZ_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};