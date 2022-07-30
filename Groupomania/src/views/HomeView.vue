<script setup lang="ts">
import { useRoute } from 'vue-router';
import Publication from '../components/Publication.vue';
import { reactive, ref } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';

const authStore = useAuthStore();
const token = localStorage.getItem('token');
const connected = ref(!!token)
const open = ref(false);


let userInput = reactive({
    lastname: '',
    firstname: '',
    email: '',
    password: '',
    confirmPassword: ''
});

let loginInput = reactive({
    email: '',
    password: ''
});

async function register(userInput: any) {
    let result = await authStore.register(userInput.lastname, userInput.firstname, userInput.email, userInput.password, userInput.confirmPassword);
    setTimeout(() => {
        // location.reload();
    }, 500);
    return result;
};

async function login(loginInput: any) {
    let result = await authStore.login(loginInput.email, loginInput.password);
        setTimeout(() => {
        // location.reload();
    }, 500);
    return result;
}

function logout() {
    authStore.logout();
    // location.reload();
}

</script>

<template>
    <div>
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
                <!-- <router-link to="/friends"> -->
                    <div>Amis</div>
                <!-- </router-link> -->
                <!-- <router-link to="/profil"> -->
                    <div>Profil</div>
                <!-- </router-link> -->
                <a v-if="connected" @click="logout" class="logout">
                    Déconnexion
                </a>
            </div>
        </header>

        <div v-if="!connected" class="home">
            <div class="container">
                <div class="container__header">
                    <div class="container__header__title">
                        <h1>Bienvenue sur <span>Groupomania</span></h1>
                    </div>
                    <div class="container__header__message">
                        <p>Réseau social d'entreprise pour les personnes travaillant au sein du groupe
                            <span>Groupomania</span>
                        </p>
                    </div>
                </div>
                <div class="container__content">
                    <div class="container__content__form">
                        <form @submit.prevent="login(loginInput)">
                            <div class="container__content__form__login">
                                <label for="email">Email</label>
                                <input type="email" id="email" v-model="loginInput.email" />
                            </div>
                            <div class="container__content__form__login">
                                <label for="password">Mot de passe</label>
                                <input type="password" id="password" v-model="loginInput.password" />
                            </div>
                            <div class="container__content__form__login">
                                <button>Connexion</button>
                            </div>
                        </form>
                    </div>
                    <div class="welcome">
                        <div class="welcome__content">
                            <p>Apprenez en plus sur les gens qui vous entourent au quotidien en échangeant avec eux</p>
                            <div class="welcome__content__container">
                                <button @click="open = true" class="welcome__content__container__button">
                                    S'inscrire
                                </button>
                                <Teleport to="body">
                                    <div v-if="open" @click="open = false"
                                        class="calc d-flex flex-row justify-content-center align-items-center">
                                        <div @click.stop class="modal-container">

                                            <h2>Rejoindre <span>Groupomania</span></h2>
                                            <div class="modal-container__form">
                                                <form @submit.prevent="register(userInput)">
                                                    <div class="modal-container__form__row">
                                                        <label for="lastname">Nom</label>
                                                        <input type="text" id="lastname" v-model="userInput.lastname" />
                                                    </div>
                                                    <div class="modal-container__form__row">
                                                        <label for="firstname">Prénom</label>
                                                        <input type="text" id="firstname"
                                                            v-model="userInput.firstname" />
                                                    </div>
                                                    <div class="modal-container__form__row">
                                                        <label for="email">Email</label>
                                                        <input type="email" id="email" v-model="userInput.email" />
                                                    </div>
                                                    <div class="modal-container__form__row">
                                                        <label for="password">Mot de passe</label>
                                                        <input type="password" id="password"
                                                            v-model="userInput.password" />
                                                    </div>
                                                    <div class="modal-container__form__row">
                                                        <label for="confirmPassword">Confirmation du mot de
                                                            passe</label>
                                                        <input type="password" id="confirmPassword"
                                                            v-model="userInput.confirmPassword" />
                                                    </div>
                                                    <div class="modal-container__form__row">
                                                        <button>S'enregistrer</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </Teleport>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="hero-banner">
                <img src="../assets/home.svg" alt="">
            </div>
        </div>
        <div v-else-if="connected">
            <Publication />
        </div>

    </div>

</template>

<style scoped lang="scss">
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
        padding-right: 3%;
        align-items: center;

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

.home {
    display: flex;
    flex-direction: row;

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 50%;
        background-color: white;

        span {
            color: #FD2D01;
        }


        &__header {
            &__message {
                text-align: center;
            }
        }

        &__content {
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 100%;
            width: 100%;
            padding: 0 3%;

            &__form {
                background: white;
                border: 1px solid white;
                border-radius: 25px;
                padding: 20px;
                box-shadow: 0px 0px 44px #4e5166;

                form {
                    display: flex;
                    align-items: end;
                }

                &__login {
                    button {
                        background-color: #FD2D01;
                        border-color: #FD2D01;
                        color: #fff;
                        font-size: 1.5rem;
                        padding: 10px 20px;
                        border-radius: 5px;
                        border-width: 1px;
                        border-style: solid;
                        cursor: pointer;
                        transition: all 0.3s ease-in-out;
                        margin: 0 10px;
                    }
                }
            }
        }

        &__header {

            &__title {
                text-align: center;
            }

            &__picture {
                max-height: 300px;
                width: 100%;
            }
        }
    }

    .hero-banner {
        width: 75%;

        img {
            width: 100%;
            height: 100%;
        }
    }
}


.welcome {
    max-width: 1440px;
    margin: 0 auto;

    .welcome__content {
        padding: 0 20px;
        text-align: center;
        margin-top: 100px;

        &__container {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            margin-top: 50px;

            &__button {
                background-color: #FD2D01;
                border-color: #FD2D01;
                color: #fff;
                font-size: 1.5rem;
                padding: 10px 20px;
                border-radius: 5px;
                border-width: 1px;
                border-style: solid;
                cursor: pointer;
                transition: all 0.3s ease-in-out;
                margin: 0 10px;

                &:hover {
                    background-color: #FFD7D7;
                    border-color: #FFD7D7;
                    color: #fff;
                }
            }
        }

        h1 {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 20px;
        }

        p {
            font-size: 1.5rem;
            line-height: 1.5;
            margin-bottom: 20px;
        }
    }
}

.calc {
    position: absolute;
    top: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.modal-container {
    background-color: #FFF;
    color: #4E5166;
    padding: 40px;
    border-radius: 5px;
    width: 300px;
    height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(2px);
    transition: all 0.3s ease-in-out;
    transform: translateY(-100px);
    transform-origin: center;

    h2 {
        font-size: 1.5rem;
        margin-bottom: 20px;

        span {
            color: #FD2D01;
        }
    }

    &__form {
        display: flex;
        flex-direction: column;

        &__row {
            display: flex;
            flex-direction: column;

            &:nth-child(6) {
                margin-top: 20px;
                display: flex;
                align-items: center;

                button {
                    background-color: #FD2D01;
                    border-color: #FD2D01;
                    color: #fff;
                    font-size: 1.5rem;
                    padding: 10px 20px;
                    border-radius: 5px;
                    border-width: 1px;
                    border-style: solid;
                    cursor: pointer;
                    transition: all 0.3s ease-in-out;
                    margin: 0 10px;
                }
            }
        }
    }
}
</style>