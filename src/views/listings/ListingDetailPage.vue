<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="listing" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Owner Actions -->
        <div v-if="isOwner" class="flex justify-end gap-3 mb-4">
          <router-link
            :to="`/listings/${listing.id}/edit`"
            class="btn-secondary text-sm"
          >
            수정
          </router-link>
          <button @click="handleDelete" class="btn-danger text-sm">삭제</button>
        </div>

        <!-- Basic Info Component -->
        <ListingBasicInfo
          :listing="listing"
          @toggle-favorite="toggleFavorite"
          @show-roadview="showRoadview = true"
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
        <ContactCard
          :listingId="listing.id"
          :isOwner="isOwner"
          :status="listing.status"
          @start-chat="startChat"
        />

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

  <!-- 로드뷰 모달 -->
  <RoadviewModal
    v-if="
      listing &&
      listing.building &&
      listing.building.lat &&
      listing.building.lng
    "
    :is-open="showRoadview"
    :lat="listing.building.lat"
    :lng="listing.building.lng"
    @close="showRoadview = false"
  />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router"; // Added useRouter
import { useListingStore } from "@/stores/listing";
import { useChatStore } from "@/stores/chat"; // Added useChatStore
import { useAuthStore } from "@/stores/auth";
import { reviewAPI, listingAPI } from "@/utils/api";
import ReviewCard from "@/components/common/ReviewCard.vue";
import ListingBasicInfo from "@/components/listings/ListingBasicInfo.vue";
import NearbyCommerceInfo from "@/components/common/NearbyCommerceInfo.vue";
import ContactCard from "@/components/common/ContactCard.vue";
import CommerceRadarChart from "@/components/common/CommerceRadarChart.vue";
import CommerceAnalysis from "@/components/common/CommerceAnalysis.vue";
import RoadviewModal from "@/components/common/RoadviewModal.vue";

const route = useRoute();
const router = useRouter(); // Initialize useRouter
const listingStore = useListingStore();
const chatStore = useChatStore(); // Initialize useChatStore
const authStore = useAuthStore();

const listingId = computed(() => route.params.id);
const listing = computed(() => listingStore.getListingById(listingId.value));
const reviews = ref([]);
const showRoadview = ref(false);

const isOwner = computed(() => {
  if (!authStore.user || !listing.value?.owner) {
    return false;
  }
  return authStore.user.id === listing.value.owner.id;
});

// Chat initiation function
const startChat = async (id) => {
  // Takes id from emitted event
  const roomId = await chatStore.enterRoom(id); // Use the passed id
  if (roomId) {
    router.push({ name: "ChatRoom", params: { roomId } });
  } else {
    // Error message already handled by chatStore.enterRoom
  }
};

const toggleFavorite = (id) => {
  listingStore.toggleFavorite(id);
};

// 매물 삭제
const handleDelete = async () => {
  if (!confirm("정말 이 매물을 삭제하시겠습니까?")) {
    return;
  }

  try {
    await listingAPI.deleteListing(listingId.value);
    alert("매물이 삭제되었습니다.");
    router.push("/listings");
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "매물 삭제에 실패했습니다.";
    alert(errorMessage);
  }
};

onMounted(async () => {
  await listingStore.fetchListingById(listingId.value);

  try {
    const listingReviewsResponse = await reviewAPI.getListingReviews(
      listingId.value
    );
    const listingReviews = listingReviewsResponse.data.map((review) => ({
      ...review,
      rating_overall: review.ratingOverall,
      rating_noise: review.ratingNoise,
      rating_landlord: review.ratingLandlord,
      rating_facility: review.ratingFacility,
      created_at: review.createdAt,
      type: "listing", // 매물 리뷰임을 표시
    }));

    let allReviews = [...listingReviews];

    if (listing.value?.building?.id) {
      try {
        const buildingReviewsResponse = await reviewAPI.getBuildingReviews(
          listing.value.building.id
        );
        const buildingReviews = buildingReviewsResponse.data.map((review) => ({
          ...review,
          rating_overall: review.ratingOverall,
          rating_noise: review.ratingNoise,
          rating_landlord: review.ratingLandlord,
          rating_facility: review.ratingFacility,
          created_at: review.createdAt,
          type: "building", // 건물 리뷰임을 표시
          building: listing.value.building, // 건물 정보 추가
        }));
        allReviews = [...allReviews, ...buildingReviews];
      } catch (err) {
        console.error("건물 리뷰를 불러오는데 실패했습니다:", err);
      }
    }

    allReviews.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB - dateA; // 최신순
    });

    reviews.value = allReviews;
  } catch (err) {
    console.error("리뷰를 불러오는데 실패했습니다:", err);
  }
});
</script>

<style scoped>
.btn-danger {
  @apply bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors;
}
</style>
