<template>
  <div class="w-96 bg-white border-l border-gray-200 flex flex-col">
    <!-- Building Search (건물명 필터링용) -->
    <div class="p-4 border-b border-gray-200">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="건물명으로 필터링"
        class="input"
        @input="$emit('search', searchQuery)"
      />
    </div>

    <!-- Building List or Detail -->
    <div class="flex-1 overflow-y-auto">
      <!-- Building Detail View -->
      <div v-if="selectedBuilding" class="p-4">
        <button
          @click="$emit('back-to-list')"
          class="text-primary-500 mb-4 flex items-center"
        >
          <svg
            class="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          목록으로
        </button>

        <h2 class="text-xl font-bold text-gray-900 mb-2">
          {{ selectedBuilding.name }}
        </h2>
        <p class="text-gray-600 text-sm mb-4">
          {{ selectedBuilding.road_address }}
        </p>

        <div class="flex items-center mb-6">
          <svg
            class="w-5 h-5 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
          <span class="ml-1 font-semibold">{{
            selectedBuilding.rating || 0
          }}</span>
          <span class="text-gray-500 ml-1"
            >({{ selectedBuilding.review_count || 0 }}개 리뷰)</span
          >
        </div>

        <div class="flex gap-2 mb-4">
          <router-link
            :to="`/buildings/${selectedBuilding.id}`"
            class="btn-primary flex-1 text-center block"
          >
            상세보기
          </router-link>
          <router-link
            :to="`/buildings/${selectedBuilding.id}/review`"
            class="btn-secondary flex-1 text-center block"
          >
            리뷰 작성
          </router-link>
        </div>

        <!-- 매물 등록 버튼 -->
        <router-link
          :to="`/listings/create?buildingId=${selectedBuilding.id}`"
          class="btn-primary w-full text-center block mb-4"
        >
          매물 등록
        </router-link>

        <!-- Building Listings -->
        <div v-if="buildingListings.length > 0" class="mt-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            등록된 매물 ({{ buildingListings.length }}개)
          </h3>
          <div class="space-y-4">
            <ListingCard
              v-for="listing in buildingListings"
              :key="listing.id"
              :listing="listing"
              @click="$emit('go-to-listing', listing.id)"
              @toggle-favorite="$emit('toggle-favorite', listing.id)"
            />
          </div>
        </div>
        <div
          v-else-if="!isLoadingListings"
          class="mt-6 text-center py-8 text-gray-500"
        >
          등록된 매물이 없습니다.
        </div>
        <div
          v-if="isLoadingListings"
          class="mt-6 text-center py-8 text-gray-500"
        >
          매물 목록을 불러오는 중...
        </div>
      </div>

      <!-- Building List View -->
      <div v-else class="divide-y divide-gray-100">
        <div
          v-if="buildings.length === 0"
          class="p-8 text-center text-gray-500"
        >
          <p>표시할 건물이 없습니다.</p>
          <p class="text-sm mt-2">지도를 이동하거나 검색해보세요.</p>
        </div>
        <button
          v-for="building in buildings"
          :key="building.id"
          @click="$emit('select-building', building)"
          class="w-full p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <h3 class="font-semibold text-gray-900">{{ building.name }}</h3>
          <p class="text-sm text-gray-500 mb-2">
            {{ building.road_address }}
          </p>
          <div class="flex items-center text-sm">
            <svg
              class="w-4 h-4 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
            <span class="ml-1 font-medium">{{ building.rating || 0 }}</span>
            <span class="text-gray-400 ml-1"
              >({{ building.review_count || 0 }})</span
            >
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import ListingCard from "@/components/listings/ListingCard.vue";

export default {
  name: "BuildingSidebar",
  components: {
    ListingCard,
  },
  props: {
    selectedBuilding: {
      type: Object,
      default: null,
    },
    buildings: {
      type: Array,
      default: () => [],
    },
    buildingListings: {
      type: Array,
      default: () => [],
    },
    isLoadingListings: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "search",
    "back-to-list",
    "select-building",
    "go-to-listing",
    "toggle-favorite",
  ],
  setup() {
    const searchQuery = ref("");

    return {
      searchQuery,
    };
  },
};
</script>
