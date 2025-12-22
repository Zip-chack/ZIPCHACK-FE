<template>
  <div id="app" class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <router-view />
    </main>
    <AppFooter />
    
    <!-- Floating Chat Button -->
    <button
      @click="toggleChat"
      class="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
      :class="{ 'opacity-0 pointer-events-none': isChatOpen }"
    >
      <svg v-if="!isChatOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    
    <!-- Chat Modal -->
    <RealEstateChatModal :isOpen="isChatOpen" @close="closeChat" />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import RealEstateChatModal from '@/components/common/RealEstateChatModal.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter,
    RealEstateChatModal
  },
  setup() {
    const isChatOpen = ref(false)
    
    const toggleChat = () => {
      isChatOpen.value = !isChatOpen.value
    }
    
    const openChat = () => {
      isChatOpen.value = true
    }
    
    const closeChat = () => {
      isChatOpen.value = false
    }
    
    // 전역 이벤트 리스너 등록
    const handleOpenChatModal = () => {
      openChat()
    }
    
    // 컴포넌트 마운트 시 이벤트 리스너 등록
    onMounted(() => {
      window.addEventListener('open-chat-modal', handleOpenChatModal)
    })
    
    onUnmounted(() => {
      window.removeEventListener('open-chat-modal', handleOpenChatModal)
    })
    
    return {
      isChatOpen,
      toggleChat,
      openChat,
      closeChat
    }
  }
}
</script>
