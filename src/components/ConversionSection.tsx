import { Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import useLocalStorage from '@/hooks/LocalStorage'
import { convertAmount } from '@/lib/currency-cache'
import type { ConversionRatesDataMeta, CurrencyWithValue } from '@/types/types'

type Props = {
   data: ConversionRatesDataMeta | undefined
   list: CurrencyWithValue[]
   onRemove: (code: string) => void
}

const ConversionSection = ({ data, list, onRemove }: Props) => {
   const [reference, setReference] = useLocalStorage<{ code: string, amount: string } | null>(
      'speedledev_reference',
      null
   )
   const active = reference && list.some((currency) => currency.code === reference.code)
      ? reference
      : list.length ? { code: list[0].code, amount: String(list[0].value || 0) } : null

   return (
      <section aria-labelledby='selected-heading' className='space-y-3'>
         <div>
            <h2 id='selected-heading' className='text-lg font-semibold'>Your currencies</h2>
            <p className='text-muted-foreground text-sm'>Edit any amount to convert the others.</p>
         </div>
         {list.length === 0 ? (
            <div className='text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm'>
               Search above to add currencies and start converting.
            </div>
         ) : (
            <div className='space-y-2'>
               {list.map((currency) => {
                  const isReference = active?.code === currency.code
                  const sourceRate = active ? data?.data[active.code]?.value : undefined
                  const targetRate = data?.data[currency.code]?.value
                  const result = active && active.amount !== '' && sourceRate && targetRate
                     ? convertAmount(Number(active.amount), sourceRate, targetRate)
                     : null
                  const display = isReference ? active?.amount ?? '' : result === null ? '' : String(Number(result.toFixed(2)))
                  return (
                     <div key={currency.code} className='bg-card flex flex-wrap items-center gap-3 rounded-lg border p-3 sm:flex-nowrap'>
                        <div className='min-w-0 flex-1'>
                           <p className='font-semibold'>{currency.code} <span className='text-muted-foreground font-normal'>{currency.symbol_native}</span></p>
                           <p className='text-muted-foreground truncate text-xs'>{currency.name}</p>
                        </div>
                        <div className='w-36 sm:w-40'>
                           <Input
                              aria-label={`Amount in ${currency.code}`}
                              type='number'
                              inputMode='decimal'
                              min='0'
                              step='any'
                              value={display}
                              disabled={!data || !targetRate}
                              onChange={(event) => {
                                 const amount = event.target.value
                                 if (amount === '' || (Number.isFinite(Number(amount)) && Number(amount) >= 0)) {
                                    setReference({ code: currency.code, amount })
                                 }
                              }}
                           />
                           {data && !targetRate && <span className='text-destructive text-xs'>Rate unavailable</span>}
                        </div>
                        <Button variant='ghost' size='icon' onClick={() => {
                           if (isReference) {
                              const next = list.find((item) => item.code !== currency.code)
                              const nextRate = next && data?.data[next.code]?.value
                              const nextAmount = active && active.amount !== '' && sourceRate && nextRate
                                 ? convertAmount(Number(active.amount), sourceRate, nextRate)
                                 : null
                              setReference(next && nextAmount !== null
                                 ? { code: next.code, amount: String(Number(nextAmount.toFixed(2))) }
                                 : null)
                           }
                           onRemove(currency.code)
                        }} aria-label={`Remove ${currency.code}`}>
                           <Trash2 aria-hidden='true' />
                        </Button>
                     </div>
                  )
               })}
            </div>
         )}
      </section>
   )
}

export default ConversionSection
