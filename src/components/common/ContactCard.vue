<template>
  <div class="card p-6">
    <h3 class="font-semibold text-gray-900 mb-4">연락하기</h3>
    <button class="btn-primary w-full mb-3" @click="handlePhoneCall">
      전화 문의
    </button>
    <button class="btn-secondary w-full" @click="handleMessage">
      메시지 보내기
    </button>
  </div>
</template>

<script>
export default {
  name: "ContactCard",
  methods: {
    handlePhoneCall() {
      // TODO: 전화 문의 기능 구현
      console.log("전화 문의");
    },
    handleMessage() {
      // TODO: 메시지 보내기 기능 구현
      console.log("메시지 보내기");
    },
  },
};
</script>
