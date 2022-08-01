<script setup lang="ts">
import { reactive, ref } from "vue";
import { usePublicationsStore } from '../shared/stores/publicationsStore';
const publicationsStore = usePublicationsStore();

const props = defineProps<{
    content: string,
    picture?: any,
    id: number,
    user: {
        birthday: string,
        email: string,
        firstname: string,
        lastname: string,
        picture: string,
    },
}>();

let post = reactive({
    content: props.content,
    picture: props.picture,
    id: props.id,
    user: {
        birthday: props.user.birthday,
        email: props.user.email,
        firstname: props.user.firstname,
        lastname: props.user.lastname,
        picture: "",
    },
});

function onPickFile(event: any) {
    post.picture = event.target.files[0];
}
const emit = defineEmits<{
    (e: 'cancel'): any;
    (e: 'update', post: any): any;
}>();

</script>


<template>

    <div v-if="props.user" class="post">
        <div class="post__top">
            <div class="post__top__details">
                <div class="post__top__details__avatar">
                    <img src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200" alt="avatar" />
                </div>
                <div class="post__top__details__info">
                    <div class="post__top__details__info__name">
                        <span>{{ props.user.firstname + ' ' + props.user.lastname }}</span>
                    </div>
                </div>

            </div>
        </div>
        <div class="post__content">
            <div class="post__content__details">
                <input type="text" v-model="post.content" class="post__content__details__input">
                <input type="file" ref="fileInput" accept="image/*" @change="onPickFile"
                    class="post__content__details__file">
                <button @click="emit('cancel')">Annuler</button>
                <button @click="emit('update', post)">Sauvegarder</button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '../styles/Components/buttons';

.post {
    width: 50rem;
    padding: 20px;
    border-radius: 15px;
    margin: 3rem auto auto auto;
    backdrop-filter: blur(5px);
    background-color: rgb(227, 226, 226);
    filter: drop-shadow(0 0 0.75rem #4E5166);

    &__top {
        display: flex;
        width: 100%;

        &__details {
            display: flex;
            flex-direction: row;
            width: 50%;

            &__avatar {
                border-radius: 50%;
                margin-right: 0.5rem;

                img {
                    width: 4rem;
                    border-radius: 32px;
                }
            }


        }

        &__button {
            display: flex;
            justify-content: end;
            width: 50%;

            button {
                @include button-primary;
            }
        }
    }

    &__content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-top: 1rem;

        &__details {

            &__input {
                width: 49rem;
                border: none;
                border-radius: 15px;
                padding: 0.5rem;
                font-size: 1rem;
                background-color: rgb(255, 255, 255);
                color: rgb(0, 0, 0);
                margin-bottom: 1rem;
                height: 3rem;
                margin-top: 5px;
            }

            &__button {
                @include button-primary;
            }
        }
    }
}
</style>