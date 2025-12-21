<template>
  <div class="min-h-[calc(100vh-200px)] py-12 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- 페이지 헤더 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">마이페이지</h1>
        <p class="text-gray-600">회원 정보를 확인하고 관리할 수 있습니다.</p>
      </div>

      <!-- 프로필 섹션 -->
      <div class="card p-8 mb-6">
        <div class="flex items-center space-x-6 mb-6">
          <div
            class="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center"
          >
            <span class="text-white text-2xl font-bold">
              {{ userInitial }}
            </span>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">
              {{ authStore.user?.nickname || "사용자" }}님
            </h2>
            <p class="text-gray-600 mt-1">
              {{ authStore.user?.email || "이메일 정보 없음" }}
            </p>
          </div>
        </div>
      </div>

      <!-- 정보 섹션 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- 내 매물 -->
        <div class="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">내 매물</h3>
              <p class="text-gray-600 text-sm">등록한 매물을 확인하세요</p>
            </div>
            <div class="text-3xl font-bold text-primary-500">-</div>
          </div>
        </div>

        <!-- 찜한 매물 -->
        <router-link
          to="/favorites"
          class="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                찜한 매물
              </h3>
              <p class="text-gray-600 text-sm">관심 있는 매물을 확인하세요</p>
            </div>
            <div class="text-3xl font-bold text-primary-500">-</div>
          </div>
        </router-link>

        <!-- 내 채팅 -->
        <router-link
          to="/my-chats"
          class="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">내 채팅</h3>
              <p class="text-gray-600 text-sm">진행 중인 채팅을 확인하세요</p>
            </div>
            <div class="text-3xl font-bold text-primary-500">-</div>
          </div>
        </router-link>

        <!-- 내 리뷰 -->
        <div class="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">내 리뷰</h3>
              <p class="text-gray-600 text-sm">작성한 리뷰를 확인하세요</p>
            </div>
            <div class="text-3xl font-bold text-primary-500">-</div>
          </div>
        </div>
      </div>

      <!-- 설정 섹션 -->
      <div class="card p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-6">설정</h2>
        <div class="space-y-4">
          <!-- 회원 정보 수정 -->
          <button
            class="w-full text-left p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-gray-900">회원 정보 수정</h3>
                <p class="text-sm text-gray-600 mt-1">
                  닉네임, 비밀번호 등을 수정할 수 있습니다
                </p>
              </div>
              <svg
                class="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>

          <!-- 로그아웃 -->
          <button
            @click="handleLogout"
            class="w-full text-left p-4 rounded-lg hover:bg-gray-50 transition-colors text-red-600"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">로그아웃</h3>
                <p class="text-sm text-gray-600 mt-1">
                  계정에서 로그아웃합니다
                </p>
              </div>
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export default {
  name: "MyPage",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    // 사용자 이름의 첫 글자 추출
    const userInitial = computed(() => {
      const nickname = authStore.user?.nickname;
      if (!nickname) return "?";
      return nickname.charAt(0).toUpperCase();
    });

    const handleLogout = async () => {
      if (confirm("로그아웃 하시겠습니까?")) {
        await authStore.logout();
        router.push("/");
      }
    };

    return {
      authStore,
      userInitial,
      handleLogout,
    };
  },
};
</script>
