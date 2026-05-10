import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/theme.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('[LowCode Error]', err, info)
}

app.use(pinia)
app.use(ElementPlus)

app.mount('#app')
