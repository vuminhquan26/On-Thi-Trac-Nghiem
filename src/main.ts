// src/main.ts
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // Nhúng router

const app = createApp(App)

app.use(router) // Kích hoạt router
app.mount('#app')