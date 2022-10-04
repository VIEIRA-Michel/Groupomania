<script setup lang="ts">
import { useAuthStore } from '@/shared/stores/authStore';
import { useRouter } from 'vue-router';
const router = useRouter();

// isConnected va nous permettre de savoir si nous sommes connectés ou non
const isConnected = useAuthStore().$state.isConnected;
</script>
<template>
    <div class="not-found-view">
        <h1>404</h1>
        <h2>Page non trouvée
            <fa icon="fa-regular fa-face-sad-tear" />
        </h2>
        <p>
            La page que vous recherchez a peut-être été supprimée, son nom a changé ou est temporairement indisponible.
        </p>
        <router-link v-if="isConnected" to="/app/home">Retourner à la page d'accueil</router-link>
        <router-link v-else to="/login">Retourner à la page d'authentification</router-link>
    </div>
</template>
<style scoped lang="scss">
* {
    font-family: 'Lato', sans-serif;
}

.not-found-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 60px auto auto auto;
    width: 70%;
    padding: 20px 0 20px 0;
    border: 1px solid #FD2D01;
    background-color: floralwhite;
    border-radius: 5px;
    
    h1 {
        color: #FD2D01;
        font-weight: 700;
    }
    h2 {
        font-weight: 600;
    }
    p {
        margin-top: 20px;
    }
    a {
        margin-top: 20px;
        color: #FD2D01;
        font-weight: 600;
    }
}

h1 {
    font-size: 40px;
}
</style>