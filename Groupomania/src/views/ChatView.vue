<script setup lang="ts">
import { computed, ref, onBeforeMount, onUnmounted } from 'vue';
import NavigationBar from '../components/NavigationBar.vue';
import userChat from '../components/userChat.vue';
import ProfileChat from '../components/ProfileChat.vue';
import MessageChat from "../components/MessageChat.vue";
import { useAuthStore } from '../shared/stores/authStore';
import { useFriendshipStore } from '../shared/stores/friendsStore';
import { useChatStore } from '../shared/stores/chatStore';
import socket from "../socket";

useAuthStore().getMyInformations();
useAuthStore().$state.isConnected == false ? logout() : "";
useChatStore().getAllMessages();

const isConnected = computed(() => useAuthStore().$state.isConnected);
const user = computed(() => useAuthStore().$state.user);
const typing = computed(() => useChatStore().$state.typing);
const users = computed(() => useChatStore().$state.users);
const friendsConnected = computed(() => useChatStore().$state.friendsConnected);
const messages = computed(() => useChatStore().$state.messages);
const friends = computed(() => useFriendshipStore().$state.friends);
const selectedUser = ref<any>(null);
const newUserSelected = ref<any>(null);
const change = ref(false);


function logout() {
    useAuthStore().logout();
    window.location.href = '/';
}

function onSelectUser(utilisateur: any) {
    !selectedUser.value || selectedUser.value.user !== utilisateur.user ?
        messages.value.forEach((message: any) => {
            message.from == utilisateur.user || message.to == utilisateur.user ? utilisateur.messages.push(message) : "";
        }) : "";
    utilisateur.hasNewMessages = false;
    change.value = true;
    setTimeout(() => {
        change.value = false;
        selectedUser.value = utilisateur;
    }, 500);
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

function isTyping(param: any) {
    param ? socket.emit('typing', user.value.firstname + ' ' + user.value.lastname) : socket.emit('stoptyping', user.value.firstname + ' ' + user.value.lastname);
};

function displayFriends(usersOnline: any) {
    usersOnline.forEach((userOnline: any) => {
        friends.value.forEach((friend: any) => {
            friend.user_id == userOnline.user ? useChatStore().friendsConnected(userOnline) : "";
        });
    });
}

function checkIsFriend(utilisateur: any) {
    friendsConnected.value.find(friend => friend.user == utilisateur.user) ? "" : friends.value.length > 0 && friends.value.find(friend => friend.user_id === utilisateur.user) ? useChatStore().friendsConnected(utilisateur) : "";
}

onBeforeMount(() => {
    useFriendshipStore().getAllFriends().then((response) => {
        if (isConnected.value) {
            const session = JSON.parse(localStorage.getItem("user"));
            if (session) {
                socket.auth = { username: session.firstname + ' ' + session.lastname, picture: session.picture_url, user: session.user_id, sessionID: session.session_id };
                socket.connect();
            }
            socket.on("session", ({ sessionID, userID }) => {
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
                displayFriends(currentUserConnected);
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
                checkIsFriend(utilisateur);
            });
            socket.on("user disconnected", (id) => {
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
        }
    });
});

onUnmounted(() => {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("users");
    socket.off("user connected");
    socket.off("user disconnected");
    socket.off("private message");
})

</script>
<template>
    <NavigationBar :user="user" :isConnected="isConnected" @logout="logout()" />
    <div class="container">
        <div :class="[selectedUser ? 'container-left active' : 'container-left']">
            <div class="container-left__list">
                <userChat v-if="friendsConnected.length > 0" v-for="utilisateur in friendsConnected"
                    :key="utilisateur.userID" :user="utilisateur" :selected="selectedUser === utilisateur"
                    @select="onSelectUser(utilisateur)" />
                <div v-else class="container-left__list__message">
                    <p>Aucun utilisateur en ligne actuellement</p>
                </div>
            </div>
        </div>
        <div v-if="selectedUser != null"
            :class="[change ? 'container-center-active' : 'container-center']">
            <MessageChat v-if="selectedUser != null" :user="selectedUser" :typing="typing" @input="onMessage"
                @typing="isTyping" @read="selectedUser.hasNewMessages = false"/>
        </div>
        <div v-if="selectedUser != null"
            :class="[change ? 'container-right-active' : 'container-right']">
            <ProfileChat v-if="selectedUser != null" :user="selectedUser" />
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
    height: 89vh;
    display: flex;
    flex-direction: row;
    margin: 60px auto auto auto;
    justify-content: center;
    transition: all 0.3s ease-in-out;


    .container-left {
        width: 30%;
        border-right: 1px solid #DBDBDB;
        border: 1px solid #FD2D01;
        border-radius: 5px;
        margin-right: 10px;
        background-color: #FFFFFF;
        z-index: 2;

        &__list {
            border-radius: 5px 5px 0 0;

            &__message {
                text-align: center;
            }
        }

        &.active {
            -webkit-animation: slide-in-right 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
            animation: slide-in-right 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
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

        &-active {
            width: 50%;
            background: #FFFFFF;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border: 1px solid #FD2D01;
            border-radius: 5px;
            margin-right: 10px;
            z-index: 1;
            -webkit-animation: slide-out-right 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) 0.3s both;
            animation: slide-out-right 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) 0.3s both;
        }
    }

    .container-right {
        background-color: #FFFFFF;
        display: flex;
        flex-direction: column;
        width: 20%;
        border-left: 1px solid #DBDBDB;
        border: 1px solid #FD2D01;
        border-radius: 5px;
        -webkit-animation: slide-in-left 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.6s both;
        animation: slide-in-left 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.6s both;
        z-index: 0;

        &-active {
            display: flex;
            flex-direction: column;
            width: 20%;
            border-radius: 5px;
            z-index: 0;
            -webkit-animation: slide-out-right 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
            animation: slide-out-right 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
        }
    }
}
</style>