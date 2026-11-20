import { ccApi } from '@/axios/axios'
import axios from 'axios'
import { parseCache, type CachedData } from '@/lib/currency-cache'
import type { ConversionRatesDataMeta, CurrencyData } from '@/types/types'

const CURRENCIES_KEY = 'speedledev_currencies_v2'
const RATES_KEY = 'speedledev_conversionRates_v2'

function isRecord(value: unknown): value is Record<string, unknown> {
   return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isCurrencyData(value: unknown): value is CurrencyData {
   if (!isRecord(value) || !isRecord(value.data)) return false
   const currencies = Object.values(value.data)
   return currencies.length > 0 && currencies.every((currency) =>
      isRecord(currency) &&
      typeof currency.code === 'string' &&
      typeof currency.name === 'string' &&
      typeof currency.symbol === 'string' &&
      typeof currency.symbol_native === 'string' &&
      Array.isArray(currency.countries) &&
      currency.countries.every((country) => typeof country === 'string')
   )
}

function isRatesData(value: unknown): value is ConversionRatesDataMeta {
   if (!isRecord(value) || !isRecord(value.meta) || !isRecord(value.data) ||
       typeof value.meta.last_updated_at !== 'string' ||
       Number.isNaN(Date.parse(value.meta.last_updated_at))) return false
   const rates = Object.values(value.data)
   return rates.length > 0 && rates.every((rate) =>
      isRecord(rate) && typeof rate.code === 'string' &&
      typeof rate.value === 'number' && Number.isFinite(rate.value) && rate.value > 0
   )
}

function readCache<T>(key: string, validate: (value: unknown) => value is T) {
   try {
      return parseCache(window.localStorage.getItem(key), validate)
   } catch (error) {
      console.warn('Could not read the currency cache:', error)
      return undefined
   }
}

function readLegacyCache<T>(key: string, validate: (value: unknown) => value is T): CachedData<T> | undefined {
   try {
      const raw = window.localStorage.getItem(key)
      if (!raw) return undefined
      const data: unknown = JSON.parse(raw)
      return validate(data) ? { data, fetchedAt: 1 } : undefined
   } catch (error) {
      console.warn('Could not read the previous currency cache:', error)
      return undefined
   }
}

async function fetchAndCache<T>(
   path: string,
   key: string,
   validate: (value: unknown) => value is T
): Promise<T> {
   if (!import.meta.env.VITE_CC_APIKEY) {
      throw new Error('Currency API key is missing. Configure VITE_CC_APIKEY and rebuild the app.')
   }
   let response
   try {
      response = await ccApi.get<unknown>(path)
   } catch (error) {
      if (!axios.isAxiosError(error)) throw error
      const status = error.response?.status
      if (status === 401 || status === 403) {
         throw new Error('Currency API rejected the key. Check VITE_CC_APIKEY and rebuild the app.')
      }
      if (status === 429) throw new Error('Currency API request limit reached. Try again later.')
      throw new Error(status
         ? `Currency API request failed (HTTP ${status}).`
         : 'Cannot reach the currency API. Check your connection.')
   }
   if (!validate(response.data)) {
      throw new Error('The currency API returned an invalid response.')
   }
   const cache: CachedData<T> = { data: response.data, fetchedAt: Date.now() }
   try {
      window.localStorage.setItem(key, JSON.stringify(cache))
   } catch (error) {
      console.warn('Could not save the currency cache:', error)
   }
   return response.data
}

export const getCachedCurrencies = () =>
   readCache(CURRENCIES_KEY, isCurrencyData) || readLegacyCache('speedledev_currencies', isCurrencyData)
export const getCachedRates = () =>
   readCache(RATES_KEY, isRatesData) || readLegacyCache('speedledev_conversionRates', isRatesData)
export const getAllCurrencies = () => fetchAndCache('/v3/currencies', CURRENCIES_KEY, isCurrencyData)
export const getAllConversionRates = () => fetchAndCache('/v3/latest', RATES_KEY, isRatesData)
