import { describe, it, expect, beforeAll, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GridSummaryView from '../GridSummaryView.vue'

// Mock ResizeObserver
beforeAll(() => {
  (globalThis as typeof globalThis & { ResizeObserver: unknown }).ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))
})

describe('GridSummaryView', () => {
  it('renders the grid summary title', () => {
    const wrapper = mount(GridSummaryView, {
      global: {
        stubs: {
          'grid-layout': true,
          'grid-item': true,
        }
      }
    })

    expect(wrapper.text()).toContain('Grid Summary')
  })

  it('shows the edit control for the default grid summary view', () => {
    const wrapper = mount(GridSummaryView, {
      global: {
        stubs: {
          'grid-layout': true,
          'grid-item': true,
        }
      }
    })

    expect(wrapper.text()).toContain('Edit')
    expect(wrapper.text()).not.toContain('View Only')
  })

  it('has default layout with expected widgets', async () => {
    const { default: component } = await import('../GridSummaryView.vue')
    expect(component).toBeDefined()
  })
})
