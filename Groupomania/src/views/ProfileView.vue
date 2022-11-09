<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
import { useRouter } from 'vue-router';
import socket from '@/socket';
const router = useRouter();

// isConnected va nous permettre de savoir si nous sommes connectés ou non
const isConnected = computed(() => useAuthStore().$state.isConnected);

// user va nous permettre de récupérer nos informations en tant qu'utilisateur
const user = computed(() => useAuthStore().$state.user);

// userEdit va nous permettre de récupérer les différents champs de saisie de texte et l'image de profil
let userEdit = reactive({
    picture_url: user.value.picture_url,
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: ''
});

// updatedProfil va permettre d'afficher une alerte si la modification du profil a été effectuée
let updatedProfil = ref(false);

// inputError va nous permettre de signaler les erreurs de saisie
let inputError = ref(false);

// errorMessage va nous permettre d'afficher le message d'erreur
let errorMessage = ref('');

// changed va nous permettre de vérifier que nous avons bien modifié au moins un champ afin de permettre l'affichage du bouton 'sauvegarder les modifications'
let changed = ref(false);

// wrongFile va nous permettre d'afficher un message d'erreur dans le cas où l'utilisateur aurait sélectionné une image dans un format autre que celui attendu
let wrongFile = ref(false);

// changePicture va nous permettre de déclencher le clic sur le bouton original afin de pouvoir sélectionner une image
function changePicture() {
    document.getElementById("file").click();
}

// Cette fonction va nous permettre de prévisualiser l'image sélectionnée
function previewPicture(e: any) {
    // On réinitialise le message d'erreur pour qu'il puisse ne pas s'afficher si l'image est au bon format dans le cas contraire il s'affichera de nouveau
    wrongFile.value = false;
    // On sélectionne la balise img où l'on disposera la prévisualisation de l'image où l'on disposera l'image sélectionner
    const image = document.getElementById('picture');
    // On récupère le fichier sélectionné et on l'attribue à la variable userEdit sur la propriété picture_url
    userEdit.picture_url = e.target.files[0];
    // Si userEdit.picture_url comporte une valeur on va créer un objet FileReader qui va nous permettre de lire le contenu du fichier sélectionné
    userEdit.picture_url ? image.src = URL.createObjectURL(userEdit.picture_url) : "";
}

// Cette fonction va procéder à différentes vérifications au niveau des champs de saisie et s'il y a une image sélectionnée vérifier si elle est au bon format 
// pour par la suite déclencher la fonction qui communiquera à l'api les modifications que l'on souhaite apporter
function updateProfile(userEdit?: any) {
    if (userEdit.password != userEdit.confirmPassword) {
        errorMessage.value = 'Les mots de passe ne correspondent pas';
        inputError.value = true;
    } else if (userEdit.email != userEdit.confirmEmail) {
        errorMessage.value = 'Les emails ne correspondent pas';
        inputError.value = true;
    } else {
        if (userEdit.email == '' && userEdit.password == '' && userEdit.picture_url == user.value.picture_url) {
            errorMessage.value = 'Aucune modification n\'a été apportée';
            inputError.value = true;
        } else {
            // Si nous avons sélectionné une image on va vérifier si elle est au bon format
            if (userEdit.picture_url) {
                if (userEdit.picture_url.type == 'image/jpg'
                    || userEdit.picture_url.type == 'image/jpeg'
                    || userEdit.picture_url.type == 'image/png'
                    || userEdit.picture_url.type == 'image/webp') {
                    useAuthStore().updateProfile(userEdit).then((response: any) => {
                        if (response.status == 200) {
                            // Si la modification a été effectuée on va déclencher l'alerte que le profil a bien été mis à jour et on va réinitialiser la variable indiquant qu'il y a une erreur de saisie
                            inputError ? inputError.value = false : "";
                            updatedProfil.value = true;
                            setTimeout(() => {
                                // On émet l'évènement en lien avec la modification du profil afin de mettre à jour les informations dans le store des autres utilisateurs connectés
                                socket.emit('update profil', response, user.value);
                                updatedProfil.value = false;
                                // Puis nous sommes redirigés vers la page d'accueil au bout de 2 secondes
                                router.push('/app/home');
                            }, 2000);
                        } else {
                            alert('Erreur lors de la mise à jour du profil');
                        }
                    });
                } else {
                    // Si l'image est au format string c'est que l'utilisateur n'a pas sélectionné d'image
                    if (typeof (userEdit.picture_url) == 'string') {
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
                        // Si l'image est dans un format différent de celui attendu on va afficher un message d'erreur
                    } else {
                        wrongFile.value = true;
                        errorMessage.value = 'Seuls les images aux formats .jpg .jpeg .png .webp sont acceptées';
                    }
                }
                // Si nous n'avons pas sélectionné d'image on va directement déclencher la fonction qui communiquera à l'api les modifications que l'on souhaite apporter
            } else {
                useAuthStore().updateProfile(userEdit).then((response: any) => {
                    if (response.status == 200) {
                        inputError ? inputError.value = false : "";
                        updatedProfil.value = true;
                        setTimeout(() => {
                            // Et on émet l'évènement en lien avec la modification du profil afin de mettre à jour les informations dans le store des autres utilisateurs connectés
                            socket.emit('update profil', response, user.value);
                            updatedProfil.value = false;
                            // Puis nous sommes redirigés vers la page d'accueil au bout de 2 secondes
                            router.push('/app/home');
                        }, 2000);
                    } else {
                        alert('Erreur lors de la mise à jour du profil');
                    }
                });
            }
        }
    }
}

// On place un watch sur les différents champs de saisie afin de pouvoir afficher le bouton de validation de la modification du profil 
// lorsque aura au moins un champ de saisie rempli ou une image sélectionnée
watch(userEdit, (value: any) => {
    if (value.email !== '' && value.email == value.confirmEmail
        || value.password !== '' && value.password == value.confirmPassword
        || value.picture_url && value.picture_url !== user.value.picture_url) {
        changed.value = true;
    } else {
        changed.value = false;
    }
})
</script>
<template>
    <div v-if="isConnected" class="container">
        <div class="edit-profil">
            <div class="edit-profil__title">
                <h1>Editer mon profil</h1>
            </div>
            <div v-if="updatedProfil" class="edit-profil__notification success">
            <!-- <div class="edit-profil__notification success"> -->
                <p>Profil mis à jour ! <span>Vous allez être redirigé dans 2 secondes..</span></p>
            </div>
            <div v-if="inputError || wrongFile" class="edit-profil__notification verifyInput">
            <!-- <div class="edit-profil__notification verifyInput"> -->
                <fa icon="fa-solid fa-triangle-exclamation" />
                <p>{{ errorMessage }}</p>
            </div>
            <div class="edit-profil__body">
                <div class="edit-profil__body__content">
                    <div class="edit-profil__body__content__picture">
                        <img :src="user.picture_url" alt="profil picture" id="picture" @click="changePicture" />
                        <fa icon="fa-solid fa-pen" @click="changePicture" />
                        <input type="file" class="input-file" id="file" accept="image/*"
                            @change="previewPicture($event)" />
                    </div>
                    <div class="edit-profil__body__content__form">
                        <form @submit.prevent="updateProfile(userEdit)">
                            <div class="edit-profil__body__content__form__input">
                                <label for="email">Email</label>
                                <input type="email" id="email" v-model="userEdit.email" />
                            </div>
                            <div class="edit-profil__body__content__form__input">
                                <label for="confirmEmail">Confirmer l'email</label>
                                <input type="email" id="confirmEmail" v-model="userEdit.confirmEmail" />
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
        background-color: #f6f6f6;
        padding: 20px;
        border-radius: 20px;
        margin: 40px auto auto auto;
        border: 1px solid #dbdbdb;
        transition: all 0.3s ease-in-out;
        position: relative;

        &__notification {
            // height: 20px;
            border-radius: 10px;
            display: flex;
            justify-content: center;
            font-weight: 300;
            margin-bottom: 20px;
            padding: 10px;
            position: absolute;
            right: 20px;
            top: 20px;
            box-shadow: rgb(0 0 0 / 22%) 0px 2px 18px 0px;
            span {
                font-weight: 300;
            }

            svg {
                margin-right: 10px;
            }

            &.success {
                color: black;
                background: #FD2D01;
                color: #ffffff;
                font-weight: 500;

                p {
                    color: #ffffff;
                    display: flex;
                    flex-direction: column;
                    span {

                    }
                }
            }

            &.verifyInput {
                background-color: #4E5166;
                color: #ffffff;
                font-weight: 500;

                p {
                    color: #ffffff;
                }
            }
        }

        &__title {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 50px;
            border-radius: 5px;
            margin-bottom: 20px;

            h1 {
                font-size: 16px;
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
                background-color: #f6f6f6;
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
                        cursor: pointer;
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
                        font-size: 12px;
                        z-index: 1;
                        cursor: pointer;
                    }

                    .input-file {
                        position: absolute;
                        top: 80%;
                        left: 80%;
                        border: 1px solid #4E5166;
                        padding: 4px;
                        border-radius: 50%;
                        transform: translate(-50%, -50%);
                        font-size: 14px;
                        width: 15px;
                        height: 15px;
                        opacity: 0;
                    }
                }

                &__form {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    background-color: #f6f6f6;
                    border-radius: 0 0 5px 5px;
                    margin-top: 20px;
                    transition: all 0.3s ease-in-out;

                    &__input {
                        display: flex;
                        flex-direction: column;
                        align-items: center;

                        input {
                            border: 1px solid #dbdbdb;
                            border-radius: 10px;
                            padding: 5px;

                            &:focus {
                                outline: none;
                            }
                        }

                        .input-file {
                            border: none;
                        }

                        label {
                            font-size: 14px;
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
                        border-radius: 0 0 5px 5px;
                        transition: all 0.3s ease-in-out;

                        button {
                            background-color: #f6f6f6;
                            color: #FD2D01;
                            padding: 10px;
                            border: 1px solid #FD2D01;
                            border-radius: 10px;
                            cursor: pointer;
                            transition: all 0.3s ease-in-out;

                            &:hover {
                                background-color: #FD2D01;
                                color: #ffffff;
                                transition: .3s all ease-in-out;
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