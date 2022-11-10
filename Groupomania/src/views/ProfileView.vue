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
    // picture_url: user.value.picture_url,
    picture_url: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: ''
});

let emailCheck = ref(true);

let passwordCheck = ref(true);

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
function updateProfile(e: Event) {
    e?.preventDefault();
    let formData = new FormData();
    // On crée une regex afin de vérifier la conformité du mot de passe et veiller à ce qu'il ne contient pas de caractère spéciaux
    let formRegexp = /^[^@&"()!_$*€£`+=\/;?#]+$/;
    if (userEdit.picture_url !== '') {
        if (userEdit.picture_url.type == 'image/jpg'
            || userEdit.picture_url.type == 'image/jpeg'
            || userEdit.picture_url.type == 'image/png'
            || userEdit.picture_url.type == 'image/webp') {
            formData.append('picture', userEdit.picture_url);
        }
    }
    // Si le champ de saisie de l'email n'est pas vide
    if (userEdit.email !== '') {
        // Mais que l'email et la confirmation d'email ne correspondent pas nous affichons une erreur
        if (userEdit.email != userEdit.confirmEmail) {
            errorMessage.value = 'Les emails ne correspondent pas';
            inputError.value = true;
            emailCheck.value = false;
        } else {
            // Dans le cas contraire nous ajoutons à notre formData la clef email ainsi que la valeur saisie
            formData.append('email', userEdit.email);
            // Et nous passons notre valeur emailCheck pour indiquer que le champ est conforme pour la soumission
            emailCheck.value = true;
        }
    }
    // Si le champ de saisie du mot de passe n'est pas vide
    if (userEdit.password !== '') {
        // Mais que le mot de passe et la confirmation du mot de passe ne correspondent pas nous affichons une erreur
        if (userEdit.password != userEdit.confirmPassword) {
            errorMessage.value = 'Les mots de passe ne correspondent pas';
            inputError.value = true;
            passwordCheck.value = false
        } else if (userEdit.password == userEdit.confirmPassword && (userEdit.password.trim().length < 8 || userEdit.password.trim().length > 12)) {
            errorMessage.value = 'Le mot de passe ne respecte pas le format préconisé';
            inputError.value = true;
            passwordCheck.value = false
        } else if (userEdit.password == userEdit.confirmPassword && (userEdit.password.trim().length >= 8 || userEdit.password.trim().length <= 12) && formRegexp.test(userEdit.password) == false) {
            errorMessage.value = 'Le mot de passe ne peut contenir de caractère spéciaux';
            inputError.value = true;
            passwordCheck.value = false
        } else {
            //Dans le cas contraire nous ajoutons à notre formData la clef password ainsi que la valeur saisie
            formData.append('password', userEdit.password);
            // Et nous passons notre valeur passwordCheck pour indiquer que le champ est conforme pour la soumission
            passwordCheck.value = true;
        }
    }
    // Nous vérifions qu'au moins un champ du formulaire a été modifié
    if (userEdit.picture_url !== '' || userEdit.email !== '' || userEdit.password !== '') {
        // Si les champs concernant le mot de passe et l'email sont bien conforme alors nous déclenchons la fonction qui va permettre la modification du state
        if (emailCheck.value && passwordCheck.value) {
            useAuthStore().updateProfile(formData).then((response: any) => {
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
            })
        }
    }

}

// Cette fonction va nous permettre de réinitialiser le formulaire
function resetForm() {
    // On sélectionne la div pour lui attribuer de nouveau notre photo de profil
    const image: HTMLElement | null = document.getElementById('picture');
    image.src = user.value.picture_url;
    const initialValue = reactive({
        picture_url: '',
        email: '',
        confirmEmail: '',
        password: '',
        confirmPassword: ''
    });
    // Et on réinitialise les valeurs de l'objet que nous sommes censé envoyer pour mettre à jour notre profil
    Object.assign(userEdit, initialValue);
}

// On place un watch sur les différents champs de saisie afin de pouvoir afficher le bouton de validation de la modification du profil 
// lorsque aura au moins un champ de saisie rempli ou une image sélectionnée
watch(userEdit, (value: any) => {
    if (value.email !== '' && value.email == value.confirmEmail
        || value.password !== '' && value.password == value.confirmPassword
        || value.picture_url !== '' && value.picture_url !== user.value.picture_url) {
        changed.value = true;
    } else {
        changed.value = false;
    }

    if (value.email == '' && value.confirmEmail == '') {
        emailCheck.value = true;
    }
    if (value.password == '' && value.confirmPassword == '') {
        passwordCheck.value = true;
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
                        <form>
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
                                <ul class="message">Le mot de passe doit contenir
                                    <li>• 8 à 12 caractères</li>
                                    <li>• 1 minuscule</li>
                                    <li>• 1 majuscule</li>
                                    <li>• 2 chiffres</li>
                                </ul>
                            </div>
                            <div class="edit-profil__body__content__form__input">
                                <label for="confirmPassword">Confirmer le mot de passe</label>
                                <input type="password" id="confirmPassword" v-model="userEdit.confirmPassword" />
                            </div>
                            <div v-if="changed"
                                :class="[changed ? 'edit-profil__body__content__form__button' : 'edit-profil__body__content__form__button disabled']">
                                <button @click="resetForm" class="cancel-button">Annuler</button>
                                <button @click="updateProfile($event)" class="apply-button">Enregistrer</button>
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

                    span {}
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

                        .message {
                            background-color: #dbdbdb;
                            color: #4E5166;
                            padding: 5px;
                            border-radius: 10px;
                            font-size: 12px;
                            margin-top: 15px;
                        }

                    }

                    &__button {
                        margin-top: 15px;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                        width: 100%;
                        height: 50px;
                        border-radius: 0 0 5px 5px;
                        transition: all 0.3s ease-in-out;

                        button {
                            background-color: #f6f6f6;
                            padding: 10px;
                            border-radius: 10px;
                            cursor: pointer;
                            transition: all 0.3s ease-in-out;
                        }

                        .cancel-button {
                            border: 1px solid #4E5166;
                            color: #4E5166;

                            &:hover {
                                background-color: #4E5166;
                                color: #ffffff;
                            }
                        }

                        .apply-button {
                            border: 1px solid #FD2D01;
                            color: #FD2D01;

                            &:hover {
                                background-color: #FD2D01;
                                color: #ffffff;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>