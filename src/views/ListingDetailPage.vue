<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="listing" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Image Gallery -->
        <div class="card overflow-hidden">
          <img
            :src="listing.image"
            :alt="listing.title"
            class="w-full h-80 object-cover"
          />
        </div>

        <!-- Basic Info -->
        <div class="card p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <span class="bg-primary-100 text-primary-600 text-sm px-3 py-1 rounded-full">
                {{ listing.room_type }}
              </span>
              <h1 class="text-2xl font-bold text-gray-900 mt-3">{{ listing.title }}</h1>
              <p class="text-gray-600 mt-1">{{ listing.building.road_address }}</p>
            </div>
            <button
              @click="toggleFavorite"
              class="p-3 rounded-full border border-gray-200 hover:bg-gray-50"
            >
              <svg
                class="w-6 h-6"
                :class="listing.is_favorite ? 'text-red-500 fill-current' : 'text-gray-400'"
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
          </div>

          <div class="text-3xl font-bold text-primary-600 mb-6">
            보증금 {{ listing.deposit }}만 / 월세 {{ listing.monthly_rent }}만
            <span class="text-sm font-normal text-gray-500 ml-2">
              (관리비 {{ listing.maintenance_fee }}만 별도)
            </span>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-gray-500 text-sm">면적</p>
              <p class="font-semibold text-gray-900">{{ listing.area_m2 }}m2</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-gray-500 text-sm">층수</p>
              <p class="font-semibold text-gray-900">{{ listing.floor }}층</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-gray-500 text-sm">평점</p>
              <p class="font-semibold text-gray-900">{{ listing.rating }}점</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-gray-500 text-sm">리뷰</p>
              <p class="font-semibold text-gray-900">{{ listing.review_count }}개</p>
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900">리뷰</h2>
            <router-link
              :to="`/listings/${listing.id}/review`"
              class="btn-primary text-sm"
            >
              리뷰 작성
            </router-link>
          </div>

          <div class="space-y-4">
            <ReviewCard
              v-for="review in reviews"
              :key="review.id"
              :review="review"
            />
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Contact Card -->
        <div class="card p-6 sticky top-24">
          <h3 class="font-semibold text-gray-900 mb-4">연락하기</h3>
          <button class="btn-primary w-full mb-3">
            전화 문의
          </button>
          <button class="btn-secondary w-full">
            메시지 보내기
          </button>
        </div>

        <!-- Building Info -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 mb-4">건물 정보</h3>
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between">
              <dt class="text-gray-500">건물명</dt>
              <dd class="font-medium text-gray-900">{{ listing.building.name }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">주소</dt>
              <dd class="font-medium text-gray-900 text-right">{{ listing.building.road_address }}</dd>
            </div>
          </dl>
        </div>

        <!-- Nearby POI -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 mb-4">주변 시설</h3>
          <ul class="space-y-3">
            <li v-for="poi in nearbyPOIs" :key="poi.id" class="flex items-center justify-between text-sm">
              <div class="flex items-center">
                <span class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <span class="text-primary-600">{{ poi.icon }}</span>
                </span>
                <span class="text-gray-900">{{ poi.name }}</span>
              </div>
              <span class="text-gray-500">{{ poi.distance }}m</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center py-16">
      <p class="text-gray-500">매물을 찾을 수 없습니다</p>
      <router-link to="/listings" class="btn-primary mt-4 inline-block">
        목록으로 돌아가기
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useListingStore } from '@/stores/listing'
import { reviewAPI } from '@/utils/api'
import ReviewCard from '@/components/common/ReviewCard.vue'

export default {
  name: 'ListingDetailPage',
  components: {
    ReviewCard
  },
  setup() {
    const route = useRoute()
    const listingStore = useListingStore()

    const listing = computed(() => listingStore.getListingById(route.params.id))
    const reviews = ref([])

    onMounted(async () => {
      await listingStore.fetchListingById(route.params.id)
      try {
        const response = await reviewAPI.getListingReviews(route.params.id)
        reviews.value = response.data.map(review => ({
          id: review.id,
          user: review.user,
          rating_overall: review.ratingOverall,
          rating_noise: review.ratingNoise,
          rating_landlord: review.ratingLandlord,
          rating_facility: review.ratingFacility,
          title: review.title,
          content: review.content,
          created_at: review.createdAt
        }))
      } catch (err) {
        console.error('리뷰를 불러오는데 실패했습니다:', err)
      }
    })

    const nearbyPOIs = [
      { id: 1, name: '신촌역 2호선', distance: 350, icon: '🚇' },
      { id: 2, name: 'GS25 편의점', distance: 50, icon: '🏪' },
      { id: 3, name: '올리브영', distance: 200, icon: '💊' },
      { id: 4, name: '스타벅스', distance: 150, icon: '☕' }
    ]

    function toggleFavorite() {
      if (listing.value) {
        listingStore.toggleFavorite(listing.value.id)
      }
    }

    return {
      listing,
      reviews,
      nearbyPOIs,
      toggleFavorite
    }
  }
}
</script>
