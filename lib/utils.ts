import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: number | null | undefined, currency: string = '€') => {
  if (!price || price === 0) {
    return 'Me marrëveshje';
  }
  
  return `${price.toLocaleString()} ${currency}`;
};
