<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-8">매물 등록</h1>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Building Selection -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">건물 정보</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >건물 검색</label
            >
            <!-- 건물 검색 버튼 (지도 모달 열기) -->
            <button
              type="button"
              @click="showMapSearchModal = true"
              class="w-full input text-left cursor-pointer hover:border-primary-400 transition-colors flex items-center justify-between"
              :class="{
                'bg-gray-50': !form.selectedBuilding,
                'bg-primary-50 border-primary-300': form.selectedBuilding,
              }"
            >
              <div class="flex items-center flex-1 min-w-0">
                <svg
                  class="w-5 h-5 text-gray-400 mr-2 flex-shrink-0"
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
                <div class="flex-1 min-w-0">
                  <p
                    v-if="form.selectedBuilding"
                    class="font-medium text-gray-900 truncate"
                  >
                    {{ form.selectedBuilding.name }}
                  </p>
                  <p v-else class="text-gray-400">지도에서 건물을 검색하세요</p>
                  <p
                    v-if="form.selectedBuilding"
                    class="text-sm text-gray-500 truncate"
                  >
                    {{ form.selectedBuilding.road_address }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2 ml-2 flex-shrink-0">
                <svg
                  v-if="form.selectedBuilding"
                  @click.stop="
                    form.selectedBuilding = null;
                    form.buildingSearch = '';
                  "
                  class="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
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
                <svg
                  class="w-5 h-5 text-gray-400"
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
            </button>
          </div>
        </div>
      </div>

      <!-- Room Details -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">매물 정보</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >제목</label
            >
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
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >방 종류</label
              >
              <select v-model="form.roomType" class="input" required>
                <option value="">선택</option>
                <option value="원룸">원룸</option>
                <option value="1.5룸">1.5룸</option>
                <option value="투룸">투룸</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >층수</label
              >
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
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >면적 (m2)</label
            >
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
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >보증금 (만원)</label
            >
            <input
              v-model.number="form.deposit"
              type="number"
              placeholder="보증금"
              class="input"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >월세 (만원)</label
            >
            <input
              v-model.number="form.monthlyRent"
              type="number"
              placeholder="월세"
              class="input"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >관리비 (만원)</label
            >
            <input
              v-model.number="form.maintenanceFee"
              type="number"
              placeholder="관리비"
              class="input"
            />
          </div>
        </div>
      </div>

      <!-- Image Upload -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">매물 이미지</h2>
        <ImageUpload
          v-model="form.image"
          folder="listings"
          label="매물 이미지를 업로드하세요"
        />
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

    <!-- 지도 검색 모달 -->
    <BuildingSearchModal
      :is-open="showMapSearchModal"
      @close="showMapSearchModal = false"
      @select="handleBuildingSelectFromMap"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useBuildingStore } from "@/stores/building";
import { useListingStore } from "@/stores/listing";
import { useAuthStore } from "@/stores/auth";
import { buildingAPI } from "@/utils/api";
import BuildingSearchModal from "@/components/map/BuildingSearchModal.vue";
import ImageUpload from "@/components/common/ImageUpload.vue";

export default {
  name: "ListingCreatePage",
  components: {
    BuildingSearchModal,
    ImageUpload,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const buildingStore = useBuildingStore();
    const listingStore = useListingStore();
    const authStore = useAuthStore();

    const form = ref({
      buildingSearch: "",
      selectedBuilding: null,
      title: "",
      roomType: "",
      floor: null,
      area: null,
      deposit: null,
      monthlyRent: null,
      maintenanceFee: null,
      image: "",
      description: "",
    });

    const showMapSearchModal = ref(false);

    async function handleBuildingSelectFromMap(building) {
      // 지도에서 선택한 건물 처리
      try {
        // Building을 찾거나 생성
        let buildingId = building.id;

        // ID가 숫자가 아니거나 문자열인 경우 (카카오맵에서 가져온 경우)
        if (
          !buildingId ||
          typeof buildingId !== "number" ||
          String(buildingId).startsWith("kakao_")
        ) {
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

        if (buildingId) {
          // Building 정보 가져오기
          const response = await buildingAPI.getBuildingById(buildingId);
          const buildingData = response.data;

          const selectedBuilding = {
            id: buildingData.id,
            name: buildingData.name,
            road_address:
              buildingData.roadAddress || buildingData.road_address || "",
          };

          form.value.selectedBuilding = selectedBuilding;
          form.value.buildingSearch = `${buildingData.name} ${
            buildingData.roadAddress || ""
          }`.trim();
        }
      } catch (error) {
        console.error("건물 선택 처리 실패:", error);
        alert("건물을 선택하는데 실패했습니다.");
      }
    }

    async function findOrCreateBuilding(building) {
      try {
        const buildingName = building.name || building.placeName || "";
        const address =
          building.road_address ||
          building.roadAddress ||
          building.address ||
          "";

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

    onMounted(async () => {
      await buildingStore.fetchBuildings();

      // buildingId 쿼리 파라미터가 있으면 해당 건물을 자동으로 선택
      const buildingId = route.query.buildingId;
      if (buildingId) {
        try {
          // buildingId를 Number로 변환
          const buildingIdNum = Number(buildingId);
          if (isNaN(buildingIdNum)) {
            console.error("유효하지 않은 buildingId:", buildingId);
            return;
          }

          const response = await buildingAPI.getBuildingById(buildingIdNum);
          const building = response.data;

          if (!building || !building.id) {
            console.error("건물 정보가 올바르지 않습니다:", building);
            return;
          }

          const selectedBuilding = {
            id: building.id,
            name: building.name,
            road_address: building.roadAddress || building.roadAddress || "",
          };

          form.value.selectedBuilding = selectedBuilding;
          // 건물 검색 필드에도 표시
          form.value.buildingSearch = `${building.name} ${
            building.roadAddress || ""
          }`.trim();
        } catch (error) {
          console.error("건물 정보를 불러오는데 실패했습니다:", error);
          alert(
            "건물 정보를 불러오는데 실패했습니다: " +
              (error.response?.data?.message || error.message)
          );
        }
      }
    });

    async function handleSubmit() {
      // 로그인 체크
      const token = localStorage.getItem("token");
      if (!token || !authStore.isLoggedIn) {
        alert("매물을 등록하려면 로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      if (!form.value.selectedBuilding || !form.value.selectedBuilding.id) {
        alert("건물을 선택해주세요.");
        return;
      }

      // 필수 필드 검증
      if (
        !form.value.title ||
        !form.value.roomType ||
        !form.value.deposit ||
        !form.value.monthlyRent ||
        !form.value.area ||
        form.value.floor === null
      ) {
        alert("모든 필수 항목을 입력해주세요.");
        return;
      }

      try {
        const listingData = {
          title: form.value.title,
          roomType: form.value.roomType,
          deposit: Number(form.value.deposit),
          monthlyRent: Number(form.value.monthlyRent),
          maintenanceFee: form.value.maintenanceFee
            ? Number(form.value.maintenanceFee)
            : 0,
          areaM2: Number(form.value.area),
          floor: Number(form.value.floor),
          image: form.value.image || "",
          building: {
            id: Number(form.value.selectedBuilding.id),
          },
        };

        console.log("매물 등록 데이터:", listingData);
        console.log("선택된 건물:", form.value.selectedBuilding);
        console.log("건물 ID:", form.value.selectedBuilding?.id);
        console.log("건물 ID 타입:", typeof form.value.selectedBuilding?.id);

        const result = await listingStore.createListing(listingData);
        if (result.success) {
          alert("매물이 등록되었습니다!");
          // buildingId가 있었으면 해당 빌딩 상세 페이지로 이동
          const buildingId = route.query.buildingId;
          if (buildingId) {
            router.push(`/buildings/${buildingId}`);
          } else {
            router.push("/listings");
          }
        } else {
          alert(result.error || "매물 등록에 실패했습니다.");
        }
      } catch (err) {
        console.error("매물 등록 에러:", err);
        console.error("에러 상세:", err.response?.data);
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "매물 등록에 실패했습니다.";
        alert(errorMessage);
      }
    }

    return {
      form,
      showMapSearchModal,
      handleSubmit,
      handleBuildingSelectFromMap,
    };
  },
};
</script>
