<script setup lang="ts">
import { computed, ref, onBeforeMount, onUnmounted, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './shared/stores/authStore';
import { useFriendshipStore } from './shared/stores/friendsStore';
import { useChatStore } from './shared/stores/chatStore';
import socket from "./socket";
const route = useRoute();

const isConnected = computed(() => useAuthStore().$state.isConnected);
const users = computed(() => useChatStore().$state.users);
const friendsConnected = computed(() => useChatStore().$state.friendsConnected);
const friends = computed(() => useFriendshipStore().$state.friends);
const selectedUser = ref<any>(null);

useAuthStore().getMyInformations();

function displayFriends(usersOnline: any) {
  usersOnline.forEach((userOnline: any) => {
    friends.value.forEach((friend: any) => {
      friend.user_id == userOnline.user ? useChatStore().friendsConnected(userOnline) : "";
    });
  });
}

function checkIsFriend(utilisateur: any) {
  friendsConnected.value.find(friend => friend.user == utilisateur.user) ? "" : friends.value.length > 0 && friends.value.find(friend => friend.user_id === utilisateur.user) ? useChatStore().friendsConnected(utilisateur) : "";
}

function init() {
  useFriendshipStore().getRequests();
  useFriendshipStore().checkRequestsSended();
  useFriendshipStore().getAllFriends();
}

watchEffect(() => {
  if (isConnected.value) {
    init();
  }
})

onBeforeMount(() => {
  if (isConnected.value) {
    useFriendshipStore().getAllFriends().then((response) => {
      const session = JSON.parse(localStorage.getItem("user"));
      if (session) {
        socket.auth = { username: session.firstname + ' ' + session.lastname, picture: session.picture_url, user: session.user_id, sessionID: session.session_id };
        socket.connect();
      }
      socket.on("session", ({ sessionID, userID }) => {
        socket.auth = { sessionID };
        socket.userID = userID;
      });
      socket.on('typing', (data) => {
        useChatStore().$patch((state) => {
          state.typing = data;
        });
      });
      socket.on('stoptyping', (data) => {
        useChatStore().$patch((state) => {
          state.typing = false;
        });
      });
      socket.on("connect", () => {
        users.value.forEach((utilisateur: any) => {
          utilisateur.self ? utilisateur.connected = true : "";
        });
      });
      socket.on("disconnect", () => {
        users.value.forEach((utilisateur: any) => {
          utilisateur.self ? utilisateur.connected = false : "";
        });
      });
      const initReactiveProperties = (utilisateur: any) => {
        utilisateur.connected = true;
        utilisateur.messages = [];
        utilisateur.hasNewMessages = false;
      };
      socket.on("users", (users2) => {
        users2.forEach((utilisateur: any) => {
          for (let i = 0; i < users2.length; i++) {
            const existingUser = users2[i];
            if (existingUser.userID === utilisateur.userID) {
              initReactiveProperties(existingUser);
              return;
            }
          }
          utilisateur.self = utilisateur.userID === socket.userID;
          initReactiveProperties(utilisateur);
        });
        users2 = users2.sort((a: any, b: any) => {
          if (a.self) return -1;
          if (b.self) return 1;
          if (a.username < b.username) return -1;
          return a.username > b.username ? 1 : 0;
        });
        let currentUserConnected = users2.filter((user: any) => user.userID !== socket.userID);
        displayFriends(currentUserConnected);
      });
      socket.on("user connected", (utilisateur: any) => {
        for (let i = 0; i < users.value.length; i++) {
          const existingUser: any = useChatStore().$state.users[i];
          if (existingUser.userID === utilisateur.userID) {
            existingUser.connected = true;
            return;
          }
        }
        initReactiveProperties(utilisateur);
        useChatStore().userConnected(utilisateur);
        checkIsFriend(utilisateur);
      });
      socket.on("user disconnected", (id) => {
        let newArray = ref(users.value.filter((utilisateur: any) => utilisateur.userID !== id));
        let newArrayFriend = ref(friendsConnected.value.filter((utilisateur: any) => utilisateur.user !== id));
        useChatStore().$patch((state: any) => {
          state.users = newArray.value;
          state.friendsConnected = newArrayFriend.value;
        });
      });
      socket.on("private message", ({ content, from, to }) => {
        for (let i = 0; i < friendsConnected.value.length; i++) {
          const utilisateur: any = friendsConnected.value[i];
          if (utilisateur.userID === from) {
            utilisateur.messages.push({
              message: content,
              fromSelf: false,
            });
            if (utilisateur !== selectedUser) {
              utilisateur.hasNewMessages = true;
            }
            break;
          }
        }
      });
    });
  }
});

onUnmounted(() => {
  socket.off("connect");
  socket.off("disconnect");
  socket.off("users");
  socket.off("user connected");
  socket.off("user disconnected");
  socket.off("private message");
})
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