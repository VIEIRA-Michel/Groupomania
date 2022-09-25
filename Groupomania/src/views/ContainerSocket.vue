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

const user = computed(() => useAuthStore().$state.user);
const isConnected = computed(() => useAuthStore().isConnected);
const loading = computed(() => useOtherStore().$state.loading);

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
                                    useChatStore().onUserConnnected(args[0])
                                    break;
                                case 'user disconnected':
                                    useChatStore().onUserDisconnected(args[0]);
                                    break;
                                case 'private message':
                                    useChatStore().onPrivateMessage(args[0]);
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
                                || event == 'friendRequest accepted' && args[0].response.data.results[0].user_id_sender == user.value.user_id
                                || event == 'private message' && args[0].to == user.value.userID) {
                                useOtherStore().notificationPush(event, args[0]);
                            }
                        });
                    })
                });
            });
        });
    };
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
</template>

<style>

</style>