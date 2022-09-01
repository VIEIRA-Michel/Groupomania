<script setup lang="ts">
const props = defineProps<{
    key: any,
    user: any,
    selected: any,
}>();
const emit = defineEmits<{
    (e: 'select'): any;
}>();
</script>
<template>
    <div @click="emit('select')" class="container-left__list__item">
        <div class="container-left__list__item__left">
            <img :src="props.user.picture" alt="avatar" />
        </div>
        <div class="container-left__list__item__right">
            <div class="container-left__list__item__right__name">
                {{ props.user.username }}
            </div>
        </div>
        <div class="container-left__list__item__status">
            <div class="container-left__list__item__status__online">
                <div v-if="props.user.connected" class="online"></div>
                <div v-else class="offline"></div>
            </div>
        </div>
        <div v-if="props.user.hasNewMessages" class="container-left__list__item__new-messages">!</div>
    </div>
</template>
<style scoped lang="scss">
@import '../styles/Utils/keyframes';

.container-left {
    &__list {
        &__item {
            display: flex;
            flex-direction: row;
            padding: 5px;
            align-items: center;
            justify-content: start;
            transition: all 0.4s;
            cursor: pointer;

            &:last-child {
                border-radius: 0 0 5px 5px;
            }

            &:first-child {
                border-radius: 5px 5px 0 0;
            }

            &:hover {
                background-color: #F5F5F5;
            }

            &__left {
                img {
                    width: 45px;
                    height: 45px;
                    border-radius: 50px;
                    object-fit: cover;
                }

                margin-right: 10px;
            }

            &__right {
                &__name {
                    font-weight: bold;
                }
            }

            &__status {
                &__online {
                    margin-left: 10px;
                    display: flex;
                    align-items: center;

                    .offline {
                        border: 1px solid #DBDBDB;
                        width: 10px;
                        height: 10px;
                        border-radius: 50px;
                        background-color: #FD2D01;
                    }

                    .online {
                        border: 1px solid #DBDBDB;
                        width: 10px;
                        height: 10px;
                        border-radius: 50px;
                        background-color: #00FF00;
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