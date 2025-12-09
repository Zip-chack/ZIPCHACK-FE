<template>
  <div class="card p-4">
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <span class="text-primary-600 font-semibold">{{ review.user.nickname.charAt(0) }}</span>
        </div>
        <div>
          <p class="font-medium text-gray-900">{{ review.user.nickname }}</p>
          <p class="text-xs text-gray-500">{{ formatDate(review.created_at) }}</p>
        </div>
      </div>
      <div class="flex items-center">
        <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span class="ml-1 font-semibold text-gray-900">{{ review.rating_overall }}</span>
      </div>
    </div>

    <h4 class="font-medium text-gray-900 mb-2">{{ review.title }}</h4>
    <p class="text-gray-600 text-sm leading-relaxed mb-3">{{ review.content }}</p>

    <div class="flex flex-wrap gap-2">
      <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
        소음 {{ review.rating_noise }}
      </span>
      <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
        집주인 {{ review.rating_landlord }}
      </span>
      <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
        시설 {{ review.rating_facility }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReviewCard',
  props: {
    review: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString)
      return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
    }
  }
}
</script>
