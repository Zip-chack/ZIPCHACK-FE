<template>
  <div class="card p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-gray-900">매물 분석</h3>
    </div>

    <div v-if="isGeneratingReport" class="text-center py-4">
      <div
        class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mb-2"
      ></div>
      <p class="text-gray-500 text-sm">분석 리포트를 생성하는 중입니다...</p>
    </div>

    <div v-else-if="savedReport">
      <!-- 리포트 미리보기 -->
      <div class="mb-4">
        <p class="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {{ reportPreview }}
        </p>
      </div>
      <button
        @click="showReportModal = true"
        class="btn-secondary w-full py-2 text-sm font-semibold"
      >
        자세히 보기
      </button>
    </div>

    <div v-else>
      <button
        @click="generateReport"
        class="btn-primary w-full py-2.5 text-sm font-semibold"
      >
        분석 리포트 생성하기
      </button>
    </div>

    <!-- Report Modal -->
    <ReportModal
      :is-open="showReportModal"
      :report="savedReport"
      @close="showReportModal = false"
    />
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { kakaoMapAPI } from "@/utils/api";
import ReportModal from "@/components/common/ReportModal.vue";

export default {
  name: "CommerceAnalysis",
  components: {
    ReportModal,
  },
  props: {
    buildingId: {
      type: [Number, String],
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    radius: {
      type: Number,
      default: 500,
    },
  },
  setup(props) {
    const isGeneratingReport = ref(false);
    const savedReport = ref("");
    const showReportModal = ref(false);

    // 리포트 저장 키 생성
    const getReportKey = (buildingId) => {
      return `commerce_report_${buildingId}`;
    };

    // 리포트 미리보기 (500자)
    const reportPreview = computed(() => {
      if (!savedReport.value) return "";
      // 마크다운 형식의 텍스트에서 HTML 태그나 마크다운 문법 제거
      let text = savedReport.value
        .replace(/<[^>]*>/g, "") // HTML 태그 제거
        .replace(/^#{1,6}\s+/gm, "") // 마크다운 헤더 제거
        .replace(/^\s*[-*+]\s+/gm, "") // 마크다운 리스트 제거
        .replace(/\*\*([^*]+)\*\*/g, "$1") // 볼드 제거
        .replace(/\*([^*]+)\*/g, "$1") // 이탤릭 제거
        .trim();

      // 줄바꿈은 유지하되 연속된 줄바꿈은 하나로
      text = text.replace(/\n{3,}/g, "\n\n");

      return text.length > 500 ? text.substring(0, 500) + "..." : text;
    });

    // 건물이 변경될 때 저장된 리포트 불러오기
    watch(
      () => props.buildingId,
      (buildingId) => {
        if (buildingId) {
          const stored = localStorage.getItem(getReportKey(buildingId));
          savedReport.value = stored || "";
        } else {
          savedReport.value = "";
        }
        showReportModal.value = false;
      },
      { immediate: true }
    );

    // 리포트 생성
    const generateReport = async () => {
      if (!props.lat || !props.lng) {
        alert("건물 위치 정보가 없습니다.");
        return;
      }

      isGeneratingReport.value = true;
      try {
        const reportResponse = await kakaoMapAPI.getCommerceReport(
          props.lat,
          props.lng,
          props.radius
        );
        const report = reportResponse.data.report;
        savedReport.value = report;

        // localStorage에 저장
        if (props.buildingId) {
          localStorage.setItem(getReportKey(props.buildingId), report);
        }
      } catch (err) {
        console.error("레포트 생성 실패:", err);
        alert("레포트를 생성하는데 실패했습니다.");
      } finally {
        isGeneratingReport.value = false;
      }
    };

    return {
      isGeneratingReport,
      savedReport,
      showReportModal,
      reportPreview,
      generateReport,
    };
  },
};
</script>
