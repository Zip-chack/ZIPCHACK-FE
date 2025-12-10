import axios from "axios";

// API 기본 URL 설정
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 - 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 인증 실패 시 로그아웃 처리
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) =>
    apiClient.post("/auth/login", { email, password }),

  register: (userData) => apiClient.post("/auth/register", userData),

  logout: () => apiClient.post("/auth/logout"),

  getCurrentUser: () => apiClient.get("/auth/me"),
};

// Listing API
export const listingAPI = {
  getListings: (params) => apiClient.get("/listings", { params }),

  getListingById: (id) => apiClient.get(`/listings/${id}`),

  createListing: (listingData) => apiClient.post("/listings", listingData),

  updateListing: (id, listingData) =>
    apiClient.put(`/listings/${id}`, listingData),

  deleteListing: (id) => apiClient.delete(`/listings/${id}`),

  toggleFavorite: (id) => apiClient.post(`/listings/${id}/favorite`),

  getFavorites: () => apiClient.get("/listings/favorites"),
};

// Building API
export const buildingAPI = {
  getBuildings: (params) => apiClient.get("/buildings", { params }),

  getBuildingById: (id) => apiClient.get(`/buildings/${id}`),

  searchBuildings: (query) =>
    apiClient.get("/buildings/search", { params: { q: query } }),

  createBuilding: (buildingData) => apiClient.post("/buildings", buildingData),

  getBuildingListings: (buildingId) =>
    apiClient.get(`/buildings/${buildingId}/listings`),
};

// Review API
export const reviewAPI = {
  getListingReviews: (listingId) =>
    apiClient.get(`/listings/${listingId}/reviews`),

  createListingReview: (listingId, reviewData) =>
    apiClient.post(`/listings/${listingId}/reviews`, reviewData),

  getBuildingReviews: (buildingId) =>
    apiClient.get(`/buildings/${buildingId}/reviews`),

  createBuildingReview: (buildingId, reviewData) =>
    apiClient.post(`/buildings/${buildingId}/reviews`, reviewData),

  updateReview: (reviewId, reviewData) =>
    apiClient.put(`/reviews/${reviewId}`, reviewData),

  deleteReview: (reviewId) => apiClient.delete(`/reviews/${reviewId}`),
};

// Kakao Map API
export const kakaoMapAPI = {
  searchAddress: (query) =>
    apiClient.get("/kakao/address", { params: { query } }),

  searchKeyword: (query, lat, lng, radius) =>
    apiClient.get("/kakao/keyword", {
      params: {
        query,
        ...(lat && lng && { lat, lng }),
        ...(radius && { radius }),
      },
    }),

  coordToAddress: (lat, lng) =>
    apiClient.get("/kakao/coord2address", { params: { lat, lng } }),

  searchBuildingsInBounds: (swLat, swLng, neLat, neLng) =>
    apiClient.get("/kakao/buildings-in-bounds", {
      params: { swLat, swLng, neLat, neLng },
    }),

  getNearbyCommerceInfo: (lat, lng, radius) =>
    apiClient.get("/kakao/nearby-commerce", {
      params: { lat, lng, ...(radius && { radius }) },
    }),
};

// Public Data API
export const publicDataAPI = {
  getApartmentRentData: (lawdCd, dealYmd) =>
    apiClient.get("/public-data/apartment-rent", {
      params: {
        lawdCd,
        ...(dealYmd && { dealYmd }),
      },
    }),
};

export default apiClient;
