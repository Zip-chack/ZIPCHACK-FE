<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
    >
      <div>
        <h1 class="text-2xl font-bold text-gray-900">내 매물</h1>
        <p class="text-gray-600 mt-1">총 {{ myListings.length }}개의 매물</p>
      </div>
      <router-link
        to="/listings/create"
        class="btn-primary mt-4 md:mt-0 inline-flex items-center"
      >
        <svg
          class="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        매물 등록
      </router-link>
    </div>

    <!-- Listing Grid -->
    <div v-if="isLoading" class="text-center py-16">
      <p class="text-gray-500">로딩 중...</p>
    </div>

    <div v-else-if="myListings.length === 0" class="text-center py-16">
      <svg
        class="w-16 h-16 text-gray-300 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
      <p class="text-gray-500 mb-4">등록한 매물이 없습니다.</p>
      <router-link to="/listings/create" class="btn-primary inline-block">
        매물 등록하기
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="listing in myListings"
        :key="listing.id"
        class="card overflow-hidden hover:shadow-lg transition-shadow"
      >
        <!-- 이미지 -->
        <div
          class="w-full h-48 bg-gray-200 relative cursor-pointer"
          @click="goToListing(listing.id)"
        >
          <img
            v-if="listing.imageUrl || listing.image_url || listing.image"
            :src="listing.imageUrl || listing.image_url || listing.image"
            :alt="listing.title"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-gray-400"
          >
            <svg
              class="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        <!-- 내용 -->
        <div class="p-4">
          <h3
            class="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-primary-500"
            @click="goToListing(listing.id)"
          >
            {{ listing.title }}
          </h3>
          <p class="text-gray-600 text-sm mb-2">
            {{
              listing.building?.roadAddress ||
              listing.roadAddress ||
              "주소 정보 없음"
            }}
          </p>
          <div class="flex items-center justify-between mb-4">
            <span class="text-lg font-bold text-primary-500">
              월세 {{ listing.monthlyRent || listing.monthly_rent || 0 }}만원
            </span>
            <span class="text-sm text-gray-500">
              {{ listing.roomType || listing.room_type }}
            </span>
          </div>

          <!-- 액션 버튼 -->
          <div class="flex gap-2 pt-4 border-t border-gray-100">
            <button
              @click.stop="handleEdit(listing.id)"
              class="btn-secondary flex-1 text-sm"
            >
              수정
            </button>
            <button
              @click.stop="handleDelete(listing.id)"
              class="btn-danger flex-1 text-sm"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { userAPI } from "@/utils/api";
import { listingAPI } from "@/utils/api";

export default {
  name: "MyListingsPage",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const myListings = ref([]);
    const isLoading = ref(false);

    // 내 매물 목록 로드
    const loadMyListings = async () => {
      if (!authStore.isLoggedIn) {
        router.push("/login");
        return;
      }

      isLoading.value = true;
      try {
        const response = await userAPI.getMyListings();
        myListings.value = response.data;
      } catch (error) {
        console.error("내 매물 목록 로드 실패:", error);
        alert("매물 목록을 불러오는데 실패했습니다.");
      } finally {
        isLoading.value = false;
      }
    };

    // 매물 상세 페이지로 이동
    const goToListing = (id) => {
      router.push(`/listings/${id}`);
    };

    // 매물 수정
    const handleEdit = (id) => {
      router.push(`/listings/${id}/edit`);
    };

    // 매물 삭제
    const handleDelete = async (id) => {
      if (!confirm("정말 이 매물을 삭제하시겠습니까?")) {
        return;
      }

      try {
        await listingAPI.deleteListing(id);
        // 목록에서 제거
        myListings.value = myListings.value.filter(
          (listing) => listing.id !== id
        );
        alert("매물이 삭제되었습니다.");
      } catch (error) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "매물 삭제에 실패했습니다.";
        alert(errorMessage);
      }
    };

    onMounted(() => {
      loadMyListings();
    });

    return {
      myListings,
      isLoading,
      goToListing,
      handleEdit,
      handleDelete,
    };
  },
};
</script>

<style scoped>
.btn-danger {
  @apply bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors;
}
</style>
