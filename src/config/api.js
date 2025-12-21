// API 엔드포인트 상수 정의
export const API_ENDPOINTS = {
  // Auth 엔드포인트
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    CHECK_EMAIL: "/auth/check-email",
  },

  // Listing 엔드포인트
  LISTINGS: {
    BASE: "/listings",
    BY_ID: (id) => `/listings/${id}`,
    FAVORITES: "/listings/favorites",
    FAVORITE: (id) => `/listings/${id}/favorite`,
    REVIEWS: (listingId) => `/listings/${listingId}/reviews`,
    REVIEW: (listingId) => `/listings/${listingId}/reviews`,
  },

  // Building 엔드포인트
  BUILDINGS: {
    BASE: "/buildings",
    BY_ID: (id) => `/buildings/${id}`,
    SEARCH: "/buildings/search",
    LISTINGS: (buildingId) => `/buildings/${buildingId}/listings`,
    REVIEWS: (buildingId) => `/buildings/${buildingId}/reviews`,
    REVIEW: (buildingId) => `/buildings/${buildingId}/reviews`,
  },

  // Review 엔드포인트
  REVIEWS: {
    BY_ID: (reviewId) => `/reviews/${reviewId}`,
  },

  // Kakao Map API 엔드포인트
  KAKAO: {
    ADDRESS: "/kakao/address",
    KEYWORD: "/kakao/keyword",
    COORD2ADDRESS: "/kakao/coord2address",
    BUILDINGS_IN_BOUNDS: "/kakao/buildings-in-bounds",
    NEARBY_COMMERCE: "/kakao/nearby-commerce",
  },

  // Commerce Analysis 엔드포인트
  COMMERCE: {
    REPORT: "/commerce-analysis/report",
  },

  // Public Data API 엔드포인트
  PUBLIC_DATA: {
    APARTMENT_RENT: "/public-data/apartment-rent",
  },

  // Image API 엔드포인트
  IMAGES: {
    UPLOAD: "/images/upload",
    DELETE: "/images/delete",
  },
};

// API 기본 URL 설정 (환경변수에서 가져오거나 기본값 사용)
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
