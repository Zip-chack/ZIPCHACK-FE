<template>
  <div
    class="card hover:shadow-md transition-shadow cursor-pointer"
    @click="handleClick"
  >
    <!-- 이미지 영역 -->
    <div class="relative">
      <div
        class="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden"
      >
        <img
          v-if="imageUrl"
          :src="imageUrl"
          :alt="title"
          class="w-full h-full object-cover"
          @error="handleImageError"
        />
        <div v-else class="text-gray-400">
          <svg
            class="w-16 h-16 mx-auto"
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

      <!-- 찜하기 버튼 -->
      <button
        v-if="showFavoriteButton"
        @click.stop="handleToggleFavorite"
        class="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
        :aria-label="isFavorite ? '찜하기 해제' : '찜하기'"
      >
        <svg
          class="w-5 h-5 transition-colors"
          :class="isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      <!-- 방 타입 뱃지 -->
      <span
        v-if="roomType"
        class="absolute bottom-3 left-3 bg-primary-500 text-white text-xs px-2 py-1 rounded"
      >
        {{ roomType }}
      </span>
    </div>

    <!-- 내용 영역 -->
    <div class="p-4">
      <!-- 건물 이름과 주소지 -->
      <div class="flex items-center justify-between mb-4 gap-2">
        <h3
          v-if="buildingName"
          class="font-bold text-gray-900 text-xl truncate flex-1 min-w-0"
          :title="buildingName"
        >
          {{ buildingName }}
        </h3>
        <p
          v-if="address"
          class="text-xs text-gray-400 flex-shrink-0 truncate"
          :title="address"
        >
          {{ address }}
        </p>
      </div>

      <!-- 제목 -->
      <h3 class="font-regular text-gray-700 mb-1 truncate" :title="title">
        {{ title }}
      </h3>

      <!-- 가격 및 평점 -->
      <div class="flex items-center justify-between">
        <!-- 가격 -->
        <div class="text-primary-600 font-bold">
          {{ formattedPrice }}
        </div>

        <!-- 평점 -->
        <div v-if="showRating" class="flex items-center text-sm text-gray-500">
          <svg
            class="w-4 h-4 text-yellow-400 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
          <span>{{ formattedRating }} ({{ reviewCount }})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";

export default {
  name: "ListingCard",
  props: {
    // 매물 데이터 (전체 객체를 받거나 개별 props로 받을 수 있음)
    listing: {
      type: Object,
      default: null,
    },
    // 개별 props (listing이 없을 때 사용)
    id: {
      type: [Number, String],
      default: null,
    },
    title: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    roomType: {
      type: String,
      default: "",
    },
    deposit: {
      type: [Number, String],
      default: null,
    },
    monthlyRent: {
      type: [Number, String],
      default: null,
    },
    address: {
      type: String,
      default: "",
    },
    rating: {
      type: [Number, String],
      default: 0,
    },
    reviewCount: {
      type: [Number, String],
      default: 0,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    // 옵션 props
    showFavoriteButton: {
      type: Boolean,
      default: true,
    },
    showRating: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["click", "toggleFavorite"],
  setup(props, { emit }) {
    // listing 객체가 있으면 우선 사용, 없으면 개별 props 사용
    const listingData = computed(() => {
      if (props.listing) {
        return props.listing;
      }
      return {
        id: props.id,
        title: props.title,
        image: props.image,
        room_type: props.roomType,
        deposit: props.deposit,
        monthly_rent: props.monthlyRent,
        building: {
          road_address: props.address,
        },
        rating: props.rating,
        review_count: props.reviewCount,
        is_favorite: props.isFavorite,
        isFavorite: props.isFavorite,
      };
    });

    // 계산된 속성들
    const imageUrl = computed(() => {
      const url =
        listingData.value.image ||
        listingData.value.imageUrl ||
        listingData.value.image_url ||
        "";

      if (import.meta.env.DEV && url) {
        console.log("[ListingCard] 이미지 URL:", url, {
          image: listingData.value.image,
          imageUrl: listingData.value.imageUrl,
          image_url: listingData.value.image_url,
        });
      }

      return url;
    });

    const title = computed(() => {
      return listingData.value.title || "";
    });

    const roomType = computed(() => {
      return listingData.value.room_type || listingData.value.roomType || "";
    });

    const buildingName = computed(() => {
      if (listingData.value.building) {
        return (
          listingData.value.building.name ||
          listingData.value.buildingName ||
          ""
        );
      }
      return "";
    });

    const address = computed(() => {
      if (listingData.value.building) {
        return (
          listingData.value.building.road_address ||
          listingData.value.building.roadAddress ||
          ""
        );
      }
      return "";
    });

    const deposit = computed(() => {
      return listingData.value.deposit || 0;
    });

    const monthlyRent = computed(() => {
      return (
        listingData.value.monthly_rent || listingData.value.monthlyRent || 0
      );
    });

    const rating = computed(() => {
      return listingData.value.rating || 0;
    });

    const formattedRating = computed(() => {
      const ratingValue = rating.value;
      return Number(ratingValue).toFixed(2);
    });

    const reviewCount = computed(() => {
      return (
        listingData.value.review_count || listingData.value.reviewCount || 0
      );
    });

    const isFavorite = computed(() => {
      // 명시적으로 boolean 값 확인 (false도 유효한 값이므로)
      const value =
        listingData.value.is_favorite !== undefined
          ? listingData.value.is_favorite
          : listingData.value.isFavorite !== undefined
          ? listingData.value.isFavorite
          : false;

      // 디버깅용 로그 (개발 환경에서만)
      if (import.meta.env.DEV && value) {
        console.log("ListingCard - 찜한 매물:", {
          id: listingData.value.id,
          title: listingData.value.title,
          is_favorite: listingData.value.is_favorite,
          isFavorite: listingData.value.isFavorite,
          computed: value,
        });
      }

      return Boolean(value);
    });

    const formattedPrice = computed(() => {
      const depositValue = deposit.value;
      const rentValue = monthlyRent.value;

      if (depositValue && rentValue) {
        return `${depositValue}/${rentValue}만원`;
      } else if (rentValue) {
        return `${rentValue}만원`;
      }
      return "가격 문의";
    });

    // 이벤트 핸들러
    const handleClick = () => {
      const listingId = listingData.value.id;
      // 기존 코드와의 호환성을 위해 id를 전달
      emit("click", listingId);
    };

    const handleToggleFavorite = () => {
      const listingId = listingData.value.id;
      emit("toggleFavorite", listingId);
    };

    const handleImageError = (event) => {
      // 이미지 로드 실패 시 빈 이미지로 처리
      console.error("[ListingCard] 이미지 로드 실패:", {
        imageUrl: imageUrl.value,
        src: event.target.src,
        error: event,
        errorType: event.type,
        target: event.target,
      });

      // 네트워크 에러인지 확인
      if (event.target.complete === false) {
        console.error(
          "[ListingCard] 이미지 로드 실패 - 네트워크 또는 CORS 문제일 수 있습니다."
        );
        console.error(
          "[ListingCard] S3 버킷의 CORS 설정과 퍼블릭 액세스 권한을 확인하세요."
        );
      }

      event.target.style.display = "none";
    };

    return {
      imageUrl,
      title,
      roomType,
      buildingName,
      address,
      formattedPrice,
      rating,
      formattedRating,
      reviewCount,
      isFavorite,
      handleClick,
      handleToggleFavorite,
      handleImageError,
    };
  },
};
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-100;
}
</style>
