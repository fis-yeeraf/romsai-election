<template>
  <div
    class="flex flex-col items-center border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition duration-300 hover:cursor-pointer overflow-hidden"
  >
    <div
      class="h-[100px] w-full relative"
      :class="{ 'bg-red-500': candidate.number === 1, 'bg-blue-500': candidate.number === 2 }"
    >
      <div
        class="flex items-center justify-center h-[100px] w-[100px] bg-white rounded-full absolute bottom-[-50px] left-1/2 transform -translate-x-1/2 text-4xl font-bold shadow-sm"
      >
        {{ candidate.number }}
      </div>
    </div>
    <div class="w-full p-4 pt-[70px] bg-gray-50">
      <h2 class="text-center text-xl font-bold">
        {{ candidate.first_name }} {{ candidate.last_name }}
      </h2>
      <div class="flex justify-between font-bold mb-3">
        <p>หน่วยเลือกตั้ง:</p>
        <p>{{ stationName }}</p>
      </div>
      <div class="flex justify-between font-bold">
        <p>คะแนนปัจจุบัน:</p>
        <p>{{ voteCount?.toLocaleString() || 0 }} คะแนน</p>
      </div>
      <hr class="my-4 border-gray-200" />

      <!-- ลงคะแนน -->
      <div class="flex justify-end">
        <UButton class="cursor-pointer" v-if="!openModal" @click="openModal = true"
          >ลงคะแนน</UButton
        >
      </div>
      <UModal v-model:open="openModal" title="ลงคะแนน" description="">
        <template #body>
          <div>
            <h2>
              ลงคะแนนให้
              <span class="font-bold">{{ candidate.first_name }} {{ candidate.last_name }}</span>
            </h2>
            <UFormField label="คะแนนที่ได้" class="mt-4" :error="error">
              <UInput placeholder="กรุณากรอกคะแนน" class="w-full" v-model="score" />
            </UFormField>
          </div>
        </template>
        <template #footer>
          <div class="w-full flex justify-between">
            <UButton class="cursor-pointer" @click="openModal = false" color="gray">ยกเลิก</UButton>
            <UButton class="cursor-pointer" @click="submitScore" color="primary">ลงคะแนน</UButton>
          </div>
        </template>
      </UModal>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  candidate: Candidate
  voteCount: number | null | undefined
  stationName: string | null | undefined
}>()
const openModal = ref(false)
const score = ref<number | null>(null)
const error = ref<string | null>(null)

const emit = defineEmits(["vote"])

const submitScore = () => {
  if (score.value === null) {
    error.value = "กรุณากรอกคะแนน"
    return
  }
  if (!/^\d+$/.test(score.value?.toString() || "")) {
    error.value = "กรุณากรอกตัวเลขเท่านั้น"
    return
  }
  emit("vote", score.value, props.candidate.id)
  score.value = null
  error.value = null
  openModal.value = false
}
</script>
