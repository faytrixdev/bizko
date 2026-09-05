import { getISOWeek, getISOWeekYear, startOfISOWeek, endOfISOWeek } from 'date-fns'

export function isoWeek(date: Date): number {
  return getISOWeek(date)
}

export function weekKey(date: Date): string {
  const year = getISOWeekYear(date)
  const week = getISOWeek(date)
  return `${year}-W${String(week).padStart(2, '0')}`
}

export function currentWeekKey(): string {
  return weekKey(new Date())
}

export function weekBounds(key: string): { start: Date; end: Date } {
  const match = key.match(/^(\d{4})-W(\d{2})$/)
  if (!match) {
    throw new Error(`Invalid week key format: ${key}`)
  }

  const year = parseInt(match[1], 10)
  const week = parseInt(match[2], 10)

  if (week < 1 || week > 53) {
    throw new Error(`Invalid week number: ${week}`)
  }

  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Week = getISOWeek(jan4)
  const jan4Year = getISOWeekYear(jan4)

  if (jan4Year !== year && week > jan4Week) {
    throw new Error(`Week ${week} does not exist in year ${year}`)
  }

  if (week === 53) {
    const dec28 = new Date(Date.UTC(year, 11, 28))
    if (getISOWeek(dec28) !== 53) {
      throw new Error(`Week 53 does not exist in year ${year}`)
    }
  }

  const start = startOfISOWeek(new Date(Date.UTC(year, 0, 4 + (week - 1) * 7)))
  const end = endOfISOWeek(start)

  return { start, end }
}