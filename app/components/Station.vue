<template>
  <div class="flex justify-center">
    <ul v-if="selectedStation" class="w-full grid grid-cols-1 gap-2">
      <li
        v-for="station in stations?.filter((s) => s.id === selectedStation)"
        :key="station.id"
        class="flex items-center"
      >
        <div class="flex-1">
          <h2 class="font-bold text-lg">หมู่ที่ {{ station.village_number }}</h2>
          <p class="text-md text-gray-500">{{ station.address }}</p>
          <p class="text-md text-gray-500 mt-2">
            จำนวนผู้มาใช้สิทธิ์ทั้งหมด
            {{ props.ballotByStation?.total_eligible_voters?.toLocaleString() }} สิทธิ์
          </p>
        </div>
        <div class="px-2">
          <h2 class="font-bold text-5xl font-mono">
            {{ props.ballotByStation?.counting_percentage }}%
          </h2>
        </div>
      </li>
      <hr class="my-2 border-gray-200" />
      <li class="flex gap-3">
        <UButton class="flex-1" @click="$emit('selectStation', null, null)"
          >เปลี่ยนหน่วยเลือกตั้ง</UButton
        >
        <UButton class="flex-1" color="info" @click="openModalEligibleVoters = true"
          >ตั้งค่าผู้มาใช้สิทธิ์</UButton
        >
      </li>
    </ul>
    <ul v-else class="grid grid-cols-2 md:grid-cols-3 gap-2">
      <li
        v-for="station in stations"
        :key="station.id"
        class="flex flex-col items-center border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition duration-300 hover:cursor-pointer"
        :class="{ 'bg-green-700 text-white': selectedStation === station.id }"
        @click="() => $emit('selectStation', station.id, station.village_number)"
      >
        <h2>หมู่ที่ {{ station.village_number }}</h2>
        <p class="text-sm text-gray-500" :class="{ 'text-white': selectedStation === station.id }">
          {{ station.address }}
        </p>
      </li>
    </ul>
  </div>

  <UModal v-model:open="openModalEligibleVoters" title="ตั้งค่าผู้มาใช้สิทธิ์" description="">
    <template #body>
      <div>
        <UFormField label="ผู้มาใช้สิทธิ์" class="mt-4">
          <UInput
            placeholder="กรุณากรอกจำนวนผู้มาใช้สิทธิ์"
            class="w-full"
            v-model="eligibleVoters"
          />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="w-full flex justify-between">
        <UButton class="cursor-pointer" @click="openModalEligibleVoters = false" color="secondary"
          >ยกเลิก</UButton
        >
        <UButton
          class="cursor-pointer"
          @click="
            () => {
              emit('updateEligibleVoters', eligibleVoters)
              openModalEligibleVoters = false
            }
          "
          color="primary"
          >บันทึก</UButton
        >
      </div>
    </template>
  </UModal>
</template>
<script setup lang="ts">
import type { CountingProgressByStation } from "~~/shared/types"

const props = defineProps<{
  stations: PollingStation[] | null | undefined
  activeStation: string | null
  ballotByStation: CountingProgressByStation | null
}>()
const emit = defineEmits(["selectStation", "updateEligibleVoters"])
let selectedStation = ref<string | null>(props.activeStation)
const openModalEligibleVoters = ref(false)
const eligibleVoters = ref<number | null>(null)

watch(
  () => props.activeStation,
  () => {
    selectedStation.value = props.activeStation
  }
)

watch(
  () => props.ballotByStation,
  (value) => {
    if (value !== null) {
      eligibleVoters.value = value.total_eligible_voters
    }
  }
)
</script>
