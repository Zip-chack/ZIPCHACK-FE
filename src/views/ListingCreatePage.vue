<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-8">매물 등록</h1>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Building Selection -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">건물 정보</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">건물 검색</label>
            <input
              v-model="form.buildingSearch"
              type="text"
              placeholder="건물명 또는 주소로 검색"
              class="input"
              @input="searchBuildings"
            />
          </div>
          <div v-if="searchedBuildings.length > 0" class="border rounded-lg divide-y">
            <button
              v-for="building in searchedBuildings"
              :key="building.id"
              type="button"
              @click="selectBuilding(building)"
              class="w-full p-4 text-left hover:bg-gray-50 flex justify-between items-center"
              :class="{ 'bg-primary-50': form.selectedBuilding?.id === building.id }"
            >
              <div>
                <p class="font-medium text-gray-900">{{ building.name }}</p>
                <p class="text-sm text-gray-500">{{ building.road_address }}</p>
              </div>
              <svg v-if="form.selectedBuilding?.id === building.id" class="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Room Details -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">매물 정보</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">제목</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="매물 제목을 입력하세요"
              class="input"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">방 종류</label>
              <select v-model="form.roomType" class="input" required>
                <option value="">선택</option>
                <option value="원룸">원룸</option>
                <option value="1.5룸">1.5룸</option>
                <option value="투룸">투룸</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">층수</label>
              <input
                v-model.number="form.floor"
                type="number"
                placeholder="층"
                class="input"
                required
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">면적 (m2)</label>
            <input
              v-model.number="form.area"
              type="number"
              placeholder="면적"
              class="input"
              required
            />
          </div>
        </div>
      </div>

      <!-- Price -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">가격 정보</h2>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">보증금 (만원)</label>
            <input
              v-model.number="form.deposit"
              type="number"
              placeholder="보증금"
              class="input"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">월세 (만원)</label>
            <input
              v-model.number="form.monthlyRent"
              type="number"
              placeholder="월세"
              class="input"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">관리비 (만원)</label>
            <input
              v-model.number="form.maintenanceFee"
              type="number"
              placeholder="관리비"
              class="input"
            />
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">상세 설명</h2>
        <textarea
          v-model="form.description"
          rows="5"
          placeholder="매물에 대한 상세 설명을 입력하세요"
          class="input"
        ></textarea>
      </div>

      <!-- Submit -->
      <div class="flex justify-end space-x-4">
        <router-link to="/listings" class="btn-secondary">취소</router-link>
        <button type="submit" class="btn-primary">등록하기</button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBuildingStore } from '@/stores/building'
import { useListingStore } from '@/stores/listing'

export default {
  name: 'ListingCreatePage',
  setup() {
    const router = useRouter()
    const buildingStore = useBuildingStore()
    const listingStore = useListingStore()

    const form = ref({
      buildingSearch: '',
      selectedBuilding: null,
      title: '',
      roomType: '',
      floor: null,
      area: null,
      deposit: null,
      monthlyRent: null,
      maintenanceFee: null,
      description: ''
    })

    const searchedBuildings = ref([])

    async function searchBuildings() {
      if (!form.value.buildingSearch) {
        searchedBuildings.value = []
        return
      }
      try {
        const result = await buildingStore.searchBuildings(form.value.buildingSearch)
        if (result.success) {
          searchedBuildings.value = buildingStore.buildings
        }
      } catch (err) {
        console.error('건물 검색 에러:', err)
      }
    }

    onMounted(async () => {
      await buildingStore.fetchBuildings()
    })

    function selectBuilding(building) {
      form.value.selectedBuilding = building
    }

    async function handleSubmit() {
      if (!form.value.selectedBuilding) {
        alert('건물을 선택해주세요.')
        return
      }

      try {
        const listingData = {
          title: form.value.title,
          roomType: form.value.roomType,
          deposit: form.value.deposit,
          monthlyRent: form.value.monthlyRent,
          maintenanceFee: form.value.maintenanceFee || 0,
          areaM2: form.value.area,
          floor: form.value.floor,
          image: '',
          building: {
            id: form.value.selectedBuilding.id
          }
        }

        const result = await listingStore.createListing(listingData)
        if (result.success) {
          alert('매물이 등록되었습니다!')
          router.push('/listings')
        } else {
          alert(result.error || '매물 등록에 실패했습니다.')
        }
      } catch (err) {
        console.error('매물 등록 에러:', err)
        alert('매물 등록에 실패했습니다.')
      }
    }

    return {
      form,
      searchedBuildings,
      selectBuilding,
      searchBuildings,
      handleSubmit
    }
  }
}
</script>
