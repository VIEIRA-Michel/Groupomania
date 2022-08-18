<template>
    <div>
        <NavigationBar :user="user" :isConnected="isConnected" @logout="logout()" />
    </div>
    <div class="container">
        <div class="container-left">
            <div class="container-left__settings"></div>
            <div class="container-left__list">
                <userChat v-if="users" v-for="utilisateur in users" :key="utilisateur.userID" :user="utilisateur"
                    :selected="selectedUser === utilisateur" @select="onSelectUser(utilisateur)" />
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
import { computed, ref, onUnmounted, onBeforeMount } from 'vue';
import CryptoJS from 'crypto-js';
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

const isConnected = computed(() => authStore.$state.isConnected);
const user = computed(() => authStore.$state.user);
const typing = computed(() => chatStore.$state.typing);
const users = computed(() => chatStore.$state.users);
const selectedUser = ref<any>(null);
const mySocketId = ref('');

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
    console.log(utilisateur);
    selectedUser.value = utilisateur;
    utilisateur.hasNewMessages = false;
}

function onMessage(content: any) {
    if (selectedUser.value) {
        console.log(selectedUser.value);
        socket.emit("private message", {
            content,
            to: selectedUser.value.userID,
        });
        selectedUser.value.messages.push({
            content,
            fromSelf: true,
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


function encrypted(value: any) {
    let obj = { user: value };
    let string = JSON.stringify(obj);
    const secret = "XfhfwVCXYHkZepy";
    return CryptoJS.AES.encrypt(string, secret).toString();
}

function decrypted(value: any) {
    const secret = "XfhfwVCXYHkZepy";
    const bytes = CryptoJS.AES.decrypt(value, secret);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
}
onBeforeMount(() => {
    if (isConnected.value) {
        const sessionID = localStorage.getItem("sessionID");
        const key = localStorage.getItem("user");

        if (sessionID && key) {
            const decryptedKey = decrypted(key);
            if (decryptedKey == user.value.user_id) {
                socket.auth = { sessionID };
                socket.connect();
            }
        } else {
            socket.auth = { username: user.value.firstname + ' ' + user.value.lastname, picture: user.value.picture_url, user: user.value.user_id };
            socket.connect();
        }

        socket.on("session", ({ sessionID, userID }) => {
            console.log('on session');
            socket.auth = { sessionID };
            localStorage.setItem("sessionID", sessionID);
            const key = encrypted(user.value.user_id);
            localStorage.setItem("key", key);
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
            mySocketId.value = socket.id;
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
            chatStore.getUsersConnected(currentUserConnected);
        });

        socket.on("user connected", (utilisateur: any) => {
            console.log(users);
            for (let i = 0; i < users.value.length; i++) {
                const existingUser: any = chatStore.$state.users[i];
                console.log(existingUser);
                if (existingUser.userID === utilisateur.userID) {
                    existingUser.connected = true;
                    return;
                }
            }
            initReactiveProperties(utilisateur);
            chatStore.userConnected(utilisateur);
        });

        socket.on("user disconnected", (id) => {
            for (let i = 0; i < users.value.length; i++) {
                const utilisateur: any = users.value[i];
                if (utilisateur.userID === id) {
                    utilisateur.connected = false;
                    break;
                }
            }
        });

        socket.on("private message", ({ content, from }) => {
            for (let i = 0; i < users.value.length; i++) {
                const utilisateur: any = users.value[i];
                console.log(utilisateur);
                if (utilisateur.userID === from) {
                    utilisateur.messages.push({
                        content,
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