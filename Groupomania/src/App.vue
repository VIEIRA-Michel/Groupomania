<script setup lang="ts">
import { onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './shared/stores/authStore';
import NavigationBar from './components/NavigationBar.vue';
import socket from "./socket";
const router = useRouter();

const isConnected = computed(() => useAuthStore().isConnected);
async function logout() {
  try {
    useAuthStore().logout().then((response) => {
      router.push("/login");
    })
  } catch (error) {
    throw error;
  }
}

onUnmounted(() => {
  useAuthStore().logout().then((response) => {
      socket.disconnect();
      socket.off("connect");
      socket.off("disconnect");
      socket.off("users");
      socket.off("user connected");
      socket.off("user disconnected");
      socket.off("private message");
      socket.off("friendRequest sended");
      socket.off("friendRequest refused");
      socket.off("friendRequest accepted");
      socket.off("friend removed");
      socket.off("friendRequest canceled");
      console.log('unmounted');
  });
});
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