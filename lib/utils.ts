import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date and time formatting utilities
export function formatTime(time: string): string {
  return time;
}

export function formatRelativeDate(date: string): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '내일';
  if (diffDays === -1) return '어제';
  if (diffDays > 1) return `${diffDays}일 후`;
  if (diffDays < -1) return `${Math.abs(diffDays)}일 전`;

  return date;
}

export function getAvailabilityText(availableSlots: number): string {
  if (availableSlots > 10) return '여유';
  if (availableSlots > 5) return '제한적';
  if (availableSlots > 0) return '소수';
  return '마감';
}

export function getAvailabilityClass(availableSlots: number): string {
  if (availableSlots > 10) return 'availability-good';
  if (availableSlots > 5) return 'availability-limited';
  if (availableSlots > 0) return 'availability-few';
  return 'availability-none';
}

export function isDatePast(date: string): boolean {
  const targetDate = new Date(date);
  const now = new Date();
  return targetDate < now;
}

export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

// Currency conversion utilities
export function convertYenToWon(yenAmount: number, exchangeRate: number): number {
  return Math.round(yenAmount * exchangeRate);
}

export function convertWonToYen(wonAmount: number, exchangeRate: number): number {
  return Math.round(wonAmount / exchangeRate);
}

// Course type label utility
export function getTypeLabel(type: string): string {
  switch (type) {
    case 'public':
      return '공용';
    case 'private':
      return '사설';
    case 'resort':
      return '리조트';
    default:
      return type;
  }
}
