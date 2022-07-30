<script setup lang="ts">

const props = defineProps({
    comments: {},
});
// comment: {
//     publication_id: number;
//     publication_content: string;
//     publication_picture?: string;
//     user_id: number;
//     publication_created: string;
//     publication_updated_at?: string;
//     lastname: string;
//     firstname: string;
//     email: string;
//     role_id: number;
//     account_disabled?: boolean;
//     comment_id: number;
//     comment_user_id: number;
//     comment_publication_id: number;
//     comment_content: string;
//     comment_created_at: string;
// },

console.log(props.comments[0]);
for (let comment of props.comments[0]) {
    console.log(comment.publication_id);
}

</script>

<template>
    <div v-for="com in props.comments[0]" class="post">
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
    </div>

</template>

<style scoped lang="scss">
.post {

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