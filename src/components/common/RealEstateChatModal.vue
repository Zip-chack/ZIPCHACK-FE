<template>
  <Teleport to="body">
    <Transition name="chat-modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black bg-opacity-30 pointer-events-auto"
          @click="close"
        ></div>

        <!-- Chat Modal -->
        <div
          class="relative bg-white rounded-t-xl shadow-2xl w-full max-w-md h-[600px] flex flex-col pointer-events-auto"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-primary-500 text-white rounded-t-xl">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold">부동산 상식 챗봇</h3>
                <p class="text-xs text-primary-100">AI 상담사가 도와드립니다</p>
              </div>
            </div>
            <button
              @click="close"
              class="text-white hover:text-gray-200 transition-colors p-1"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Messages Area -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            <!-- Welcome Message -->
            <div v-if="messages.length === 0" class="text-center py-8">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
                <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">안녕하세요! 부동산 상담사입니다</h3>
              <p class="text-gray-500 mb-6">부동산 관련 궁금한 점을 물어보세요</p>
              
              <!-- Quick Questions -->
              <div class="grid grid-cols-1 gap-2 max-w-sm mx-auto">
                <button
                  v-for="question in quickQuestions"
                  :key="question"
                  @click="sendQuickQuestion(question)"
                  class="text-left px-4 py-2 bg-white hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors shadow-sm"
                >
                  {{ question }}
                </button>
              </div>
            </div>

            <!-- Messages -->
            <div
              v-for="(message, index) in messages"
              :key="index"
              :class="[
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              ]"
            >
              <div
                :class="[
                  'max-w-[80%] rounded-lg px-4 py-2',
                  message.role === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-900 shadow-sm'
                ]"
              >
                <div 
                  v-if="message.role === 'assistant'"
                  class="prose prose-sm max-w-none text-sm"
                  v-html="formatMarkdown(message.content)"
                ></div>
                <div v-else class="whitespace-pre-wrap text-sm">{{ message.content }}</div>
                <div
                  :class="[
                    'text-xs mt-1',
                    message.role === 'user' ? 'text-primary-100' : 'text-gray-400'
                  ]"
                >
                  {{ formatTime(message.timestamp) }}
                </div>
              </div>
            </div>

            <!-- Loading Indicator -->
            <div v-if="isLoading" class="flex justify-start">
              <div class="bg-white rounded-lg px-4 py-2 shadow-sm">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Input Area -->
          <div class="border-t border-gray-200 p-4 bg-white">
            <form @submit.prevent="sendMessage" class="flex gap-2">
              <input
                v-model="inputMessage"
                type="text"
                placeholder="부동산 관련 질문을 입력하세요..."
                class="flex-1 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-sm"
                :disabled="isLoading"
              />
              <button
                type="submit"
                :disabled="isLoading || !inputMessage.trim()"
                class="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <span v-if="isLoading">전송 중...</span>
                <span v-else>전송</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, nextTick, watch } from "vue";
import { realEstateChatAPI } from "@/utils/api";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const messages = ref([]);
const inputMessage = ref("");
const isLoading = ref(false);
const messagesContainer = ref(null);

const quickQuestions = [
  "전세 계약 시 주의사항은?",
  "월세와 전세의 차이점은?",
  "중개수수료는 얼마인가요?",
  "계약서 작성 시 체크리스트",
  "보증금 반환 시 주의사항",
  "원룸 구매 시 확인사항"
];

const sendQuickQuestion = (question) => {
  inputMessage.value = question;
  sendMessage();
};

const sendMessage = async () => {
  const message = inputMessage.value.trim();
  if (!message || isLoading.value) return;

  // 사용자 메시지 추가
  const userMessage = {
    role: "user",
    content: message,
    timestamp: new Date(),
  };
  messages.value.push(userMessage);
  inputMessage.value = "";

  // 대화 히스토리 구성
  const conversationHistory = messages.value
    .filter(m => m.role !== "system")
    .map(m => ({
      role: m.role,
      content: m.content,
    }));

  isLoading.value = true;

  try {
    const response = await realEstateChatAPI.chat(message, conversationHistory);
    
    // 챗봇 응답 추가
    const botMessage = {
      role: "assistant",
      content: response.data.response,
      timestamp: new Date(),
    };
    messages.value.push(botMessage);
  } catch (error) {
    console.error("챗봇 요청 실패:", error);
    const errorMessage = {
      role: "assistant",
      content: "죄송합니다. 답변을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      timestamp: new Date(),
    };
    messages.value.push(errorMessage);
  } finally {
    isLoading.value = false;
    // 스크롤을 맨 아래로
    await nextTick();
    scrollToBottom();
  }
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const formatTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMarkdown = (text) => {
  if (!text) return "";
  
  // 인라인 마크다운 처리 함수 (볼드, 이탤릭 등)
  const processInlineMarkdown = (line) => {
    let processed = line;
    // 볼드 처리 (**텍스트** 또는 __텍스트__)
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
    processed = processed.replace(/__([^_]+)__/g, '<strong class="font-semibold">$1</strong>');
    // 이탤릭 처리 (*텍스트* 또는 _텍스트_)
    processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    processed = processed.replace(/_([^_]+)_/g, '<em>$1</em>');
    // 코드 인라인 처리 (`코드`)
    processed = processed.replace(/`([^`]+)`/g, '<code class="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
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
      formatted += `<h3 class="text-base font-semibold text-gray-900 mb-2 mt-3">${content}</h3>`;
    } else if (trimmed.startsWith("## ")) {
      if (inList) {
        formatted += listType === 'ul' ? "</ul>" : "</ol>";
        inList = false;
        listType = null;
      }
      const content = processInlineMarkdown(trimmed.substring(3));
      formatted += `<h2 class="text-lg font-semibold text-gray-900 mb-2 mt-3">${content}</h2>`;
    } else if (trimmed.startsWith("# ")) {
      if (inList) {
        formatted += listType === 'ul' ? "</ul>" : "</ol>";
        inList = false;
        listType = null;
      }
      const content = processInlineMarkdown(trimmed.substring(2));
      formatted += `<h1 class="text-xl font-semibold text-gray-900 mb-2 mt-3">${content}</h1>`;
    }
    // 리스트 처리
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList || listType !== 'ul') {
        if (inList && listType === 'ol') {
          formatted += "</ol>";
        }
        formatted += '<ul class="list-disc ml-5 mb-2 space-y-1">';
        inList = true;
        listType = 'ul';
      }
      const content = processInlineMarkdown(trimmed.substring(2));
      formatted += `<li>${content}</li>`;
    }
    // 번호 리스트 처리
    else if (/^\d+\.\s/.test(trimmed)) {
      if (!inList || listType !== 'ol') {
        if (inList && listType === 'ul') {
          formatted += "</ul>";
        }
        formatted += '<ol class="list-decimal ml-5 mb-2 space-y-1">';
        inList = true;
        listType = 'ol';
      }
      const content = processInlineMarkdown(trimmed.replace(/^\d+\.\s/, ""));
      formatted += `<li>${content}</li>`;
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
      formatted += `<p class="mb-2 leading-relaxed">${content}</p>`;
    }
  });
  
  // 마지막에 리스트가 열려있으면 닫기
  if (inList) {
    formatted += listType === 'ul' ? "</ul>" : "</ol>";
  }
  
  return formatted;
};

const close = () => {
  emit("close");
};

// 모달이 열릴 때 스크롤을 맨 아래로
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    nextTick(() => {
      scrollToBottom();
    });
  }
});
</script>

<style scoped>
.chat-modal-enter-active,
.chat-modal-leave-active {
  transition: opacity 0.3s ease;
}

.chat-modal-enter-active .bg-white,
.chat-modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.chat-modal-enter-from,
.chat-modal-leave-to {
  opacity: 0;
}

.chat-modal-enter-from .bg-white,
.chat-modal-leave-to .bg-white {
  transform: translateY(100%);
}
</style>

