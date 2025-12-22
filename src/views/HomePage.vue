<template>
  <div>
    <!-- Hero Section -->
    <section
      class="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">
          실거주자 리뷰로 찾는<br />나만의 원룸
        </h1>
        <p class="text-xl text-primary-100 mb-8">
          ZIP-Chack에서 진짜 거주 후기를 확인하세요
        </p>

        <!-- Search Bar -->
        <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-2 flex">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="지역, 건물명으로 검색하세요"
            class="flex-1 px-4 py-3 text-gray-900 focus:outline-none rounded-lg"
            @keyup.enter="handleSearch"
          />
          <button @click="handleSearch" class="btn-primary px-8">검색</button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
          ZIP-Chack만의 특별함
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- 실거주자 리뷰 → /listings -->
          <div
            class="text-center p-6 cursor-pointer transition shadow hover:shadow-lg rounded-xl border hover:bg-primary-50"
            @click="goTo('/listings')"
          >
            <div
              class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              실거주자 리뷰
            </h3>
            <p class="text-gray-600">
              실제 거주 경험을 바탕으로 한 솔직한 리뷰를 확인하세요
            </p>
          </div>

          <!-- 지도 기반 검색 → /map -->
          <div
            class="text-center p-6 cursor-pointer transition shadow hover:shadow-lg rounded-xl border hover:bg-primary-50"
            @click="goTo('/map')"
          >
            <div
              class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              지도 기반 검색
            </h3>
            <p class="text-gray-600">
              원하는 지역의 매물을 지도에서 한눈에 확인하세요
            </p>
          </div>

          <!-- 부동산 상식 챗봇 → 모달 열기 -->
          <div
            class="text-center p-6 cursor-pointer transition shadow hover:shadow-lg rounded-xl border hover:bg-primary-50"
            @click="openChatModal"
          >
            <div
              class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              부동산 상식 챗봇
            </h3>
            <p class="text-gray-600">
              부동산 거래, 전세/월세 등 궁금한 점을 AI에게 물어보세요
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent Listings -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900">최근 등록 매물</h2>
          <router-link
            to="/listings"
            class="text-primary-500 hover:text-primary-600 font-medium"
          >
            전체보기 →
          </router-link>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ListingCard
            v-for="listing in recentListings"
            :key="listing.id"
            :listing="listing"
            @click="goToListing(listing.id)"
            @toggle-favorite="toggleFavorite(listing.id)"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useListingStore } from "@/stores/listing";
import ListingCard from "@/components/listings/ListingCard.vue";

export default {
  name: "HomePage",
  components: {
    ListingCard,
  },
  setup() {
    const router = useRouter();
    const listingStore = useListingStore();
    const searchQuery = ref("");

    const recentListings = computed(() => listingStore.listings.slice(0, 3));

    onMounted(async () => {
      await listingStore.fetchListings();
    });

    function handleSearch() {
      const query = searchQuery.value.trim();
      if (query) {
        router.push({ path: "/listings", query: { q: query } });
      } else {
        // 검색어가 비어있으면 그냥 목록 페이지로 이동
        router.push({ path: "/listings" });
      }
    }

    function goTo(path) {
      router.push(path);
    }

    function goToListing(id) {
      router.push(`/listings/${id}`);
    }

    function toggleFavorite(id) {
      listingStore.toggleFavorite(id);
    }

    function openChatModal() {
      // 전역 이벤트를 통해 App.vue의 모달 열기
      window.dispatchEvent(new CustomEvent("open-chat-modal"));
    }

    return {
      searchQuery,
      recentListings,
      handleSearch,
      goTo,
      goToListing,
      toggleFavorite,
      openChatModal,
    };
  },
};
</script>
