import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";

console.log("[API Client] 초기화 - API_BASE_URL:", API_BASE_URL);
console.log(
  "[API Client] VITE_API_BASE_URL:",
  import.meta.env.VITE_API_BASE_URL
);

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 180000, // 3분 타임아웃 (180초)
});

// 요청 인터셉터 - 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData인 경우 Content-Type 헤더를 제거 (브라우저가 자동으로 boundary 설정)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      console.log("[API Request] FormData 감지 - Content-Type 헤더 제거됨");
      // FormData 내용 확인 (디버깅용)
      for (let pair of config.data.entries()) {
        console.log(
          `[API Request] FormData 항목: ${pair[0]} =`,
          pair[1] instanceof File
            ? `File(${pair[1].name}, ${pair[1].size} bytes)`
            : pair[1]
        );
      }
    }

    console.log(
      "[API Request]",
      config.method?.toUpperCase(),
      config.baseURL + config.url,
      config.params || "",
      config.data instanceof FormData ? "(FormData)" : "",
      "Headers:",
      config.headers
    );
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      "[API Response]",
      response.config.method?.toUpperCase(),
      response.config.url,
      response.status,
      response.data
    );
    return response;
  },
  (error) => {
    console.error(
      "[API Response Error]",
      error.config?.method?.toUpperCase(),
      error.config?.url,
      error.response?.status,
      error.response?.data || error.message
    );
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
    apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password }),

  register: (userData) => apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData),

  logout: () => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),

  getCurrentUser: () => apiClient.get(API_ENDPOINTS.AUTH.ME),

  updateUser: (userData) =>
    apiClient.put(API_ENDPOINTS.AUTH.UPDATE_ME, userData),

  deleteAccount: () => apiClient.delete(API_ENDPOINTS.AUTH.DELETE_ME),

  checkEmail: (email) =>
    apiClient.get(API_ENDPOINTS.AUTH.CHECK_EMAIL, { params: { email } }),

  checkUsername: (username) =>
    apiClient.get(API_ENDPOINTS.AUTH.CHECK_USERNAME, { params: { username } }),

  sendVerificationCode: (email) =>
    apiClient.post(API_ENDPOINTS.AUTH.SEND_VERIFICATION_CODE, { email }),

  verifyEmail: (email, code) =>
    apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { email, code }),

  findUsername: (email, name) =>
    apiClient.post(API_ENDPOINTS.AUTH.FIND_USERNAME, { email, name }),

  findPassword: (email) =>
    apiClient.post(API_ENDPOINTS.AUTH.FIND_PASSWORD, { email }),

  verifyPasswordResetCode: (email, code) =>
    apiClient.post(API_ENDPOINTS.AUTH.VERIFY_PASSWORD_RESET_CODE, {
      email,
      code,
    }),

  resetPassword: (email, code, newPassword) =>
    apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      email,
      code,
      newPassword,
    }),
};

// User API
export const userAPI = {
  getMySummary: () => apiClient.get(API_ENDPOINTS.USERS.SUMMARY),
  getMyListings: () => apiClient.get(API_ENDPOINTS.USERS.MY_LISTINGS),
  getMyReviews: () => apiClient.get(API_ENDPOINTS.USERS.MY_REVIEWS),
};

// Listing API
export const listingAPI = {
  getListings: (params) =>
    apiClient.get(API_ENDPOINTS.LISTINGS.BASE, { params }),

  getListingById: (id) => apiClient.get(API_ENDPOINTS.LISTINGS.BY_ID(id)),

  createListing: (listingData) =>
    apiClient.post(API_ENDPOINTS.LISTINGS.BASE, listingData),

  updateListing: (id, listingData) =>
    apiClient.put(API_ENDPOINTS.LISTINGS.BY_ID(id), listingData),

  updateListingStatus: (id, status) =>
    apiClient.patch(`${API_ENDPOINTS.LISTINGS.BY_ID(id)}/status`, { status }),

  deleteListing: (id) => apiClient.delete(API_ENDPOINTS.LISTINGS.BY_ID(id)),

  toggleFavorite: (id) => apiClient.post(API_ENDPOINTS.LISTINGS.FAVORITE(id)),

  getFavorites: () => apiClient.get(API_ENDPOINTS.LISTINGS.FAVORITES),
};

// Building API
export const buildingAPI = {
  getBuildings: (params) =>
    apiClient.get(API_ENDPOINTS.BUILDINGS.BASE, { params }),

  getBuildingById: (id, params) => apiClient.get(API_ENDPOINTS.BUILDINGS.BY_ID(id), { params }),

  searchBuildings: (query) =>
    apiClient.get(API_ENDPOINTS.BUILDINGS.SEARCH, { params: { q: query } }),

  createBuilding: (buildingData) =>
    apiClient.post(API_ENDPOINTS.BUILDINGS.BASE, buildingData),

  getBuildingListings: (buildingId) =>
    apiClient.get(API_ENDPOINTS.BUILDINGS.LISTINGS(buildingId)),
};

// Review API
export const reviewAPI = {
  getListingReviews: (listingId) =>
    apiClient.get(API_ENDPOINTS.LISTINGS.REVIEWS(listingId)),

  createListingReview: (listingId, reviewData) =>
    apiClient.post(API_ENDPOINTS.LISTINGS.REVIEW(listingId), reviewData),

  getBuildingReviews: (buildingId) =>
    apiClient.get(API_ENDPOINTS.BUILDINGS.REVIEWS(buildingId)),

  createBuildingReview: (buildingId, reviewData) =>
    apiClient.post(API_ENDPOINTS.BUILDINGS.REVIEW(buildingId), reviewData),

  updateReview: (reviewId, reviewData) =>
    apiClient.put(API_ENDPOINTS.REVIEWS.BY_ID(reviewId), reviewData),

  deleteReview: (reviewId) =>
    apiClient.delete(API_ENDPOINTS.REVIEWS.BY_ID(reviewId)),
};

// Kakao Map API
export const kakaoMapAPI = {
  searchAddress: (query) =>
    apiClient.get(API_ENDPOINTS.KAKAO.ADDRESS, { params: { query } }),

  searchKeyword: (query, lat, lng, radius) =>
    apiClient.get(API_ENDPOINTS.KAKAO.KEYWORD, {
      params: {
        query,
        ...(lat && lng && { lat, lng }),
        ...(radius && { radius }),
      },
    }),

  coordToAddress: (lat, lng) =>
    apiClient.get(API_ENDPOINTS.KAKAO.COORD2ADDRESS, { params: { lat, lng } }),

  searchBuildingsInBounds: (swLat, swLng, neLat, neLng) =>
    apiClient.get(API_ENDPOINTS.KAKAO.BUILDINGS_IN_BOUNDS, {
      params: { swLat, swLng, neLat, neLng },
    }),

  getNearbyCommerceInfo: (lat, lng, radius) =>
    apiClient.get(API_ENDPOINTS.KAKAO.NEARBY_COMMERCE, {
      params: { lat, lng, ...(radius && { radius }) },
    }),

  getCommerceReport: (lat, lng, radius) =>
    apiClient.get(API_ENDPOINTS.COMMERCE.REPORT, {
      params: { lat, lng, ...(radius && { radius }) },
    }),
};

// Public Data API
export const publicDataAPI = {
  getApartmentRentData: (lawdCd, dealYmd) => {
    // dealYmd 파라미터 강력 정제: 모든 비숫자 제거 후 정확히 6자리 유지
    let cleanDealYmd = "";
    if (dealYmd) {
      cleanDealYmd = String(dealYmd).replace(/[^0-9]/g, "").substring(0, 6);
    }

    return apiClient.get(API_ENDPOINTS.PUBLIC_DATA.APARTMENT_RENT, {
      params: {
        lawdCd,
        ...(cleanDealYmd && { dealYmd: cleanDealYmd }),
      },
    });
  },
};

// Chat API
export const chatAPI = {
  createOrGetChatRoom: (listingId) =>
    apiClient.post("/chat/rooms", { listingId }),

  getMyChatRooms: () => apiClient.get("/chat/my-rooms"),

  getChatRoomById: (roomId) => apiClient.get(`/chat/rooms/${roomId}`),

  getChatMessages: (roomId) => apiClient.get(`/chat/rooms/${roomId}/messages`),

  completeChatRoom: (roomId) =>
    apiClient.patch(`/chat/rooms/${roomId}/complete`),

  deleteChatRoom: (roomId) => apiClient.delete(`/chat/rooms/${roomId}`),
};

// Real Estate Chat API
export const realEstateChatAPI = {
  chat: (message, conversationHistory = []) =>
    apiClient.post(API_ENDPOINTS.REAL_ESTATE_CHAT.BASE, {
      message,
      conversation_history: conversationHistory,
    }),
};

// Image API
export const imageAPI = {
  uploadImage: (file, folder = "uploads") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    return apiClient.post(API_ENDPOINTS.IMAGES.UPLOAD, formData);
  },

  deleteImage: (imageUrl) =>
    apiClient.delete(API_ENDPOINTS.IMAGES.DELETE, {
      params: { url: imageUrl },
    }),
};

export default apiClient;
