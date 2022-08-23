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
            <!-- <MessageChat v-if="selectedUser != null" :user="selectedUser" @input="onMessage"
                @typing="isTyping" /> -->
        </div>
        <div class="container-right">
            <div class="container-right__profil">
                <div class="container-right__profil__details">
                    <div class="container-right__profil__details__avatar">
                        <img src="https://media.lesechos.com/api/v1/images/view/5f3f5be68fe56f0be8160fab/1280x720/0603734518167-web-tete.jpg"
                            alt="avatar" />
                    </div>
                    <div class="container-right__profil__details__name">
                        <!-- <span>{{ user.firstname + ' ' + user.lastname }}</span> -->
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

<script setup lang="ts">
import { computed, ref, onBeforeMount, onUnmounted } from 'vue';
import NavigationBar from '../components/NavigationBar.vue';
import userChat from '../components/userChat.vue';
import { useAuthStore } from '../shared/stores/authStore';
import { useFriendshipStore } from '../shared/stores/friendsStore';
import { useChatStore } from '../shared/stores/chatStore';
import socket from "../socket";
import MessageChat from "../components/MessageChat.vue";
const authStore = useAuthStore();
const friendshipStore = useFriendshipStore();
const chatStore = useChatStore();
checkIsConnected();
getAllFriends();
chatStore.getAllMessages();

const isConnected = computed(() => authStore.$state.isConnected);
const user = computed(() => authStore.$state.user);
const typing = computed(() => chatStore.$state.typing);
const users = computed(() => chatStore.$state.users);
const friendsConnected = computed(() => chatStore.$state.friendsConnected);
const messages = computed(() => chatStore.$state.messages);
const friends = computed(() => friendshipStore.$state.friends);
const selectedUser = ref<any>(null);

function logout() {
    authStore.logout();
    window.location.href = '/';
}

function checkIsConnected() {
    authStore.getMyInformations();
    if (authStore.$state.isConnected == false) {
        logout();
    }
}

function getAllFriends() {
    friendshipStore.getAllFriends();
}

function onSelectUser(utilisateur: any) {
    if (!selectedUser.value || selectedUser.value.user !== utilisateur.user) {
        messages.value.forEach((message: any) => {
            if (message.from == utilisateur.user || message.to == utilisateur.user) {
                utilisateur.messages.push(message);
            }
        });
    }
    selectedUser.value = utilisateur;
    utilisateur.hasNewMessages = false;
}

function onMessage(content: any) {
    if (selectedUser.value) {
        chatStore.sendMessage(selectedUser.value.user, content, user.value.user_id);
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
    if (param) {
        socket.emit('typing', user.value.firstname + ' ' + user.value.lastname);
    } else {
        socket.emit('stoptyping', user.value.firstname + ' ' + user.value.lastname);
    }
};

function displayFriends(usersOnline: any) {
    setTimeout(() => {
        usersOnline.forEach((userOnline: any) => {
            friends.value.forEach((friend: any) => {
                if (friend.user_id == userOnline.user) {
                    console.log('il est dans mes amis', userOnline);
                    chatStore.friendsConnected(userOnline);
                }
            });
        });
    }, 300);
}

function checkIsFriend(utilisateur: any) {
    if (friendsConnected.value.find(friend => friend.user == utilisateur.user)) {
        return
    }
    else if (friends.value.length > 0 && friends.value.find(friend => friend.user_id === utilisateur.user)) {
        chatStore.friendsConnected(utilisateur);
    }
}

onBeforeMount(() => {
    if (isConnected.value) {
        const session = JSON.parse(localStorage.getItem("user"));
        if (session) {
            socket.auth = { username: session.firstname + ' ' + session.lastname, picture: session.picture_url, user: session.user_id, sessionID: session.session_id };
            socket.connect();
        }

        socket.on("session", ({ sessionID, userID }) => {
            console.log('session');
            socket.auth = { sessionID };
            chatStore.saveSession(sessionID);
            localStorage.setItem("sessionID", sessionID);
            socket.userID = userID;
        });

        socket.on('typing', (data) => {
            chatStore.$patch((state) => {
                state.typing = data;
            });
        });
        socket.on('stoptyping', (data) => {
            chatStore.$patch((state) => {
                state.typing = false;
            });
        });
        socket.on("connect", () => {
            console.log('connected');
            console.log(users);
            users.value.forEach((utilisateur: any) => {
                if (utilisateur.self) {
                    utilisateur.connected = true;
                }
            });
        });

        socket.on("disconnect", () => {
            users.value.forEach((utilisateur: any) => {
                if (utilisateur.self) {
                    utilisateur.connected = false;
                }
            });
        });

        const initReactiveProperties = (utilisateur: any) => {
            utilisateur.connected = true;
            utilisateur.messages = [];
            utilisateur.hasNewMessages = false;

        };
        socket.on("users", (users2) => {
            console.log('users2', users2);
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
            console.log(currentUserConnected);
            displayFriends(currentUserConnected);
        });

        socket.on("user connected", (utilisateur: any) => {
            console.log('user connected');
            for (let i = 0; i < users.value.length; i++) {
                const existingUser: any = chatStore.$state.users[i];
                if (existingUser.userID === utilisateur.userID) {
                    existingUser.connected = true;
                    return;
                }
            }
            initReactiveProperties(utilisateur);
            chatStore.userConnected(utilisateur);
            checkIsFriend(utilisateur);
        });

        socket.on("user disconnected", (id) => {
            console.log('user disconnected');
            let newArray = ref(users.value.filter((utilisateur: any) => utilisateur.userID !== id));
            let newArrayFriend = ref(friendsConnected.value.filter((utilisateur: any) => utilisateur.user !== id));
            chatStore.$patch((state: any) => {
                state.users = newArray.value;
                state.friendsConnected = newArrayFriend.value;
            });
        });

        socket.on("private message", ({ content, from, to }) => {
            console.log('content', content, 'from', from, 'to', to);
            for (let i = 0; i < friendsConnected.value.length; i++) {
                const utilisateur: any = friendsConnected.value[i];
                console.log(utilisateur);
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

onUnmounted(() => {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("users");
    socket.off("user connected");
    socket.off("user disconnected");
    socket.off("private message");
})

</script>

<style scoped lang="scss">
.container {
    width: 100%;
    background: #FFFFFF;
    display: flex;
    flex-direction: row;

    .container-left {
        width: 30%;
        // background: blue;
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