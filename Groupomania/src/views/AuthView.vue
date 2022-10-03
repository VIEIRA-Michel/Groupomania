<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
import { useRouter } from 'vue-router';
const router = useRouter();

const invalidEmail = computed(() => useAuthStore().$state.invalidEmail);
const invalidPassword = computed(() => useAuthStore().$state.invalidPassword);
const errorMessage = computed(() => useAuthStore().$state.errorMessage);
const warningMessage = computed(() => useAuthStore().$state.warningLimiter);

const modalAlert = ref(false);
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

function login() {
    useAuthStore().login(loginInput.email, loginInput.password).then((response) => {
        router.push('/app/home');
        useAuthStore().removeWarningMessage();
    }).catch((error) => {
        console.log(error);
        if (error.response.status === 429) {
            modalAlert.value = true;
        }
    });
}

function register() {
    if (userInput.password !== userInput.confirmPassword) {
        useAuthStore().displayErrorMessage('Les mots de passe ne correspondent pas');
    } else {
        if (userInput.password.length >= 8 && userInput.password.length <= 12) {
            useAuthStore().register(userInput.lastname, userInput.firstname, userInput.email, userInput.password, userInput.confirmPassword).then((response) => {
                router.push('/app/home');
                hasAccount.value = true;
            }).catch((error) => {
                console.log(error);
                if (error.response.status === 429) {
                    console.log('je passe ici');
                    modalAlert.value = !modalAlert.value;
                }
            })
        }
    }
}

function closeModal() {
    modalAlert.value = false;
}
</script>
<template>
    <div class="home">
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
                    <form @submit.prevent="login">
                        <div class="container__content__form__login">
                            <label for="email">Email</label>
                            <input type="email" id="email" :class="[invalidEmail ? 'invalidInput' : 'default']"
                                v-model="loginInput.email" required />
                            <p v-if="invalidEmail" class="invalidText">Adresse email incorrecte</p>
                        </div>
                        <div class="container__content__form__login">
                            <label for="password">Mot de passe</label>
                            <input type="password" id="password"
                                v-bind:class="[invalidPassword ? 'invalidInput' : 'default']"
                                v-model="loginInput.password" required />
                            <p v-if="invalidPassword" class="invalidText">Mot de passe incorrect</p>
                        </div>
                        <div class="container__content__form__login">
                            <button>Connexion</button>
                        </div>
                        <Teleport to="body">
                            <div v-if="modalAlert" @click="modalAlert = false" class="calc">
                                <div @click.stop class="modal-container">
                                    <div class="modal-container__content">
                                        <div class="modal-container__content__header">
                                            <div class="modal-container__content__header__title">
                                                {{ warningMessage }}
                                            </div>
                                        </div>
                                        <div class="modal-container__content__footer">
                                            <button @click="closeModal" type="button"
                                                class="btn btn-primary">Fermer</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Teleport>
                        <div class="container__content__form__message">
                            Vous n'avez pas encore de compte ? <span v-if="hasAccount"
                                @click="hasAccount = false">Inscrivez-vous gratuitement</span>
                        </div>
                    </form>
                </div>
                <div v-else class="container__content__form">
                    <ul class="container__content__form__alert" v-if="errorMessage">
                        {{ errorMessage }}
                    </ul>
                    <form @submit.prevent="register">
                        <div class="container__content__form__information">
                            <div class="container__content__form__information__lastname">
                                <label for="lastname">Nom</label>
                                <input type="text" id="lastname" v-model="userInput.lastname" required />
                            </div>
                            <div class="container__content__form__information__firstname">
                                <label for="firstname">Prénom</label>
                                <input type="text" id="firstname" v-model="userInput.firstname" required />
                            </div>
                            <div class="container__content__form__information__email">
                                <label for="email">Email</label>
                                <input type="email" id="email" v-model="userInput.email" required />
                            </div>
                        </div>
                        <div class="container__content__form__password">
                            <div class="container__content__form__password__input">
                                <label for="password">Mot de passe</label>
                                <input type="password" id="password" v-model="userInput.password" required />
                                <ul class="message">La longueur du mot de passe doit être comprise entre 8 et 12
                                    caractères et doit contenir au minimum :
                                    <li>1 minuscule 1 majuscule 2 chiffres</li>
                                </ul>
                            </div>
                            <div class="container__content__form__password__confirm-input">
                                <label for="confirmPassword">Confirmation du mot de passe</label>
                                <input type="password" id="confirmPassword" v-model="userInput.confirmPassword"
                                    required />
                            </div>
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
</template>
<style scoped lang="scss">
@import '../styles/Components/buttons';
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
    height: 100vh;
    overflow-x: hidden;

    &__picture {
        img {
            z-index: -1;
            object-fit: cover;
            position: absolute;
            left: 0;
            width: 100%;
            height: 100%;
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
        justify-content: center;

        span {
            color: #FD2D01;
        }


        &__header {
            @media only screen and (min-width: 769px) {
                position: absolute;
                top: 80px;
            }

            &__title {
                h1 {
                    font-size: 30px;
                    font-weight: bold;
                    -webkit-animation: focus-in-expand 0.8s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                    animation: focus-in-expand 0.8s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                }
            }

            &__message {
                text-align: center;

                p {
                    -webkit-animation: text-focus-in 0.8s cubic-bezier(0.215, 0.610, 0.355, 1.000) 1.6s both;
                    animation: text-focus-in 0.8s cubic-bezier(0.215, 0.610, 0.355, 1.000) 1.6s both;
                }
            }
        }

        &__content {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            width: 38%;
            -webkit-animation: slide-out-blurred-bottom 0.8s cubic-bezier(0.755, 0.050, 0.855, 0.060) 0.8s reverse both;
            animation: slide-out-blurred-bottom 0.8s cubic-bezier(0.755, 0.050, 0.855, 0.060) 0.8s reverse both;

            @media only screen and (min-width: 769px) {
                position: relative;
                top: 20px;
            }

            &__form {
                border-radius: 5px;
                background: floralwhite;
                border: 1px solid #FD2D01;
                padding: 20px;
                width: 305px;
                -webkit-animation: focus-in-expand 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                animation: focus-in-expand 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;

                form {
                    display: flex;
                    flex-direction: column;
                }

                &__alert {
                    background-color: #FF7A79;
                    color: #FFFFFF !important;
                    padding: 5px;
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 10px;
                    font-size: 12px;
                    border-radius: 5px;
                    border: 1px solid #FD2D01;
                }

                &__information {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    flex-direction: column;

                    &__lastname,
                    &__firstname,
                    &__email {
                        display: flex;
                        flex-direction: column;
                        text-align: center;
                        font-weight: 300;
                        margin-bottom: 10px;

                        input {
                            text-align: center;
                            border: 1px solid #dbdbdb;
                            border-radius: 5px;
                        }
                    }

                }

                &__password {
                    &__input {
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                        font-weight: 300;
                        margin-bottom: 10px;

                        input {
                            text-align: center;
                            border: 1px solid #dbdbdb;
                            border-radius: 5px 5px 0 0;
                        }

                        .message {
                            background-color: #f5f5f5;
                            border-bottom: 1px solid #dbdbdb;
                            border-left: 1px solid #dbdbdb;
                            border-right: 1px solid #dbdbdb;
                            border-radius: 0 0 5px 5px;
                            padding: 5px;
                            color: #4E5166;
                            font-size: 12px;
                        }
                    }

                    &__confirm-input {
                        width: 100%;
                        text-align: center;
                        font-weight: 300;
                        display: flex;
                        flex-direction: column;
                        margin-bottom: 10px;

                        input {
                            text-align: center;
                            border: 1px solid #dbdbdb;
                            border-radius: 5px;
                        }
                    }
                }


                &__register {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
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

                &__login {
                    font-weight: 300;
                    margin-bottom: 15px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;

                    input {
                        text-align: center;
                    }

                    .invalidInput {
                        border: 1px solid #FD2D01;
                        border-radius: 5px;
                        -webkit-animation: shake-horizontal 0.4s cubic-bezier(0.455, 0.030, 0.515, 0.955) both;
                        animation: shake-horizontal 0.4s cubic-bezier(0.455, 0.030, 0.515, 0.955) both;
                    }

                    .default {
                        border-radius: 5px;
                        border: 1px solid #dbdbdb;
                        text-align: center;
                    }

                    .invalidText {
                        color: #FD2D01;
                        margin-top: 5px;
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
                    text-align: center;
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

.calc {
    position: fixed;
    top: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 99;
}

.modal-container {
    background-color: #FFF;
    color: #4E5166;
    padding: 20px;
    border-radius: 5px;
    width: 300px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    backdrop-filter: blur(2px);
    transition: all 0.3s ease-in-out;
    transform: translateY(-100px);
    transform-origin: center;

    &__content {
        width: 100%;

        &__header {

            &__title {
                margin-bottom: 20px;
                margin-top: 0;

                span {
                    color: $color-primary;
                    font-weight: 600;
                }
            }
        }

        &__footer {
            display: flex;
            justify-content: flex-end;

            .btn.btn-primary {
                @include button-primary;
                margin-left: 10px;
            }

            .btn.btn-secondary {
                @include button-secondary;
            }
        }
    }
}
</style>