<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './shared/stores/authStore';
import NavigationBar from './components/NavigationBar.vue';
const router = useRouter();

// isConnected va nous permettre de savoir si nous sommes connectés ou non
const isConnected = computed(() => useAuthStore().isConnected);

// Cette fonction va nous permettre de déclencher la fonction dans le store qui déclenchera l'action de déconnexion en vidant le localStorage et le state
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
<style lang="scss">
* {
  font-family: 'Lato', sans-serif;

  &::-webkit-scrollbar {
    width: 4px;
    background:#ffffff;

  }

  &::-webkit-scrollbar-thumb {
    background: #fd2d02;
  }
}

body {
  margin: auto;
  background-color: #ebe6e2;
}
</style>