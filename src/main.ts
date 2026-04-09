import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@fontsource-variable/inter'
import './styles/tailwind.css'
import './style.css'
import './styles/colors.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
