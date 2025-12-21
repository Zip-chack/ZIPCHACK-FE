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
            >실제 이름</label
          >
          <input
            v-model="name"
            type="text"
            placeholder="실제 이름 (비밀번호 찾기 시 사용)"
            class="input"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >아이디</label
          >
          <div class="flex gap-2">
            <input
              v-model="username"
              type="text"
              placeholder="아이디"
              class="input flex-1"
              :class="{ 'border-red-500': usernameError }"
              required
              @input="clearUsernameError"
            />
            <button
              type="button"
              @click="checkUsernameDuplicate"
              :disabled="!username || isCheckingUsername"
              class="btn-secondary whitespace-nowrap px-4"
            >
              {{ isCheckingUsername ? "확인 중..." : "중복 확인" }}
            </button>
          </div>
          <p v-if="usernameError" class="mt-1 text-sm text-red-600">
            {{ usernameError }}
          </p>
          <p
            v-else-if="usernameChecked && !usernameError && username"
            class="mt-1 text-sm text-green-600"
          >
            사용 가능한 아이디입니다.
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >이메일</label
          >
          <div class="flex gap-2 mb-2">
            <input
              v-model="email"
              type="email"
              placeholder="이메일 주소"
              class="input flex-1"
              :class="{ 'border-red-500': emailError }"
              required
              @input="clearEmailError"
              :disabled="emailVerified"
            />
            <button
              type="button"
              @click="sendVerificationCode"
              :disabled="!email || isSendingCode || emailVerified"
              class="btn-secondary whitespace-nowrap px-4"
            >
              {{ isSendingCode ? "전송 중..." : "인증 코드 전송" }}
            </button>
          </div>
          <p v-if="emailError" class="mt-1 text-sm text-red-600">
            {{ emailError }}
          </p>
          <p v-else-if="emailVerified" class="mt-1 text-sm text-green-600">
            이메일 인증이 완료되었습니다.
          </p>
        </div>

        <!-- 인증 코드 입력 섹션 -->
        <div v-if="codeSent && !emailVerified">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >인증 코드</label
          >
          <div class="flex gap-2">
            <input
              v-model="verificationCode"
              type="text"
              placeholder="6자리 인증 코드"
              class="input flex-1"
              :class="{ 'border-red-500': codeError }"
              maxlength="6"
              @input="clearCodeError"
            />
            <button
              type="button"
              @click="verifyEmailCode"
              :disabled="!verificationCode || isVerifyingCode"
              class="btn-secondary whitespace-nowrap px-4"
            >
              {{ isVerifyingCode ? "확인 중..." : "인증 확인" }}
            </button>
          </div>
          <p v-if="codeError" class="mt-1 text-sm text-red-600">
            {{ codeError }}
          </p>
          <p
            v-if="codeSent && !emailVerified"
            class="mt-1 text-xs text-gray-500"
          >
            인증 코드가 전송되었습니다. 이메일을 확인해주세요. (10분간 유효)
          </p>
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

        <button
          type="submit"
          class="btn-primary w-full"
          :disabled="!emailVerified"
        >
          회원가입
        </button>
        <p v-if="!emailVerified" class="text-center text-sm text-red-600">
          이메일 인증을 완료해주세요.
        </p>

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
import { authAPI } from "@/utils/api";

export default {
  name: "RegisterPage",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const name = ref("");
    const username = ref("");
    const email = ref("");
    const password = ref("");
    const passwordConfirm = ref("");
    const passwordError = ref("");
    const passwordConfirmError = ref("");
    const emailError = ref("");
    const usernameError = ref("");
    const error = ref(null);
    const isCheckingEmail = ref(false);
    const emailChecked = ref(false);
    const isCheckingUsername = ref(false);
    const usernameChecked = ref(false);
    const codeSent = ref(false);
    const verificationCode = ref("");
    const codeError = ref("");
    const isSendingCode = ref(false);
    const isVerifyingCode = ref(false);
    const emailVerified = ref(false);

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

    function clearEmailError() {
      if (emailError.value) {
        emailError.value = "";
      }
      emailChecked.value = false;
      codeSent.value = false;
      emailVerified.value = false;
      verificationCode.value = "";
    }

    function clearUsernameError() {
      if (usernameError.value) {
        usernameError.value = "";
      }
      usernameChecked.value = false;
    }

    async function checkUsernameDuplicate() {
      if (!username.value) {
        usernameError.value = "아이디를 입력해주세요.";
        return;
      }

      // 아이디 형식 검증 (영문, 숫자, 언더스코어만 허용, 3-20자)
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username.value)) {
        usernameError.value =
          "아이디는 3-20자의 영문, 숫자, 언더스코어만 사용 가능합니다.";
        usernameChecked.value = false;
        return;
      }

      isCheckingUsername.value = true;
      usernameError.value = "";
      usernameChecked.value = false;

      try {
        const response = await authAPI.checkUsername(username.value);

        if (response.data.exists) {
          usernameError.value = "이미 사용 중인 아이디입니다.";
          usernameChecked.value = false;
        } else {
          usernameError.value = "";
          usernameChecked.value = true;
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "";

        if (
          errorMessage.includes("이미 존재하는") ||
          errorMessage.includes("이미 사용 중인") ||
          errorMessage.includes("존재하는")
        ) {
          usernameError.value = "이미 사용 중인 아이디입니다.";
          usernameChecked.value = false;
        } else {
          usernameError.value =
            errorMessage || "아이디 확인 중 오류가 발생했습니다.";
          usernameChecked.value = false;
        }
      } finally {
        isCheckingUsername.value = false;
      }
    }

    function clearCodeError() {
      if (codeError.value) {
        codeError.value = "";
      }
    }

    async function sendVerificationCode() {
      if (!email.value) {
        emailError.value = "이메일을 입력해주세요.";
        return;
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.value)) {
        emailError.value = "올바른 이메일 형식이 아닙니다.";
        return;
      }

      isSendingCode.value = true;
      emailError.value = "";
      codeError.value = "";
      codeSent.value = false;

      try {
        const response = await authAPI.sendVerificationCode(email.value);
        if (response.data.success) {
          codeSent.value = true;
          emailError.value = "";
        } else {
          emailError.value =
            response.data.message || "인증 코드 전송에 실패했습니다.";
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "인증 코드 전송 중 오류가 발생했습니다.";
        emailError.value = errorMessage;
      } finally {
        isSendingCode.value = false;
      }
    }

    async function verifyEmailCode() {
      if (!verificationCode.value || verificationCode.value.length !== 6) {
        codeError.value = "6자리 인증 코드를 입력해주세요.";
        return;
      }

      isVerifyingCode.value = true;
      codeError.value = "";

      try {
        const response = await authAPI.verifyEmail(
          email.value,
          verificationCode.value
        );
        if (response.data.success) {
          emailVerified.value = true;
          codeError.value = "";
          emailError.value = "";
        } else {
          codeError.value =
            response.data.message || "인증 코드 확인에 실패했습니다.";
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "인증 코드 확인 중 오류가 발생했습니다.";
        codeError.value = errorMessage;
      } finally {
        isVerifyingCode.value = false;
      }
    }

    async function checkEmailDuplicate() {
      if (!email.value) {
        emailError.value = "이메일을 입력해주세요.";
        return;
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.value)) {
        emailError.value = "올바른 이메일 형식이 아닙니다.";
        emailChecked.value = false;
        return;
      }

      isCheckingEmail.value = true;
      emailError.value = "";
      emailChecked.value = false;

      try {
        const { useAuthStore } = await import("@/stores/auth");
        const authStore = useAuthStore();
        const response = await authStore.checkEmail(email.value);

        if (response.exists) {
          emailError.value = "이미 사용 중인 이메일입니다.";
          emailChecked.value = false;
        } else {
          emailError.value = "";
          emailChecked.value = true;
        }
      } catch (err) {
        // 에러 응답에서 중복 여부 확인
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "";

        // "이미 존재하는 이메일" 또는 "이미 사용 중인 이메일" 문구가 있으면 중복으로 처리
        if (
          errorMessage.includes("이미 존재하는 이메일") ||
          errorMessage.includes("이미 사용 중인 이메일") ||
          errorMessage.includes("존재하는 이메일")
        ) {
          emailError.value = "이미 사용 중인 이메일입니다.";
          emailChecked.value = false;
        } else {
          // 실제 서버 오류인 경우에만 오류 메시지 표시
          emailError.value =
            errorMessage || "이메일 확인 중 오류가 발생했습니다.";
          emailChecked.value = false;
        }
      } finally {
        isCheckingEmail.value = false;
      }
    }

    async function handleRegister() {
      // 에러 초기화
      error.value = null;

      // 이메일 인증 확인
      if (!emailVerified.value) {
        alert("이메일 인증을 완료해주세요.");
        return;
      }

      // 아이디 중복 확인 체크
      if (!usernameChecked.value) {
        alert("아이디 중복 확인을 해주세요.");
        return;
      }

      if (emailError.value || usernameError.value) {
        alert(emailError.value || usernameError.value);
        return;
      }

      // 실제 이름 확인
      if (!name.value || name.value.trim() === "") {
        alert("실제 이름을 입력해주세요.");
        return;
      }

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
        name.value,
        username.value
      );

      if (result.success) {
        router.push("/");
      } else {
        alert(result.error || "회원가입에 실패했습니다.");
        error.value = result.error;
      }
    }

    return {
      email,
      password,
      passwordConfirm,
      passwordError,
      passwordConfirmError,
      emailError,
      error,
      name,
      username,
      usernameError,
      isCheckingUsername,
      usernameChecked,
      isPasswordValid,
      isCheckingEmail,
      emailChecked,
      codeSent,
      verificationCode,
      codeError,
      isSendingCode,
      isVerifyingCode,
      emailVerified,
      handleRegister,
      validatePassword,
      validatePasswordConfirm,
      clearPasswordError,
      clearPasswordConfirmError,
      clearEmailError,
      clearUsernameError,
      checkEmailDuplicate,
      checkUsernameDuplicate,
      sendVerificationCode,
      verifyEmailCode,
      clearCodeError,
    };
  },
};
</script>
