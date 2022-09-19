<script setup lang="ts">
import { computed, ref, reactive } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
import { useRouter } from 'vue-router';
import socket from '@/socket';
const router = useRouter();

const isConnected = computed(() => useAuthStore().$state.isConnected);
const user = computed(() => useAuthStore().$state.user);

let userEdit = reactive({
    picture_url: user.value.picture_url,
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: ''
});

let updatedProfil = ref(false);
let inputError = ref(false);
let errorMessage = ref('');
let changed = ref(false);

function previewPicture(e: any) {
    const image = document.getElementById('picture');
    userEdit.picture_url = e.target.files[0];
    console.log(userEdit.picture_url);
    userEdit.picture_url ? image.src = URL.createObjectURL(userEdit.picture_url) : "";
    changed.value = true
}

function checkForm() {
    if (userEdit.email || userEdit.password) {
        changed.value = true;
    } else {
        changed.value = false;
    }
}

function updateProfile(userEdit?: any) {
    if (userEdit.password != userEdit.confirmPassword) {
        errorMessage.value = 'Les mots de passe ne correspondent pas';
        inputError.value = true;
    } else if (userEdit.email != userEdit.confirmEmail) {
        errorMessage.value = 'Les emails ne correspondent pas';
        inputError.value = true;
    } else {
        console.log(userEdit);
        if (userEdit.email == '' && userEdit.password == '' && userEdit.picture_url == user.value.picture_url) {
            errorMessage.value = 'Aucune modification n\'a été apportée';
            inputError.value = true;
        } else {
            useAuthStore().updateProfile(userEdit).then((response: any) => {
                if (response.status == 200) {
                    inputError ? inputError.value = false : "";
                    updatedProfil.value = true;
                    setTimeout(() => {
                        socket.emit('update profil', response, user.value);
                        updatedProfil.value = false;
                        router.push('/app/home');
                    }, 2000);
                } else {
                    alert('Erreur lors de la mise à jour du profil');
                }
            });
        }
    }
}
</script>
<template>
    <div v-if="isConnected" class="container">
        <div class="edit-profil">
            <div class="edit-profil__title">
                <h1>Editer mon profil</h1>
            </div>
            <div v-if="updatedProfil" class="edit-profil__notification success">
                <fa icon="fa-solid fa-check" />
                <p>Profil mis à jour !</p>
            </div>
            <div v-if="inputError" class="edit-profil__notification verifyInput">
                <fa icon="fa-solid fa-triangle-exclamation" />
                <p>{{ errorMessage }}</p>
            </div>
            <div class="edit-profil__body">
                <div class="edit-profil__body__content">
                    <div class="edit-profil__body__content__picture">
                        <img :src="user.picture_url" alt="profil picture" id="picture" />
                        <fa icon="fa-solid fa-pen" />
                        <input type="file" class="input-file" accept="image/*" @change="previewPicture($event)" />
                    </div>
                    <div class="edit-profil__body__content__form">
                        <form @submit.prevent="updateProfile(userEdit)" @change="checkForm">
                            <div class="edit-profil__body__content__form__input">
                                <label for="email">Email</label>
                                <input type="text" id="email" v-model="userEdit.email" />
                            </div>
                            <div class="edit-profil__body__content__form__input">
                                <label for="confirmEmail">Confirmer l'email</label>
                                <input type="text" id="confirmEmail" v-model="userEdit.confirmEmail" />
                            </div>
                            <div class="edit-profil__body__content__form__input">
                                <label for="password">Mot de passe</label>
                                <input type="password" id="password" v-model="userEdit.password" />
                            </div>
                            <div class="edit-profil__body__content__form__input">
                                <label for="confirmPassword">Confirmer le mot de passe</label>
                                <input type="password" id="confirmPassword" v-model="userEdit.confirmPassword" />
                            </div>
                            <div v-if="changed"
                                v-bind:class="[changed ? 'edit-profil__body__content__form__button' : 'edit-profil__body__content__form__button disabled']">
                                <button>Valider les modifications</button>
                            </div>
                        </form>
                    </div>
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

.container {
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    -webkit-animation: slide-in-bottom 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.2s both;
    animation: slide-in-bottom 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.2s both;

    .edit-profil {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 70%;
        height: 100%;
        background-color: floralwhite;
        padding: 20px;
        border-radius: 5px;
        margin: 40px auto auto auto;
        border: 1px solid #FD2D01;
        transition: all 0.3s ease-in-out;

        &__notification {
            height: 20px;
            width: 100%;
            border-radius: 5px;
            display: flex;
            justify-content: center;
            font-weight: 300;
            margin-bottom: 20px;

            svg {
                margin-right: 10px;
            }

            &.success {
                color: black;
                background: #BCFFCB;
                border: 1px solid darkgreen;
            }

            &.verifyInput {
                color: #FFFFFF;
                background-color: #FF7A79;
                border: 1px solid darkred;
            }
        }

        &__title {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 50px;
            background-color: #ffffff;
            border-radius: 5px;
            border: 1px solid #dbdbdb;
            margin-bottom: 20px;

            h1 {
                font-size: 20px;
                color: #4E5166;
            }
        }

        &__body {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            height: 100%;
            background-color: #FFF;
            border-radius: 0 0 5px 5px;


            &__content {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                height: 100%;
                background-color: floralwhite;
                border-radius: 0 0 5px 5px;

                &__picture {
                    display: flex;
                    border-radius: 35px;
                    position: relative;

                    img {
                        border: 1px solid #dbdbdb;
                        width: 80px;
                        height: 80px;
                        border-radius: 45px;
                        object-fit: cover;
                    }

                    svg {
                        position: absolute;
                        top: 80%;
                        left: 80%;
                        background: #ffffff;
                        border: 1px solid #dbdbdb;
                        padding: 5px;
                        border-radius: 50%;
                        transform: translate(-50%, -50%);
                        color: #4E5166;
                        font-size: 20px;
                        font-size: 15px;
                        opacity: 1;
                    }

                    .input-file {
                        position: absolute;
                        top: 80%;
                        left: 80%;
                        border: 1px solid #4E5166;
                        padding: 5px;
                        border-radius: 50%;
                        transform: translate(-50%, -50%);
                        font-size: 15px;
                        width: 15px;
                        height: 15px;
                        opacity: 0;
                        z-index: 10;
                    }
                }

                &__form {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    background-color: floralwhite;
                    border-radius: 0 0 5px 5px;
                    margin-top: 20px;
                    transition: all 0.3s ease-in-out;

                    &__input {
                        display: flex;
                        flex-direction: column;
                        align-items: center;

                        input {
                            border: 1px solid #dbdbdb;
                            border-radius: 5px;
                        }

                        .input-file {
                            border: none;
                        }

                        label {
                            font-size: 20px;
                            color: #FD2D01;
                            margin-top: 15px;
                            margin-bottom: 5px;
                        }

                    }

                    &__button {
                        margin-top: 15px;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        height: 50px;
                        background-color: floralwhite;
                        border-radius: 0 0 5px 5px;
                        transition: all 0.3s ease-in-out;

                        button {
                            margin-left: 5px;
                            background-color: #FFFFFF;
                            border-color: #bcffcb;
                            color: darkgreen;
                            padding: 10px;
                            border: 1px solid darkgreen;
                            border-radius: 5px;
                            cursor: pointer;
                            transition: all 0.3s ease-in-out;

                            &:hover {
                                background-color: #bcffcb;
                                border-color: darkgreen;
                            }
                        }

                        button:nth-child(2) {
                            background-color: #FD2D01;
                            color: #FFFFFF;
                        }
                    }
                }
            }
        }
    }
}
</style>