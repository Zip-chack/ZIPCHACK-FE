<template>
  <div
    class="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4"
  >
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">비밀번호 찾기</h1>
        <p class="text-gray-600 mt-2">등록하신 이메일을 입력해주세요</p>
      </div>

      <form @submit.prevent="handleFindPassword" class="card p-8 space-y-6">
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
            :disabled="codeSent"
          />
        </div>

        <div v-if="codeSent" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >인증 코드</label
            >
            <div class="flex gap-2">
              <input
                v-model="verificationCode"
                type="text"
                placeholder="6자리 인증 코드"
                class="input flex-1"
                maxlength="6"
                required
              />
              <button
                type="button"
                @click="handleFindPassword"
                class="btn-secondary whitespace-nowrap"
                :disabled="isLoading"
              >
                재전송
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              인증 코드가 전송되었습니다. 이메일을 확인해주세요. (10분간 유효)
            </p>
          </div>

          <button
            type="button"
            @click="handleVerifyCode"
            class="btn-primary w-full"
            :disabled="
              isLoading || !verificationCode || verificationCode.length !== 6
            "
          >
            {{ isLoading ? "확인 중..." : "인증 확인" }}
          </button>
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
            인증이 완료되었습니다. 아래 버튼을 클릭하여 비밀번호를 재설정하세요.
          </p>
          <router-link
            :to="`/reset-password?email=${encodeURIComponent(
              email
            )}&code=${verificationCode}`"
            class="btn-primary w-full block text-center"
          >
            비밀번호 재설정하기
          </router-link>
        </div>

        <button
          v-if="!codeSent && !success"
          type="submit"
          class="btn-primary w-full"
          :disabled="isLoading"
        >
          {{ isLoading ? "전송 중..." : "인증 코드 전송" }}
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
import { ref } from "vue";
import { authAPI } from "@/utils/api";

export default {
  name: "FindPasswordPage",
  setup() {
    const email = ref("");
    const verificationCode = ref("");
    const codeSent = ref(false);
    const success = ref(false);
    const error = ref(null);
    const isLoading = ref(false);

    async function handleFindPassword() {
      error.value = null;
      isLoading.value = true;
      try {
        const response = await authAPI.findPassword(email.value);
        if (response.data.success) {
          codeSent.value = true;
          success.value = false;
        }
      } catch (err) {
        error.value = err.response?.data?.message || "오류가 발생했습니다.";
      } finally {
        isLoading.value = false;
      }
    }

    async function handleVerifyCode() {
      if (!verificationCode.value || verificationCode.value.length !== 6) {
        error.value = "인증 코드를 입력해주세요.";
        return;
      }

      error.value = null;
      isLoading.value = true;
      try {
        const response = await authAPI.verifyPasswordResetCode(
          email.value,
          verificationCode.value
        );
        if (response.data.success) {
          success.value = true;
        } else {
          error.value =
            response.data.message || "인증 코드가 일치하지 않습니다.";
        }
      } catch (err) {
        error.value = err.response?.data?.message || "오류가 발생했습니다.";
      } finally {
        isLoading.value = false;
      }
    }

    return {
      email,
      verificationCode,
      codeSent,
      success,
      error,
      isLoading,
      handleFindPassword,
      handleVerifyCode,
    };
  },
};
</script>
