<template>
  <div class="relative min-h-screen">
    <header class="h-[150px]">
      <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-full">
        <img src="/images/ggt.png" alt="Election System Logo" class="h-[100px] object-contain" />
        <div class="text-white flex flex-col items-center gap-1">
          <h2 class="text-center text-4xl font-bold text-shadow-lg text-shadow-gray-500/50">
            การเลือกตั้งสมาชิกสภาองค์การบริหารส่วนตำบลร่มไทร
          </h2>
          <h2 class="text-center text-2xl font-semibold text-shadow-lg text-shadow-gray-500/50">
            วันอาทิตย์ 11 มกราคม 2569
          </h2>
        </div>
        <img src="/images/logo.png" alt="Election System Logo" class="h-[100px] object-contain" />
      </div>
    </header>

    <main class="flex xl:gap-1">
      <div
        v-for="(candidate, index) in candidates"
        :key="index"
        class="bg-gray-100 h-[65vh] overflow-hidden candidate-image"
        :class="`xl:w-[${100 / candidates.length}vw] w-[${100 / (candidates.length / 2)}vw]`"
      >
        <div
          class="h-full animate-fade-in-down"
          :style="{
            backgroundImage: 'url(/images/' + candidate + '.png)',
            backgroundSize: 'auto 85%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            animationDelay: index * 0.1 + 's',
          }"
        ></div>
      </div>
    </main>

    <div class="footer-alfa h-[25vh] absolute bottom-[32vh] left-0 right-0"></div>

    <footer class="h-[32vh] absolute bottom-0 left-0 right-0">
      <div
        class="flex justify-center left-0 right-0 items-center gap-4 z-10 absolute bottom-[200px] 2xl:bottom-[250px] animate-fade-in-down"
        style="animation-delay: 1s"
      >
        <h2 class="text-white font-bold text-shadow-lg text-shadow-gray-500/50 text-4xl">
          เหลืออีก
        </h2>
        <NumberFlip :number="countdownDays" />
        <h2 class="text-white font-bold text-shadow-lg text-shadow-gray-500/50 text-4xl pr-20">
          วัน
        </h2>
        <!-- <div
          class="flex flex-col justify-between items-center text-white font-bold text-shadow-lg text-shadow-gray-500/50"
        >
          <span class="text-4xl my-3">เหลืออีก</span>
          <span class="text-8xl">วัน</span>
        </div> -->
      </div>
      <div
        class="absolute bottom-[80px] 2xl:bottom-[100px] left-0 right-0 flex flex-col items-center justify-center"
      >
        <h2
          class="text-white text-center font-bold text-5xl 2xl:text-7xl text-shadow-lg text-shadow-gray-500/50 heading-text relative"
        >
          เกาะติด
        </h2>
        <h3
          class="text-white text-center font-bold text-4xl text-shadow-lg text-shadow-gray-500/50 mt-2 2xl:mt-4"
        >
          ผลการเลือกตั้งสมาชิกสภาองค์การบริหารส่วนตำบลร่มไทร
        </h3>
        <!-- <p
          class="text-white text-center font-bold text-3xl 2xl:text-4xl text-shadow-lg text-shadow-gray-500/50 2xl:mt-4"
        >
          องค์การบริหารส่วนตำบลร่มไทร
        </p> -->
      </div>
    </footer>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: "StartComponent",
})

import { ref, onMounted, onUnmounted } from "vue"

const candidates = ref<string[]>([
  "1-1",
  "1-2",
  "2-1",
  "2-2",
  "2-3",
  "3-1",
  "3-2",
  "4-1",
  "5-1",
  "5-2",
])

const countdownDays = ref(0)

const calculateDaysLeft = () => {
  const targetDate = new Date("2026-01-11 00:00:00")
  const today = new Date()

  console.log(targetDate, today)

  const timeDiff = targetDate.getTime() - today.getTime()
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  countdownDays.value = daysLeft > 0 ? daysLeft : 0
}

let countdownInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  calculateDaysLeft()
  countdownInterval = setInterval(calculateDaysLeft, 1000 * 60 * 60) // Update every hour
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<style scoped>
header,
footer,
div.footer-alfa {
  background: #020024;
  background: linear-gradient(90deg, rgba(0, 170, 240, 1) 0%, rgba(1, 180, 0, 1) 100%);
}
.footer-alfa {
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%);
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%);
  mask-composite: exclude;
}
.candidate-image {
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 100%);
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 100%);
  mask-composite: exclude;
}
.heading-text::before {
  content: "";
  display: block;
  height: 1px;
  background: white;
  border-radius: 5px;
  width: 100px;
  position: absolute;
  top: 50%;
  left: -120px;
  transform: translateY(-50%);
}
.heading-text::after {
  content: "";
  display: block;
  height: 1px;
  background: white;
  border-radius: 5px;
  width: 100px;
  position: absolute;
  top: 50%;
  right: -120px;
  transform: translateY(-50%);
}

@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fade-in-down 0.6s ease-out;
  animation-fill-mode: both;
}
.w-\[10vw\] {
  width: 10vw;
}
.w-\[20vw\] {
  width: 20vw;
}
.w-\[30vw\] {
  width: 30vw;
}
.w-\[40vw\] {
  width: 40vw;
}
.w-\[50vw\] {
  width: 50vw;
}
.w-\[60vw\] {
  width: 60vw;
}
.w-\[70vw\] {
  width: 70vw;
}
.w-\[80vw\] {
  width: 80vw;
}
.w-\[90vw\] {
  width: 90vw;
}
.w-\[100vw\] {
  width: 100vw;
}
</style>
