<template>
    <div>
        <div v-if="loading">
            <Loading />
        </div>
        <div v-else-if="!loading">
            <div v-if="user" class="post">
                <div class="post__top">
                    <div class="post__top__avatar">
                        <img src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200"
                            alt="avatar" />
                    </div>
                    <div class="post__top__info">
                        <div class="post__top__info__name">
                            <span>{{ user.firstname + ' ' + user.lastname }}</span>
                        </div>
                    </div>
                </div>
                <div class="post__content">
                    <div class="post__content__details">
                        <form @submit.prevent="createPublication(inputValue)" action="">
                            <input type="text" v-model="inputValue" class="post__content__details__input">
                            <input type="file" class="post__content__details__file">
                            <button class="post__content__details__button">Publier</button>
                        </form>
                    </div>
                </div>
            </div>
            <div v-if="arrayPublications"></div>
            <div v-for="publication in arrayPublications">
                <div class="post">
                    <div class="post__top">
                        <div class="post__top__avatar">
                            <img src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200"
                                alt="avatar" />
                        </div>
                        <div class="post__top__info">
                            <div class="post__top__info__name">
                                <span>{{ publication.firstname + ' ' + publication.lastname }}</span>
                            </div>
                            <div class="post__top__info__date">
                                <span>{{ 'Publiée le ' + publication.created_at }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="post__content">
                        <p>{{ publication.content }}</p>
                        <img :src="publication.picture" alt="">
                    </div>
                    <div class="post__interaction">
                        <div class="post__interaction__like">
                            <span>{{ publication.likes }}</span>
                            <!-- <button @click="like" type="button">J'aime</button> -->
                        </div>
                        <!-- <div class="post__interaction__comment">
                            <span>{{ publication.comments.length }}</span> -->
                        <!-- <button @click="comment" type="button">Commenter</button> -->
                        <!-- </div> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import Loading from './Loading.vue';
import { ref } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
import { usePublicationsStore } from '../shared/stores/publicationsStore';
let arrayPublications = ref();
let inputValue = ref('');
const publicationsStore = usePublicationsStore();
const authStore = useAuthStore();
let loading = ref(publicationsStore.$state.isLoading);
console.log(loading);

function createPublication(inputValue: string, picture?: any) {
    let result = publicationsStore.createPublication(inputValue, picture);
    return result;
}

let getUser: any = localStorage.getItem('user');
let user: any = JSON.parse(getUser);
console.log(user);
async function getAllPublications() {
    let result = await publicationsStore.getAllPublications();
    setTimeout(() => {
        arrayPublications.value = publicationsStore.$state.publications;
        console.log(arrayPublications.value);
        loading.value = false;
    }, 3000);
}

async function getMyInformation() {
    let result = await authStore.getMyInformations();
    return result;
}
getAllPublications();
getMyInformation();

</script>

<style scoped lang="scss">
.post {
    width: 50rem;
    padding: 20px;
    border-radius: 15px;
    margin: 3rem auto auto auto;
    backdrop-filter: blur(5px);
    background-color: rgb(227, 226, 226);

    &__top {
        display: flex;

        &__avatar {
            border-radius: 50%;
            margin-right: 0.5rem;

            img {
                width: 4rem;
                border-radius: 32px;
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
                background-color: #FD2D01;
                border-color: #FD2D01;
                color: #fff;
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
</style>