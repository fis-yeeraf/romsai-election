<template>
  <div class="flex justify-center">
    <ul class="grid grid-cols-2 md:grid-cols-3 gap-2">
      <li
        v-for="station in stations"
        :key="station.id"
        class="flex flex-col items-center border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition duration-300 hover:cursor-pointer"
        :class="{ 'bg-green-700 text-white': activeStation === station.id }"
        @click="$emit('selectStation', station.id)"
      >
        <h2>{{ station.name }}</h2>
        <p class="text-sm text-gray-500" :class="{ 'text-white': activeStation === station.id }">
          {{ station.address }}
        </p>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
defineProps<{ stations: PollingStation[]; activeStation: string | null }>()
const emit = defineEmits(["selectStation"])
</script>
