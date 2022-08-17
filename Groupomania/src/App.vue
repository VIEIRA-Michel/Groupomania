<script setup lang="ts">
import { useAuthStore } from './shared/stores/authStore';
import { useRoute } from 'vue-router';
import { onBeforeMount } from 'vue';
import socket from "./socket";
const route = useRoute();
const authStore = useAuthStore();



onBeforeMount(() => {
  const sessionID = localStorage.getItem("sessionID");

  if (sessionID) {
    socket.auth = { sessionID };
    socket.connect();
  }

  socket.on("session", ({ sessionID, userID }) => {
    // attach the session ID to the next reconnection attempts
    socket.auth = { sessionID };
    // store it in the localStorage
    localStorage.setItem("sessionID", sessionID);
    // save the ID of the user
    socket.userID = userID;
  });
})


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