<script setup lang="ts">
import { computed, ref, onBeforeMount, onUnmounted } from 'vue';
import NavigationBar from '../components/NavigationBar.vue';
import userChat from '../components/userChat.vue';
import MessageChat from "../components/MessageChat.vue";
import { useAuthStore } from '../shared/stores/authStore';
import { useFriendshipStore } from '../shared/stores/friendsStore';
import { useChatStore } from '../shared/stores/chatStore';
import socket from "../socket";

useAuthStore().getMyInformations();
useAuthStore().$state.isConnected == false ? logout() : "";
useChatStore().getAllMessages();

const isConnected = computed(() => useAuthStore().$state.isConnected);
const user = computed(() => useAuthStore().$state.user);
const typing = computed(() => useChatStore().$state.typing);
const users = computed(() => useChatStore().$state.users);
const friendsConnected = computed(() => useChatStore().$state.friendsConnected);
const messages = computed(() => useChatStore().$state.messages);
const friends = computed(() => useFriendshipStore().$state.friends);
const selectedUser = ref<any>(null);
const change = ref(false);

function logout() {
    useAuthStore().logout();
    window.location.href = '/';
}

function onSelectUser(utilisateur: any) {
    !selectedUser.value || selectedUser.value.user !== utilisateur.user ?
        messages.value.forEach((message: any) => {
            message.from == utilisateur.user || message.to == utilisateur.user ? utilisateur.messages.push(message) : "";
        }) : "";
    utilisateur.hasNewMessages = false;
    change.value = true;
    setTimeout(() => {
        change.value = false;
        selectedUser.value = utilisateur;
    }, 200);
}
function unselect() {
    selectedUser.value = null;
}


function onMessage(content: any) {
    if (selectedUser.value) {
        useChatStore().sendMessage(selectedUser.value.user, content, user.value.user_id);
        socket.emit("private message", {
            content,
            to: selectedUser.value.userID,
        });
        selectedUser.value.messages.push({
            message: content,
            from: user.value.user_id,
            to: selectedUser.value.user,
        });
    }
};

function isTyping(param: any) {
    param ? socket.emit('typing', user.value.firstname + ' ' + user.value.lastname) : socket.emit('stoptyping', user.value.firstname + ' ' + user.value.lastname);
};

onBeforeMount(() => {
    if (isConnected.value) {
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
    }
});

</script>
<template>
    <NavigationBar :user="user" :isConnected="isConnected" @logout="logout" />
    <div class="container">
        <div :class="[selectedUser ? 'container-left active' : 'container-left']">
            <div class="container-left__list">
                <userChat v-if="friendsConnected.length > 0" v-for="utilisateur in friendsConnected"
                    :key="utilisateur.userID" :user="utilisateur" :selected="selectedUser === utilisateur"
                    @select="onSelectUser(utilisateur)" />
                <div v-else class="container-left__list__message">
                    <p>Aucun utilisateur en ligne actuellement</p>
                </div>
            </div>
        </div>
        <div v-if="selectedUser != null" :class="[change ? 'container-center active' : 'container-center']">
            <MessageChat v-if="selectedUser != null" :user="selectedUser" :typing="typing" @input="onMessage"
                @typing="isTyping" @read="selectedUser.hasNewMessages = false" @return="unselect" />
        </div>
    </div>
</template>
<style scoped lang="scss">
@import '../styles/Utils/keyframes';

* {
    font-family: 'Lato', sans-serif;
}

.container {
    width: 90%;
    // height: 89vh;
    height: 600px;
    display: flex;
    flex-direction: row;
    margin: 60px auto auto auto;
    justify-content: center;
    transition: all 0.3s ease-in-out;

    @media only screen and (max-width: 768px) {
        width: 100%;
    }


    .container-left {
        width: 30%;
        border-right: 1px solid #DBDBDB;
        border: 1px solid #FD2D01;
        border-radius: 5px;
        margin-right: 10px;
        background-color: #FFFFFF;
        z-index: 2;
        -webkit-animation: slide-in-left 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        animation: slide-in-left 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;

        &__list {
            border-radius: 5px 5px 0 0;

            &__message {
                text-align: center;
            }

            @media only screen and (max-width: 768px) {
                width: 100%;
            }

            &__item {
                @media only screen and (max-width: 768px) {
                    display: flex;
                    justify-content: center;
                }
            }
        }

        &.active {
            -webkit-animation: slide-in-right 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
            animation: slide-in-right 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;

            @media only screen and (max-width: 768px) {
                display: none;
            }

        }

        @media only screen and (max-width: 768px) {
            z-index: 0;
            margin-right: 0;
            width: 90%;
        }
    }


    .container-center {
        width: 50%;
        background: #FFFFFF;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border: 1px solid #FD2D01;
        border-radius: 5px;
        margin-right: 10px;
        z-index: 1;
        -webkit-animation: slide-in-left 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.3s both;
        animation: slide-in-left 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.3s both;

        @media only screen and (max-width: 768px) {
            width: 90%;
            margin-right: 0;
            z-index: 0;
            -webkit-animation: slide-in-left 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
            animation: slide-in-left 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        }

        &.active {
            width: 50%;
            background: #FFFFFF;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border: 1px solid #FD2D01;
            border-radius: 5px;
            margin-right: 10px;
            z-index: 1;
            -webkit-animation: slide-out-right 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
            animation: slide-out-right 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
        }
    }
}
</style>