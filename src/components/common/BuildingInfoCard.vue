<template>
  <div class="card p-6">
    <h3 class="font-semibold text-gray-900 mb-4">건물 정보</h3>
    <dl class="space-y-3 text-sm">
      <div class="flex justify-between">
        <dt class="text-gray-500">건물명</dt>
        <dd class="font-medium text-gray-900">{{ building.name }}</dd>
      </div>
      <div class="flex justify-between">
        <dt class="text-gray-500">주소</dt>
        <dd class="font-medium text-gray-900 text-right">
          {{ building.road_address }}
        </dd>
      </div>
      <div v-if="building.built_year" class="flex justify-between">
        <dt class="text-gray-500">건축년도</dt>
        <dd class="font-medium text-gray-900">{{ building.built_year }}년</dd>
      </div>
    </dl>
  </div>
</template>

<script>
export default {
  name: "BuildingInfoCard",
  props: {
    building: {
      type: Object,
      required: true,
      validator: (value) => {
        return value && value.name && value.road_address;
      },
    },
  },
};
</script>
