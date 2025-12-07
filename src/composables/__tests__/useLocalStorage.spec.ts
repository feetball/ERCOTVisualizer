import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLocalStorage } from '../useLocalStorage'
import { nextTick } from 'vue'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} })
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('returns default value when nothing stored', () => {
      const data = useLocalStorage('test-key', { name: 'default' })
      
      expect(data.value).toEqual({ name: 'default' })
    })

    it('returns stored value when available', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ name: 'stored' }))
      
      const data = useLocalStorage('test-key', { name: 'default' })
      
      expect(data.value).toEqual({ name: 'stored' })
    })

    it('returns default value on invalid JSON', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid {{{')
      
      const data = useLocalStorage('test-key', { name: 'default' })
      
      expect(data.value).toEqual({ name: 'default' })
    })
  })

  describe('persistence', () => {
    it('persists changes to localStorage', async () => {
      const data = useLocalStorage('test-key', { count: 0 })
      
      data.value = { count: 5 }
      await nextTick()
      
      // Wait for watch to trigger
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify({ count: 5 })
      )
    })

    it('persists nested object changes', async () => {
      const data = useLocalStorage('test-key', { nested: { value: 1 } })
      
      data.value.nested.value = 2
      await nextTick()
      
      // Wait for deep watch to trigger
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('array support', () => {
    it('handles arrays correctly', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([1, 2, 3]))
      
      const data = useLocalStorage<number[]>('test-array', [])
      
      expect(data.value).toEqual([1, 2, 3])
    })

    it('persists array mutations', async () => {
      const data = useLocalStorage<number[]>('test-array', [1, 2])
      
      data.value.push(3)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('primitive values', () => {
    it('handles string values', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify('hello'))
      
      const data = useLocalStorage('test-string', '')
      
      expect(data.value).toBe('hello')
    })

    it('handles number values', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(42))
      
      const data = useLocalStorage('test-number', 0)
      
      expect(data.value).toBe(42)
    })

    it('handles boolean values', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(true))
      
      const data = useLocalStorage('test-bool', false)
      
      expect(data.value).toBe(true)
    })
  })

  describe('error handling', () => {
    it('handles localStorage.setItem errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded')
      })
      
      const data = useLocalStorage('test-key', { value: 1 })
      data.value = { value: 2 }
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // Should not throw, error should be caught
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})
