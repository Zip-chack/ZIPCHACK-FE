import { defineStore } from "pinia";
import { ref } from "vue";
import { listingAPI } from "@/utils/api";
import { useAuthStore } from "@/stores/auth";
import router from "@/router";

export const useListingStore = defineStore("listing", () => {
  const listings = ref([]);
  const currentListing = ref(null);
  const favorites = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // 매물 목록 가져오기
  async function fetchListings(params = {}) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await listingAPI.getListings(params);

      listings.value = response.data.map((listing) => {
        const isFavoriteValue =
          listing.isFavorite !== undefined
            ? listing.isFavorite
            : listing.is_favorite !== undefined
            ? listing.is_favorite
            : false;

        if (import.meta.env.DEV) {
          console.log("[ListingStore] 매물 데이터:", {
            id: listing.id,
            title: listing.title,
            image: listing.image,
            imageUrl: listing.imageUrl,
            image_url: listing.image_url,
            isFavorite: isFavoriteValue,
          });
        }

        return {
          ...listing,
          is_favorite: isFavoriteValue,
          isFavorite: isFavoriteValue,
        };
      });
      return { success: true };
    } catch (err) {
      error.value =
        err.response?.data?.message || "매물 목록을 불러오는데 실패했습니다.";
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  // 매물 상세 정보 가져오기
  async function fetchListingById(id) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await listingAPI.getListingById(id);
      if (import.meta.env.DEV) {
        console.log("[ListingStore] 매물 상세 데이터:", {
          id: response.data.id,
          title: response.data.title,
          description: response.data.description,
          hasDescription: !!response.data.description,
        });
      }
      currentListing.value = {
        ...response.data,
        is_favorite:
          response.data.isFavorite ?? response.data.is_favorite ?? false,
      };
      return { success: true, data: currentListing.value };
    } catch (err) {
      error.value =
        err.response?.data?.message || "매물 정보를 불러오는데 실패했습니다.";
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  // 매물 생성
  async function createListing(listingData) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await listingAPI.createListing(listingData);
      listings.value.push(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      // 401 에러 (인증 실패) 처리
      if (err.response?.status === 401) {
        const errorMessage = err.response?.data?.error || "로그인이 필요합니다.";
        alert(errorMessage);
        router.push("/login");
        error.value = errorMessage;
        return { success: false, error: errorMessage };
      }
      
      error.value =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "매물 등록에 실패했습니다.";
      console.error("매물 등록 에러 상세:", err.response?.data);
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  // 매물 수정
  async function updateListing(id, listingData) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await listingAPI.updateListing(id, listingData);
      const index = listings.value.findIndex((l) => l.id === id);
      if (index !== -1) {
        listings.value[index] = response.data;
      }
      if (currentListing.value?.id === id) {
        currentListing.value = response.data;
      }
      return { success: true, data: response.data };
    } catch (err) {
      error.value = err.response?.data?.message || "매물 수정에 실패했습니다.";
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  // 매물 삭제
  async function deleteListing(id) {
    isLoading.value = true;
    error.value = null;
    try {
      await listingAPI.deleteListing(id);
      listings.value = listings.value.filter((l) => l.id !== id);
      if (currentListing.value?.id === id) {
        currentListing.value = null;
      }
      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || "매물 삭제에 실패했습니다.";
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  // 찜하기 토글
  async function toggleFavorite(listingId) {
    // 로그인 체크
    const authStore = useAuthStore();
    const token = localStorage.getItem("token");

    if (!token || !authStore.isLoggedIn) {
      alert("찜하기 기능을 사용하려면 로그인이 필요합니다.");
      router.push("/login");
      return { success: false, error: "로그인이 필요합니다." };
    }

    try {
      const response = await listingAPI.toggleFavorite(listingId);
      const isFavorite = response.data.is_favorite || response.data.isFavorite;

      const listing = listings.value.find((l) => l.id === listingId);
      if (listing) {
        listing.is_favorite = isFavorite;
        listing.isFavorite = isFavorite;
      }

      if (currentListing.value?.id === listingId) {
        currentListing.value.is_favorite = isFavorite;
        currentListing.value.isFavorite = isFavorite;
      }

      // 찜 목록도 업데이트 (서버에서 다시 불러오는 것이 더 정확하지만, 빠른 UI 업데이트를 위해)
      if (isFavorite) {
        if (!favorites.value.find((f) => f.id === listingId)) {
          const favoriteListing = listing || currentListing.value;
          if (favoriteListing) {
            favorites.value.push({
              ...favoriteListing,
              is_favorite: true,
              isFavorite: true,
            });
          }
        }
      } else {
        favorites.value = favorites.value.filter((f) => f.id !== listingId);
      }

      return { success: true };
    } catch (err) {
      error.value =
        err.response?.data?.message || "찜하기 처리에 실패했습니다.";
      return { success: false, error: error.value };
    }
  }

  // 찜 목록 가져오기
  async function fetchFavorites() {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await listingAPI.getFavorites();
      favorites.value = response.data.map((listing) => ({
        ...listing,
        is_favorite: listing.isFavorite ?? listing.is_favorite ?? true, // 찜 목록이므로 기본값 true
      }));
      return { success: true };
    } catch (err) {
      // 401 에러 (인증 실패) 처리
      if (err.response?.status === 401) {
        const errorMessage = err.response?.data?.error || "로그인이 필요합니다.";
        alert(errorMessage);
        router.push("/login");
        error.value = errorMessage;
        return { success: false, error: errorMessage };
      }
      
      error.value =
        err.response?.data?.message || "찜 목록을 불러오는데 실패했습니다.";
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  // ID로 매물 찾기 (로컬 캐시에서)
  function getListingById(id) {
    const parsedId = Number.parseInt(id);
    // 먼저 listings 배열에서 찾기
    const foundInList = listings.value.find((l) => l.id === parsedId);
    if (foundInList) {
      return foundInList;
    }
    // currentListing이 요청한 ID와 일치하는지 확인
    if (currentListing.value && currentListing.value.id === parsedId) {
      return currentListing.value;
    }
    return null;
  }

  return {
    listings,
    currentListing,
    favorites,
    isLoading,
    error,
    fetchListings,
    fetchListingById,
    createListing,
    updateListing,
    deleteListing,
    toggleFavorite,
    fetchFavorites,
    getListingById,
  };
});
