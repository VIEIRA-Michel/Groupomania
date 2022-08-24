<script setup lang="ts">
import { computed, ref, onBeforeMount, onUnmounted } from 'vue';
import NavigationBar from '../components/NavigationBar.vue';
import userChat from '../components/userChat.vue';
import { useAuthStore } from '../shared/stores/authStore';
import { useFriendshipStore } from '../shared/stores/friendsStore';
import { useChatStore } from '../shared/stores/chatStore';
import socket from "../socket";
import MessageChat from "../components/MessageChat.vue";

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

function logout() {
    useAuthStore().logout();
    window.location.href = '/';
}

function onSelectUser(utilisateur: any) {
    !selectedUser.value || selectedUser.value.user !== utilisateur.user ?
        messages.value.forEach((message: any) => {
            message.from == utilisateur.user || message.to == utilisateur.user ? utilisateur.messages.push(message) : "";
        }) : "";
    selectedUser.value = utilisateur;
    utilisateur.hasNewMessages = false;
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
    <div>
        <NavigationBar :user="user" :isConnected="isConnected" @logout="logout()" />
    </div>
    <div class="container">
        <div class="container-left">
            <div class="container-left__settings"></div>
            <div class="container-left__list">
                <userChat v-if="friendsConnected.length > 0" v-for="utilisateur in friendsConnected"
                    :key="utilisateur.userID" :user="utilisateur" :selected="selectedUser === utilisateur"
                    @select="onSelectUser(utilisateur)" />
                <div v-else class="container-left__list__message">
                    <p>Il n'y a aucun utilisateur en ligne pour le moment</p>
                </div>
            </div>
        </div>
        <div class="container-center">
            <MessageChat v-if="selectedUser != null" :user="selectedUser" :typing="typing" @input="onMessage"
                @typing="isTyping" />
        </div>
        <div class="container-right">
            <div class="container-right__profil">
                <div class="container-right__profil__details">
                    <div class="container-right__profil__details__avatar">
                        <img src="https://media.lesechos.com/api/v1/images/view/5f3f5be68fe56f0be8160fab/1280x720/0603734518167-web-tete.jpg"
                            alt="avatar" />
                    </div>
                    <div class="container-right__profil__details__name">
                        <span>Elon Musk</span>
                    </div>
                    <div class="container-right__profil__details__status">
                        <div class="container-right__profil__details__status__text">
                            <p>" Je pense que les gens ordinaires peuvent choisir d’être extraordinaires. "</p>
                        </div>
                    </div>
                    <div class="container-right__profil__details__informations">
                        <div class="container-right__profil__details__informations__birthday">
                            <div class="container-right__profil__details__informations__birthday__icon">
                                <fa icon="fa-solid fa-birthday-cake" />
                            </div>
                            <div class="container-right__profil__details__informations__birthday__text">
                                <span> 28 Juin</span>
                            </div>
                        </div>
                        <div class="container-right__profil__details__informations__registered-since">
                            <div class="container-right__profil__details__informations__registered-since__icon">
                                <fa icon="fa-solid fa-pencil" />
                            </div>
                            <div class="container-right__profil__details__informations__registered-since__text">
                                <span> Inscrit depuis le 10 août 2022 </span>
                            </div>
                        </div>
                        <div class="container-right__profil__details__informations__email">
                            <div class="container-right__profil__details__informations__email__icon">
                                <fa icon="fa-solid fa-envelope" />
                            </div>
                            <div class="container-right__profil__details__informations__email__text">
                                <span> elonmusk@spacex.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.container {
    width: 100%;
    background: #FFFFFF;
    display: flex;
    flex-direction: row;

    .container-left {
        width: 30%;
        border-right: 1px solid #DBDBDB;

        &__list {
            &__message {
                text-align: center;
            }
        }
    }

    .container-center {
        width: 50%;
        background: #FFFFFF;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .container-right {
        display: flex;
        flex-direction: column;
        width: 20%;
        border-left: 1px solid #DBDBDB;

        &__profil {
            display: flex;
            flex-direction: column;

            &__details {
                width: 100%;
                display: flex;
                flex-direction: column;

                &__avatar {
                    display: flex;
                    justify-content: center;
                    margin-top: 10px;

                    img {
                        width: 45px;
                        height: 45px;
                        object-fit: cover;
                        background-color: black;
                        border-radius: 50px;
                    }
                }

                &__name {
                    font-weight: bold;
                    display: flex;
                    justify-content: center;
                    font-size: 1.4em;
                    margin-bottom: 10px;
                }

                &__status {
                    &__text {
                        p {
                            text-align: center;
                            font-size: 1em;
                            font-style: italic;
                            margin-bottom: 15px;
                        }
                    }
                }

                &__informations {
                    &__birthday {
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        margin-bottom: 15px;

                        &__icon {}

                        &__text {}
                    }

                    &__registered-since {
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        margin-bottom: 15px;

                        &__icon {}

                        &__text {}
                    }

                    &__email {
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        margin-bottom: 15px;

                        &__icon {}

                        &__text {}
                    }
                }
            }
        }
    }
}
</style>