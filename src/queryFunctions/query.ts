import { ccApi } from '@/axios/axios'

export const getAllCurrencies = async () => {
   const currencies = window.localStorage.getItem('speedledev_currencies')
   if (currencies) return JSON.parse(currencies)
   try {
      const response = await ccApi.get('/v3/currencies')
      if (response.status < 200 || response.status >= 300)
         throw new Error('Network response was not ok')
      return response.data
   } catch (error) {
      console.error(error)
      return null
   }
}

export const getAllConversionRates = async () => {
   const conversionRates = window.localStorage.getItem(
      'speedledev_conversionRates'
   )

   let parsedConversionRates = conversionRates
      ? JSON.parse(conversionRates)
      : null
   const lastUpdatedAt = new Date(parsedConversionRates.meta.last_updated_at)
   const now = new Date()
   const dateDiff = now.getDate() - lastUpdatedAt.getDate()
   if (dateDiff > 1) {
      console.log('Conversion rates are stale')
      window.localStorage.removeItem('speedledev_conversionRates')
      parsedConversionRates = null
   }

   if (parsedConversionRates) return parsedConversionRates
   try {
      const response = await ccApi.get('/v3/latest')
      if (response.status < 200 || response.status >= 300)
         throw new Error('Network response was not ok')
      return response.data
   } catch (error) {
      console.error(error)
      return null
   }
}
