<template>
  <div class="card p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-gray-900">상권 분석</h3>
      <button
        @click="generateAnalysis"
        :disabled="isGenerating"
        class="btn-primary text-sm"
      >
        {{ isGenerating ? "분석 중..." : "분석 생성" }}
      </button>
    </div>

    <div v-if="isGenerating" class="text-center py-8">
      <p class="text-gray-500 text-sm">상권 분석을 생성하는 중입니다...</p>
    </div>

    <div v-else-if="analysisData">
      <!-- Radar Chart -->
      <div v-if="chartData" class="mb-6">
        <div class="max-w-sm mx-auto" style="height: 300px">
          <RadarChart :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- LLM Report -->
      <div v-if="report" class="mt-6">
        <div class="prose prose-sm max-w-none">
          <div
            class="p-6 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-line"
            v-html="formatReport(report)"
          ></div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <p class="text-gray-500 text-sm mb-4">
        상권 분석을 생성하려면 버튼을 클릭하세요.
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
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
  name: "CommerceAnalysis",
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
    const isGenerating = ref(false);
    const commerceInfo = ref(null);
    const report = ref("");
    const analysisData = ref(null);

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

    const generateAnalysis = async () => {
      isGenerating.value = true;
      try {
        // 상권 정보 조회
        const commerceResponse = await kakaoMapAPI.getNearbyCommerceInfo(
          props.lat,
          props.lng,
          props.radius
        );
        commerceInfo.value = commerceResponse.data;

        // 레포트 생성 (Python AI 서버 호출)
        try {
          const reportResponse = await kakaoMapAPI.getCommerceReport(
            props.lat,
            props.lng,
            props.radius
          );
          report.value = reportResponse.data.report;
        } catch (err) {
          console.error("레포트 생성 실패:", err);
          report.value = "레포트를 생성하는데 실패했습니다.";
        }

        analysisData.value = {
          commerceInfo: commerceInfo.value,
          report: report.value,
        };
      } catch (err) {
        console.error("상권 분석 실패:", err);
        alert("상권 분석을 생성하는데 실패했습니다.");
      } finally {
        isGenerating.value = false;
      }
    };

    const formatReport = (text) => {
      if (!text) return "";

      // 줄 단위로 분리
      const lines = text.split("\n");
      let formatted = "";
      let inList = false;

      lines.forEach((line, index) => {
        const trimmed = line.trim();

        // 헤더 처리
        if (trimmed.startsWith("### ")) {
          if (inList) {
            formatted += "</ul>";
            inList = false;
          }
          formatted += `<h3 class="text-lg font-semibold text-gray-900 mb-3 mt-4">${trimmed.substring(
            4
          )}</h3>`;
        } else if (trimmed.startsWith("## ")) {
          if (inList) {
            formatted += "</ul>";
            inList = false;
          }
          formatted += `<h2 class="text-xl font-semibold text-gray-900 mb-3 mt-4">${trimmed.substring(
            3
          )}</h2>`;
        } else if (trimmed.startsWith("# ")) {
          if (inList) {
            formatted += "</ul>";
            inList = false;
          }
          formatted += `<h1 class="text-2xl font-semibold text-gray-900 mb-4 mt-4">${trimmed.substring(
            2
          )}</h1>`;
        }
        // 리스트 처리
        else if (trimmed.startsWith("- ")) {
          if (!inList) {
            formatted += '<ul class="list-disc ml-6 mb-3 space-y-1">';
            inList = true;
          }
          formatted += `<li>${trimmed.substring(2)}</li>`;
        }
        // 빈 줄 처리
        else if (trimmed === "") {
          if (inList) {
            formatted += "</ul>";
            inList = false;
          }
          formatted += "<br>";
        }
        // 일반 텍스트 처리
        else {
          if (inList) {
            formatted += "</ul>";
            inList = false;
          }
          // 이미 <p> 태그가 있거나 헤더 다음이면 그냥 추가
          if (
            formatted.endsWith("</h3>") ||
            formatted.endsWith("</h2>") ||
            formatted.endsWith("</h1>")
          ) {
            formatted += `<p class="mb-3 leading-relaxed">${trimmed}</p>`;
          } else if (
            !formatted.endsWith("</p>") &&
            !formatted.endsWith("<br>")
          ) {
            formatted += `<p class="mb-3 leading-relaxed">${trimmed}</p>`;
          } else {
            formatted += `<p class="mb-3 leading-relaxed">${trimmed}</p>`;
          }
        }
      });

      // 마지막에 리스트가 열려있으면 닫기
      if (inList) {
        formatted += "</ul>";
      }

      return formatted;
    };

    return {
      isGenerating,
      commerceInfo,
      report,
      analysisData,
      chartData,
      chartOptions,
      generateAnalysis,
      formatReport,
    };
  },
};
</script>
