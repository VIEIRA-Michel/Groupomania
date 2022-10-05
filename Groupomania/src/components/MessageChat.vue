<script setup lang="ts">
import { ref, watchEffect, computed, onBeforeMount, watch } from 'vue';
import { useAuthStore } from '@/shared/stores/authStore';
import { useFriendshipStore } from '@/shared/stores/friendsStore';
import { useChatStore } from '@/shared/stores/chatStore';
import socket from "@/socket";

// display va nous permettre d'afficher les informations de notre ami au sein de la conversation
const display = ref(false);

// allow va nous permettre de récupérer les différentes informations de notre ami
const allow = ref(false);

// user va nous permettre de récupérer nos informations en tant qu'utilisateur
const user = computed(() => useAuthStore().$state.user);

// friendsOfUser va nous permettre de récupérer les amis de notre ami
const friendsOfUser = computed(() => useFriendshipStore().$state.friendsOfUser);

// selectedUser va nous permettre de récupérer l'utilisateur sur lequel nous avons cliqué dans la messagerie
const selectedUser = computed(() => useChatStore().$state.selectedUser);

// newMessage va nous permettre de récupérer le message que nous avons écrit
const newMessage = ref('');

// obj va nous permettre de stocker les différentes informations au sujet de notre ami
const obj = ref({});

// msgDom va nous permettre de gérer le scroll lors de la réception d'un nouveau message au sein de la conversation
let msgDom: any = ref(document.getElementsByClassName('container-center__body'));

// On récupère la propriété que l'on passe depuis l'élément parent et on définit son type
const props = defineProps<{
    typing: any
}>();

// displaySender va nous permettre de vérifier l'émetteur du message pour savoir si c'est le même que celui qui a envoyé le message précédent 
// afin de l'afficher en dessous du précédent ou de l'afficher à l'opposé pour indiquer que ce n'est pas le même utilisateur qui a envoyé le message
function displaySender(message: any, index: number) {
    return (
        index === 0 ||
        selectedUser.value.messages[index - 1].sender !==
        selectedUser.value.messages[index].sender
    );
};

// displayInformation va nous permettre d'afficher les informations de l'ami sur avec lequel nous avons ouvert la discussion
function displayInformation() {
    allow.value = !allow.value;
    // Si allow est à true alors nous allons afficher les informations de notre ami
    if (allow.value == true) {
        useFriendshipStore().getAllFriends(selectedUser.value.user).then((response: any) => {
            display.value = true;
            response.results.map((friend: any) => {
                if (friend.sender_user_id == user.value.user_id) {
                    obj.value = {
                        created_at: new Date(friend.recipient_created_at).toLocaleDateString("fr"),
                        birthday: friend.recipient_birthday,
                        email: friend.recipient_email,
                        friend_since: new Date(friend.approve_date).toLocaleDateString("fr")
                    }
                } else {
                    obj.value = {
                        created_at: new Date(friend.sender_created_at).toLocaleDateString("fr"),
                        birthday: friend.sender_birthday,
                        email: friend.sender_email,
                        friend_since: new Date(friend.approve_date).toLocaleDateString("fr")
                    }
                }
            });
        })
        // Dans le cas contraire nous allons réinitialiser le state stockant la liste d'ami de notre ami, afin de pouvoir afficher une nouvelle liste d'ami dans le cas d'un clic sur un ami différent
    } else {
        useFriendshipStore().resetFriendlist();
        display.value = false;
    }
}

// Cette fonction va nous permettre d'émettre le message à son destinataire grâce à l'évènement socket en lien avec l'action
function send(event: any) {
    event?.preventDefault();
    if (selectedUser.value) {
        useChatStore().sendMessage(selectedUser.value.user, newMessage.value).then((response) => {
            socket.emit("private message", {
                id: response,
                message: newMessage.value,
                to: selectedUser.value.userID,
                user: user.value
            });
            // On réinitialisera la valeur de notre saisie après l'expédition du message
            newMessage.value = '';
            // Et on scrollera jusqu'au message venant d'être envoyé dans le cas où nous serions remontés plus haut dans la conversation
            event.target.style.height = 'auto';
        })
    };
}

// Cette fonction va nous permettre de redimensionner le champ de saisie de texte en fonction de la taille du texte saisi afin de toujours voir l'ensemble du texte saisi
function autoResize(event: any) {
    event.target.style.height = 'auto';
    event.target.style.height = event.target.scrollHeight + 'px';
}

// Ce watch va nous permettre de transmettre l'évènement au composant parent afin qu'il puisse transmettre l'information via un évènement socket 
// et dans le cas ou notre ami aurait notre discussion ouverte il serait averti si nous sommes en train d'écrire ou non
watch(newMessage, (value: any) => {
    if (value.length > 0) {
        emit('typing', true)
    } else {
        emit('typing', false)
    }
})

// Ce watch va nous permettre de scroller jusqu'au dernier message dans le cas où l'on recevrait un nouveau message et que nous étions un peu plus haut dans la discussion
// Et d'émettre l'évènement au composant parent que nous avons lus le message dans le cas ou la discussion serait restée ouverte
watch(selectedUser.value.messages, (nouvelleVal: any) => {
    setTimeout(() => {
        msgDom.value[0].scrollTop = msgDom.value[0].scrollHeight;
        // document.querySelector('ul')?.lastChild?.scrollIntoView();
        // console.log(document.querySelector('ul')?.lastElementChild?.scrollHeight);
        emit('read');
    }, 1);
})

// On définit le nom des différents évènements que l'on souhaite communiquer à l'élément parent afin qu'il déclenche l'action en lien avec l'évènement émit
const emit = defineEmits<{
    (e: 'input', input: any): any;
    (e: 'typing', typing: any): any;
    (e: 'read'): any;
    (e: 'return'): any;
    (e: 'moreMessages'): any
}>();

</script>
<template>
    <div class="container-center__top">
        <div class="container-center__top__previously" @click="emit('return')">
            <div class="container-center__top__previously__button">
                <fa icon="fa-solid fa-chevron-left" />
            </div>
        </div>
        <div class="container-center__top__details">
            <div class="container-center__top__details__left">
                <img :src="selectedUser.picture" alt="avatar" />
            </div>
            <div class="container-center__top__details__right">
                <div class="container-center__top__details__right__name">
                    {{ selectedUser.username }}
                </div>
                <div class="container-center__top__details__right__status">
                    <div class="container-center__top__details__right__status__online">
                        <div v-if="selectedUser.connected" class="status-online">
                            <div class="online"></div>
                            <span class="online-message">En Ligne</span>
                        </div>
                        <div v-else class="status-offline">
                            <div class="offline"></div>
                            <span class="offline-message">Hors Ligne</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="container-center__top__information" @click="displayInformation">
            <div class="container-center__top__information__button">
                <fa icon="fa-solid fa-circle-info" />
            </div>
        </div>
        <div v-if="display" class="container-center__top__user">
            <div class="container-center__top__user__description">
                <!-- <div v-if="obj.birthday" class="container-center__top__user__description__birthday">
                    <fa icon="fa-solid fa-cake-candles" /><span>C'est son anniversaire le {{ obj.birthday }}</span>
                </div> -->
                <!-- <div v-else class="container-center__top__user__description__birthday">
                    <fa icon="fa-solid fa-cake-candles" /><span>Date d'anniversaire masqué</span>
                </div> -->
                <div class="container-center__top__user__description__createdat">
                    <fa icon="fa-solid fa-address-card" /><span>Inscrit depuis le {{ obj.created_at }}</span>
                </div>
                <div class="container-center__top__user__description__friendsince">
                    <fa icon="fa-solid fa-user-check" /><span>Amis depuis le {{ obj.friend_since }}</span>
                </div>
                <div class="container-center__top__user__description__friendlist">
                    <div class="friends-list">
                        <div class="friends-list__title">
                            <div class="friends-list__title__text">
                                <fa icon="fa-solid fa-user-group" /><span>Amis ({{ friendsOfUser.length }})</span>
                            </div>
                        </div>
                        <div v-if="friendsOfUser.length > 0" class="friends-list__list">
                            <div v-for="friend in friendsOfUser" class="friends-list__list__item">
                                <div class="friends-list__list__item__avatar">
                                    <img :src="friend.picture_url" alt="avatar-1">
                                </div>
                                <div class="friends-list__list__item__name">
                                    <div class="friends-list__list__item__name__text">
                                        <div class="friends-list__list__item__name__text__username">
                                            <span>{{ friend.firstname }} {{ friend.lastname}}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="container-center__body">
        <div class="container-center__body__chat">
            <div class="container-center__body__chat__button">
                <button v-if="selectedUser.messages.length < selectedUser.messagesQty" @click="emit('moreMessages')"
                    class="container-center__body__chat__button__more">
                    Charger plus de messages
                </button>
            </div>
            <ul>
                <li v-for="(message, index) in selectedUser.messages" :key="index"
                    class="container-center__body__chat__item"
                    v-bind:class="[message.sender == useAuthStore().$state.user.user_id ? 'fromSelf' : 'fromUser']">
                    <div v-if="displaySender(message, index)" class="container-center__body__chat__item__left">
                    </div>
                    <div class="container-center__body__chat__item__right">
                        <div class="container-center__body__chat__item__right__message"
                            v-bind:class="[message.sender == useAuthStore().$state.user.user_id ? 'fromSelf' : 'fromUser']">
                            {{ message.content }}
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <div class="container-center__body__bottom">
            <div v-if="props.typing.user_id == selectedUser.user" class="container-center__body__bottom__typing">
                <small> <span>{{ props.typing.firstname + ' ' + props.typing.lastname }}</span> est entrain
                    d'écrire</small>
            </div>
        </div>
    </div>
    <div class="container-center__bottom">
        <form class="container-center__bottom__input" @keyup.enter="send($event)">
            <textarea class="container-center__bottom__input__text" v-model="newMessage"
                placeholder="Ecrivez votre message..." @input="autoResize"></textarea>
        </form>
    </div>
</template>
<style scoped lang="scss">
@import '../styles/Utils/keyframes';

.container-center {
    small {
        span {
            font-weight: bold;
            color: #FD2D01;
        }
    }

    &__top {
        display: flex;
        margin: auto;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        background: floralwhite;
        box-shadow: 0px 1px 8px -3px rgb(0 0 0 / 40%);
        flex-wrap: wrap;
        z-index: 1;
        border-radius: 5px 5px 0 0;

        &__previously {
            margin-left: 15px;
        }

        &__details {
            // margin-left: 50px;
            display: flex;
            align-items: center;
            justify-content: space-around;

            &__left {
                img {
                    width: 45px;
                    height: 45px;
                    border-radius: 50px;
                    object-fit: cover;
                    margin: 5px;
                }
            }

            &__right {
                margin-left: 5px;

                &__name {
                    font-weight: bold;
                }

                &__status {
                    &__online {
                        .status-online {

                            display: flex;
                            align-items: baseline;

                            .online {
                                border: 1px solid #DBDBDB;
                                width: 10px;
                                height: 10px;
                                border-radius: 50px;
                                background-color: #00FF00;

                                &-message {
                                    margin-left: 5px;
                                }
                            }

                        }

                        .status-offline {
                            display: flex;
                            flex-direction: row;
                            align-items: center;

                            .offline {
                                border: 1px solid #DBDBDB;
                                width: 10px;
                                height: 10px;
                                border-radius: 50px;
                                background-color: #FD2D01;

                                &-message {
                                    margin-left: 5px;
                                }
                            }

                        }


                    }
                }
            }
        }

        &__information {
            margin-right: 15px;

            &__button {
                svg {
                    color: #FD2D01;
                }
            }
        }

        &__user {
            width: 100%;
            height: 100%;
            overflow-x: hidden;

            &__description {
                &__birthday {
                    svg {
                        -webkit-animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                        animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                        margin-right: 5px;
                        color: #FD2D01;
                    }

                    span {
                        -webkit-animation: slide-in-right 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.2s both;
                        animation: slide-in-right 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.2s both;
                    }

                    margin-bottom: 10px;
                    display: flex;
                    justify-content: center;
                }

                &__createdat {
                    svg {
                        -webkit-animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.4s both;
                        animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.4s both;
                        margin-right: 5px;
                        color: #FD2D01;
                    }

                    span {
                        -webkit-animation: slide-in-right 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.6s both;
                        animation: slide-in-right 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.6s both;
                    }

                    margin-bottom: 10px;
                    display: flex;
                    justify-content: center;
                }

                &__friendsince {
                    svg {
                        -webkit-animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.8s both;
                        animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.8s both;
                        margin-right: 5px;
                        color: #FD2D01;
                    }

                    span {
                        -webkit-animation: slide-in-right 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 1s both;
                        animation: slide-in-right 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 1s both;
                    }

                    margin-bottom: 10px;
                    display: flex;
                    justify-content: center;
                }

                &__friendlist {

                    .friends-list {
                        background: floralwhite;
                        width: 80%;
                        margin: 10px auto 0px auto;
                        border-radius: 5px;

                        &__title {
                            text-align: center;
                            margin: 20px 0;
                            font-weight: 700;

                            &__text {
                                svg {
                                    -webkit-animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.2s both;
                                    animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.2s both;
                                    margin-right: 5px;
                                    color: #FD2D01;
                                }

                                span {
                                    -webkit-animation: slide-in-right 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.4s both;
                                    animation: slide-in-right 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.4s both;
                                }
                            }
                        }

                        &__list {
                            display: flex;
                            flex-direction: row;
                            flex-wrap: wrap;
                            margin: auto;
                            height: 140px;
                            justify-content: space-between;
                            overflow-y: scroll;
                            margin: 20px;
                            padding: 10px;
                            background: #dbdbdb;
                            border: 1px solid #4E5166;
                            -webkit-animation: fade-in 0.2s cubic-bezier(0.390, 0.575, 0.565, 1.000) 1.6s both;
                            animation: fade-in 0.2s cubic-bezier(0.390, 0.575, 0.565, 1.000) 1.6s both;

                            @media (max-width: 768px) {
                                width: 100%;
                            }

                            &__item {

                                margin: 10px auto;
                                width: 90px;
                                background: #EFEFEF;
                                border: 1px solid #4E5166;
                                border-radius: 5px;
                                -webkit-animation: fade-in 1s cubic-bezier(0.390, 0.575, 0.565, 1.000) 1.8s both;
                                animation: fade-in 1s cubic-bezier(0.390, 0.575, 0.565, 1.000) 1.8s both;

                                @media (max-width: 768px) {
                                    width: 35%;
                                }

                                &__button {
                                    display: flex;
                                    flex-direction: row;
                                    justify-content: space-between;

                                    button {
                                        background-color: #ff7a7a;
                                        font-size: 1rem;
                                        width: 100%;
                                        height: 30px;
                                        font-weight: bold;
                                        cursor: pointer;
                                        border: 1px solid #DBDBDB;
                                        padding: 5px 10px;
                                        border-radius: 5px;
                                        transition: all 0.3s ease-in-out;

                                    }

                                    .message {
                                        background-color: #fffa7a;
                                    }

                                }

                                &__avatar {
                                    display: flex;
                                    justify-content: center;

                                    img {
                                        width: 100%;
                                        height: 80px;
                                        object-fit: cover;
                                        border-radius: 5px 5px 0 0;
                                    }
                                }

                                &__name {
                                    display: flex;
                                    height: 37px px;
                                    border-top: 1px solid #4E5166;
                                    align-items: center;
                                    justify-content: center;

                                    &__text {
                                        margin: 5px;

                                        &__username {
                                            display: flex;
                                            justify-content: center;

                                            span {
                                                font-size: 12px;
                                                font-weight: 300;
                                                text-align: center;
                                            }
                                        }
                                    }
                                }


                            }
                        }

                        &__empty-friends {
                            display: flex;
                            justify-content: center;
                            margin-bottom: 20px;
                        }
                    }

                }
            }
        }
    }


    &__body {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: end;
        overflow-y: scroll;

        &__chat {
            height: 100%;

            &__button {
                display: flex;
                justify-content: center;
                margin-top: 10px;

                &__more {
                    padding: 5px;
                    outline: none;
                    background: #4E5166;
                    border-radius: 5px;
                    cursor: pointer;
                    border: none;
                    color: floralwhite;
                }
            }

            ul {
                padding: 10px;
            }

            &__item {
                display: flex;
                align-items: center;

                &__right {
                    margin: 10px;

                    &__name {
                        font-weight: bold;
                    }

                    &__message.fromSelf {
                        background-color: #FD2D01;
                        color: white;
                        padding: 5px;
                        border-radius: 10px;
                        -webkit-animation: slide-in-right-message 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                        animation: slide-in-right-message 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                        max-width: 200px;
                        overflow-wrap: break-word;
                        margin: 0;
                    }

                    &__message.fromUser {
                        background-color: #DBDBDB;
                        color: black;
                        padding: 5px;
                        border-radius: 10px;
                        -webkit-animation: slide-in-left-message 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                        animation: slide-in-left-message 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                        max-width: 200px;
                        overflow-wrap: break-word;
                        margin: 0;
                    }
                }
            }

            &__item.fromSelf {
                display: flex;
                flex-direction: row-reverse;
                justify-content: end;
            }

        }

        &__bottom {
            width: 100%;
            position: fixed;
            background: linear-gradient(90deg, #FFFFFF, transparent);
            padding: 5px;

        }
    }

    &__bottom {
        &__input {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 5px;
            border-top: 1px solid #DBDBDB;
            border-radius: 0 0 5px 5px;
            background-color: floralwhite;

            &__text {
                background-color: #FFFFFF;
                // width: 94%;
                width: 100%;
                display: block;
                overflow: hidden;
                resize: none;
                border: 1px solid #DBDBDB;
                border-radius: 5px;
                padding: 0px 7px 0px 7px;
                color: rgb(0, 0, 0);

                &:focus-visible {
                    outline: none;
                }

                &::placeholder {
                    color: #DBDBDB;
                }
            }

            button {
                border: none;
                background-color: #FFFFFF;
                cursor: pointer;
                transition: all 0.4s;

                &:hover {
                    color: #FD2D01;
                }
            }
        }
    }
}
</style>