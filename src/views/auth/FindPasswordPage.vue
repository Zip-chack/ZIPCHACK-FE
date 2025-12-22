<template>
  <div
    class="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4"
  >
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">비밀번호 찾기</h1>
        <p class="text-gray-600 mt-2">
          이메일로 인증 코드를 받아 비밀번호를 재설정하세요
        </p>
      </div>

      <form @submit.prevent="handleFindPassword" class="card p-8 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >이메일</label
          >
          <div class="flex gap-2">
            <input
              v-model="email"
              type="email"
              placeholder="이메일 주소"
              class="input flex-1"
              required
            />
            <button
              type="button"
              @click="sendVerificationCode"
              :disabled="!email || isSendingCode || codeSent"
              class="btn-secondary whitespace-nowrap px-4"
            >
              {{
                isSendingCode
                  ? "전송 중..."
                  : codeSent
                  ? "전송 완료"
                  : "인증 코드 전송"
              }}
            </button>
          </div>
          <p v-if="codeSent" class="mt-1 text-sm text-green-600">
            인증 코드가 이메일로 전송되었습니다.
          </p>
        </div>

        <div v-if="codeSent">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >인증 코드</label
          >
          <div class="flex gap-2">
            <input
              v-model="verificationCode"
              type="text"
              placeholder="인증 코드 6자리"
              class="input flex-1"
              maxlength="6"
            />
            <button
              type="button"
              @click="verifyCode"
              :disabled="!verificationCode || isVerifying || codeVerified"
              class="btn-secondary whitespace-nowrap px-4"
            >
              {{
                isVerifying
                  ? "확인 중..."
                  : codeVerified
                  ? "인증 완료"
                  : "인증 확인"
              }}
            </button>
          </div>
          <p v-if="verificationError" class="mt-1 text-sm text-red-600">
            {{ verificationError }}
          </p>
          <p v-if="codeVerified" class="mt-1 text-sm text-green-600">
            인증이 완료되었습니다. 새 비밀번호를 입력해주세요.
          </p>
        </div>

        <div v-if="codeVerified">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >새 비밀번호</label
          >
          <input
            v-model="newPassword"
            type="password"
            placeholder="비밀번호 (8자 이상, 영문/숫자 포함)"
            class="input"
            required
          />
        </div>

        <div v-if="codeVerified">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >새 비밀번호 확인</label
          >
          <input
            v-model="newPasswordConfirm"
            type="password"
            placeholder="비밀번호 확인"
            class="input"
            required
          />
          <p v-if="passwordMismatch" class="mt-1 text-sm text-red-600">
            비밀번호가 일치하지 않습니다.
          </p>
        </div>

        <div
          v-if="error"
          class="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>

        <div
          v-if="success"
          class="p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <p class="text-sm text-green-800 font-medium">
            비밀번호가 성공적으로 변경되었습니다.
          </p>
        </div>

        <button
          v-if="codeVerified"
          type="button"
          @click="handleResetPassword"
          :disabled="
            isResetting ||
            passwordMismatch ||
            !newPassword ||
            !newPasswordConfirm
          "
          class="btn-primary w-full"
        >
          {{ isResetting ? "변경 중..." : "비밀번호 변경" }}
        </button>

        <div class="text-center">
          <router-link
            to="/login"
            class="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            로그인으로 돌아가기
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { authAPI } from "@/utils/api";

export default {
  name: "FindPasswordPage",
  setup() {
    const router = useRouter();
    const email = ref("");
    const verificationCode = ref("");
    const newPassword = ref("");
    const newPasswordConfirm = ref("");
    const codeSent = ref(false);
    const codeVerified = ref(false);
    const isSendingCode = ref(false);
    const isVerifying = ref(false);
    const isResetting = ref(false);
    const error = ref("");
    const verificationError = ref("");
    const success = ref(false);

    const passwordMismatch = computed(() => {
      return (
        newPassword.value &&
        newPasswordConfirm.value &&
        newPassword.value !== newPasswordConfirm.value
      );
    });

    async function sendVerificationCode() {
      if (!email.value) {
        error.value = "이메일을 입력해주세요.";
        return;
      }

      isSendingCode.value = true;
      error.value = "";
      verificationError.value = "";

      try {
        const response = await authAPI.findPassword(email.value);
        codeSent.value = true;

        // 개발 모드에서 인증 코드가 응답에 포함된 경우
        if (response.data?.devCode) {
          console.log("========================================");
          console.log("비밀번호 재설정 인증 코드 (개발용):");
          console.log("이메일:", email.value);
          console.log("인증 코드:", response.data.devCode);
          console.log("========================================");
          alert(
            `개발 모드: 인증 코드는 ${response.data.devCode} 입니다. (콘솔에도 출력되었습니다)`
          );
        }
      } catch (err) {
        error.value =
          err.response?.data?.message || "인증 코드 전송에 실패했습니다.";
      } finally {
        isSendingCode.value = false;
      }
    }

    async function verifyCode() {
      if (!verificationCode.value || verificationCode.value.length !== 6) {
        verificationError.value = "인증 코드는 6자리입니다.";
        return;
      }

      isVerifying.value = true;
      verificationError.value = "";

      try {
        await authAPI.verifyPasswordResetCode(
          email.value,
          verificationCode.value
        );
        codeVerified.value = true;
      } catch (err) {
        verificationError.value =
          err.response?.data?.message || "인증 코드 확인에 실패했습니다.";
      } finally {
        isVerifying.value = false;
      }
    }

    async function handleResetPassword() {
      if (passwordMismatch.value) {
        error.value = "비밀번호가 일치하지 않습니다.";
        return;
      }

      if (!newPassword.value || newPassword.value.length < 8) {
        error.value = "비밀번호는 8자 이상이어야 합니다.";
        return;
      }

      const hasLetter = /[a-zA-Z]/.test(newPassword.value);
      const hasNumber = /[0-9]/.test(newPassword.value);
      if (!hasLetter || !hasNumber) {
        error.value = "비밀번호는 영문과 숫자를 포함해야 합니다.";
        return;
      }

      isResetting.value = true;
      error.value = "";

      try {
        await authAPI.resetPassword(
          email.value,
          verificationCode.value,
          newPassword.value
        );
        success.value = true;
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch (err) {
        error.value =
          err.response?.data?.message || "비밀번호 변경에 실패했습니다.";
      } finally {
        isResetting.value = false;
      }
    }

    return {
      email,
      verificationCode,
      newPassword,
      newPasswordConfirm,
      codeSent,
      codeVerified,
      isSendingCode,
      isVerifying,
      isResetting,
      error,
      verificationError,
      success,
      passwordMismatch,
      sendVerificationCode,
      verifyCode,
      handleResetPassword,
    };
  },
};
</script>
