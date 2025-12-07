import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGridLayout } from '../useGridLayout'
import type { LayoutItem } from '@/types/widget'

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

describe('useGridLayout', () => {
  const storageKey = 'test-layout'
  const defaultLayout: LayoutItem[] = [
    {
      i: 'widget-1',
      x: 0,
      y: 0,
      w: 6,
      h: 4,
      type: 'chart',
      title: 'Test Chart',
      config: { tag: 'TEST.TAG' }
    }
  ]

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('loadLayout', () => {
    it('loads default layout when nothing is saved', () => {
      const { layout, loadLayout } = useGridLayout(storageKey, defaultLayout)
      
      loadLayout()
      
      expect(layout.value).toHaveLength(1)
      expect(layout.value[0].title).toBe('Test Chart')
    })

    it('loads saved layout from localStorage', () => {
      const savedLayout: LayoutItem[] = [
        { i: 'saved-1', x: 0, y: 0, w: 4, h: 4, type: 'gauge', title: 'Saved Widget', config: { tag: 'SAVED.TAG' } }
      ]
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedLayout))

      const { layout, loadLayout } = useGridLayout(storageKey, defaultLayout)
      loadLayout()

      expect(layout.value).toHaveLength(1)
      expect(layout.value[0].title).toBe('Saved Widget')
    })

    it('falls back to default layout on invalid JSON', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json {{{')

      const { layout, loadLayout } = useGridLayout(storageKey, defaultLayout)
      loadLayout()

      expect(layout.value).toHaveLength(1)
      expect(layout.value[0].title).toBe('Test Chart')
    })
  })

  describe('saveLayout', () => {
    it('saves layout to localStorage', () => {
      const { saveLayout, loadLayout } = useGridLayout(storageKey, defaultLayout)
      loadLayout()
      
      saveLayout()

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        storageKey,
        expect.any(String)
      )
    })
  })

  describe('resetLayout', () => {
    it('removes saved layout and resets to default', () => {
      const { layout, resetLayout, loadLayout } = useGridLayout(storageKey, defaultLayout)
      loadLayout()
      
      // Modify layout
      layout.value.push({
        i: 'new-widget',
        x: 0,
        y: 4,
        w: 6,
        h: 4,
        type: 'stat',
        title: 'New Widget',
        config: { tag: 'NEW.TAG' }
      })
      
      resetLayout()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(storageKey)
      expect(layout.value).toHaveLength(1)
      expect(layout.value[0].title).toBe('Test Chart')
    })
  })

  describe('toggleEditMode', () => {
    it('toggles edit mode on and off', () => {
      const { editMode, toggleEditMode } = useGridLayout(storageKey, defaultLayout)
      
      expect(editMode.value).toBe(false)
      
      toggleEditMode()
      expect(editMode.value).toBe(true)
      
      toggleEditMode()
      expect(editMode.value).toBe(false)
    })

    it('saves layout when exiting edit mode', () => {
      const { toggleEditMode, loadLayout } = useGridLayout(storageKey, defaultLayout)
      loadLayout()
      
      toggleEditMode() // Enter edit mode
      toggleEditMode() // Exit edit mode

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('addWidget', () => {
    it('opens config dialog with new widget template', () => {
      const { addWidget, showConfigDialog, editingWidget } = useGridLayout(storageKey, defaultLayout)
      
      addWidget('gauge')

      expect(showConfigDialog.value).toBe(true)
      expect(editingWidget.value).not.toBeNull()
      expect(editingWidget.value?.type).toBe('gauge')
      expect(editingWidget.value?.i).toBe('')
    })
  })

  describe('editWidget', () => {
    it('opens config dialog with existing widget', () => {
      const { editWidget, showConfigDialog, editingWidget, loadLayout } = useGridLayout(storageKey, defaultLayout)
      loadLayout()
      
      editWidget(defaultLayout[0])

      expect(showConfigDialog.value).toBe(true)
      expect(editingWidget.value?.title).toBe('Test Chart')
    })
  })

  describe('removeWidget', () => {
    it('removes widget from layout', () => {
      const { layout, removeWidget, loadLayout } = useGridLayout(storageKey, defaultLayout)
      loadLayout()
      
      expect(layout.value).toHaveLength(1)
      
      removeWidget('widget-1')
      
      expect(layout.value).toHaveLength(0)
    })

    it('does nothing if widget id not found', () => {
      const { layout, removeWidget, loadLayout } = useGridLayout(storageKey, defaultLayout)
      loadLayout()
      
      removeWidget('non-existent')
      
      expect(layout.value).toHaveLength(1)
    })
  })

  describe('handleWidgetSave', () => {
    it('adds new widget when not editing', () => {
      const { layout, handleWidgetSave, loadLayout, editingWidget } = useGridLayout(storageKey, defaultLayout)
      loadLayout()
      editingWidget.value = null
      
      handleWidgetSave({
        isEditing: false,
        type: 'stat',
        title: 'New Stat',
        config: { tag: 'NEW.TAG' },
        style: { valueColor: '#00ff00' }
      })

      expect(layout.value).toHaveLength(2)
      expect(layout.value[1].title).toBe('New Stat')
      expect(layout.value[1].type).toBe('stat')
    })

    it('updates existing widget when editing', () => {
      const { layout, handleWidgetSave, loadLayout, editingWidget } = useGridLayout(storageKey, defaultLayout)
      loadLayout()
      editingWidget.value = { ...defaultLayout[0] }
      
      handleWidgetSave({
        isEditing: true,
        type: 'chart',
        title: 'Updated Title',
        config: { tag: 'UPDATED.TAG' },
        style: {}
      })

      expect(layout.value).toHaveLength(1)
      expect(layout.value[0].title).toBe('Updated Title')
    })
  })

  describe('getCardStyle', () => {
    it('returns background color if set', () => {
      const { getCardStyle } = useGridLayout(storageKey, defaultLayout)
      
      const item: LayoutItem = {
        i: '1',
        x: 0,
        y: 0,
        w: 6,
        h: 4,
        type: 'chart',
        title: 'Test',
        config: { tag: 'TEST.TAG' },
        style: { backgroundColor: '#1e1e1e' }
      }
      
      const style = getCardStyle(item)
      expect(style.backgroundColor).toBe('#1e1e1e')
    })

    it('returns empty object if no style set', () => {
      const { getCardStyle } = useGridLayout(storageKey, defaultLayout)
      
      const item: LayoutItem = {
        i: '1',
        x: 0,
        y: 0,
        w: 6,
        h: 4,
        type: 'chart',
        title: 'Test',
        config: { tag: 'TEST.TAG' }
      }
      
      const style = getCardStyle(item)
      expect(style).toEqual({})
    })
  })
})
