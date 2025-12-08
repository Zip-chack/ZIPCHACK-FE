import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import router from "./router"
import "./assets/css/main.css"
import { useAuthStore } from "@/stores/auth"

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 앱 마운트 전에 인증 상태 복원
const authStore = useAuthStore()
authStore.init().then(() => {
  app.mount("#app")
})
