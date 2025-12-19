<template>
  <div class="space-y-6">
    <!-- Image Gallery -->
    <div class="card overflow-hidden relative">
      <!-- Deal Complete Overlay -->
      <div
        v-if="
          listing &&
          (listing.status === 'COMPLETED' || listing.status === '거래완료')
        "
        class="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10"
      >
        <span class="text-white text-3xl font-bold">거래 완료</span>
      </div>

      <div
        class="w-full h-80 bg-gray-200 flex items-center justify-center overflow-hidden"
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

    <!-- Basic Info Card -->
    <div class="card p-6">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-5">
            <span
              v-if="roomType"
              class="bg-primary-500 text-white text-sm font-medium px-3 py-1.5 rounded-full shadow-md"
            >
              {{ roomType }}
            </span>
            <span
              v-if="buildingName"
              class="bg-gray-400 text-white text-sm font-medium px-3 py-1.5 rounded-full shadow-md"
            >
              {{ buildingName }}
            </span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
          <p v-if="address" class="text-gray-600 mt-1">{{ address }}</p>
          <p v-if="ownerId" class="text-gray-600 mt-1">
            등록자 ID: {{ ownerId }}
          </p>
        </div>
        <div class="flex items-center gap-2 ml-4">
          <button
            v-if="buildingLat && buildingLng"
            @click="$emit('show-roadview')"
            class="btn-secondary flex items-center gap-2 whitespace-nowrap"
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
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            로드뷰
          </button>
          <button
            v-if="showFavoriteButton"
            @click="handleToggleFavorite"
            class="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            :aria-label="isFavorite ? '찜하기 해제' : '찜하기'"
          >
            <svg
              class="w-6 h-6 transition-colors"
              :class="
                isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'
              "
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
        </div>
      </div>

      <!-- Price Info -->
      <div class="text-3xl font-bold text-primary-600 mb-6">
        <span v-if="deposit && monthlyRent">
          보증금 {{ deposit }}만 / 월세 {{ monthlyRent }}만
        </span>
        <span v-else-if="monthlyRent"> 월세 {{ monthlyRent }}만 </span>
        <span v-else class="text-gray-500">가격 문의</span>
        <span
          v-if="maintenanceFee"
          class="text-sm font-normal text-gray-500 ml-2"
        >
          (관리비 {{ maintenanceFee }}만 별도)
        </span>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-if="areaM2" class="text-center p-4 bg-gray-50 rounded-lg">
          <p class="text-gray-500 text-sm">면적</p>
          <p class="font-semibold text-gray-900">{{ areaM2 }}m²</p>
        </div>
        <div
          v-if="floor !== null && floor !== undefined"
          class="text-center p-4 bg-gray-50 rounded-lg"
        >
          <p class="text-gray-500 text-sm">층수</p>
          <p class="font-semibold text-gray-900">{{ floor }}층</p>
        </div>
        <div
          v-if="showRating && rating !== null && rating !== undefined"
          class="text-center p-4 bg-gray-50 rounded-lg"
        >
          <p class="text-gray-500 text-sm">평점</p>
          <p class="font-semibold text-gray-900">{{ rating.toFixed(1) }}점</p>
        </div>
        <div
          v-if="
            showReviewCount && reviewCount !== null && reviewCount !== undefined
          "
          class="text-center p-4 bg-gray-50 rounded-lg"
        >
          <p class="text-gray-500 text-sm">리뷰</p>
          <p class="font-semibold text-gray-900">{{ reviewCount }}개</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";

export default {
  name: "ListingBasicInfo",
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
    maintenanceFee: {
      type: [Number, String],
      default: null,
    },
    address: {
      type: String,
      default: "",
    },
    areaM2: {
      type: [Number, String],
      default: null,
    },
    floor: {
      type: [Number, String],
      default: null,
    },
    rating: {
      type: [Number, String],
      default: null,
    },
    reviewCount: {
      type: [Number, String],
      default: null,
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
    showReviewCount: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["toggleFavorite", "show-roadview"],
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
        maintenance_fee: props.maintenanceFee,
        building: {
          road_address: props.address,
        },
        area_m2: props.areaM2,
        floor: props.floor,
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
        console.log("[ListingBasicInfo] 이미지 URL:", url, {
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

    const buildingLat = computed(() => {
      if (listingData.value.building) {
        return listingData.value.building.lat || null;
      }
      return null;
    });

    const buildingLng = computed(() => {
      if (listingData.value.building) {
        return listingData.value.building.lng || null;
      }
      return null;
    });

    const deposit = computed(() => {
      return listingData.value.deposit || null;
    });

    const monthlyRent = computed(() => {
      return (
        listingData.value.monthly_rent || listingData.value.monthlyRent || null
      );
    });

    const maintenanceFee = computed(() => {
      return (
        listingData.value.maintenance_fee ||
        listingData.value.maintenanceFee ||
        null
      );
    });

    const areaM2 = computed(() => {
      return listingData.value.area_m2 || listingData.value.areaM2 || null;
    });

    const floor = computed(() => {
      return listingData.value.floor !== undefined
        ? listingData.value.floor
        : null;
    });

    const rating = computed(() => {
      const value = listingData.value.rating;
      return value !== undefined && value !== null ? Number(value) : null;
    });

    const reviewCount = computed(() => {
      return (
        listingData.value.review_count || listingData.value.reviewCount || null
      );
    });

    const isFavorite = computed(() => {
      const value =
        listingData.value.is_favorite !== undefined
          ? listingData.value.is_favorite
          : listingData.value.isFavorite !== undefined
          ? listingData.value.isFavorite
          : false;

      return Boolean(value);
    });

    const handleToggleFavorite = () => {
      const listingId = listingData.value.id;
      emit("toggleFavorite", listingId);
    };

    const handleImageError = (event) => {
      console.error("[ListingBasicInfo] 이미지 로드 실패:", {
        imageUrl: imageUrl.value,
        src: event.target.src,
        error: event,
        errorType: event.type,
        target: event.target,
      });

      // 네트워크 에러인지 확인
      if (event.target.complete === false) {
        console.error(
          "[ListingBasicInfo] 이미지 로드 실패 - 네트워크 또는 CORS 문제일 수 있습니다."
        );
        console.error(
          "[ListingBasicInfo] S3 버킷의 CORS 설정과 퍼블릭 액세스 권한을 확인하세요."
        );
      }

      event.target.style.display = "none";
    };

    const ownerId = computed(() => {
      return listingData.value.owner?.id || null;
    });

    return {
      imageUrl,
      title,
      roomType,
      buildingName,
      address,
      buildingLat,
      buildingLng,
      deposit,
      monthlyRent,
      maintenanceFee,
      areaM2,
      floor,
      rating,
      reviewCount,
      isFavorite,
      handleToggleFavorite,
      handleImageError,
      ownerId,
    };
  },
};
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-100;
}
</style>
