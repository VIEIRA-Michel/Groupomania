<script setup lang="ts">
import { useCommentsStore } from '../shared/stores/commentsStore';
import { reactive, ref, watchEffect, computed } from 'vue';
const commentsStore = useCommentsStore();
const user: any | null = JSON.parse(localStorage.getItem('user'));
console.log(user.email)
const props = defineProps({
    comments: [],
    limit: Number,
    from: Number,
});

const emit = defineEmits<{
    (e: 'getMore'): any;
}>();


const commentary = computed(() => {
    return commentsStore.$state.comments;
});
    console.log('commentary', commentary.value.length, 'limit', props.limit, 'offset', props.from);

const displayButton = computed(() => {
    return commentsStore.$state.comments.length;
});

function deleteComment(comment: any) {
    console.log(comment.publication_id, comment.comment_id)
    commentsStore.deleteComment(comment.publication_id, comment.comment_id);
}

</script>

<template>
    <div v-for="com in commentary" class="post">
        <div class="post__details">
            <div class="post__details__info">
                <div class="post__details__info__avatar">
                    <img src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200" alt="avatar" />
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
            <button v-if="user.email == com.email" @click="deleteComment(com)" class="post__button__delete">Supprimer commentaire</button>
        </div>
    </div>
    <div class="more-post">
        <button v-if="displayButton == props.limit + props.from" @click="emit('getMore')" class="more-post__button">
            Afficher plus de commentaires
        </button>
    </div>
    <!-- <div class="create_post">
        <div class="create_post__input">
            <textarea class="create_post__input__textarea" placeholder="Ecrivez votre commentaire..."></textarea>
        </div>
        <div class="create_post__button">
            <button class="create_post__button__button">Publier</button>
        </div>
    </div> -->
    <div class="create_post">
                <div class="create_post__top">
                    <div class="create_post__top__details">
                        <div class="create_post__top__details__avatar">
                            <img src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200"
                                alt="avatar" />
                        </div>
                        <div class="create_post__top__details__info">
                            <div class="create_post__top__details__info__name">
                                <span>Michel Vieira</span>
                                <!-- <span>{{ user.firstname + ' ' + user.lastname }}</span> -->
                            </div>
                        </div>

                    </div>
                </div>
                <div class="create_post__content">
                    <div class="create_post__content__details">
                        <form>
                            <input type="text" class="create_post__content__details__input">
                            <button class="create_post__content__details__button">Publier</button>
                        </form>
                    </div>
                </div>
            </div>

</template>

<style scoped lang="scss">
.post {
    display: flex;
    justify-content: space-between;
    align-items: center;
    // filter: drop-shadow(0 0 0.75rem #4E5166);
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
</style>