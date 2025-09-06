// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: false,
  modules: ["@nuxt/eslint", "@nuxt/ui", "@nuxtjs/supabase"],
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      // include: ["/admin(/*)?"],
      exclude: ["/", "/admin(/*)?"],
    },
  },
  css: ["@/assets/css/main.css"],
  ui: {
    // colorMode: false,
  },
})
