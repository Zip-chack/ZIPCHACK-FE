<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="listing" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Basic Info Component -->
        <ListingBasicInfo
          :listing="listing"
          @toggle-favorite="toggleFavorite"
        />

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
          <button class="btn-primary w-full mb-3">전화 문의</button>
          <button class="btn-secondary w-full">메시지 보내기</button>
        </div>

        <!-- Building Info -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 mb-4">건물 정보</h3>
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between">
              <dt class="text-gray-500">건물명</dt>
              <dd class="font-medium text-gray-900">
                {{ listing.building.name }}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">주소</dt>
              <dd class="font-medium text-gray-900 text-right">
                {{ listing.building.road_address }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Nearby Commerce Info -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 mb-4">주변 상권</h3>
          <div v-if="isLoadingCommerce" class="text-center py-4">
            <p class="text-gray-500 text-sm">상권 정보를 불러오는 중...</p>
          </div>
          <ul
            v-else-if="nearbyCommerce && Object.keys(nearbyCommerce).length > 0"
            class="space-y-3"
          >
            <li
              v-for="item in commerceItems"
              :key="item.key"
              class="flex items-center justify-between text-sm"
            >
              <div class="flex items-center">
                <span
                  class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3"
                >
                  <span class="text-primary-600">{{ item.icon }}</span>
                </span>
                <span class="text-gray-900">{{ item.label }}</span>
              </div>
              <span class="text-gray-900 font-medium"
                >{{ nearbyCommerce[item.key] || 0 }}개</span
              >
            </li>
          </ul>
          <div v-else class="text-center py-4">
            <p class="text-gray-500 text-sm">상권 정보를 불러올 수 없습니다</p>
          </div>
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
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useListingStore } from "@/stores/listing";
import { reviewAPI, kakaoMapAPI } from "@/utils/api";
import ReviewCard from "@/components/common/ReviewCard.vue";
import ListingBasicInfo from "@/components/listings/ListingBasicInfo.vue";

export default {
  name: "ListingDetailPage",
  components: {
    ReviewCard,
    ListingBasicInfo,
  },
  setup() {
    const route = useRoute();
    const listingStore = useListingStore();

    const listing = computed(() =>
      listingStore.getListingById(route.params.id)
    );
    const reviews = ref([]);
    const nearbyCommerce = ref({});
    const isLoadingCommerce = ref(false);

    const commerceItems = [
      { key: "convenienceStore", label: "편의점", icon: "🏪" },
      { key: "cafe", label: "카페", icon: "☕" },
      { key: "mart", label: "마트", icon: "🛒" },
      { key: "restaurant", label: "음식점", icon: "🍽️" },
      { key: "pharmacy", label: "약국", icon: "💊" },
      { key: "bank", label: "은행", icon: "🏦" },
      { key: "hospital", label: "병원", icon: "🏥" },
      { key: "subway", label: "지하철역", icon: "🚇" },
    ];

    onMounted(async () => {
      await listingStore.fetchListingById(route.params.id);

      // 리뷰 조회
      try {
        const response = await reviewAPI.getListingReviews(route.params.id);
        reviews.value = response.data.map((review) => ({
          id: review.id,
          user: review.user,
          rating_overall: review.ratingOverall,
          rating_noise: review.ratingNoise,
          rating_landlord: review.ratingLandlord,
          rating_facility: review.ratingFacility,
          title: review.title,
          content: review.content,
          created_at: review.createdAt,
        }));
      } catch (err) {
        console.error("리뷰를 불러오는데 실패했습니다:", err);
      }

      // 주변 상권 정보 조회
      if (
        listing.value &&
        listing.value.building &&
        listing.value.building.lat &&
        listing.value.building.lng
      ) {
        isLoadingCommerce.value = true;
        try {
          const response = await kakaoMapAPI.getNearbyCommerceInfo(
            listing.value.building.lat,
            listing.value.building.lng,
            500 // 반경 500m
          );
          nearbyCommerce.value = response.data;
        } catch (err) {
          console.error("주변 상권 정보를 불러오는데 실패했습니다:", err);
        } finally {
          isLoadingCommerce.value = false;
        }
      }
    });

    function toggleFavorite(id) {
      listingStore.toggleFavorite(id);
    }

    return {
      listing,
      reviews,
      nearbyCommerce,
      isLoadingCommerce,
      commerceItems,
      toggleFavorite,
    };
  },
};
</script>
