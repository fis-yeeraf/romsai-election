<template>
  <div class="container mx-auto">
    <UCard>
      <h1 class="text-2xl font-bold">ลงคะแนนเลือกตั้ง</h1>
      <hr class="my-4 border-gray-200" />
      <Station
        :stations="stations"
        :activeStation="selectedStation"
        @selectStation="selectedStation = $event"
      />
      <hr class="my-4 border-gray-200" />
      <ul v-if="selectedStation" class="grid grid-cols-2 lg:grid-cols-2 gap-5 mb-5">
        <li v-for="(candidate, index) in candidates" :key="index">
          <CandidateCard
            :candidate="candidate"
            :stationName="stations?.find((station) => station.id === selectedStation)?.name"
            :voteCount="summaryVoteByStation.find((vote) => vote.id === candidate.id)?.total_votes"
            @vote="onHandleVote"
          />
        </li>
      </ul>
      <template #footer>
        <div class="flex justify-center">
          <UButton class="cursor-pointer" @click="openModalPercent = true">กรอกคะแนนร้อยละ</UButton>
        </div>
        <UModal v-model:open="openModalPercent" title="กรอกคะแนนร้อยละ" description="">
          <template #body>
            <div>
              <UFormField label="คะแนนร้อยละ" class="mt-4" :error="error">
                <UInput placeholder="กรุณากรอกคะแนน" class="w-full" v-model="percentage" />
              </UFormField>
            </div>
          </template>
          <template #footer>
            <div class="w-full flex justify-between">
              <UButton class="cursor-pointer" @click="openModalPercent = false" color="gray"
                >ยกเลิก</UButton
              >
              <UButton class="cursor-pointer" @click="openModalPercent = false" color="primary"
                >บันทึก</UButton
              >
            </div>
          </template>
        </UModal>
      </template>
    </UCard>
  </div>
</template>
<script setup lang="ts">
import type { RealtimeChannel } from "@supabase/supabase-js"

const toast = useToast()
const openModalPercent = ref(false)
const percentage = ref<number | null>(null)
const error = ref<string | null>(null)

const client = useSupabaseClient()

let realtimeChannel: RealtimeChannel

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

const { data: stations } = await useAsyncData<PollingStation[] | null>(
  "stations",
  async (): Promise<PollingStation[] | null> => {
    const { data } = await client
      .from("polling_stations")
      .select("id, name, address")
      .order("station_code", { ascending: true })
    return data as PollingStation[]
  }
)

const selectedStation = ref<string | null>(null)
const summaryVoteByStation = ref<CandidateSummaryVoteByStation[]>([])

const onLoadSummaryVoteByStation = async () => {
  const { data } = await client
    .from("candidate_vote_summary_by_stations")
    .select("*")
    .eq("station_id", selectedStation.value!)
    .order("number", { ascending: true })
  summaryVoteByStation.value = data as CandidateSummaryVoteByStation[]
}

watch(selectedStation, () => {
  onLoadSummaryVoteByStation()
})

const onHandleVote = async (score: number, candidateId: string) => {
  if (!selectedStation.value) {
    toast.add({
      title: "ตรวจสอบ",
      description: "กรุณาเลือกหน่วยเลือกตั้งก่อน",
      color: "warning",
    })
    return
  }

  try {
    // First, try to update existing record
    const { data: existingVote } = await client
      .from("vote_results")
      .select("*")
      .eq("candidate_id", candidateId)
      .eq("polling_station_id", selectedStation.value)
      .single()

    if (existingVote) {
      // Update existing record
      const { error } = await client
        .from("vote_results")
        .update({ vote_count: score } as never)
        .eq("candidate_id", candidateId)
        .eq("polling_station_id", selectedStation.value)
        .eq("vote_type", "candidate")

      if (error) {
        console.error("Error updating vote:", error)
        toast.add({
          title: "เกิดข้อผิดพลาด",
          description: "เกิดข้อผิดพลาดในการอัพเดตคะแนน",
          color: "error",
        })
      } else {
        toast.add({
          title: "สำเร็จ",
          description: "อัพเดตคะแนนเรียบร้อย",
          color: "success",
        })
      }
    } else {
      // Insert new record
      const { error } = await client.from("vote_results").insert({
        candidate_id: candidateId,
        polling_station_id: selectedStation.value,
        vote_count: score,
        vote_type: "candidate",
      } as never)

      if (error) {
        console.error("Error inserting vote:", error)
        toast.add({
          title: "เกิดข้อผิดพลาด",
          description: "เกิดข้อผิดพลาดในการบันทึกคะแนน",
          color: "error",
        })
      } else {
        toast.add({
          title: "สำเร็จ",
          description: "บันทึกคะแนนเรียบร้อย",
          color: "success",
        })
      }
    }
  } catch (error) {
    console.error("Error in vote operation:", error)
    toast.add({
      title: "เกิดข้อผิดพลาด",
      description: "เกิดข้อผิดพลาดในการดำเนินการ",
      color: "error",
    })
  }
}

onMounted(() => {
  // Real time listener for new workouts
  realtimeChannel = client
    .channel("public:vote_results")
    .on("postgres_changes", { event: "*", schema: "public", table: "vote_results" }, () =>
      onLoadSummaryVoteByStation()
    )

  realtimeChannel.subscribe()
})

onUnmounted(() => {
  realtimeChannel.unsubscribe()
})
</script>
