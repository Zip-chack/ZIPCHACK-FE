<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }}
    </label>

    <!-- 이미지 미리보기 -->
    <div v-if="previewUrl" class="relative inline-block">
      <img
        :src="previewUrl"
        alt="미리보기"
        class="w-full h-48 object-cover rounded-lg border border-gray-300"
      />
      <button
        v-if="!disabled"
        @click="removeImage"
        type="button"
        class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
      >
        <svg
          class="w-5 h-5"
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

    <!-- 파일 선택 버튼 -->
    <div v-if="!previewUrl || allowMultiple">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
        :disabled="disabled"
      />
      <button
        v-if="!disabled"
        @click="$refs.fileInput.click()"
        type="button"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span class="text-gray-700">이미지 선택</span>
      </button>
    </div>

    <!-- 업로드 중 표시 -->
    <div v-if="isUploading" class="text-sm text-gray-600">업로드 중...</div>

    <!-- 에러 메시지 -->
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import { imageAPI } from "@/utils/api";

export default {
  name: "ImageUpload",
  props: {
    modelValue: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: "",
    },
    folder: {
      type: String,
      default: "uploads",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    allowMultiple: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "uploaded", "error"],
  setup(props, { emit }) {
    const fileInput = ref(null);
    const previewUrl = ref(props.modelValue || null);
    const isUploading = ref(false);
    const error = ref("");

    // modelValue 변경 감지
    watch(
      () => props.modelValue,
      (newValue) => {
        previewUrl.value = newValue;
      }
    );

    async function handleFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      // 파일 크기 검증 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        error.value = "파일 크기는 10MB를 초과할 수 없습니다.";
        emit("error", error.value);
        return;
      }

      // 파일 타입 검증
      if (!file.type.startsWith("image/")) {
        error.value = "이미지 파일만 업로드 가능합니다.";
        emit("error", error.value);
        return;
      }

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        previewUrl.value = e.target.result;
      };
      reader.readAsDataURL(file);

      // 업로드
      isUploading.value = true;
      error.value = "";

      try {
        console.log("[ImageUpload] 업로드 시작:", {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          folder: props.folder,
        });

        const response = await imageAPI.uploadImage(file, props.folder);
        console.log("[ImageUpload] 업로드 성공:", response.data);

        const imageUrl = response.data.url;

        previewUrl.value = imageUrl;
        emit("update:modelValue", imageUrl);
        emit("uploaded", imageUrl);
      } catch (err) {
        console.error("[ImageUpload] 업로드 실패:", err);
        console.error("[ImageUpload] 에러 상세:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });

        error.value =
          err.response?.data?.error ||
          err.message ||
          "이미지 업로드에 실패했습니다.";
        emit("error", error.value);
        previewUrl.value = null;
      } finally {
        isUploading.value = false;
        // 파일 입력 초기화
        if (fileInput.value) {
          fileInput.value.value = "";
        }
      }
    }

    function removeImage() {
      previewUrl.value = null;
      emit("update:modelValue", null);
      if (fileInput.value) {
        fileInput.value.value = "";
      }
    }

    return {
      fileInput,
      previewUrl,
      isUploading,
      error,
      handleFileSelect,
      removeImage,
    };
  },
};
</script>
