<template>
  <div
    class="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4"
  >
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">아이디 찾기</h1>
        <p class="text-gray-600 mt-2">이메일과 이름을 입력해주세요</p>
      </div>

      <form @submit.prevent="handleFindUsername" class="card p-8 space-y-6">
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
            >이름</label
          >
          <input
            v-model="name"
            type="text"
            placeholder="실제 이름"
            class="input"
            required
          />
        </div>

        <div
          v-if="foundUsername"
          class="p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <p class="text-sm text-green-800 font-medium mb-2">
            아이디를 찾았습니다.
          </p>
          <p class="text-lg font-bold text-green-900">{{ foundUsername }}</p>
        </div>

        <div
          v-if="error"
          class="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>

        <button type="submit" :disabled="isLoading" class="btn-primary w-full">
          {{ isLoading ? "찾는 중..." : "아이디 찾기" }}
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
import { ref } from "vue";
import { authAPI } from "@/utils/api";

export default {
  name: "FindUsernamePage",
  setup() {
    const email = ref("");
    const name = ref("");
    const foundUsername = ref("");
    const error = ref("");
    const isLoading = ref(false);

    async function handleFindUsername() {
      error.value = "";
      foundUsername.value = "";
      isLoading.value = true;

      try {
        const response = await authAPI.findUsername(email.value, name.value);
        if (response.data.found) {
          foundUsername.value = response.data.username;
        } else {
          error.value = response.data.message || "아이디를 찾을 수 없습니다.";
        }
      } catch (err) {
        error.value =
          err.response?.data?.message || "아이디 찾기에 실패했습니다.";
      } finally {
        isLoading.value = false;
      }
    }

    return {
      email,
      name,
      foundUsername,
      error,
      isLoading,
      handleFindUsername,
    };
  },
};
</script>
