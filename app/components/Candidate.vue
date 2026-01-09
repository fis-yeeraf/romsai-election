<template>
  <div class="relative flex flex-col items-center h-[50vh] max-h-[385px]">
    <div
      class="h-full w-4/5"
      style="background-size: cover; background-position: center 15px; background-repeat: no-repeat"
      :style="{ backgroundImage: `url(${candidate.avatar})` }"
    ></div>
    <div class="absolute left-2 right-2 bottom-0">
      <div class="relative">
        <div
          class="relative z-10 w-[70px] h-[70px] rotate-45 flex items-center justify-center"
          :class="`bg-${color}`"
        >
          <h2 class="text-white text-5xl font-bold -rotate-45 origin-center font-mono">
            {{ candidate.number }}
          </h2>
        </div>
        <div class="absolute top-7 left-0 right-5">
          <div class="bg-[#464644] -skew-x-30 origin-center py-3 flex justify-end">
            <div
              class="text-white text-3xl font-bold skew-x-30 origin-center w-[calc(100%-40px)] text-center"
            >
              {{ candidate.first_name }} {{ candidate.last_name }}
            </div>
            <!-- <div class="text-white font-bold skew-x-30 origin-center pl-6 leading-4">
            {{ candidate.last_name }}
          </div> -->
          </div>
          <div class="bg-gray-300 -skew-x-30 origin-center flex gap-3 items-center justify-center">
            <div class="text-7xl font-bold skew-x-30 origin-center font-mono">
              <NumberFlow :value="totalVotes || 0" />
              <!-- {{ totalVotes.toLocaleString() || "0" }} -->
            </div>
            <div class="text-xl font-bold skew-x-30 origin-center pt-5">(คะแนน)</div>
          </div>
          <div
            class="text-white -skew-x-30 origin-center pt-2 flex gap-10 items-end justify-center"
            :class="`bg-${color}`"
          >
            <div
              v-for="(station, index) in voteByStations"
              :key="index"
              class="flex flex-col items-center justify-center"
            >
              <div class="text-md font-bold skew-x-30 origin-center">
                {{ station.station_name }}
              </div>
              <div class="text-5xl font-bold skew-x-30 origin-center font-mono leading-0 pl-3">
                <NumberFlow :value="station.total_votes || 0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Candidate, CandidateVoteSummaryByStation } from "~/shared/types"
import NumberFlow from "@number-flow/vue"

defineOptions({
  name: "CandidateComponent",
})

defineProps<{
  candidate: Candidate
  color: string | undefined
  voteByStations?: CandidateVoteSummaryByStation[]
  totalVotes: number
}>()
</script>
