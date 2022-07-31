<script setup lang="ts">
import Loading from './Loading.vue';
import PublicationForm from './PublicationForm.vue';
import Comment from './Comment.vue';
import { reactive, ref, watchEffect, computed } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
import type { Publication } from '../shared/interfaces/publication.interface';
import { usePublicationsStore } from '../shared/stores/publicationsStore';
import { useCommentsStore } from '../shared/stores/commentsStore';
const publicationsStore = usePublicationsStore();
const commentsStore = useCommentsStore();
let arrayPublications = ref();

const publications = computed(() => {
    // console.log('computed', publicationsStore.$state.publications);
    return publicationsStore.$state.publications;
});

let displayComments = ref(false);
let comment = ref();
let page = ref(1);
let count = ref(1);
let numberOfPages = ref();
let inputValue = reactive({
    content: '',
    picture: ''
});
let limitValue = ref(5);
let from = ref(0);
let more = ref(false);
function onPickFile(event: any) {
    inputValue.picture = event.target.files[0];
}

const authStore = useAuthStore();
let loading = ref(publicationsStore.$state.isLoading);


function createPublication(event: any, inputValue: any) {
    event.preventDefault();
    // console.log(inputValue);
    let result = publicationsStore.createPublication(inputValue);
    return result;
}

let getUser: any = localStorage.getItem('user');
let user: any = JSON.parse(getUser);



// async function getAllPublications(page: number) {
//     let result = await publicationsStore.getAllPublications(page);
//     setTimeout(() => {
//         console.log('le result : ', result);
//         arrayPublications.value = publicationsStore.$state.publications;
//         numberOfPages.value = publicationsStore.$state.numberOfPages;
//         loading.value = false;
//     }, 3000);
// }

function getAllPublications(page: number) {
    let result = publicationsStore.getAllPublications(page);
    setTimeout(() => {
        arrayPublications.value = publicationsStore.$state.publications;
        numberOfPages.value = publicationsStore.$state.numberOfPages;
        loading.value = false;
    }, 3000);
}
function editPublication(id: number, update: any) {
    // console.log('publication component voici lupdate', update.post);
    publicationsStore.updatePublication(id, update.post);
}

function deletePublication(id: number) {
    publicationsStore.deletePublication(id);
}

async function getMyInformation() {
    let result = await authStore.getMyInformations();
    return result;
}
getAllPublications(page.value);
getMyInformation();

// watchEffect(() => {
//     loading.value = true;
//     page.value = count.value;
//     getAllPublications(page.value);
// })
// publicationsStore.$subscribe((params) => {
//     console.log('params, publication-component', params);
// })

function getComments(id: number, more?: boolean) {
    if (more) {
        from.value = from.value + limitValue.value;
        limitValue.value = limitValue.value + limitValue.value;
    };
    if (commentsStore.$state.comments.length >= from.value) {
        commentsStore.getAllComments(id, limitValue.value, from.value);
        setTimeout(() => {
            if (comment.value === undefined) {
                console.log("comment value est egal a undefined");
                comment.value = commentsStore.$state.comments;
            } else {
                // comment.value = commentsStore.$state.comments;
                console.log("on incrémente le comment state");
                comment.value = [...comment.value, commentsStore.$state.comments];
            }
            displayComments.value = true;
        }, 3000);
    }
}

function deleteComment(id: number) {
    
}

</script>

<template>
    <div>
        <div v-if="loading">
            <Loading />
        </div>
        <div v-else-if="!loading">
            <div v-if="user" class="post">
                <div class="post__top">
                    <div class="post__top__details">
                        <div class="post__top__details__avatar">
                            <img src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200"
                                alt="avatar" />
                        </div>
                        <div class="post__top__details__info">
                            <div class="post__top__details__info__name">
                                <span>{{ user.firstname + ' ' + user.lastname }}</span>
                            </div>
                        </div>

                    </div>
                </div>
                <div class="post__content">
                    <div class="post__content__details">
                        <form @submit.prevent="createPublication($event, inputValue)">
                            <input type="text" v-model="inputValue.content" class="post__content__details__input">
                            <input type="file" ref="fileInput" accept="image/*" @change="onPickFile"
                                class="post__content__details__file">
                            <button class="post__content__details__button">Publier</button>
                        </form>
                    </div>
                </div>
            </div>
            <div v-if="arrayPublications">
                <div v-for="publication in publications">
                    <div v-if="!publication.editMode">
                        <div class="post">
                            <div class="post__top">
                                <div class="post__top__details">
                                    <div class="post__top__details__avatar">
                                        <img src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200"
                                            alt="avatar" />
                                    </div>
                                    <div class="post__top__details__info">
                                        <div class="post__top__details__info__name">
                                            <span>{{ publication.firstname + ' ' + publication.lastname }}</span>
                                        </div>
                                        <div class="post__top__details__info__date">
                                            <span>{{ 'Publiée le ' + publication.created_at }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="post__top__button">
                                    <button @click.stop="publication.editMode = true">
                                        Modifier
                                    </button>
                                    <button @click="deletePublication(publication.publication_id)">
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                            <div class="post__content">
                                <p>{{ publication.content }}</p>
                                <img :src="publication.picture" alt="">
                            </div>
                            <div class="post__interaction">
                                <div class="post__interaction__like">
                                    <!-- <span>{{ publication.likes }}</span> -->
                                    <button type="button"><span>15</span> J'aime</button>
                                    <!-- <button @click="like" type="button">J'aime</button> -->
                                </div>
                                <div class="post__interaction__comment">
                                    <!-- <span>{{ publication.comments.length }}</span> -->
                                    <button @click.stop="getComments(publication.publication_id)"
                                        type="button">Commentaires</button>
                                    <!-- <button @click="comment" type="button">Commenter</button> -->
                                </div>
                            </div>
                            <div class="post__interaction__comment__list">
                                <!-- <button><u>Afficher les
                                        commentaires</u></button> -->
                                <div v-if="displayComments">
                                    <Comment :comments="comment" :limit="limitValue" :from="from" 
                                    @getMore="getComments(publication.publication_id, true)" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else>
                        <PublicationForm :content="publication.content" :picture="publication.picture"
                            :id="publication.publication_id" :user="user" @cancel="publication.editMode = false"
                            @update="editPublication(publication.publication_id, { editMode: false, post: $event })" />
                    </div>
                </div>
                <div class="post__page">
                    <div v-if="page > 1" class="post__page__previous">
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

        img {
            width: 100%;
            height: 100%;
            border-radius: 15px 15px 0px 0px;
        }

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

    &__interaction {
        display: flex;
        background-color: rgb(255, 255, 255);
        width: 100%;
        border-radius: 0px 0px 15px 15px;
        margin-bottom: 20px;

        &__like {
            width: 50%;

            button {
                width: 100%;
                height: 100%;
                background-color: #FFFFFF;
                border: none;
                cursor: pointer;
                border-radius: 0 0 0 10px;
            }
        }

        &__comment {
            width: 50%;

            button {
                width: 100%;
                height: 100%;
                background-color: #FFFFFF;
                border: none;
                cursor: pointer;
                border-radius: 0 0 10px 0;
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
            @include button-primary;
        }
    }
}
</style>