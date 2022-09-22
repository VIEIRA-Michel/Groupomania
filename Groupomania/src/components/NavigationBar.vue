<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useOtherStore } from '@/shared/stores/otherStore';
import { useFriendshipStore } from '@/shared/stores/friendsStore';
import { useChatStore } from '@/shared/stores/chatStore';
import { useAuthStore } from '@/shared/stores/authStore';

const burgerMenu = computed(() => useOtherStore().$state.burgerMenu);
const requests = computed(() => useFriendshipStore().$state.requests);
const user = computed(() => useAuthStore().$state.user);
const users = computed(() => useChatStore().$state.users);
const isConnected = computed(() => useAuthStore().$state.isConnected);
const notifications = computed(() => useOtherStore().$state.notifications);
const userPicture = JSON.parse(localStorage.getItem('user')).picture_url;
// console.log(user);
let showNotification = ref<any>(null);
let newNotification = ref(false);
let showProfileMenu = ref(false);

const props = defineProps<{
    isConnected: boolean,
}>();

const emit = defineEmits<{
    (e: 'logout'): any
}>();

function toggleNotification() {
    if (showProfileMenu.value == true) {
        showProfileMenu.value = false;
    }
    if (showNotification.value == null || showNotification.value == false) {
        showNotification.value = true;
        newNotification.value = false;
    } else {
        showNotification.value = false;
    }
}

function toggleProfileMenu() {
    if (showNotification.value == true) {
        showNotification.value = false;
    }
    showProfileMenu.value = !showProfileMenu.value;
}

watch(useOtherStore().$state.notifications, (newNotif) => {
    if (showNotification.value == false || showNotification.value == null) {
        newNotification.value = true;
    }
})

</script>
<template>
    <header>
        <div class="menu">
            <div class="logo">
                <router-link to="/app/home">
                    <img src="../assets/logo-groupomania.svg" alt="logo-groupomania">
                    <span>Groupomania</span>
                </router-link>
            </div>
            <div v-if="props.isConnected" class="center">
                <router-link to="/app/home">
                    <div class="menu__navigate">
                        <fa icon="home" />
                    </div>
                </router-link>
                <router-link to="/app/friends">
                    <div class="menu__navigate">
                        <fa icon="user-group" />
                        <span v-if="props.isConnected && requests.length > 0"> {{ requests.length }}</span>
                    </div>
                </router-link>
                <router-link to="/app/chat">
                    <div class="menu__navigate">
                        <fa icon="fa-solid fa-comments" />
                        <span
                            v-if="props.isConnected && users.length !== 0 && users.find((item:any) => item.hasNewMessages == true)">1</span>
                    </div>
                </router-link>
            </div>
            <div v-if="props.isConnected" class="right">
                <nav @click.stop="toggleNotification" class="notification-alert">
                    <div class="notification-alert__content">
                        <div class="notification-alert__content__icon">
                            <fa icon="fa-solid fa-bell"
                                :class="[ showNotification == null && newNotification || showNotification == false && newNotification ? 'active' : '']" />
                        </div>
                    </div>
                    <div :class="[showNotification ? 'notification-alert__list active' : 'notification-alert__list']">
                        <div v-for="notif in notifications" class="notification-alert__list__item">
                            <div v-if="showNotification" class="event">
                                <div class="event__avatar">
                                    <img :src="notif.picture_url" alt="avatar" />
                                </div>
                                <div class="event__text">
                                    <div class="event__text__username">
                                        {{ notif.firstname + ' ' + notif.lastname }}
                                    </div>
                                    <div class="event__text__type">
                                        <p>{{ notif.type }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-if="showNotification && notifications.length <=0" class="notification-alert__text">
                            <div class="event__text">
                                <p>Aucune notification</p>
                            </div>
                        </div>
                    </div>
                </nav>
                <div @click.stop="toggleProfileMenu" class="profile">
                    <img :src="userPicture" alt="avatar" />
                    <div :class="[ showProfileMenu ? 'profile__menu active' : 'profile__menu' ]">
                        <div v-if="showProfileMenu" class="profile__menu__list">
                            <div class="profile__menu__list__item">
                                <router-link to="/app/profil">
                                    <fa icon="fa-solid fa-user-pen" />
                                    Modifier mon profil
                                </router-link>
                            </div>
                            <div @click="emit('logout')" class="profile__menu__list__item">
                                <a>
                                    <fa icon="fa-right-from-bracket" />
                                    Se deconnecter
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>
<style scoped lang="scss">
@import '../styles/Utils/keyframes';

* {
    font-family: 'Lato', sans-serif;
}

html {
    overflow-y: hidden;
}

header {
    display: flex;
    background-color: #FFF;
    width: 100%;
    height: 30px;
    padding: 10px 0px;
    justify-content: start;
    border: 1px solid #dbdbdb;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;

    @media only screen and (max-width: 768px) {
        justify-content: space-between;
    }

    .menu {
        font-family: 'Lato', sans-serif;
        display: flex;
        font-size: 15px;
        align-items: center;
        width: 100%;
        justify-content: space-between;

        // @media only screen and (max-width: 768px) {
        //     display: none;
        // }

        .logo {
            z-index: 10;
            display: flex;
            align-items: center;
            position: relative;

            a {
                text-decoration: none;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            span {
                font-size: 25px;
                font-weight: bold;
                color: #FD2D01;
                position: absolute;
                background: #FFFFFF;
                margin-bottom: 4px;
            }

            @media only screen and (max-width: 687px) {
                display: none;
            }
        }


        a {
            text-decoration: none;
            margin-left: 10px;
            color: #FD2D01;
        }

        &__navigate {
            cursor: pointer;
            position: relative;
            border-radius: 5px;
            height: 40px;

            &:hover {
                background-color: #dbdbdb;
                transition: 0.4s all;
                color: #4E5166;
            }

            &:active {
                background-color: #dbdbdb;
                color: #4E5166;
            }

            svg {
                font-size: 20px;
            }

            span {
                padding: 0px 4px;
                background: pink;
                border-radius: 50%;
                position: absolute;
                bottom: 5px;
                left: 20px;
                border: 1px solid #FFFFFF;
            }
        }

        &.notLogged {
            justify-content: end;
        }

        .center {
            position: absolute;
            display: flex;
            left: 50%;
            right: 50%;
            flex-direction: row;
            justify-content: space-around;

            @media only screen and (max-width: 687px) {
                position: initial;
            }

            svg {
                padding: 10px;
                border-radius: 5px;
            }
        }

        .right {
            display: flex;
            flex-direction: row;
            margin-right: 20px;
            padding-top: 3px;
            // align-items: center;

            @media only screen and (min-width: 687px) and (max-width: 991px) {
                position: absolute;
                right: 5px;
            }

            svg {
                border-radius: 50%;
                color: #4E5166;
            }

            .notification-alert {
                position: relative;
                cursor: pointer;
                border: 1px solid transparent;
                margin-left: 10px;
                width: 43px;
                height: 38px;
                background: #dbdbdb;
                border-radius: 50%;

                &__content {
                    position: relative;
                    width: 100%;
                    height: 100%;

                    &__icon {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;

                        svg {
                            font-size: 20px;

                            &.active {
                                -webkit-animation: wobble-hor-top 1.5s infinite both;
                                animation: wobble-hor-top 1.5s infinite both;
                            }
                        }
                    }
                }

                &:hover {
                    background-color: #F5F5F5;
                    transition: 0.4s all;
                    border: 1px solid #4E5166;
                }

                &__list {
                    width: 0px;
                    height: 0px;
                    position: absolute;
                    top: 54px;
                    right: 0px;

                    &__item {
                        margin: 10px;
                    }

                    &.active {
                        width: 250px;
                        height: 250px;
                        background: #FFFFFF;
                        border: 1px solid #dbdbdb;
                        border-radius: 5px;
                        overflow-y: scroll;
                        transition: 0.3s all;
                    }
                }

                .event {
                    margin-top: 10px;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    -webkit-animation: text-focus-in 0.4s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
                    animation: text-focus-in 0.4s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;

                    &__avatar {
                        img {
                            width: 30px;
                            height: 30px;
                            object-fit: cover;
                            border-radius: 5px;
                        }
                    }

                    &__text {
                        margin-left: 10px;

                        &__username {
                            font-size: 12px;
                            font-weight: 400;
                        }

                        &__type {
                            font-size: 10px;
                            font-weight: 300;
                            color: #4E5166;
                        }
                    }
                }

                &__list {
                    .active {
                        background-color: #F5F5F5;
                        transition: 0.4s all;
                    }
                }

                &__text {
                    display: flex;
                    justify-content: center;
                    margin-top: 10px;
                }
            }

            .profile {
                cursor: pointer;
                margin-left: 10px;
                position: relative;

                img {
                    width: 45px;
                    height: 40px;
                    object-fit: cover;
                    border-radius: 50%;
                    border: 1px solid transparent;

                    &:hover {
                        border: 1px solid #4E5166;
                        transition: 0.4s all;
                    }
                }

                &__menu {
                    position: absolute;
                    top: 55px;
                    right: 0px;
                    width: 0px;
                    border: 1px solid transparent;

                    &.active {
                        border-radius: 5px;
                        width: 250px;
                        height: 80px;
                        background: #ffffff;
                        border: 1px solid #dbdbdb;
                        transition: 0.3s all;
                    }

                    &__list {
                        margin: 10px;

                        &__item {
                            padding: 5px;
                            -webkit-animation: text-focus-in 0.4s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
                            animation: text-focus-in 0.4s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;

                            &:nth-child(1) {
                                padding-bottom: 11px;
                            }

                            &:nth-child(2) {
                                padding-top: 10px;
                                border-top: 1px solid #dbdbdb;

                                svg {
                                    width: 18.75px;
                                    height: 15px;
                                }
                            }

                            a {
                                svg {
                                    margin-right: 10px;
                                }
                            }
                        }
                    }
                }
            }
        }
    }


    .burger {
        z-index: 10;

        @media only screen and (min-width: 769px) {
            display: none;
        }

        &__button {
            margin-right: 20px;
            border: none;
            background-color: #FFF;
            color: #FD2D01;
        }

        @media only screen and (max-width: 768px) {
            display: block;
            border: none;
            background-color: #FFF;
            color: #FD2D01;
        }
    }
}

.burger__menu {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    font-size: 30px;
    align-items: center;
    background-color: #FFF;
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9;
    transform: translateX(-100%);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    -webkit-animation: slide-in-top 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    animation: slide-in-top 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;

    @media only screen and (max-width: 768px) {
        transform: translateX(0);
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
    }

    &__item {
        cursor: pointer;
        margin-top: 20px;

        a {
            text-decoration: none;
            color: #FD2D01;
        }

        &__navigate {
            svg {
                margin-right: 10px;
            }
        }
    }

    &.hidden {
        -webkit-animation: slide-out-top 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
        animation: slide-out-top 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
    }

    &.disabled {
        display: none;
    }
}

.logout {
    background: #FD2D01;
    padding: 3px;
    color: #FFF !important;
    cursor: pointer;
}


img {
    width: 220px;
    height: 50px;
    object-fit: cover;
}

.login {
    display: flex;
    align-items: center;
    padding: 10px;
    cursor: pointer;
}

.register {
    display: flex;
    align-items: center;
    background-color: #4E5166;
    color: #000;
    padding: 10px;
    cursor: pointer;
}


@media only screen and (max-width: 768px) {}
</style>