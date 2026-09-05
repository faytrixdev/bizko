import { describe, it, expect, vi } from 'vitest'
import { isoWeek, weekKey, currentWeekKey, weekBounds } from '../week'

describe('isoWeek', () => {
  it('returns correct ISO week for known dates', () => {
    expect(isoWeek(new Date('2026-01-01'))).toBe(1) // Thu Jan 1 2026 = week 1
    expect(isoWeek(new Date('2026-01-04'))).toBe(1) // Sun Jan 4 2026 = week 1
    expect(isoWeek(new Date('2026-01-05'))).toBe(2) // Mon Jan 5 2026 = week 2
    expect(isoWeek(new Date('2026-12-31'))).toBe(53) // Thu Dec 31 2026 = week 53
  })

  it('handles year transitions correctly', () => {
    // Dec 29 2025 is Monday, week 1 of 2026
    expect(isoWeek(new Date('2025-12-29'))).toBe(1)
    // Dec 31 2023 is Sunday, week 52 of 2023
    expect(isoWeek(new Date('2023-12-31'))).toBe(52)
    // Jan 1 2023 is Sunday, week 52 of 2022
    expect(isoWeek(new Date('2023-01-01'))).toBe(52)
  })

  it('returns week 53 for years with 53 weeks', () => {
    // 2026 has 53 weeks
    expect(isoWeek(new Date('2026-12-28'))).toBe(53) // Monday of week 53
    expect(isoWeek(new Date('2026-12-31'))).toBe(53) // Thursday of week 53
  })
})

describe('weekKey', () => {
  it('returns formatted YYYY-WWW string', () => {
    expect(weekKey(new Date('2026-01-01'))).toBe('2026-W01')
    expect(weekKey(new Date('2026-01-05'))).toBe('2026-W02')
    expect(weekKey(new Date('2026-12-31'))).toBe('2026-W53')
  })

  it('zero-pads week numbers', () => {
    expect(weekKey(new Date('2026-01-01'))).toMatch(/^2026-W0[1-9]$/)
    expect(weekKey(new Date('2026-12-31'))).toMatch(/^2026-W5[0-3]$/)
  })

  it('handles year transitions', () => {
    // Dec 29 2025 is Monday, week 1 of 2026
    expect(weekKey(new Date('2025-12-29'))).toBe('2026-W01')
    // Jan 1 2023 is Sunday, week 52 of 2022
    expect(weekKey(new Date('2023-01-01'))).toBe('2022-W52')
  })
})

describe('currentWeekKey', () => {
  it('returns current week key', () => {
    const now = new Date('2026-06-15T12:00:00Z')
    vi.setSystemTime(now)
    expect(currentWeekKey()).toBe('2026-W25')
    vi.useRealTimers()
  })
})

describe('weekBounds', () => {
  it('returns correct UTC start (Mon 00:00) and end (Sun 23:59:59.999) for valid key', () => {
    const bounds = weekBounds('2026-W01')
    expect(bounds.start).toEqual(new Date('2025-12-29T00:00:00.000Z'))
    expect(bounds.end).toEqual(new Date('2026-01-04T23:59:59.999Z'))
  })

  it('handles week 53 correctly', () => {
    const bounds = weekBounds('2026-W53')
    expect(bounds.start).toEqual(new Date('2026-12-28T00:00:00.000Z'))
    expect(bounds.end).toEqual(new Date('2027-01-03T23:59:59.999Z'))
  })

  it('handles mid-year weeks', () => {
    const bounds = weekBounds('2026-W26')
    expect(bounds.start).toEqual(new Date('2026-06-22T00:00:00.000Z'))
    expect(bounds.end).toEqual(new Date('2026-06-28T23:59:59.999Z'))
  })

  it('throws on invalid key format', () => {
    expect(() => weekBounds('invalid')).toThrow()
    expect(() => weekBounds('2026')).toThrow()
    expect(() => weekBounds('2026-W')).toThrow()
    expect(() => weekBounds('2026-W00')).toThrow()
    expect(() => weekBounds('2026-W54')).toThrow()
  })

  it('throws on non-existent week 53 for years with 52 weeks', () => {
    // 2025 has only 52 weeks
    expect(() => weekBounds('2025-W53')).toThrow()
  })
})