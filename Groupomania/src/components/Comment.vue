<script setup lang="ts">
import { useCommentsStore } from '../shared/stores/commentsStore';
import { reactive, ref, watchEffect, computed } from 'vue';
const commentsStore = useCommentsStore();
// const user: any | null = JSON.parse(localStorage.getItem('user'));
const inputComment = ref<string>("");
const props = defineProps({
    // comments: [],
    limit: Number,
    from: Number,
    idPublication: Number,
    displayComments: Boolean,
    user: Object,
});

const emit = defineEmits<{
    (e: 'getMore'): any;
}>();


const commentary = computed(() => {
    return commentsStore.$state.comments;
});
const numOfResults = computed(() => {
    return commentsStore.$state.numOfResults;
});

const displayButton = computed(() => {
    return commentsStore.$state.comments.length;
});

function createComment(event: any, publication_id: any, inputComment: string) {
    event.preventDefault();
    console.log(event);
    if (inputComment != "") {
        commentsStore.createComment(publication_id, inputComment);
        inputComment = "";
    };
}

function deleteComment(comment: any) {
    console.log(comment.publication_id, comment.comment_id)
    commentsStore.deleteComment(comment.publication_id, comment.comment_id);
}

console.log(commentary.value.length);
console.log(numOfResults.value);
</script>

<template>
    <div class="container-post">
        <div v-for="com in commentary" class="post">
            <div class="post__details">
                <div class="post__details__info">
                    <div class="post__details__info__avatar">
                        <img src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200"
                            alt="avatar" />
                    </div>
                    <div class="post__details__info__commentary">
                        <div class="post__details__info__commentary__name">
                            <span>{{ com.firstname + ' ' + com.lastname }}</span>
                        </div>
                        <div class="post__details__info__commentary__content">
                            <p>{{ com.comment_content }}</p>
                        </div>
                        <!-- <div class="post__details__info__commentary__date">
                        <span>{{ 'Publiée le ' + com.comment_created_at }}</span>
                    </div> -->
                    </div>
                </div>
            </div>
            <div class="post__button">
                <button v-if="props.user.email == com.email" @click="deleteComment(com)"
                    class="post__button__delete">Supprimer
                    commentaire</button>
            </div>
        </div>
        <div class="more-post">
            <button v-if="displayButton < numOfResults.value" @click="emit('getMore')" class="more-post__button">
                Afficher plus de commentaires
            </button>
        </div>
        <div class="create_post">
            <div class="create_post__top">
                <div class="create_post__top__details">
                    <div class="create_post__top__details__avatar">
                        <img src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200"
                            alt="avatar" />
                    </div>

                </div>
            </div>
            <div class="create_post_info">
                <div class="create_post__info__content">
                    <form>
                        <input type="text" v-model="inputComment" class="create_post__info__content__input"
                            placeholder="Écrivez un commentaire...">
                        <button @click="createComment($event, props.idPublication, inputComment)"
                            class="create_post__info__content__button">Publier</button>
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
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    overflow: hidden;
                    margin-right: 10px;

                    img {
                        width: 100%;
                    }
                }

                &__commentary {
                    background: #FFFFFF;
                    border-radius: 25px;
                    padding: 10px 15px;
                    margin-bottom: 10px;
                    box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 2px 1px -1px rgba(0, 0, 0, 0.12);

                    &__name {
                        // display: flex;
                        // align-items: center;
                        // margin-bottom: 5px;

                        span {
                            font-weight: 700;
                        }
                    }

                    &__content {
                        p {
                            margin: 0;
                        }
                    }
                }
            }
        }
    }
}



.create_post {
    display: flex;

    &__top {
        &__details {
            &__avatar {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                overflow: hidden;
                margin-right: 10px;

                img {
                    width: 100%;
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
            margin-bottom: 10px;
            box-shadow: 0px 1px 3px 0px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 2px 1px -1px rgb(0 0 0 / 12%);

            form {
                input {
                    border: none;
                    outline: none;

                    :focus {
                        border: none;
                        outline: none;
                    }
                }

                button {
                    background-color: $color-primary;
                    border-color: $color-primary;
                    color: $color-bonus;
                    font-size: 1rem;
                    padding: 5px 10px;
                    border-radius: 5px;
                    border-width: 1px;
                    border-style: solid;
                    cursor: pointer;
                    transition: all 0.3s ease-in-out;
                    margin: 0 10px;
                }
            }
        }
    }
}
</style>