export const CACHE_DURATION = 24 * 60 * 60 * 1000

export type CachedData<T> = {
   data: T
   fetchedAt: number
}

export function parseCache<T>(
   raw: string | null,
   isValid: (value: unknown) => value is T
): CachedData<T> | undefined {
   if (!raw) return undefined
   try {
      const value: unknown = JSON.parse(raw)
      if (
         typeof value === 'object' &&
         value !== null &&
         'data' in value &&
         'fetchedAt' in value &&
         typeof value.fetchedAt === 'number' &&
         Number.isFinite(value.fetchedAt) &&
         value.fetchedAt > 0 &&
         value.fetchedAt <= Date.now() &&
         isValid(value.data)
      ) {
         return { data: value.data, fetchedAt: value.fetchedAt }
      }
   } catch (error) {
      console.warn('Could not parse cached currency data:', error)
   }
   return undefined
}

export function nextRefreshDelay(fetchedAt: number, now = Date.now()) {
   return Math.max(1000, fetchedAt + CACHE_DURATION - now)
}

export function convertAmount(amount: number, sourceRate: number, targetRate: number) {
   if (!Number.isFinite(amount) || !Number.isFinite(sourceRate) ||
       !Number.isFinite(targetRate) || sourceRate <= 0 || targetRate <= 0) {
      return null
   }
   const result = (amount / sourceRate) * targetRate
   return Number.isFinite(result) ? result : null
}
