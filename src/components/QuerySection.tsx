import type { Currency, CurrencyData, CurrencyWithValue } from '@/types/types'
import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from './ui/input'

type Props = {
   data: CurrencyData | undefined
   list: CurrencyWithValue[]
   onAdd: (currency: Currency) => void
   loading: boolean
}

const QuerySection = ({ data, list, onAdd, loading }: Props) => {
   const [query, setQuery] = useState('')
   const matches = useMemo(() => {
      const term = query.trim().toLowerCase()
      if (!term || !data) return []
      return Object.values(data.data)
         .filter((currency) =>
            currency.name.toLowerCase().includes(term) ||
            currency.code.toLowerCase().includes(term) ||
            currency.countries.some((country) => country.toLowerCase().includes(term))
         )
         .slice(0, 20)
   }, [data, query])

   return (
      <section className='relative'>
         <label htmlFor='currency-search' className='mb-2 block text-sm font-medium'>
            Add a currency
         </label>
         <div className='relative'>
            <Search aria-hidden='true' className='text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2' />
            <Input
               id='currency-search'
               className='h-11 pl-10'
               value={query}
               onChange={(event) => setQuery(event.target.value)}
               placeholder='Search by currency, code or country code'
               autoComplete='off'
               disabled={!data}
               aria-describedby='search-hint'
            />
         </div>
         <p id='search-hint' className='text-muted-foreground mt-2 text-xs'>
            {loading && !data ? 'Loading currencies...' : !data ? 'Currency search is unavailable.' : 'Search and select a currency to add it.'}
         </p>
         {query.trim() && data && (
            <div className='bg-popover absolute z-10 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border p-1 shadow-lg'>
               {matches.length === 0 ? (
                  <p className='text-muted-foreground p-3 text-sm'>No currencies found.</p>
               ) : matches.map((currency) => {
                  const selected = list.some((item) => item.code === currency.code)
                  return (
                     <button
                        key={currency.code}
                        type='button'
                        disabled={selected}
                        onClick={() => {
                           onAdd(currency)
                           setQuery('')
                        }}
                        className='hover:bg-accent focus-visible:bg-accent flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm outline-none disabled:opacity-50'
                     >
                        <span><strong>{currency.code}</strong> <span className='text-muted-foreground'>{currency.name}</span></span>
                        <span>{selected ? 'Added' : currency.symbol_native}</span>
                     </button>
                  )
               })}
            </div>
         )}
      </section>
   )
}

export default QuerySection
