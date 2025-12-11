<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="close"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          <!-- 헤더 -->
          <div
            class="flex items-center justify-between p-6 border-b border-gray-200"
          >
            <h2 class="text-xl font-bold text-gray-900">매물 분석 리포트</h2>
            <button
              @click="close"
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

          <!-- 콘텐츠 -->
          <div class="flex-1 overflow-y-auto p-6">
            <div class="prose prose-sm max-w-none">
              <div
                class="text-gray-700 whitespace-pre-line"
                v-html="formattedReport"
              ></div>
            </div>
          </div>

          <!-- 푸터 -->
          <div class="p-6 border-t border-gray-200">
            <button
              @click="close"
              class="btn-primary w-full py-2.5 font-semibold"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { computed } from "vue";

export default {
  name: "ReportModal",
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    report: {
      type: String,
      default: "",
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const close = () => {
      emit("close");
    };

    const formatReport = (text) => {
      if (!text) return "";

      // 줄 단위로 분리
      const lines = text.split("\n");
      let formatted = "";
      let inList = false;

      lines.forEach((line) => {
        const trimmed = line.trim();

        // 헤더 처리
        if (trimmed.startsWith("### ")) {
          if (inList) {
            formatted += "</ul>";
            inList = false;
          }
          formatted += `<h3 class="text-lg font-semibold text-gray-900 mb-3 mt-4">${trimmed.substring(
            4
          )}</h3>`;
        } else if (trimmed.startsWith("## ")) {
          if (inList) {
            formatted += "</ul>";
            inList = false;
          }
          formatted += `<h2 class="text-xl font-semibold text-gray-900 mb-3 mt-4">${trimmed.substring(
            3
          )}</h2>`;
        } else if (trimmed.startsWith("# ")) {
          if (inList) {
            formatted += "</ul>";
            inList = false;
          }
          formatted += `<h1 class="text-2xl font-semibold text-gray-900 mb-4 mt-4">${trimmed.substring(
            2
          )}</h1>`;
        }
        // 리스트 처리
        else if (trimmed.startsWith("- ")) {
          if (!inList) {
            formatted += '<ul class="list-disc ml-6 mb-3 space-y-1">';
            inList = true;
          }
          formatted += `<li>${trimmed.substring(2)}</li>`;
        }
        // 빈 줄 처리
        else if (trimmed === "") {
          if (inList) {
            formatted += "</ul>";
            inList = false;
          }
          formatted += "<br>";
        }
        // 일반 텍스트 처리
        else {
          if (inList) {
            formatted += "</ul>";
            inList = false;
          }
          if (
            formatted.endsWith("</h3>") ||
            formatted.endsWith("</h2>") ||
            formatted.endsWith("</h1>")
          ) {
            formatted += `<p class="mb-3 leading-relaxed">${trimmed}</p>`;
          } else if (
            !formatted.endsWith("</p>") &&
            !formatted.endsWith("<br>")
          ) {
            formatted += `<p class="mb-3 leading-relaxed">${trimmed}</p>`;
          } else {
            formatted += `<p class="mb-3 leading-relaxed">${trimmed}</p>`;
          }
        }
      });

      // 마지막에 리스트가 열려있으면 닫기
      if (inList) {
        formatted += "</ul>";
      }

      return formatted;
    };

    const formattedReport = computed(() => {
      return formatReport(props.report);
    });

    return {
      close,
      formattedReport,
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

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.9);
}
</style>
