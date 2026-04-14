
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculate1RM(weight: number, reps: number): number {
  if (!weight || !reps) return 0;
  if (reps === 1) return weight;
  // Brzycki Formula (safe up to 30 reps)
  if (reps > 30) return weight * (1 + reps / 30);
  return weight / (1.0278 - 0.0278 * reps);
}

export function getHypertrophyZone(oneRM: number) {
  if (!oneRM) return { min: 0, max: 0 };
  return {
    min: oneRM * 0.60,
    max: oneRM * 0.85
  };
}

export function formatDateToInput(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length !== 3) return '';
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function formatDateFromInput(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

export function calculatePace(durationMinutes: number, distanceKm: number): string {
  if (!distanceKm || !durationMinutes) return "0:00";
  const totalSeconds = (durationMinutes * 60) / distanceKm;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
