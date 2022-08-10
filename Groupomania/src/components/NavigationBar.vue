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
            <router-link to="/profil">
                <div class="menu__navigate">
                    <fa icon="circle-user" />
                </div>
            </router-link>
            <router-link to="/">
                <div class="menu__navigate">
                    <fa v-if="props.isConnected" @click="emit('logout')" icon="fa-right-from-bracket" />
                </div>
            </router-link>
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
    padding: 10px;
    border-bottom: 1px solid #FD2D01;

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
    padding-left: 3%;
    width: 40%;
}

img {
    width: 90%;
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
    padding-left: 3%;
    width: 40%;
}
</style>