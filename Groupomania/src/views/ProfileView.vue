<script setup lang="ts">
import { computed, ref, reactive } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
import NavigationBar from '../components/NavigationBar.vue';

localStorage.getItem('token') !== null ? useAuthStore().getMyInformations() : window.location.href = '/';

const isConnected = computed(() => useAuthStore().$state.isConnected);
const user = computed(() => useAuthStore().$state.user);

let userEdit = reactive({
    picture_url: user.value.picture_url,
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: ''
});

function logout() {
    useAuthStore().logout();
    window.location.href = '/';
};


function previewPicture(e: any) {
    const image = document.getElementById('picture');
    userEdit.picture_url = e.target.files[0];
    userEdit.picture_url ? image.src = URL.createObjectURL(userEdit.picture_url) : "";
}

function updateProfile(userEdit?: any) {
    userEdit.password != userEdit.confirmPassword ? alert('Les mots de passe ne correspondent pas') : userEdit.email != userEdit.confirmEmail ? alert('Les emails ne correspondent pas') : useAuthStore().updateProfile(update);
}
</script>
<template>
    <div>
        <NavigationBar :user="user" :isConnected="isConnected" @logout="logout()" />
        <div v-if="isConnected" class="container">
            <div class="edit-profil">
                <div class="edit-profil__title">
                    <h1>Editer mon profil</h1>
                </div>
                <div class="edit-profil__body">
                    <div class="edit-profil__body__content">
                        <div class="edit-profil__body__content__picture">
                            <img :src="user.picture_url" alt="profil picture" id="picture" />
                        </div>
                        <div class="edit-profil__body__content__form">
                            <form @submit.prevent="updateProfile(userEdit)">
                                <div class="edit-profil__body__content__form__input">
                                    <label for="picture">Photo de profil</label>
                                    <input type="file" class="input-file" accept="image/*"
                                        @change="previewPicture($event)" />
                                </div>
                                <div class="edit-profil__body__content__form__input">
                                    <label for="email">Email</label>
                                    <input type="text" id="email" v-model="userEdit.email" />
                                </div>
                                <div class="edit-profil__body__content__form__input">
                                    <label for="confirmEmail">Confirmation de l'adresse email</label>
                                    <input type="text" id="confirmEmail" v-model="userEdit.confirmEmail" />
                                </div>
                                <div class="edit-profil__body__content__form__input">
                                    <label for="password">Mot de passe</label>
                                    <input type="password" id="password" v-model="userEdit.password" />
                                </div>
                                <div class="edit-profil__body__content__form__input">
                                    <label for="confirmPassword">Confirmation du mot de passe</label>
                                    <input type="password" id="confirmPassword" v-model="userEdit.confirmPassword" />
                                </div>
                                <div class="edit-profil__body__content__form__button">
                                    <button>Annuler</button>
                                    <button>Confirmer</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
@import '../styles/Components/buttons';


* {
    font-family: 'Lato', sans-serif;
}

.container {
    display: flex;
    flex-direction: column;

    .edit-profil {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 70%;
        height: 100%;
        background-color: #FFF;
        padding: 20px;
        border-radius: 5px;
        margin: 40px auto auto auto;
        border: 1px solid #FD2D01;
        transition: all 0.3s ease-in-out;

        &__title {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 50px;
            background-color: #FFF;
            border-radius: 5px 5px 0 0;

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
                background-color: #FFF;
                border-radius: 0 0 5px 5px;

                &__picture {
                    display: flex;
                    border-radius: 35px;

                    img {
                        border: transparent 3px solid;
                        width: 80px;
                        height: 80px;
                        border-radius: 45px;
                        object-fit: cover;
                    }
                }

                &__form {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    background-color: #FFF;
                    border-radius: 0 0 5px 5px;
                    margin-top: 20px;
                    transition: all 0.3s ease-in-out;

                    &__input {
                        display: flex;
                        flex-direction: column;
                        align-items: center;

                        input {
                            border: 1px solid #FD2D01;
                            border-radius: 5px;
                        }

                        .input-file {
                            border: none;
                        }

                        label {
                            font-size: 20px;
                            color: #4E5166;
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
                        background-color: #FFF;
                        border-radius: 0 0 5px 5px;
                        transition: all 0.3s ease-in-out;

                        button {
                            margin-left: 5px;
                            background-color: #FFFFFF;
                            border-color: #FD2D01;
                            color: #FD2D01;
                            padding: 10px;
                            border: 1px solid #FD2D01;
                            border-radius: 5px;
                            cursor: pointer;
                            transition: all 0.3s ease-in-out;
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