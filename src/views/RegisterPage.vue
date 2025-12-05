<template>
  <div class="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">회원가입</h1>
        <p class="text-gray-600 mt-2">ZIP-Chack 회원이 되어보세요</p>
      </div>

      <form @submit.prevent="handleRegister" class="card p-8 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">닉네임</label>
          <input
            v-model="nickname"
            type="text"
            placeholder="닉네임"
            class="input"
            required
          />
        </div>

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
            placeholder="비밀번호 (8자 이상)"
            class="input"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
          <input
            v-model="passwordConfirm"
            type="password"
            placeholder="비밀번호 확인"
            class="input"
            required
          />
        </div>

        <button type="submit" class="btn-primary w-full">
          회원가입
        </button>

        <p class="text-center text-sm text-gray-600">
          이미 계정이 있으신가요?
          <router-link to="/login" class="text-primary-500 hover:text-primary-600 font-medium">
            로그인
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
  name: 'RegisterPage',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const nickname = ref('')
    const email = ref('')
    const password = ref('')
    const passwordConfirm = ref('')

    function handleRegister() {
      if (password.value !== passwordConfirm.value) {
        alert('비밀번호가 일치하지 않습니다')
        return
      }
      authStore.register(email.value, password.value, nickname.value)
      router.push('/')
    }

    return {
      nickname,
      email,
      password,
      passwordConfirm,
      handleRegister
    }
  }
}
</script>
