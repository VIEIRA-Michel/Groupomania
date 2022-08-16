<script setup lang="ts">
import { useAuthStore } from './shared/stores/authStore';
import { useRoute } from 'vue-router';
import socket from "./socket";
const route = useRoute();
const authStore = useAuthStore();

setTimeout(() => {
  onUsernameSelection(authStore.$state.user)
}, 2000);

function onUsernameSelection(user: any) {
    socket.auth = { username: user.firstname + ' ' + user.lastname, picture: user.picture_url };
    socket.connect();
}
</script>

<template>
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