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
    event.path[0].style.height = 'auto';
    event.path[0].style.height = event.path[0].scrollHeight + 'px';
}

function createComment(event: any) {
    event.preventDefault();
    if (inputComment.value != "") {
        useCommentsStore().createComment(props.publication_id, inputComment.value);
        inputComment.value = "";
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
                    <div class="post__details__info__commentary">
                        <div class="post__details__info__commentary__name">
                            <span>{{ com.firstname + ' ' + com.lastname }}</span>
                        </div>
                        <div class="post__details__info__commentary__content">
                            <p>{{ com.comment_content }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="post__button">
                <fa v-if="props.user.email == com.email"
                    @click="useCommentsStore().deleteComment(com.publication_id, com.comment_id)"
                    icon="fa-solid fa-trash-can" />
            </div>
        </div>
        <div class="more-post">
            <button v-if="props.comments?.length < props.numberOfComments" @click="emit('getMore')"
                class="more-post__button">
                Afficher plus de commentaires
            </button>
        </div>
        <div class="create_post">
            <div class="create_post__top">
                <div class="create_post__top__details">
                    <div class="create_post__top__details__avatar">
                        <img :src="props.user.picture_url" alt="avatar" />
                    </div>
                </div>
            </div>
            <div class="create_post_info">
                <div class="create_post__info__content">
                    <form @keyup.enter="createComment($event)">
                        <textarea v-model="inputComment" placeholder="Écrivez un commentaire..."
                            class="create_post__info__content__input" @input="autoResize"></textarea>
                    </form>
                </div>

            </div>
        </div>
    </div>

</template>
<style scoped lang="scss">
@import '../styles/Utils/variables';

.container-post {
    padding-top: 10px;
    border-top: 1px solid #b7b7b7;

    .post {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20px;

        &__details {
            display: flex;
            flex-direction: column;

            &__info {
                display: flex;
                align-items: start;

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
                    background: #FFFFFF;
                    border-radius: 5px;
                    padding: 10px 15px;
                    box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 2px 1px -1px rgba(0, 0, 0, 0.12);

                    &__name {
                        span {
                            font-weight: 700;
                        }
                    }

                    &__content {
                        p {
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
}



.create_post {
    display: flex;
    align-items: center;
    margin-top: 20px;

    &__top {
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
        &__name {
            span {
                font-weight: 700;
            }
        }

        &__content {
            background: #FFFFFF;
            border-radius: 25px;
            padding: 10px 15px;

            &__input {
                border: none;
                outline: none;
                color: #4E5166;
                width: 94%;
                display: block;
                overflow: hidden;
                resize: none;
                border: none;
                border-radius: 5px;
                padding: 0px 7px 0px 7px;
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