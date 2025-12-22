<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        아파트 전월세 실거래가 조회
      </h1>
      <p class="text-gray-600">
        국토교통부 공공데이터를 기반으로 실거래가 정보를 제공합니다.
      </p>
    </div>

    <!-- Search Form -->
    <div class="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >지역 선택 (서울시)</label
          >
          <select
            v-model="searchParams.lawdCd"
            class="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="" disabled>지역을 선택하세요</option>
            <option
              v-for="district in seoulDistricts"
              :key="district.code"
              :value="district.code"
            >
              {{ district.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >계약년월 (선택사항)</label
          >
          <input
            v-model="searchParams.dealYmd"
            type="month"
            class="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <button
          @click="handleSearch"
          :disabled="isLoading || !searchParams.lawdCd"
          class="btn-primary h-10 w-full flex items-center justify-center"
        >
          <span v-if="isLoading">조회중...</span>
          <span v-else>조회하기</span>
        </button>
      </div>
    </div>

    <!-- Results Table -->
    <div v-if="transactions.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                아파트명
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                주소
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                전용면적
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                계약일
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                보증금 / 월세
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                층
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, index) in transactions" :key="index" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ item.apartmentName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.roadAddress || item.jibunAddress }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.area }} m²
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.dealDate }}.{{ item.dealMonth }}.{{ item.dealDay }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {{ formatMoney(item.deposit) }} <span v-if="item.monthlyRent && item.monthlyRent !== '0'">/ {{ formatMoney(item.monthlyRent) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.floor }}층
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading && hasSearched" class="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">검색 결과가 없습니다</h3>
      <p class="mt-1 text-sm text-gray-500">다른 조건으로 검색해 보세요.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { publicDataAPI } from "@/utils/api";

const seoulDistricts = [
  { code: "11680", name: "강남구" },
  { code: "11650", name: "서초구" },
  { code: "11710", name: "송파구" },
  { code: "11440", name: "마포구" },
  { code: "11560", name: "영등포구" },
  { code: "11110", name: "종로구" },
  { code: "11140", name: "중구" },
  { code: "11170", name: "용산구" },
  { code: "11200", name: "성동구" },
  { code: "11215", name: "광진구" },
  { code: "11230", name: "동대문구" },
  { code: "11260", name: "중랑구" },
  { code: "11290", name: "성북구" },
  { code: "11305", name: "강북구" },
  { code: "11320", name: "도봉구" },
  { code: "11350", name: "노원구" },
  { code: "11380", name: "은평구" },
  { code: "11410", name: "서대문구" },
  { code: "11470", name: "양천구" },
  { code: "11500", name: "강서구" },
  { code: "11530", name: "구로구" },
  { code: "11545", name: "금천구" },
  { code: "11590", name: "동작구" },
  { code: "11620", name: "관악구" },
  { code: "11740", name: "강동구" },
];

const searchParams = reactive({
  lawdCd: "",
  dealYmd: "",
});

const transactions = ref([]);
const isLoading = ref(false);
const hasSearched = ref(false);

async function handleSearch() {
  if (!searchParams.lawdCd) return;

  isLoading.value = true;
  hasSearched.value = true;
  transactions.value = [];

  try {
    // YYYY-MM -> YYYYMM format
    // Ensure we only send 6 digits (YYYYMM) and remove any non-numeric characters
    let formattedDate = "";
    if (searchParams.dealYmd) {
      const cleanDate = String(searchParams.dealYmd).replace(/[^0-9]/g, "");
      if (cleanDate.length >= 6) {
        formattedDate = cleanDate.substring(0, 6);
      }
    }
    
    // Explicitly ensure both parameters are strings
    const finalLawdCd = String(searchParams.lawdCd);
    const finalDealYmd = String(formattedDate);

    console.log("Searching with:", finalLawdCd, finalDealYmd);

    const response = await publicDataAPI.getApartmentRentData(
      finalLawdCd,
      finalDealYmd
    );
    transactions.value = response.data || [];
  } catch (error) {
    console.error("실거래가 조회 실패:", error);
    alert("데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해 주세요.");
  } finally {
    isLoading.value = false;
  }
}

function formatMoney(value) {
  if (!value) return "0";
  // 공공데이터 API는 '10,000' 형태의 문자열로 줄 수 있음
  const num = parseInt(value.toString().replace(/,/g, ""));
  if (isNaN(num)) return value;
  
  if (num >= 10000) {
    const uk = Math.floor(num / 10000);
    const remainder = num % 10000;
    return `${uk}억 ${remainder > 0 ? remainder.toLocaleString() : ""}만원`;
  }
  return `${num.toLocaleString()}만원`;
}
</script>
