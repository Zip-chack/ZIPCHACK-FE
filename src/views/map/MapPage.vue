<template>
  <div class="flex flex-col h-[calc(100vh-64px)]">
    <!-- 지도와 사이드바 영역 -->
    <div class="flex flex-1 overflow-hidden">
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
      <BuildingSidebar
        :selected-building="selectedBuilding"
        :buildings="filteredBuildings"
        :building-listings="buildingListings"
        :is-loading-listings="isLoadingListings"
        :address-search-query="addressSearchQuery"
        :is-searching-address="isSearchingAddress"
        @search="handleSearch"
        @back-to-list="selectedBuilding = null"
        @select-building="selectBuilding"
        @go-to-listing="goToListing"
        @toggle-favorite="toggleFavorite"
        @update:address-search-query="addressSearchQuery = $event"
        @address-search="handleAddressSearch"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useBuildingStore } from "@/stores/building";
import { useListingStore } from "@/stores/listing";
import { kakaoMapAPI, buildingAPI } from "@/utils/api";
import BuildingSidebar from "@/components/map/BuildingSidebar.vue";

export default {
  name: "MapPage",
  components: {
    BuildingSidebar,
  },
  setup() {
    const buildingStore = useBuildingStore();
    const listingStore = useListingStore();
    const router = useRouter();

    const searchQuery = ref(""); // 사이드바 검색
    const addressSearchQuery = ref(""); // 상단 주소 검색
    const isSearchingAddress = ref(false);
    const viewMode = ref("map");
    const selectedBuilding = ref(null);
    const buildingListings = ref([]);
    const isLoadingListings = ref(false);
    const mapError = ref(null);
    const isLoadingBuildings = ref(false);
    let map = null;
    let markers = [];
    let boundsCheckTimer = null;
    let currentInfoWindow = null; // 현재 열린 인포윈도우
    let currentMarker = null; // 현재 선택된 마커

    const buildings = computed(() => buildingStore.buildings);

    onMounted(async () => {
      console.log("[MapPage] onMounted 실행됨");
      console.log("[MapPage] fetchBuildings 호출 전");
      try {
        await buildingStore.fetchBuildings();
        console.log("[MapPage] fetchBuildings 완료");
      } catch (err) {
        console.error("[MapPage] fetchBuildings 에러:", err);
      }
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

        // 초기 지도 경계 설정
        try {
          const bounds = map.getBounds();
          mapBounds.value = {
            swLat: bounds.getSouthWest().getLat(),
            swLng: bounds.getSouthWest().getLng(),
            neLat: bounds.getNorthEast().getLat(),
            neLng: bounds.getNorthEast().getLng(),
          };
        } catch (error) {
          // 무시
        }

        // 지도 이동/확대/축소 이벤트 리스너 추가
        window.kakao.maps.event.addListener(map, "idle", () => {
          // 지도 이동이 완료된 후 현재 화면의 건물 검색
          loadBuildingsInBounds();

          // 지도 경계 업데이트 (사이드바 목록 업데이트용)
          try {
            const bounds = map.getBounds();
            mapBounds.value = {
              swLat: bounds.getSouthWest().getLat(),
              swLng: bounds.getSouthWest().getLng(),
              neLat: bounds.getNorthEast().getLat(),
              neLng: bounds.getNorthEast().getLng(),
            };
          } catch (error) {
            // 무시
          }
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

      // 현재 선택된 빌딩 정보 저장 (인포윈도우 복원을 위해)
      const previousSelectedBuilding = selectedBuilding.value;
      const previousMarker = currentMarker;

      // 기존 마커 제거
      markers.forEach((marker) => marker.setMap(null));
      markers = [];

      // 지도에는 모든 건물의 마커 표시 (사이드바만 화면에 보이는 건물로 필터링)
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

        // 마커에 빌딩 정보 저장 (나중에 찾기 위해)
        marker.building = building;

        // 마커 클릭 이벤트
        window.kakao.maps.event.addListener(marker, "click", () => {
          selectBuilding(building);
          showBuildingInfoWindow(building, marker);
        });

        markers.push(marker);
      });

      // 이전에 선택된 빌딩이 있었고, 해당 빌딩이 여전히 존재하면 인포윈도우 다시 열기
      if (previousSelectedBuilding && previousMarker) {
        const restoredMarker = markers.find((marker) => {
          if (!marker.building) return false;
          // ID로 비교 (가장 정확)
          if (marker.building.id && previousSelectedBuilding.id) {
            return (
              String(marker.building.id) === String(previousSelectedBuilding.id)
            );
          }
          // ID가 없으면 좌표와 이름으로 비교
          return (
            Math.abs(marker.building.lat - previousSelectedBuilding.lat) <
              0.0001 &&
            Math.abs(marker.building.lng - previousSelectedBuilding.lng) <
              0.0001 &&
            marker.building.name === previousSelectedBuilding.name
          );
        });

        if (restoredMarker) {
          // 빌딩 정보 업데이트 (최신 정보로)
          const updatedBuilding = restoredMarker.building;
          selectedBuilding.value = updatedBuilding;
          showBuildingInfoWindow(updatedBuilding, restoredMarker);
        }
      }
    }

    // 선택한 빌딩의 인포윈도우 표시
    function showBuildingInfoWindow(building, marker) {
      if (!map || !building || !marker) return;

      // 기존 인포윈도우 닫기
      if (currentInfoWindow) {
        currentInfoWindow.close();
        currentInfoWindow = null;
      }

      // 새 인포윈도우 생성 및 표시
      const infoContent = `
        <div style="padding: 12px 14px; min-width: 180px; max-width: 250px; word-wrap: break-word; word-break: break-word; line-height: 1.5;">
          <div style="font-weight: 600; font-size: 14px; color: #111827; margin-bottom: 6px; word-wrap: break-word; word-break: break-word;">
            ${building.name || "건물명 없음"}
          </div>
          <div style="font-size: 13px; color: #6b7280; word-wrap: break-word;">
            평점 ${(building.rating || 0).toFixed(1)}
            ${building.review_count ? ` (${building.review_count})` : ""}
          </div>
        </div>
      `;

      currentInfoWindow = new window.kakao.maps.InfoWindow({
        content: infoContent,
        removable: true, // 닫기 버튼 표시
        disableAutoPan: false, // 자동 패닝 활성화
      });

      // 인포윈도우 닫기 이벤트 리스너
      window.kakao.maps.event.addListener(
        currentInfoWindow,
        "closeclick",
        () => {
          selectedBuilding.value = null;
          currentInfoWindow = null;
          currentMarker = null;
        }
      );

      currentInfoWindow.open(map, marker);
      currentMarker = marker;
    }

    // buildings가 변경되면 마커 업데이트 (인포윈도우는 유지)
    watch(
      buildings,
      () => {
        if (map && buildings.value.length > 0) {
          displayMarkers();
        }
      },
      { deep: true }
    );

    // selectedBuilding이 변경되면 인포윈도우 업데이트
    watch(
      () => selectedBuilding.value,
      (newBuilding, oldBuilding) => {
        if (!newBuilding && currentInfoWindow) {
          // 선택 해제 시 인포윈도우 닫기
          currentInfoWindow.close();
          currentInfoWindow = null;
          currentMarker = null;
        } else if (newBuilding && newBuilding !== oldBuilding) {
          // 새 빌딩 선택 시 인포윈도우 표시 (마커는 displayMarkers에서 처리)
          const buildingMarker = markers.find((marker) => {
            if (!marker.building) return false;
            // ID로 비교
            if (marker.building.id && newBuilding.id) {
              return String(marker.building.id) === String(newBuilding.id);
            }
            // 좌표와 이름으로 비교
            return (
              Math.abs(marker.building.lat - newBuilding.lat) < 0.0001 &&
              Math.abs(marker.building.lng - newBuilding.lng) < 0.0001 &&
              marker.building.name === newBuilding.name
            );
          });

          if (buildingMarker) {
            showBuildingInfoWindow(newBuilding, buildingMarker);
          }
        }
      }
    );

    // 지도 경계 변경을 감지하기 위한 ref
    const mapBounds = ref(null);

    // 지도 이동 시 사이드바 목록 업데이트를 위한 watch
    watch(
      () => map,
      (newMap) => {
        if (newMap) {
          // 지도 경계 변경 이벤트 리스너 추가
          window.kakao.maps.event.addListener(newMap, "bounds_changed", () => {
            try {
              const bounds = newMap.getBounds();
              mapBounds.value = {
                swLat: bounds.getSouthWest().getLat(),
                swLng: bounds.getSouthWest().getLng(),
                neLat: bounds.getNorthEast().getLat(),
                neLng: bounds.getNorthEast().getLng(),
              };
            } catch (error) {
              // 무시
            }
          });
        }
      }
    );

    // 현재 지도 화면에 보이는 건물만 필터링
    const visibleBuildings = computed(() => {
      if (!buildings.value.length) return [];

      // 지도가 아직 초기화되지 않았으면 모든 건물 반환
      if (!map) return buildings.value;

      try {
        // mapBounds가 있으면 사용, 없으면 현재 bounds 가져오기
        let swLat, swLng, neLat, neLng;

        if (mapBounds.value) {
          swLat = mapBounds.value.swLat;
          swLng = mapBounds.value.swLng;
          neLat = mapBounds.value.neLat;
          neLng = mapBounds.value.neLng;
        } else {
          const bounds = map.getBounds();
          swLat = bounds.getSouthWest().getLat();
          swLng = bounds.getSouthWest().getLng();
          neLat = bounds.getNorthEast().getLat();
          neLng = bounds.getNorthEast().getLng();
        }

        return buildings.value.filter((building) => {
          const lat = building.lat;
          const lng = building.lng;
          return lat >= swLat && lat <= neLat && lng >= swLng && lng <= neLng;
        });
      } catch (error) {
        // 지도가 아직 초기화되지 않았으면 모든 건물 반환
        return buildings.value;
      }
    });

    // 검색어로 필터링 (현재 화면에 보이는 건물 중에서만)
    const filteredBuildings = computed(() => {
      let result = visibleBuildings.value;

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
          (b) =>
            b.name.toLowerCase().includes(query) ||
            b.road_address.toLowerCase().includes(query)
        );
      }

      return result;
    });

    function handleSearch(query) {
      searchQuery.value = query;
    }

    // 상단 주소 검색 기능
    async function handleAddressSearch(query) {
      const searchQuery = query || addressSearchQuery.value.trim();
      if (!searchQuery || !map) return;

      // 검색어 업데이트
      addressSearchQuery.value = searchQuery;

      isSearchingAddress.value = true;
      try {
        // 카카오맵 주소 검색 API 호출
        const response = await kakaoMapAPI.searchAddress(searchQuery);

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
        console.error("에러 상세:", error.response?.data || error.message);
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          "주소 검색에 실패했습니다.";
        alert(`주소 검색 실패: ${errorMessage}`);
      } finally {
        isSearchingAddress.value = false;
      }
    }

    async function selectBuilding(building) {
      selectedBuilding.value = building;
      buildingListings.value = [];

      if (map && building) {
        const moveLatLon = new window.kakao.maps.LatLng(
          building.lat,
          building.lng
        );
        map.setCenter(moveLatLon);
        map.setLevel(3);

        // 선택한 빌딩의 마커 찾기 (마커에 저장된 빌딩 정보로 비교)
        const buildingMarker = markers.find((marker) => {
          if (!marker.building) return false;
          // ID로 비교 (가장 정확)
          if (marker.building.id && building.id) {
            return String(marker.building.id) === String(building.id);
          }
          // ID가 없으면 좌표로 비교
          return (
            Math.abs(marker.building.lat - building.lat) < 0.0001 &&
            Math.abs(marker.building.lng - building.lng) < 0.0001 &&
            marker.building.name === building.name
          );
        });

        if (buildingMarker) {
          showBuildingInfoWindow(building, buildingMarker);
        }
      }

      // Building ID 확인 및 처리
      let buildingId = building.id;

      // ID가 숫자가 아니거나 문자열인 경우 (카카오맵에서 가져온 경우)
      if (
        !buildingId ||
        typeof buildingId !== "number" ||
        String(buildingId).startsWith("kakao_")
      ) {
        // Building을 검색하거나 생성
        buildingId = await findOrCreateBuilding(building);
      } else {
        // 숫자 ID인 경우 DB에 존재하는지 확인
        try {
          await buildingAPI.getBuildingById(buildingId);
        } catch (error) {
          // DB에 없으면 생성
          buildingId = await findOrCreateBuilding(building);
        }
      }

      // Building ID가 있으면 매물 목록 조회
      if (buildingId) {
        // selectedBuilding의 ID를 업데이트
        selectedBuilding.value = { ...selectedBuilding.value, id: buildingId };
        await loadBuildingListings(buildingId);
      }
    }

    // Building을 찾거나 생성하는 함수
    async function findOrCreateBuilding(building) {
      try {
        const buildingName = building.name || "";
        const address = building.road_address || building.roadAddress || "";

        // Building 검색
        const searchQuery = `${buildingName} ${address}`.trim();
        if (searchQuery) {
          const searchResponse = await buildingAPI.searchBuildings(searchQuery);

          // 검색 결과가 있으면 첫 번째 결과 사용
          if (searchResponse.data && searchResponse.data.length > 0) {
            // 주소와 이름이 비슷한 Building 찾기
            const matchedBuilding = searchResponse.data.find(
              (b) =>
                b.name === buildingName &&
                (b.roadAddress === address ||
                  b.roadAddress?.includes(address) ||
                  address.includes(b.roadAddress))
            );
            if (matchedBuilding) {
              return matchedBuilding.id;
            }
            // 정확히 일치하는 것이 없으면 첫 번째 결과 사용
            return searchResponse.data[0].id;
          }
        }

        // Building이 없으면 생성
        const buildingData = {
          name: buildingName || "건물",
          roadAddress: address,
          lat: building.lat,
          lng: building.lng,
          builtYear: building.built_year || building.builtYear || null,
        };

        const createResponse = await buildingAPI.createBuilding(buildingData);
        return createResponse.data.id;
      } catch (error) {
        console.error("Building 찾기/생성 실패:", error);
        return null;
      }
    }

    async function loadBuildingListings(buildingId) {
      try {
        isLoadingListings.value = true;
        const response = await buildingAPI.getBuildingListings(buildingId);
        buildingListings.value = response.data.map((listing) => ({
          ...listing,
          is_favorite: listing.isFavorite ?? listing.is_favorite ?? false,
          isFavorite: listing.isFavorite ?? listing.is_favorite ?? false,
        }));
      } catch (error) {
        console.error("매물 목록 조회 실패:", error);
        buildingListings.value = [];
      } finally {
        isLoadingListings.value = false;
      }
    }

    function goToListing(id) {
      router.push(`/listings/${id}`);
    }

    async function toggleFavorite(id) {
      // listing store의 toggleFavorite를 사용 (로그인 체크 포함)
      const result = await listingStore.toggleFavorite(id);
      if (result.success) {
        // 목록 업데이트
        const listing = buildingListings.value.find((l) => l.id === id);
        if (listing) {
          listing.is_favorite = !listing.is_favorite;
          listing.isFavorite = !listing.isFavorite;
        }
      }
    }

    onUnmounted(() => {
      // 마커 제거
      markers.forEach((marker) => marker.setMap(null));
      markers = [];
    });

    return {
      searchQuery,
      addressSearchQuery,
      isSearchingAddress,
      viewMode,
      selectedBuilding,
      buildingListings,
      isLoadingListings,
      buildings,
      filteredBuildings,
      handleSearch,
      handleAddressSearch,
      selectBuilding,
      goToListing,
      toggleFavorite,
      mapError,
    };
  },
};
</script>
