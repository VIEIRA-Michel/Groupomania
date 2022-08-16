<template>
    <div class="container-center__top">
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
    </div>
    <div class="container-center__body">
        <div class="container-center__body__chat">
            <ul>
                <li v-for="(message, index) in props.user.messages" :key="index"
                    class="container-center__body__chat__item">
                    <div v-if="displaySender(message, index)" class="container-center__body__chat__item__left">
                        <img :src="props.user.picture" alt="avatar" />
                    </div>
                    <div class="container-center__body__chat__item__right">
                        <div class="container-center__body__chat__item__right__message">
                            {{ message.content }}
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

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import socket from "../socket";
import { useAuthStore } from '@/shared/stores/authStore';
import { useChatStore } from '@/shared/stores/chatStore';
const me = useAuthStore().$state.user;
const chatStore = useChatStore();
const newMessage = ref('');
const props = defineProps<{
    user: any,
    typing: any,
}>();

function displaySender(message: any, index: number) {
    return (
        index === 0 ||
        props.user.messages[index - 1].fromSelf !==
        props.user.messages[index].fromSelf
    );
};
function send() {
    emit('input', newMessage.value);
    newMessage.value = '';
}


watchEffect(() => {
    newMessage.value.length >= 1 ? emit('typing', true) : emit('typing', false);
})

const emit = defineEmits<{
    (e: 'input', input: any): any;
    (e: 'typing', typing: any): any;
}>();

</script>

<style scoped lang="scss">
.container-center {
    small {
        span {
            font-weight: bold;
            color: #FD2D01;
        }
    }

    &__top {
        &__details {
            display: flex;
            flex-direction: row;
            width: 100%;
            margin: auto;
            padding: 5px;

            &__left {
                img {
                    width: 45px;
                    height: 45px;
                    border-radius: 50px;
                    object-fit: cover;
                    background-color: black;
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
    }

    &__body {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: end;

        &__chat {
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
                    margin-left: 10px;

                    &__name {
                        font-weight: bold;
                    }

                    &__message {}
                }
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