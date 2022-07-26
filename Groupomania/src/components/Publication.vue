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
                        <form action="">
                            <input type="text" v-model="inputValue.content" class="post__content__details__input">
                            <input type="file" ref="fileInput" accept="image/*" @change="onPickFile"
                                class="post__content__details__file">
                            <button class="post__content__details__button"
                                @click="createPublication(inputValue)">Publier</button>
                        </form>
                    </div>
                </div>
            </div>
            <div v-if="arrayPublications">
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
                <div class="post__page">
                    <div v-if="page >= 1" class="post__page__previous">
                        <button @click="count--" type="button">Page Précédente</button>
                    </div>
                    <div v-if="page < numberOfPages" class="post__page__next">
                        <button @click="count++" type="button">Page Suivante</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import Loading from './Loading.vue';
import { reactive, ref, watchEffect } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
import { usePublicationsStore } from '../shared/stores/publicationsStore';
let arrayPublications = ref();
let page = ref(1);
let count = ref(1);
let numberOfPages = ref();
let inputValue = reactive({
    content: '',
    picture: ''
});
// function onPickFile(event: any) {
//     console.log(event.target.value);
//     //   this.$refs.fileInput.click()
// };

// function onFilePicked (event: any) {
//   const files = event.target.files
//   let filename = files[0].name
//   const fileReader = new FileReader()
//   fileReader.addEventListener('load', () => {
//     this.imageUrl = fileReader.result
//   })
//   fileReader.readAsDataURL(files[0])
//   this.image = files[0]
// }
// function onFilePicked(event: any) {
//     let file = event.target.files[0];
//     let reader = new FileReader();
//     reader.onload = (e: any) => {
//         inputValue.picture = e.target.result;
//     };
//     reader.readAsDataURL(file);
// }
const publicationsStore = usePublicationsStore();
const authStore = useAuthStore();
let loading = ref(publicationsStore.$state.isLoading);
// console.log(loading);

function createPublication(inputValue: any) {
    let result = publicationsStore.createPublication(inputValue.content, inputValue.picture);
    return result;
}

let getUser: any = localStorage.getItem('user');
let user: any = JSON.parse(getUser);


async function getAllPublications(page: number) {
    let result = await publicationsStore.getAllPublications(page);
    setTimeout(() => {
        arrayPublications.value = publicationsStore.$state.publications;
        numberOfPages.value = publicationsStore.$state.numberOfPages;
        loading.value = false;
    }, 3000);
}

async function getMyInformation() {
    let result = await authStore.getMyInformations();
    return result;
}
getAllPublications(page.value);
getMyInformation();

watchEffect(() => {
    loading.value = true;
    page.value = count.value;
    getAllPublications(page.value);
})

</script>

<style scoped lang="scss">
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

    &__page {
        display: flex;
        flex-direction: row;
        justify-content: center;
        margin-top: 3rem;

        :nth-child(1) {
            margin-right: 15px;
            margin-bottom: 20px;
        }

        button {
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
</style>