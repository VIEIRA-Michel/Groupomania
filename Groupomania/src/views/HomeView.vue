<script setup lang="ts">
import Loading from '../components/Loading.vue';
import Comment from '../components/Comment.vue';
import { computed, ref, watch, reactive, watchEffect, onBeforeMount } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
import { usePublicationsStore } from '../shared/stores/publicationsStore';
import { useCommentsStore } from '../shared/stores/commentsStore';
import socket from '../socket';
import { useOtherStore } from '@/shared/stores/otherStore';

// user va nous permettre de récupérer nos informations en tant qu'utilisateur
const user = computed(() => useAuthStore().$state.user);

// publications va nous permettre de récupérer les publications
const publications = computed(() => usePublicationsStore().$state.publications);

// isLoading va nous permettre de savoir si les publications ont fini de charger
const isLoading = computed(() => usePublicationsStore().$state.isLoading);

// numberOfPages va nous permettre de savoir le nombre de pages de publications
const numberOfPages = computed(() => usePublicationsStore().$state.numberOfPages);

// numOfResults va nous permettre de connaître le nombre total de publications
const numOfResults = computed(() => usePublicationsStore().$state.numOfResults);

// page va nous permettre de savoir sur quelle page où se situe
const page = computed(() => usePublicationsStore().$state.page);

// history va nous permettre de récupérer l'historique d'une publication qui a été modifier
const history = computed(() => usePublicationsStore().$state.history);

// selectedFile va nous permettre de récupérer le fichier sélectionné
let selectedFile: any = ref<any>();

// displayPicture va nous permettre d'afficher une prévisualisation de l'image quand une image aura été sélectionné
let displayPicture = ref(false);

// content va nous permettre de récupérer le texte que nous avons saisi dans le champ de création d'une publication
let content = ref<string>('');

// previewPicture va nous permettre de récupérer l'image que nous avons sélectionné
let previewPicture = reactive({
    picture: ''
});

// wrongFile va nous permettre de savoir si le fichier sélectionné est au bon format ou non
let wrongFile = ref(false);

// inputFileEdit va nous permettre de récupérer le fichier sélectionné dans la modification d'une publication
let inputFileEdit = ref<any>();

// tmpPicture va nous permettre de stocker la valeur de l'image de la publication avant modification dans le cas où l'utilisateur annule la modification ou ne supprime pas l'image durant la modification
let tmpPicture = ref<string>('');

// pictureHasHidden va nous permettre de savoir si nous désirons supprimer l'image de la publication ou non, il permettra alors dans un premier temps de cacher l'image lors de la prévisualisation 
// et si cette valeur est à true, lors de la modification si une image était présente dans la publication avant la modification elle sera supprimée
let pictureHasHidden = ref(false);

// publicationIdToEdit va nous permettre de stocker l'id de la publication que nous souhaitons modifier avant d'accéder au mode permettant la modification
let publicationIdToEdit = ref<string>('');

// buttonDisabled va nous permettre de définir ou non l'état du bouton permettant la sauvegarde des modifications apportées à une publication
let buttonDisabled = ref(false);

// wrongFileEdit va nous permettre de savoir si le fichier sélectionné est au bon format ou non
let wrongFileEdit = ref(false);

// modalRequest va nous permettre d'afficher une modal de confirmation avant de procéder à la suppression de la publication
let modalRequest = ref(false);

// publicationIdToDelete va nous permettre de stocker l'id de la publication que nous souhaitons supprimer avant d'accéder à l'action permettant la suppression
let publicationToDelete = ref();

// displayHistory va nous permettre d'afficher l'historique d'une publication
let displayHistory = ref(false);

// editPost va nous permettre de récupérer la saisie dans le champ de modification et l'image d'une publication avant la transmission au store
let editPost = reactive({
    content: '',
    picture: ''
});

// Cette fonction va nous permettre de récupérer le fichier sélectionné dans le champ permettant la création d'une publication et de l'afficher dans la prévisualisation
function onPickFile(event: any) {
    // On réinitialise le message d'erreur pour qu'il puisse ne pas s'afficher si l'image est au bon format dans le cas contraire il s'affichera de nouveau
    wrongFile.value = false;
    // On sélectionne la balise img où l'on disposera la prévisualisation de l'image où l'on disposera l'image sélectionner
    const image: any = document.getElementById('picture');
    previewPicture.picture = event.target.files[0];
    // On récupère le fichier sélectionné et on l'attribue à la variable selectedFile
    selectedFile.value = document.getElementById("file").value;
    // Si previewPicture.picture comporte une valeur on va créer un objet FileReader qui va nous permettre de lire le contenu du fichier sélectionné
    previewPicture.picture ? image.src = URL.createObjectURL(previewPicture.picture) : "";
    displayPicture.value = true;
};

// Cette fonction va nous permettre de redimensionner le champ de saisie de texte en fonction de la taille du texte saisi afin de toujours voir l'ensemble du texte saisi
function autoResize(event: any) {
    event.target.style.height = 'auto';
    event.target.style.height = event.target.scrollHeight + 'px';
};

// Cette fonction va procéder à différentes vérifications avant de faire appel à la fonction présente dans le store qui communique avec l'api
function createPublication(event: any) {
    // On vérifie si le champ de saisie de texte n'est pas vide et s'il y a une image de sélectionner
    if (previewPicture.picture && content.value) {
        // On vérifie que l'image sélectionnait est au bon format
        if (previewPicture.picture.type == 'image/jpg'
            || previewPicture.picture.type == 'image/jpeg'
            || previewPicture.picture.type == 'image/png'
            || previewPicture.picture.type == 'image/webp') {
            usePublicationsStore().addNewPublication(content.value, previewPicture.picture).then((response: any) => {
                // On émet l'évènement en lien afin de prévenir les autres utilisateurs que nous avons publié une nouvelle publication
                socket.emit('new publication', { publication: response, user: useAuthStore().$state.user });
                previewPicture.picture = '';
                content.value = '';
                removePicture('create');
            });
        } else {
            wrongFile.value = true;
        }
        // On vérifie s'il y a une image de sélectionner
    } else if (previewPicture.picture) {
        // On vérifie que l'image sélectionnait est au bon format
        if (previewPicture.picture.type == 'image/jpg'
            || previewPicture.picture.type == 'image/jpeg'
            || previewPicture.picture.type == 'image/png'
            || previewPicture.picture.type == 'image/webp') {
            usePublicationsStore().addNewPublication(null, previewPicture.picture).then((response: any) => {
                // On émet l'évènement en lien afin de prévenir les autres utilisateurs que nous avons publié une nouvelle publication
                socket.emit('new publication', { publication: response, user: useAuthStore().$state.user });
                previewPicture.picture = '';
                removePicture('create');
            });
        } else {
            wrongFile.value = true;
        }
    } else if (!previewPicture.picture && content.value
        || previewPicture.picture == null && content.value) {
        usePublicationsStore().addNewPublication(content.value, null).then((response: any) => {
            // On émet l'évènement en lien afin de prévenir les autres utilisateurs que nous avons publié une nouvelle publication
            socket.emit('new publication', { publication: response, user: useAuthStore().$state.user });
            content.value = '';
        });
    }
};

// Cette fonction va nous permettre de déclencher le clic sur le bouton permettant la sélection d'une image dans le champ de création d'une publication 
// ou dans le mode de modification d'une publication, car le bouton original est dissimulé
function chooseFile(option: string) {
    if (option == 'create') {
        document.getElementById("file").click();
    } else if (option == 'edit') {
        document.getElementById("file-edit").click();
    }
};

// Cette fonction va nous permettre de déclencher le mode de modification d'une publication
function activeEditMode(publication: any) {
    // On réinitialise la valeur de wrongfile afin de pouvoir afficher le message d'alerte à nouveau dans le cas où l'on sélectionne de nouveau une image au mauvais format
    wrongFileEdit.value = false;
    usePublicationsStore().activateEditMode(publication.publication_id).then((response: any) => {
        // On réinitialise la valeur de pictureHasHidden afin de pouvoir cacher l'image à nouveau dans le cas où l'on ne désire plus l'image précédemment sélectionné
        pictureHasHidden.value = false;
        // On stocke l'id de la publication que nous souhaitons modifier
        publicationIdToEdit.value = publication.publication_id.toString();
        // On stocke le contenue texte de la publication que nous souhaitons modifier afin de récupérer le texte déjà présent s'il y en a un
        editPost.content = publication.content;
        // On stocke l'image de la publication dans une variable temporaire s'il y en a une afin de pouvoir la ré-afficher dans le cas où l'on ne désire plus une image que nous avons par la suite sélectionner
        if (publication.picture) {
            tmpPicture.value = publication.picture;
        }
    });
};

// Cette fonction va nous permettre de récupérer le fichier sélectionné dans le mode de modification de publication et de l'afficher dans la prévisualisation
function editPickFile(event: any, publication: any) {
    // On réinitialise la valeur de pictureHasHidden afin de pouvoir prévisualiser l'image que l'on vient de sélectionner
    pictureHasHidden.value = false;
    // on stock l'image sélectionner dans une propriété liée au mode de modification afin de pouvoir par la suite prévisualiser l'image
    usePublicationsStore().previewMode(publication.publication_id, event.target.files[0]).then((response: any) => {
        inputFileEdit.value = document.getElementById("file-edit").value;
        publication.previewOnEdit ? document.getElementById(`${publication.publication_id.toString()}`).src = URL.createObjectURL(publication.previewOnEdit) : "";
    })
};

// Cette fonction va nous permettre de cacher l'affichage de l'image déjà présente dans la publication 
// ou que l'on vient de sélectionner dans le mode de modification de publication
function hideImageOnPost(publication: any) {
    tmpPicture.value = '';
    if (inputFileEdit.value) {
        removePicture('edit', publication.publication_id);
    }
    if (publication.previewOnEdit) {
        usePublicationsStore().resetPreview(publication.publication_id);
    }
    pictureHasHidden.value = true;
};

// Cette fonction va nous permettre de supprimer l'image d'une publication depuis le mode de modification d'une publication
function removePicture(option: string, publication_id?: number) {
    if (option == 'create') {
        document.getElementById("file").value = "";
        previewPicture.picture = null;
        selectedFile.value = null;
        displayPicture.value = false;
        wrongFile.value = false;
    } else if (option == 'edit') {
        usePublicationsStore().resetPreview(publication_id!).then((response: any) => {
            if (document.getElementById("file-edit")?.value) {
                document.getElementById("file-edit").value = "";
            }
            inputFileEdit.value = null;
            editPost.picture = null;
            if (pictureHasHidden.value) {
                pictureHasHidden.value = false;
            }
        })
        wrongFileEdit.value = false;
    }

};

// Cette fonction va nous permettre de sortir du mode de modification en annulant tout changement
function cancelModification(publication: any) {
    usePublicationsStore().activateEditMode(publication.publication_id, 'deactivate').then((response: any) => {
        if (pictureHasHidden.value) {
            pictureHasHidden.value = false;
        }
        if (publication.previewOnEdit) {
            usePublicationsStore().resetPreview(publication.publication_id).then((response: any) => {
                if (publication.picture) {
                    document.getElementById(`${publication.publication_id.toString()}`).src = publication.picture;
                }
            })
        }
        inputFileEdit.value = null;
    })
};

// Cette fonction va nous permettre de procéder à différentes vérifications avant de pouvoir faire appel à la fonction présente dans le store qui communique avec l'api afin de modifier une publication
function updatePublication(publication: any) {
    // Dans le cas où pictureHasHidden est à true, cela signifie que l'on souhaite supprimer l'image de la publication
    if (pictureHasHidden.value == true) {
        editPost.picture = '';
        // Dans le cas où previewOnEdit est différent de null, cela signifie que l'on souhaite modifier l'image de la publication
    } else if (publication.previewOnEdit !== null) {
        editPost.picture = publication.previewOnEdit;
        // Dans le cas où pictureHasHidden est à false et previewOnEdit est à null, cela signifie que l'on souhaite garder l'image de la publication
    } else if (!pictureHasHidden.value && publication.previewOnEdit == null && publication.picture) {
        editPost.picture = publication.picture;
    }
    // On vérifie si le button n'est pas désactivé afin de pouvoir procéder à la modification de la publication
    if (!buttonDisabled.value) {
        // On vérifie si une image a été sélectionné dans le mode de modification d'une publication
        if (editPost.picture) {
            // Et on vérifie si cette image est bien au format jpg, jpeg, png ou webp
            if (editPost.picture.type == 'image/jpg'
                || editPost.picture.type == 'image/jpeg'
                || editPost.picture.type == 'image/png'
                || editPost.picture.type == 'image/webp') {
                usePublicationsStore().updatePublication(publication.publication_id, editPost).then((response: any) => {
                    socket.emit('edit publication', response, useAuthStore().$state.user);
                    usePublicationsStore().resetPreview(publication.publication_id).then((response2: any) => {
                        removePicture('edit', publication.publication_id);
                    })
                })
            } else {
                // Si le type de l'image sélectionner est une string cela veux dire que nous ne souhaitons pas modifier l'image de la publication
                if (typeof (editPost.picture) == 'string') {
                    editPost.picture = '';
                    usePublicationsStore().updatePublication(publication.publication_id, editPost).then((response: any) => {
                        socket.emit('edit publication', response, useAuthStore().$state.user);
                        usePublicationsStore().resetPreview(publication.publication_id).then((response2: any) => {
                        })
                    })
                } else {
                    wrongFileEdit.value = true;
                }
            }
            // Dans le cas où il n'y a aucune image sélectionner dans le mode de modification d'une publication on procède à la modification de la publication sans modifier l'image
        } else {
            usePublicationsStore().updatePublication(publication.publication_id, editPost).then((response: any) => {
                socket.emit('edit publication', response, useAuthStore().$state.user);
                usePublicationsStore().resetPreview(publication.publication_id).then((response2: any) => {
                })
            })
        }
    }
};

// Cette fonction va nous permettre d'afficher la modal permettant la visualisation de l'historique de modification d'une publication
function displayHistoryOfEdit(publication_id: number) {
    // On fait appel au store afin qu'il déclenche la requête permettant la récupération de l'historique de modification de la publication
    usePublicationsStore().fetchHistoryOfEdit(publication_id).then((response: any) => {
        displayHistory.value = true;
    })
};

// Cette fonction va nous permettre de fermer la modal permettant la visualisation de l'historique de modification d'une publication et de réinitialiser les données de l'historique
// afin de ne pas avoir de données en double ou de données ne concernant pas l'historique de publication que l'on souhaite visualiser
function closeHistory() {
    displayHistory.value = false;
    usePublicationsStore().resetHistory();
};

// Cette fonction va nous permettre d'afficher la modal permettant la suppression d'une publication
function activateModal(publication: any) {
    modalRequest.value = true;
    publicationToDelete.value = publication;
};

// Cette fonction va nous permettre de faire plusieurs vérifications avant de procéder à la récupération des publications de la page suivante pour les mettre ensuite en cache
// puis supprimé la publication grâce à l'id de la publication passer en paramètre
function deletePublication(publication: any) {
    // On ferme la modal de confirmation de suppression d'une publication
    modalRequest.value = false;
    if (page.value < numberOfPages.value && usePublicationsStore().$state.cache.length == 0 && publications.value.length < numOfResults.value) {
        // On récupère les publications de la page suivante s'il existe une page après celle sur laquelle nous sommes
        usePublicationsStore().fetchAllPublication(page.value + 1, true).then((response: any) => {
            // On fait appel à la fonction présente dans le store qui communique avec l'api afin de supprimer une publication
            // On émet l'évènement en lien afin que mes amis ne voient plus cette publication dans leur fil d'actualité
            socket.emit('delete publication', { publication: publication, user: user.value });
            usePublicationsStore().deletePublication(publication.publication_id).then((response: any) => {
                // On supprime également toutes nos notifications liées à cette publication
                useOtherStore().deleteRelatedNotifications(publication.publication_id, "publication");
            });
        })
        // Si aucune page n'est présente après celle sur laquelle nous sommes
    } else {
        // Nous nous contentons juste de supprimer la publication d'émettre l'évènement en lien et de supprimer les notifications en lien avec cette publication
        usePublicationsStore().deletePublication(publication.publication_id).then((response: any) => {
            // On supprime également toutes nos notifications liées à cette publication
            useOtherStore().deleteRelatedNotifications(publication.publication_id, "publication");
            socket.emit('delete publication', { publication: publication, user: user.value });
        });
    }
};

// Cette fonction va nous permettre de faire appel à la fonction permettant de mettre un like sur une publication
function likePublication(publication: any) {
    usePublicationsStore().likePublication(publication.publication_id).then((response: any) => {
        // Dans le cas où nous n'avions pas déjà liké la publication la réponse sera donc à true et on apposera un like sur la publication dans le cas inverse on retirera le like
        if (response.data.liked == true) {
            publication = { ...publication, like_id: response.data.results.insertId };
            // On émet ensuite l'évènement correspondant à l'action réalisée
            socket.emit('like', { publication, user: user.value });
        } else {
            socket.emit('remove like', { publication, user: user.value });
        }
    });
};

// Cette fonction va nous permettre de changer de page, selon l'opération passer en paramètre soit 'next' soit 'previous' et de réinitialiser les publications affichées et le cache présent dans le state
function changePage(operation: string) {
    usePublicationsStore().resetPublicationsAndCache();
    usePublicationsStore().changePage(operation);
};

// Cette fonction va nous permettre de réinitialiser les publications affichées et le cache présent dans le state et de récupérer les publications à l'initialisation de la page
function init() {
    usePublicationsStore().resetPublicationsAndCache();
    usePublicationsStore().fetchAllPublication(page.value, false);
};

// On place un watch sur la page afin de pouvoir récupérer les publications de la page correspondante
watch(page, (newPageValue: any) => {
    usePublicationsStore().fetchAllPublication(newPageValue, false).then((response: any) => {
    });
});

// On place un watch sur les champs de modification d'une publication afin de pouvoir vérifier si les champs ont été modifiés et qu'il ne soit pas vide
watchEffect(() => {
    if (editPost.content == '' && editPost.picture == '' && pictureHasHidden.value == true
        || editPost.content == null && editPost.picture == null && pictureHasHidden.value == true
        || editPost.content == '' && editPost.picture == null && pictureHasHidden.value == true
        || editPost.content == null && editPost.picture == '' && pictureHasHidden.value == true) {
        buttonDisabled.value = true
        // Dans le cas où au minimum un champ n'est pas vide entre le texte et l'image on réactive le bouton
    } else {
        buttonDisabled.value = false
    }
    console.log(buttonDisabled.value);
});

// On place un watch sur la modalRequest afin que lorsque la modal de confirmation de suppression d'une publication s'affiche que le scroll soit désactivé
watch(modalRequest, (value: boolean) => {
    if (value == true) {
        document.querySelector('body')!.style.overflowY = 'hidden'
    } else if (value == false) {
        document.querySelector('body')!.style.overflowY = 'scroll'
    }
});

// Avant le montage du composant on déclenche notre fonction init afin de réinitialiser le cache et les publications et de récupérer les publications de la page actuelle
onBeforeMount(() => {
    init();
});

</script>
<template>
    <template v-if="isLoading">
        <Loading />
    </template>
    <template v-else-if="!isLoading" class="container">
        <div v-if="user" class="create_post">
            <div class="create_post__container">
                <div class="create_post__top">
                    <div class="create_post__top__details">
                        <div class="create_post__top__details__avatar">
                            <img :src="user.picture_url" alt="avatar" />
                        </div>
                    </div>
                </div>
                <div class="create_post__content">
                    <div class="create_post__content__details">
                        <form @submit.prevent="createPublication">
                            <textarea v-model="content" placeholder="Quoi de neuf ?"
                                class="create_post__content__details__text" @input="autoResize"></textarea>
                            <div class="create_post__content__details">
                                <input type="file" ref="fileInput" accept="image/*" @change="onPickFile"
                                    class="create_post__content__details__file" id="file">
                                <div @click="chooseFile('create')"
                                    class="create_post__content__details__button__choose">
                                    Choisir un
                                    fichier</div>
                            </div>
                            <span v-if="wrongFile" class="picture-message-alert">Seuls
                                les images
                                aux formats .jpg .jpeg
                                .png .webp sont
                                acceptées</span>
                        </form>
                    </div>
                </div>
            </div>
            <img alt="picture"
                :class="[displayPicture ? 'create_post__content__details__picture' : 'create_post__content__details__picture hidden']"
                id="picture" />
            <button @click="removePicture('create')" class="create_post__trash" v-if="displayPicture">
                <fa icon="fa-solid fa-trash-can" />
            </button>
            <div :class="[displayPicture ? 'create_post__button onPreview' : 'create_post__button']">
                <button v-if="content || previewPicture.picture" @click.prevent="createPublication" type="submit"
                    class="create_post__button__submit">Publier</button>
            </div>
        </div>
        <div v-if="publications.length > 0">
            <div class="publication" v-for="publication in publications">
                <div>
                    <div class="post" :data-id="publication.publication_id">
                        <div class="post__information">
                            <div class="post__top">
                                <div class="post__top__details">
                                    <div class="post__top__details__avatar">
                                        <img :src="publication.picture_url" alt="avatar" />
                                    </div>
                                    <div class="post__top__details__info">
                                        <div class="post__top__details__info__name">
                                            <span>{{ publication.firstname + ' ' + publication.lastname
                                            }}</span>
                                        </div>
                                        <div class="post__top__details__info__date">
                                            <div>{{ publication.publication_date }}
                                                <span @click="displayHistoryOfEdit(publication.publication_id)"
                                                    v-if="publication.publication_edit"
                                                    class="post__top__details__info__date__edit">
                                                    <fa icon="fa-regular fa-pen-to-square" />
                                                    Modifiée -
                                                    {{ publication.publication_edit
                                                    }}
                                                </span>
                                                <Teleport to="body">
                                                    <div v-if="displayHistory" @click="closeHistory" class="calc">
                                                        <div class="modal-container-edit">
                                                            <div class="modal-container-edit__header">
                                                                <div class="modal-container-edit__header__title">
                                                                    Liste des modifications
                                                                </div>
                                                            </div>
                                                            <div class="modal-container-edit__content">
                                                                <div class="modal-container-edit__content__body">
                                                                    <div
                                                                        class="modal-container-edit__content__body__list">
                                                                        <div class="modal-container-edit__content__body__list__item"
                                                                            v-for="update in history">
                                                                            <div
                                                                                class="modal-container-edit__content__body__list__item__top">
                                                                                <div
                                                                                    class="modal-container-edit__content__body__list__item__top__details">
                                                                                    <div
                                                                                        class="modal-container-edit__content__body__list__item__top__details__avatar">
                                                                                        <img :src="update.user_id == publication.user_id ? publication.picture_url : 'https://media.istockphoto.com/vectors/default-profile-picture-avatar-photo-placeholder-vector-illustration-vector-id1223671392?k=20&m=1223671392&s=170667a&w=0&h=kEAA35Eaz8k8A3qAGkuY8OZxpfvn9653gDjQwDHZGPE='"
                                                                                            alt="avatar" />
                                                                                    </div>
                                                                                    <div
                                                                                        class="modal-container-edit__content__body__list__item__top__details__info">
                                                                                        <div
                                                                                            class="modal-container-edit__content__body__list__item__top__details__info__name">
                                                                                            <span>{{ update.user_id ==
                                                                                            publication.user_id ?
                                                                                            publication.firstname +
                                                                                            ' ' +
                                                                                            publication.lastname :
                                                                                            'Administrateur'}}</span>
                                                                                        </div>
                                                                                        <div
                                                                                            class="modal-container-edit__content__body__list__item__top__details__info__date">
                                                                                            {{ update.edit_date}}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div v-if="update.content"
                                                                                class="modal-container-edit__content__body__list__item__content">
                                                                                {{ update.content }}
                                                                            </div>
                                                                            <div
                                                                                class="modal-container-edit__content__body__list__item__picture">
                                                                                <img v-if="update.picture"
                                                                                    :src="update.picture"
                                                                                    alt="picture" />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="modal-container-edit__footer">
                                                                <button @click="closeHistory" type="button"
                                                                    data-dismiss="modal">Fermer</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Teleport>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="user.user_id == publication.user_id || user.role_id == 2"
                                    class="post__top__menu">
                                    <div v-if="!publication.editMode" class="post__top__menu__button">
                                        <fa icon="fa-solid fa-ellipsis"
                                            @click="usePublicationsStore().displayMenu(publication)" />
                                        <div v-if="publication.menu" class="post__top__menu__content">
                                            <div class="post__top__menu__content__diamond"></div>
                                            <div class="post__top__menu__content__item">
                                                <fa @click="activeEditMode(publication)"
                                                    icon="fa-solid fa-pen-to-square" />
                                            </div>
                                            <div class="post__top__menu__content__item">
                                                <fa @click="activateModal(publication)" icon="fa-solid fa-trash-can" />
                                            </div>
                                            <Teleport to="body">
                                                <div v-if="modalRequest" @click="modalRequest = false"
                                                    class="calc d-flex flex-row justify-content-center align-items-center">
                                                    <div @click.stop class="modal-container">

                                                        <div class="modal-container__content">
                                                            <div class="modal-container__content__header">
                                                                <div class="modal-container__content__header__title">
                                                                    Êtes-vous certains de vouloir supprimer cette
                                                                    publication ?
                                                                </div>
                                                            </div>
                                                            <div class="modal-container__content__footer">
                                                                <button @click="modalRequest = false" type="button"
                                                                    class="btn btn-secondary"
                                                                    data-dismiss="modal">Annuler</button>
                                                                <button @click="deletePublication(publicationToDelete)"
                                                                    type="button"
                                                                    class="btn btn-primary">Supprimer</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Teleport>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="post__content">
                                <div class="post__content__text">
                                    <template v-if="publication.editMode">
                                        <textarea ref="jedi" type="text" v-model="editPost.content"
                                            class="create_post__content__details__text post-edit"
                                            @click="autoResize"></textarea>
                                        <input type="file" ref="fileInput" accept="image/*"
                                            @change="editPickFile($event, publication)" id="file-edit"
                                            class="create_post__content__details__file">
                                        <div @click="chooseFile('edit')"
                                            class="create_post__content__details__button__choose post-edit">Choisir un
                                            fichier</div>
                                        <span v-if="wrongFileEdit" class="picture-message-alert">Seuls
                                            les images
                                            aux formats .jpg .jpeg
                                            .png .webp sont
                                            acceptées</span>
                                    </template>
                                    <template v-else>
                                        <p v-if="publication.content">{{ publication.content }}</p>
                                    </template>
                                </div>
                                <img :src="publication.picture" alt=""
                                    :class="[ publication.picture && publication.editMode == false 
                                    || publication.editMode == true && publication.previewOnEdit 
                                    || publication.editMode == true && tmpPicture ? 'post__content__picture' : 'post__content__picture hidden']"
                                    :id="publication.publication_id.toString()">
                                <button @click="hideImageOnPost(publication)" class="post__content__deleteButton"
                                    v-if="publication.editMode && tmpPicture && !pictureHasHidden || publication.editMode && publication.previewOnEdit && !pictureHasHidden">
                                    <fa icon="fa-solid fa-trash-can" />
                                </button>
                            </div>
                        </div>
                        <div v-if="publication.editMode" class="post__button">
                            <div class="post__button__list">
                                <button @click="cancelModification(publication)" class="cancel">Annuler</button>
                                <button @click="updatePublication(publication)"
                                    :class="[buttonDisabled ? 'submit disabled' : 'submit']">Sauvegarder</button>
                            </div>
                        </div>
                        <div v-else class="post__likeAndComment">
                            <div class="post__interaction">
                                <div class="post__interaction__like">
                                    <button :class="[publication.iLike ? 'like' : '']"
                                        @click.stop="likePublication(publication)">
                                        <span>{{ publication.likes!.length + ' ' }}</span>
                                        <fa v-if="!publication.iLike" icon="fa-regular fa-heart" />
                                        <fa v-else icon="fa-solid fa-heart" />
                                    </button>
                                </div>
                                <div class="post__interaction__comment">
                                    <button @click.stop="useCommentsStore().beforeGetComments(publication)"
                                        type="button">
                                        <span>{{ publication.numberOfComments + ' ' }}</span>
                                        <fa icon="fa-regular fa-comment-dots" />
                                    </button>
                                </div>
                            </div>
                            <div class="post__interaction__comment__list">
                                <template v-if="publication.displayComments">
                                    <Comment :publication_id="publication.publication_id" :user="user"
                                        :numberOfComments="publication.numberOfComments"
                                        :comments="publication.comments" :cache="publication.cache"
                                        @getMore="useCommentsStore().getMoreComments(publication.publication_id)" />
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="post__page">
                <div v-if="page > 1" class="post__page__previous">
                    <button @click="changePage('previous')" type="button">Page Précédente</button>
                </div>
                <div v-if="page < numberOfPages" class="post__page__next">
                    <button @click="changePage('next')" type="button">Page Suivante</button>
                </div>
            </div>
        </div>
    </template>
</template>
<style scoped lang="scss">
@import '../styles/Utils/keyframes';

* {
    font-family: 'Lato', sans-serif;
}

@import '../styles/Components/buttons';
@import '../styles/Utils/keyframes';

.container {
    position: relative;
}

.create_post {
    max-height: 860px;
    display: flex;
    flex-direction: column;
    width: 470px;
    border-radius: 5px;
    margin: 60px auto auto auto;
    background-color: floralwhite;
    border: 1px solid #FD2D01;
    -webkit-animation: slide-in-top 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    animation: slide-in-top 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;


    &__container {
        display: flex;
    }

    @media (max-width: 768px) {
        width: 90%;
    }

    &__top {
        display: flex;
        margin: 10px 0 0 10px;

        &__details {
            display: flex;
            flex-direction: row;

            &__avatar {
                border-radius: 50%;
                margin-right: 10px;

                img {
                    width: 40px;
                    border-radius: 5px;
                    height: 40px;
                    object-fit: cover;
                }
            }
        }
    }

    &__content {
        display: flex;
        width: 100%;
        flex-direction: column-reverse;
        align-items: flex-start;
        margin: 10px 10px 0 0;

        &__details {
            display: flex;
            flex-direction: row;
            align-items: center;
            width: 100%;
            justify-content: space-between;

            form {
                width: 100%;

                .picture-message-alert {
                    background: #FF7A79;
                    border-radius: 5px;
                    border: 1px solid #FD2D01;
                    color: #FFFFFF;
                    font-size: 12px;
                    padding: 5px;
                    font-weight: normal;
                }
            }

            &__text {
                width: 96%;
                display: block;
                overflow: hidden;
                resize: none;
                border: 1px solid #DBDBDB;
                border-radius: 5px;
                padding: 0px 7px 0px 7px;
                background-color: rgb(255, 255, 255);
                color: rgb(0, 0, 0);

                &:focus-visible {
                    outline: none;
                }

                @media (max-width: 768px) {
                    width: 90%;
                }

                &.post-edit {
                    width: initial;
                }
            }

            &__file {
                margin: 10px 0px;
                // width: 240px;
                display: none;
                z-index: 0;
                opacity: 0;
            }

            &__picture {
                width: 100%;
                height: 100%;
                max-height: 353px;
                margin-top: 20px;
                object-fit: cover;
                border-top: 1px solid #dbdbdb;
                border-bottom: 1px solid #dbdbdb;

                &.hidden {
                    display: none;
                }
            }

            &__button {
                margin-right: 7px;
                background-color: #FD2D01;
                border-color: #FD2D01;
                color: #FFFFFF;
                padding: 5px 10px;
                border: 1px solid #FD2D01;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s ease-in-out;

                &__cancel {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: #FFFFFF;
                    border-radius: 5px;
                    background: #FD2D01;
                    cursor: pointer;
                    position: absolute;
                    right: 30%;
                    width: 15px;
                    height: 15px;
                    border: none;

                    &.post-edit {
                        position: absolute;
                        left: 57%;
                        right: initial;
                        top: 110px;
                    }
                }

                &__choose {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 5px;
                    font-size: 13px;
                    background: #dbdbdb;
                    color: #4E5166;
                    border-radius: 5px;
                    cursor: pointer;
                    margin: 10px 0;
                    border: 1px solid transparent;

                    &:hover {
                        border: 1px solid #4E5166;
                        background: #f5f5f5;
                        transition: 0.3s all;
                    }

                    &.post-edit {
                        // width: 108px;
                    }
                }

                &__submit {
                    background: #dbdbdb;
                    border: 1px solid transparent;
                    color: #4E5166;
                    cursor: pointer;
                    font-size: 13px;
                    border-radius: 5px;
                    padding: 5px;
                    margin-right: 10px;

                    &:hover {
                        border: 1px solid #4E5166;
                        background: #f5f5f5;
                        transition: 0.3s all;
                    }
                }
            }
        }
    }

    &__trash {
        font-size: 15px;
        width: 35px;
        height: 35px;
        border: 1px solid #FD2D01;
        background: #FFFFFF;
        color: #FD2D01;
        border-radius: 5px;
        position: absolute;
        right: 10px;
        top: 115px;
        cursor: pointer;

        &:hover {
            background: #FD2D01;
            color: #FFFFFF;
            transition: 0.3s all;
        }
    }

    &__button {
        margin: 10px;
        display: flex;
        justify-content: flex-end;
        position: absolute;
        bottom: -3px;
        right: 0px;

        &.onPreview {
            position: relative;
        }

        &__submit {
            background: #FFFFFF;
            border: 1px solid #FD2D01;
            color: #FD2D01;
            padding: 5px;
            border-radius: 5px;
            cursor: pointer;

            &:hover {
                background-color: #FD2D01;
                color: #FFFFFF;
                transition: 0.3s all;
            }
        }
    }
}

.post {
    display: flex;
    flex-direction: column;
    width: 470px;
    border-radius: 5px;
    margin: 10px auto auto auto;
    background-color: #FFFFFF;
    border: 1px solid #FD2D01;
    position: relative;

    @media (max-width: 768px) {
        width: 90%;
    }

    &__information {
        border-radius: 5px;
        background-color: floralwhite;
    }

    &__top {
        display: flex;
        padding: 10px 0 0 10px;

        &__details {
            width: 90%;
            display: flex;
            flex-direction: row;

            &__avatar {
                margin-right: 0.5rem;

                img {
                    width: 40px;
                    border-radius: 5px;
                    height: 40px;
                    object-fit: cover;
                }
            }

            &__info {
                &__name {
                    font-weight: bold;
                }

                &__date {
                    font-size: 12px;
                    color: #FD2D01;

                    &__edit {
                        margin-left: 10px;
                        color: #4E5166;
                        font-style: italic;
                        cursor: pointer;

                        &:hover {
                            text-decoration: underline;
                            transition: 0.3s all;
                        }
                    }
                }
            }


        }

        &__menu {
            width: 10%;
            display: flex;
            justify-content: end;
            margin-right: 20px;

            &__button {
                position: relative;
                height: 10px;

                svg {
                    cursor: pointer;
                    color: #4E5166;
                }
            }

            &__content {
                position: absolute;
                display: flex;
                right: -10px;
                top: 30px;
                -webkit-animation: scale-in-ver-top 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                animation: scale-in-ver-top 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                border-radius: 5px;
                background: #dbdbdb;

                &__diamond {
                    transform: translate(-10px, -7px) rotate(-45deg);
                    width: 10px;
                    height: 10px;
                    background: #dbdbdb;
                    position: absolute;
                    right: 2px;
                    top: 2px;
                }

                &__item {
                    display: flex;
                    justify-content: center;
                    margin: 5px;
                    z-index: 1;

                    svg {
                        cursor: pointer;
                        padding: 5px;
                    }

                    &:hover {
                        background: #f5f5f5;
                        transition: 0.3s all;
                        border-radius: 5px;
                    }
                }
            }
        }

        &__button {
            display: flex;
            justify-content: end;
            width: 50%;

            &__ellipsis {
                cursor: pointer;
            }

            svg {
                width: 20px;
                height: 20px;
                margin-right: 10px;
            }

            button {
                @include button-primary;
            }

        }
    }

    &__content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin: 10px;

        &__text {
            // margin: 0px 10px 20px;
            display: flex;
            flex-direction: column;
            color: #4E5166;
            // width: 96%;
            width: 100%;

            span {
                font-weight: bold;
            }

            p {
                width: 95%;
                overflow-wrap: break-word;
            }

            .picture-message-alert {
                background: #FF7A79;
                border-radius: 5px;
                border: 1px solid #FD2D01;
                color: #FFFFFF;
                font-size: 12px;
                padding: 5px;
                font-weight: normal;
            }
        }

        &__picture {
            width: 100%;
            height: 100%;
            max-height: 353px;
            object-fit: cover;
            border: 1px solid #dbdbdb;
            border-radius: 5px;
            background: #FFFFFF;
            margin-top: 10px;

            &.hidden {
                display: none;
            }
        }

        &__details {

            &__input {
                width: 94%;
                height: 30px;
                border: none;
                border-radius: 15px;
                padding: 0px 7px 0px 7px;
                background-color: rgb(255, 255, 255);
                color: rgb(0, 0, 0);
            }

            &__button {
                @include button-primary;
            }

            &__file {
                margin: 10px 0px;
            }
        }

        &__deleteButton {
            font-size: 15px;
            width: 35px;
            height: 35px;
            border: 1px solid #FD2D01;
            background: #FFFFFF;
            color: #FD2D01;
            border-radius: 5px;
            position: absolute;
            right: 10px;
            top: 170px;
            cursor: pointer;

            &:hover {
                background: #FD2D01;
                color: #FFFFFF;
                transition: 0.3s all;
            }
        }
    }

    &__likeAndComment {
        border-top: 1px solid #dbdbdb;
    }

    &__interaction {
        display: flex;
        width: 100%;
        border-radius: 0px 0px 15px 15px;

        &__like {
            width: 50%;
            padding: 5px;

            button {
                width: 100%;
                height: 100%;
                background-color: #FFFFFF;
                border: none;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;

                span {
                    font-size: 20px;
                    margin-right: 5px;
                }

                svg {
                    font-size: 20px;
                    color: #4E5166;
                }


            }

            .like {
                svg {
                    font-size: 20px;
                    // color: linear-gradient(to right, #FD2D01, #FFD7D7);
                    color: #FD2D01;
                    -webkit-animation: jello-horizontal 0.9s both;
                    animation: jello-horizontal 0.9s both;
                }
            }
        }

        &__comment {
            width: 50%;
            padding: 5px;
            border-left: 1px solid #dbdbdb;

            button {
                width: 100%;
                height: 100%;
                background-color: #FFFFFF;
                border: none;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;

                span {
                    font-size: 20px;
                    margin-right: 5px;
                }

                svg {
                    font-size: 20px;
                    color: #4E5166;
                }
            }

            &__list {
                width: 100%;
            }
        }
    }

    &__button {
        background: floralwhite;
        border-radius: 0 0 5px 5px;

        &__list {
            display: flex;
            justify-content: flex-end;
            margin: 10px;

            button {
                margin-left: 10px;
                padding: 5px;
                border: 1px solid #dbdbdb;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s ease-in-out;

                &:hover {
                    // background: 
                }
            }

            .cancel {
                background-color: #FFFFFF;
                border: 1px solid #4E5166;
                color: #4E5166;

                &:hover {
                    background-color: #4E5166;
                    color: #FFFFFF;
                }
            }

            .submit {
                background: #FFFFFF;
                border: 1px solid #FD2D01;
                color: #FD2D01;

                &:hover {
                    background-color: #FD2D01;
                    color: #FFFFFF;
                }

                &.disabled {
                    cursor: not-allowed;
                    background: #dbdbdb;
                    color: #b3b3b3;
                    border: 1px solid transparent;
                }
            }
        }
    }

    &__page {
        display: flex;
        flex-direction: row;
        justify-content: center;
        margin-top: 3rem;
        -webkit-animation: slide-in-blurred-bottom 0.6s cubic-bezier(0.230, 1.000, 0.320, 1.000) 0.3s both;
        animation: slide-in-blurred-bottom 0.6s cubic-bezier(0.230, 1.000, 0.320, 1.000) 0.3s both;

        :nth-child(1) {
            margin-right: 15px;
            margin-bottom: 20px;
        }

        button {
            @include button-primary;
        }
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

.modal-container-edit {
    background: #FFFFFF;
    padding: 20px;
    border-radius: 5px;
    width: 350px;

    &__header {
        margin-bottom: 20px;

        &__title {
            text-align: center;
            color: #FD2D01;
            font-weight: bold;
            font-size: 15px;
        }
    }

    &__content {
        // height: 100%; 
        max-height: 350px;
        overflow-y: scroll;
        margin-bottom: 20px;
        border: 1px solid #dbdbdb;
        border-radius: 5px;
        background: #F5F5F5;


        &__body {
            &__list {
                &__item {
                    background: floralwhite;
                    border-radius: 5px;
                    border: 1px solid #FD2D01;
                    margin: 20px;
                    padding: 10px 10px 0 10px;

                    &__top {
                        &__details {
                            display: flex;

                            &__avatar {
                                img {
                                    width: 40px;
                                    height: 40px;
                                    border-radius: 5px;
                                    object-fit: cover;
                                }
                            }

                            &__info {
                                margin-left: 10px;

                                &__name {
                                    font-weight: bold;
                                }

                                &__date {
                                    font-size: 12px;
                                    color: #FD2D01;
                                }
                            }
                        }
                    }


                    &__content {
                        margin-top: 10px;
                        background: #FFFFFF;
                        border: 1px solid #dbdbdb;
                        border-radius: 5px;
                        padding: 5px;
                    }

                    &__picture {
                        max-width: 328px;
                        margin-top: 10px;
                        margin-bottom: 8px;

                        img {
                            width: 100%;
                            object-fit: cover;
                            border-radius: 5px;
                        }
                    }
                }
            }
        }

    }

    &__footer {
        display: flex;
        justify-content: flex-end;

        button {
            background-color: #FFFFFF;
            padding: 5px;
            color: #FD2D01;
            border: 1px solid #FD2D01;
            border-radius: 5px;
            cursor: pointer;

            &:hover {
                background-color: #FD2D01;
                color: #FFFFFF;
                transition: 0.3s all;
            }
        }
    }
}

.publication {
    &:nth-child(1) {
        -webkit-animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.5s both;
        animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.5s both;
    }

    &:nth-child(2) {
        -webkit-animation: slide-in-right 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.7s both;
        animation: slide-in-right 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.7s both;
    }

    &:nth-child(3) {
        -webkit-animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.9s both;
        animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.9s both;
    }

    &:nth-child(4) {
        -webkit-animation: slide-in-right 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.1s both;
        animation: slide-in-right 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.1s both;
    }

    &:nth-child(5) {
        -webkit-animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.3s both;
        animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.3s both;
    }
}
</style>