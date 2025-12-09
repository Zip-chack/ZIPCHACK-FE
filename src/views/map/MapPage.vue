<template>
  <div class="h-[calc(100vh-64px)] flex">
    <!-- Map Area -->
    <div class="flex-1 bg-gray-200 relative">
      <div id="map" class="w-full h-full"></div>
      <!-- Error Message -->
      <div
        v-if="mapError"
        class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50"
      >
        <div class="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
          <svg
            class="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            카카오맵 로드 실패
          </h3>
          <p class="text-gray-600 mb-4">{{ mapError }}</p>
          <p class="text-sm text-gray-500">
            환경 변수 VITE_KAKAO_MAP_JS_KEY를 설정해주세요.
          </p>
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

      <!-- Building List or Detail -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="selectedBuilding" class="p-4">
          <button
            @click="selectedBuilding = null"
            class="text-primary-500 mb-4 flex items-center"
          >
            <svg
              class="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            목록으로
          </button>

          <h2 class="text-xl font-bold text-gray-900 mb-2">
            {{ selectedBuilding.name }}
          </h2>
          <p class="text-gray-600 text-sm mb-4">
            {{ selectedBuilding.road_address }}
          </p>

          <div class="flex items-center mb-6">
            <svg
              class="w-5 h-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
            <span class="ml-1 font-semibold">{{
              selectedBuilding.rating
            }}</span>
            <span class="text-gray-500 ml-1"
              >({{ selectedBuilding.review_count }}개 리뷰)</span
            >
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
            <p class="text-sm text-gray-500 mb-2">
              {{ building.road_address }}
            </p>
            <div class="flex items-center text-sm">
              <svg
                class="w-4 h-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              <span class="ml-1 font-medium">{{ building.rating }}</span>
              <span class="text-gray-400 ml-1"
                >({{ building.review_count }})</span
              >
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useBuildingStore } from "@/stores/building";
import { kakaoMapAPI, publicDataAPI } from "@/utils/api";

export default {
  name: "MapPage",
  setup() {
    const buildingStore = useBuildingStore();

    const searchQuery = ref("");
    const viewMode = ref("map");
    const selectedBuilding = ref(null);
    const mapError = ref(null);
    const isLoadingBuildings = ref(false);
    const isLoadingRentData = ref(false);
    const lawdCd = ref("");
    let map = null;
    let markers = [];
    let rentMarkers = []; // 실거래가 마커
    let boundsCheckTimer = null;

    const buildings = computed(() => buildingStore.buildings);

    onMounted(async () => {
      await buildingStore.fetchBuildings();
      loadKakaoMapSDK();
    });

    function loadKakaoMapSDK() {
      // 이미 로드되어 있으면 바로 초기화
      if (typeof window.kakao !== "undefined" && window.kakao.maps) {
        initMap();
        return;
      }

      // SDK 스크립트 로드
      const kakaoKey = import.meta.env.VITE_KAKAO_MAP_JS_KEY;
      if (!kakaoKey) {
        const errorMsg =
          "카카오맵 JavaScript 키가 설정되지 않았습니다. VITE_KAKAO_MAP_JS_KEY 환경변수를 설정해주세요.";
        console.error(errorMsg);
        mapError.value = errorMsg;
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
          const errorMsg = "카카오맵 SDK 초기화 실패: " + error.message;
          console.error(errorMsg, error);
          mapError.value = errorMsg;
        }
      };
      script.onerror = () => {
        const errorMsg =
          "카카오맵 SDK 스크립트 로드 실패. API 키를 확인해주세요.";
        console.error(errorMsg);
        mapError.value = errorMsg;
      };
      document.head.appendChild(script);
    }

    function initMap() {
      // 카카오맵 SDK 로드 확인
      if (typeof window.kakao === "undefined" || !window.kakao.maps) {
        const errorMsg = "카카오맵 SDK가 로드되지 않았습니다.";
        console.error(errorMsg);
        mapError.value = errorMsg;
        return;
      }

      const container = document.getElementById("map");
      if (!container) {
        const errorMsg = "지도 컨테이너를 찾을 수 없습니다.";
        console.error(errorMsg);
        mapError.value = errorMsg;
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
          // 지도 이동이 완료된 후 현재 화면의 건물 검색
          loadBuildingsInBounds();
        });
      } catch (error) {
        const errorMsg = "지도 초기화 실패: " + error.message;
        console.error(errorMsg, error);
        mapError.value = errorMsg;
        return;
      }

      // 건물 데이터가 있으면 첫 번째 건물 위치로 이동
      if (buildings.value.length > 0) {
        const firstBuilding = buildings.value[0];
        const moveLatLon = new window.kakao.maps.LatLng(
          firstBuilding.lat,
          firstBuilding.lng
        );
        map.setCenter(moveLatLon);
      }

      // 초기 건물 검색
      loadBuildingsInBounds();
    }

    async function loadBuildingsInBounds() {
      if (!map || isLoadingBuildings.value) return;

      // 디바운싱: 연속 호출 방지
      if (boundsCheckTimer) {
        clearTimeout(boundsCheckTimer);
      }

      boundsCheckTimer = setTimeout(async () => {
        try {
          isLoadingBuildings.value = true;

          // 현재 지도 화면의 경계 가져오기
          const bounds = map.getBounds();
          const swLatLng = bounds.getSouthWest(); // 남서쪽
          const neLatLng = bounds.getNorthEast(); // 북동쪽

          // 백엔드 API 호출
          const response = await kakaoMapAPI.searchBuildingsInBounds(
            swLatLng.getLat(),
            swLatLng.getLng(),
            neLatLng.getLat(),
            neLatLng.getLng()
          );

          // 검색된 건물들을 store에 추가 (중복 제거)
          const newBuildings = response.data.map((building) => ({
            id:
              building.id ||
              `kakao_${building.placeName}_${building.lat}_${building.lng}`,
            name: building.placeName || building.name,
            road_address: building.roadAddress || building.address,
            lat: building.lat,
            lng: building.lng,
            rating: 0,
            review_count: 0,
            category: building.category || "",
          }));

          // store에 건물 추가 (중복 제거 자동 처리)
          buildingStore.addBuildings(newBuildings);

          // 마커 업데이트
          displayMarkers();
        } catch (error) {
          console.error("건물 검색 실패:", error);
          // 에러가 발생해도 기존 마커는 유지
        } finally {
          isLoadingBuildings.value = false;
        }
      }, 500); // 500ms 디바운싱
    }

    function displayMarkers() {
      if (!map || !buildings.value.length) return;

      // 기존 마커 제거
      markers.forEach((marker) => marker.setMap(null));
      markers = [];

      buildings.value.forEach((building) => {
        const markerPosition = new window.kakao.maps.LatLng(
          building.lat,
          building.lng
        );

        // 커스텀 마커 이미지 생성
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

        // 인포윈도우 생성
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;min-width:100px;">
            <strong>${building.name}</strong><br/>
            <span>평점: ${building.rating.toFixed(1)}</span>
          </div>`,
        });

        // 마커 클릭 이벤트
        window.kakao.maps.event.addListener(marker, "click", () => {
          selectBuilding(building);
          infowindow.open(map, marker);
        });

        markers.push(marker);
      });
    }

    // buildings가 변경되면 마커 업데이트
    watch(
      buildings,
      () => {
        if (map && buildings.value.length > 0) {
          displayMarkers();
        }
      },
      { deep: true }
    );

    const filteredBuildings = computed(() => {
      if (!searchQuery.value) return buildings.value;
      const query = searchQuery.value.toLowerCase();
      return buildings.value.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.road_address.toLowerCase().includes(query)
      );
    });

    function selectBuilding(building) {
      selectedBuilding.value = building;
      if (map && building) {
        const moveLatLon = new window.kakao.maps.LatLng(
          building.lat,
          building.lng
        );
        map.setCenter(moveLatLon);
        map.setLevel(3);
      }
    }

    async function loadApartmentRentData() {
      if (!lawdCd.value || !map) {
        alert("법정동코드를 입력해주세요.");
        return;
      }

      try {
        isLoadingRentData.value = true;

        // 기존 실거래가 마커 제거
        rentMarkers.forEach((marker) => marker.setMap(null));
        rentMarkers = [];

        // 실거래가 데이터 조회
        const response = await publicDataAPI.getApartmentRentData(lawdCd.value);
        const rentData = response.data;

        if (!rentData || rentData.length === 0) {
          alert("해당 지역의 실거래가 데이터가 없습니다.");
          return;
        }

        // 실거래가 마커 표시
        rentData.forEach((rent) => {
          if (rent.lat && rent.lng) {
            const markerPosition = new window.kakao.maps.LatLng(
              rent.lat,
              rent.lng
            );

            // 실거래가 전용 마커 (파란색)
            const markerImageSrc =
              "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png";
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

            // 인포윈도우 생성
            const deposit = rent.deposit
              ? parseInt(rent.deposit).toLocaleString()
              : "-";
            const monthlyRent = rent.monthlyRent
              ? parseInt(rent.monthlyRent).toLocaleString()
              : "-";
            const area = rent.area ? parseFloat(rent.area).toFixed(2) : "-";

            const content = `
              <div style="padding:8px;font-size:12px;min-width:150px;">
                <strong>${rent.apartmentName || "아파트"}</strong><br/>
                <span>${rent.roadAddress || rent.jibunAddress || ""}</span><br/>
                <span>면적: ${area}㎡</span><br/>
                <span>보증금: ${deposit}만원</span><br/>
                <span>월세: ${monthlyRent}만원</span><br/>
                <span>거래일: ${rent.dealDate || ""}.${rent.dealMonth || ""}.${
              rent.dealDay || ""
            }</span>
              </div>
            `;

            const infowindow = new window.kakao.maps.InfoWindow({
              content: content,
            });

            window.kakao.maps.event.addListener(marker, "click", () => {
              infowindow.open(map, marker);
            });

            rentMarkers.push(marker);
          }
        });

        alert(`${rentData.length}개의 실거래가 데이터를 표시했습니다.`);
      } catch (error) {
        console.error("실거래가 조회 실패:", error);
        alert(
          "실거래가 데이터를 불러오는데 실패했습니다: " +
            (error.response?.data?.error || error.message)
        );
      } finally {
        isLoadingRentData.value = false;
      }
    }

    onUnmounted(() => {
      // 마커 제거
      markers.forEach((marker) => marker.setMap(null));
      rentMarkers.forEach((marker) => marker.setMap(null));
      markers = [];
      rentMarkers = [];
    });

    return {
      searchQuery,
      viewMode,
      selectedBuilding,
      buildings,
      filteredBuildings,
      selectBuilding,
      lawdCd,
      isLoadingRentData,
      loadApartmentRentData,
      mapError,
    };
  },
};
</script>
