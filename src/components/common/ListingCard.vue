<template>
  <div class="card hover:shadow-md transition-shadow cursor-pointer" @click="$emit('click')">
    <div class="relative">
      <img :src="listing.image" :alt="listing.title" class="w-full h-48 object-cover" />
      <button
        @click.stop="$emit('toggleFavorite')"
        class="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
      >
        <svg
          class="w-5 h-5"
          :class="listing.is_favorite ? 'text-red-500 fill-current' : 'text-gray-400'"
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
      <span class="absolute bottom-3 left-3 bg-primary-500 text-white text-xs px-2 py-1 rounded">
        {{ listing.room_type }}
      </span>
    </div>
    <div class="p-4">
      <h3 class="font-semibold text-gray-900 mb-1 truncate">{{ listing.title }}</h3>
      <p class="text-sm text-gray-500 mb-2 truncate">{{ listing.building.road_address }}</p>
      <div class="flex items-center justify-between">
        <div class="text-primary-600 font-bold">
          {{ listing.deposit }}/{{ listing.monthly_rent }}만원
        </div>
        <div class="flex items-center text-sm text-gray-500">
          <svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {{ listing.rating }} ({{ listing.review_count }})
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ListingCard',
  props: {
    listing: {
      type: Object,
      required: true
    }
  },
  emits: ['click', 'toggleFavorite']
}
</script>
