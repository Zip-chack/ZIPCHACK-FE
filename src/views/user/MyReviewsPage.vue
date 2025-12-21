<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
    >
      <div>
        <h1 class="text-2xl font-bold text-gray-900">내 리뷰</h1>
        <p class="text-gray-600 mt-1">총 {{ myReviews.length }}개의 리뷰</p>
      </div>
      <router-link to="/my-page" class="btn-secondary mt-4 md:mt-0">
        마이페이지로 돌아가기
      </router-link>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-16">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-3"
      ></div>
      <p class="text-gray-500">로딩 중...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="myReviews.length === 0" class="text-center py-16">
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
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
      <p class="text-gray-500 mb-4">작성한 리뷰가 없습니다.</p>
    </div>

    <!-- Reviews List -->
    <div v-else class="space-y-4">
      <div
        v-for="review in myReviews"
        :key="review.id"
        class="card p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <!-- 리뷰 대상 정보 카드 -->
            <div class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <!-- 매물 리뷰인 경우 -->
                  <template v-if="review.listing">
                    <div class="space-y-2">
                      <div class="flex items-center gap-2">
                        <span
                          class="inline-block bg-primary-500 text-white text-xs font-medium px-2 py-1 rounded"
                        >
                          매물 리뷰
                        </span>
                        <router-link
                          v-if="review.listing.id"
                          :to="`/listings/${review.listing.id}`"
                          class="text-primary-600 hover:text-primary-700 font-semibold text-base"
                        >
                          {{ review.listing.title || "매물 정보 없음" }}
                        </router-link>
                        <span
                          v-else
                          class="text-gray-600 font-semibold text-base"
                        >
                          {{ review.listing.title || "매물 정보 없음" }}
                        </span>
                      </div>
                      <div
                        v-if="
                          review.listing.building && review.listing.building.id
                        "
                        class="text-sm text-gray-600 ml-1"
                      >
                        <span class="font-medium">건물:</span>
                        <router-link
                          :to="`/buildings/${review.listing.building.id}`"
                          class="text-primary-600 hover:text-primary-700 ml-1"
                        >
                          {{ review.listing.building.name || "건물 정보 없음" }}
                        </router-link>
                      </div>
                      <div
                        v-if="
                          review.listing.building &&
                          (review.listing.building.roadAddress ||
                            review.listing.building.road_address)
                        "
                        class="text-xs text-gray-500 ml-1"
                      >
                        📍
                        {{
                          review.listing.building.roadAddress ||
                          review.listing.building.road_address
                        }}
                      </div>
                    </div>
                  </template>

                  <!-- 건물 리뷰인 경우 -->
                  <template v-else-if="review.building">
                    <div class="space-y-2">
                      <div class="flex items-center gap-2">
                        <span
                          class="inline-block bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded"
                        >
                          건물 리뷰
                        </span>
                        <router-link
                          v-if="review.building.id"
                          :to="`/buildings/${review.building.id}`"
                          class="text-primary-600 hover:text-primary-700 font-semibold text-base"
                        >
                          {{ review.building.name || "건물 정보 없음" }}
                        </router-link>
                        <span
                          v-else
                          class="text-gray-600 font-semibold text-base"
                        >
                          {{ review.building.name || "건물 정보 없음" }}
                        </span>
                      </div>
                      <div
                        v-if="
                          review.building.roadAddress ||
                          review.building.road_address
                        "
                        class="text-xs text-gray-500 ml-1"
                      >
                        📍
                        {{
                          review.building.roadAddress ||
                          review.building.road_address
                        }}
                      </div>
                    </div>
                  </template>

                  <!-- 리뷰 대상 정보가 없는 경우 -->
                  <div v-else class="text-sm text-gray-500">
                    리뷰 대상 정보를 불러올 수 없습니다.
                  </div>
                </div>
              </div>
            </div>

            <!-- 제목 및 평점 -->
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ review.title }}
              </h3>
              <div class="flex items-center">
                <svg
                  class="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
                <span class="ml-1 font-semibold text-gray-900">{{
                  review.ratingOverall || review.rating_overall
                }}</span>
              </div>
            </div>

            <!-- 내용 -->
            <p class="text-gray-600 mb-3">{{ review.content }}</p>

            <!-- 세부 평점 -->
            <div class="flex flex-wrap gap-2 mb-3">
              <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                소음 {{ review.ratingNoise || review.rating_noise }}
              </span>
              <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                집주인 {{ review.ratingLandlord || review.rating_landlord }}
              </span>
              <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                시설 {{ review.ratingFacility || review.rating_facility }}
              </span>
            </div>

            <!-- 작성일 -->
            <p class="text-xs text-gray-500">
              {{ formatDate(review.createdAt || review.created_at) }}
            </p>
          </div>

          <!-- 액션 버튼 -->
          <div class="flex gap-2 ml-4">
            <button
              @click="openEditModal(review)"
              class="btn-secondary text-sm px-4 py-2"
            >
              수정
            </button>
            <button
              @click="handleDelete(review.id)"
              class="btn-danger text-sm px-4 py-2"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 리뷰 수정 모달 -->
    <ReviewEditModal
      v-if="editingReview"
      :review="editingReview"
      :is-open="isEditModalOpen"
      @close="closeEditModal"
      @updated="handleReviewUpdated"
    />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { userAPI, reviewAPI } from "@/utils/api";
import ReviewEditModal from "@/components/reviews/ReviewEditModal.vue";

export default {
  name: "MyReviewsPage",
  components: {
    ReviewEditModal,
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const myReviews = ref([]);
    const isLoading = ref(false);
    const editingReview = ref(null);
    const isEditModalOpen = ref(false);

    // 날짜 포맷팅
    function formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}.${String(date.getDate()).padStart(2, "0")}`;
    }

    // 내 리뷰 목록 로드
    const loadMyReviews = async () => {
      if (!authStore.isLoggedIn) {
        router.push("/login");
        return;
      }

      isLoading.value = true;
      try {
        const response = await userAPI.getMyReviews();
        console.log("내 리뷰 API 응답:", response);
        console.log("내 리뷰 데이터:", response.data);

        myReviews.value = (response.data || []).map((review) => {
          console.log("=== 리뷰 데이터 상세 ===");
          console.log("리뷰 ID:", review.id);
          console.log("리뷰 전체 데이터:", JSON.stringify(review, null, 2));
          console.log("리뷰 listing 존재:", !!review.listing);
          console.log("리뷰 listing 데이터:", review.listing);
          console.log("리뷰 building 존재:", !!review.building);
          console.log("리뷰 building 데이터:", review.building);
          if (review.listing) {
            console.log("  - listing.id:", review.listing.id);
            console.log("  - listing.title:", review.listing.title);
            console.log(
              "  - listing.building 존재:",
              !!review.listing.building
            );
            if (review.listing.building) {
              console.log(
                "  - listing.building.id:",
                review.listing.building.id
              );
              console.log(
                "  - listing.building.name:",
                review.listing.building.name
              );
            }
          }
          if (review.building) {
            console.log("  - building.id:", review.building.id);
            console.log("  - building.name:", review.building.name);
          }
          return review;
        });

        console.log("처리된 리뷰 목록:", myReviews.value);
      } catch (error) {
        console.error("내 리뷰 목록 로드 실패:", error);
        console.error("에러 상세:", error.response?.data || error.message);
        alert("리뷰 목록을 불러오는데 실패했습니다.");
      } finally {
        isLoading.value = false;
      }
    };

    // 리뷰 수정 모달 열기
    const openEditModal = (review) => {
      editingReview.value = review;
      isEditModalOpen.value = true;
    };

    // 리뷰 수정 모달 닫기
    const closeEditModal = () => {
      isEditModalOpen.value = false;
      editingReview.value = null;
    };

    // 리뷰 수정 완료 후 처리
    const handleReviewUpdated = (updatedReview) => {
      const index = myReviews.value.findIndex((r) => r.id === updatedReview.id);
      if (index !== -1) {
        myReviews.value[index] = updatedReview;
      }
      closeEditModal();
    };

    // 리뷰 삭제
    const handleDelete = async (reviewId) => {
      if (!confirm("정말 이 리뷰를 삭제하시겠습니까?")) {
        return;
      }

      try {
        await reviewAPI.deleteReview(reviewId);
        // 목록에서 제거
        myReviews.value = myReviews.value.filter(
          (review) => review.id !== reviewId
        );
        alert("리뷰가 삭제되었습니다.");
      } catch (error) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "리뷰 삭제에 실패했습니다.";
        alert(errorMessage);
      }
    };

    onMounted(() => {
      loadMyReviews();
    });

    return {
      myReviews,
      isLoading,
      editingReview,
      isEditModalOpen,
      formatDate,
      openEditModal,
      closeEditModal,
      handleReviewUpdated,
      handleDelete,
    };
  },
};
</script>

<style scoped>
.btn-danger {
  @apply bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors;
}
</style>
