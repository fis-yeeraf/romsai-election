<template>
  <div class="flex justify-center align-center h-screen bg-gray-900">
    <div class="content-center">
      <UCard class="flex justify-center align-center bg-gray-800">
        <form @submit.prevent="handleLogin({ email, password })">
          <div class="text-center mb-5">
            <span
              class="bg-white/10 inline-flex justify-center items-center rounded-full p-1 border border-[#354759]"
            >
              <div class="logo bg-white rounded-full"></div>
            </span>
            <div class="text-lg font-bold mt-2 text-white">ลงคะแนนเลือกตั้ง</div>
          </div>
          <input
            type="text"
            :class="[
              'w-full px-5 py-2 bg-white/10 text-white',
              'border border-transparent placeholder:text-white/60',
              'hover:border-white/40 focus:outline-none focus:bg-white/20',
              'rounded-full transition-colors duration-300',
            ]"
            v-model="email"
            placeholder="email"
          />
          <small v-if="errors['email']" class="text-red-500 ml-3">
            {{ errors["email"] }}
          </small>
          <input
            type="password"
            :class="[
              'w-full px-5 py-2 bg-white/10 text-white',
              'border border-transparent placeholder:text-white/60',
              'hover:border-white/40 focus:outline-none focus:bg-white/20',
              'rounded-full transition-colors duration-300',
              'mt-5',
            ]"
            v-model="password"
            placeholder="password"
          />
          <small v-if="errors['password']" class="text-red-500 ml-3">
            {{ errors["password"] }}
          </small>

          <UButton
            label="Login"
            type="submit"
            rounded
            size="md"
            :loading="isLoading"
            :class="[
              'flex justify-center cursor-pointer',
              'w-full bg-black/10 my-5 text-center',
              'hover:bg-black/20 border-1 px-3 py-3 text-white border-transparent',
              'transition-colors duration-300 shadow-2 rounded-full focus:outline-0 focus:bg-black/30',
            ]"
          />
        </form>
        <div v-if="errors['_error']" class="text-center">
          <small class="text-red-500">
            {{ errors["_error"] }}
          </small>
        </div>
      </UCard>
    </div>
  </div>
</template>
<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref("")
const password = ref("")
const errors = ref<{ email?: string; password?: string; _error?: string }>({})
const isLoading = ref(false)

const handleLogin = async (credentials: { email: string; password: string }) => {
  isLoading.value = true
  try {
    const { data, error } = await supabase.auth.signInWithPassword(credentials)
    if (error) throw error
    if (data.user) {
      navigateTo("/admin")
    }
  } catch (error) {
    console.error("Error logging in:", error)
    errors.value = { _error: "email หรือ password ไม่ถูกต้อง" }
  } finally {
    isLoading.value = false
  }
}
</script>
<style scoped>
.logo {
  width: 70px;
  height: 70px;
  background-image: url("/images/logo.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}
</style>
