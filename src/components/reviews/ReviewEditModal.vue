<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        @click.self="handleClose"
      >
        <div
          class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <!-- 헤더 -->
          <div
            class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10"
          >
            <h2 class="text-xl font-semibold text-gray-900">리뷰 수정</h2>
            <button
              @click="handleClose"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- 내용 -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
            <!-- Rating Section -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">평점</h3>
              <div class="space-y-4">
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
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                리뷰 내용
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >제목</label
                  >
                  <input
                    v-model="form.title"
                    type="text"
                    placeholder="리뷰 제목"
                    class="input w-full"
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
                    placeholder="거주 경험을 자세히 작성해주세요"
                    class="input w-full"
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- 에러 메시지 -->
            <div
              v-if="error"
              class="p-3 rounded-lg bg-red-50 border border-red-200"
            >
              <p class="text-sm text-red-800">{{ error }}</p>
            </div>

            <!-- 버튼 -->
            <div
              class="flex justify-end space-x-4 pt-4 border-t border-gray-200"
            >
              <button type="button" @click="handleClose" class="btn-secondary">
                취소
              </button>
              <button
                type="submit"
                class="btn-primary"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? "수정 중..." : "수정 완료" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, watch } from "vue";
import { reviewAPI } from "@/utils/api";
import RatingInput from "@/components/common/RatingInput.vue";

export default {
  name: "ReviewEditModal",
  components: {
    RatingInput,
  },
  props: {
    review: {
      type: Object,
      required: true,
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close", "updated"],
  setup(props, { emit }) {
    const form = ref({
      title: "",
      content: "",
      ratingOverall: 0,
      ratingNoise: 0,
      ratingLandlord: 0,
      ratingFacility: 0,
    });
    const error = ref("");
    const isSubmitting = ref(false);

    // 리뷰 데이터로 폼 초기화
    const initializeForm = () => {
      if (props.review) {
        form.value = {
          title: props.review.title || "",
          content: props.review.content || "",
          ratingOverall:
            props.review.ratingOverall || props.review.rating_overall || 0,
          ratingNoise:
            props.review.ratingNoise || props.review.rating_noise || 0,
          ratingLandlord:
            props.review.ratingLandlord || props.review.rating_landlord || 0,
          ratingFacility:
            props.review.ratingFacility || props.review.rating_facility || 0,
        };
      }
    };

    // 모달이 열릴 때 폼 초기화
    watch(
      () => props.isOpen,
      (isOpen) => {
        if (isOpen) {
          initializeForm();
          error.value = "";
        }
      },
      { immediate: true }
    );

    const handleClose = () => {
      emit("close");
    };

    const handleSubmit = async () => {
      error.value = "";
      isSubmitting.value = true;

      try {
        const reviewData = {
          title: form.value.title,
          content: form.value.content,
          ratingOverall: form.value.ratingOverall,
          ratingNoise: form.value.ratingNoise,
          ratingLandlord: form.value.ratingLandlord,
          ratingFacility: form.value.ratingFacility,
        };

        const response = await reviewAPI.updateReview(
          props.review.id,
          reviewData
        );

        emit("updated", response.data);
        alert("리뷰가 수정되었습니다.");
      } catch (err) {
        console.error("리뷰 수정 에러:", err);
        error.value =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "리뷰 수정에 실패했습니다.";
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      form,
      error,
      isSubmitting,
      handleClose,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
