<template>
  <header class="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">Z</span>
          </div>
          <span class="text-xl font-bold text-gray-900">ZIP-Chack</span>
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <router-link to="/listings" class="text-gray-600 hover:text-primary-500 font-medium transition-colors">
            매물 찾기
          </router-link>
          <router-link to="/map" class="text-gray-600 hover:text-primary-500 font-medium transition-colors">
            지도 검색
          </router-link>
          <router-link to="/favorites" class="text-gray-600 hover:text-primary-500 font-medium transition-colors">
            찜 목록
          </router-link>
        </nav>

        <!-- Auth Buttons -->
        <div class="hidden md:flex items-center space-x-4">
          <template v-if="authStore.isLoggedIn">
            <span class="text-gray-600">{{ authStore.user?.nickname }}님</span>
            <button @click="authStore.logout" class="btn-secondary">로그아웃</button>
          </template>
          <template v-else>
            <router-link to="/login" class="btn-secondary">로그인</router-link>
            <router-link to="/register" class="btn-primary">회원가입</router-link>
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="md:hidden p-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div v-if="isMobileMenuOpen" class="md:hidden py-4 border-t border-gray-100">
        <nav class="flex flex-col space-y-4">
          <router-link to="/listings" class="text-gray-600 hover:text-primary-500 font-medium">매물 찾기</router-link>
          <router-link to="/map" class="text-gray-600 hover:text-primary-500 font-medium">지도 검색</router-link>
          <router-link to="/favorites" class="text-gray-600 hover:text-primary-500 font-medium">찜 목록</router-link>
          <div class="flex space-x-4 pt-4 border-t border-gray-100">
            <router-link to="/login" class="btn-secondary flex-1 text-center">로그인</router-link>
            <router-link to="/register" class="btn-primary flex-1 text-center">회원가입</router-link>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'AppHeader',
  setup() {
    const authStore = useAuthStore()
    const isMobileMenuOpen = ref(false)

    return {
      authStore,
      isMobileMenuOpen
    }
  }
}
</script>
