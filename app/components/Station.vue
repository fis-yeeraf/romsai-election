<template>
  <div class="flex justify-center">
    <ul v-if="selectedStation" class="w-full grid grid-cols-1 gap-2">
      <li
        v-for="station in stations?.filter((s) => s.id === selectedStation)"
        :key="station.id"
        class="flex flex-col"
      >
        <h2 class="font-bold text-lg">หมู่ที่ {{ station.village_number }}</h2>
        <p class="text-md text-gray-500">{{ station.address }}</p>
        <p class="text-md text-gray-500 mt-2">จำนวนผู้มาใช้สิทธิ์ทั้งหมด 2,000 สิทธิ์</p>
      </li>
      <hr class="my-2 border-gray-200" />
      <li
        class="flex flex-col items-center border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition duration-300 hover:cursor-pointer"
        @click="$emit('selectStation', null, null)"
      >
        <h2>เปลี่ยนหน่วยเลือกตั้ง</h2>
      </li>
    </ul>
    <ul v-else class="grid grid-cols-2 md:grid-cols-3 gap-2">
      <li
        v-for="station in stations"
        :key="station.id"
        class="flex flex-col items-center border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition duration-300 hover:cursor-pointer"
        :class="{ 'bg-green-700 text-white': selectedStation === station.id }"
        @click="$emit('selectStation', station.id, station.village_number)"
      >
        <h2>หมู่ที่ {{ station.village_number }}</h2>
        <p class="text-sm text-gray-500" :class="{ 'text-white': selectedStation === station.id }">
          {{ station.address }}
        </p>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  stations: PollingStation[] | null | undefined
  activeStation: string | null
}>()
const emit = defineEmits(["selectStation"])
let selectedStation = ref<string | null>(props.activeStation)

watch(
  () => props.activeStation,
  () => {
    selectedStation.value = props.activeStation
  }
)
</script>
