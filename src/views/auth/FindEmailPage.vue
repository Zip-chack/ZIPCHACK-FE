<template>
  <div
    class="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4"
  >
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">아이디 찾기</h1>
        <p class="text-gray-600 mt-2">등록하신 이메일을 입력해주세요</p>
      </div>

      <form @submit.prevent="handleFindEmail" class="card p-8 space-y-6">
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

        <div
          v-if="result"
          class="p-4 rounded-lg"
          :class="
            result.found
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          "
        >
          <p :class="result.found ? 'text-green-800' : 'text-red-800'">
            {{ result.message }}
          </p>
          <p
            v-if="result.found && result.email"
            class="text-green-900 font-semibold mt-2"
          >
            등록된 이메일: {{ result.email }}
          </p>
        </div>

        <button type="submit" class="btn-primary w-full" :disabled="isLoading">
          {{ isLoading ? "확인 중..." : "확인" }}
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
  name: "FindEmailPage",
  setup() {
    const email = ref("");
    const result = ref(null);
    const isLoading = ref(false);

    async function handleFindEmail() {
      result.value = null;
      isLoading.value = true;
      try {
        const response = await authAPI.findEmail(email.value);
        result.value = response.data;
      } catch (error) {
        result.value = {
          found: false,
          message: error.response?.data?.message || "오류가 발생했습니다.",
        };
      } finally {
        isLoading.value = false;
      }
    }

    return {
      email,
      result,
      isLoading,
      handleFindEmail,
    };
  },
};
</script>
