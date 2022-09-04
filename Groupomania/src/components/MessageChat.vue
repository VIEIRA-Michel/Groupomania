<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue';
import { useAuthStore } from '@/shared/stores/authStore';
import { useFriendshipStore } from '@/shared/stores/friendsStore';

const display = ref(false);
const allow = ref(false);
const user = computed(() => useAuthStore().user);
const friendsOfUser = computed(() => useFriendshipStore().$state.friendsOfUser);
const newMessage = ref('');
const obj = ref({});
let msgDom: any = ref(document.getElementsByClassName('container-center__body'));
const props = defineProps<{
    user: any,
    typing: any
}>();

function displaySender(message: any, index: number) {
    return (
        index === 0 ||
        props.user.messages[index - 1].from !==
        props.user.messages[index].from
    );
};

function displayInformation() {
    allow.value = !allow.value;

    if (allow.value == true) {
        useFriendshipStore().getAllFriends(props.user.user).then((response: any) => {
            display.value = true;
            response.data.results.map((friend: any) => {
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
    } else {
        useFriendshipStore().$patch((state) => {
            state.friendsOfUser = []
        })
        display.value = false;
    }
}
function send() {
    emit('input', newMessage.value);
    newMessage.value = '';
    setTimeout(() => {
        msgDom.value[0].scrollTop = msgDom.value[0].scrollHeight;
    }, 200);
}


watchEffect(() => {
    newMessage.value.length >= 1 ? emit('typing', true) : emit('typing', false);
    console.log(props.user.hasNewMessages);
    setTimeout(() => {
        msgDom.value[0].scrollTop = msgDom.value[0].scrollHeight;
    }, 1);
    if (props.user.hasNewMessages) {
        msgDom.value[0].scrollTop = msgDom.value[0].scrollHeight;
        setTimeout(() => {
        }, 200);
        emit('read');
    }
})

const emit = defineEmits<{
    (e: 'input', input: any): any;
    (e: 'typing', typing: any): any;
    (e: 'read'): any;
    (e: 'return'): any
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
                <img :src="props.user.picture" alt="avatar" />
            </div>
            <div class="container-center__top__details__right">
                <div class="container-center__top__details__right__name">
                    {{ props.user.username }}
                </div>
                <div class="container-center__top__details__right__status">
                    <div class="container-center__top__details__right__status__online">
                        <div v-if="props.user.connected" class="status-online">
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
                <div v-if="obj.birthday" class="container-center__top__user__description__birthday">
                    <fa icon="fa-solid fa-cake-candles" /><span>C'est son anniversaire le {{ obj.birthday }}</span>
                </div>
                <div v-else class="container-center__top__user__description__birthday">
                    <fa icon="fa-solid fa-cake-candles" /><span>Date d'anniversaire masqué</span>
                </div>
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
                                        <div class="friends-list__list__item__name__text__firstname">
                                            <span>{{ friend.firstname }}</span>
                                        </div>
                                        <div class="friends-list__list__item__name__text__lastname">
                                            <span>{{ friend.lastname }}</span>
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
            <ul>
                <li v-for="(message, index) in props.user.messages" :key="index"
                    class="container-center__body__chat__item"
                    v-bind:class="[message.from == useAuthStore().$state.user.user_id ? 'fromSelf' : 'fromUser']">
                    <div v-if="displaySender(message, index)" class="container-center__body__chat__item__left">
                    </div>
                    <div class="container-center__body__chat__item__right">
                        <div class="container-center__body__chat__item__right__message"
                            v-bind:class="[message.from == useAuthStore().$state.user.user_id ? 'fromSelf' : 'fromUser']">
                            {{ message.message }}
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <div class="container-center__body__bottom">
            <div v-if="props.typing" class="container-center__body__bottom__typing">
                <small> <span>{{ props.typing }}</span> est entrain d'écrire</small>
            </div>
        </div>
    </div>
    <div class="container-center__bottom">
        <form class="container-center__bottom__input" @submit.prevent="send()">
            <input type="text" placeholder="Ecrivez votre message..." v-model="newMessage" />
            <button type="submit">
                <fa icon="fa-solid fa-paper-plane" />
            </button>
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
        box-shadow: 0px 1px 8px -3px rgb(0 0 0 / 40%);
        flex-wrap: wrap;

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
        }

        &__user {
            background-color: #FFFFFF;
            width: 100%;
            height: 100%;
            overflow-y: scroll;

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
                    padding-bottom: 20px;
                    box-shadow: 0px 5px 8px -3px rgb(0 0 0 / 40%);
                    border-radius: 0 0 5px 5px;

                    .friends-list {
                        background: #FFFFFF;
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
                            width: 70%;
                            height: 140px;
                            justify-content: space-between;
                            overflow-y: scroll;

                            @media (max-width: 768px) {
                                width: 100%;
                            }

                            &__item {

                                margin: 10px auto;
                                width: 90px;
                                padding: 15px;
                                background: linear-gradient(180deg, #FFD7D7, transparent);
                                border: 1px solid #FD2D01;
                                border-radius: 5px;
                                -webkit-animation: fade-in 1.2s cubic-bezier(0.390, 0.575, 0.565, 1.000) 1.6s both;
                                animation: fade-in 1.2s cubic-bezier(0.390, 0.575, 0.565, 1.000) 1.6s both;

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
                                        width: 50px;
                                        height: 50px;
                                        object-fit: cover;
                                    }
                                }

                                &__name {
                                    &__text {
                                        margin-bottom: 5px;

                                        &__firstname {
                                            display: flex;
                                            justify-content: center;

                                            span {
                                                font-size: 20px;
                                                font-weight: bold;
                                            }
                                        }

                                        &__lastname {
                                            display: flex;
                                            justify-content: center;

                                            span {

                                                font-size: 20px;
                                                font-weight: bold;
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

            ul {
                padding: 10px;
            }

            &__item {
                display: flex;
                align-items: center;

                &__left {
                    img {
                        width: 30px;
                        height: 30px;
                        border-radius: 50px;
                        object-fit: cover;
                        background-color: black;
                    }
                }

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
                    }

                    &__message.fromUser {
                        background-color: #DBDBDB;
                        color: black;
                        padding: 5px;
                        border-radius: 10px;
                        -webkit-animation: slide-in-left-message 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                        animation: slide-in-left-message 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                    }
                }
            }

            &__item.fromSelf {
                display: flex;
                flex-direction: row-reverse;
                justify-content: end;
            }
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
            background-color: #FFFFFF;

            input {
                width: 90%;
                border: none;
                padding: 5px;
                border-radius: 5px;
                background-color: #FFFFFF;

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