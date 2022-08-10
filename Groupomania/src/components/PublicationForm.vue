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
        picture_url: string,
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

    <div v-if="props.user" class="create_post">
        <div class="create_post__top">
            <div class="create_post__top__details">
                <div class="create_post__top__details__avatar">
                    <img :src="props.user.picture_url" alt="avatar" />
                </div>
            </div>
        </div>
        <div class="create_post__content">
            <div class="create_post__content__details">
                <input type="text" v-model="post.content" class="create_post__content__details__input">
                <input type="file" ref="fileInput" accept="image/*" @change="onPickFile"
                    class="create_post__content__details__file">
                <div class="create_post__content__details__button">
                    <button @click="emit('cancel')" class="cancel">Annuler</button>
                    <button @click="emit('update', post)" class="submit">Sauvegarder</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '../styles/Components/buttons';

.create_post {
    max-height: 860px;
    display: flex;
    width: 470px;
    border-radius: 5px;
    margin: 10px auto auto auto;
    background-color: #FFFFFF;
    border: 1px solid #DBDBDB;

    &__top {
        display: flex;
        padding: 10px 0 0 10px;

        &__details {
            display: flex;
            flex-direction: row;

            &__avatar {
                border-radius: 50%;
                margin-right: 0.5rem;

                img {
                    width: 30px;
                    border-radius: 30px;
                    height: 30px;
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
        padding: 10px 0 0 0;

        &__details {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            justify-content: space-between;

            form {
                width: 100%;
            }

            &__input {
                width: 94%;
                height: 30px;
                border: none;
                border-radius: 15px;
                padding: 0px 7px 0px 7px;
                background-color: rgb(255, 255, 255);
                color: rgb(0, 0, 0);

            }

            &__file {
                margin: 10px 0px;
                width: 94%;

            }

            &__button {
                width: 100%;
                display: flex;
                justify-content: end;
                margin-right: 30px;
                margin-bottom: 15px;

                button {
                    margin-left: 10px;
                    background-color: #FFFFFF;
                    border-color: #FD2D01;
                    color: #FD2D01;
                    padding: 5px;
                    border: 1px solid #FD2D01;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s ease-in-out;

                    &:hover {
                        background-color: #FD2D01;
                        color: #FFFFFF;
                    }

                    .cancel {}

                    .submit {}
                }
            }
        }
    }
}
</style>