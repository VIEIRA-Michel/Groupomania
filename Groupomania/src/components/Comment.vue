<script setup lang="ts">
import { useCommentsStore } from '../shared/stores/commentsStore';
import { ref } from 'vue';
let inputComment = ref("");

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
    if (inputComment.value != "") {
        useCommentsStore().createComment(props.publication_id, inputComment.value).then((response) => {
            inputComment.value = "";
            event.target.style.height = 'auto';
        });
    };
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
                        <fa v-if="props.user.email == com.email || props.user.role_id == 2"
                            @click="useCommentsStore().deleteComment(com.publication_id, com.comment_id)"
                            icon="fa-solid fa-trash-can" />
                    </div>
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
</style>