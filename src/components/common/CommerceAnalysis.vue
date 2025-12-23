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
        <div class="markdown-preview prose prose-sm max-w-none">
          <div
            class="text-gray-700 text-sm leading-relaxed"
            v-html="formattedPreview"
          ></div>
        </div>
      </div>
      <div class="flex gap-2">
        <button
          @click="showReportModal = true"
          class="btn-secondary flex-1 py-2 text-sm font-semibold"
        >
          자세히 보기
        </button>
        <button
          @click="regenerateReport"
          class="btn-primary flex-1 py-2 text-sm font-semibold"
          :disabled="isGeneratingReport"
        >
          다시 만들기
        </button>
      </div>
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

    // 마크다운 포맷팅 함수
    const formatMarkdown = (text) => {
      if (!text) return "";
      
      // 인라인 마크다운 처리 함수 (볼드, 이탤릭 등)
      const processInlineMarkdown = (line) => {
        let processed = line;
        // 볼드 처리 (**텍스트** 또는 __텍스트__)
        processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
        processed = processed.replace(/__([^_]+)__/g, '<strong class="font-semibold text-gray-900">$1</strong>');
        // 이탤릭 처리 (*텍스트* 또는 _텍스트_)
        processed = processed.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
        processed = processed.replace(/_([^_]+)_/g, '<em class="italic">$1</em>');
        // 코드 인라인 처리 (`코드`)
        processed = processed.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800">$1</code>');
        return processed;
      };
      
      // 줄 단위로 분리
      const lines = text.split("\n");
      let formatted = "";
      let inList = false;
      let listType = null; // 'ul' or 'ol'
      
      lines.forEach((line) => {
        const trimmed = line.trim();
        
        // 헤더 처리
        if (trimmed.startsWith("### ")) {
          if (inList) {
            formatted += listType === 'ul' ? "</ul>" : "</ol>";
            inList = false;
            listType = null;
          }
          const content = processInlineMarkdown(trimmed.substring(4));
          formatted += `<h3 class="text-base font-semibold text-gray-900 mb-2 mt-3 first:mt-0">${content}</h3>`;
        } else if (trimmed.startsWith("## ")) {
          if (inList) {
            formatted += listType === 'ul' ? "</ul>" : "</ol>";
            inList = false;
            listType = null;
          }
          const content = processInlineMarkdown(trimmed.substring(3));
          formatted += `<h2 class="text-lg font-semibold text-gray-900 mb-2 mt-3 first:mt-0">${content}</h2>`;
        } else if (trimmed.startsWith("# ")) {
          if (inList) {
            formatted += listType === 'ul' ? "</ul>" : "</ol>";
            inList = false;
            listType = null;
          }
          const content = processInlineMarkdown(trimmed.substring(2));
          formatted += `<h1 class="text-xl font-bold text-gray-900 mb-3 mt-3 first:mt-0">${content}</h1>`;
        }
        // 리스트 처리 (-, *, •)
        else if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
          if (!inList || listType !== 'ul') {
            if (inList && listType === 'ol') {
              formatted += "</ol>";
            }
            formatted += '<ul class="list-disc ml-5 mb-2 space-y-1 text-gray-700">';
            inList = true;
            listType = 'ul';
          }
          const content = processInlineMarkdown(trimmed.substring(2));
          formatted += `<li class="leading-relaxed text-sm">${content}</li>`;
        }
        // 번호 리스트 처리
        else if (/^\d+\.\s/.test(trimmed)) {
          if (!inList || listType !== 'ol') {
            if (inList && listType === 'ul') {
              formatted += "</ul>";
            }
            formatted += '<ol class="list-decimal ml-5 mb-2 space-y-1 text-gray-700">';
            inList = true;
            listType = 'ol';
          }
          const content = processInlineMarkdown(trimmed.replace(/^\d+\.\s/, ""));
          formatted += `<li class="leading-relaxed text-sm">${content}</li>`;
        }
        // 빈 줄 처리
        else if (trimmed === "") {
          if (inList) {
            formatted += listType === 'ul' ? "</ul>" : "</ol>";
            inList = false;
            listType = null;
          }
          formatted += "<br>";
        }
        // 일반 텍스트 처리
        else {
          if (inList) {
            formatted += listType === 'ul' ? "</ul>" : "</ol>";
            inList = false;
            listType = null;
          }
          const content = processInlineMarkdown(trimmed);
          formatted += `<p class="mb-2 leading-relaxed text-sm text-gray-700">${content}</p>`;
        }
      });
      
      // 마지막에 리스트가 열려있으면 닫기
      if (inList) {
        formatted += listType === 'ul' ? "</ul>" : "</ol>";
      }
      
      return formatted;
    };

    // 리포트 미리보기 (마크다운 적용, 원본 텍스트 기준 500자 제한)
    const formattedPreview = computed(() => {
      if (!savedReport.value) return "";
      
      // 원본 텍스트에서 HTML 태그와 마크다운 문법을 제거하여 길이 확인
      let plainText = savedReport.value
        .replace(/<[^>]*>/g, "") // HTML 태그 제거
        .replace(/^#{1,6}\s+/gm, "") // 마크다운 헤더 제거
        .replace(/^\s*[-*+•]\s+/gm, "") // 마크다운 리스트 제거
        .replace(/\*\*([^*]+)\*\*/g, "$1") // 볼드 제거
        .replace(/\*([^*]+)\*/g, "$1") // 이탤릭 제거
        .replace(/`([^`]+)`/g, "$1") // 코드 제거
        .trim();
      
      // 500자 초과 시 원본 텍스트를 자르기
      let textToFormat = savedReport.value;
      if (plainText.length > 500) {
        // 원본 텍스트를 500자 정도로 자르기 (줄 단위로)
        const lines = savedReport.value.split('\n');
        let charCount = 0;
        let truncatedLines = [];
        
        for (const line of lines) {
          const linePlainText = line
            .replace(/<[^>]*>/g, "")
            .replace(/^#{1,6}\s+/gm, "")
            .replace(/^\s*[-*+•]\s+/gm, "")
            .replace(/\*\*([^*]+)\*\*/g, "$1")
            .replace(/\*([^*]+)\*/g, "$1")
            .replace(/`([^`]+)`/g, "$1");
          
          if (charCount + linePlainText.length > 500) {
            break;
          }
          truncatedLines.push(line);
          charCount += linePlainText.length;
        }
        
        textToFormat = truncatedLines.join('\n') + '\n\n...';
      }
      
      // 마크다운 포맷팅 적용
      return formatMarkdown(textToFormat);
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

    // 리포트 다시 생성
    const regenerateReport = async () => {
      // 기존 리포트 삭제
      savedReport.value = "";
      if (props.buildingId) {
        localStorage.removeItem(getReportKey(props.buildingId));
      }
      showReportModal.value = false;
      
      // 새 리포트 생성
      await generateReport();
    };

    return {
      isGeneratingReport,
      savedReport,
      showReportModal,
      formattedPreview,
      generateReport,
      regenerateReport,
    };
  },
};
</script>

<style scoped>
/* 마크다운 미리보기 스타일 */
:deep(.markdown-preview) {
  line-height: 1.6;
}

:deep(.markdown-preview h1) {
  font-size: 1.125rem;
  font-weight: 700;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
  color: #111827;
}

:deep(.markdown-preview h2) {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
  color: #111827;
}

:deep(.markdown-preview h3) {
  font-size: 0.875rem;
  font-weight: 600;
  margin-top: 0.5rem;
  margin-bottom: 0.375rem;
  color: #111827;
}

:deep(.markdown-preview p) {
  margin-bottom: 0.5rem;
  line-height: 1.6;
  color: #374151;
  font-size: 0.875rem;
}

:deep(.markdown-preview ul),
:deep(.markdown-preview ol) {
  margin-bottom: 0.5rem;
  padding-left: 1.25rem;
}

:deep(.markdown-preview li) {
  margin-bottom: 0.25rem;
  line-height: 1.6;
  font-size: 0.875rem;
}

:deep(.markdown-preview strong) {
  font-weight: 600;
  color: #111827;
}

:deep(.markdown-preview em) {
  font-style: italic;
}

:deep(.markdown-preview code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  color: #1f2937;
}

:deep(.markdown-preview h1:first-child),
:deep(.markdown-preview h2:first-child),
:deep(.markdown-preview h3:first-child) {
  margin-top: 0;
}
</style>
