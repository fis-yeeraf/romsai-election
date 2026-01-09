<template>
  <div
    class="border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition duration-300 hover:cursor-pointer overflow-hidden"
  >
    <div v-if="ballotType === 'valid'" class="w-full flex gap-3 px-5 py-3">
      <div class="h-[60px] w-[60px] rounded-full overflow-hidden bg-gray-300">
        <div
          class="h-full w-full"
          :style="{
            background: `url(${candidate?.avatar})`,
            backgroundSize: 'cover',
            backgroundPosition: 'top center',
          }"
        ></div>
      </div>
      <div class="flex-1 flex justify-between">
        <div class="flex-1 flex flex-col justify-between">
          <h2 class="text-2xl font-bold">เบอร์ {{ candidate?.number }}</h2>
          <h2 class="text-sm font-semibold">
            {{ candidate?.first_name }} {{ candidate?.last_name }}
          </h2>
        </div>
        <div class="flex flex-col justify-between items-end">
          <p class="text-4xl font-bold">{{ voteCount?.toLocaleString() || 0 }}</p>
          <p class="text-sm font-semibold">คะแนน</p>
        </div>

        <!-- ลงคะแนน -->
        <!-- <div class="flex justify-end">
          <UButton class="cursor-pointer" v-if="!openModal" @click="openModal = true"
            >ลงคะแนน</UButton
          >
        </div> -->
        <!-- <UModal v-model:open="openModal" title="ลงคะแนน" description="">
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
              <UButton class="cursor-pointer" @click="openModal = false" color="gray"
                >ยกเลิก</UButton
              >
              <UButton class="cursor-pointer" @click="submitScore" color="primary">ลงคะแนน</UButton>
            </div>
          </template>
        </UModal> -->
      </div>
    </div>
    <div
      v-else
      class="w-full flex items-center gap-3 px-5 py-3"
      :class="{ 'bg-error/10': ballotType === 'invalid', 'bg-gray-200': ballotType === 'no_vote' }"
    >
      <div class="flex-1 flex flex-col justify-between">
        <h2 class="text-2xl font-bold">
          {{ ballotType === "invalid" ? "บัตรเสีย" : "งดออกเสียง" }}
        </h2>
      </div>
      <div class="flex flex-col justify-between items-end">
        <p class="text-4xl font-bold">{{ voteCount?.toLocaleString() || 0 }}</p>
        <p class="text-sm font-semibold">คะแนน</p>
      </div>
    </div>
    <div class="flex text-white rounded-full">
      <UButton
        color="error"
        class="flex-1 flex justify-center items-center py-3 cursor-pointer rounded-none text-lg"
        icon="i-lucide-minus"
        :disabled="voteCount === 0 && ballotType !== 'valid'"
        @click="onHandleClick('minus')"
      >
        ลบคะแนน
      </UButton>
      <input
        v-if="villageNumber === 2 && ballotType === 'valid'"
        name="score"
        v-model="score"
        readonly
        class="w-[40px] text-center text-gray-900 font-bold text-2xl outline-none"
      />
      <UButton
        color="primary"
        class="flex-1 flex justify-center items-center py-3 cursor-pointer rounded-none text-lg"
        icon="i-lucide-plus"
        :disabled="(villageNumber === 2 && score > 0 && ballotType === 'valid') || disablePlus"
        @click="onHandleClick('plus')"
      >
        เพิ่มคะแนน
      </UButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { RecordVotes } from "~~/shared/types"
const {
  ballotType = "valid",
  candidateType = "council",
  candidate = null,
  disablePlus = false,
  disableMinus = false,
  ...props
} = defineProps<{
  candidateType?: "mayor" | "council"
  ballotType?: "valid" | "invalid" | "no_vote"
  candidate?: Candidate | null
  voteCount: number | null | undefined
  stationName: string | undefined
  villageNumber: number | undefined
  resetScore?: Date | null
  disablePlus?: boolean
  disableMinus?: boolean
}>()
const openModal = ref(false)
const error = ref<string | null>(null)
const score = ref<number>(0)

const emit = defineEmits(["vote", "votes"])

watch(
  () => props.resetScore,
  () => {
    score.value = 0
  }
)

const onHandleClick = (type: "plus" | "minus") => {
  if (type === "plus") {
    if (props.villageNumber === 2 && ballotType === "valid") {
      score.value++
      emit("votes", candidate?.number, type)
    } else {
      // emit("vote", {
      //   stationName: props.stationName!,
      //   villageNumber: props.villageNumber!,
      //   candidateNumber: candidate?.number || null,
      //   candidateType,
      //   ballotType,
      //   score: 1,
      // })
      emit("vote", {
        stationName: props.stationName!,
        villageNumber: props.villageNumber!,
        candidate1Number: candidate?.number || null,
        candidate2Number: null,
        candidateType,
        ballotType,
        score: 1,
      } as RecordVotes)
    }
  } else if (props.villageNumber === 2 && ballotType === "valid" && score.value > 0) {
    score.value--
    emit("votes", candidate?.number, type)
  } else {
    // emit("vote", {
    //   stationName: props.stationName!,
    //   villageNumber: props.villageNumber!,
    //   candidateNumber: candidate?.number || null,
    //   candidateType,
    //   ballotType,
    //   score: -1,
    // })
    emit("vote", {
      stationName: props.stationName!,
      villageNumber: props.villageNumber!,
      candidate1Number: candidate?.number || null,
      candidate2Number: null,
      candidateType,
      ballotType,
      score: -1,
    } as RecordVotes)
  }
}
</script>
