<template>
    <header>
            <div class="logo">
                <router-link to="/">
                    <img src="../assets/icon-left-font-monochrome-black.svg" alt="logo-groupomania">
                </router-link>
            </div>
            <div class="menu">
                <router-link to="/">
                    <div>Accueil</div>
                </router-link>
                    <div>Amis</div>
                    <div>Profil</div>
                <div v-if="connected" @click="logout">Déconnexion</div>
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
</script>

<style scoped lang="scss">
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
        padding-right: 3%;
        align-items: center;

        a {
            text-decoration: none;
            margin-left: 10%;
            color: #4E5166;
        }
    }
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

img {
    width: 60%;
    height: 80%;
}
</style>