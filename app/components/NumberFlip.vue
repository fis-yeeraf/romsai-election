<template>
  <div class="flex flex-col items-center gap-3">
    <div class="flex gap-2">
      <div class="relative h-[90px] w-[130px] overflow-hidden rounded-md text-gray-600 text-8xl">
        <div
          class="number-top absolute w-full h-full bg-white text-center shadow-sm shadow-gray-500"
        >
          <h3 class="relative -left-[5px] font-bold font-mono -tracking-[10px]">
            {{ number.toString().padStart(2, "0") }}
          </h3>
        </div>
        <div
          class="number-bottom absolute w-full h-full bg-white text-center shadow-sm shadow-gray-500"
        >
          <h3 class="relative -left-[5px] font-bold font-mono -tracking-[10px]">
            {{ number.toString().padStart(2, "0") }}
          </h3>
        </div>
        <div
          class="z-10 h-[20px] w-[10px] bg-gray-200 left-1 shadow-xs shadow-gray-500/50 absolute top-1/2 transform -translate-y-1/2"
        ></div>
        <div
          class="z-10 h-[20px] w-[10px] bg-gray-200 right-1 shadow-xs shadow-gray-500/50 absolute top-1/2 transform -translate-y-1/2"
        ></div>
      </div>
    </div>
    <div class="font-bold text-2xl text-white">
      <h2 v-if="type === 'day'">วัน</h2>
      <h2 v-if="type === 'hour'">ชั่วโมง</h2>
      <h2 v-if="type === 'minute'">นาที</h2>
      <h2 v-if="type === 'second'">วินาที</h2>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ number: number | string; type?: "day" | "hour" | "minute" | "second" }>()
</script>
<style scoped>
.number-top {
  clip-path: polygon(0 0, 100% 0%, 100% 48%, 0 48%);
}
.number-bottom {
  clip-path: polygon(0 52%, 100% 52%, 100% 100%, 0 100%);
}
</style>
