import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// lib/utils.ts

export function getNumericOrderId(alphanumericId: string): string {
  // Convert alphanumeric ID to a 6-digit numeric hash
  let hash = 0;
  for (let i = 0; i < alphanumericId.length; i++) {
    hash = (hash * 31 + alphanumericId.charCodeAt(i)) % 1000000;
  }
  return hash.toString().padStart(6, '0'); // Always 6 digits
}
