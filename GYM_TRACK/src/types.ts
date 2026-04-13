
export interface ExerciseRecord {
  id?: number;
  user_id?: string;
  date: string;
  group: string;
  exercise: string;
  weight: number;
  reps: number;
}

export interface PersonalRecord {
  id?: number;
  user_id?: string;
  group: string;
  exercise: string;
  pr: number;
  rep: number;
  date: string;
  oneRM?: number;
}

export interface RunRecord {
  id?: number;
  user_id?: string;
  date: string;
  type: 'easy' | 'tempo' | 'intervals' | 'long' | 'race';
  distance: number;
  duration: number;
  hr?: number;
  rpe?: number;
  notes?: string;
  pace: string;
  planned_id?: number;
}

export interface PlannedRun {
  id?: number;
  user_id?: string;
  date: string;
  type: 'easy' | 'tempo' | 'intervals' | 'long' | 'race';
  distance: number;
  pace?: string;
  intervals?: number;
  notes?: string;
  completed?: boolean;
}

export interface MealRecord {
  id?: number;
  user_id?: string;
  date: string;
  name: string;
  kcal: number;
  prot: number;
  carb: number;
  fat_total: number;
  fat_sat: number;
  fiber: number;
}

export interface WaterRecord {
  id?: number;
  user_id?: string;
  date: string;
  current: number;
  goal: number;
}

export interface DietGoals {
  id?: number;
  user_id?: string;
  kcal: number;
  prot: number;
  carb: number;
  fat_total: number;
  fat_sat: number;
  fiber: number;
}

export interface UserProfile {
  id: string;
  email: string;
  is_approved: boolean;
  is_admin: boolean;
  created_at?: string;
}

export type AppMode = 'musculacao' | 'corrida' | 'alimentacao';
