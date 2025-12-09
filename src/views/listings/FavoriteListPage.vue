<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">찜 목록</h1>
    <p class="text-gray-600 mb-8">관심 있는 매물을 모아보세요</p>

    <div
      v-if="favoriteListings.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <ListingCard
        v-for="listing in favoriteListings"
        :key="listing.id"
        :listing="listing"
        @click="goToListing"
        @toggle-favorite="toggleFavorite"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
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
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">
        찜한 매물이 없습니다
      </h2>
      <p class="text-gray-500 mb-6">마음에 드는 매물을 찜해보세요</p>
      <router-link to="/listings" class="btn-primary">
        매물 둘러보기
      </router-link>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useListingStore } from "@/stores/listing";
import ListingCard from "@/components/listings/ListingCard.vue";

export default {
  name: "FavoriteListPage",
  components: {
    ListingCard,
  },
  setup() {
    const router = useRouter();
    const listingStore = useListingStore();

    // 서버에서 찜 목록을 가져옴
    onMounted(async () => {
      await listingStore.fetchFavorites();
    });

    // listingStore.favorites를 사용 (서버에서 가져온 찜 목록)
    const favoriteListings = computed(() => listingStore.favorites);

    function goToListing(id) {
      router.push(`/listings/${id}`);
    }

    async function toggleFavorite(id) {
      await listingStore.toggleFavorite(id);
      // 찜하기 후 목록 다시 불러오기
      await listingStore.fetchFavorites();
    }

    return {
      favoriteListings,
      goToListing,
      toggleFavorite,
    };
  },
};
</script>
