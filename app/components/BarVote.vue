<template>
  <div class="flex gap-2">
    <h2 class="text-md font-bold text-white">{{ stationName }}</h2>
    <div v-if="totalVotes > 0" class="flex flex-1 rounded-full overflow-hidden">
      <div
        class="text-center text-white font-bold text-xs py-1 bar-vote transition-all duration-300"
        :class="{ 'bg-orange-500': candidate.number === 1, 'bg-blue-500': candidate.number === 2 }"
        v-for="candidate in candidates?.sort((a, b) => a.number - b.number)"
        :key="candidate.id"
        :style="{ width: `${((candidate.total_votes || 0) / (totalVotes || 1)) * 100}%` }"
      >
        {{ candidate.total_votes?.toLocaleString() || 0 }}
      </div>
    </div>
    <div v-else class="flex flex-1 rounded-full overflow-hidden">
      <div
        class="text-center text-white font-bold text-xs py-1 bg-orange-500 w-1/2 transition-all duration-300"
      >
        0
      </div>
      <div
        class="text-center text-white font-bold text-xs py-1 bg-blue-500 w-1/2 transition-all duration-300"
      >
        0
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ stationName: string; candidates: CandidateSummaryVoteByStation[] }>()
const totalVotes = computed(() => {
  return props.candidates.reduce((total, candidate) => total + candidate.total_votes, 0)
})
</script>
