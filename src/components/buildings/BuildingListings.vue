<template>
  <div class="card p-6">
    <h3 class="font-semibold text-gray-900 mb-4">등록된 매물</h3>

    <!-- 로딩 중 -->
    <div v-if="isLoading" class="text-center py-8">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-3"
      ></div>
      <p class="text-sm text-gray-500">매물 목록을 불러오는 중...</p>
    </div>

    <!-- 매물 목록 -->
    <div v-else-if="listings.length > 0" class="space-y-3">
      <div
        v-for="listing in displayedListings"
        :key="listing.id"
        class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        @click="goToListing(listing.id)"
      >
        <!-- 이미지 영역 -->
        <div class="relative w-full h-32 bg-gray-200 overflow-hidden">
          <img
            v-if="listing.image || listing.imageUrl || listing.image_url"
            :src="listing.image || listing.imageUrl || listing.image_url"
            :alt="listing.title"
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <svg
              class="w-12 h-12 text-gray-300"
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
          <!-- 찜하기 버튼 -->
          <button
            @click.stop="toggleFavorite(listing.id)"
            class="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
            :aria-label="listing.isFavorite ? '찜하기 해제' : '찜하기'"
          >
            <svg
              class="w-5 h-5 transition-colors"
              :class="
                listing.isFavorite
                  ? 'text-red-500 fill-current'
                  : 'text-gray-400'
              "
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <!-- 방 타입 뱃지 -->
          <span
            v-if="listing.roomType || listing.room_type"
            class="absolute bottom-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded"
          >
            {{ listing.roomType || listing.room_type }}
          </span>
        </div>

        <!-- 내용 영역 -->
        <div class="p-3">
          <h4 class="font-bold text-gray-900 text-sm mb-1 line-clamp-1">
            {{ listing.title }}
          </h4>
          <div class="flex items-center justify-between">
            <div class="text-primary-600 font-bold text-sm">
              {{ formatPrice(listing) }}
            </div>
            <div
              v-if="listing.rating !== null && listing.rating !== undefined"
              class="flex items-center text-xs text-gray-500"
            >
              <svg
                class="w-3 h-3 text-yellow-400 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              <span>{{ listing.rating.toFixed(1) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 더보기 버튼 -->
      <button
        v-if="showMoreButton"
        @click="showAll = true"
        class="w-full py-3 text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
      >
        더보기 ({{ remainingCount }}개)
      </button>
    </div>

    <!-- 매물이 없을 때 -->
    <div v-else class="text-center py-8">
      <svg
        class="w-16 h-16 mx-auto mb-3 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
      <p class="text-sm text-gray-500">등록된 매물이 없습니다</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { buildingAPI } from "@/utils/api";
import { useListingStore } from "@/stores/listing";

export default {
  name: "BuildingListings",
  props: {
    buildingId: {
      type: [Number, String],
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const listingStore = useListingStore();
    const listings = ref([]);
    const isLoading = ref(false);
    const showAll = ref(false);

    const displayedListings = computed(() => {
      if (showAll.value || listings.value.length <= 3) {
        return listings.value;
      }
      return listings.value.slice(0, 3);
    });

    const showMoreButton = computed(() => {
      return listings.value.length > 3 && !showAll.value;
    });

    const remainingCount = computed(() => {
      return listings.value.length - 3;
    });

    function formatPrice(listing) {
      const deposit = listing.deposit || 0;
      const monthlyRent = listing.monthlyRent || listing.monthly_rent || 0;

      if (deposit === 0 && monthlyRent === 0) {
        return "가격 문의";
      }

      if (deposit >= 10000) {
        const deposit억 = Math.floor(deposit / 10000);
        const deposit만 = deposit % 10000;
        const depositStr =
          deposit만 > 0 ? `${deposit억}억 ${deposit만}만` : `${deposit억}억`;
        return monthlyRent > 0
          ? `${depositStr} / 월 ${monthlyRent.toLocaleString()}만`
          : `${depositStr}`;
      } else {
        const depositStr = `${deposit.toLocaleString()}만`;
        return monthlyRent > 0
          ? `${depositStr} / 월 ${monthlyRent.toLocaleString()}만`
          : `${depositStr}`;
      }
    }

    function handleImageError(event) {
      event.target.style.display = "none";
    }

    function goToListing(id) {
      router.push(`/listings/${id}`);
    }

    async function toggleFavorite(id) {
      const result = await listingStore.toggleFavorite(id);
      if (result.success) {
        const listing = listings.value.find((l) => l.id === id);
        if (listing) {
          listing.isFavorite = !listing.isFavorite;
          listing.is_favorite = listing.isFavorite;
        }
      }
    }

    async function loadListings() {
      if (!props.buildingId) {
        console.warn("BuildingListings: buildingId가 없습니다.");
        return;
      }

      // buildingId를 숫자로 변환 (문자열일 수 있음)
      const buildingIdNum = Number(props.buildingId);
      if (isNaN(buildingIdNum)) {
        console.error(
          "BuildingListings: 유효하지 않은 buildingId:",
          props.buildingId
        );
        return;
      }

      isLoading.value = true;
      try {
        console.log(
          "BuildingListings: 매물 목록 로드 시작, buildingId:",
          buildingIdNum
        );
        const response = await buildingAPI.getBuildingListings(buildingIdNum);
        console.log("BuildingListings: API 응답:", response);
        console.log("BuildingListings: 매물 개수:", response.data?.length || 0);

        if (!response.data) {
          console.warn("BuildingListings: response.data가 없습니다.");
          listings.value = [];
          return;
        }

        listings.value = response.data.map((listing) => ({
          ...listing,
          is_favorite: listing.isFavorite ?? listing.is_favorite ?? false,
          isFavorite: listing.isFavorite ?? listing.is_favorite ?? false,
        }));

        console.log("BuildingListings: 처리된 매물 목록:", listings.value);
      } catch (error) {
        console.error("매물 목록 조회 실패:", error);
        console.error("에러 상세:", error.response?.data || error.message);
        console.error("에러 스택:", error.stack);
        listings.value = [];
      } finally {
        isLoading.value = false;
      }
    }

    // buildingId가 변경될 때 다시 로드
    watch(
      () => props.buildingId,
      (newId) => {
        if (newId) {
          console.log("BuildingListings: buildingId 변경됨:", newId);
          showAll.value = false; // buildingId 변경 시 더보기 상태 초기화
          loadListings();
        }
      },
      { immediate: false }
    );

    onMounted(() => {
      if (props.buildingId) {
        loadListings();
      } else {
        console.warn("BuildingListings: onMounted 시 buildingId가 없습니다.");
      }
    });

    return {
      listings,
      isLoading,
      displayedListings,
      showMoreButton,
      remainingCount,
      showAll,
      formatPrice,
      handleImageError,
      goToListing,
      toggleFavorite,
    };
  },
};
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
