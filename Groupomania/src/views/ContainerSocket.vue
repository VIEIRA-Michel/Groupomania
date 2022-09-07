<script setup lang="ts">
import { computed, ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/shared/stores/authStore';
import { usePublicationsStore } from '@/shared/stores/publicationsStore';
import { useChatStore } from '@/shared/stores/chatStore';
import { useFriendshipStore } from '@/shared/stores/friendsStore';
import socket from '@/socket';
const router = useRouter();

const messages = computed(() => useChatStore().$state.messages);
const isConnected = computed(() => useAuthStore().isConnected);
const users = computed(() => useChatStore().$state.users);
const selectedUser = ref<any>(null);
console.log("gfdgfsdg")

onBeforeMount(() => {
    if (isConnected.value) {
        useFriendshipStore().getAllFriends().then((response) => {
            const session = JSON.parse(localStorage.getItem("user"));
            if (session) {
                socket.auth = { username: session.firstname + ' ' + session.lastname, picture: session.picture_url, user: session.user_id, sessionID: session.session_id };
                socket.connect();
            }
            socket.on("session", ({ sessionID, userID }) => {
                console.log('session');
                socket.auth = { sessionID };
                socket.userID = userID;
            });
            socket.on('typing', (data) => {
                useChatStore().$patch((state) => {
                    state.typing = data;
                });
            });
            socket.on('stoptyping', (data) => {
                useChatStore().$patch((state) => {
                    state.typing = false;
                });
            });
            socket.on("connect", () => {
                console.log('connect');
                users.value.forEach((utilisateur: any) => {
                    utilisateur.self ? utilisateur.connected = true : "";
                });
            });
            socket.on("disconnect", () => {
                console.log('disconnect')
                users.value.forEach((utilisateur: any) => {
                    utilisateur.self ? utilisateur.connected = false : "";
                });
            });
            const initReactiveProperties = (utilisateur: any) => {
                utilisateur.connected = true;
                utilisateur.messages = [];
                utilisateur.hasNewMessages = false;
            };
            socket.on("users", (users2) => {
                console.log('users');
                users2.forEach((utilisateur: any) => {
                    for (let i = 0; i < users2.length; i++) {
                        const existingUser = users2[i];
                        if (existingUser.userID === utilisateur.userID) {
                            initReactiveProperties(existingUser);
                            return;
                        }
                    }
                    utilisateur.self = utilisateur.userID === socket.userID;
                    initReactiveProperties(utilisateur);
                });
                users2 = users2.sort((a: any, b: any) => {
                    if (a.self) return -1;
                    if (b.self) return 1;
                    if (a.username < b.username) return -1;
                    return a.username > b.username ? 1 : 0;
                });
                let currentUserConnected = users2.filter((user: any) => user.userID !== socket.userID);
                // displayFriends(currentUserConnected);
            });
            socket.on("user connected", (utilisateur: any) => {
                console.log('user connected');
                console.log(utilisateur);
                for (let i = 0; i < users.value.length; i++) {
                    const existingUser: any = useChatStore().$state.users[i];
                    if (existingUser.userID === utilisateur.userID) {
                        existingUser.connected = true;
                        return;
                    }
                }
                initReactiveProperties(utilisateur);
                useChatStore().userConnected(utilisateur);
                // checkIsFriend(utilisateur);
            });
            socket.on("user disconnected", (id) => {
                console.log('user disconnected');
                let newArray = ref(users.value.filter((utilisateur: any) => utilisateur.userID !== id));
                useChatStore().$patch((state: any) => {
                    state.users = newArray.value
                });
            });
            socket.on("private message", ({ content, from, to }) => {
                for (let i = 0; i < users.value.length; i++) {
                    const utilisateur: any = users.value[i];
                    if (utilisateur.userID === from) {
                        utilisateur.messages.push({
                            message: content,
                            fromSelf: false,
                        });
                        if (utilisateur !== selectedUser) {
                            utilisateur.hasNewMessages = true;
                        }
                        break;
                    }
                }
            });
            socket.on('like', (data) => {
                console.log(data);
                usePublicationsStore().$patch((state: any) => {
                    state.publications.map((item: any) => {
                        if (item.publication_id == data.publication_id) {
                            item.likes.push(data.user_id);
                        }
                        return item;
                    })
                })
            })
            socket.on('remove like', (data) => {
                console.log(data);
                usePublicationsStore().$patch((state: any) => {
                    state.publications.map((item: any) => {
                        if (item.publication_id == data.publication_id) {
                            item.likes = item.likes.filter((like: any) => like != data.user_id);
                        }
                        return item;
                    });
                });
            })
            socket.on('new publication', (data) => {
                usePublicationsStore().$patch((state: any) => {
                    state.publications.unshift(data._value);
                });
            });
            socket.on('edit publication', (data) => {
                usePublicationsStore().$patch((state: any) => {
                    state.publications.map((item: any) => {
                        if (item.publication_id == data.publication_id) {
                            item.content = data.content;
                            item.picture = data.picture;
                            item.updated_at = data.updated_at;
                        }
                        return item;
                    });
                });
            });

            socket.on('delete publication', (data) => {
                usePublicationsStore().$patch((state: any) => {
                    state.publications.map((item: any) => {
                        if (item.publication_id == data) {
                            state.publications.splice(usePublicationsStore().$state.publications.indexOf(item), 1);
                        }
                    });
                });
            });
            socket.on('has commented', (data: any) => {
                usePublicationsStore().$patch((state: any) => {
                    state.publications.map((item: any) => {
                        if (item.publication_id == data._value.publication_id) {
                            item.comments.push(data._value);
                            item.numberOfComments = item.numberOfComments + 1;
                        }
                        return item;
                    });
                });
            });

            socket.on('delete comment', (data: any) => {
                usePublicationsStore().$patch((state: any) => {
                    state.publications.map((item: any) => {
                        if (item.publication_id == data.publication_id) {
                            item.comments = item.comments.filter((itemComment: any) => {
                                return itemComment.comment_id != data.id;
                            });
                            console.log(item);
                            item.numberOfComments = item.numberOfComments - 1;
                        }
                        return item;
                    });
                })
            })
        });
    }
});

</script>

<template>
    <router-view>
    </router-view>
</template>

<style>

</style>