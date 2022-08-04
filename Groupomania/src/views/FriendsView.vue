<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed, reactive, ref } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
import { useFriendshipStore } from '../shared/stores/friendsStore';
import NavigationBar from '../components/NavigationBar.vue';
import { routes } from '../routes';

const authStore = useAuthStore();
const friendshipStore = useFriendshipStore();
const open = ref(false);

checkIsConnected();

const isConnected = computed(() => {
    return authStore.$state.isConnected;
});

const user = computed(() => {
    return authStore.$state.user;
});


function getRequestsAndFriendlist() {
    friendshipStore.getRequests();
    friendshipStore.getAllFriends();
}
getRequestsAndFriendlist();


const requests = computed(() => {
    return friendshipStore.$state.requests;
});

const friends = computed(() => {
    return friendshipStore.$state.friends;
});
function checkIsConnected() {
    console.log(authStore.$state.isConnected);
    if (authStore.$state.isConnected == false) {
        window.location.href = '/';
    }
    authStore.getMyInformations();
}

function logout() {
    authStore.logout();
    window.location.href = '/';
}

console.log(requests);
</script>

<template>
    <div>
        <NavigationBar :user="user" :isConnected="isConnected" @logout="logout()" />
        <div v-if="isConnected" class="container">
            <div class="friends-request">
                <div class="friends-request__title">
                    <div class="friends-request__title__text">
                        Demandes d'amis
                    </div>
                </div>
                <div class="friends-request__list">
                    <div v-for="req in requests" class="friends-request__list__item">
                        <div class="friends-request__list__item__avatar">
                            <img :src="req.picture_url" alt="avatar-1">
                        </div>
                        <div class="friends-request__list__item__name">
                            <div class="friends-request__list__item__name__text">
                                <div class="friends-request-list__item__name__text__firstname">
                                    <span>{{ req.firstname }}</span>
                                </div>
                                <div class="friends-request-list__item__name__text__lastname">
                                    <span>{{ req.lastname }}</span>
                                </div>
                            </div>
                            <div class="friends-request-list__item__name__button">
                                <button>Accepter</button>
                                <button>Refuser</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="friends-list">
                <div class="friends-list__title">
                    <div class="friends-list__title__text">
                        Mes amis
                    </div>
                </div>
                <div class="friends-list__list">
                    <div v-for="friend in friends" class="friends-list__list__item">
                        <div class="friends-list__list__item__avatar">
                            <img :src="friend.picture_url" alt="avatar-1">
                        </div>
                        <div class="friends-list__list__item__name">
                            <div class="friends-list__list__item__name__text">
                                <div class="friends-list__list__item__name__text__firstname">
                                    <span>{{ friend.firstname }}</span>
                                </div>
                                <div class="friends-list__list__item__name__text__lastname">
                                    <span>{{ friend.lastname }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="friend-list__list__item__button">
                            <button class="friend-list__list__item__button">Retirer</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '../styles/Components/buttons';


* {
    font-family: 'Lato', sans-serif;
}

header {
    display: flex;
    justify-content: start;
    background-color: #FFF;
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 0 0.75rem #4E5166);

    .menu {
        font-family: 'Lato', sans-serif;
        display: flex;
        font-size: 20px;
        height: 80px;
        width: 100%;
        align-items: center;

        div {

            margin-left: 30px;
        }

        a {
            text-decoration: none;
            margin-left: 10%;
            color: #4E5166;
        }
    }
}


.logout {
    background: #FD2D01;
    padding: 10px;
    border-radius: 5px;
    color: #FFF !important;
    cursor: pointer;
}

.logo {
    display: flex;
    align-items: center;
    padding-left: 3%;
    width: 40%;
}

.container {
    display: flex;
    flex-direction: column;

    .friends-request {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 20px;

        &__list {
            margin-top: 30px;
            width: 70%;

            &__item {
                display: flex;
                flex-direction: row;
                padding: 10px;
                margin-bottom: 20px;
                box-shadow: 0px 1px 3px 0px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 2px 1px -1px rgb(0 0 0 / 12%);
                border-radius: 20px;

                &__name {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    width: 100%;
                    justify-content: space-between;

                    &__text {
                        display: flex;
                        flex-direction: row;
                    }

                    &__button {
                        width: 25%;
                        display: flex;
                        justify-content: space-between;

                    }

                    button {
                        @include button-primary;
                    }
                }
            }
        }
    }

    .friends-list {
        display: flex;
        flex-direction: column;
        align-items: center;

        &__title {
            margin-bottom: 20px;
        }

        &__list {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;

            &__item {
                box-shadow: 0px 1px 3px 0px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 2px 1px -1px rgb(0 0 0 / 12%);
                padding: 20px;
                border-radius: 20px;
                margin: 20px;
                width: 10%;
                display: flex;
                flex-direction: column;
                align-items: center;

                &__button {
                    display: flex;
                    justify-content: center;

                    .button {
                        @include button-primary;
                    }

                }

                &__name {
                    text-align: center;
                    margin-bottom: 10px;
                }

            }
        }
    }
}
</style>