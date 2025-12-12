<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">건물 리뷰 작성</h1>
    <p class="text-gray-600 mb-8">건물에 대한 솔직한 리뷰를 남겨주세요</p>

    <!-- Building Info -->
    <div v-if="building" class="card p-6 mb-6">
      <h2 class="font-semibold text-gray-900">{{ building.name }}</h2>
      <p class="text-gray-600 text-sm">{{ building.road_address }}</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Rating Section -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">평점</h2>
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >종합 평점</label
            >
            <RatingInput v-model="form.ratingOverall" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >소음</label
            >
            <RatingInput v-model="form.ratingNoise" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >집주인</label
            >
            <RatingInput v-model="form.ratingLandlord" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >시설</label
            >
            <RatingInput v-model="form.ratingFacility" />
          </div>
        </div>
      </div>

      <!-- Review Content -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">리뷰 내용</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >제목</label
            >
            <input
              v-model="form.title"
              type="text"
              placeholder="리뷰 제목"
              class="input"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >내용</label
            >
            <textarea
              v-model="form.content"
              rows="6"
              placeholder="건물에 대한 경험을 자세히 작성해주세요"
              class="input"
              required
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="flex justify-end space-x-4">
        <button type="button" @click="$router.back()" class="btn-secondary">
          취소
        </button>
        <button type="submit" class="btn-primary">리뷰 등록</button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useBuildingStore } from "@/stores/building";
import { useAuthStore } from "@/stores/auth";
import { reviewAPI } from "@/utils/api";
import RatingInput from "@/components/common/RatingInput.vue";

export default {
  name: "BuildingReviewCreatePage",
  components: {
    RatingInput,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const buildingStore = useBuildingStore();
    const authStore = useAuthStore();

    const building = computed(() =>
      buildingStore.getBuildingById(route.params.id)
    );

    onMounted(async () => {
      // 로그인 체크
      const token = localStorage.getItem("token");
      if (!token || !authStore.isLoggedIn) {
        alert("리뷰를 작성하려면 로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      // 빌딩 정보가 없으면 가져오기
      if (!building.value) {
        await buildingStore.fetchBuildingById(route.params.id);
      }
    });

    const form = ref({
      ratingOverall: 0,
      ratingNoise: 0,
      ratingLandlord: 0,
      ratingFacility: 0,
      title: "",
      content: "",
    });

    async function handleSubmit() {
      // 로그인 체크
      const token = localStorage.getItem("token");
      if (!token || !authStore.isLoggedIn) {
        alert("리뷰를 작성하려면 로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      // 필수 필드 검증
      if (!form.value.title || !form.value.content) {
        alert("제목과 내용을 입력해주세요.");
        return;
      }

      if (form.value.ratingOverall === 0) {
        alert("종합 평점을 선택해주세요.");
        return;
      }

      try {
        const buildingId = route.params.id;
        if (!buildingId) {
          alert("건물 정보를 찾을 수 없습니다.");
          return;
        }

        const reviewData = {
          title: form.value.title,
          content: form.value.content,
          ratingOverall: form.value.ratingOverall,
          ratingNoise: form.value.ratingNoise,
          ratingLandlord: form.value.ratingLandlord,
          ratingFacility: form.value.ratingFacility,
        };

        console.log("리뷰 등록 요청:", { buildingId, reviewData });
        const response = await reviewAPI.createBuildingReview(
          buildingId,
          reviewData
        );
        console.log("리뷰 등록 응답:", response);

        alert("건물 리뷰가 등록되었습니다!");
        router.push(`/buildings/${buildingId}`);
      } catch (err) {
        console.error("리뷰 등록 에러:", err);
        console.error("에러 상세:", err.response?.data);
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "리뷰 등록에 실패했습니다.";
        alert(`리뷰 등록 실패: ${errorMessage}`);
      }
    }

    return {
      building,
      form,
      handleSubmit,
    };
  },
};
</script>
