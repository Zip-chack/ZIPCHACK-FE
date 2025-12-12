<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="closeModal"
      >
        <div
          class="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex flex-col m-4"
          @click.stop
        >
          <!-- 헤더 -->
          <div
            class="flex items-center justify-between p-4 border-b border-gray-200"
          >
            <h2 class="text-xl font-semibold text-gray-900">로드뷰</h2>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                class="w-6 h-6"
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

          <!-- 로드뷰 영역 -->
          <div class="flex-1 bg-gray-200 relative overflow-hidden">
            <div id="roadview-container" class="w-full h-full"></div>
            <div
              v-if="roadviewError"
              class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10"
            >
              <div class="text-center p-4">
                <p class="text-sm text-gray-600">{{ roadviewError }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";

export default {
  name: "RoadviewModal",
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const roadviewError = ref(null);
    let roadview = null;
    let roadviewClient = null;

    function closeModal() {
      emit("close");
    }

    function loadKakaoMapSDK() {
      // 이미 로드되어 있으면 바로 초기화
      if (
        typeof window.kakao !== "undefined" &&
        window.kakao.maps &&
        window.kakao.maps.Roadview
      ) {
        initRoadview();
        return;
      }

      // SDK 스크립트 로드
      const kakaoKey = import.meta.env.VITE_KAKAO_MAP_JS_KEY;
      if (!kakaoKey) {
        roadviewError.value = "카카오맵 JavaScript 키가 설정되지 않았습니다.";
        return;
      }

      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false&libraries=services`;
      script.async = true;
      script.onload = () => {
        try {
          window.kakao.maps.load(() => {
            roadviewError.value = null;
            initRoadview();
          });
        } catch (error) {
          roadviewError.value = "카카오맵 SDK 초기화 실패: " + error.message;
        }
      };
      script.onerror = () => {
        roadviewError.value = "카카오맵 SDK 스크립트 로드 실패.";
      };
      document.head.appendChild(script);
    }

    function initRoadview() {
      if (
        typeof window.kakao === "undefined" ||
        !window.kakao.maps ||
        !window.kakao.maps.Roadview
      ) {
        roadviewError.value = "카카오맵 로드뷰 SDK가 로드되지 않았습니다.";
        return;
      }

      const container = document.getElementById("roadview-container");
      if (!container) {
        roadviewError.value = "로드뷰 컨테이너를 찾을 수 없습니다.";
        return;
      }

      try {
        // 로드뷰 생성
        roadview = new window.kakao.maps.Roadview(container);
        roadviewClient = new window.kakao.maps.RoadviewClient();

        // 위치 설정
        const position = new window.kakao.maps.LatLng(props.lat, props.lng);

        // 가장 가까운 로드뷰 파노라마 ID 가져오기
        roadviewClient.getNearestPanoId(position, 50, function (panoId) {
          if (panoId === null) {
            roadviewError.value = "해당 위치의 로드뷰를 사용할 수 없습니다.";
            return;
          }
          roadview.setPanoId(panoId, position);
        });

        roadviewError.value = null;
      } catch (error) {
        roadviewError.value = "로드뷰 초기화 실패: " + error.message;
      }
    }

    // 모달이 열릴 때 로드뷰 초기화
    watch(
      () => props.isOpen,
      async (isOpen) => {
        if (isOpen) {
          await nextTick();
          loadKakaoMapSDK();
        } else {
          // 모달이 닫힐 때 로드뷰 정리
          if (roadview) {
            roadview = null;
          }
          if (roadviewClient) {
            roadviewClient = null;
          }
          roadviewError.value = null;
        }
      }
    );

    // 위치가 변경될 때 로드뷰 업데이트
    watch(
      () => [props.lat, props.lng],
      () => {
        if (props.isOpen && roadview && roadviewClient) {
          const position = new window.kakao.maps.LatLng(props.lat, props.lng);
          roadviewClient.getNearestPanoId(position, 50, function (panoId) {
            if (panoId === null) {
              roadviewError.value = "해당 위치의 로드뷰를 사용할 수 없습니다.";
              return;
            }
            roadview.setPanoId(panoId, position);
          });
        }
      }
    );

    onUnmounted(() => {
      // 로드뷰 정리
      if (roadview) {
        roadview = null;
      }
      if (roadviewClient) {
        roadviewClient = null;
      }
    });

    return {
      roadviewError,
      closeModal,
    };
  },
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
