import ConversionSection from '@/components/ConversionSection'
import QuerySection from '@/components/QuerySection'
import { Separator } from '@/components/ui/separator'
import { useQuery } from '@tanstack/react-query'
import { getAllConversionRates, getAllCurrencies } from '@/queryFunctions/query'
import useLocalStorage from '@/hooks/LocalStorage'
import { useEffect } from 'react'
import {
   type ConversionRatesDataMeta,
   type CurrencyData,
   type CurrencyWithValue,
} from '@/types/types'
import { ModeToggle } from '@/components/ModeToggle'
const Converter = () => {
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const [_, setValueOfCurrencies] = useLocalStorage<CurrencyData | null>(
      'speedledev_currencies',
      null
   )
   const queryCurrencies = useQuery<CurrencyData | null>({
      queryKey: ['getAllCurrencies'],
      queryFn: getAllCurrencies,
   })

   useEffect(() => {
      if (queryCurrencies.isSuccess) {
         setValueOfCurrencies(queryCurrencies.data)
      }
   }, [queryCurrencies.data, queryCurrencies.isSuccess, setValueOfCurrencies])

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const [_2, setValueOfConversationRates] =
      useLocalStorage<ConversionRatesDataMeta | null>(
         'speedledev_conversionRates',
         null
      )
   const queryConversionRates = useQuery<ConversionRatesDataMeta | null>({
      queryKey: ['getAllConversionRates'],
      queryFn: getAllConversionRates,
   })
   useEffect(() => {
      if (queryConversionRates.isSuccess) {
         setValueOfConversationRates(queryConversionRates.data)
      }
   }, [
      queryConversionRates.data,
      queryConversionRates.isSuccess,
      setValueOfConversationRates,
   ])

   const [currencyList, setCurrencyList] = useLocalStorage<CurrencyWithValue[] | null>(
      'speedledev_currencyList',
      []
   )



   return (
      <div className='flex min-h-screen flex-col items-center p-4'>
         <aside className="absolute right-2 top-2">
            <ModeToggle />
         </aside>
         <h1 className='mb-4 font-extrabold text-3xl'>Currency Converter</h1>
         <div className='border-2 w-[clamp(12rem,calc(100vw-2rem),70rem)] p-4 flex flex-col gap-2'>
            <QuerySection
               data={queryCurrencies.data}
               setList={setCurrencyList}
               list={currencyList}
            />
            <Separator />
            <ConversionSection
               data={queryConversionRates.data}
               setList={setCurrencyList}
               list={currencyList}
            />
         </div>
      </div>
   )
}

export default Converter
