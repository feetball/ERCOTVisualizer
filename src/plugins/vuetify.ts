import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

// ERCOT Brand Colors
// Primary: Navy Blue #00529B
// Secondary: Teal/Cyan #00A3E0
// Accent: Electric Blue #0066CC
// Success: Grid Green #00C853
// Warning: Caution Amber #FFB300
// Error: Alert Red #D50000

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          background: '#0d1117',
          surface: '#161b22',
          'surface-bright': '#21262d',
          'surface-variant': '#1c2128',
          'on-surface-variant': '#b8c5d6',
          primary: '#58a6ff',
          'primary-darken-1': '#388bfd',
          secondary: '#3fb950',
          'secondary-darken-1': '#2ea043',
          accent: '#00E5FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#00E676',
          warning: '#FFB300',
          'on-background': '#e8f4fd',
          'on-surface': '#e8f4fd',
          'on-primary': '#ffffff',
          'on-secondary': '#ffffff',
        },
        variables: {
          'border-color': '#1e4976',
          'border-opacity': 0.3,
          'high-emphasis-opacity': 0.95,
          'medium-emphasis-opacity': 0.7,
          'disabled-opacity': 0.4,
          'hover-opacity': 0.08,
          'focus-opacity': 0.12,
          'activated-opacity': 0.15,
          'pressed-opacity': 0.16,
        },
      },
      light: {
        dark: false,
        colors: {
          background: '#f0f7ff',
          surface: '#ffffff',
          'surface-bright': '#ffffff',
          'surface-variant': '#e3f2fd',
          'on-surface-variant': '#37474f',
          primary: '#00529B',
          'primary-darken-1': '#003d73',
          secondary: '#00796B',
          'secondary-darken-1': '#004d40',
          accent: '#0066CC',
          error: '#D50000',
          info: '#0288D1',
          success: '#00C853',
          warning: '#FF8F00',
          'on-background': '#1a1a1a',
          'on-surface': '#1a1a1a',
          'on-primary': '#ffffff',
          'on-secondary': '#ffffff',
        },
        variables: {
          'border-color': '#90caf9',
          'border-opacity': 0.4,
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})
