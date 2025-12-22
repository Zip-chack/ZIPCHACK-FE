<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">부동산 상식 챗봇</h1>
        <p class="text-gray-600">
          부동산 거래, 전세/월세, 주의사항 등에 대해 물어보세요
        </p>
      </div>

      <!-- Chat Container -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col" style="height: calc(100vh - 250px);">
        <!-- Messages Area -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-4">
          <!-- Welcome Message -->
          <div v-if="messages.length === 0" class="text-center py-12">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">안녕하세요! 부동산 상담사입니다</h3>
            <p class="text-gray-500 mb-6">부동산 관련 궁금한 점을 물어보세요</p>
            
            <!-- Quick Questions -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              <button
                v-for="question in quickQuestions"
                :key="question"
                @click="sendQuickQuestion(question)"
                class="text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
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
                'max-w-3xl rounded-lg px-4 py-3',
                message.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              ]"
            >
              <div 
                v-if="message.role === 'assistant'"
                class="prose prose-sm max-w-none"
                v-html="formatMarkdown(message.content)"
              ></div>
              <div v-else class="whitespace-pre-wrap">{{ message.content }}</div>
              <div
                :class="[
                  'text-xs mt-1',
                  message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                ]"
              >
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
          </div>

          <!-- Loading Indicator -->
          <div v-if="isLoading" class="flex justify-start">
            <div class="bg-gray-100 rounded-lg px-4 py-3">
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="border-t border-gray-200 p-4">
          <form @submit.prevent="sendMessage" class="flex gap-3">
            <input
              v-model="inputMessage"
              type="text"
              placeholder="부동산 관련 질문을 입력하세요..."
              class="flex-1 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
              :disabled="isLoading"
            />
            <button
              type="submit"
              :disabled="isLoading || !inputMessage.trim()"
              class="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading">전송 중...</span>
              <span v-else>전송</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from "vue";
import { realEstateChatAPI } from "@/utils/api";

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

onMounted(() => {
  scrollToBottom();
});
</script>
