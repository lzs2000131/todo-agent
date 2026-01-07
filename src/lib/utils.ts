// 工具函数
export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function formatDate(date: Date): string {
  return date.toISOString()
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr)
}
