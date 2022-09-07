<script setup lang="ts">
import { computed, ref, onBeforeMount, onBeforeUnmount, onMounted, onUnmounted, onActivated, onDeactivated, watchEffect } from 'vue';
import UserChat from '../components/UserChat.vue';
import MessageChat from "../components/MessageChat.vue";
import { useAuthStore } from '../shared/stores/authStore';
import { useFriendshipStore } from '../shared/stores/friendsStore';
import { useChatStore } from '../shared/stores/chatStore';
import socket from "../socket";

const messages = computed(() => useChatStore().$state.messages);
const user = computed(() => useAuthStore().$state.user);
const typing = computed(() => useChatStore().$state.typing);
const users = computed(() => useChatStore().$state.users);
const selectedUser = ref<any>(null);
const change = ref(false);

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
        useChatStore().sendMessage(selectedUser.value.user, content, user.value.user_id).then((response) => {
            useChatStore().$patch((state: any) => {
                state.messages.push({
                    from: user.value.user_id,
                    id: response,
                    message: content,
                    to: selectedUser.value.user,
                });
            })
            socket.emit("private message", {
                id: response,
                message: content,
                to: selectedUser.value.userID,
            });
            selectedUser.value.messages.push({
                from: user.value.user_id,
                id: response,
                message: content,
                to: selectedUser.value.user,
            });
        })
    };
};

function isTyping(param: any) {
    param ? socket.emit('typing', user.value.firstname + ' ' + user.value.lastname) : socket.emit('stoptyping', user.value.firstname + ' ' + user.value.lastname);
};

onBeforeMount(() => {
    useFriendshipStore().getAllFriends().then((response: any) => {
        useChatStore().getUsersConnected().then((response2: any) => {
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

            socket.on("private message", ({ from, id, message, to }) => {
                useChatStore().$patch((state: any) => {
                    useChatStore().$state.users.map((utilisateur: any) => {
                        console.log(utilisateur.userID);
                        if (utilisateur.userID == from) {
                            state.messages.push({
                                from: utilisateur.user,
                                id,
                                message,
                                to: user.value.user_id,
                            });
                            utilisateur.messages.push({
                                from: utilisateur.user,
                                id,
                                message,
                                to: user.value.user_id,
                            });
                            if (utilisateur !== selectedUser) {
                                utilisateur.hasNewMessages = true;
                            }
                            return utilisateur;
                        }
                    })
                })
            })
        });
    });
});

</script>
<template>
    <div class="container">
        <div :class="[selectedUser ? 'container-left active' : 'container-left']">
            <div class="container-left__title">
                <h1>Amis en ligne ({{ users.length }})</h1>
            </div>
            <div class="container-left__list">
                <UserChat v-if="users.length > 0" v-for="utilisateur in users" :key="utilisateur.userID"
                    :user="utilisateur" :selected="selectedUser === utilisateur" @select="onSelectUser(utilisateur)" />
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

        &__title {
            font-weight: bold;
            font-size: 20px;
            display: flex;
            justify-content: center;
            margin-top: 20px;
        }

        &__list {
            border-radius: 5px 5px 0 0;
            margin-top: 20px;

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