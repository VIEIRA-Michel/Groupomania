<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import UserChat from '../components/UserChat.vue';
import MessageChat from "../components/MessageChat.vue";
import { useAuthStore } from '../shared/stores/authStore';
import { useChatStore } from '../shared/stores/chatStore';
import socket from "../socket";

// user va nous permettre de récupérer nos informations en tant qu'utilisateur
const user = computed(() => useAuthStore().$state.user);

// typing va nous permettre de savoir si un utilisateur est en train de nous écrire un message
const typing = computed(() => useChatStore().$state.typing);

// users va nous permettre de récupérer la liste de nos amis connectés
const users = computed(() => useChatStore().$state.friendsConnected);

// usersOnline va nous permettre de récupérer le nombre d'amis connectés
let usersOnline = computed(() => useChatStore().onlineList);

// selectedUser va nous permettre de récupérer l'utilisateur sur lequel nous avons cliqué dans la messagerie
const selectedUser = computed(() => useChatStore().$state.selectedUser);

// change va nous permettre de déclencher l'animation qui fera disparaitre et apparaitre la conversation lors du clic sur un utilisateur différent
const change = ref(false);

// Cette fonction va nous permettre de transmettre au store les informations de l'utilisateur que nous avons sélectionné
function onSelectUser(utilisateur: any) {
    // On déclenche l'animation en passant la valeur à true
    change.value = true;
    setTimeout(() => {
        // On remet la valeur par défaut pour que l'animation puisse se déclencher à nouveau si on sélectionne un autre utilisateur
        change.value = false;
        // On transmet les informations de l'utilisateur sélectionné au store
        useChatStore().selectedUser(utilisateur.user);
    }, 200);
}

// Cette fonction va nous permettre d'émettre l'évènement 'typing' du côté client jusqu'au serveur afin de le retransmettre par la suite à l'utilisateur à qui nous écrivons pour lui indiquer que nous sommes en train d'écrire
function isTyping(param: any) {
    param ? socket.emit('typing', (user.value.firstname + ' ' + user.value.lastname, useAuthStore().$state.user)) : socket.emit('stoptyping', user.value.firstname + ' ' + user.value.lastname, user.value, useAuthStore().$state.user);
};

</script>
<template>
    <div class="container">
        <div :class="[selectedUser ? 'container-left active' : 'container-left']">
            <div class="container-left__title">
                Amis en ligne ({{ usersOnline.length }})
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
            <MessageChat v-if="selectedUser != null" :typing="typing" @typing="isTyping"
                @read="useChatStore().messageRead()" @moreMessages="useChatStore().fetchMoreMessages()"
                @return="useChatStore().unselectUser()" />
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
        -webkit-animation: slide-in-left-chat 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        animation: slide-in-left-chat 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;

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
            -webkit-animation: slide-in-right-chat 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
            animation: slide-in-right-chat 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;

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
        -webkit-animation: slide-in-left-chat 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.3s both;
        animation: slide-in-left-chat 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.3s both;

        @media only screen and (max-width: 768px) {
            width: 90%;
            margin-right: 0;
            z-index: 0;
            -webkit-animation: slide-in-left-chat 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
            animation: slide-in-left-chat 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
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