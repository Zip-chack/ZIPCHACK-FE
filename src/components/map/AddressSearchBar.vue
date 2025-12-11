<template>
  <div class="p-4 border-b border-gray-200 bg-white">
    <div class="relative">
      <svg
        class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      <input
        v-model="localQuery"
        type="text"
        placeholder="주소로 검색하세요 (예: 광주광역시)"
        class="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
        @keyup.enter="handleSearch"
      />
      <button
        @click="handleSearch"
        :disabled="isSearching"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
      >
        {{ isSearching ? "검색 중..." : "검색" }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";

export default {
  name: "AddressSearchBar",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    isSearching: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "search"],
  setup(props, { emit }) {
    const localQuery = ref(props.modelValue);

    watch(
      () => props.modelValue,
      (newValue) => {
        localQuery.value = newValue;
      }
    );

    watch(localQuery, (newValue) => {
      emit("update:modelValue", newValue);
    });

    function handleSearch() {
      const query = localQuery.value.trim();
      if (query) {
        emit("search", query);
      }
    }

    return {
      localQuery,
      handleSearch,
    };
  },
};
</script>
