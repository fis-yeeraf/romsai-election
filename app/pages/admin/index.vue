<template>
  <div class="container mx-auto">
    <UCard class="pb-5">
      <h1 class="text-2xl font-bold-3">ลงคะแนนเลือกตั้ง</h1>
      <hr class="my-4 border-gray-200" />
      <Station
        :stations="stations"
        :activeStation="selectedStation"
        @selectStation="onHandleSelectStation"
      />
      <hr v-if="selectedStation" class="my-4 border-gray-200" />
      <ul v-if="selectedStation" class="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <li
          v-for="(candidate, index) in candidates?.filter(
            (c) => c.village_number === villageNumber
          )"
          :key="index"
        >
          <CandidateCard
            :villageNumber="villageNumber"
            :candidate="candidate"
            :stationName="stations?.find((station) => station.id === selectedStation)?.name"
            :voteCount="
              summaryVoteByStation?.find(
                (vote) =>
                  vote.candidate_number === candidate.number && vote.station_id === selectedStation
              )?.total_votes
            "
            @vote="onRecordVote"
          />
        </li>
        <li v-for="(_, index) in 2" :key="index">
          <CandidateCard
            :ballotType="index + 1 === 1 ? 'invalid' : 'no_vote'"
            :villageNumber="villageNumber"
            :stationName="stations?.find((station) => station.id === selectedStation)?.name"
            :voteCount="
              index + 1 === 1 ? ballotByStation?.invalid_votes ?? 0 : ballotByStation?.no_votes ?? 0
            "
            @vote="onRecordVote"
          />
        </li>
      </ul>
      <!-- <template #footer> -->
      <!-- <div class="flex justify-center">
          <UButton class="cursor-pointer" @click="openModalPercent = true">กรอกคะแนนร้อยละ</UButton>
        </div>
        <UModal v-model:open="openModalPercent" title="กรอกคะแนนร้อยละ" description="">
          <template #body>
            <div>
              <UFormField label="คะแนนร้อยละ" class="mt-4" :error="errors">
                <UInput placeholder="กรุณากรอกคะแนน" class="w-full" v-model="percentage" />
              </UFormField>
            </div>
          </template>
          <template #footer>
            <div class="w-full flex justify-between">
              <UButton class="cursor-pointer" @click="openModalPercent = false" color="secondary"
                >ยกเลิก</UButton
              >
              <UButton class="cursor-pointer" @click="onUpdatePercentage" color="primary"
                >บันทึก</UButton
              >
            </div>
          </template>
        </UModal> -->
      <!-- </template> -->
    </UCard>
  </div>
</template>
<script setup lang="ts">
import type { RealtimeChannel } from "@supabase/supabase-js"
import type { BallotByStation, RecordVote } from "~~/shared/types"

const toast = useToast()
const openModalPercent = ref(false)
const percentage = ref<number | null>(null)
const errors = ref<string | boolean | undefined>(undefined)
const villageNumber = ref(1)

const client = useSupabaseClient()

let realtimeChannel: RealtimeChannel

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

const { data: stations } = await useAsyncData<PollingStation[] | null>(
  "stations",
  async (): Promise<PollingStation[] | null> => {
    const { data } = await client
      .from("polling_stations")
      .select("id, name, address, villages(village_number)")
      .order("station_code", { ascending: true })
    return (data as any[])?.map((item: any) => ({
      ...item,
      village_number: item.villages?.village_number ?? villageNumber.value,
    })) as PollingStation[]
  }
)

const selectedStation = ref<string | null>(null)
const summaryVoteByStation = ref<CandidateVoteSummaryByStation[]>([])
const ballotByStation = ref<BallotByStation | null>(null)

const onLoadSummaryVoteByStation = async () => {
  const { data } = await client
    .from("council_results_by_stations")
    .select("*")
    .eq("station_id", selectedStation.value!)
    .order("candidate_number", { ascending: true })
  summaryVoteByStation.value = data as CandidateVoteSummaryByStation[]
}

const onLoadBallotByStation = async () => {
  const { data } = await client
    .from("ballot_by_stations")
    .select("*")
    .eq("station_id", selectedStation.value!)
    .eq("candidate_type_code", "council")
    .single()
  ballotByStation.value = data as BallotByStation | null
}

const onHandleSelectStation = (stationId: string, village: number) => {
  selectedStation.value = stationId
  villageNumber.value = village
}

watch(selectedStation, (value) => {
  if (value !== null) {
    onLoadSummaryVoteByStation()
    onLoadBallotByStation()
  }
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

const onRecordVote = async ({
  stationName,
  villageNumber,
  candidateNumber,
  candidateType,
  ballotType,
  score,
}: RecordVote) => {
  const { error } = await client.rpc("record_vote", {
    station: stationName,
    p_village_number: villageNumber,
    candidate_number: candidateNumber,
    candidate_type: candidateType,
    ballot_type: ballotType,
    p_change_amount: score,
  } as never)
  if (error) {
    console.error("Error updating vote:", error)
    toast.add({
      title: "เกิดข้อผิดพลาด",
      description: "เกิดข้อผิดพลาดในการอัพเดตคะแนน",
      color: "error",
      duration: 1000,
    })
  } else {
    toast.add({
      title: "สำเร็จ",
      description: "อัพเดตคะแนนเรียบร้อย",
      color: "success",
      duration: 1000,
    })
  }
}

const onUpdatePercentage = async () => {
  if (percentage.value === null) {
    errors.value = "กรุณากรอกคะแนน"
    return
  }
  const { error } = await client
    .from("percentage")
    .update({ finished: percentage.value } as never)
    .eq("id", 1)
  if (error) {
    console.error("Error updating percentage:", error)
    toast.add({
      title: "เกิดข้อผิดพลาด",
      description: "เกิดข้อผิดพลาดในการอัพเดตคะแนนร้อยละ",
      color: "error",
    })
  } else {
    toast.add({
      title: "สำเร็จ",
      description: "อัพเดตคะแนนร้อยละเรียบร้อย",
      color: "success",
    })
  }
  openModalPercent.value = false
  percentage.value = null
}

onMounted(() => {
  // Real time listener for new workouts
  realtimeChannel = client
    .channel("custom-all-channel")
    .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, () => {
      onLoadSummaryVoteByStation()
      onLoadBallotByStation()
    })
    .subscribe()
})

onUnmounted(() => {
  if (realtimeChannel) {
    client.removeChannel(realtimeChannel)
  }
})
</script>
