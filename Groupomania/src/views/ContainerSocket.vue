<script setup lang="ts">
import { computed, ref, onBeforeMount, onUnmounted, watch } from 'vue';
import { useAuthStore } from '@/shared/stores/authStore';
import { usePublicationsStore } from '@/shared/stores/publicationsStore';
import { useChatStore } from '@/shared/stores/chatStore';
import { useFriendshipStore } from '@/shared/stores/friendsStore';
import Loading from '@/components/Loading.vue';
import socket from '@/socket';
import { useOtherStore } from '@/shared/stores/otherStore';
import { useCommentsStore } from '@/shared/stores/commentsStore';
import { router } from '@/router';

const user = computed(() => useAuthStore().$state.user);
const isConnected = computed(() => useAuthStore().isConnected);
const loading = computed(() => useOtherStore().$state.loading);
const messages = computed(() => useChatStore().$state.messagesToDisplay);

function redirect(user_id: number) {
    router.push({ name: 'chat' });
    useChatStore().selectedUser(user_id);
}

onBeforeMount(() => {
    if (isConnected.value) {
        useFriendshipStore().checkRequestsSended().then((response: any) => {
            useFriendshipStore().getRequests().then((response: any) => {
                useFriendshipStore().getAllFriends().then((response) => {
                    const session = JSON.parse(localStorage.getItem("user"));
                    if (session) {
                        socket.auth = { username: session.firstname + ' ' + session.lastname, picture: session.picture_url, user: session.user_id, sessionID: session.session_id };
                        socket.connect();
                    }
                    socket.on("session", ({ sessionID, userID }) => {
                        socket.auth = { sessionID };
                        socket.userID = userID;
                    });
                    useChatStore().getUsersConnected().then((response2: any) => {
                        useOtherStore().loadedResources();

                        socket.onAny((event: string, ...args: any) => {
                            switch (event) {
                                case 'typing':
                                    useChatStore().onTyping(true, args[0]);
                                    break;
                                case 'stoptyping':
                                    useChatStore().onTyping(false);
                                    break;
                                case 'user connected':
                                    useChatStore().onUserConnnected(args[0]);
                                    break;
                                case 'user disconnected':
                                    useChatStore().onUserDisconnected(args[0]);
                                    break;
                                case 'private message':
                                    if (messages.value.length !== 0) {
                                        useChatStore().removeMessageAtDisplay().then(() => {
                                            useChatStore().onPrivateMessage(args[0])
                                        });
                                    } else {
                                        useChatStore().onPrivateMessage(args[0])
                                    }
                                    break;
                                case 'like':
                                    usePublicationsStore().onLike(args[0]);
                                    break;
                                case 'remove like':
                                    usePublicationsStore().onRemoveLike(args[0]);
                                    break;
                                case 'new publication':
                                    usePublicationsStore().onNewPublication(args[0]);
                                    break;
                                case 'edit publication':
                                    usePublicationsStore().onEditPublication(args[0]);
                                    break;
                                case 'delete publication':
                                    usePublicationsStore().onDeletePublication(args[0]);
                                    break;
                                case 'has commented':
                                    useCommentsStore().onComment(args[0]);
                                    break;
                                case 'delete comment':
                                    useCommentsStore().onDeleteComment(args[0]);
                                    break;
                                case 'friendRequest sended':
                                    useFriendshipStore().onFriendRequestSended(args[0]);
                                    break;
                                case 'friendRequest refused':
                                    useFriendshipStore().onFriendRequestRefused(args[0]);
                                    break;
                                case 'friendRequest accepted':
                                    useFriendshipStore().onFriendRequestAccepted(args[0]);
                                    break;
                                case 'friend removed':
                                    useFriendshipStore().onFriendRemoved(args[0]);
                                    break;
                                case 'friendRequest canceled':
                                    useFriendshipStore().onFriendRequestCanceled(args[0]);
                                    break;
                                case 'update profil':
                                    useAuthStore().onUpdateProfile(args[0]);
                                    break;
                                default:
                                    console.log(`Sorry, we are out of ${event}.`);
                            }
                            if (event == 'like' && args[0].publication.user_id == user.value.user_id
                                || event == 'has commented' && args[0].comment.user_id == user.value.user_id
                                || event == 'friendRequest sended' && args[0].request.recipient == user.value.user_id
                                || event == 'friendRequest accepted' && args[0].response.data.results[0].user_id_sender == user.value.user_id) {
                                useOtherStore().notificationPush(event, args[0])
                            } else if (event == 'remove like' && args[0].publication.user_id == user.value.user_id
                                || event == 'delete comment' && args[0].comment.user_id
                                || event == 'friendRequest canceled' && args[0].request.user_id == user.value.user_id
                                || event == 'friend removed' && args[0].target.user_id == user.value.user_id) {
                                useOtherStore().notificationRemove(event, args[0])
                            }
                        })
                    })
                })
            })
        })
    }
});

onUnmounted(() => {
    useAuthStore().logout()
    socket.off("connect");
    socket.off("disconnect");
    socket.off("users");
    socket.off("user connected");
    socket.off("user disconnected");
    socket.off("private message");
    socket.off("friendRequest sended");
    socket.off("friendRequest refused");
    socket.off("friendRequest accepted");
    socket.off("friend removed");
    socket.off("friendRequest canceled");
    socket.disconnect();
    console.log('unmounted');
});
</script>

<template>
    <Loading v-if="loading" />
    <router-view v-else>
    </router-view>
    <div class="notification-container">
        <div class="notification-container__list">
            <div v-for="message in messages" @click="redirect(message.user_id)"
                :class="[message.disapear ? 'notification-container__list__item hidden' : 'notification-container__list__item']">
                <div class="notification-container__list__item__content">
                    <div class="notification-container__list__item__content__avatar">
                        <img :src="message.picture" alt="">
                    </div>
                    <div class="notification-container__list__item__content__body">
                        <div class="notification-container__list__item__content__body__top">
                            <div class="notification-container__list__item__content__body__top__username">
                                {{ message.username}}
                            </div>
                            <div class="notification-container__list__item__content__body__top__date">{{ message.at }}
                            </div>
                        </div>
                        <div class="notification-container__list__item__content__body__bottom">
                            <div class="notification-container__list__item__content__body__bottom__text">
                                <p>{{ message.message }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '../styles/Utils/keyframes';

* {
    font-family: 'Lato', sans-serif;
}

.notification-container {
    position: absolute;
    top: 60px;
    right: 10px;
    width: 250px;
    z-index: 10;
    filter: drop-shadow(0 0 0.75rem #FFFFFF);

    &__list {
        &__item {
            background: floralwhite;
            margin-bottom: 10px;
            border-radius: 5px;
            border: 1px solid #FD2D01;
            -webkit-animation: text-focus-in 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) 0.3s both;
            animation: text-focus-in 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) 0.3s both;
            cursor: pointer;

            &.hidden {
                -webkit-animation: text-blur-out 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
                animation: text-blur-out 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
            }

            &__content {
                display: flex;
                flex-direction: row;

                &__avatar {
                    margin: 5px;
                    display: flex;
                    align-items: center;

                    img {
                        width: 45px;
                        height: 45px;
                        border-radius: 5px;
                        object-fit: cover;
                    }
                }

                &__body {
                    width: 100%;
                    padding: 5px;

                    &__top {
                        display: flex;
                        justify-content: space-between;

                        &__username {
                            font-weight: bold;
                            font-size: 12px;
                        }

                        &__date {
                            color: #FD2D01;
                            font-size: 12px;
                        }
                    }

                    &__bottom {
                        &__text {
                            margin: 5px 0;
                            padding: 5px;
                            background-color: #FFFFFF;
                            border-radius: 5px;
                            font-size: 12px;
                            width: 170px;
                            border: 1px solid #dbdbdb;

                            p {
                                white-space: nowrap;
                                text-overflow: ellipsis;
                                width: 100%;
                                display: block;
                                overflow: hidden;
                            }
                        }
                    }
                }
            }

        }
    }
}
</style>