<script setup lang="ts">
import { computed, ref, onBeforeMount, onUnmounted } from 'vue';
import { useAuthStore } from '@/shared/stores/authStore';
import { usePublicationsStore } from '@/shared/stores/publicationsStore';
import { useChatStore } from '@/shared/stores/chatStore';
import { useFriendshipStore } from '@/shared/stores/friendsStore';
import Loading from '@/components/Loading.vue';
import socket from '@/socket';
import { useOtherStore } from '@/shared/stores/otherStore';

const user = computed(() => useAuthStore().$state.user);
const isConnected = computed(() => useAuthStore().isConnected);
const users = computed(() => useChatStore().$state.users);
const selectedUser = computed(() => useChatStore().$state.selectedUser);
const loading = computed(() => useOtherStore().$state.loading);
const numberOfPages = computed(() => usePublicationsStore().$state.numberOfPages);
const numOfResults = computed(() => usePublicationsStore().$state.numOfResults);
const publications = computed(() => usePublicationsStore().$state.publications);

let page = ref(1);

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
                            users.value.forEach((utilisateur: any) => {
                                utilisateur.self ? utilisateur.connected = true : "";
                            });
                        });
                        socket.on("disconnect", () => {
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
                        });
                        socket.on("user connected", (utilisateur: any) => {
                            for (let i = 0; i < users.value.length; i++) {
                                const existingUser: any = useChatStore().$state.users[i];
                                if (existingUser.userID === utilisateur.userID) {
                                    existingUser.connected = true;
                                    return;
                                }
                            }
                            initReactiveProperties(utilisateur);
                            useChatStore().userConnected(utilisateur);
                        });
                        socket.on("user disconnected", (id) => {
                            useChatStore().$patch((state: any) => {
                                state.users.forEach((utilisateur: any) => {
                                    if (utilisateur.userID === id) {
                                        utilisateur.connected = false;
                                    }
                                });
                            });
                        });
                        socket.on("private message", ({ from, id, message, to }) => {
                            useChatStore().$patch((state: any) => {
                                useChatStore().$state.users.map((utilisateur: any) => {
                                    console.log(utilisateur.userID);
                                    if (utilisateur.userID == from) {
                                        state.messages.push({
                                            from: utilisateur.user,
                                            id,
                                            message,
                                            to: user.value.user_id,
                                        });
                                        utilisateur.messages.push({
                                            from: utilisateur.user,
                                            id,
                                            message,
                                            to: user.value.user_id,
                                        });
                                        // selectedUser.value ?
                                        if (utilisateur !== selectedUser) {
                                            // 
                                            utilisateur.hasNewMessages = true;
                                        }
                                        return utilisateur;
                                    }
                                })
                            })
                        })
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
                                if (state.publications.length == 5) {
                                    state.cache.unshift(state.publications.pop());
                                }
                                if (state.numOfResults == undefined || state.numOfResults == NaN) {
                                    state.numOfResults = 0;
                                }
                                state.numOfResults += 1;
                                state.publications.unshift(data._value);
                                if (state.numberOfPages == undefined || state.numberOfPages == NaN) {
                                    state.numberOfPages = 1;
                                }
                                state.numberOfPages = Math.floor(state.numOfResults / 5 - 0.2) + 1;
                                if (state.page == undefined || state.page == NaN) {
                                    state.page = 1;
                                }
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
                            usePublicationsStore().getNumberOfPublications(user.value.user_id).then((response: any) => {
                                usePublicationsStore().$patch((state: any) => {
                                    state.numOfResults = response.data.qty;
                                    state.numberOfPages = Math.floor(state.numOfResults / 5 - 0.2) + 1;
                                })
                                let newValue = ref(0);
                                page.value < usePublicationsStore().$state.numberOfPages ? newValue.value = page.value + 1 : newValue.value = page.value;
                                if (usePublicationsStore().$state.cache.length > 0) {
                                    usePublicationsStore().$patch((state: any) => {
                                        state.publications.map((item: any) => {
                                            if (item.publication_id == data) {
                                                state.publications.splice(state.publications.indexOf(item), 1);
                                                let tmp = ref(state.cache.shift());
                                                state.publications.find((item: any) => item.publication_id == tmp._value.publication_id) ? "" : state.publications.push(tmp._value);
                                            }
                                        })
                                    })
                                } else {
                                    usePublicationsStore().fetchAllPublication(newValue.value, true).then((response: any) => {
                                        usePublicationsStore().$patch((state: any) => {
                                            state.publications.map((item: any) => {
                                                if (item.publication_id == data) {
                                                    state.publications.splice(state.publications.indexOf(item), 1);
                                                }
                                            });
                                            state.cache.map((item: any) => {
                                                if (item.publication_id == data) {
                                                    state.cache.splice(state.cache.indexOf(item), 1);
                                                }
                                            })
                                            if (state.numberOfPages != 1 && state.publications.length == 0) {
                                                state.page -= 1;
                                            } else if (state.numberOfPages != 1 && state.publications.length != 5) {
                                                state.publications.push(state.cache.shift());
                                            };
                                        });
                                    });
                                }
                            });
                        });
                        socket.on('has commented', (data: any) => {
                            usePublicationsStore().$patch((state: any) => {
                                state.publications.map((item: any) => {
                                    if (item.publication_id == data._value.publication_id) {
                                        item.comments.unshift(data._value);
                                        item.comments.pop();
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
                        socket.on('friendRequest sended', (data) => {
                            useFriendshipStore().$patch((state: any) => {
                                if (state.requests.find((item: any) => item.sender == data.sender)) {
                                    return;
                                } else {
                                    state.requests.push(data);
                                }
                                state.isLoading = false;
                            });
                        });
                        socket.on('friendRequest refused', (data) => {
                            useFriendshipStore().$patch((state: any) => {
                                if (state.invitSendedTo.length > 0) {
                                    state.invitSendedTo.map((item: any) => {
                                        if (item.id == data) {
                                            state.invitSendedTo.splice(state.invitSendedTo.indexOf(item), 1);

                                        }
                                    })
                                }
                                if (state.searchResults.length > 0) {
                                    state.searchResults.map((item: any) => {
                                        console.log(item);
                                        if (item.user_id == data) {
                                            item.pending = false;
                                            item.isFriend = false;

                                        }
                                    })
                                }

                                state.isLoading = false;
                            })
                        })

                        socket.on('friendRequest accepted', (data) => {
                            useFriendshipStore().$patch((state: any) => {
                                if (state.invitSendedTo.length > 0) {
                                    state.invitSendedTo.map((item: any) => {
                                        if (item.id == data.data.results[0].user_id_recipient) {
                                            state.invitSendedTo.splice(state.invitSendedTo.indexOf(item), 1);

                                        }
                                    })
                                }
                                if (state.searchResults.length > 0) {
                                    state.searchResults.map((item: any) => {
                                        if (item.user_id == data.data.results[0].user_id_recipient) {
                                            item.pending = false;
                                            item.isFriend = true;

                                        }
                                    })
                                }
                                let newFriend = ref({
                                    user_id: data.data.results[0].id,
                                    firstname: data.data.results[0].firstname,
                                    lastname: data.data.results[0].lastname,
                                    picture_url: data.data.results[0].picture_url,
                                })
                                state.friends.push(newFriend.value);
                                state.isLoading = false;
                            })
                        })

                        socket.on('friend removed', (data) => {
                            useFriendshipStore().$patch((state: any) => {
                                if (state.friends.length > 0) {
                                    state.friends.map((item: any) => {
                                        console.log(item);
                                        if (item.user_id == data) {
                                            state.friends.splice(state.friends.indexOf(item), 1);
                                        }
                                    })
                                }
                                if (state.searchResults.length > 0) {
                                    state.searchResults.map((item: any) => {
                                        if (item.user_id == data) {
                                            item.isFriend = false;
                                        }
                                    })
                                }
                                state.isLoading = false;
                            })
                        })

                        socket.on('friendRequest canceled', (data) => {
                            useFriendshipStore().$patch((state: any) => {
                                if (state.requests.length > 0) {
                                    state.requests.map((item: any) => {
                                        if (item.sender == data) {
                                            state.requests.splice(state.requests.indexOf(item), 1);
                                        }
                                    })
                                }
                                state.isLoading = false;
                            })
                        })

                        socket.on('update profil', (data) => {
                            useFriendshipStore().$patch((state: any) => {
                                if (state.friends.length > 0) {
                                    state.friends.map((item: any) => {
                                        if (item.user_id == data.data[0].id) {
                                            item.picture_url = data.data[0].picture_url;
                                        }
                                        return item;
                                    })
                                }
                                if (state.searchResults.length > 0) {
                                    state.searchResults.map((item: any) => {
                                        if (item.user_id == data.data[0].id) {
                                            item.picture_url = data.data[0].picture_url;
                                        }
                                        return item;
                                    })
                                }
                                if (state.invitSendedTo.length > 0) {
                                    state.invitSendedTo.map((item: any) => {
                                        if (item.id == data.data[0].id) {
                                            item.picture_url = data.data[0].picture_url;
                                        }
                                        return item;
                                    })
                                }
                                if (state.requests.length > 0) {
                                    state.requests.map((item: any) => {
                                        if (item.sender == data.data[0].id) {
                                            item.picture_url = data.data[0].picture_url;
                                        }
                                        return item;
                                    })
                                }
                            })
                            useChatStore().$patch((state: any) => {
                                if (state.users.length > 0) {
                                    state.users.map((item: any) => {
                                        if (item.user == data.data[0].id) {
                                            item.picture = data.data[0].picture_url;
                                        }
                                        return item;
                                    })
                                }
                            })
                            usePublicationsStore().$patch((state: any) => {
                                if (state.publications.length > 0) {
                                    state.publications.map((item: any) => {
                                        if (item.user_id == data.data[0].id) {
                                            item.picture_url = data.data[0].picture_url;
                                        }
                                        if (item.comments.length > 0) {
                                            item.comments.map((com: any) => {
                                                console.log(com.user_id);
                                                console.log(data.data[0].id);
                                                if (com.user_id == data.data[0].id) {
                                                    com.picture_url = data.data[0].picture_url;
                                                }
                                                return com;
                                            })
                                        }
                                        return item;
                                    })
                                    state.publications.map((item: any) => {
                                        return item;
                                    })
                                }
                            })
                        })
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