<template>
  <div
    class="w-[420px] bg-white border-l border-gray-200 flex flex-col shadow-lg"
  >
    <!-- Address Search (지역 검색) -->
    <AddressSearchBar
      :model-value="addressSearchQuery"
      :is-searching="isSearchingAddress"
      @update:model-value="$emit('update:addressSearchQuery', $event)"
      @search="handleAddressSearch"
    />

    <!-- Building Search (건물명 필터링용) -->
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="건물명으로 검색"
          class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
          @input="$emit('search', searchQuery)"
        />
      </div>
    </div>

    <!-- Building List or Detail -->
    <div class="flex-1 overflow-y-auto bg-gray-50">
      <!-- Building Detail View -->
      <div v-if="selectedBuilding" class="h-full flex flex-col">
        <!-- 헤더 -->
        <div class="p-4 bg-white border-b border-gray-200">
          <button
            @click="$emit('back-to-list')"
            class="text-gray-600 mb-4 flex items-center hover:text-primary-600 transition-colors w-fit"
          >
            <svg
              class="w-5 h-5 mr-1.5 flex-shrink-0"
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
            <span class="font-medium whitespace-nowrap">목록으로</span>
          </button>

          <h2 class="text-2xl font-bold text-gray-900 mb-2 break-words">
            {{ selectedBuilding.name }}
          </h2>
          <p class="text-gray-500 text-sm mb-4 break-words">
            {{ selectedBuilding.road_address }}
          </p>

          <div class="flex items-center gap-2 flex-wrap">
            <div
              class="flex items-center bg-yellow-50 px-3 py-1.5 rounded-lg flex-shrink-0"
            >
              <svg
                class="w-5 h-5 text-yellow-400 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              <span class="ml-1.5 font-bold text-gray-900 whitespace-nowrap">{{
                (selectedBuilding.rating || 0).toFixed(1)
              }}</span>
            </div>
            <span class="text-sm text-gray-500 whitespace-nowrap"
              >리뷰 {{ selectedBuilding.review_count || 0 }}개</span
            >
          </div>
        </div>

        <!-- 스크롤 가능한 콘텐츠 -->
        <div class="flex-1 overflow-y-auto p-4">
          <div class="flex gap-2 mb-4">
            <router-link
              :to="{
                path: `/buildings/${selectedBuilding.id}`,
                query: {
                  name: selectedBuilding.name,
                  address: selectedBuilding.road_address,
                  lat: selectedBuilding.lat,
                  lng: selectedBuilding.lng,
                },
              }"
              class="btn-primary flex-1 text-center block py-2.5 font-semibold"
            >
              상세보기
            </router-link>
            <router-link
              :to="`/buildings/${selectedBuilding.id}/review`"
              class="btn-secondary flex-1 text-center block py-2.5 font-semibold"
            >
              리뷰 작성
            </router-link>
          </div>

          <!-- 매물 등록 버튼 -->
          <router-link
            :to="`/listings/create?buildingId=${selectedBuilding.id}`"
            class="btn-primary w-full text-center block mb-6 py-3 font-semibold shadow-sm hover:shadow-md transition-shadow"
          >
            매물 등록
          </router-link>

          <!-- Nearby Commerce Info -->
          <NearbyCommerceInfo
            v-if="
              selectedBuilding && selectedBuilding.lat && selectedBuilding.lng
            "
            :lat="selectedBuilding.lat"
            :lng="selectedBuilding.lng"
            :radius="500"
            class="mb-6"
          />

          <!-- Building Listings -->
          <div v-if="buildingListings.length > 0">
            <h3 class="text-lg font-bold text-gray-900 mb-4">
              등록된 매물
              <span class="text-primary-500"
                >({{ buildingListings.length }})</span
              >
            </h3>
            <div class="space-y-3">
              <ListingCard
                v-for="listing in buildingListings"
                :key="listing.id"
                :listing="listing"
                @click="$emit('go-to-listing', listing.id)"
                @toggle-favorite="$emit('toggle-favorite', listing.id)"
              />
            </div>
          </div>
          <div
            v-else-if="!isLoadingListings"
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
            <p class="text-sm">등록된 매물이 없습니다</p>
          </div>
          <div v-if="isLoadingListings" class="text-center py-12 text-gray-400">
            <div
              class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-3"
            ></div>
            <p class="text-sm">매물 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>

      <!-- Building List View -->
      <div v-else class="p-4 space-y-3">
        <div
          v-if="buildings.length === 0"
          class="p-12 text-center text-gray-500"
        >
          <svg
            class="w-16 h-16 mx-auto mb-4 text-gray-300"
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
          <p class="text-base font-medium">표시할 건물이 없습니다</p>
          <p class="text-sm mt-2 text-gray-400">
            지도를 이동하거나 검색해보세요
          </p>
        </div>
        <button
          v-for="building in buildings"
          :key="building.id"
          @click="$emit('select-building', building)"
          class="w-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-primary-200 group"
        >
          <!-- 이미지 영역 -->
          <div
            class="relative w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden"
          >
            <!-- 로드뷰가 있으면 로드뷰 표시 -->
            <div
              v-if="building.lat && building.lng"
              :id="`building-roadview-${building.id}`"
              class="w-full h-full"
            ></div>
            <!-- 로드뷰가 없으면 플레이스홀더 -->
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center"
            >
              <svg
                class="w-16 h-16 text-gray-300"
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
            </div>
            <!-- 카테고리 뱃지 -->
            <div
              class="absolute top-3 left-3 bg-primary-500 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm z-10"
            >
              건물
            </div>
          </div>

          <!-- 정보 영역 -->
          <div class="p-4">
            <h3
              class="font-bold text-gray-900 text-lg mb-1.5 group-hover:text-primary-600 transition-colors line-clamp-1"
            >
              {{ building.name }}
            </h3>
            <p class="text-sm text-gray-500 mb-3 line-clamp-1">
              {{ building.road_address }}
            </p>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <svg
                  class="w-4 h-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
                <span class="text-sm font-semibold text-gray-900">{{
                  (building.rating || 0).toFixed(1)
                }}</span>
                <span class="text-xs text-gray-500 ml-1"
                  >리뷰 {{ building.review_count || 0 }}</span
                >
              </div>
              <svg
                class="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import ListingCard from "@/components/listings/ListingCard.vue";
import AddressSearchBar from "@/components/map/AddressSearchBar.vue";
import NearbyCommerceInfo from "@/components/common/NearbyCommerceInfo.vue";

export default {
  name: "BuildingSidebar",
  components: {
    ListingCard,
    AddressSearchBar,
    NearbyCommerceInfo,
  },
  props: {
    selectedBuilding: {
      type: Object,
      default: null,
    },
    buildings: {
      type: Array,
      default: () => [],
    },
    buildingListings: {
      type: Array,
      default: () => [],
    },
    isLoadingListings: {
      type: Boolean,
      default: false,
    },
    addressSearchQuery: {
      type: String,
      default: "",
    },
    isSearchingAddress: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "search",
    "back-to-list",
    "select-building",
    "go-to-listing",
    "toggle-favorite",
    "update:addressSearchQuery",
    "address-search",
  ],
  setup(props, { emit }) {
    const searchQuery = ref("");
    const roadviewInstances = new Map(); // 빌딩 ID별 로드뷰 인스턴스 저장

    function handleAddressSearch(query) {
      emit("address-search", query);
    }

    function loadKakaoMapSDK() {
      // 이미 로드되어 있으면 true 반환
      if (
        typeof window.kakao !== "undefined" &&
        window.kakao.maps &&
        window.kakao.maps.Roadview
      ) {
        return Promise.resolve();
      }

      // SDK 스크립트 로드
      const kakaoKey = import.meta.env.VITE_KAKAO_MAP_JS_KEY;
      if (!kakaoKey) {
        console.error("카카오맵 JavaScript 키가 설정되지 않았습니다.");
        return Promise.reject("카카오맵 키 없음");
      }

      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false&libraries=services`;
        script.async = true;
        script.onload = () => {
          try {
            window.kakao.maps.load(() => {
              resolve();
            });
          } catch (error) {
            console.error("카카오맵 SDK 초기화 실패:", error);
            reject(error);
          }
        };
        script.onerror = () => {
          console.error("카카오맵 SDK 스크립트 로드 실패.");
          reject("스크립트 로드 실패");
        };
        document.head.appendChild(script);
      });
    }

    async function initRoadviewForBuilding(building) {
      if (!building.lat || !building.lng) {
        return;
      }

      try {
        await loadKakaoMapSDK();

        if (
          typeof window.kakao === "undefined" ||
          !window.kakao.maps ||
          !window.kakao.maps.Roadview
        ) {
          console.error("카카오맵 로드뷰 SDK가 로드되지 않았습니다.");
          return;
        }

        const containerId = `building-roadview-${building.id}`;
        const container = document.getElementById(containerId);
        if (!container) {
          return;
        }

        // 기존 로드뷰가 있으면 제거
        if (roadviewInstances.has(building.id)) {
          const oldInstance = roadviewInstances.get(building.id);
          if (oldInstance.roadview) {
            oldInstance.roadview = null;
          }
          if (oldInstance.roadviewClient) {
            oldInstance.roadviewClient = null;
          }
        }

        // 로드뷰 생성
        const roadview = new window.kakao.maps.Roadview(container);
        const roadviewClient = new window.kakao.maps.RoadviewClient();

        // 위치 설정
        const position = new window.kakao.maps.LatLng(
          building.lat,
          building.lng
        );

        // 가장 가까운 로드뷰 파노라마 ID 가져오기
        roadviewClient.getNearestPanoId(position, 50, function (panoId) {
          if (panoId === null) {
            console.warn(`빌딩 ${building.id}의 로드뷰를 사용할 수 없습니다.`);
            return;
          }
          roadview.setPanoId(panoId, position);
        });

        // 인스턴스 저장
        roadviewInstances.set(building.id, {
          roadview,
          roadviewClient,
        });
      } catch (error) {
        console.error(`빌딩 ${building.id}의 로드뷰 초기화 실패:`, error);
      }
    }

    function initAllRoadviews() {
      if (!props.buildings || props.buildings.length === 0) {
        return;
      }

      nextTick(() => {
        props.buildings.forEach((building) => {
          if (building.lat && building.lng) {
            initRoadviewForBuilding(building);
          }
        });
      });
    }

    // 빌딩 목록이 변경될 때 로드뷰 초기화
    watch(
      () => props.buildings,
      () => {
        // 기존 로드뷰 정리
        roadviewInstances.forEach((instance) => {
          if (instance.roadview) {
            instance.roadview = null;
          }
          if (instance.roadviewClient) {
            instance.roadviewClient = null;
          }
        });
        roadviewInstances.clear();

        // 새 로드뷰 초기화
        initAllRoadviews();
      },
      { deep: true }
    );

    onMounted(() => {
      initAllRoadviews();
    });

    onUnmounted(() => {
      // 모든 로드뷰 정리
      roadviewInstances.forEach((instance) => {
        if (instance.roadview) {
          instance.roadview = null;
        }
        if (instance.roadviewClient) {
          instance.roadviewClient = null;
        }
      });
      roadviewInstances.clear();
    });

    return {
      searchQuery,
      handleAddressSearch,
    };
  },
};
</script>
