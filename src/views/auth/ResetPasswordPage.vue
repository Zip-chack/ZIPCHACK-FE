<template>
  <div
    class="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4"
  >
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">비밀번호 재설정</h1>
        <p class="text-gray-600 mt-2">새로운 비밀번호를 입력해주세요</p>
      </div>

      <form @submit.prevent="handleResetPassword" class="card p-8 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >새 비밀번호</label
          >
          <input
            v-model="newPassword"
            type="password"
            placeholder="8자 이상, 영문과 숫자 포함"
            class="input"
            required
            minlength="8"
          />
          <p class="text-xs text-gray-500 mt-1">
            8자 이상, 영문과 숫자를 포함해야 합니다.
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >새 비밀번호 확인</label
          >
          <input
            v-model="newPasswordConfirm"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            class="input"
            required
          />
        </div>

        <div
          v-if="passwordMismatch"
          class="p-3 rounded-lg bg-red-50 border border-red-200"
        >
          <p class="text-red-800 text-sm">비밀번호가 일치하지 않습니다.</p>
        </div>

        <div
          v-if="error"
          class="p-4 rounded-lg bg-red-50 border border-red-200"
        >
          <p class="text-red-800">{{ error }}</p>
        </div>

        <div
          v-if="success"
          class="p-4 rounded-lg bg-green-50 border border-green-200"
        >
          <p class="text-green-800 mb-4">
            비밀번호가 성공적으로 변경되었습니다.
          </p>
          <router-link to="/login" class="btn-primary w-full block text-center">
            로그인하러 가기
          </router-link>
        </div>

        <button
          v-if="!success"
          type="submit"
          class="btn-primary w-full"
          :disabled="isLoading || passwordMismatch"
        >
          {{ isLoading ? "처리 중..." : "비밀번호 변경" }}
        </button>

        <p class="text-center text-sm text-gray-600">
          <router-link
            to="/login"
            class="text-primary-500 hover:text-primary-600 font-medium"
          >
            로그인으로 돌아가기
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authAPI } from "@/utils/api";

export default {
  name: "ResetPasswordPage",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const token = ref(route.query.token || "");
    const newPassword = ref("");
    const newPasswordConfirm = ref("");
    const error = ref(null);
    const success = ref(false);
    const isLoading = ref(false);

    const passwordMismatch = computed(() => {
      return (
        newPassword.value &&
        newPasswordConfirm.value &&
        newPassword.value !== newPasswordConfirm.value
      );
    });

    async function handleResetPassword() {
      if (!token.value) {
        error.value = "유효하지 않은 토큰입니다.";
        return;
      }

      if (passwordMismatch.value) {
        error.value = "비밀번호가 일치하지 않습니다.";
        return;
      }

      if (newPassword.value.length < 8) {
        error.value = "비밀번호는 8자 이상이어야 합니다.";
        return;
      }

      if (
        !newPassword.value.match(/.*[a-zA-Z].*/) ||
        !newPassword.value.match(/.*[0-9].*/)
      ) {
        error.value = "비밀번호는 영문과 숫자를 포함해야 합니다.";
        return;
      }

      error.value = null;
      isLoading.value = true;
      try {
        await authAPI.resetPassword(token.value, newPassword.value);
        success.value = true;
      } catch (err) {
        error.value = err.response?.data?.message || "오류가 발생했습니다.";
      } finally {
        isLoading.value = false;
      }
    }

    return {
      token,
      newPassword,
      newPasswordConfirm,
      error,
      success,
      isLoading,
      passwordMismatch,
      handleResetPassword,
    };
  },
};
</script>
