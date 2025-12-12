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

        <!-- Commerce Analysis -->
        <CommerceAnalysis
          v-if="
            listing &&
            listing.building &&
            listing.building.id &&
            listing.building.lat &&
            listing.building.lng
          "
          :building-id="listing.building.id"
          :lat="listing.building.lat"
          :lng="listing.building.lng"
          :radius="500"
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
        <ContactCard />

        <!-- Commerce Radar Chart -->
        <CommerceRadarChart
          v-if="
            listing &&
            listing.building &&
            listing.building.lat &&
            listing.building.lng
          "
          :lat="listing.building.lat"
          :lng="listing.building.lng"
          :radius="500"
        />

        <!-- Nearby Commerce Info -->
        <NearbyCommerceInfo
          v-if="
            listing &&
            listing.building &&
            listing.building.lat &&
            listing.building.lng
          "
          :lat="listing.building.lat"
          :lng="listing.building.lng"
          :radius="500"
        />
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
import { reviewAPI } from "@/utils/api";
import ReviewCard from "@/components/common/ReviewCard.vue";
import ListingBasicInfo from "@/components/listings/ListingBasicInfo.vue";
import NearbyCommerceInfo from "@/components/common/NearbyCommerceInfo.vue";
import ContactCard from "@/components/common/ContactCard.vue";
import CommerceRadarChart from "@/components/common/CommerceRadarChart.vue";
import CommerceAnalysis from "@/components/common/CommerceAnalysis.vue";

export default {
  name: "ListingDetailPage",
  components: {
    ReviewCard,
    ListingBasicInfo,
    NearbyCommerceInfo,
    ContactCard,
    CommerceRadarChart,
    CommerceAnalysis,
  },
  setup() {
    const route = useRoute();
    const listingStore = useListingStore();

    const listing = computed(() =>
      listingStore.getListingById(route.params.id)
    );
    const reviews = ref([]);

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
    });

    function toggleFavorite(id) {
      listingStore.toggleFavorite(id);
    }

    return {
      listing,
      reviews,
      toggleFavorite,
    };
  },
};
</script>
