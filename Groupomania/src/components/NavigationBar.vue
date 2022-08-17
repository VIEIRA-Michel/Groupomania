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
        <div class="burger">
            <button type="button" @click="open = !open" className="burger__button">
                <fa icon="fa-solid fa-bars" />
            </button>
        </div>

    </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
const authStore = useAuthStore();

const open = ref(false);

function isLogged() {
    return localStorage.getItem('token') !== null;
}

function handleShowLinks() {

}

const props = defineProps<{
    user: {
        email: string,
        firstname: string,
        lastname: string,
        picture_url: string,
        user_id: number,
    },
    isConnected: boolean,
}>();

const emit = defineEmits<{
    (e: 'logout'): any;
}>();

</script>

<style scoped lang="scss">
header {
    display: flex;
    background-color: #FFF;
    width: 100%;
    height: 30px;
    padding: 10px 0px;
    justify-content: start;
    border-bottom: 1px solid #FD2D01;

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
    }

    .burger {
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



.logout {
    background: #FD2D01;
    padding: 3px;
    color: #FFF !important;
    cursor: pointer;
}

.logo {
    display: flex;
    align-items: center;
}

img {
    height: 200px;
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