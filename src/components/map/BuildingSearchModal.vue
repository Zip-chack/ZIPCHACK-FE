<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="closeModal"
      >
        <div
          class="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[65vh] flex flex-col m-4"
          @click.stop
        >
          <!-- 헤더 -->
          <div
            class="flex items-center justify-between p-4 border-b border-gray-200"
          >
            <h2 class="text-xl font-semibold text-gray-900">건물 검색</h2>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- 검색 바 -->
          <div class="p-4 border-b border-gray-200 bg-gray-50">
            <div class="relative">
              <svg
                class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <input
                v-model="addressQuery"
                type="text"
                placeholder="주소로 검색하세요 (예: 광주광역시 서구)"
                class="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                @keyup.enter="handleAddressSearch"
              />
              <button
                @click="handleAddressSearch"
                :disabled="isSearching"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {{ isSearching ? "검색 중..." : "검색" }}
              </button>
            </div>
          </div>

          <!-- 지도와 건물 목록 영역 -->
          <div class="flex-1 flex overflow-hidden">
            <!-- 지도 영역 -->
            <div class="flex-1 bg-gray-200 relative">
              <div id="building-search-map" class="w-full h-full"></div>
              <div
                v-if="mapError"
                class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10"
              >
                <div class="text-center p-4">
                  <p class="text-sm text-gray-600">{{ mapError }}</p>
                </div>
              </div>
            </div>

            <!-- 건물 목록 영역 -->
            <div
              class="w-96 border-l border-gray-200 bg-white overflow-y-auto flex flex-col"
            >
              <div class="p-4 border-b border-gray-200 bg-gray-50">
                <h3 class="text-sm font-semibold text-gray-700">
                  검색된 건물 ({{ buildings.length }})
                </h3>
              </div>
              <div class="flex-1 overflow-y-auto p-2">
                <div
                  v-if="buildings.length === 0 && !isLoadingBuildings"
                  class="text-center py-12 text-gray-400"
                >
                  <svg
                    class="w-16 h-16 mx-auto mb-3 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <p class="text-sm">주소를 검색하여 건물을 찾아보세요</p>
                </div>
                <div
                  v-if="isLoadingBuildings"
                  class="text-center py-12 text-gray-400"
                >
                  <div
                    class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-3"
                  ></div>
                  <p class="text-sm">건물을 검색하는 중...</p>
                </div>
                <button
                  v-for="building in buildings"
                  :key="building.id || `${building.lat}_${building.lng}`"
                  @click="selectBuilding(building)"
                  class="w-full p-3 text-left hover:bg-gray-50 rounded-lg mb-2 border border-gray-100 hover:border-primary-200 transition-all"
                >
                  <p class="font-medium text-gray-900 text-sm mb-1">
                    {{ building.name || building.placeName || "건물명 없음" }}
                  </p>
                  <p class="text-xs text-gray-500 line-clamp-1">
                    {{ building.road_address || building.roadAddress || "" }}
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import { kakaoMapAPI, buildingAPI } from "@/utils/api";

export default {
  name: "BuildingSearchModal",
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close", "select"],
  setup(props, { emit }) {
    const addressQuery = ref("");
    const isSearching = ref(false);
    const isLoadingBuildings = ref(false);
    const mapError = ref(null);
    const buildings = ref([]);
    let map = null;
    let markers = [];

    function closeModal() {
      emit("close");
    }

    function selectBuilding(building) {
      emit("select", building);
      closeModal();
    }

    function loadKakaoMapSDK() {
      // 이미 로드되어 있으면 바로 초기화
      if (typeof window.kakao !== "undefined" && window.kakao.maps) {
        initMap();
        return;
      }

      // SDK 스크립트 로드
      const kakaoKey = import.meta.env.VITE_KAKAO_MAP_JS_KEY;
      if (!kakaoKey) {
        mapError.value = "카카오맵 JavaScript 키가 설정되지 않았습니다.";
        return;
      }

      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false`;
      script.async = true;
      script.onload = () => {
        try {
          window.kakao.maps.load(() => {
            mapError.value = null;
            initMap();
          });
        } catch (error) {
          mapError.value = "카카오맵 SDK 초기화 실패: " + error.message;
        }
      };
      script.onerror = () => {
        mapError.value = "카카오맵 SDK 스크립트 로드 실패.";
      };
      document.head.appendChild(script);
    }

    function initMap() {
      if (typeof window.kakao === "undefined" || !window.kakao.maps) {
        mapError.value = "카카오맵 SDK가 로드되지 않았습니다.";
        return;
      }

      const container = document.getElementById("building-search-map");
      if (!container) {
        mapError.value = "지도 컨테이너를 찾을 수 없습니다.";
        return;
      }

      try {
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울시청 기본 위치
          level: 5,
        };

        map = new window.kakao.maps.Map(container, options);
        mapError.value = null;

        // 지도 이동/확대/축소 이벤트 리스너 추가
        window.kakao.maps.event.addListener(map, "idle", () => {
          loadBuildingsInBounds();
        });
      } catch (error) {
        mapError.value = "지도 초기화 실패: " + error.message;
      }
    }

    async function loadBuildingsInBounds() {
      if (!map || isLoadingBuildings.value) return;

      try {
        isLoadingBuildings.value = true;

        // 현재 지도 화면의 경계 가져오기
        const bounds = map.getBounds();
        const swLatLng = bounds.getSouthWest();
        const neLatLng = bounds.getNorthEast();

        // 백엔드 API 호출
        const response = await kakaoMapAPI.searchBuildingsInBounds(
          swLatLng.getLat(),
          swLatLng.getLng(),
          neLatLng.getLat(),
          neLatLng.getLng()
        );

        // 마커 제거
        markers.forEach((marker) => marker.setMap(null));
        markers = [];

        // 건물 데이터 처리
        const newBuildings = response.data.map((building) => ({
          id:
            building.id ||
            `kakao_${building.placeName}_${building.lat}_${building.lng}`,
          name: building.placeName || building.name,
          road_address: building.roadAddress || building.address,
          roadAddress: building.roadAddress || building.address,
          lat: building.lat,
          lng: building.lng,
          rating: 0,
          review_count: 0,
          category: building.category || "",
        }));

        buildings.value = newBuildings;

        // 마커 표시
        newBuildings.forEach((building) => {
          const markerPosition = new window.kakao.maps.LatLng(
            building.lat,
            building.lng
          );

          const markerImageSrc =
            "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png";
          const markerImageSize = new window.kakao.maps.Size(24, 35);
          const markerImage = new window.kakao.maps.MarkerImage(
            markerImageSrc,
            markerImageSize
          );

          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
            image: markerImage,
            map: map,
          });

          marker.building = building;

          // 마커 클릭 이벤트
          window.kakao.maps.event.addListener(marker, "click", () => {
            selectBuilding(building);
          });

          markers.push(marker);
        });
      } catch (error) {
        console.error("건물 검색 실패:", error);
      } finally {
        isLoadingBuildings.value = false;
      }
    }

    async function handleAddressSearch() {
      const query = addressQuery.value.trim();
      if (!query || !map) return;

      isSearching.value = true;
      try {
        // 카카오맵 주소 검색 API 호출
        const response = await kakaoMapAPI.searchAddress(query);

        if (response.data && response.data.lat && response.data.lng) {
          // 검색된 주소로 지도 이동
          const lat = response.data.lat;
          const lng = response.data.lng;

          const moveLatLon = new window.kakao.maps.LatLng(lat, lng);
          map.setCenter(moveLatLon);
          map.setLevel(3); // 적절한 줌 레벨

          // 해당 지역의 건물 검색 (약간의 지연 후)
          setTimeout(() => {
            loadBuildingsInBounds();
          }, 500);
        } else {
          alert("검색 결과를 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("주소 검색 실패:", error);
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          "주소 검색에 실패했습니다.";
        alert(`주소 검색 실패: ${errorMessage}`);
      } finally {
        isSearching.value = false;
      }
    }

    // 모달이 열릴 때 지도 초기화
    watch(
      () => props.isOpen,
      async (isOpen) => {
        if (isOpen) {
          await nextTick();
          loadKakaoMapSDK();
        } else {
          // 모달이 닫힐 때 마커 정리
          markers.forEach((marker) => marker.setMap(null));
          markers = [];
          buildings.value = [];
          addressQuery.value = "";
        }
      }
    );

    onUnmounted(() => {
      // 마커 제거
      markers.forEach((marker) => marker.setMap(null));
      markers = [];
    });

    return {
      addressQuery,
      isSearching,
      isLoadingBuildings,
      mapError,
      buildings,
      closeModal,
      selectBuilding,
      handleAddressSearch,
    };
  },
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
