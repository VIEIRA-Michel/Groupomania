<script setup lang="ts">
import { computed, ref, onBeforeMount, onMounted, onUnmounted, onActivated } from 'vue';
import NavigationBar from '../components/NavigationBar.vue';
import UserChat from '../components/UserChat.vue';
import MessageChat from "../components/MessageChat.vue";
import { useAuthStore } from '../shared/stores/authStore';
import { useFriendshipStore } from '../shared/stores/friendsStore';
import { useChatStore } from '../shared/stores/chatStore';
import socket from "../socket";

useChatStore().getAllMessages();

const isConnected = computed(() => useAuthStore().$state.isConnected);
const user = computed(() => useAuthStore().$state.user);
const typing = computed(() => useChatStore().$state.typing);
const users = computed(() => useChatStore().$state.users);
const friendsConnected = computed(() => useChatStore().$state.friendsConnected);
const messages = computed(() => useChatStore().$state.messages);
const friends = computed(() => useFriendshipStore().$state.friends);
const selectedUser = ref<any>(null);
const change = ref(false);

function onSelectUser(utilisateur: any) {
    console.log('onselectuser', utilisateur);
    // !selectedUser.value || selectedUser.value.user !== utilisateur.user ?
    //     messages.value.forEach((message: any) => {
    //         message.from == utilisateur.user || message.to == utilisateur.user ? utilisateur.messages.push(message) : "";
    //     }) : "";
    // utilisateur.hasNewMessages = false;
    // change.value = true;
    // setTimeout(() => {
    //     change.value = false;
    //     selectedUser.value = utilisateur;
    // }, 200);
}
function unselect() {
    selectedUser.value = null;
}


function onMessage(content: any) {
    if (selectedUser.value) {
        useChatStore().sendMessage(selectedUser.value.user, content, user.value.user_id);
        socket.emit("private message", {
            content,
            to: selectedUser.value.userID,
        });
        selectedUser.value.messages.push({
            message: content,
            from: user.value.user_id,
            to: selectedUser.value.user,
        });
    }
};

function displayFriends(usersOnline: any) {
    console.log(usersOnline)
    usersOnline.forEach((userOnline: any) => {
        console.log(friendsConnected.value);
        if (friendsConnected.value.length == 0) {
            useChatStore().$patch((state: any) => {
                state.friendsConnected.push(userOnline)
            });
        } else {
            friendsConnected.value.map((friend: any) => {
                console.log(userOnline, friend);
                if (friend.user != userOnline.user) {
                    useChatStore().friendsConnected(userOnline)
                }
            });
        }
    });
}

function checkIsFriend(utilisateur: any) {
    friendsConnected.value.find(friend => friend.user == utilisateur.user) ? "" : friends.value.length > 0 && friends.value.find(friend => friend.user_id === utilisateur.user) ? useChatStore().friendsConnected(utilisateur) : "";
}

function isTyping(param: any) {
    param ? socket.emit('typing', user.value.firstname + ' ' + user.value.lastname) : socket.emit('stoptyping', user.value.firstname + ' ' + user.value.lastname);
};

onBeforeMount(() => {
    useFriendshipStore().getAllFriends().then((response: any) => {
        useChatStore().getUsersConnected().then((response2: any) => {
            displayFriends(response2)

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
            const initReactiveProperties = (utilisateur: any) => {
                utilisateur.connected = true;
                utilisateur.messages = [];
                utilisateur.hasNewMessages = false;
            };
            socket.on("user connected", (utilisateur: any) => {
                console.log('user connected');
                for (let i = 0; i < users.value.length; i++) {
                    const existingUser: any = useChatStore().$state.users[i];
                    if (existingUser.userID === utilisateur.userID) {
                        existingUser.connected = true;
                        return;
                    }
                }
                initReactiveProperties(utilisateur);
                useChatStore().userConnected(utilisateur);
                checkIsFriend(utilisateur);
            });
            socket.on("user disconnected", (id) => {
                console.log('user disconnected');
                let newArray = ref(users.value.filter((utilisateur: any) => utilisateur.userID !== id));
                let newArrayFriend = ref(friendsConnected.value.filter((utilisateur: any) => utilisateur.user !== id));
                useChatStore().$patch((state: any) => {
                    state.users = newArray.value;
                    state.friendsConnected = newArrayFriend.value;
                });
            });
            socket.on("private message", ({ content, from, to }) => {
                for (let i = 0; i < friendsConnected.value.length; i++) {
                    const utilisateur: any = friendsConnected.value[i];
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
        })
    })
});


</script>
<template>
    <div class="container">
        <div :class="[selectedUser ? 'container-left active' : 'container-left']">
            <div class="container-left__title">
                <h1>Amis en ligne ({{ friendsConnected.length }})</h1>
            </div>
            <div class="container-left__list">
                <UserChat v-if="friendsConnected.length > 0" v-for="utilisateur in friendsConnected"
                    :key="utilisateur.userID" :user="utilisateur" :selected="selectedUser === utilisateur"
                    @select="onSelectUser(utilisateur)" />
                <div v-else class="container-left__list__message">
                    <p>Aucun utilisateur en ligne actuellement</p>
                </div>
            </div>
        </div>
        <div v-if="selectedUser != null" :class="[change ? 'container-center active' : 'container-center']">
            <MessageChat v-if="selectedUser != null" :user="selectedUser" :typing="typing" @input="onMessage"
                @typing="isTyping" @read="selectedUser.hasNewMessages = false" @return="unselect" />
        </div>
    </div>
</template>
<style scoped lang="scss">
@import '../styles/Utils/keyframes';

* {
    font-family: 'Lato', sans-serif;
}

.container {
    width: 90%;
    // height: 89vh;
    height: 600px;
    display: flex;
    flex-direction: row;
    margin: 60px auto auto auto;
    justify-content: center;
    transition: all 0.3s ease-in-out;

    @media only screen and (max-width: 768px) {
        width: 100%;
    }


    .container-left {
        width: 30%;
        border-right: 1px solid #DBDBDB;
        border: 1px solid #FD2D01;
        border-radius: 5px;
        margin-right: 10px;
        background-color: #FFFFFF;
        z-index: 2;
        -webkit-animation: slide-in-left 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        animation: slide-in-left 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;

        &__title {
            font-weight: bold;
            font-size: 20px;
            display: flex;
            justify-content: center;
            margin-top: 20px;
        }

        &__list {
            border-radius: 5px 5px 0 0;
            margin-top: 20px;

            &__message {
                text-align: center;
            }

            @media only screen and (max-width: 768px) {
                width: 100%;
            }

            &__item {
                @media only screen and (max-width: 768px) {
                    display: flex;
                    justify-content: center;
                }
            }
        }

        &.active {
            -webkit-animation: slide-in-right 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
            animation: slide-in-right 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;

            @media only screen and (max-width: 768px) {
                display: none;
            }

        }

        @media only screen and (max-width: 768px) {
            z-index: 0;
            margin-right: 0;
            width: 90%;
        }
    }


    .container-center {
        width: 50%;
        background: #FFFFFF;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border: 1px solid #FD2D01;
        border-radius: 5px;
        margin-right: 10px;
        z-index: 1;
        -webkit-animation: slide-in-left 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.3s both;
        animation: slide-in-left 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.3s both;

        @media only screen and (max-width: 768px) {
            width: 90%;
            margin-right: 0;
            z-index: 0;
            -webkit-animation: slide-in-left 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
            animation: slide-in-left 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        }

        &.active {
            width: 50%;
            background: #FFFFFF;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border: 1px solid #FD2D01;
            border-radius: 5px;
            margin-right: 10px;
            z-index: 1;
            -webkit-animation: slide-out-right 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
            animation: slide-out-right 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
        }
    }
}
</style>