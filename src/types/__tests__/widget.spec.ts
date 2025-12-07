import { describe, it, expect } from 'vitest'
import { safeCalculate } from '../widget'

describe('safeCalculate', () => {
  describe('with no calculation', () => {
    it('returns original value when calculation is undefined', () => {
      expect(safeCalculate(100)).toBe(100)
    })

    it('returns original value when calculation is empty string', () => {
      expect(safeCalculate(100, '')).toBe(100)
    })
  })

  describe('with SafeCalculation object', () => {
    it('handles multiply operation', () => {
      expect(safeCalculate(10, { type: 'multiply', value: 2 })).toBe(20)
    })

    it('handles divide operation', () => {
      expect(safeCalculate(100, { type: 'divide', value: 4 })).toBe(25)
    })

    it('handles divide by zero gracefully', () => {
      expect(safeCalculate(100, { type: 'divide', value: 0 })).toBe(100)
    })

    it('handles add operation', () => {
      expect(safeCalculate(10, { type: 'add', value: 5 })).toBe(15)
    })

    it('handles subtract operation', () => {
      expect(safeCalculate(10, { type: 'subtract', value: 3 })).toBe(7)
    })

    it('handles percentage operation', () => {
      expect(safeCalculate(25, { type: 'percentage', value: 100 })).toBe(25)
    })

    it('handles round operation', () => {
      expect(safeCalculate(3.456, { type: 'round', value: 100 })).toBe(3.46)
    })

    it('handles abs operation', () => {
      expect(safeCalculate(-10, { type: 'abs' })).toBe(10)
    })

    it('handles none operation', () => {
      expect(safeCalculate(100, { type: 'none' })).toBe(100)
    })
  })

  describe('with legacy string expressions', () => {
    it('parses "value * N"', () => {
      expect(safeCalculate(10, 'value * 2')).toBe(20)
      expect(safeCalculate(10, 'value * 2.5')).toBe(25)
    })

    it('parses "* N" shorthand', () => {
      expect(safeCalculate(10, '* 3')).toBe(30)
    })

    it('parses "value / N"', () => {
      expect(safeCalculate(100, 'value / 4')).toBe(25)
      expect(safeCalculate(100, 'value / 2.5')).toBe(40)
    })

    it('parses "/ N" shorthand', () => {
      expect(safeCalculate(100, '/ 5')).toBe(20)
    })

    it('handles divide by zero in string format', () => {
      expect(safeCalculate(100, 'value / 0')).toBe(100)
    })

    it('parses "value + N"', () => {
      expect(safeCalculate(10, 'value + 5')).toBe(15)
      expect(safeCalculate(10, 'value + 2.5')).toBe(12.5)
    })

    it('parses "+ N" shorthand', () => {
      expect(safeCalculate(10, '+ 7')).toBe(17)
    })

    it('parses "value - N"', () => {
      expect(safeCalculate(10, 'value - 3')).toBe(7)
      expect(safeCalculate(10, 'value - 2.5')).toBe(7.5)
    })

    it('parses "- N" shorthand', () => {
      expect(safeCalculate(10, '- 4')).toBe(6)
    })

    it('handles negative numbers', () => {
      expect(safeCalculate(10, 'value * -2')).toBe(-20)
      expect(safeCalculate(10, 'value + -5')).toBe(5)
    })

    it('returns original value for unrecognized expressions', () => {
      expect(safeCalculate(100, 'Math.sqrt(value)')).toBe(100)
      expect(safeCalculate(100, 'value ** 2')).toBe(100)
      expect(safeCalculate(100, 'random expression')).toBe(100)
    })

    it('handles whitespace variations', () => {
      expect(safeCalculate(10, 'value*2')).toBe(20)
      expect(safeCalculate(10, 'value  *  2')).toBe(20)
      expect(safeCalculate(10, '  value * 2  ')).toBe(20)
    })
  })

  describe('edge cases', () => {
    it('handles zero input', () => {
      expect(safeCalculate(0, 'value * 2')).toBe(0)
      expect(safeCalculate(0, 'value + 5')).toBe(5)
    })

    it('handles negative input', () => {
      expect(safeCalculate(-10, 'value * 2')).toBe(-20)
    })

    it('handles decimal input', () => {
      expect(safeCalculate(3.14, 'value * 2')).toBeCloseTo(6.28)
    })

    it('handles very large numbers', () => {
      expect(safeCalculate(1000000, 'value / 1000')).toBe(1000)
    })
  })
})
