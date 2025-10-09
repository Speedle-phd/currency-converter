import type { ConversionRatesDataMeta, CurrencyWithValue } from '@/types/types'
import {
   Table,
   TableBody,
   TableCaption,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from './ui/table'
import { Input } from './ui/input'
import { createRef, useEffect, useRef, useState } from 'react'


const SWIPE_THRESHOLD = 80 // threshold in pixels to trigger delete
const DELETE_WIDTH = 90 // width of delete area in pixels

type Props = {
   data: ConversionRatesDataMeta | null | undefined
   setList: (currency: CurrencyWithValue[]) => void
   list: CurrencyWithValue[] | null
}
const ConversionSection = ({ data, setList, list }: Props) => {
   const [inputRefs, setInputRefs] = useState<
      React.RefObject<HTMLInputElement | null>[]
   >([])

      const [dragX, setDragX] = useState<number[]>([])
      const [isDragging, setIsDragging] = useState<boolean[]>([])
      const startXRef = useRef<number>(0)
      const activeIndexRef = useRef<number | null>(null)

   const handleChange = (currency: CurrencyWithValue, index: number) => {

      const value = inputRefs[index].current?.value
      const targetCode = currency.code
      const { data: conversionData } = data!
      console.log(value, targetCode)
      if (value) {
         const updatedList = list?.map((c) => {
            if (c.code === targetCode) {
               // Update the value for the currency being edited
               return { ...c, value: value ? parseFloat(value) : 0 }
            } else {
               // Convert the entered value to USD first, then to the target currency
               const usdValue =
                  targetCode === 'USD'
                     ? value
                        ? parseFloat(value)
                        : 0
                     : value
                     ? parseFloat(value) / conversionData[targetCode].value
                     : 0
               const newValue =
                  c.code === 'USD'
                     ? usdValue
                     : usdValue * conversionData[c.code].value
               return { ...c, value: Number(newValue.toFixed(2)) }
            }
         })
         inputRefs.forEach((ref, idx) => {
            ref.current?.classList.remove('reference')
            if (idx === index) return
            if (ref.current) {
               ref.current.value = updatedList?.[idx]?.value.toString() || ''
            }
         })
         inputRefs[index].current?.classList.add('reference')
         setList(updatedList!)
      }
   }
   useEffect(() => {
      setInputRefs(() => list?.map(() => createRef<HTMLInputElement>()) || [])
            setDragX(() => list?.map(() => 0) || [])
            setIsDragging(() => list?.map(() => false) || [])
   }, [list])


      const handleStart = (
         e: React.MouseEvent | React.TouchEvent,
         index: number
      ) => {
         activeIndexRef.current = index
         setIsDragging((prev) => prev.map((v, i) => (i === index ? true : v)))

         const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
         startXRef.current = clientX
      }

      const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
         const index = activeIndexRef.current
         if (index === null) return
         if (!isDragging[index]) return

         const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
         const deltaX = clientX - startXRef.current

         // Only allow dragging left
         if (deltaX < 0) {
            setDragX((prev) =>
               prev.map((val, i) =>
                  i === index ? Math.max(deltaX, -DELETE_WIDTH * 1.5) : val
               )
            )
         }
      }

      const handleEnd = () => {
         const index = activeIndexRef.current
         if (index === null) return

         const finalOffset = dragX[index]

         if (Math.abs(finalOffset) > SWIPE_THRESHOLD) {
            if (list) {
               setList(list.filter((_: CurrencyWithValue, i: number) => i !== index))
            }
         } else {
            setDragX((prev) => prev.map((val, i) => (i === index ? 0 : val)))
         }

         setIsDragging((prev) => prev.map((v, i) => (i === index ? false : v)))
         activeIndexRef.current = null
      }

   return (
      <section>
         {' '}
         <Table className='overflow-hidden'>
            <TableCaption>A list of your selected currencies.</TableCaption>
            <TableHeader>
               <TableRow>
                  <TableHead className='w-[50px]'>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead className='text-right'>Value</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {list &&
                  list.length > 0 &&
                  list?.map((currency, index) => (
                     <TableRow
                        key={index}
                        className='reference-row relative'
                        onMouseDown={(e) => handleStart(e, index)}
                        onMouseMove={handleMove}
                        onMouseUp={handleEnd}
                        // onMouseLeave={handleEnd}
                        onTouchStart={(e) => handleStart(e, index)}
                        onTouchMove={handleMove}
                        onTouchEnd={handleEnd}
                        
                        style={{
                           transform: `translateX(${dragX[index]}px)`,
                           transition: isDragging[index]
                              ? 'none'
                              : 'transform 0.2s ease',
                        }}
                     >
                        <TableCell className='font-medium'>
                           {currency.code}
                        </TableCell>
                        <TableCell>{currency.name}</TableCell>
                        <TableCell>{currency.symbol_native}</TableCell>
                        <TableCell className='text-right'>
                           <Input
                              data-code={currency.code}
                              ref={inputRefs[index]}
                              type='number'
                              onChange={() => handleChange(currency, index)}
                              pattern='^\d*\.?\d*$'
                              step='0.01'
                              min={0}
                           />
                        </TableCell>

                        {/* Red delete area */}
                        <TableCell
                           className='absolute top-0 -right-[121px] h-full w-[120px] bg-red-500 text-white flex items-center justify-center pointer-events-none'
                           style={{ zIndex: 0 }}
                        >
                           Delete
                        </TableCell>
                     </TableRow>
                  ))}
            </TableBody>
         </Table>
      </section>
   )
}

export default ConversionSection
