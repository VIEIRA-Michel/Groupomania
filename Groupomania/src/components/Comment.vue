<script setup lang="ts">
import { useCommentsStore } from '../shared/stores/commentsStore';
import { ref } from 'vue';

let inputComment = ref("");
let modalComment = ref(false);

const props = defineProps({
    numberOfComments: Number,
    publication_id: Number,
    user: Object,
    comments: Array
});

const emit = defineEmits<{
    (e: 'getMore'): any;
}>();

function autoResize(event: any) {
    event.target.style.height = 'auto';
    event.target.style.height = event.target.scrollHeight + 'px';
}

function createComment(event: any) {
    event.preventDefault();
    if (inputComment.value.length > 1 && inputComment.value != " ") {
        console.log(inputComment.value);
        useCommentsStore().createComment(props.publication_id, inputComment.value).then((response) => {
            inputComment.value = "";
            event.target.style.height = 'auto';
        });
    };
}

function activateModal() {
    modalComment.value = true;
}

function deleteComment(comment: any) {
    useCommentsStore().deleteComment(comment)
    modalComment.value = false;
}

</script>
<template>
    <div class="container-post">
        <div v-for="com in props.comments" class="post">
            <div class="post__details">
                <div class="post__details__info">
                    <div class="post__details__info__avatar">
                        <img :src="com.picture_url" alt="avatar" />
                    </div>
                    <div
                        :class="[com.role_id == 2 ? 'post__details__info__commentary administrator' : 'post__details__info__commentary']">
                        <div class="post__details__info__commentary__name">
                            <span v-if="com.role_id == 1">{{ com.firstname + ' ' + com.lastname }}</span>
                            <span class="post__details__info__commentary__name__role"
                                v-if="com.role_id == 2">Administrateur</span>
                        </div>
                        <div class="post__details__info__commentary__date">
                            <span>{{ com.comment_created_at }}</span>
                        </div>
                        <div class="post__details__info__commentary__content">
                            <p>{{ com.comment_content }}</p>
                        </div>
                    </div>
                    <div class="post__button">
                        <fa v-if="props.user.email == com.email || props.user.role_id == 2" @click="activateModal"
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
                                        <button @click="deleteComment(com)" type="button"
                                            class="btn btn-primary">Supprimer</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Teleport>
                </div>
            </div>
        </div>
        <div class="more-post">
            <button v-if="props.comments?.length < props.numberOfComments" @click="emit('getMore')"
                class="more-post__button">
                Afficher plus de commentaires
            </button>
        </div>
    </div>
    <div class="create_post">
        <div class="create_post__info">
            <div class="create_post__info__content">
                <form @keyup.enter="createComment($event)">
                    <textarea v-model="inputComment" placeholder="Écrivez un commentaire..."
                        class="create_post__info__content__input" @input="autoResize($event)"></textarea>
                </form>
            </div>
        </div>
    </div>

</template>
<style scoped lang="scss">
@import '../styles/Utils/variables';
@import '../styles/Components/buttons';

.container-post {
    border-top: 1px solid #dbdbdb;
    width: 100%;
    display: flex;
    flex-direction: column-reverse;
    overflow-y: scroll;
    max-height: 507px;

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
                justify-content: space-evenly;

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

                &__commentary {
                    background: #dbdbdb;
                    border-radius: 5px;
                    padding: 5px;
                    border: 1px solid #4E5166;
                    width: 70%;

                    &.administrator {
                        background: #ffcf77;
                    }

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

                    &__content {
                        margin-top: 10px;

                        p {
                            width: 100%;
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
            border: none;
            padding: 5px;
            color: floralwhite;
            background-color: #4E5166;
            border-radius: 5px;

        }
    }
}

.create_post {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;

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
        border: 1px solid #dbdbdb;
        border-radius: 5px;
        width: 90%;

        &__name {
            span {
                font-weight: 700;
            }
        }

        &__content {
            background: #FFFFFF;
            border-radius: 25px;

            &__input {
                border: none;
                outline: none;
                color: #4E5166;
                display: block;
                overflow: hidden;
                resize: none;
                border: none;
                width: 98%;
                border-radius: 5px;
                background-color: rgb(255, 255, 255);
                color: rgb(0, 0, 0);

                @media (max-width: 768px) {
                    width: 90%;
                }

                :focus {
                    border: none;
                    outline: none;
                }
            }

            form {


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