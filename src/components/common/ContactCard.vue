<template>
  <div class="card p-6">
    <h3 v-if="!isOwner" class="font-semibold text-gray-900 mb-4">연락하기</h3>
    <h3 v-else class="font-semibold text-gray-900 mb-4">매물 관리</h3>

    <!-- 소유자가 아닌 경우: 연락하기 버튼들 -->
    <template v-if="!isOwner">
      <div v-if="status === 'COMPLETED'" class="w-full mb-3 text-center">
        <button class="btn-disabled w-full cursor-not-allowed bg-gray-300 text-gray-600 py-2 px-4 rounded" disabled>
          거래 완료된 매물
        </button>
      </div>
      <div v-else-if="status === 'RESERVED'" class="w-full mb-3 text-center">
        <button class="btn-disabled w-full cursor-not-allowed bg-yellow-100 text-yellow-700 py-2 px-4 rounded" disabled>
          예약중인 매물
        </button>
      </div>
      <template v-else>
        <button class="btn-primary w-full mb-3" @click="handlePhoneCall">
          전화 문의
        </button>
        <button class="btn-secondary w-full" @click="handleMessage">
          메시지 보내기
        </button>
      </template>
    </template>

    <!-- 소유자인 경우: 매물 수정 버튼 -->
    <template v-else>
      <router-link
        :to="`/listings/${listingId}/edit`"
        class="btn-primary w-full block text-center"
      >
        매물 수정
      </router-link>
    </template>
  </div>
</template>

<script>
export default {
  name: "ContactCard",
  props: {
    listingId: {
      type: [Number, String],
      required: true,
    },
    isOwner: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: 'AVAILABLE',
    },
  },
  emits: ["start-chat"], // Declare the emitted event
  methods: {
    handlePhoneCall() {
      alert("전화 문의: 050-1234-5678");
    },
    handleMessage() {
      this.$emit("start-chat", this.listingId); // Emit custom event with listingId
    },
  },
};
</script>
