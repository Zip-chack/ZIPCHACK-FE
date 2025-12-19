<template>
  <div class="card p-6">
    <h3 class="font-semibold text-gray-900 mb-4">연락하기</h3>
    <button class="btn-primary w-full mb-3" @click="handlePhoneCall">
      전화 문의
    </button>
    <button v-if="!isOwner" class="btn-secondary w-full" @click="handleMessage">
      메시지 보내기
    </button>
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
