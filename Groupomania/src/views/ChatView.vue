<script setup lang="ts">
import { computed, ref, onBeforeMount } from 'vue';
import UserChat from '../components/UserChat.vue';
import MessageChat from "../components/MessageChat.vue";
import { useAuthStore } from '../shared/stores/authStore';
import { useChatStore } from '../shared/stores/chatStore';
import socket from "../socket";

const user = computed(() => useAuthStore().$state.user);
const typing = computed(() => useChatStore().$state.typing);
const users = computed(() => useChatStore().$state.users);
let usersOnline = computed(() => useChatStore().onlineList);
const selectedUser = computed(() => useChatStore().$state.selectedUser);
const change = ref(false);

function onSelectUser(utilisateur: any) {
    let numConversation = ref<any>();
    if (utilisateur.user > user.value.user_id) {
        numConversation.value = `${user.value.user_id}-${utilisateur.user}`
    } else {
        numConversation.value = `${utilisateur.user}-${user.value.user_id}`
    }
    // console.log('composant', utilisateur.limit, utilisateur.from);
    useChatStore().getCountOfMessages(numConversation.value).then((count: any) => {
        console.log(count);
        useChatStore().getMessagesOfConversation(numConversation.value, utilisateur.limit, utilisateur.from).then((response: any) => {
            console.log(response);
            if (response.length > 0) {
                if (!useChatStore().$state.selectedUser || useChatStore().$state.selectedUser.user !== utilisateur.user) {
                    response.forEach((message: any) => {
                        console.log(message);
                        if (message.sender == utilisateur.user || message.recipient == utilisateur.user) {
                            // if(useChatStore().$state.selectedUser.messages.length > 0) {}
                            // useChatStore().$state.selectedUser.messages.map((item: any) => {
                            //     if (item.id !== message.id) {
                            //     }
                            // })
                            utilisateur.messages.push(message)
                        }
                    });
                }
            }
            utilisateur.hasNewMessages = false;
            change.value = true;
            setTimeout(() => {
                change.value = false;
                useChatStore().$patch((state: any) => {
                    state.selectedUser = utilisateur;
                });
            }, 200);

        })
    });
}
function unselect() {
    useChatStore().$patch((state: any) => {
        state.selectedUser = null;
    })
}

function isTyping(param: any) {
    param ? socket.emit('typing', user.value.firstname + ' ' + user.value.lastname) : socket.emit('stoptyping', user.value.firstname + ' ' + user.value.lastname);
};

function messageRead() {
    useChatStore().$patch((state: any) => {
        state.selectedUser.hasNewMessages = false;
    })
}

onBeforeMount(() => {
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
});

</script>
<template>
    <div class="container">
        <div :class="[selectedUser ? 'container-left active' : 'container-left']">
            <div class="container-left__title">
                <h1>Amis en ligne ({{ usersOnline.length }})</h1>
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
            <MessageChat v-if="selectedUser != null" :typing="typing" @typing="isTyping" @read="messageRead"
                @return="unselect" />
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
        background-color: floralwhite;
        z-index: 2;
        -webkit-animation: slide-in-left 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        animation: slide-in-left 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;

        &__title {
            font-weight: bold;
            font-size: 20px;
            display: flex;
            justify-content: center;
            margin: 20px;
            border: 1px solid #dbdbdb;
            background: #FFFFFF;
            padding: 10px;
            border-radius: 5px;
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
                justify-content: center;
                // @media only screen and (max-width: 768px) {
                //     display: flex;
                // }
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