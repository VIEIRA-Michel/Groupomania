<script setup lang="ts">
import { ref, computed } from 'vue';
import { useOtherStore } from '@/shared/stores/otherStore';

const burgerMenu = computed(() => useOtherStore().$state.burgerMenu);
const props = defineProps<{
    isConnected: boolean,
}>();

const emit = defineEmits<{
    (e: 'logout'): any
}>();
</script>
<template>
    <header>
        <div class="logo">
            <router-link to="/">
                <img src="../assets/logo-header-svg.svg" alt="logo-groupomania">
            </router-link>
        </div>
        <div v-if="props.isConnected" class="menu">
            <router-link to="/">
                <div class="menu__navigate">
                    <fa icon="home" />
                </div>
            </router-link>
            <router-link to="/friends">
                <div class="menu__navigate">
                    <fa icon="user-group" />
                </div>
            </router-link>
            <router-link to="/chat">
                <div class="menu__navigate">
                    <fa icon="fa-solid fa-comments" />
                </div>
            </router-link>
            <router-link to="/profil">
                <div class="menu__navigate">
                    <fa icon="circle-user" />
                </div>
            </router-link>
            <a>
                <div class="menu__navigate">
                    <fa v-if="props.isConnected" @click="emit('logout')" icon="fa-right-from-bracket" />
                </div>
            </a>
        </div>
        <div v-else-if="!props.isConnected" class="menu notLogged">
            <router-link to="/login">
                <div class="menu__navigate">
                    <fa icon="fa-solid fa-user-pen" />
                    <span>Se connecter / S'enregistrer</span>
                </div>
            </router-link>
        </div>
        <div v-if="props.isConnected" class="burger">
            <button type="button" @click="useOtherStore().toggleBurgerMenu" className="burger__button">
                <fa icon="fa-solid fa-bars" />
            </button>
        </div>
        <div :class="[burgerMenu == null ? 'burger__menu disabled' : !burgerMenu ? 'burger__menu hidden' : 'burger__menu']">
            <div class="burger__menu__item" @click="useOtherStore().toggleBurgerMenu">
                <router-link to="/">
                    <div class="burger__menu__item__navigate">
                        <fa icon="home" />
                        <span>Accueil</span>
                    </div>
                </router-link>
            </div>
            <div class="burger__menu__item" @click="useOtherStore().toggleBurgerMenu">
                <router-link to="/friends">
                    <div class="burger__menu__item__navigate">
                        <fa icon="user-group" />
                        <span>Amis</span>
                    </div>
                </router-link>
            </div>
            <div class="burger__menu__item" @click="useOtherStore().toggleBurgerMenu">
                <router-link to="/chat">
                    <div class="burger__menu__item__navigate">
                        <fa icon="fa-solid fa-comments" />
                        <span>Messagerie</span>
                    </div>
                </router-link>
            </div>
            <div class="burger__menu__item" @click="useOtherStore().toggleBurgerMenu">
                <router-link to="/profil">
                    <div class="burger__menu__item__navigate">
                        <fa icon="circle-user" />
                        <span>Profil</span>
                    </div>
                </router-link>
            </div>
            <div class="burger__menu__item" @click="useOtherStore().toggleBurgerMenu">
                <a @click="emit('logout')">
                    <div class="burger__menu__item__navigate">
                        <fa icon="fa-right-from-bracket" />
                        <span>Se déconnecter</span>
                    </div>
                </a>
            </div>
        </div>
    </header>
</template>
<style scoped lang="scss">
@import '../styles/Utils/keyframes';

* {
    font-family: 'Lato', sans-serif;
}

header {
    display: flex;
    background-color: #FFF;
    width: 100%;
    height: 30px;
    padding: 10px 0px;
    justify-content: start;
    border-bottom: 1px solid #FD2D01;
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
        justify-content: space-around;
        margin-right: 20px;
        cursor: pointer;

        @media only screen and (max-width: 768px) {
            display: none;
        }

        div {

            margin-left: 30px;
        }

        a {
            text-decoration: none;
            margin-left: 10%;
            color: #FD2D01;
        }

        &__navigate {
            cursor: pointer;
        }
        &.notLogged {
            justify-content: end;
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

.logo {
    z-index: 10;
    display: flex;
    align-items: center;
}

img {
    width: 200px;
    height: 30px;
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

.logo {
    display: flex;
    align-items: center;
}


@media only screen and (max-width: 768px) {}
</style>