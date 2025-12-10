<template>
  <div class="card p-6">
    <h3 class="font-semibold text-gray-900 mb-4">
      주변 상권
      <span class="text-sm font-normal text-gray-500 ml-2"
        >(근 {{ radius }}m 내)</span
      >
    </h3>
    <div v-if="isLoading" class="text-center py-4">
      <p class="text-gray-500 text-sm">상권 정보를 불러오는 중...</p>
    </div>
    <ul
      v-else-if="commerceInfo && Object.keys(commerceInfo).length > 0"
      class="space-y-3"
    >
      <li
        v-for="item in commerceItems"
        :key="item.key"
        class="flex items-center justify-between text-sm"
      >
        <div class="flex items-center">
          <span
            class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3"
          >
            <span class="text-primary-600">{{ item.icon }}</span>
          </span>
          <span class="text-gray-900">{{ item.label }}</span>
        </div>
        <span class="text-gray-900 font-medium"
          >{{ commerceInfo[item.key] || 0 }}개</span
        >
      </li>
    </ul>
    <div v-else class="text-center py-4">
      <p class="text-gray-500 text-sm">상권 정보를 불러올 수 없습니다</p>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted } from "vue";
import { kakaoMapAPI } from "@/utils/api";

export default {
  name: "NearbyCommerceInfo",
  props: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    radius: {
      type: Number,
      default: 500,
    },
  },
  setup(props) {
    const commerceInfo = ref({});
    const isLoading = ref(false);

    const commerceItems = [
      { key: "convenienceStore", label: "편의점", icon: "🏪" },
      { key: "cafe", label: "카페", icon: "☕" },
      { key: "mart", label: "마트", icon: "🛒" },
      { key: "restaurant", label: "음식점", icon: "🍽️" },
      { key: "pharmacy", label: "약국", icon: "💊" },
      { key: "bank", label: "은행", icon: "🏦" },
      { key: "hospital", label: "병원", icon: "🏥" },
      { key: "subway", label: "지하철역", icon: "🚇" },
    ];

    const fetchCommerceInfo = async () => {
      if (!props.lat || !props.lng) {
        return;
      }

      isLoading.value = true;
      try {
        const response = await kakaoMapAPI.getNearbyCommerceInfo(
          props.lat,
          props.lng,
          props.radius
        );
        commerceInfo.value = response.data;
      } catch (err) {
        console.error("주변 상권 정보를 불러오는데 실패했습니다:", err);
        commerceInfo.value = {};
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      fetchCommerceInfo();
    });

    // lat, lng, radius가 변경되면 다시 조회
    watch([() => props.lat, () => props.lng, () => props.radius], () => {
      fetchCommerceInfo();
    });

    return {
      commerceInfo,
      isLoading,
      commerceItems,
    };
  },
};
</script>
