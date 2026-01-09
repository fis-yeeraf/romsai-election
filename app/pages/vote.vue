<template>
  <div
    class="absolute left-0 right-0 top-0 bottom-0 opacity-40 -scale-y-100"
    :style="{
      background: 'url(/images/bg.png) center center/cover no-repeat',
    }"
  ></div>
  <div
    class="relative min-h-screen flex flex-col justify-between 2xl:justify-around items-center py-5"
  >
    <div class="w-full max-w-7xl mx-auto py-5">
      <section class="mx-5 flex justify-between items-center gap-5">
        <div class="flex flex-col justify-between items-center gap-2">
          <div class="flex gap-5">
            <img src="/images/ggt.png" alt="ggt Logo" class="h-25 object-contain" />
            <img src="/images/logo.png" alt="Logo" class="h-25 object-contain" />
          </div>
          <h1
            class="text-primary text-center text-xl font-bold text-shadow-sm text-shadow-gray-300/50 leading-5"
          >
            การเลือกตั้งสมาชิกสภา <br />
            องค์การบริหารส่วนตำบลร่มไทร
          </h1>
        </div>
        <div class="flex gap-3">
          <div class="flex flex-col justify-between">
            <h1 class="text-6xl font-bold text-primary text-shadow-sm text-shadow-gray-500/50">
              คะแนนผู้สมัคร
            </h1>
            <h3 class="text-2xl font-bold text-gray-600">ณ {{ currentDateTime }}</h3>
          </div>
          <div class="flex flex-col text-white">
            <div
              class="z-10 text-2xl font-bold px-8 pt-2 border-b rounded-t-lg transition-all duration-1000"
              :class="`bg-${bgColors[villageNumber - 1]}`"
            >
              เขตที่
            </div>
            <div
              style="clip-path: polygon(0% 0%, 100% 0, 100% 75%, 50% 100%, 0 75%)"
              :class="`bg-${bgColors[villageNumber - 1]}`"
              class="text-center text-6xl font-bold font-mono pb-6 pt-2 transition-all duration-1000"
            >
              <div :key="villageNumber" class="transition-all duration-1000 animate-fade-in-down">
                {{ villageNumber }}
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col justify-between items-center">
          <h3 class="text-xl font-bold text-gray-900/70 text-center leading-5">
            นับคะแนนแล้ว <br />
            <span class="text-sm font-bold">(อย่างไม่เป็นทางการ)</span>
          </h3>
          <h2 class="text-6xl font-bold text-gray-900 font-mono">
            {{
              countingProgressByVillages?.find((v) => v.village_number === villageNumber)
                ?.counting_percentage ?? 0
            }}%
          </h2>
          <h3 class="text-sm font-bold text-gray-900/70 text-center leading-5">
            จำนวนผู้มาใช้สิทธิ์ทั้งหมด
            {{
              countingProgressByVillages
                ?.find((v) => v.village_number === villageNumber)
                ?.total_eligible_voters?.toLocaleString() ?? 0
            }}
            คน
          </h3>
        </div>
      </section>
    </div>
    <div class="w-full max-w-7xl mx-auto mb-40">
      <section class="mx-5">
        <div class="flex justify-center items-center gap-5">
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
            :totalVotes="
              voteSummary
                ?.filter((c) => c.village_number === villageNumber)
                ?.find((c) => c.number === candidate.number)?.total_votes ?? 0
            "
            :class="{ 'w-1/3': true, 'animate-fade-in-down': true, 'candidate-card': true }"
            :style="{ animationDelay: key * 0.2 + 's' }"
          />
        </div>
      </section>
    </div>
    <div class="w-full max-w-7xl mx-auto px-5">
      <!-- <UButton
        v-for="(village_number, index) in 5"
        :key="index"
        :label="`Village ${village_number}`"
        type="submit"
        rounded
        size="md"
        :color="villageNumber === village_number ? 'primary' : 'neutral'"
        class="mx-2 my-2 cursor-pointer"
        @click="onHandleChangeVillage(village_number)"
      /> -->
      <div
        v-for="(ballotByVillage, key) in ballotByVillages?.filter(
          (v) => v.village_number === villageNumber
        )"
        :key="key"
        class="flex"
      >
        <div v-for="(_, index) in 3" :key="index" class="flex-1 flex flex-col">
          <h2 class="text-xl font-semibold pl-6">
            {{ index === 0 ? "บัตรดี" : index === 1 ? "บัตรเสีย" : "งดออกเสียง" }}
          </h2>
          <div
            class="py-2 text-lg font-bold text-center -skew-x-30 origin-center"
            :class="`bg-${
              index === 0
                ? 'primary text-white'
                : index === 1
                ? 'error text-white'
                : 'gray-300 text-gray-900'
            }`"
          >
            <h2 class="skew-x-30 origin-center">
              {{
                index === 0
                  ? ballotByVillage?.valid_votes ?? 0
                  : index === 1
                  ? ballotByVillage?.invalid_votes ?? 0
                  : ballotByVillage?.no_votes ?? 0
              }}
              ใบ
            </h2>
          </div>
        </div>
      </div>
    </div>
  </div>

  <BackgroudSound />
</template>
<script setup lang="ts">
import { ref } from "vue"
import CandidateComponent from "~/components/Candidate.vue"
import BackgroudSound from "~/components/BackgroudSound.vue"
import type {
  Candidate,
  CandidateVoteSummary,
  CandidateVoteSummaryByStation,
  BallotByVillage,
  CountingProgressByVillage,
} from "~/shared/types"
import { formatThaiDate } from "~~/shared/utils"
import type { RealtimeChannel } from "@supabase/supabase-js"

const client = useSupabaseClient()
const villageNumber = ref(2)
let changeVillageInterval: ReturnType<typeof setInterval> | null = null
const bgColors = ["primary", "warning", "[#464644]", "error", "info"]
const currentDateTime = ref<string | null>(null)
let changeCurrentDateTimeInterval: ReturnType<typeof setInterval> | null = null

let realtimeVoteResultChannel: RealtimeChannel

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
    .order("number", { ascending: true })
  const response = (data as CandidateVoteSummary[] | null) ?? []
  return response.map((item) => ({
    ...item,
    avatar: `/images/${item.village_number}-${item.number}.png`,
  })) as CandidateVoteSummary[]
})

const { data: ballotByVillages, refresh: refreshBallotByVillages } = await useAsyncData<
  BallotByVillage[] | []
>("BallotByVillage", async (): Promise<BallotByVillage[] | []> => {
  const { data } = await client
    .from("ballot_by_village")
    .select("*")
    // .eq("village_number", villageNumber.value)
    .eq("candidate_type_code", "council")
  return data as BallotByVillage[] | []
})

const { data: countingProgressByVillages, refresh: refreshCountingProgressByVillage } =
  await useAsyncData<CountingProgressByVillage[] | []>(
    "CountingProgressByVillage",
    async (): Promise<CountingProgressByVillage[] | []> => {
      const { data } = await client.from("counting_progress_by_villages").select("*")
      // .eq("village_number", villageNumber.value)
      // .single()
      return data as CountingProgressByVillage[] | []
    }
  )

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
    // refreshVoteSummary()
    // refreshBallotByVillages()
    // refreshCountingProgressByVillage()
  }, 1000)
}

const shuffledColors = new Array(5).fill(null).map(() => getShuffledColors())

onMounted(() => {
  // changeVillageInterval = setInterval(() => {
  //   if (villageNumber.value >= 5) {
  //     onHandleChangeVillage(1)
  //   } else {
  //     onHandleChangeVillage(villageNumber.value + 1)
  //   }
  // }, 10000) // Change every 10 seconds

  changeCurrentDateTimeInterval = setInterval(() => {
    currentDateTime.value = formatThaiDate(new Date())
  }, 1000)

  realtimeVoteResultChannel = client
    .channel("custom-all-channel")
    .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, () => {
      if (villageNumber.value === 2) {
        refreshCandidateVoteByStations()
      }
      refreshVoteSummary()
      refreshBallotByVillages()
      refreshCountingProgressByVillage()
    })
    .subscribe()
})

onUnmounted(() => {
  if (changeVillageInterval) {
    clearInterval(changeVillageInterval)
  }

  if (changeCurrentDateTimeInterval) {
    clearInterval(changeCurrentDateTimeInterval)
  }

  // Clean up realtime subscription if needed
  // Note: Supabase handles this automatically in most cases
  if (realtimeVoteResultChannel) {
    client.removeChannel(realtimeVoteResultChannel)
  }
})
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
