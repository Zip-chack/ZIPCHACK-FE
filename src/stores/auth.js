import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { authAPI } from "@/utils/api"

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const isLoggedIn = computed(() => !!user.value)
  const token = computed(() => localStorage.getItem("token"))

  // 초기화 시 토큰이 있으면 사용자 정보 가져오기
  async function init() {
    const storedToken = localStorage.getItem("token");
    if (storedToken && !user.value) { // Avoid re-fetching if user is already loaded
      try {
        const response = await authAPI.getCurrentUser();
        user.value = response.data;
      } catch (err) {
        localStorage.removeItem("token");
        user.value = null;
      }
    }
    return user.value;
  }

  async function login(email, password) {
    isLoading.value = true
    error.value = null
    try {
      const response = await authAPI.login(email, password)
      const { token, user: userData } = response.data
      
      if (token) {
        localStorage.setItem("token", token)
      }
      user.value = userData
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || "로그인에 실패했습니다."
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await authAPI.logout()
    } catch (err) {
      console.error("로그아웃 에러:", err)
    } finally {
      user.value = null
      localStorage.removeItem("token")
    }
  }

  async function register(email, password, nickname) {
    isLoading.value = true
    error.value = null
    try {
      const response = await authAPI.register({ email, password, nickname })
      const { token, user: userData } = response.data
      
      if (token) {
        localStorage.setItem("token", token)
      }
      user.value = userData
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || "회원가입에 실패했습니다."
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isLoading,
    error,
    isLoggedIn,
    token,
    init,
    login,
    logout,
    register,
  }
})
