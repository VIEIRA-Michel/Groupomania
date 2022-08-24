<script setup lang="ts">
import Publication from '../components/Publication.vue';
import { computed, reactive, ref } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
import NavigationBar from '../components/NavigationBar.vue';

localStorage.getItem('token') !== null ? useAuthStore().getMyInformations() : "";

const isConnected = computed(() => useAuthStore().$state.isConnected);
const user = computed(() => useAuthStore().$state.user);
const invalidEmail = computed(() => useAuthStore().$state.invalidEmail);
const invalidPassword = computed(() => useAuthStore().$state.invalidPassword);

const open = ref(false);
let hasAccount = ref(true);
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

</script>
<template>
    <div>
        <NavigationBar :user="user" :isConnected="isConnected" @logout="useAuthStore().logout()" />
        <div v-if="!isConnected" class="home">
            <div class="home__picture">
                <img src="../assets/picture-home.png" alt="">
            </div>
            <div class="container-shadow">
            </div>
            <div class="container">
                <div class="container__header">
                    <div class="container__header__title">
                        <h1><span>Groupomania</span></h1>
                    </div>
                    <div class="container__header__message">
                        <p>Prenons le temps de mieux nous connaître et partageons ensemble chacune de nos victoires
                        </p>
                    </div>
                </div>
                <div class="container__content">
                    <div v-if="hasAccount" class="container__content__form">
                        <form @submit.prevent="useAuthStore().login(loginInput.email, loginInput.password)">
                            <div class="container__content__form__login">
                                <label for="email">Email</label>
                                <input type="email" id="email" :class="[invalidEmail ? 'invalidInput' : 'default']"
                                    v-model="loginInput.email" />
                                <p v-if="invalidEmail" class="invalidText">Adresse email incorrecte</p>
                            </div>
                            <div class="container__content__form__login">
                                <label for="password">Mot de passe</label>
                                <input type="password" id="password"
                                    v-bind:class="[invalidPassword ? 'invalidInput' : 'default']"
                                    v-model="loginInput.password" />
                                <p v-if="invalidPassword" class="invalidText">Mot de passe incorrect</p>
                            </div>
                            <div class="container__content__form__login">
                                <button>Connexion</button>
                            </div>
                            <div class="container__content__form__message">
                                Vous n'avez pas encore de compte ? <span v-if="hasAccount"
                                    @click="hasAccount = false">Inscrivez-vous gratuitement</span>
                            </div>
                        </form>
                    </div>
                    <div v-else class="container__content__form">
                        <form @submit.prevent="useAuthStore().register(userInput.lastname, userInput.firstname, userInput.email, userInput.password, userInput.confirmPassword)">
                            <div class="container__content__form__register">
                                <label for="lastname">Nom</label>
                                <input type="text" id="lastname" v-model="userInput.lastname" />
                            </div>
                            <div class="container__content__form__register">
                                <label for="firstname">Prénom</label>
                                <input type="text" id="firstname" v-model="userInput.firstname" />
                            </div>
                            <div class="container__content__form__register">
                                <label for="email">Email</label>
                                <input type="email" id="email" v-model="userInput.email" />
                            </div>
                            <div class="container__content__form__register">
                                <label for="password">Mot de passe</label>
                                <input type="password" id="password" v-model="userInput.password" />
                            </div>
                            <div class="container__content__form__register">
                                <label for="confirmPassword">Confirmation du mot de passe</label>
                                <input type="password" id="confirmPassword" v-model="userInput.confirmPassword" />
                            </div>
                            <div class="container__content__form__register">
                                <button>S'enregistrer</button>
                            </div>
                            <div class="container__content__form__message">
                                Vous avez déjà un compte ? <span v-if="!hasAccount"
                                    @click="hasAccount = true">Connectez-vous</span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="isConnected">
            <Publication />
        </div>

    </div>

</template>
<style scoped lang="scss">
@import '../styles/Utils/keyframes';

* {
    font-family: 'Lato', sans-serif;
}

.register {
    display: flex;
    align-items: center;
    background-color: #4E5166;
    color: #000;
    padding: 10px;
    cursor: pointer;
}

.home {
    display: flex;
    flex-direction: row;
    margin: 0;

    &__picture {
        img {
            z-index: -1;
            position: absolute;
            left: 0;
        }
    }

    .container-shadow {
        height: 370px;
        width: 100vw;
        position: absolute;
        background: linear-gradient(180deg, rgb(250, 250, 250) 19%, rgba(0, 212, 255, 0) 100%);
    }

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 1;
        width: 100%;
        height: 100%;

        span {
            color: #FD2D01;
        }


        &__header {

            &__title {
                h1 {
                    -webkit-animation: focus-in-expand 2.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) 1s both;
                    animation: focus-in-expand 2.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) 1s both;
                }
            }

            &__message {
                text-align: center;

                p {
                    -webkit-animation: text-focus-in 3s cubic-bezier(0.215, 0.610, 0.355, 1.000) 4s both;
                    animation: text-focus-in 3s cubic-bezier(0.215, 0.610, 0.355, 1.000) 4s both;
                }
            }
        }

        &__content {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            -webkit-animation: slide-out-blurred-bottom 2.5s cubic-bezier(0.755, 0.050, 0.855, 0.060) 2.5s reverse both;
            animation: slide-out-blurred-bottom 2.5s cubic-bezier(0.755, 0.050, 0.855, 0.060) 2.5s reverse both;

            &__form {
                border-radius: 5px;
                background: #FFFFFF;
                border: 1px solid #FD2D01;
                padding: 20px;
                -webkit-animation: focus-in-expand 1s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                animation: focus-in-expand 1s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;




                form {
                    display: flex;
                    flex-direction: column;
                }

                &__login {

                    margin-bottom: 15px;
                    display: flex;
                    flex-direction: column;

                    .invalidInput {
                        border: #FD2D01 2px ridge;
                        -webkit-animation: shake-horizontal 0.8s cubic-bezier(0.455, 0.030, 0.515, 0.955) both;
                        animation: shake-horizontal 0.8s cubic-bezier(0.455, 0.030, 0.515, 0.955) both;
                    }

                    .default {
                        border: 2px ridge #4E5166;
                    }

                    .invalidText {
                        color: #FD2D01;
                        margin-top: 5px;
                    }

                    label {
                        font-weight: 800;
                        text-align: center;
                    }

                    input {
                        border-radius: 5px;
                        height: 20px;
                        text-align: center;
                    }

                    button {
                        background-color: #FFFFFF;
                        border-color: #FD2D01;
                        color: #FD2D01;
                        padding: 10px;
                        border: 1px solid #FD2D01;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: all 0.3s ease-in-out;

                        &:hover {
                            background-color: #FD2D01;
                            color: #FFFFFF;
                        }
                    }
                }

                &__message {
                    cursor: pointer;
                }

                &__register {
                    display: flex;
                    flex-direction: column;

                    margin-bottom: 15px;
                    display: flex;
                    flex-direction: column;

                    label {
                        font-weight: 800;
                        text-align: center;
                    }

                    input {
                        border-radius: 5px;
                        height: 20px;
                        text-align: center;

                        &:focus {
                            outline: none;
                        }
                    }

                    button {
                        background-color: #FFFFFF;
                        border-color: #FD2D01;
                        color: #FD2D01;
                        padding: 10px;
                        border: 1px solid #FD2D01;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: all 0.3s ease-in-out;

                        &:hover {
                            background-color: #FD2D01;
                            color: #FFFFFF;
                        }
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

.home_picture {
    img {
        position: absolute;
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