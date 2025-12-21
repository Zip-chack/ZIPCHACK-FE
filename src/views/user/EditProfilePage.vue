<template>
  <div class="min-h-[calc(100vh-200px)] py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- 페이지 헤더 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">회원 정보 수정</h1>
        <p class="text-gray-600">닉네임과 비밀번호를 변경할 수 있습니다.</p>
      </div>

      <!-- 프로필 정보 섹션 -->
      <div class="card p-8 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-6">기본 정보</h2>
        <div class="space-y-6">
          <!-- 이메일 (읽기 전용) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              :value="authStore.user?.email"
              type="email"
              class="input bg-gray-50"
              disabled
            />
            <p class="mt-1 text-sm text-gray-500">
              이메일은 변경할 수 없습니다.
            </p>
          </div>

          <!-- 닉네임 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              닉네임
            </label>
            <input
              v-model="nickname"
              type="text"
              placeholder="닉네임"
              class="input"
              :class="{ 'border-red-500': nicknameError }"
            />
            <p v-if="nicknameError" class="mt-1 text-sm text-red-600">
              {{ nicknameError }}
            </p>
          </div>
        </div>
      </div>

      <!-- 비밀번호 변경 섹션 -->
      <div class="card p-8 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-6">비밀번호 변경</h2>
        <div class="space-y-6">
          <!-- 현재 비밀번호 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              현재 비밀번호
            </label>
            <input
              v-model="currentPassword"
              type="password"
              placeholder="현재 비밀번호"
              class="input"
              :class="{ 'border-red-500': passwordError }"
            />
          </div>

          <!-- 새 비밀번호 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              새 비밀번호
            </label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="새 비밀번호 (8자 이상, 영문/숫자 포함)"
              class="input"
              :class="{ 'border-red-500': passwordError }"
              @blur="validatePassword"
              @input="clearPasswordError"
            />
            <p v-if="passwordError" class="mt-1 text-sm text-red-600">
              {{ passwordError }}
            </p>
            <p
              v-else-if="newPassword && !isPasswordValid"
              class="mt-1 text-sm text-gray-500"
            >
              비밀번호는 8자 이상이며 영문과 숫자를 포함해야 합니다
            </p>
          </div>

          <!-- 새 비밀번호 확인 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              새 비밀번호 확인
            </label>
            <input
              v-model="newPasswordConfirm"
              type="password"
              placeholder="새 비밀번호 확인"
              class="input"
              :class="{ 'border-red-500': passwordConfirmError }"
              @blur="validatePasswordConfirm"
              @input="clearPasswordConfirmError"
            />
            <p v-if="passwordConfirmError" class="mt-1 text-sm text-red-600">
              {{ passwordConfirmError }}
            </p>
          </div>
        </div>
      </div>

      <!-- 버튼 -->
      <div class="flex gap-4">
        <button @click="handleCancel" class="btn-secondary flex-1">취소</button>
        <button
          @click="handleSubmit"
          :disabled="isSubmitting"
          class="btn-primary flex-1"
        >
          {{ isSubmitting ? "저장 중..." : "저장" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { authAPI } from "@/utils/api";

export default {
  name: "EditProfilePage",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const nickname = ref("");
    const currentPassword = ref("");
    const newPassword = ref("");
    const newPasswordConfirm = ref("");
    const nicknameError = ref("");
    const passwordError = ref("");
    const passwordConfirmError = ref("");
    const isSubmitting = ref(false);

    // 비밀번호 조건 만족 여부 확인
    const isPasswordValid = computed(() => {
      if (!newPassword.value) return false;
      if (newPassword.value.length < 8) return false;
      const hasLetter = /[a-zA-Z]/.test(newPassword.value);
      const hasNumber = /[0-9]/.test(newPassword.value);
      return hasLetter && hasNumber;
    });

    // 초기 데이터 로드
    onMounted(() => {
      if (!authStore.isLoggedIn) {
        router.push("/login");
        return;
      }
      nickname.value = authStore.user?.nickname || "";
    });

    function validatePassword() {
      passwordError.value = "";

      if (!newPassword.value) {
        return;
      }

      if (newPassword.value.length < 8) {
        passwordError.value = "비밀번호는 8자 이상이어야 합니다";
        return;
      }

      const hasLetter = /[a-zA-Z]/.test(newPassword.value);
      const hasNumber = /[0-9]/.test(newPassword.value);

      if (!hasLetter || !hasNumber) {
        passwordError.value = "비밀번호는 영문과 숫자를 포함해야 합니다";
        return;
      }
    }

    function validatePasswordConfirm() {
      passwordConfirmError.value = "";

      if (!newPasswordConfirm.value) {
        return;
      }

      if (newPassword.value !== newPasswordConfirm.value) {
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
      if (newPasswordConfirm.value) {
        validatePasswordConfirm();
      }
    }

    async function handleSubmit() {
      // 에러 초기화
      nicknameError.value = "";
      passwordError.value = "";
      passwordConfirmError.value = "";

      // 닉네임 검증
      if (!nickname.value || nickname.value.trim().length === 0) {
        nicknameError.value = "닉네임을 입력해주세요.";
        return;
      }

      // 비밀번호 변경 시 검증
      const isChangingPassword =
        newPassword.value && newPassword.value.trim().length > 0;

      if (isChangingPassword) {
        validatePassword();
        validatePasswordConfirm();

        if (passwordError.value || passwordConfirmError.value) {
          return;
        }

        if (newPassword.value !== newPasswordConfirm.value) {
          passwordConfirmError.value = "비밀번호가 일치하지 않습니다";
          return;
        }

        if (!currentPassword.value) {
          passwordError.value = "현재 비밀번호를 입력해주세요.";
          return;
        }
      }

      isSubmitting.value = true;

      try {
        const updateData = {
          nickname: nickname.value.trim(),
        };

        if (isChangingPassword) {
          updateData.currentPassword = currentPassword.value;
          updateData.newPassword = newPassword.value.trim();
        }

        const result = await authStore.updateUser(updateData);

        if (result.success) {
          alert("회원 정보가 성공적으로 수정되었습니다.");
          router.push("/my-page");
        } else {
          alert(result.error || "회원 정보 수정에 실패했습니다.");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "회원 정보 수정에 실패했습니다.";
        alert(errorMessage);
      } finally {
        isSubmitting.value = false;
      }
    }

    function handleCancel() {
      router.push("/my-page");
    }

    return {
      authStore,
      nickname,
      currentPassword,
      newPassword,
      newPasswordConfirm,
      nicknameError,
      passwordError,
      passwordConfirmError,
      isPasswordValid,
      isSubmitting,
      validatePassword,
      validatePasswordConfirm,
      clearPasswordError,
      clearPasswordConfirmError,
      handleSubmit,
      handleCancel,
    };
  },
};
</script>
