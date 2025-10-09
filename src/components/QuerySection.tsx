import type { Currency, CurrencyData, CurrencyWithValue } from '@/types/types'
import { Input } from './ui/input'
import { useRef, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

type Props = {
   data: CurrencyData | null | undefined
   setList: (currency: CurrencyWithValue[]) => void
   list: CurrencyWithValue[] | null
}
const QuerySection = ({ data, setList, list }: Props) => {
   const inputRef = useRef<HTMLInputElement>(null)
   const currencyData = data?.data
   const currencyArray = currencyData ? Object.values(currencyData) : []
   const [currencies, setCurrencies] = useState<Currency[]>([])

   const handleInputChange = () => {
      const query = inputRef.current?.value.toLowerCase() || ''
      if (query === '') {
         setCurrencies([])
      } else {
         const filteredCurrencies = currencyArray.filter(
            (currency) =>
               currency.name.toLowerCase().includes(query) ||
               currency.code.toLowerCase().includes(query) ||
               currency.countries.some((country) =>
                  country.toLowerCase().includes(query)
               )
         )
         setCurrencies(filteredCurrencies)
      }
   }

   const handleClick = (currency: Currency) => {
      if (list?.some((c) => c.code === currency.code)) {
         // Currency is already in the list
         console.log('Currency already selected:', currency)
      } else {
         // Handle currency click
         console.log('Currency clicked:', currency)
         inputRef.current!.value = ""
         setCurrencies([])
         setList([...list!, { ...currency, value: 0 }])
      }
   }

   return (
      <section className='relative'>
         <Input
            ref={inputRef}
            placeholder='Enter your query'
            onChange={handleInputChange}
         />
         {currencies.length > 0 && (
            <aside className='absolute z-[100] w-full max-h-[20rem] overflow-y-auto '>
               <Table className='bg-accent rounded-lg shadow-sm shadow-primary'>
                  <TableCaption>A list of currencies</TableCaption>
                  <TableHeader>
                     <TableRow className=''>
                        <TableHead className='w-[100px]'>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead className='text-right'>
                           Symbol Native
                        </TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {currencies?.map((currency, index) => (
                        <TableRow onClick={() => handleClick(currency)} key={index} className='hover:opacity-50 transition-colors cursor-pointer'>
                           <TableCell className='font-medium'>
                              {currency.code}
                           </TableCell>
                           <TableCell>{currency.name}</TableCell>
                           <TableCell>{currency.symbol}</TableCell>
                           <TableCell className='text-right'>
                              {currency.symbol_native}
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </aside>
         )}
      </section>
   )
}

export default QuerySection
