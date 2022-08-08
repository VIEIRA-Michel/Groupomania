<script setup lang="ts">
import { computed, ref, reactive } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
import NavigationBar from '../components/NavigationBar.vue';

const authStore = useAuthStore();

checkIsConnected();

const isConnected = computed(() => {
    return authStore.$state.isConnected;
});
const user = computed(() => {
    return authStore.$state.user;
});

function checkIsConnected() {
    if (localStorage.getItem('token') !== null) {
        authStore.getMyInformations();
    } else {
        window.location.href = '/';
    }
};
function logout() {
    authStore.logout();
    window.location.href = '/';
};

let userEdit = reactive({
    // email: user.value.email,
    // firstname: user.value.firstname,
    // lastname: user.value.lastname,
    picture_url: user.value.picture_url,
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: ''
});

function previewPicture(e: any) {
    const image = document.getElementById('picture');
    userEdit.picture_url = e.target.files[0];
    if (userEdit.picture_url) {
        image.src = URL.createObjectURL(userEdit.picture_url);
    }
}

function updateProfile(update?: any) {
    if (update.password != update.confirmPassword) {
        alert('Les mots de passe ne correspondent pas');
        return;
    } else if (update.email != update.confirmEmail) {
        alert('Les adresses email ne correspondent pas');
        return;
    } else {
        authStore.updateProfile(update);
    }
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
                                    <input type="file" accept="image/*" @change="previewPicture($event)" />
                                </div>
                                <!-- <div class="edit-profil__body__content__form__input">
                                    <label for="lastname">Date de naissance</label>
                                    <input type="date" id="birthday" v-model="userEdit.birthday" />
                                </div> -->
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
    padding: 10px;
    border-radius: 5px;
    color: #FFF !important;
    cursor: pointer;
}

.logo {
    display: flex;
    align-items: center;
    padding-left: 3%;
    width: 40%;
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
        border-radius: 20px;
        margin: 40px auto auto auto;
        box-shadow: 0px 0px 0.75rem #4E5166;
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
                    width: 70px;
                    height: 70px;
                    border-radius: 35px;

                    img {
                        border: #FFD7D7 3px solid;
                        width: 70px;
                        height: 70px;
                        border-radius: 35px;
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

                        label {
                            font-size: 20px;
                            color: #4E5166;
                            margin-top: 15px;
                            margin-bottom: 5px;
                        }
                    }

                    &__button {
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
                        }
                    }
                }
            }
        }
    }
}
</style>