import { defineStore } from "pinia";
import { ref } from "vue";
import { buildingAPI } from "@/utils/api";

export const useBuildingStore = defineStore("building", () => {
  const buildings = ref([]);
  const currentBuilding = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // 건물 목록 가져오기
  async function fetchBuildings() {
    isLoading.value = true;
    error.value = null;
    try {
      console.log("[BuildingStore] fetchBuildings 호출됨");
      console.log(
        "[BuildingStore] API_BASE_URL:",
        import.meta.env.VITE_API_BASE_URL
      );
      const response = await buildingAPI.getBuildings();
      console.log("[BuildingStore] API 응답 받음:", response);
      buildings.value = response.data.map((building) => ({
        id: building.id,
        name: building.name,
        road_address: building.roadAddress,
        lat: building.lat,
        lng: building.lng,
        built_year: building.builtYear,
        rating: building.rating || 0,
        review_count: building.reviewCount || 0,
      }));
      console.log(
        "[BuildingStore] 건물 목록 저장 완료:",
        buildings.value.length,
        "개"
      );
      return { success: true };
    } catch (err) {
      console.error("[BuildingStore] fetchBuildings 에러:", err);
      console.error(
        "[BuildingStore] 에러 상세:",
        err.response?.data || err.message
      );
      error.value =
        err.response?.data?.message || "건물 목록을 불러오는데 실패했습니다.";
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  // 건물 상세 정보 가져오기
  async function fetchBuildingById(id, buildingInfo = null) {
    isLoading.value = true;
    error.value = null;
    try {
      // 건물 정보가 제공된 경우 쿼리 파라미터로 전달
      const params = buildingInfo
        ? {
            name: buildingInfo.name,
            roadAddress: buildingInfo.roadAddress || buildingInfo.road_address,
            lat: buildingInfo.lat,
            lng: buildingInfo.lng,
            builtYear: buildingInfo.builtYear || buildingInfo.built_year,
          }
        : {};
      
      const response = await buildingAPI.getBuildingById(id, params);
      const building = response.data;
      currentBuilding.value = {
        id: building.id,
        name: building.name,
        road_address: building.roadAddress,
        lat: building.lat,
        lng: building.lng,
        built_year: building.builtYear,
        rating: building.rating || 0,
        review_count: building.reviewCount || 0,
      };
      return { success: true, data: currentBuilding.value };
    } catch (err) {
      error.value =
        err.response?.data?.message || "건물 정보를 불러오는데 실패했습니다.";
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  // 건물 검색
  async function searchBuildings(query) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await buildingAPI.searchBuildings(query);
      buildings.value = response.data.map((building) => ({
        id: building.id,
        name: building.name,
        road_address: building.roadAddress,
        lat: building.lat,
        lng: building.lng,
        built_year: building.builtYear,
        rating: building.rating || 0,
        review_count: building.reviewCount || 0,
      }));
      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || "건물 검색에 실패했습니다.";
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  // ID로 건물 찾기 (로컬 캐시에서)
  function getBuildingById(id) {
    return (
      buildings.value.find((b) => b.id === Number.parseInt(id)) ||
      currentBuilding.value
    );
  }

  // 건물 추가 (중복 제거)
  function addBuildings(newBuildings) {
    const existingIds = new Set(buildings.value.map((b) => String(b.id)));
    const uniqueNewBuildings = newBuildings.filter(
      (b) => !existingIds.has(String(b.id))
    );
    if (uniqueNewBuildings.length > 0) {
      buildings.value = [...buildings.value, ...uniqueNewBuildings];
    }
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
    addBuildings,
  };
});
