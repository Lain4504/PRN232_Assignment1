import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const hasEnvVars = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
)

// Currency helpers
export function formatCurrencyVND(value: number): string {
  try {
    const formatted = new Intl.NumberFormat('vi-VN', {
      maximumFractionDigits: 0,
    }).format(value)
    return `${formatted}đ`
  } catch {
    return `${Math.round(value).toLocaleString('vi-VN')}đ`
  }
}
