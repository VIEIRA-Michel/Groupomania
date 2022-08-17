<template>
    <div @click="emit('select')" class="container-left__list__item">
        <div class="container-left__list__item__left">
            <img :src="props.user.picture" alt="avatar" />
        </div>
        <div class="container-left__list__item__right">
            <div class="container-left__list__item__right__name">
                {{ props.user.username }}
            </div>
            <div class="container-left__list__item__right__status">
                <div class="container-left__list__item__right__status__online">
                    <div v-if="props.user.connected" class="online"></div>
                    <div v-else class="offline"></div>
                </div>
            </div>
        </div>
        <div v-if="props.user.hasNewMessages" class="container-left__list__item__new-messages">!</div>
    </div>
</template>

<script setup lang="ts">
import { watchEffect, computed } from 'vue';
import { useChatStore } from '../shared/stores/chatStore';
const chatStore = useChatStore();
const users = computed(() => chatStore.$state.users);
const props = defineProps<{
    key: any,
    user: any,
    selected: any,
}>();

const emit = defineEmits<{
    (e: 'select'): any;
}>();
</script>

<style lang="scss">
.container-left {
    &__list {
        &__item {
            display: flex;
            margin: 5px;
            flex-direction: row;
            align-items: center;
            justify-content: start;
            border-bottom: 1px solid #DBDBDB;
            background-color: #FFFFFF;
            transition: all 0.4s;

            &:hover {
                background-color: #DBDBDB;
            }

            &__left {
                img {
                    width: 45px;
                    height: 45px;
                    border-radius: 50px;
                    object-fit: cover;
                    background-color: black;
                }

                margin-right: 10px;
            }

            &__right {
                &__name {
                    font-weight: bold;
                }

                &__status {
                    &__online {
                        .offline {
                            border: 1px solid #DBDBDB;
                            position: absolute;
                            left: 30px;
                            width: 10px;
                            height: 10px;
                            border-radius: 50px;
                            background-color: #FD2D01;
                        }

                        .online {
                            border: 1px solid #DBDBDB;
                            position: absolute;
                            left: 30px;
                            width: 10px;
                            height: 10px;
                            border-radius: 50px;
                            background-color: #00FF00;
                        }
                    }
                }
            }

            &__new-messages {
                width: 20px;
                height: 20px;
                border-radius: 5px;
                background-color: #FD2D01;
                text-align: center;
                padding: 2px;
                color: white;
                margin-left: 10px;
            }
        }
    }
}
</style>