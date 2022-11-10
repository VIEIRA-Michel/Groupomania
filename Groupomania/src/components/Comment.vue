<script setup lang="ts">
import { useCommentsStore } from '@/shared/stores/commentsStore';
import { onMounted, ref } from 'vue';
import socket from '@/socket';
import { useAuthStore } from '@/shared/stores/authStore';

// inputComment va nous permettre de récupérer ce que nous avons saisie dans le champ de création d'un commentaire
let inputComment = ref("");

// modalComment va nous permettre de gérer l'affichage ou non de la modal de confirmation de suppression d'un commentaire
let modalComment = ref(false);

let commentToDelete = ref<any>();

// On récupère les propriétés passées de l'élément parent et on définit leurs types
const props = defineProps({
    numberOfComments: Number,
    publication_id: Number,
    user: Object,
    comments: Array,
    cache: Array
});

// On définit le nom de l'évènement que l'on souhaite communiquer à l'élément parent afin qu'il déclenche l'action en lien avec cette évènement
const emit = defineEmits<{
    (e: 'getMore'): any;
}>();

// Cette fonction va nous permettre de redimensionner le champ de saisie de texte en fonction de la taille du texte saisi afin de toujours voir l'ensemble du texte saisi
function autoResize(event: any) {
    event.target.style.height = 'auto';
    event.target.style.height = event.target.scrollHeight + 'px';
}

// On appel la fonction présente dans le store qui va créer le commentaire du côté de notre state et également envoyer notre saisie à l'api' afin de créer le commentaire dans la base de données
function createComment(event: any) {
    if (inputComment.value.trim() !== "") {
        useCommentsStore().createComment(props.publication_id!, inputComment.value.trim()).then((response) => {
            // Si tout s'est bien passé, on émet l'évènement avec le commentaire crée afin les autres utilisateurs puissent le voir
            socket.emit('has commented', { comment: response, user: useAuthStore().$state.user });
            inputComment.value = "";
            // Et on réinitialise la taille du champ de saisie de création de commentaire 
            event.target[0].style.height = 'auto';
        });
    }
}

// Cette fonction va nous permettre d'afficher la modal de confirmation dans le cas où nous souhaiterions supprimer un commentaire
// Et d'attribuer à la variable commentToDelete le commentaire que nous souhaitons supprimer
function activateModal(comment: any) {
    modalComment.value = true;
    commentToDelete.value = comment;
}

function deleteComment() {
    // Si le nombre de commentaire affiché est inférieur au nombre total de commentaire et que le cache est vide
    if (props.comments!.length < props.numberOfComments! && props.cache!.length == 0) {
        // On appel la fonction qui va nous permettre de récupérer d'avantage de commentaire et de les stocker dans le cache
        useCommentsStore().getAllComments(props.publication_id!, 10, props.comments!.length, true).then((response: any) => {
            socket.emit('delete comment', { comment: commentToDelete.value, user: useAuthStore().$state.user });
            // On appel la fonction qui va nous permettre de supprimer le commentaire de la base de données
            useCommentsStore().deleteComment(commentToDelete.value)
        })
    } else {
        socket.emit('delete comment', { comment: commentToDelete.value, user: useAuthStore().$state.user });
        // On appel la fonction qui va nous permettre de supprimer le commentaire de la base de données
        useCommentsStore().deleteComment(commentToDelete.value);
    }
    // Et on repasse la valeur de modalComment à false afin de faire disparaître la modal
    modalComment.value = false;
}

// Lors du clic sur le texte présent en guise de placeholder cette fonction va nous permettre de placer le curseur sur la balise textarea afin de saisir le commentaire
function focusInput() {
    document.querySelector('.create_post__info__content__input').focus();
}

</script>
<template>
    <div v-if="props.comments!.length > 0" :class="[props.comments!.length > 5 ? 'container-post scrollY' : 'container-post' ]">
        <div class="more-post">
            <button v-if="props.comments?.length! < props.numberOfComments!" @click="emit('getMore')"
                class="more-post__button">
                Afficher plus de commentaires
            </button>
        </div>
        <div v-for="com in props.comments" class="post">
            <div class="post__details">
                <div class="post__details__info">
                    <div class="post__details__info__avatar">
                        <img :src="com.picture_url" alt="avatar" />
                    </div>
                    <div
                        :class="[com.role_id == 2 ? 'post__details__info__commentary administrator' : 'post__details__info__commentary']">
                        <div class="post__details__info__commentary__top">
                            <div class="post__details__info__commentary__top__name">
                                <span v-if="com.role_id == 1">{{ com.firstname + ' ' + com.lastname }}</span>
                                <span class="post__details__info__commentary__top__name__role"
                                    v-if="com.role_id == 2">Administrateur</span>
                            </div>
                            <div class="post__details__info__commentary__top__date">
                                <span>{{ com.comment_created_at }}</span>
                            </div>

                        </div>
                        <div class="post__details__info__commentary__content">
                            <p>{{ com.comment_content }}</p>
                        </div>
                    </div>
                    <div class="post__button">
                        <fa v-if="props.user.email == com.email || props.user.role_id == 2" @click="activateModal(com)"
                            icon="fa-solid fa-trash-can" />
                    </div>
                    <Teleport to="body">
                        <div v-if="modalComment" @click="modalComment = false" class="calc">
                            <div @click.stop class="modal-container">

                                <div class="modal-container__content">
                                    <div class="modal-container__content__header">
                                        <div class="modal-container__content__header__title">
                                            Êtes-vous certains de vouloir supprimer ce
                                            commentaire ?
                                        </div>
                                    </div>
                                    <div class="modal-container__content__footer">
                                        <button @click="modalComment = false" type="button" class="btn btn-secondary"
                                            data-dismiss="modal">Annuler</button>
                                        <button @click="deleteComment()" type="button"
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
    <div class="create_post">
        <div class="create_post__info">
            <div class="create_post__info__content">
                <form @submit.prevent="createComment($event)">
                    <textarea v-model="inputComment" class="create_post__info__content__input"
                        @input="autoResize($event)">
                    </textarea>
                    <div v-if="inputComment.length == 0" @click="focusInput"
                        class="create_post__info__content__input__placeholder"></div>
                    <input type="submit">
                </form>
            </div>
        </div>
    </div>

</template>
<style scoped lang="scss">
@import '../styles/Utils/variables';
@import '../styles/Components/buttons';

* {
    font-family: 'Lato', sans-serif !important;
}


.container-post {
    border-top: 1px solid #dbdbdb;
    width: 100%;
    display: flex;
    flex-direction: column;
    max-height: 507px;
    padding-bottom: 20px;

    &.scrollY {
        overflow-y: scroll;
    }
    .post {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-top: 20px;
        width: 100%;

        @media (max-width: 768px) {
            justify-content: center;
        }

        &__details {
            display: flex;
            flex-direction: column;
            width: 95%;

            &__info {
                width: 100%;
                display: flex;
                align-items: start;
                margin-left: 10px;

                &__avatar {
                    overflow: hidden;
                    width: 43px;
                    height: 43px;

                    img {
                        width: 43px;
                        height: 43px;
                        object-fit: cover;
                        border-radius: 50%;
                    }
                }

                &__commentary {
                    background: #ebe6e2;
                    border-radius: 10px;
                    padding: 0 5px;
                    border: 1px solid #dbdbdb;
                    width: 70%;
                    margin-left: 10px;

                    &.administrator {
                        background: #ffcf77;
                    }

                    &__top {
                        display: flex;
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: center;
                        padding-top: 2px;

                        &__name {
                            margin-bottom: 5px;

                            span {
                                font-weight: 700;
                            }

                            &__role {
                                font-size: 12px;
                                color: #FFFFFF;
                                padding: 2px;
                                background: #FD2D01;
                                border-radius: 5px;
                            }
                        }

                        &__date {
                            font-size: 12px;
                            color: #FD2D01;
                        }
                    }


                    &__content {
                        padding-bottom: 2px;

                        p {
                            width: 100%;
                            font-size: 14px;
                            overflow-wrap: break-word;
                            margin: 0;
                            color: #4E5166;
                        }
                    }
                }
            }
        }

        &__button {
            cursor: pointer;
            margin-left: 20px;

            svg {
                padding: 5px;
                color: #FD2D01;
                border-radius: 5px;
                background: #ffffff;
                border: 1px solid #FD2D01;

                &:hover {
                    background: #FD2D01;
                    color: #ffffff;
                    transition: all 0.3s;
                }
            }
        }
    }

    .more-post {
        &__button {
            margin: 20px auto;
            display: flex;
            padding: 5px 10px;
            color: #4E5166;
            background-color: #dbdbdb;
            border: 1px solid transparent;
            border-radius: 10px;
            cursor: pointer;
            &:hover {
                border: 1px solid #4E5166;
                background-color: #f5f5f5;
                transition: .3s all ease-in-out;
            }
        }
    }
}

.create_post {
    display: flex;
    // justify-content: center
    width: 100%;
    align-items: center;

    padding: 20px 0;
    background: #f5f5f5;
    border-radius: 0 0 20px 20px;

    &__top {
        margin-left: 10px;

        &__details {
            &__avatar {
                overflow: hidden;
                margin-right: 10px;

                img {
                    width: 40px;
                    height: 40px;
                    object-fit: cover;
                    border-radius: 5px;
                }
            }
        }
    }

    &__info {
        // margin-left: 8px;
        border-radius: 5px;
        width: 100%;

        &__name {
            span {
                font-weight: 700;
            }
        }

        &__content {
            &__input {
                outline: none;
                color: #4E5166;
                display: block;
                overflow: hidden;
                resize: none;
                width: 83.485%;
                margin: 0 15px;
                height: 56px;
                // height: 30px;
                padding-top: 6px;
                padding-left: 8px;
                // width: 70.485%;
                border-radius: 10px;
                border: 1px solid #dbdbdb;
                background-color: rgb(255, 255, 255);
                color: rgb(0, 0, 0);
                font-size: 14px;

                &__placeholder {
                    color: #dbdbdb;
                    position: absolute;
                    left: 5%;
                    top: 15%;

                    &::before {
                        content: 'Écrivez un commentaire...';
                        cursor: text;
                        color: #dbdbdb;
                        background: transparent;
                        font-size: 14px;
                    }
                }

                @media (max-width: 768px) {
                    width: 90%;
                }

                :focus {
                    border: none;
                    outline: none;
                }
            }

            form {
                display: flex;
                flex-direction: row;
                justify-content: space-around;
                position: relative;

                input {
                    width: 16.515%;
                    background-color: #f5f5f5;
                    border-color: #FD2D01;
                    color: #FD2D01;
                    padding: 5px 10px;
                    border: 1px solid #FD2D01;
                    border-radius: 10px;
                    cursor: pointer;
                    margin-right: 15px;
                    transition: all 0.3s ease-in-out;

                    &:hover {
                        background: #FD2D01;
                        color: #ffffff;
                        transition: 0.3s all;
                    }
                }

                svg {
                    cursor: pointer;
                    margin-left: 10px;
                }
            }
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
</style>