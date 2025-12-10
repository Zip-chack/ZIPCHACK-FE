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
            <input
              v-model="form.buildingSearch"
              type="text"
              placeholder="건물명 또는 주소로 검색"
              class="input"
              @input="searchBuildings"
            />
          </div>

          <!-- 선택된 건물 표시 -->
          <div
            v-if="form.selectedBuilding"
            class="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-lg"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">
                  {{ form.selectedBuilding.name }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ form.selectedBuilding.road_address }}
                </p>
              </div>
              <button
                type="button"
                @click="
                  form.selectedBuilding = null;
                  form.buildingSearch = '';
                "
                class="text-gray-400 hover:text-gray-600"
              >
                <svg
                  class="w-5 h-5"
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
          </div>

          <!-- 건물 검색 결과 -->

          <div
            v-if="searchedBuildings.length > 0 && !form.selectedBuilding"
            class="border rounded-lg divide-y"
          >
            <button
              v-for="building in searchedBuildings"
              :key="building.id"
              type="button"
              @click="selectBuilding(building)"
              class="w-full p-4 text-left hover:bg-gray-50 flex justify-between items-center"
              :class="{
                'bg-primary-50': form.selectedBuilding?.id === building.id,
              }"
            >
              <div>
                <p class="font-medium text-gray-900">{{ building.name }}</p>
                <p class="text-sm text-gray-500">{{ building.road_address }}</p>
              </div>
              <svg
                v-if="form.selectedBuilding?.id === building.id"
                class="w-5 h-5 text-primary-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
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
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useBuildingStore } from "@/stores/building";
import { useListingStore } from "@/stores/listing";
import { useAuthStore } from "@/stores/auth";
import { buildingAPI } from "@/utils/api";

export default {
  name: "ListingCreatePage",
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
      description: "",
    });

    const searchedBuildings = ref([]);

    async function searchBuildings() {
      if (!form.value.buildingSearch) {
        searchedBuildings.value = [];
        return;
      }
      try {
        const result = await buildingStore.searchBuildings(
          form.value.buildingSearch
        );
        if (result.success) {
          searchedBuildings.value = buildingStore.buildings;
        }
      } catch (err) {
        console.error("건물 검색 에러:", err);
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
          // searchedBuildings에도 추가하여 UI에 표시
          searchedBuildings.value = [selectedBuilding];
        } catch (error) {
          console.error("건물 정보를 불러오는데 실패했습니다:", error);
          alert(
            "건물 정보를 불러오는데 실패했습니다: " +
              (error.response?.data?.message || error.message)
          );
        }
      }
    });

    function selectBuilding(building) {
      form.value.selectedBuilding = building;
    }

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
          image: "",
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
      searchedBuildings,
      selectBuilding,
      searchBuildings,
      handleSubmit,
    };
  },
};
</script>
