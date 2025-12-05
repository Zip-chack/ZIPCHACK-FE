<template>
  <div class="h-[calc(100vh-64px)] flex">
    <!-- Map Area -->
    <div class="flex-1 bg-gray-200 relative">
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p class="text-gray-500">카카오맵 API 연동 필요</p>
          <p class="text-sm text-gray-400 mt-2">KAKAO_MAP_KEY 환경변수 설정 후 사용 가능</p>
        </div>
      </div>

      <!-- Building Markers (Demo) -->
      <div
        v-for="building in buildings"
        :key="building.id"
        class="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
        :style="{ left: `${20 + building.id * 25}%`, top: `${30 + building.id * 15}%` }"
        @click="selectBuilding(building)"
      >
        <div
          class="bg-primary-500 text-white px-3 py-2 rounded-lg shadow-lg"
          :class="{ 'ring-2 ring-primary-300': selectedBuilding?.id === building.id }"
        >
          <p class="font-semibold text-sm">{{ building.name }}</p>
          <p class="text-xs opacity-80">평점 {{ building.rating }}</p>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="w-96 bg-white border-l border-gray-200 flex flex-col">
      <!-- Search -->
      <div class="p-4 border-b border-gray-200">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="지역, 건물명 검색"
          class="input"
        />
      </div>

      <!-- View Toggle -->
      <div class="p-4 border-b border-gray-200 flex space-x-2">
        <button
          @click="viewMode = 'list'"
          class="flex-1 py-2 rounded-lg font-medium transition-colors"
          :class="viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'"
        >
          목록
        </button>
        <button
          @click="viewMode = 'map'"
          class="flex-1 py-2 rounded-lg font-medium transition-colors"
          :class="viewMode === 'map' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'"
        >
          지도
        </button>
      </div>

      <!-- Building List or Detail -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="selectedBuilding" class="p-4">
          <button @click="selectedBuilding = null" class="text-primary-500 mb-4 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            목록으로
          </button>

          <h2 class="text-xl font-bold text-gray-900 mb-2">{{ selectedBuilding.name }}</h2>
          <p class="text-gray-600 text-sm mb-4">{{ selectedBuilding.road_address }}</p>

          <div class="flex items-center mb-6">
            <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span class="ml-1 font-semibold">{{ selectedBuilding.rating }}</span>
            <span class="text-gray-500 ml-1">({{ selectedBuilding.review_count }}개 리뷰)</span>
          </div>

          <router-link
            :to="`/buildings/${selectedBuilding.id}/review`"
            class="btn-primary w-full text-center block"
          >
            리뷰 작성하기
          </router-link>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <button
            v-for="building in filteredBuildings"
            :key="building.id"
            @click="selectBuilding(building)"
            class="w-full p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <h3 class="font-semibold text-gray-900">{{ building.name }}</h3>
            <p class="text-sm text-gray-500 mb-2">{{ building.road_address }}</p>
            <div class="flex items-center text-sm">
              <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span class="ml-1 font-medium">{{ building.rating }}</span>
              <span class="text-gray-400 ml-1">({{ building.review_count }})</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useBuildingStore } from '@/stores/building'

export default {
  name: 'MapPage',
  setup() {
    const buildingStore = useBuildingStore()

    const searchQuery = ref('')
    const viewMode = ref('list')
    const selectedBuilding = ref(null)

    const buildings = computed(() => buildingStore.buildings)

    onMounted(async () => {
      await buildingStore.fetchBuildings()
    })

    const filteredBuildings = computed(() => {
      if (!searchQuery.value) return buildings.value
      const query = searchQuery.value.toLowerCase()
      return buildings.value.filter(b =>
        b.name.toLowerCase().includes(query) ||
        b.road_address.toLowerCase().includes(query)
      )
    })

    function selectBuilding(building) {
      selectedBuilding.value = building
    }

    return {
      searchQuery,
      viewMode,
      selectedBuilding,
      buildings,
      filteredBuildings,
      selectBuilding
    }
  }
}
</script>
