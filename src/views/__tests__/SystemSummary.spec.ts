import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SystemSummaryView from '../SystemSummaryView.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

describe('SystemSummaryView', () => {
  it('renders frequency and load charts', () => {
    const wrapper = mount(SystemSummaryView, {
      global: {
        plugins: [vuetify]
      }
    })

    expect(wrapper.text()).toContain('Grid Frequency (Hz)')
    expect(wrapper.text()).toContain('System Load (MW)')
  })
})
