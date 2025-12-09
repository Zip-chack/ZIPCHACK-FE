import { defineStore } from "pinia"
import { ref } from "vue"
import { listingAPI } from "@/utils/api"

export const useListingStore = defineStore("listing", () => {
  const listings = ref([])
  const currentListing = ref(null)
  const favorites = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // 매물 목록 가져오기
  async function fetchListings(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const response = await listingAPI.getListings(params)
      // 백엔드에서 isFavorite로 반환하지만, 프론트엔드에서는 is_favorite도 지원
      // 두 필드 모두 설정하여 호환성 보장
      listings.value = response.data.map(listing => {
        const isFavoriteValue = listing.isFavorite !== undefined 
          ? listing.isFavorite 
          : (listing.is_favorite !== undefined ? listing.is_favorite : false)
        
        // 디버깅용 로그 (개발 환경에서만)
        if (import.meta.env.DEV && isFavoriteValue) {
          console.log('찜한 매물 발견:', listing.id, listing.title, { isFavorite: listing.isFavorite, is_favorite: listing.is_favorite })
        }
        
        return {
          ...listing,
          is_favorite: isFavoriteValue,
          isFavorite: isFavoriteValue
        }
      })
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || "매물 목록을 불러오는데 실패했습니다."
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 매물 상세 정보 가져오기
  async function fetchListingById(id) {
    isLoading.value = true
    error.value = null
    try {
      const response = await listingAPI.getListingById(id)
      // 백엔드에서 isFavorite로 반환하지만, 프론트엔드에서는 is_favorite도 지원
      currentListing.value = {
        ...response.data,
        is_favorite: response.data.isFavorite ?? response.data.is_favorite ?? false
      }
      return { success: true, data: currentListing.value }
    } catch (err) {
      error.value = err.response?.data?.message || "매물 정보를 불러오는데 실패했습니다."
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 매물 생성
  async function createListing(listingData) {
    isLoading.value = true
    error.value = null
    try {
      const response = await listingAPI.createListing(listingData)
      listings.value.push(response.data)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || "매물 등록에 실패했습니다."
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 매물 수정
  async function updateListing(id, listingData) {
    isLoading.value = true
    error.value = null
    try {
      const response = await listingAPI.updateListing(id, listingData)
      const index = listings.value.findIndex((l) => l.id === id)
      if (index !== -1) {
        listings.value[index] = response.data
      }
      if (currentListing.value?.id === id) {
        currentListing.value = response.data
      }
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || "매물 수정에 실패했습니다."
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 매물 삭제
  async function deleteListing(id) {
    isLoading.value = true
    error.value = null
    try {
      await listingAPI.deleteListing(id)
      listings.value = listings.value.filter((l) => l.id !== id)
      if (currentListing.value?.id === id) {
        currentListing.value = null
      }
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || "매물 삭제에 실패했습니다."
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 찜하기 토글
  async function toggleFavorite(listingId) {
    try {
      const response = await listingAPI.toggleFavorite(listingId)
      const isFavorite = response.data.is_favorite || response.data.isFavorite
      
      const listing = listings.value.find((l) => l.id === listingId)
      if (listing) {
        listing.is_favorite = isFavorite
        listing.isFavorite = isFavorite
      }
      
      if (currentListing.value?.id === listingId) {
        currentListing.value.is_favorite = isFavorite
        currentListing.value.isFavorite = isFavorite
      }
      
      // 찜 목록도 업데이트 (서버에서 다시 불러오는 것이 더 정확하지만, 빠른 UI 업데이트를 위해)
      if (isFavorite) {
        if (!favorites.value.find((f) => f.id === listingId)) {
          const favoriteListing = listing || currentListing.value
          if (favoriteListing) {
            favorites.value.push({ ...favoriteListing, is_favorite: true, isFavorite: true })
          }
        }
      } else {
        favorites.value = favorites.value.filter((f) => f.id !== listingId)
      }
      
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || "찜하기 처리에 실패했습니다."
      return { success: false, error: error.value }
    }
  }

  // 찜 목록 가져오기
  async function fetchFavorites() {
    isLoading.value = true
    error.value = null
    try {
      const response = await listingAPI.getFavorites()
      // 백엔드에서 isFavorite로 반환하지만, 프론트엔드에서는 is_favorite도 지원
      favorites.value = response.data.map(listing => ({
        ...listing,
        is_favorite: listing.isFavorite ?? listing.is_favorite ?? true  // 찜 목록이므로 기본값 true
      }))
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || "찜 목록을 불러오는데 실패했습니다."
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // ID로 매물 찾기 (로컬 캐시에서)
  function getListingById(id) {
    return listings.value.find((l) => l.id === Number.parseInt(id)) || currentListing.value
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
  }
})
