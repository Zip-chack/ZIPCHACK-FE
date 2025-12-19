<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">내 채팅 목록</h1>
    <div v-if="isLoading" class="text-center">
      <p>채팅 목록을 불러오는 중...</p>
    </div>
    <div v-else-if="chatRooms.length === 0" class="text-center">
      <p>참여 중인 채팅방이 없습니다.</p>
    </div>
    <div v-else>
      <ul>
        <li v-for="room in chatRooms" :key="room.roomId" @click="goToChat(room.roomId)" class="border p-4 mb-2 rounded-lg cursor-pointer hover:bg-gray-100">
          <div class="flex justify-between items-center">
            <div>
              <p class="font-semibold">상대방: {{ room.targetUserNickname }}</p>
              <p class="text-sm text-gray-600">{{ room.lastMessage }}</p>
            </div>
            <div class="flex items-center">
              <p class="text-sm mr-4" :class="statusClass(room.status)">{{ room.status }}</p>
              <button @click.stop="deleteChat(room.roomId)" class="btn-danger text-sm">삭제</button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { chatAPI } from '@/utils/api'; 

const router = useRouter();
const chatRooms = ref([]);
const isLoading = ref(true);

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

function goToChat(roomId) {
  router.push({ name: 'ChatRoom', params: { roomId } });
}

async function deleteChat(roomId) {
  if (confirm('정말로 이 채팅방을 삭제하시겠습니까? 모든 메시지가 영구적으로 삭제됩니다.')) {
    try {
      await chatAPI.deleteChatRoom(roomId);
      // Update UI by removing the deleted room
      chatRooms.value = chatRooms.value.filter(room => room.roomId !== roomId);
      alert('채팅방이 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete chat room:', error);
      alert('채팅방 삭제에 실패했습니다.');
    }
  }
}

function statusClass(status) {
  switch (status) {
    case 'COMPLETED':
      return 'text-green-500';
    case 'NEGOTIATING':
      return 'text-blue-500';
    default:
      return 'text-gray-500';
  }
}
</script>
