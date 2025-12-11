<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="building" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Building Basic Info -->
        <div class="card p-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            {{ building.name }}
          </h1>
          <p class="text-gray-600 mb-6">{{ building.road_address }}</p>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              v-if="building.rating !== null && building.rating !== undefined"
              class="text-center p-4 bg-gray-50 rounded-lg"
            >
              <p class="text-gray-500 text-sm">평점</p>
              <p class="font-semibold text-gray-900">
                {{ building.rating.toFixed(1) }}점
              </p>
            </div>
            <div
              v-if="
                building.review_count !== null &&
                building.review_count !== undefined
              "
              class="text-center p-4 bg-gray-50 rounded-lg"
            >
              <p class="text-gray-500 text-sm">리뷰</p>
              <p class="font-semibold text-gray-900">
                {{ building.review_count }}개
              </p>
            </div>
            <div
              v-if="building.built_year"
              class="text-center p-4 bg-gray-50 rounded-lg"
            >
              <p class="text-gray-500 text-sm">건축년도</p>
              <p class="font-semibold text-gray-900">
                {{ building.built_year }}년
              </p>
            </div>
          </div>
        </div>

        <!-- Commerce Analysis -->
        <CommerceAnalysis
          v-if="building && building.id && building.lat && building.lng"
          :building-id="building.id"
          :lat="building.lat"
          :lng="building.lng"
          :radius="500"
        />

        <!-- Reviews Section -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900">리뷰</h2>
            <router-link
              :to="`/buildings/${building.id}/review`"
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
            <div v-if="reviews.length === 0" class="text-center py-8">
              <p class="text-gray-500">아직 리뷰가 없습니다.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Contact Card -->
        <ContactCard />

        <!-- Building Info -->
        <BuildingInfoCard :building="building" />

        <!-- Commerce Radar Chart -->
        <CommerceRadarChart
          v-if="building && building.lat && building.lng"
          :lat="building.lat"
          :lng="building.lng"
          :radius="500"
        />

        <!-- Nearby Commerce Info -->
        <NearbyCommerceInfo
          v-if="building && building.lat && building.lng"
          :lat="building.lat"
          :lng="building.lng"
          :radius="500"
        />
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center py-16">
      <p class="text-gray-500">건물을 찾을 수 없습니다</p>
      <router-link to="/map" class="btn-primary mt-4 inline-block">
        지도로 돌아가기
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useBuildingStore } from "@/stores/building";
import { reviewAPI } from "@/utils/api";
import ReviewCard from "@/components/common/ReviewCard.vue";
import NearbyCommerceInfo from "@/components/common/NearbyCommerceInfo.vue";
import ContactCard from "@/components/common/ContactCard.vue";
import BuildingInfoCard from "@/components/common/BuildingInfoCard.vue";
import CommerceRadarChart from "@/components/common/CommerceRadarChart.vue";
import CommerceAnalysis from "@/components/common/CommerceAnalysis.vue";

export default {
  name: "BuildingDetailPage",
  components: {
    ReviewCard,
    NearbyCommerceInfo,
    ContactCard,
    BuildingInfoCard,
    CommerceRadarChart,
    CommerceAnalysis,
  },
  setup() {
    const route = useRoute();
    const buildingStore = useBuildingStore();

    const building = computed(() =>
      buildingStore.getBuildingById(route.params.id)
    );
    const reviews = ref([]);

    onMounted(async () => {
      await buildingStore.fetchBuildingById(route.params.id);
      try {
        const response = await reviewAPI.getBuildingReviews(route.params.id);
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

    return {
      building,
      reviews,
    };
  },
};
</script>
