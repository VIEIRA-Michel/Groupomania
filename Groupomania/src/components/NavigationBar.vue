<template>
    <header>
        <div class="logo">
            <router-link to="/">
                <img src="../assets/icon-left-font-monochrome-black.svg" alt="logo-groupomania">
            </router-link>
        </div>
        <div v-if="props.isConnected" class="menu">
            <router-link to="/">
                <div>Accueil</div>
            </router-link>
            <router-link to="/friends">
                <div>Amis</div>
            </router-link>
            <router-link to="/">
                <div>Profil</div>
            </router-link>
            <a v-if="props.isConnected" @click="emit('logout')" class="logout">
                Déconnexion
            </a>
        </div>
    </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
const authStore = useAuthStore();

function isLogged() {
    return localStorage.getItem('token') !== null;
}

let connected = ref(isLogged());
console.log('user is connected ?', connected);

function logout() {
    authStore.logout();
    console.log(isLogged);
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
    justify-content: start;
    background-color: #FFF;
    width: 100%;
    height: 30px;
    filter: drop-shadow(0 0 0.75rem #4E5166);

    .menu {
        font-family: 'Lato', sans-serif;
        display: flex;
        font-size: 15px;
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
    padding: 3px;
    color: #FFF !important;
    cursor: pointer;
}

.logo {
    display: flex;
    align-items: center;
    padding-left: 3%;
    width: 40%;
}

img {
    width: 60%;
    height: 30px;
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
    padding-left: 3%;
    width: 40%;
}
</style>