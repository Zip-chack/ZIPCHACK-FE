import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authAPI } from "@/utils/api";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  const isLoggedIn = computed(() => !!user.value);
  const token = computed(() => localStorage.getItem("token"));

  // 초기화 시 토큰이 있으면 사용자 정보 가져오기
  async function init() {
    const storedToken = localStorage.getItem("token");
    if (storedToken && !user.value) {
      // Avoid re-fetching if user is already loaded
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
    isLoading.value = true;
    error.value = null;
    try {
      // 로그인 전 이전 채팅 연결 완전히 리셋 (다른 사용자로 로그인하는 경우 대비)
      try {
        const { useChatStore } = await import("./chat");
        const chatStore = useChatStore();
        chatStore.reset(); // 완전히 리셋
      } catch (chatErr) {
        console.warn("채팅 연결 정리 중 오류:", chatErr);
      }

      const response = await authAPI.login(email, password);
      const { token, user: userData } = response.data;

      if (token) {
        localStorage.setItem("token", token);
      }
      user.value = userData;
      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || "로그인에 실패했습니다.";
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    try {
      // 채팅 스토어의 연결 정리 (순환 참조 방지를 위해 동적 import)
      try {
        const { useChatStore } = await import("./chat");
        const chatStore = useChatStore();
        if (chatStore.stompClient) {
          chatStore.disconnect();
        }
      } catch (chatErr) {
        console.warn("채팅 연결 정리 중 오류:", chatErr);
      }

      await authAPI.logout();
    } catch (err) {
      console.error("로그아웃 에러:", err);
    } finally {
      user.value = null;
      localStorage.removeItem("token");
    }
  }

  async function register(email, password, nickname) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authAPI.register({ email, password, nickname });
      const { token, user: userData } = response.data;

      if (token) {
        localStorage.setItem("token", token);
      }
      user.value = userData;
      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || "회원가입에 실패했습니다.";
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
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
  };
});
