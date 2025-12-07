import { createApp } from 'vue'
import { createPinia } from 'pinia'
import type { Plugin } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import VueApexCharts from 'vue3-apexcharts'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(VueApexCharts as unknown as Plugin)

app.mount('#app')
