import { ComponentType, SVGProps } from 'react';

export enum AppView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  LESSON = 'LESSON',
  CONVERSATION = 'CONVERSATION',
  PROGRESS = 'PROGRESS',
  AUTH = 'AUTH'
}

export interface UserStats {
  streak: number;
  xp: number;
  level: number;
  todayAccuracy: number;
  lessonsCompleted: number;
}

export interface Lesson {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string; // e.g., "5 min"
  xp: number;
  thumbnail: string;
  completed?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'avatar';
  text: string;
  timestamp: number;
  isSigning?: boolean; // If true, avatar is animating
}

export interface NavItem {
  label: string;
  view: AppView;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}