<template>
  <div class="card p-6">
    <h3 class="font-semibold text-gray-900 mb-4">상권 분석 그래프</h3>
    <div v-if="isLoading" class="text-center py-8">
      <p class="text-gray-500 text-sm">상권 정보를 불러오는 중...</p>
    </div>
    <div v-else-if="chartData" class="max-w-sm mx-auto" style="height: 300px">
      <RadarChart :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="text-center py-8">
      <p class="text-gray-500 text-sm">상권 정보를 불러올 수 없습니다</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from "vue";
import { Radar } from "vue-chartjs";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { kakaoMapAPI } from "@/utils/api";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default {
  name: "CommerceRadarChart",
  components: {
    RadarChart: Radar,
  },
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
    const commerceInfo = ref(null);
    const isLoading = ref(false);

    const chartData = computed(() => {
      if (!commerceInfo.value) return null;

      const labels = [
        "편의점",
        "카페",
        "마트",
        "음식점",
        "약국",
        "은행",
        "병원",
        "지하철역",
      ];
      const values = [
        commerceInfo.value.convenienceStore || 0,
        commerceInfo.value.cafe || 0,
        commerceInfo.value.mart || 0,
        commerceInfo.value.restaurant || 0,
        commerceInfo.value.pharmacy || 0,
        commerceInfo.value.bank || 0,
        commerceInfo.value.hospital || 0,
        commerceInfo.value.subway || 0,
      ];

      // 최대값 계산 (정규화를 위해)
      const maxValue = Math.max(...values, 1);

      return {
        labels,
        datasets: [
          {
            label: "상권 밀도",
            data: values.map((v) => (v / maxValue) * 100), // 0-100으로 정규화
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(59, 130, 246, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(59, 130, 246, 1)",
          },
        ],
      };
    });

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 1,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.parsed.r;
              const originalValue =
                commerceInfo.value[
                  [
                    "convenienceStore",
                    "cafe",
                    "mart",
                    "restaurant",
                    "pharmacy",
                    "bank",
                    "hospital",
                    "subway",
                  ][context.dataIndex]
                ] || 0;
              return `${label}: ${originalValue}개 (${value.toFixed(0)}%)`;
            },
          },
        },
      },
    };

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
        commerceInfo.value = null;
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
      chartData,
      chartOptions,
    };
  },
};
</script>
