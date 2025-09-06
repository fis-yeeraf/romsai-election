<template>
  <div class="red w-full h-[100vh] absolute top-0 right-0"></div>
  <div class="blue w-full h-[100vh] absolute top-0 left-0"></div>
  <div class="flex flex-col justify-center items-center relative pt-20 lg:py-4 py-3">
    <div class="flex justify-center items-center gap-x-5">
      <img src="/images/ggt.png" alt="logo" class="w-20 h-20" />
      <h1 class="lg:text-[46px] text-[36px] font-bold text-white underline">
        รายงานผลการนับคะแนนเลือกตั้ง
      </h1>
      <img src="/images/logo.png" alt="logo" class="w-20 h-20" />
    </div>
    <h2 class="lg:text-[36px] text-[28px] font-bold text-white lg:leading-[1]">
      นายกองค์การบริหารส่วนตำบลร่มไทร
    </h2>
    <p class="lg:text-2xl text-[20px] font-bold text-white my-2">(อย่างไม่เป็นทางการ)</p>
    <p class="lg:text-3xl text-[28px] font-bold text-white">วันอาทิตย์ ที่ 7 กันยายน 2568</p>
    <p class="lg:text-xl font-bold text-white">{{ currentTime }}</p>
  </div>

  <div class="relative mb-22">
    <div
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-white"
    >
      <h2 class="text-[50px] font-bold leading-[1]">{{ percentage?.finished }}</h2>
      <p class="text-[20px]">นับแล้วร้อยละ</p>
    </div>
    <div class="container mx-auto">
      <div class="grid grid-cols-2">
        <div v-for="candidate in candidates" :key="candidate.id" class="flex justify-center">
          <img
            :src="`images/${candidate.number}.png`"
            :alt="candidate.first_name"
            class="max-h-[25vh]"
          />
        </div>
      </div>
    </div>
    <div class="absolute -bottom-16 left-0 w-full">
      <div class="red-detail w-[50%] h-[100%] absolute left-0"></div>
      <div class="blue-detail w-[50%] h-[100%] absolute right-0"></div>
      <div class="container mx-auto relative">
        <div class="grid grid-cols-2">
          <div
            v-for="(candidate, index) in candidateSummaryVote"
            :key="candidate.id"
            class="text-white py-3 px-4"
          >
            <div class="grid grid-cols-3 gap-x-5 items-center" :dir="index === 1 ? 'rtl' : 'ltr'">
              <h2 class="text-3xl font-bold">
                <p v-for="name in candidate.candidate_name.split(' ')" :key="name">{{ name }}</p>
              </h2>
              <h2 class="text-[50px] font-bold text-center leading-[1]">
                {{ candidate.total_votes?.toLocaleString() || 0 }}
                <p class="text-[20px]">คะแนน</p>
              </h2>
              <div class="flex flex-col justify-center items-end">
                <h2 class="font-bold" style="font-size: 50px; line-height: 1">
                  {{ candidate.number }}
                </h2>
                <p>หมายเลข</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    class="flex flex-col gap-4 relative w-[80%] mx-auto bg-black/20 backdrop-blur-sm border border-white/50 rounded-lg shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] p-4 text-white before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none"
  >
    <div v-for="stationVote in summaryVoteByStations" :key="stationVote.station_id">
      <BarVote :stationName="stationVote.station_name" :candidates="stationVote.candidates" />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { RealtimeChannel } from "@supabase/supabase-js"

const client = useSupabaseClient()

let realtimeVoteChannel: RealtimeChannel
let realtimePercentageChannel: RealtimeChannel

const { data: summaryVoteByStations, refresh: refreshSummaryVoteByStations } = await useAsyncData<
  SummaryVoteByStation[] | null
>("summaryVoteByStations", async (): Promise<SummaryVoteByStation[] | null> => {
  const { data } = await client.from("vote_summary_by_stations").select("*")
  return data as SummaryVoteByStation[]
})

onMounted(() => {
  // Real time listener for new workouts
  realtimeVoteChannel = client
    .channel("public:vote_results")
    .on("postgres_changes", { event: "*", schema: "public", table: "vote_results" }, () => {
      refreshSummaryVoteByStations()
      refreshCandidateSummaryVote()
    })

  realtimeVoteChannel.subscribe()

  // Real time listener for new workouts
  realtimePercentageChannel = client
    .channel("public:percentage")
    .on("postgres_changes", { event: "*", schema: "public", table: "percentage" }, () => {
      refreshPercentage()
    })

  realtimePercentageChannel.subscribe()

  updateTime()
  setInterval(updateTime, 1000)
})

const { data: candidates } = await useAsyncData<Candidate[] | null>(
  "candidate",
  async (): Promise<Candidate[] | null> => {
    const { data } = await client
      .from("candidates")
      .select("*")
      .order("number", { ascending: true })
    return data as Candidate[]
  }
)

const { data: candidateSummaryVote, refresh: refreshCandidateSummaryVote } = await useAsyncData<
  CandidateSummaryVoteByStation[] | null
>("candidateSummaryVote", async (): Promise<CandidateSummaryVoteByStation[] | null> => {
  const { data } = await client.from("candidate_vote_summary").select("*")
  return data as CandidateSummaryVoteByStation[]
})

const { data: percentage, refresh: refreshPercentage } = await useAsyncData<{
  finished: number | string | null
}>("percentage", async (): Promise<{ finished: number | string | null }> => {
  const { data } = await client.from("percentage").select("*").single()

  return data as unknown as { finished: number | string | null }
})

const currentTime = ref("")
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString("th-TH", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

onUnmounted(() => {
  realtimeVoteChannel.unsubscribe()
  realtimePercentageChannel.unsubscribe()
})
</script>
<style scoped>
.blue {
  background: #020024;
  background: linear-gradient(-90deg, rgb(7 0 118) 0%, rgb(0 71 171) 35%, rgb(0, 106, 255) 100%);
  clip-path: polygon(60% 0, 100% 0%, 100% 100%, 40% 100%);
}
.red {
  clip-path: polygon(0 0, 60% 0, 40% 100%, 0% 100%);
  background: #061161;
  background: linear-gradient(-90deg, rgb(255, 123, 0) 0%, rgba(120, 2, 2, 1) 100%);
}
.red-detail {
  background: #061161;
  background: linear-gradient(90deg, rgb(255, 123, 0) 0%, rgba(120, 2, 2, 1) 100%);
}
.blue-detail {
  background: #020024;
  background: linear-gradient(
    90deg,
    rgba(2, 0, 36, 1) 0%,
    rgba(9, 9, 121, 1) 35%,
    rgb(0, 106, 255) 100%
  );
}
</style>
