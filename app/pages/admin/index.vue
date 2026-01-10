<template>
  <div class="container mx-auto">
    <UCard class="pb-20">
      <h1 class="text-2xl font-bold-3">ลงคะแนนเลือกตั้ง</h1>
      <hr class="my-4 border-gray-200" />
      <Station
        :stations="stations"
        :activeStation="selectedStation"
        :ballotByStation="countingProgressByStation"
        @selectStation="onHandleSelectStation"
        @updateEligibleVoters="onUpdateEligibleVoters"
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
            :disablePlus="votes.length === 2"
            :resetScore="resetScore"
            @vote="onRecordVotes"
            @votes="onVotes"
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
            @vote="onRecordVotes"
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
  <div
    v-if="villageNumber === 2"
    class="fixed flex justify-center gap-3 bottom-0 right-0 left-0 py-5 px-2 bg-gray-900 border-t border-gray-200 shadow-lg"
  >
    <UButton
      icon="i-lucide-minus"
      size="xl"
      color="error"
      variant="solid"
      @click="onUpdateVoters(-1)"
    />
    <UButton
      :disabled="votes.length === 0"
      icon="i-lucide-check"
      size="xl"
      color="info"
      class="flex-1 flex justify-center items-center"
      @click="onHandleConfirm"
      >ยืนยันคะแนน ({{ summaryVoteByStation[0]?.total_voters || 0 }})</UButton
    >
    <UButton
      icon="i-lucide-plus"
      size="xl"
      color="primary"
      variant="solid"
      @click="onUpdateVoters(1)"
    />
  </div>
</template>
<script setup lang="ts">
import type { RealtimeChannel } from "@supabase/supabase-js"
import type {
  BallotByStation,
  CountingProgressByStation,
  RecordVote,
  RecordVotes,
} from "~~/shared/types"

const toast = useToast()
const openModalPercent = ref(false)
const percentage = ref<number | null>(null)
const errors = ref<string | boolean | undefined>(undefined)
const villageNumber = ref(1)

const selectedStation = ref<string | null>(null)
const summaryVoteByStation = ref<CandidateVoteSummaryByStation[]>([])
const ballotByStation = ref<BallotByStation | null>(null)
const countingProgressByStation = ref<CountingProgressByStation | null>(null)
const votes = ref<number[]>([])
const resetScore = ref<Date | null>(new Date())

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

const onLoadCountingProgressByStation = async () => {
  const { data } = await client
    .from("counting_progress_by_stations")
    .select("*")
    .eq("station_id", selectedStation.value!)
    .eq("candidate_type_code", "council")
    .single()
  countingProgressByStation.value = data as CountingProgressByStation | null
}

const onHandleSelectStation = (stationId: string, village: number) => {
  selectedStation.value = stationId
  villageNumber.value = village
}

watch(selectedStation, (value) => {
  if (value !== null) {
    onLoadSummaryVoteByStation()
    onLoadBallotByStation()
    onLoadCountingProgressByStation()
    votes.value = []
  }
})

const onUpdateEligibleVoters = async (voters: number) => {
  try {
    const { error } = await client
      .from("polling_stations")
      .update({ total_eligible_voters: Math.max(voters, 0) } as never)
      .eq("id", selectedStation.value!)

    if (error) {
      console.error("Error updating vote:", error)
      toast.add({
        title: "เกิดข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการอัพเดตผู้มาใช้สิทธิ์",
        color: "error",
      })
    } else {
      toast.add({
        title: "สำเร็จ",
        description: "อัพเดตผู้มาใช้สิทธิ์เรียบร้อย",
        color: "success",
      })
    }
  } catch {
    toast.add({
      title: "เกิดข้อผิดพลาด",
      description: "เกิดข้อผิดพลาดในการอัพเดตผู้มาใช้สิทธิ์",
      color: "error",
    })
  } finally {
    onLoadCountingProgressByStation()
  }
}

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

const onVotes = async (candidateNumber: number, type: "plus" | "minus") => {
  if (type === "plus") {
    if (!votes.value.includes(candidateNumber)) {
      votes.value.push(candidateNumber)
    }
  } else if (votes.value.includes(candidateNumber)) {
    votes.value = votes.value.filter((item) => item !== candidateNumber)
  }
}

const onHandleConfirm = () => {
  if (votes.value.length) {
    onRecordVotes({
      stationName:
        stations.value?.find((station) => station.id === selectedStation.value)?.name || "",
      villageNumber: villageNumber.value,
      candidate1Number: votes.value[0] || null,
      candidate2Number: votes.value[1] || null,
      candidateType: "council",
      ballotType: "valid",
      score: 1,
    } as RecordVotes)
  }
}

const onRecordVotes = async ({
  stationName,
  villageNumber,
  candidate1Number,
  candidate2Number,
  candidateType,
  ballotType,
  score,
}: RecordVotes) => {
  const { error } = await client.rpc("record_vote_new", {
    station: stationName,
    p_village_number: villageNumber,
    candidate_1_number: candidate1Number,
    candidate_2_number: candidate2Number,
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
  votes.value = []
  resetScore.value = new Date()
}

const onUpdateVoters = async (value: number) => {
  const { data }: { data: { voter_count: number }[] | null } = await client
    .from("votes")
    .select("voter_count")
    .eq("polling_station_id", selectedStation.value!)

  const currentVoters = data?.[0]?.voter_count || 0
  if (currentVoters + value < 0) return

  const { error } = await client
    .from("votes")
    .update({ voter_count: currentVoters + value } as never)
    .eq("polling_station_id", selectedStation.value!)

  if (error) {
    console.error("Error updating voters:", error)
    toast.add({
      title: "เกิดข้อผิดพลาด",
      description: "เกิดข้อผิดพลาดในการอัพเดตจำนวนบัตร",
      color: "error",
      duration: 1000,
    })
  } else {
    toast.add({
      title: "สำเร็จ",
      description: "อัพเดตจำนวนบัตรเรียบร้อย",
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
      onLoadCountingProgressByStation()
    })
    .subscribe()
})

onUnmounted(() => {
  if (realtimeChannel) {
    client.removeChannel(realtimeChannel)
  }
})
</script>
