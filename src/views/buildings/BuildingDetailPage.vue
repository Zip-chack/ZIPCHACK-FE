<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="building" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Roadview -->
        <div class="card overflow-hidden relative">
          <!-- 로드뷰 영역 -->
          <div
            v-if="building.lat && building.lng"
            id="building-detail-roadview"
            class="w-full h-80 bg-gray-200"
          ></div>
          <!-- 플레이스홀더 -->
          <div
            v-else
            class="w-full h-80 bg-gray-200 flex items-center justify-center"
          >
            <div class="text-gray-400">
              <svg
                class="w-24 h-24 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Building Basic Info -->
        <div class="card p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900 mb-2">
                {{ building.name }}
              </h1>
              <p class="text-gray-600 mb-6">{{ building.road_address }}</p>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              v-if="building.rating !== null && building.rating !== undefined"
              class="text-center p-4 bg-gray-50 rounded-lg"
            >
              <p class="text-gray-500 text-sm">평점</p>
              <p class="font-semibold text-gray-900">
                {{ building.rating.toFixed(1) }}점
              </p>
            </div>
            <div
              v-if="
                building.review_count !== null &&
                building.review_count !== undefined
              "
              class="text-center p-4 bg-gray-50 rounded-lg"
            >
              <p class="text-gray-500 text-sm">리뷰</p>
              <p class="font-semibold text-gray-900">
                {{ building.review_count }}개
              </p>
            </div>
            <div
              v-if="building.built_year"
              class="text-center p-4 bg-gray-50 rounded-lg"
            >
              <p class="text-gray-500 text-sm">건축년도</p>
              <p class="font-semibold text-gray-900">
                {{ building.built_year }}년
              </p>
            </div>
          </div>
        </div>

        <!-- Commerce Analysis -->
        <CommerceAnalysis
          v-if="building && building.id && building.lat && building.lng"
          :building-id="building.id"
          :lat="building.lat"
          :lng="building.lng"
          :radius="500"
        />

        <!-- Reviews Section -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900">리뷰</h2>
            <router-link
              :to="`/buildings/${building.id}/review`"
              class="btn-primary text-sm"
            >
              리뷰 작성
            </router-link>
          </div>

          <div class="space-y-4">
            <ReviewCard
              v-for="review in reviews"
              :key="review.id"
              :review="review"
            />
            <div v-if="reviews.length === 0" class="text-center py-8">
              <p class="text-gray-500">아직 리뷰가 없습니다.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Building Listings -->
        <BuildingListings
          v-if="building && building.id"
          :building-id="building.id"
        />

        <!-- Commerce Radar Chart -->
        <CommerceRadarChart
          v-if="building && building.lat && building.lng"
          :lat="building.lat"
          :lng="building.lng"
          :radius="500"
        />

        <!-- Nearby Commerce Info -->
        <NearbyCommerceInfo
          v-if="building && building.lat && building.lng"
          :lat="building.lat"
          :lng="building.lng"
          :radius="500"
        />
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center py-16">
      <p class="text-gray-500">건물을 찾을 수 없습니다</p>
      <router-link to="/map" class="btn-primary mt-4 inline-block">
        지도로 돌아가기
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useBuildingStore } from "@/stores/building";
import { reviewAPI, buildingAPI, kakaoMapAPI } from "@/utils/api";
import ReviewCard from "@/components/common/ReviewCard.vue";
import NearbyCommerceInfo from "@/components/common/NearbyCommerceInfo.vue";
import BuildingListings from "@/components/buildings/BuildingListings.vue";
import CommerceRadarChart from "@/components/common/CommerceRadarChart.vue";
import CommerceAnalysis from "@/components/common/CommerceAnalysis.vue";

export default {
  name: "BuildingDetailPage",
  components: {
    ReviewCard,
    NearbyCommerceInfo,
    BuildingListings,
    CommerceRadarChart,
    CommerceAnalysis,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const buildingStore = useBuildingStore();

    const building = computed(() =>
      buildingStore.getBuildingById(route.params.id)
    );
    const reviews = ref([]);
    let roadview = null;
    let roadviewClient = null;

    // 빌딩을 찾거나 생성하는 함수
    async function findOrCreateBuilding(buildingId) {
      try {
        // 빌딩 ID가 카카오맵 place ID 형식인지 확인 (숫자로만 구성)
        const isKakaoPlaceId = /^\d+$/.test(String(buildingId));
        
        if (isKakaoPlaceId) {
          // 카카오맵 API를 통해 빌딩 정보 검색
          // place ID로 직접 조회는 불가능하므로, 주변 지역에서 검색
          // 하지만 place ID만으로는 검색이 어려우므로, 빌딩 정보가 없으면 생성 불가
          console.log("카카오맵 place ID로 빌딩 정보를 가져올 수 없습니다:", buildingId);
          return null;
        }

        // 빌딩 검색 시도
        const searchResponse = await buildingAPI.searchBuildings(String(buildingId));
        if (searchResponse.data && searchResponse.data.length > 0) {
          return searchResponse.data[0].id;
        }

        return null;
      } catch (error) {
        console.error("빌딩 찾기 실패:", error);
        return null;
      }
    }

    // 로드뷰 초기화
    function loadKakaoMapSDK() {
      if (
        typeof window.kakao !== "undefined" &&
        window.kakao.maps &&
        window.kakao.maps.Roadview
      ) {
        return Promise.resolve();
      }

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

    async function initRoadview() {
      if (!building.value || !building.value.lat || !building.value.lng) {
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

        const container = document.getElementById("building-detail-roadview");
        if (!container) {
          return;
        }

        // 기존 로드뷰 정리
        if (roadview) {
          roadview = null;
        }
        if (roadviewClient) {
          roadviewClient = null;
        }

        // 로드뷰 생성
        roadview = new window.kakao.maps.Roadview(container);
        roadviewClient = new window.kakao.maps.RoadviewClient();

        const position = new window.kakao.maps.LatLng(
          building.value.lat,
          building.value.lng
        );

        roadviewClient.getNearestPanoId(position, 50, function (panoId) {
          if (panoId === null) {
            console.warn("해당 위치의 로드뷰를 사용할 수 없습니다.");
            return;
          }
          roadview.setPanoId(panoId, position);
        });
      } catch (error) {
        console.error("로드뷰 초기화 실패:", error);
      }
    }

    onMounted(async () => {
      console.log(
        "BuildingDetailPage: 빌딩 정보 로드 시작, id:",
        route.params.id
      );
      
      // 빌딩 정보 가져오기 시도
      const result = await buildingStore.fetchBuildingById(route.params.id);
      
      // 빌딩이 없으면 생성 시도
      if (!result.success && !building.value) {
        console.log("빌딩이 없어서 생성 시도:", route.params.id);
        
        // 빌딩 ID가 카카오맵 place ID인 경우 처리
        const buildingId = route.params.id;
        const isKakaoPlaceId = /^\d+$/.test(String(buildingId));
        
        if (isKakaoPlaceId) {
          // 카카오맵 place ID로는 직접 조회가 불가능하므로,
          // 빌딩 정보가 없으면 생성할 수 없음
          // 대신 빌딩 정보를 query parameter로 전달받아서 생성
          const buildingName = route.query.name;
          const buildingAddress = route.query.address || route.query.roadAddress;
          const buildingLat = route.query.lat;
          const buildingLng = route.query.lng;
          
          console.log("빌딩 생성 시도 - query params:", {
            name: buildingName,
            address: buildingAddress,
            lat: buildingLat,
            lng: buildingLng,
          });
          
          if (buildingName && buildingAddress && buildingLat && buildingLng) {
            try {
              const buildingData = {
                name: String(buildingName),
                roadAddress: String(buildingAddress),
                lat: parseFloat(String(buildingLat)),
                lng: parseFloat(String(buildingLng)),
                builtYear: null,
              };
              
              console.log("빌딩 생성 데이터:", buildingData);
              
              const createResponse = await buildingAPI.createBuilding(buildingData);
              const newBuildingId = createResponse.data.id;
              
              console.log("빌딩 생성 성공, 새 ID:", newBuildingId);
              
              // 생성된 빌딩 ID로 다시 시도
              await buildingStore.fetchBuildingById(newBuildingId);
              router.replace(`/buildings/${newBuildingId}`);
              return;
            } catch (error) {
              console.error("빌딩 생성 실패:", error);
              console.error("에러 상세:", error.response?.data || error.message);
            }
          } else {
            console.error("빌딩 정보가 부족하여 생성할 수 없습니다:", {
              name: buildingName,
              address: buildingAddress,
              lat: buildingLat,
              lng: buildingLng,
            });
          }
        } else {
          // 빌딩 검색 시도
          const foundBuildingId = await findOrCreateBuilding(buildingId);
          if (foundBuildingId) {
            // 찾은 빌딩 ID로 다시 시도
            await buildingStore.fetchBuildingById(foundBuildingId);
            if (foundBuildingId !== buildingId) {
              router.replace(`/buildings/${foundBuildingId}`);
              return;
            }
          }
        }
      }
      
      console.log("BuildingDetailPage: 빌딩 정보:", building.value);
      console.log("BuildingDetailPage: building.id:", building.value?.id);

      // 건물 리뷰 가져오기
      try {
        const buildingReviewsResponse = await reviewAPI.getBuildingReviews(
          route.params.id
        );
        const buildingReviews = buildingReviewsResponse.data.map((review) => ({
          id: review.id,
          user: review.user,
          rating_overall: review.ratingOverall,
          rating_noise: review.ratingNoise,
          rating_landlord: review.ratingLandlord,
          rating_facility: review.ratingFacility,
          title: review.title,
          content: review.content,
          created_at: review.createdAt,
          type: "building", // 건물 리뷰임을 표시
        }));

        // 해당 건물의 매물 목록 가져오기
        try {
          const listingsResponse = await buildingAPI.getBuildingListings(
            route.params.id
          );
          const listings = listingsResponse.data || [];

          // 각 매물의 리뷰 가져오기
          const listingReviewsPromises = listings.map(async (listing) => {
            try {
              const listingReviewsResponse = await reviewAPI.getListingReviews(
                listing.id
              );
              return listingReviewsResponse.data.map((review) => ({
                id: review.id,
                user: review.user,
                rating_overall: review.ratingOverall,
                rating_noise: review.ratingNoise,
                rating_landlord: review.ratingLandlord,
                rating_facility: review.ratingFacility,
                title: review.title,
                content: review.content,
                created_at: review.createdAt,
                type: "listing", // 매물 리뷰임을 표시
                listing: {
                  id: listing.id,
                  title: listing.title,
                },
              }));
            } catch (err) {
              console.error(
                `매물 ${listing.id}의 리뷰를 불러오는데 실패했습니다:`,
                err
              );
              return [];
            }
          });

          const listingReviewsArrays = await Promise.all(
            listingReviewsPromises
          );
          const listingReviews = listingReviewsArrays.flat();

          // 건물 리뷰와 매물 리뷰 합치기 (최신순 정렬)
          const allReviews = [...buildingReviews, ...listingReviews];
          allReviews.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA; // 최신순
          });

          reviews.value = allReviews;
        } catch (err) {
          console.error("매물 목록을 불러오는데 실패했습니다:", err);
          // 매물 목록을 가져오지 못해도 건물 리뷰는 표시
          reviews.value = buildingReviews;
        }
      } catch (err) {
        console.error("리뷰를 불러오는데 실패했습니다:", err);
      }

      // 로드뷰 초기화
      await nextTick();
      initRoadview();
    });

    // 빌딩 정보 변경 시 로드뷰 업데이트
    watch(
      () => [building.value?.lat, building.value?.lng],
      () => {
        nextTick(() => {
          initRoadview();
        });
      }
    );

    onUnmounted(() => {
      if (roadview) {
        roadview = null;
      }
      if (roadviewClient) {
        roadviewClient = null;
      }
    });

    return {
      building,
      reviews,
    };
  },
};
</script>
