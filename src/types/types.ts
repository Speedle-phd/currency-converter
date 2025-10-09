
export type Currency = {
   symbol: string
   name: string
   symbol_native: string
   decimal_digits: number
   rounding: number
   code: string
   name_plural: string
   type: string
   countries: string[]
}

export type CurrencyWithValue = Currency & {
   value: number
}

export type CurrencyPerNation = {
   [countryCode: string]: Currency
}

export type CurrencyData = {
   data: CurrencyPerNation
}

export type ConversionRates = {
   code: string
   value: number
}

export type ConversionRatesPerNation = {
   [countryCode: string]: ConversionRates
}

export type ConversionRatesData = {
   data: ConversionRatesPerNation
}

export type ConversionRatesDataMeta = {
   meta: {
      last_updated: string
   },
   data: ConversionRatesPerNation
}
