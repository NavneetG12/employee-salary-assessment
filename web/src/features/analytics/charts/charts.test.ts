import { describe, expect, it } from 'vitest'
import { pivotByLevel } from './GenderByLevelChart'
import { niceCeil } from './PayBandChart'

describe('pivotByLevel', () => {
  it('creates one row per level in ladder order with a column per present gender', () => {
    const rows = [
      { level: 'Senior', gender: 'MALE', headcount: 10, medianUsd: 100 },
      { level: 'Junior', gender: 'FEMALE', headcount: 4, medianUsd: 50 },
      { level: 'Senior', gender: 'FEMALE', headcount: 8, medianUsd: 95 },
    ]
    const { genders, data } = pivotByLevel(rows, ['Junior', 'Mid', 'Senior'])
    expect(genders).toEqual(['FEMALE', 'MALE'])
    expect(data).toEqual([
      { level: 'Junior', FEMALE: 50, FEMALE_n: 4 },
      { level: 'Senior', FEMALE: 95, FEMALE_n: 8, MALE: 100, MALE_n: 10 },
    ])
  })
})

describe('niceCeil', () => {
  it('rounds up to a clean axis maximum', () => {
    expect(niceCeil(487_000)).toBe(500_000)
    expect(niceCeil(1_100_000)).toBe(2_000_000)
    expect(niceCeil(230)).toBe(250)
    expect(niceCeil(0)).toBe(1)
  })
})
