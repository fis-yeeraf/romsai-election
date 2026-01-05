<template>
  <audio ref="audio" controls>
    <source :type="sounds?.[currentTrack]?.metadata.mimetype" />
  </audio>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
defineOptions({
  name: "BackgroudSound",
})

import { ref } from "vue"

const audio = ref<HTMLAudioElement | null>(null)
const { data: sounds } = await client.storage.from("sounds").list()
const soundUrl = ref<string>("")
const currentTrack = ref<number>(0)

const playNextTrack = async () => {
  currentTrack.value = (currentTrack.value + 1) % sounds?.length!
  soundUrl.value = await getSoundUrl()
  playSound()
}

const getSoundUrl = async (): Promise<string> => {
  if (currentTrack.value >= sounds?.length!) {
    currentTrack.value = 0
  }
  const { data: sound } = await client.storage
    .from("sounds")
    .createSignedUrl(sounds?.[currentTrack.value]?.name!, 60)
  return sound?.signedUrl ?? ""
}

const playSound = () => {
  if (audio.value && audio.value.paused) {
    audio.value.src = soundUrl.value
    audio.value.play().catch((error) => {
      console.error("Error playing audio:", error)
    })
    audio.value.volume = 0.2
    audio.value.addEventListener("ended", playNextTrack)
  }
}

onMounted(async () => {
  document.body.addEventListener("click", playSound)
  soundUrl.value = await getSoundUrl()
})

onUnmounted(() => {
  if (audio.value) {
    audio.value.pause()
  }
})
</script>
