<script setup lang="ts">
import { ref, computed, watch, watchEffect, onBeforeMount } from 'vue';
import { useOtherStore } from '@/shared/stores/otherStore';
import { useFriendshipStore } from '@/shared/stores/friendsStore';
import { useChatStore } from '@/shared/stores/chatStore';
import { useAuthStore } from '@/shared/stores/authStore';
import { useRouter } from 'vue-router';
// Cette image par défaut va s'afficher uniquement dans le cas où l'utilisateur aurait émit un trop grand nombre de requête et qu'il ne peut plus récupérer les informations de son compte
import pictureDefault from '@/assets/profile_picture.jpg';

const router = useRouter();

// requests va nous permettre de récupérer la liste de nos demandes d'amis reçu
const requests = computed(() => useFriendshipStore().$state.requests);

// user va nous permettre de récupérer nos informations en tant qu'utilisateur
const user = computed(() => useAuthStore().$state.user);

// users va nous permettre de récupérer la liste de nos amis connectés
const users = computed(() => useChatStore().$state.friendsConnected);

// notifications va nous permettre de récupérer la liste des notifications
const notifications = computed(() => useOtherStore().$state.notifications);

// notificationsCount va nous permettre de récupérer le nombre de notification non lus que nous avons
const notificationsCount = computed(() => useOtherStore().getCountOfNotificationNotRead);

const isConnected = computed(() => useAuthStore().$state.isConnected);

// showNotification va nous permettre d'afficher ou non la liste des notifications
let showNotification = ref<any>(null);

// newNotification va nous permettre de savoir si nous avons une nouvelle notification
let newNotification = ref(false);

// showProfileMenu va nous permettre d'afficher le menu de notre profil
let showProfileMenu = ref(false);

let currentPage = ref();

// On récupère la propriété que l'on passe depuis l'élément parent et on définit son type
const props = defineProps<{
    isConnected: boolean,
}>();

const emit = defineEmits<{
    (e: 'logout'): any
}>();

// Cette fonction va nous permettre d'afficher ou de masquer la liste des notifications
function toggleNotification() {
    if (showProfileMenu.value == true) {
        showProfileMenu.value = false;
    }
    if (showNotification.value == null || showNotification.value == false) {
        showNotification.value = true;
        newNotification.value = false;
        // Cette fonction va nous permettre de mettre à jour le nombre de notification non lus
        useOtherStore().notificationRead();
    } else {
        showNotification.value = false;
    }
}

// Cette fonction va nous permettre d'afficher ou de masquer le menu de notre profil
function toggleProfileMenu() {
    if (showNotification.value == true) {
        showNotification.value = false;
    }
    showProfileMenu.value = !showProfileMenu.value;
}

// Cette fonction va nous permettre de fermer le menu et les notifications si l'un des deux est affichée à l'écran et réinitialiser également les résultats de recherche d'utilisateur
function reset() {
    showNotification.value = false;
    showProfileMenu.value = false;
    useFriendshipStore().resetSearch();
    useChatStore().unselectUser();
};

// Ce watch va nous permettre de savoir si nous avons une nouvelle notification et de nous avertir par une animation sur le bouton de notification
watch(notificationsCount, (newNotif) => {
    if (showNotification.value == false || showNotification.value == null) {
        newNotification.value = true;
    }
    if (newNotif == 0) {
        newNotification.value = false;
    }
})

// Ce watch va nous permettre de récupérer la page sur laquelle nous sommes
watch(router.currentRoute, (value) => {
    console.log(value);
    reset();
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
                <router-link to="/app/home"
                    :class="[router.currentRoute.value.path == '/app/home' ? 'currentPage' : 'other']">
                    <div class="menu__navigate">
                        <fa icon="home" />
                    </div>
                </router-link>
                <router-link to="/app/friends"
                    :class="[router.currentRoute.value.path == '/app/friends' ? 'currentPage' : 'other']">
                    <div class="menu__navigate">
                        <fa icon="user-group" />
                        <span v-if="props.isConnected && requests.length > 0"> {{ requests.length }}</span>
                    </div>
                </router-link>
                <router-link to="/app/chat"
                    :class="[router.currentRoute.value.path == '/app/chat' ? 'currentPage' : 'other']">
                    <div class="menu__navigate">
                        <fa icon="fa-solid fa-comments" />
                        <span
                            v-if="props.isConnected && users.length !== 0 && users.find((item: any) => item.hasNewMessages == true)">1</span>
                    </div>
                </router-link>
            </div>
            <div v-if="props.isConnected" class="right">
                <nav @click.stop="toggleNotification" class="notification-alert">
                    <div class="notification-alert__content">
                        <div class="notification-alert__content__icon">
                            <fa icon="fa-solid fa-bell"
                                :class="[showNotification == null && newNotification || showNotification == false && newNotification ? 'active' : '']" />
                            <span v-if="props.isConnected && notificationsCount > 0"> {{ notificationsCount }}</span>
                        </div>
                    </div>
                    <div
                        :class="[showNotification && notifications.length == 0 ? 'notification-alert__container empty' : showNotification ? 'notification-alert__container active' : 'notification-alert__container']">
                        <div :class="[showNotification ? 'active' : 'hidden']">
                            <div class="notification-alert__container__list">
                                <div v-if="showNotification" v-for="notif in notifications"
                                    class="notification-alert__container__list__item">
                                    <div v-if="showNotification" class="event">
                                        <div class="event__avatar">
                                            <img :src="notif.picture_url" alt="avatar" />
                                        </div>
                                        <div class="event__text">
                                            <div class="event__text__top">
                                                <div class="event__text__top__username">
                                                    {{ notif.firstname + ' ' + notif.lastname }}
                                                </div>
                                                <div class="event__text__top__date">
                                                    {{ notif.date }}
                                                </div>
                                            </div>
                                            <div class="event__text__type">
                                                <p>{{ notif.message }}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="notif.type == 'comment' || notif.type == 'like'"
                                        class="notification-alert__container__list__item__content">
                                        <div class="notification-alert__container__list__item__content__publication">
                                            <div
                                                class="notification-alert__container__list__item__content__publication__top">
                                                <div
                                                    class="notification-alert__container__list__item__content__publication__top__avatar">
                                                    <img :src="user.picture_url" alt="avatar" />
                                                </div>
                                                <div
                                                    class="notification-alert__container__list__item__content__publication__top__username">
                                                    {{ user.firstname + ' ' + user.lastname }}
                                                </div>
                                            </div>
                                            <div
                                                class="notification-alert__container__list__item__content__publication__bottom">
                                                <div v-if="notif.publication_content"
                                                    class="notification-alert__container__list__item__content__publication__bottom__text">
                                                    {{ notif.publication_content }}
                                                </div>
                                                <div v-if="notif.publication_picture"
                                                    class="notification-alert__container__list__item__content__publication__bottom__picture">
                                                    <img :src="notif.publication_picture" alt="publication picture">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="showNotification && notifications.length <= 0"
                                    class="notification-alert__container__text">
                                    <div class="event__text">
                                        <p>Aucune notification</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
                <div @click.stop="toggleProfileMenu" class="profile">
                    <img :src="user.picture_url ? user.picture_url : pictureDefault" alt="avatar" />
                    <div :class="[showProfileMenu ? 'profile__menu active' : 'profile__menu']">
                        <div v-if="showProfileMenu" class="profile__menu__list">
                            <div @click="router.push('/app/profil')" class="profile__menu__list__item">
                                <a to="/app/profil">
                                    <fa icon="fa-solid fa-user-pen" />
                                    Modifier mon profil
                                </a>
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

            &:focus {
                color: #4E5166;
            }
        }

        &__navigate {
            cursor: pointer;
            position: relative;
            border-radius: 10px;
            height: 40px;

            &:hover {
                background-color: #dbdbdb;
                transition: 0.4s all;

                svg {
                    color: #4E5166 !important;
                }
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

            .currentPage {
                border-bottom: 4px solid #4E5166;

                svg {
                    color: #4E5166;
                }

                &:hover {
                    .menu__navigate {
                        background-color: #FFF;
                    }
                }
            }

            .other {
                color: #FD2D01;
                border: none;
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

                        span {
                            padding: 0px 4px;
                            background: pink;
                            border-radius: 50%;
                            position: absolute;
                            bottom: -5px;
                            left: 25px;
                            color: #FD2D01;
                            border: 1px solid #FFFFFF;
                        }
                    }
                }

                &:hover {
                    background-color: #F5F5F5;
                    transition: 0.4s all;
                    border: 1px solid #4E5166;
                }

                &__container {
                    width: 0px;
                    height: 0px;
                    position: absolute;
                    top: 54px;
                    right: 0px;
                    background: #ffffff;
                    border: 1px solid #dbdbdb;
                    box-shadow: rgb(0 0 0 / 22%) 0px 2px 18px 0px;
                    // padding: 10px;

                    &__list {
                        &__item {
                            padding: 10px;
                            background: #f6f6f6;
                            border: 1px solid #dbdbdb;
                            border-radius: 10px;
                            margin: 10px;

                            &__content {
                                background-color: #ebe6e2;
                                padding: 10px;
                                border-radius: 10px;
                                margin-top: 10px;
                                border: 1px solid #dbdbdb;
                                -webkit-animation: text-focus-in 0.4s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
                                animation: text-focus-in 0.4s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;

                                &__publication {
                                    &__top {
                                        display: flex;
                                        flex-direction: row;
                                        align-items: center;
                                        margin-bottom: 10px;

                                        &__avatar {
                                            img {
                                                width: 20px;
                                                height: 20px;
                                                object-fit: cover;
                                                border-radius: 50%;
                                            }
                                        }

                                        &__username {
                                            margin-left: 5px;
                                            font-size: 12px;
                                            font-weight: 700;
                                        }
                                    }

                                    &__bottom {
                                        &__text {
                                            background: #F5F5F5;
                                            border: 1px solid #dbdbdb;
                                            border-radius: 5px;
                                            font-size: 12px;
                                            padding: 5px;
                                        }

                                        &__picture {
                                            img {
                                                margin-top: 10px;
                                                width: 100%;
                                                height: 150px;
                                                object-fit: cover;
                                                border-radius: 10px;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    .hidden {
                        width: 0px;
                        height: 0px;
                    }

                    &.active {
                        width: 350px;
                        height: 235px;
                        border-radius: 20px;
                        transition: 0.3s all;
                        overflow-y: hidden;
                        border: none;

                        .active {
                            width: 350px;
                            height: 235px;
                            border: 1px solid #dbdbdb;
                            border-radius: 20px;
                            overflow-y: scroll;
                            transition: 0.3s all;
                            cursor: default;
                            position: absolute;
                            right: 0;
                            -webkit-animation: text-focus-in 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) 0.2s both;
                            animation: text-focus-in 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) 0.2s both;
                        }
                    }

                    &.empty {
                        text-align: center;
                        width: 350px;
                        height: 250px;
                        background: #FFFFFF;
                        border: 1px solid #dbdbdb;
                        border-radius: 20px;
                        transition: 0.3s all;
                        box-shadow: rgba(0 0 0 /22%) 0px 2px 18px 0px;
                        cursor: default;
                    }
                }

                .event {
                    display: flex;
                    flex-direction: row;
                    align-items: flex-start;
                    -webkit-animation: text-focus-in 0.4s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
                    animation: text-focus-in 0.4s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;

                    &__avatar {
                        img {
                            width: 38px;
                            height: 38px;
                            object-fit: cover;
                            border-radius: 50%;
                        }
                    }

                    &__text {
                        margin-left: 10px;
                        width: 100%;

                        p {
                            margin-top: 10px;
                            -webkit-animation: text-focus-in 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) 0.2s both;
                            animation: text-focus-in 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) 0.2s both;
                        }

                        &__top {
                            display: flex;
                            justify-content: space-between;

                            &__username {
                                font-size: 15px;
                                font-weight: 700;
                            }

                            &__date {
                                font-size: 12px;
                                color: #FD2D01;
                            }
                        }

                        &__type {
                            margin-top: 5px;
                            font-size: 12px;
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
                        border-radius: 20px;
                        width: 250px;
                        background: #ffffff;
                        border: 1px solid #dbdbdb;
                        transition: 0.3s all;
                        box-shadow: rgba(0 0 0 /22%) 0px 2px 18px 0px;
                        padding: 10px;
                        cursor: initial;
                    }

                    &__list {
                        &__item {
                            padding: 10px;
                            -webkit-animation: text-focus-in 0.4s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
                            animation: text-focus-in 0.4s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
                            border-radius: 10px;
                            cursor: pointer;

                            &:hover {
                                background-color: #FD2D01;
                                color: #ffffff;
                                transition: .3s all ease-in-out;

                                a {

                                    color: #ffffff;

                                    svg {
                                        color: #ffffff;
                                    }
                                }
                            }

                            a {
                                color: #4E5166;

                                svg {
                                    width: 20px;
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