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
        <router-link
          to="/my-page/listings"
          class="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">내 매물</h3>
              <p class="text-gray-600 text-sm">등록한 매물을 확인하세요</p>
            </div>
            <div class="text-3xl font-bold text-primary-500">
              {{ summary?.listingCount || 0 }}
            </div>
          </div>
        </router-link>

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
          class="card p-6 hover:shadow-lg transition-shadow cursor-pointer relative"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">내 채팅</h3>
              <p class="text-gray-600 text-sm">진행 중인 채팅을 확인하세요</p>
            </div>
            <div class="relative">
              <div class="text-3xl font-bold text-primary-500">
                {{ summary?.unreadMessageCount || 0 }}
              </div>
              <span
                v-if="(summary?.unreadMessageCount || 0) > 0"
                class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
              >
                {{
                  summary?.unreadMessageCount > 99
                    ? "99+"
                    : summary?.unreadMessageCount
                }}
              </span>
            </div>
          </div>
        </router-link>

        <!-- 내 리뷰 -->
        <div class="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">내 리뷰</h3>
              <p class="text-gray-600 text-sm">작성한 리뷰를 확인하세요</p>
            </div>
            <div class="text-3xl font-bold text-primary-500">
              {{ summary?.reviewCount || 0 }}
            </div>
          </div>
        </div>
      </div>

      <!-- 설정 섹션 -->
      <div class="card p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-6">설정</h2>
        <div class="space-y-4">
          <!-- 회원 정보 수정 -->
          <router-link
            to="/my-page/edit"
            class="w-full text-left p-4 rounded-lg hover:bg-gray-50 transition-colors block"
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
          </router-link>

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
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { userAPI } from "@/utils/api";

export default {
  name: "MyPage",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const summary = ref(null);
    const isLoading = ref(false);

    // 사용자 이름의 첫 글자 추출
    const userInitial = computed(() => {
      const nickname = authStore.user?.nickname;
      if (!nickname) return "?";
      return nickname.charAt(0).toUpperCase();
    });

    // 마이페이지 데이터 로드
    const loadMyPageData = async () => {
      if (!authStore.isLoggedIn) {
        router.push("/login");
        return;
      }

      isLoading.value = true;
      try {
        const response = await userAPI.getMySummary();
        console.log("마이페이지 데이터 응답:", response.data);
        summary.value = response.data;
      } catch (error) {
        console.error("마이페이지 데이터 로드 실패:", error);
        console.error("에러 상세:", error.response?.data);
        // 에러가 발생해도 페이지는 표시
      } finally {
        isLoading.value = false;
      }
    };

    const handleLogout = async () => {
      if (confirm("로그아웃 하시겠습니까?")) {
        await authStore.logout();
        router.push("/");
      }
    };

    onMounted(() => {
      loadMyPageData();
    });

    return {
      authStore,
      userInitial,
      summary,
      isLoading,
      handleLogout,
    };
  },
};
</script>
