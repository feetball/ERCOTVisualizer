import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TimeSelector from '../common/TimeSelector.vue'

describe('TimeSelector', () => {
  it('renders properly', () => {
    const wrapper = mount(TimeSelector)
    expect(wrapper.text()).toContain('Last 1 Hour')
  })
})
