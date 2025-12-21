<template>
  <div class="container mx-auto p-4 h-[calc(100vh-80px)] flex gap-4 overflow-hidden">
    <!-- Chat List Section -->
    <div 
      class="flex flex-col transition-all duration-300 ease-in-out h-full"
      :class="selectedRoomId ? 'w-1/3' : 'w-full'"
    >
      <h1 class="text-2xl font-bold mb-4 flex-shrink-0">내 채팅 목록</h1>
      
      <div v-if="isLoading" class="text-center py-10">
        <p>채팅 목록을 불러오는 중...</p>
      </div>
      
      <div v-else-if="chatRooms.length === 0" class="text-center py-10">
        <p>참여 중인 채팅방이 없습니다.</p>
      </div>
      
      <div v-else class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <ul>
          <li 
            v-for="room in chatRooms" 
            :key="room.roomId" 
            @click="selectRoom(room.roomId)" 
            class="border p-4 mb-2 rounded-lg cursor-pointer transition-colors relative"
            :class="[
              selectedRoomId === room.roomId ? 'bg-blue-50 border-blue-200 shadow-sm' : 'hover:bg-gray-50 bg-white'
            ]"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1 min-w-0 mr-2">
                <p class="font-semibold truncate text-gray-900">상대방: {{ room.targetUserNickname }}</p>
                <p class="text-sm text-gray-500 truncate mt-1">{{ room.lastMessage || '대화 내용이 없습니다.' }}</p>
              </div>
              <div class="flex flex-col items-end gap-2 flex-shrink-0">
                <span 
                  class="text-xs px-2 py-1 rounded-full font-medium"
                  :class="statusBadgeClass(room.status)"
                >
                  {{ formatStatus(room.status) }}
                </span>
                <button 
                  @click.stop="deleteChat(room.roomId)" 
                  class="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                >
                  나가기
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Chat Room Section (Sliding Panel) -->
    <div 
      class="transition-all duration-300 ease-in-out h-full overflow-hidden"
      :class="selectedRoomId ? 'w-2/3 opacity-100' : 'w-0 opacity-0'"
    >
      <div v-if="selectedRoomId" class="h-full border rounded-xl overflow-hidden shadow-lg bg-white">
        <ChatRoomPage :roomId="selectedRoomId" />
      </div>
      <div v-else class="h-full flex items-center justify-center bg-gray-50 border rounded-xl">
        <p class="text-gray-400">채팅방을 선택해주세요</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { chatAPI } from '@/utils/api'; 
import ChatRoomPage from './ChatRoomPage.vue';

const router = useRouter();
const chatRooms = ref([]);
const isLoading = ref(true);
const selectedRoomId = ref(null);

onMounted(async () => {
  try {
    const response = await chatAPI.getMyChatRooms();
    chatRooms.value = response.data;
  } catch (error) {
    console.error('Failed to fetch chat rooms:', error);
    alert('채팅 목록을 불러오는데 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
});

function selectRoom(roomId) {
  selectedRoomId.value = roomId;
}

async function deleteChat(roomId) {
  if (confirm('정말로 이 채팅방을 나가시겠습니까? 대화 내용이 모두 삭제됩니다.')) {
    try {
      await chatAPI.deleteChatRoom(roomId);
      // Update UI
      chatRooms.value = chatRooms.value.filter(room => room.roomId !== roomId);
      if (selectedRoomId.value === roomId) {
        selectedRoomId.value = null;
      }
      alert('채팅방에서 나갔습니다.');
    } catch (error) {
      console.error('Failed to delete chat room:', error);
      alert('채팅방 나가기에 실패했습니다.');
    }
  }
}

function formatStatus(status) {
  switch (status) {
    case 'WAITING': return '대기중';
    case 'NEGOTIATING': return '조율중';
    case 'COMPLETED': return '거래완료';
    default: return status;
  }
}

function statusBadgeClass(status) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-700';
    case 'NEGOTIATING':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}
</script>

<style scoped>
/* Custom scrollbar for webkit browsers */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1; 
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; 
}
</style>
