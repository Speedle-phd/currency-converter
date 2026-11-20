import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CACHE_DURATION, convertAmount, nextRefreshDelay, parseCache } from '../src/lib/currency-cache.ts'

const isData = (value) => typeof value === 'object' && value !== null && typeof value.rate === 'number'

test('cache accepts valid entries and rejects malformed or future entries', () => {
   const fetchedAt = Date.now() - 1000
   assert.deepEqual(parseCache(JSON.stringify({ data: { rate: 1.2 }, fetchedAt }), isData), {
      data: { rate: 1.2 },
      fetchedAt,
   })
   assert.equal(parseCache(JSON.stringify({ data: {}, fetchedAt }), isData), undefined)
   assert.equal(parseCache(JSON.stringify({ data: { rate: 1 }, fetchedAt: Date.now() + 10000 }), isData), undefined)
})

test('refresh is scheduled exactly 24 hours after the successful fetch', () => {
   const fetchedAt = 1_000_000
   assert.equal(nextRefreshDelay(fetchedAt, fetchedAt + 1000), CACHE_DURATION - 1000)
   assert.equal(nextRefreshDelay(fetchedAt, fetchedAt + CACHE_DURATION), 1000)
   assert.equal(nextRefreshDelay(fetchedAt, fetchedAt + CACHE_DURATION + 86400000), 1000)
})

test('conversion uses the reference rate and rejects invalid rates', () => {
   assert.equal(convertAmount(100, 2, 3), 150)
   assert.equal(convertAmount(0, 2, 3), 0)
   assert.equal(convertAmount(100, 0, 3), null)
   assert.equal(convertAmount(100, 2, Number.NaN), null)
})
