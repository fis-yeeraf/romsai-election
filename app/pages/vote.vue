<template>
  <div
    class="relative min-h-screen flex flex-col justify-between 2xl:justify-around 2xl:py-10 items-center bg-gray-300"
  >
    <div class="w-5xl mx-auto py-5">
      <section class="mx-5 grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <h1 class="text-6xl font-bold text-gray-900/50 mb-3">คะแนนผู้สมัคร</h1>
          <h3 class="text-2xl font-bold text-gray-600">ณ เวลา 18.00 น. 11 ม.ค. 69</h3>
        </div>
        <!-- <div class="flex justify-center items-center">
          <div
            class="w-[100px] h-[100px] rotate-45 flex items-center justify-center transition-all duration-1000"
            :class="`bg-${bgColors[villageNumber - 1]}`"
          >
            <h2 class="text-white text-5xl font-bold -rotate-45 origin-center font-mono">
              {{ villageNumber }}
            </h2>
          </div>
        </div> -->
        <div class="flex flex-col justify-between items-center gap-2">
          <h3 class="text-xl font-bold text-gray-900/50 text-center">เขตที่</h3>
          <h2 class="text-6xl font-bold text-gray-600 font-mono">{{ villageNumber }}</h2>
        </div>
        <div class="flex flex-col justify-between items-center gap-2">
          <h3 class="text-xl font-bold text-gray-900/50 text-center leading-5">
            นับคะแนนแล้ว <br />
            <span class="text-sm font-bold">(อย่างไม่เป็นทางการ)</span>
          </h3>
          <h2 class="text-6xl font-bold text-gray-600 font-mono">70%</h2>
        </div>
      </section>
    </div>
    <div class="w-7xl mx-auto">
      <section class="mx-5">
        <div class="flex justify-center items-center mb-30">
          <CandidateComponent
            v-for="(candidate, key) in candidates?.filter(
              (c) => c.village_number === villageNumber
            )"
            :key="candidate.id.toString()"
            :candidate="candidate"
            :color="shuffledColors[villageNumber - 1]?.[candidate.number - 1]"
            :voteByStations="
              candidateVoteByStations?.filter(
                (station) => station.candidate_number === candidate.number
              ) ?? []
            "
            :totalVotes="voteSummary?.find((c) => c.number === candidate.number)?.total_votes ?? 0"
            :class="{ 'w-1/3': true, 'animate-fade-in-down': true, 'candidate-card': true }"
            :style="{ animationDelay: key * 0.2 + 's' }"
          />
        </div>
      </section>
    </div>
    <div class="flex mb-5">
      <UButton
        v-for="(village_number, index) in 5"
        :key="index"
        :label="`Village ${village_number}`"
        type="submit"
        rounded
        size="md"
        :color="villageNumber === village_number ? 'primary' : 'neutral'"
        class="mx-2 my-2 cursor-pointer"
        @click="onHandleChangeVillage(village_number)"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue"
import CandidateComponent from "~/components/Candidate.vue"
import type { Candidate, CandidateVoteSummary, CandidateVoteSummaryByStation } from "~/shared/types"

const client = useSupabaseClient()
const villageNumber = ref(1)
let changeVillageInterval: ReturnType<typeof setInterval> | null = null
const bgColors = ["red", "orange", "yellow", "green", "blue"]

const { data: candidateVoteByStations, refresh: refreshCandidateVoteByStations } =
  await useAsyncData<CandidateVoteSummaryByStation[] | null>(
    "candidateVoteByStations",
    async (): Promise<CandidateVoteSummaryByStation[] | null> => {
      if (!villageNumber.value || villageNumber.value != 2) {
        return []
      }
      const { data } = await client
        .from("council_results_by_stations")
        .select("*")
        .eq("village_number", villageNumber.value)
        .order("candidate_number", { ascending: true })
      return data as CandidateVoteSummaryByStation[]
    }
  )

const { data: candidates } = await useAsyncData<Candidate[] | null>(
  "candidates",
  async (): Promise<Candidate[] | null> => {
    const { data } = await client
      .from("candidates")
      .select("*, villages(village_number)")
      .not("village_id", "is", null)
      .order("number", { ascending: true })
    return (data as any[])?.map((item: any) => ({
      ...item,
      village_number: item.villages?.village_number ?? villageNumber.value,
      avatar: `/images/${item.villages?.village_number}-${item.number}.png`,
    })) as Candidate[]
  }
)

const { data: voteSummary, refresh: refreshVoteSummary } = await useAsyncData<
  CandidateVoteSummary[] | null
>("CandidateVoteSummary", async (): Promise<CandidateVoteSummary[] | null> => {
  const { data } = await client
    .from("council_results")
    .select("*")
    .eq("village_number", villageNumber.value)
    .order("number", { ascending: true })
  const response = (data as CandidateVoteSummary[] | null) ?? []
  return response.map((item) => ({
    ...item,
    avatar: `/images/${item.village_number}-${item.number}.png`,
  })) as CandidateVoteSummary[]
})

const getShuffledColors = () => {
  const colors = ["error", "success", "info"]
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = colors[i]!
    colors[i] = colors[j]!
    colors[j] = temp
  }

  return colors
}

const onHandleChangeVillage = (village_number: number) => {
  const cards = document.querySelectorAll(".candidate-card")
  if (cards) {
    cards.forEach((card) => {
      card.classList.remove("animate-fade-in-down")
      card.classList.add("animate-fade-out-down")
    })
  }

  setTimeout(() => {
    villageNumber.value = village_number
    refreshCandidateVoteByStations()
    refreshVoteSummary()
  }, 1000)
}

const shuffledColors = Array(5)
  .fill(null)
  .map(() => getShuffledColors())

// onMounted(() => {
//   changeVillageInterval = setInterval(() => {
//     if (villageNumber.value >= 5) {
//       onHandleChangeVillage(1)
//     } else {
//       onHandleChangeVillage(villageNumber.value + 1)
//     }
//   }, 10000) // Change every 10 seconds
// })

// onUnmounted(() => {
//   if (changeVillageInterval) {
//     clearInterval(changeVillageInterval)
//   }
// })
</script>
<style scoped>
@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-out-down {
  from {
    opacity: 1;
    transform: translateY(0px);
  }
  to {
    opacity: 0;
    transform: translateY(50px);
  }
}

.animate-fade-in-down {
  animation: fade-in-down 1s ease-out;
  animation-fill-mode: both;
}
.animate-fade-out-down {
  animation: fade-out-down 1s ease-out;
  animation-fill-mode: both;
}

.bg-red {
  background: #e52d27;
}

.bg-blue {
  background: #00467f;
}
.bg-green {
  background: #1cd8d2;
}
.bg-orange {
  background: #ff512f;
}
.bg-yellow {
  background: #e65c00;
}
</style>
