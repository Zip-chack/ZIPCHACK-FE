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
            <div class="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-gray-800">
              <div
                class="markdown-content"
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
        processed = processed.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">$1</code>');
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
          formatted += `<h3 class="text-lg font-semibold text-gray-900 mb-3 mt-4 first:mt-0">${content}</h3>`;
        } else if (trimmed.startsWith("## ")) {
          if (inList) {
            formatted += listType === 'ul' ? "</ul>" : "</ol>";
            inList = false;
            listType = null;
          }
          const content = processInlineMarkdown(trimmed.substring(3));
          formatted += `<h2 class="text-xl font-semibold text-gray-900 mb-3 mt-4 first:mt-0">${content}</h2>`;
        } else if (trimmed.startsWith("# ")) {
          if (inList) {
            formatted += listType === 'ul' ? "</ul>" : "</ol>";
            inList = false;
            listType = null;
          }
          const content = processInlineMarkdown(trimmed.substring(2));
          formatted += `<h1 class="text-2xl font-bold text-gray-900 mb-4 mt-4 first:mt-0">${content}</h1>`;
        }
        // 리스트 처리 (-, *, •)
        else if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
          if (!inList || listType !== 'ul') {
            if (inList && listType === 'ol') {
              formatted += "</ol>";
            }
            formatted += '<ul class="list-disc ml-6 mb-3 space-y-2 text-gray-700">';
            inList = true;
            listType = 'ul';
          }
          const content = processInlineMarkdown(trimmed.substring(2));
          formatted += `<li class="leading-relaxed">${content}</li>`;
        }
        // 번호 리스트 처리
        else if (/^\d+\.\s/.test(trimmed)) {
          if (!inList || listType !== 'ol') {
            if (inList && listType === 'ul') {
              formatted += "</ul>";
            }
            formatted += '<ol class="list-decimal ml-6 mb-3 space-y-2 text-gray-700">';
            inList = true;
            listType = 'ol';
          }
          const content = processInlineMarkdown(trimmed.replace(/^\d+\.\s/, ""));
          formatted += `<li class="leading-relaxed">${content}</li>`;
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
          formatted += `<p class="mb-3 leading-relaxed text-gray-700">${content}</p>`;
        }
      });
      
      // 마지막에 리스트가 열려있으면 닫기
      if (inList) {
        formatted += listType === 'ul' ? "</ul>" : "</ol>";
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

/* 마크다운 콘텐츠 스타일 */
:deep(.markdown-content) {
  line-height: 1.7;
}

:deep(.markdown-content h1) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  color: #111827;
}

:deep(.markdown-content h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.75rem;
  color: #111827;
}

:deep(.markdown-content h3) {
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #111827;
}

:deep(.markdown-content p) {
  margin-bottom: 0.75rem;
  line-height: 1.7;
  color: #374151;
}

:deep(.markdown-content ul) {
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
  list-style-type: disc;
}

:deep(.markdown-content ol) {
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
  list-style-type: decimal;
}

:deep(.markdown-content li) {
  margin-bottom: 0.5rem;
  line-height: 1.7;
}

:deep(.markdown-content strong) {
  font-weight: 600;
  color: #111827;
}

:deep(.markdown-content em) {
  font-style: italic;
}

:deep(.markdown-content code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  color: #1f2937;
}

:deep(.markdown-content h1:first-child),
:deep(.markdown-content h2:first-child),
:deep(.markdown-content h3:first-child) {
  margin-top: 0;
}
</style>
