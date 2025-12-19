<template>
  <div
    class="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4"
  >
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">회원가입</h1>
        <p class="text-gray-600 mt-2">ZIP-Chack 회원이 되어보세요</p>
      </div>

      <form @submit.prevent="handleRegister" class="card p-8 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >닉네임</label
          >
          <input
            v-model="nickname"
            type="text"
            placeholder="닉네임"
            class="input"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >이메일</label
          >
          <input
            v-model="email"
            type="email"
            placeholder="이메일 주소"
            class="input"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >비밀번호</label
          >
          <input
            v-model="password"
            type="password"
            placeholder="비밀번호 (8자 이상, 영문/숫자 포함)"
            class="input"
            :class="{ 'border-red-500': passwordError }"
            required
            @blur="validatePassword"
            @input="clearPasswordError"
          />
          <p v-if="passwordError" class="mt-1 text-sm text-red-600">
            {{ passwordError }}
          </p>
          <p
            v-else-if="password && !isPasswordValid"
            class="mt-1 text-sm text-gray-500"
          >
            비밀번호는 8자 이상이며 영문과 숫자를 포함해야 합니다
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >비밀번호 확인</label
          >
          <input
            v-model="passwordConfirm"
            type="password"
            placeholder="비밀번호 확인"
            class="input"
            :class="{ 'border-red-500': passwordConfirmError }"
            required
            @blur="validatePasswordConfirm"
            @input="clearPasswordConfirmError"
          />
          <p v-if="passwordConfirmError" class="mt-1 text-sm text-red-600">
            {{ passwordConfirmError }}
          </p>
        </div>

        <button type="submit" class="btn-primary w-full">회원가입</button>

        <p class="text-center text-sm text-gray-600">
          이미 계정이 있으신가요?
          <router-link
            to="/login"
            class="text-primary-500 hover:text-primary-600 font-medium"
          >
            로그인
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export default {
  name: "RegisterPage",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const nickname = ref("");
    const email = ref("");
    const password = ref("");
    const passwordConfirm = ref("");
    const passwordError = ref("");
    const passwordConfirmError = ref("");
    const error = ref(null);

    // 비밀번호 조건 만족 여부 확인
    const isPasswordValid = computed(() => {
      if (!password.value) return false;
      if (password.value.length < 8) return false;
      const hasLetter = /[a-zA-Z]/.test(password.value);
      const hasNumber = /[0-9]/.test(password.value);
      return hasLetter && hasNumber;
    });

    function validatePassword() {
      passwordError.value = "";

      if (!password.value) {
        return;
      }

      if (password.value.length < 8) {
        passwordError.value = "비밀번호는 8자 이상이어야 합니다";
        return;
      }

      const hasLetter = /[a-zA-Z]/.test(password.value);
      const hasNumber = /[0-9]/.test(password.value);

      if (!hasLetter || !hasNumber) {
        passwordError.value = "비밀번호는 영문과 숫자를 포함해야 합니다";
        return;
      }
    }

    function validatePasswordConfirm() {
      passwordConfirmError.value = "";

      if (!passwordConfirm.value) {
        return;
      }

      if (password.value !== passwordConfirm.value) {
        passwordConfirmError.value = "비밀번호가 일치하지 않습니다";
        return;
      }
    }

    function clearPasswordError() {
      if (passwordError.value) {
        passwordError.value = "";
      }
    }

    function clearPasswordConfirmError() {
      if (passwordConfirmError.value) {
        passwordConfirmError.value = "";
      }
      // 비밀번호가 변경되면 확인도 다시 검증
      if (passwordConfirm.value) {
        validatePasswordConfirm();
      }
    }

    async function handleRegister() {
      // 에러 초기화
      error.value = null;

      // 비밀번호 조건 검사
      validatePassword();
      validatePasswordConfirm();

      if (passwordError.value || passwordConfirmError.value) {
        return;
      }

      if (password.value !== passwordConfirm.value) {
        passwordConfirmError.value = "비밀번호가 일치하지 않습니다";
        return;
      }

      // 회원가입 요청
      const result = await authStore.register(
        email.value,
        password.value,
        nickname.value
      );

      if (result.success) {
        router.push("/");
      } else {
        alert(result.error || "회원가입에 실패했습니다.");
        error.value = result.error;
      }
    }

    return {
      nickname,
      email,
      password,
      passwordConfirm,
      passwordError,
      passwordConfirmError,
      error,
      isPasswordValid,
      handleRegister,
      validatePassword,
      validatePasswordConfirm,
      clearPasswordError,
      clearPasswordConfirmError,
    };
  },
};
</script>
