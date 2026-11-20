import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftRight, RefreshCw } from 'lucide-react'
import ConversionSection from '@/components/ConversionSection'
import QuerySection from '@/components/QuerySection'
import { ModeToggle } from '@/components/ModeToggle'
import { Button } from '@/components/ui/button'
import useLocalStorage from '@/hooks/LocalStorage'
import { CACHE_DURATION, nextRefreshDelay } from '@/lib/currency-cache'
import {
   getAllConversionRates,
   getAllCurrencies,
   getCachedCurrencies,
   getCachedRates,
} from '@/queryFunctions/query'
import type { CurrencyWithValue } from '@/types/types'

const Converter = () => {
   const [cachedCurrencies] = useState(getCachedCurrencies)
   const [cachedRates] = useState(getCachedRates)
   const [online, setOnline] = useState(navigator.onLine)
   const [currencyList, setCurrencyList] = useLocalStorage<CurrencyWithValue[]>(
      'speedledev_currencyList',
      []
   )

   useEffect(() => {
      const update = () => setOnline(navigator.onLine)
      window.addEventListener('online', update)
      window.addEventListener('offline', update)
      return () => {
         window.removeEventListener('online', update)
         window.removeEventListener('offline', update)
      }
   }, [])

   const queryCurrencies = useQuery({
      queryKey: ['getAllCurrencies'],
      queryFn: getAllCurrencies,
      initialData: cachedCurrencies?.data,
      initialDataUpdatedAt: cachedCurrencies?.fetchedAt,
      staleTime: CACHE_DURATION,
      retry: false,
      refetchInterval: (query) => query.state.status === 'error'
         ? false
         : nextRefreshDelay(query.state.dataUpdatedAt),
      refetchIntervalInBackground: true,
   })
   const queryRates = useQuery({
      queryKey: ['getAllConversionRates'],
      queryFn: getAllConversionRates,
      initialData: cachedRates?.data,
      initialDataUpdatedAt: cachedRates?.fetchedAt,
      staleTime: CACHE_DURATION,
      retry: false,
      refetchInterval: (query) => query.state.status === 'error'
         ? false
         : nextRefreshDelay(query.state.dataUpdatedAt),
      refetchIntervalInBackground: true,
   })
   const list = Array.isArray(currencyList) ? currencyList : []
   const hasError = queryCurrencies.isError || queryRates.isError
   const isFetching = queryCurrencies.isFetching || queryRates.isFetching
   const staleRates = queryRates.data && Date.now() - queryRates.dataUpdatedAt >= CACHE_DURATION

   return (
      <main className='min-h-screen bg-gradient-to-b from-accent/70 via-background to-background px-4 py-8 sm:py-12'>
         <div className='mx-auto max-w-3xl space-y-6'>
            <header className='flex items-start justify-between gap-4'>
               <div className='space-y-2'>
                  <div className='text-muted-foreground flex items-center gap-2 text-sm font-medium'>
                     <ArrowLeftRight aria-hidden='true' className='size-4' /> Currency tools
                  </div>
                  <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>Currency Converter</h1>
                  <p className='text-muted-foreground text-sm sm:text-base'>Compare currencies with daily exchange rates.</p>
               </div>
               <ModeToggle />
            </header>

            <div className='bg-card space-y-6 rounded-xl border p-4 shadow-sm sm:p-6'>
               <QuerySection
                  data={queryCurrencies.data}
                  loading={queryCurrencies.isPending}
                  list={list}
                  onAdd={(currency) => setCurrencyList([...list, { ...currency, value: 0 }])}
               />
               <div className='border-t' />
               <ConversionSection
                  data={queryRates.data}
                  list={list}
                  onRemove={(code) => setCurrencyList(list.filter((currency) => currency.code !== code))}
               />
            </div>

            <div className='text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-sm' aria-live='polite'>
               <div>
                  {!online && <p>Offline. {queryRates.data ? 'Showing cached rates.' : 'Connect to load exchange rates.'}</p>}
                  {queryRates.data && (
                     <p>
                        Rates updated {new Date(queryRates.data.meta.last_updated_at).toLocaleString()}.
                        {staleRates && ' Cached rates are older than 24 hours.'}
                     </p>
                  )}
                  {isFetching && <p>Updating currency data...</p>}
                  {hasError && (
                     <p role='alert' className='text-destructive'>
                        {queryCurrencies.error?.message || queryRates.error?.message || 'Unable to update currency data.'}
                        {(queryCurrencies.data || queryRates.data) && ' Cached data remains available.'}
                     </p>
                  )}
               </div>
               {hasError && online && (
                  <Button variant='outline' size='sm' disabled={isFetching} onClick={() => {
                     if (queryCurrencies.isError) void queryCurrencies.refetch()
                     if (queryRates.isError) void queryRates.refetch()
                  }}>
                     <RefreshCw aria-hidden='true' /> Retry
                  </Button>
               )}
            </div>
         </div>
      </main>
   )
}

export default Converter
