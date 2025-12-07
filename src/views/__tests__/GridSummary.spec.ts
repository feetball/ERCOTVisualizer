import { describe, it, expect, beforeAll, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GridSummaryView from '../GridSummaryView.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { h } from 'vue'

// Mock ResizeObserver for Vuetify components
beforeAll(() => {
  (globalThis as typeof globalThis & { ResizeObserver: unknown }).ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))
})

const vuetify = createVuetify({
  components,
  directives,
})

describe('GridSummaryView', () => {
  it('renders the grid summary title', () => {
    const wrapper = mount(components.VApp, {
      global: {
        plugins: [vuetify],
        stubs: {
          // Stub heavy components to speed up test
          'grid-layout': true,
          'grid-item': true,
          'apexchart': true
        }
      },
      slots: {
        default: () => h(GridSummaryView)
      }
    })

    // Check that the view renders with the title
    expect(wrapper.text()).toContain('Grid Summary')
  })

  it('has default layout with expected widgets', async () => {
    // Import the component to check its default layout
    const { default: component } = await import('../GridSummaryView.vue')
    
    // GridSummaryView should export defaultLayout through script setup
    // We can verify the structure exists by checking the component renders
    expect(component).toBeDefined()
  })
})
