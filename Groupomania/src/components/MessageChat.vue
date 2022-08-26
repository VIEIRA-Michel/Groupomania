<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue';
import { useAuthStore } from '@/shared/stores/authStore';
import { useOtherStore } from '@/shared/stores/otherStore';

const display = computed(() => useOtherStore().$state.information)

const newMessage = ref('');
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
    if (props.user.hasNewMessages) {
        setTimeout(() => {
            msgDom.value[0].scrollTop = msgDom.value[0].scrollHeight;
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
        <div class="container-center__top__information" @click="useOtherStore().toggleInformation">
            <div class="container-center__top__information__button">
                <fa icon="fa-solid fa-circle-info" />
            </div>
        </div>
        <div v-if="display" class="container-center__top__user">
            <div class="container-center__top__user__description">
                <div class="container-center__top__user__description__birthday"></div>
                <div class="container-center__top__user__description__createdat"></div>
                <div class="container-center__top__user__description__friendsince"></div>
                <div class="container-center__top__user__description__friendlist"></div>
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
                        <!-- <img v-if="message.from == useAuthStore().$state.user.user_id"
                            :src="useAuthStore().$state.user.picture_url" alt="avatar" />
                        <img v-else :src="props.user.picture" alt="avatar" /> -->
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
            -webkit-animation: slide-in-top-information 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
            animation: slide-in-top-information 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;

            &__description {}
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