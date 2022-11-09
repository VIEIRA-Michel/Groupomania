<script setup lang="ts">

// On récupère les propriétés passées de l'élément parent et on définit leurs types
const props = defineProps<{
    key: any,
    user: any,
    selected: any,
}>();

// On définit le nom de l'évènement que l'on souhaite communiquer à l'élément parent afin qu'il déclenche l'action en lien avec cette évènement
const emit = defineEmits<{
    (e: 'select'): any;
}>();
</script>
<template>
    <div @click="emit('select')" class="container-left__list__item">
        <div class="container-left__list__item__left">
            <img :src="props.user.picture" alt="avatar" />
            <div v-if="props.user.connected" class="online">
                <div></div>
            </div>
            <div v-else class="offline">
                <div></div>
            </div>
        </div>
        <div class="container-left__list__item__right">
            <div class="container-left__list__item__right__name">
                {{ props.user.username }}
            </div>
        </div>
        <div class="container-left__list__item__status">
            <div class="container-left__list__item__status__online">
                <!-- <div v-if="props.user.connected" class="online"></div>
                <div v-else class="offline"></div> -->
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
            border-radius: 10px;;
            cursor: pointer;
            &:hover {
                background-color:#ebe6e2;
            }

            &__left {
                position: relative;

                img {
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .offline {
                    position: absolute;
                    bottom: 4px;
                    right: 0;
                    border: 2px solid #f6f6f6;
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    // background-color: #FD2D01;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    div {
                        border: 2px solid #dbdbdb;
                        border-radius: 50%;
                        padding: 2px;
                        // width: 5px;
                        // height: 5px;
                        background-color: #f6f6f6;
                    }
                }

                .online {
                    position: absolute;
                    bottom: 4px;
                    right: 0;
                    border: 2px solid #f6f6f6;
                    width: 5px;
                    height: 5px;
                    border-radius: 50px;
                    // background-color: #00FF00;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    div {
                        border: 2px solid #3aa55d;
                        border-radius: 50%;
                        padding: 2px;
                        background-color: #3aa55d;
                    }
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

                    // .offline {
                    //     border: 1px solid #DBDBDB;
                    //     width: 10px;
                    //     height: 10px;
                    //     border-radius: 50px;
                    //     background-color: #FD2D01;
                    // }

                    // .online {
                    //     border: 1px solid #DBDBDB;
                    //     width: 10px;
                    //     height: 10px;
                    //     border-radius: 50px;
                    //     background-color: #00FF00;
                    // }
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