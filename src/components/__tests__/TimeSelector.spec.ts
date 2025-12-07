import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TimeSelector from '../common/TimeSelector.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

describe('TimeSelector', () => {
  it('renders properly', () => {
    const wrapper = mount(TimeSelector, {
      global: {
        plugins: [vuetify]
      }
    })
    expect(wrapper.text()).toContain('Last 1 Hour')
  })
})
