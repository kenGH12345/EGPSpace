// EGPSpace workflow utility functions

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function deepClone<T>(obj: T): T {
  if (obj === undefined) return undefined as T;
  if (obj === null) return null as T;
  return JSON.parse(JSON.stringify(obj));
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidTimeout(timeout: number): boolean {
  return Number.isFinite(timeout) && timeout > 0 && timeout <= 24 * 60 * 60 * 1000;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}