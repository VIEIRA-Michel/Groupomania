<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './shared/stores/authStore';
import NavigationBar from './components/NavigationBar.vue';
const router = useRouter();

const isConnected = computed(() => useAuthStore().isConnected);
function logout() {
  useAuthStore().logout()
  router.push("/login");

}
</script>
<template>
  <NavigationBar :isConnected="isConnected" @logout="logout" />
  <router-view>
  </router-view>
</template>
<style>
* {
  font-family: 'Lato', sans-serif;
}

body {
  margin: auto;
  background-color: #FFD7D7;
}
</style>