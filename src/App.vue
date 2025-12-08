<template>
  <div id="app" class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter
  }
}
</script>
