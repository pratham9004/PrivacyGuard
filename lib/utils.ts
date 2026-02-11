import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate grade from risk score
 * Higher score = worse grade (F is worst, A is best)
 * Score 0-20: A
 * Score 21-40: B
 * Score 41-60: C
 * Score 61-80: D
 * Score 81-100: F
 */
export function getRiskGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score <= 20) return 'A';
  if (score <= 40) return 'B';
  if (score <= 60) return 'C';
  if (score <= 80) return 'D';
  return 'F';
}

/**
 * Get risk level from score
 */
export function getRiskLevel(score: number): 'Low' | 'Medium' | 'High' {
  if (score <= 40) return 'Low';
  if (score <= 70) return 'Medium';
  return 'High';
}
