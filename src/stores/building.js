import { defineStore } from "pinia"
import { ref } from "vue"
import { buildingAPI } from "@/utils/api"

export const useBuildingStore = defineStore("building", () => {
  const buildings = ref([])
  const currentBuilding = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // 건물 목록 가져오기
  async function fetchBuildings() {
    isLoading.value = true
    error.value = null
    try {
      const response = await buildingAPI.getBuildings()
      buildings.value = response.data.map(building => ({
        id: building.id,
        name: building.name,
        road_address: building.roadAddress,
        lat: building.lat,
        lng: building.lng,
        built_year: building.builtYear,
        rating: building.rating || 0,
        review_count: building.reviewCount || 0,
      }))
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || "건물 목록을 불러오는데 실패했습니다."
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 건물 상세 정보 가져오기
  async function fetchBuildingById(id) {
    isLoading.value = true
    error.value = null
    try {
      const response = await buildingAPI.getBuildingById(id)
      const building = response.data
      currentBuilding.value = {
        id: building.id,
        name: building.name,
        road_address: building.roadAddress,
        lat: building.lat,
        lng: building.lng,
        built_year: building.builtYear,
        rating: building.rating || 0,
        review_count: building.reviewCount || 0,
      }
      return { success: true, data: currentBuilding.value }
    } catch (err) {
      error.value = err.response?.data?.message || "건물 정보를 불러오는데 실패했습니다."
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 건물 검색
  async function searchBuildings(query) {
    isLoading.value = true
    error.value = null
    try {
      const response = await buildingAPI.searchBuildings(query)
      buildings.value = response.data.map(building => ({
        id: building.id,
        name: building.name,
        road_address: building.roadAddress,
        lat: building.lat,
        lng: building.lng,
        built_year: building.builtYear,
        rating: building.rating || 0,
        review_count: building.reviewCount || 0,
      }))
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || "건물 검색에 실패했습니다."
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // ID로 건물 찾기 (로컬 캐시에서)
  function getBuildingById(id) {
    return buildings.value.find((b) => b.id === Number.parseInt(id)) || currentBuilding.value
  }

  return {
    buildings,
    currentBuilding,
    isLoading,
    error,
    fetchBuildings,
    fetchBuildingById,
    searchBuildings,
    getBuildingById,
  }
})
