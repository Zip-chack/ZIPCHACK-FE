<template>
  <div class="chat-page">
    <div v-if="!authStore.user || !chatStore.currentRoomId">
      <p>Loading chat...</p>
    </div>
    <div v-else class="chat-container">
      <div class="chat-header">
        <div>
          <h3>상대방: {{ chatStore.targetUserNickname || "상대방" }}</h3>
          <span class="status-badge" :class="statusClass">{{
            formattedStatus
          }}</span>
        </div>
        <button
          v-if="chatStore.currentRoomStatus !== 'COMPLETED' && isOwner"
          @click="completeChat"
          class="complete-btn"
        >
          거래 완료
        </button>
      </div>
      <div class="messages-area" ref="messagesArea">
        <div
          v-for="(msg, index) in chatStore.messages"
          :key="msg.id || `temp-${index}`"
          :class="getMessageClass(msg)"
        >
          <p class="msg-content">{{ msg.content }}</p>
          <span class="timestamp" v-if="msg.senderId !== 0">{{
            new Date(msg.createdAt).toLocaleTimeString()
          }}</span>
        </div>
      </div>
      <div class="input-area">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="메시지를 입력하세요..."
          :disabled="
            !authStore.user?.id || chatStore.currentRoomStatus === 'COMPLETED'
          "
        />
        <button
          @click="sendMessage"
          :disabled="
            !authStore.user?.id || chatStore.currentRoomStatus === 'COMPLETED'
          "
        >
          전송
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, computed, watch, nextTick, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useChatStore } from "@/stores/chat";
import { useAuthStore } from "@/stores/auth";

const props = defineProps({
  roomId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(["room-completed"]);

const chatStore = useChatStore();
const authStore = useAuthStore();
const route = useRoute();

const newMessage = ref("");
const messagesArea = ref(null);

const isOwner = computed(() => chatStore.amIOwner);
const myId = computed(() => authStore.user?.id);

const statusClass = computed(() => {
  if (!chatStore.currentRoomStatus) return "";
  return `status-${chatStore.currentRoomStatus.toLowerCase()}`;
});

const formattedStatus = computed(() => {
  const status = chatStore.currentRoomStatus;
  switch (status) {
    case "WAITING":
      return "대기중";
    case "NEGOTIATING":
      return "조율중";
    case "COMPLETED":
      return "거래완료";
    default:
      return status || "";
  }
});

function getMessageClass(msg) {
  if (msg.senderId === 0) return "message system-message";
  // The 'isMine' flag is pre-calculated in the store's normalization function.
  return msg.isMine ? "message my-message" : "message opponent-message";
}

function sendMessage() {
  if (newMessage.value.trim()) {
    chatStore.sendMessage(newMessage.value);
    newMessage.value = "";
  }
}

async function completeChat() {
  if (
    confirm("거래를 완료 처리하시겠습니까? 더 이상 채팅을 보낼 수 없습니다.")
  ) {
    await chatStore.completeChat();
    emit("room-completed", chatStore.currentRoomId);
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesArea.value) {
      messagesArea.value.scrollTop = messagesArea.value.scrollHeight;
    }
  });
}

watch(
  () => chatStore.messages,
  () => {
    scrollToBottom();
  },
  { deep: true, flush: "post" }
);

// Watch for prop changes to switch rooms dynamically
watch(
  () => props.roomId,
  (newId) => {
    if (newId) {
      chatStore.joinRoomById(newId);
    }
  }
);

onMounted(() => {
  const targetRoomId = props.roomId || route.params.roomId;
  if (targetRoomId) {
    chatStore.joinRoomById(targetRoomId);
  }
});

onUnmounted(() => {
  chatStore.disconnect();
});
</script>

<style scoped>
.chat-page {
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  height: 100%; /* Ensure it fills parent */
  box-sizing: border-box;
}
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%; /* Changed from 75vh to fill parent */
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.chat-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9f9f9;
}
.chat-header h3 {
  font-weight: 600;
  font-size: 1.1em;
}
.status-badge {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8em;
  font-weight: 500;
  color: white;
}
.status-waiting {
  background-color: #ff9f43;
}
.status-negotiating {
  background-color: #0abde3;
}
.status-completed {
  background-color: #1dd1a1;
}
.complete-btn {
  background-color: #ff6b6b;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}
.complete-btn:hover {
  background-color: #ee5253;
}
.messages-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #f7f9fb;
}
.message {
  max-width: 75%;
  padding: 10px 15px;
  border-radius: 18px;
  line-height: 1.5;
}
.my-message {
  background-color: #3b82f6;
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}
.opponent-message {
  background-color: #e5e7eb;
  color: #1f2937;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}
.system-message {
  background: none;
  color: #6b7280;
  font-style: italic;
  font-size: 0.9em;
  text-align: center;
  align-self: center;
}
.msg-content {
  margin: 0;
}
.timestamp {
  font-size: 0.75em;
  color: #9ca3af;
  display: block;
  margin-top: 5px;
  text-align: right;
}
.my-message .timestamp {
  color: #a7c4f5;
}
.input-area {
  display: flex;
  padding: 15px;
  border-top: 1px solid #e0e0e0;
  background: #fff;
}
input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  padding: 10px 18px;
  font-size: 1em;
}
input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
button {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 22px;
  margin-left: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}
button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
button:hover:not(:disabled) {
  background-color: #2563eb;
}
</style>
