<template>
  <div class="flex gap-2">
    <div
      v-for="(numberStr, index) in number.toString().split('')"
      :key="index"
      class="relative flex flex-col gap-1"
    >
      <div
        class="relative h-[70px] w-[100px] bg-white shadow-sm shadow-gray-500 text-center overflow-hidden rounded-t-md"
      >
        <h3
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/5 text-9xl font-bold font-mono"
        >
          {{ numberStr }}
        </h3>
      </div>
      <div
        class="z-10 h-[20px] w-[10px] bg-gray-200 left-1 shadow-xs shadow-gray-500/50 absolute top-1/2 transform -translate-y-1/2"
      ></div>
      <div
        class="z-10 h-[20px] w-[10px] bg-gray-200 right-1 shadow-xs shadow-gray-500/50 absolute top-1/2 transform -translate-y-1/2"
      ></div>
      <div
        class="relative h-[70px] w-[100px] bg-white shadow-sm shadow-gray-500 text-center overflow-hidden rounded-b-md"
      >
        <h3
          class="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/4 text-9xl font-bold font-mono mb-1"
        >
          {{ numberStr }}
        </h3>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ number: number }>()
</script>
<style scoped></style>
