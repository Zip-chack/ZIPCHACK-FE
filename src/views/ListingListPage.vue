<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">매물 찾기</h1>
        <p class="text-gray-600 mt-1">총 {{ filteredListings.length }}개의 매물</p>
      </div>
      <router-link to="/listings/create" class="btn-primary mt-4 md:mt-0 inline-flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        매물 등록
      </router-link>
    </div>

    <!-- Filters -->
    <div class="card p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          v-model="filters.search"
          type="text"
          placeholder="검색어 입력"
          class="input"
        />
        <select v-model="filters.roomType" class="input">
          <option value="">방 종류</option>
          <option value="원룸">원룸</option>
          <option value="1.5룸">1.5룸</option>
          <option value="투룸">투룸</option>
        </select>
        <select v-model="filters.priceRange" class="input">
          <option value="">가격대</option>
          <option value="0-50">월세 50만원 이하</option>
          <option value="50-70">월세 50-70만원</option>
          <option value="70-100">월세 70-100만원</option>
          <option value="100+">월세 100만원 이상</option>
        </select>
        <select v-model="filters.sort" class="input">
          <option value="latest">최신순</option>
          <option value="price_low">월세 낮은순</option>
          <option value="price_high">월세 높은순</option>
          <option value="rating">평점 높은순</option>
        </select>
      </div>
    </div>

    <!-- Listing Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ListingCard
        v-for="listing in filteredListings"
        :key="listing.id"
        :listing="listing"
        @click="goToListing(listing.id)"
        @toggle-favorite="toggleFavorite(listing.id)"
      />
    </div>

    <!-- Empty State -->
    <div v-if="filteredListings.length === 0" class="text-center py-16">
      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <p class="text-gray-500">검색 결과가 없습니다</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useListingStore } from '@/stores/listing'
import ListingCard from '@/components/common/ListingCard.vue'

export default {
  name: 'ListingListPage',
  components: {
    ListingCard
  },
  setup() {
    const router = useRouter()
    const listingStore = useListingStore()

    onMounted(async () => {
      await listingStore.fetchListings()
    })

    const filters = ref({
      search: '',
      roomType: '',
      priceRange: '',
      sort: 'latest'
    })

    const filteredListings = computed(() => {
      let result = [...listingStore.listings]

      if (filters.value.search) {
        const query = filters.value.search.toLowerCase()
        result = result.filter(l =>
          l.title.toLowerCase().includes(query) ||
          l.building.road_address.toLowerCase().includes(query)
        )
      }

      if (filters.value.roomType) {
        result = result.filter(l => l.room_type === filters.value.roomType)
      }

      if (filters.value.priceRange) {
        const [min, max] = filters.value.priceRange.split('-').map(Number)
        if (max) {
          result = result.filter(l => l.monthly_rent >= min && l.monthly_rent < max)
        } else {
          result = result.filter(l => l.monthly_rent >= 100)
        }
      }

      switch (filters.value.sort) {
        case 'price_low':
          result.sort((a, b) => a.monthly_rent - b.monthly_rent)
          break
        case 'price_high':
          result.sort((a, b) => b.monthly_rent - a.monthly_rent)
          break
        case 'rating':
          result.sort((a, b) => b.rating - a.rating)
          break
      }

      return result
    })

    function goToListing(id) {
      router.push(`/listings/${id}`)
    }

    function toggleFavorite(id) {
      listingStore.toggleFavorite(id)
    }

    return {
      filters,
      filteredListings,
      goToListing,
      toggleFavorite
    }
  }
}
</script>
