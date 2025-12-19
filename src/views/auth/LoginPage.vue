<template>
  <div class="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">로그인</h1>
        <p class="text-gray-600 mt-2">ZIP-Chack에 오신 것을 환영합니다</p>
      </div>

      <form @submit.prevent="handleLogin" class="card p-8 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
          <input
            v-model="email"
            type="email"
            placeholder="이메일 주소"
            class="input"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
          <input
            v-model="password"
            type="password"
            placeholder="비밀번호"
            class="input"
            required
          />
        </div>

        <button type="submit" class="btn-primary w-full">
          로그인
        </button>

        <p class="text-center text-sm text-gray-600">
          계정이 없으신가요?
          <router-link to="/register" class="text-primary-500 hover:text-primary-600 font-medium">
            회원가입
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const email = ref('')
    const password = ref('')
    const error = ref(null)

    async function handleLogin() {
      error.value = null;
      const result = await authStore.login(email.value, password.value)
      if (result.success) {
        router.push('/')
      } else {
        alert(result.error || '로그인에 실패했습니다.');
        error.value = result.error;
      }
    }

    return {
      email,
      password,
      error,
      handleLogin
    }
  }
}
</script>
