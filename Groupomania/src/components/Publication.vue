<script setup lang="ts">
import Loading from './Loading.vue';
import PublicationForm from './PublicationForm.vue';
import Comment from './Comment.vue';
import { reactive, ref, watchEffect, computed } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
import { usePublicationsStore } from '../shared/stores/publicationsStore';
import { useCommentsStore } from '../shared/stores/commentsStore';
import moment from 'moment';
moment().format();

const authStore = useAuthStore();
const publicationsStore = usePublicationsStore();
const commentsStore = useCommentsStore();

checkToken();

let publications = computed(() => publicationsStore.$state.publications);
let user = computed(() => authStore.$state.user);

// const userLiked = computed(() => {
//     return publicationsStore.$state.userLiked;
// });

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
let hasLiked = ref();
let postIdOnState = ref();

let loading = ref(publicationsStore.$state.isLoading);


function createPublication(inputValue: any) {
    if (inputValue != "") {
        publicationsStore.createPublication(inputValue);
        inputValue.content = '';
        inputValue.picture = '';
    };
}

function getAllPublications(page: number) {
    let result = publicationsStore.getAllPublications(page);
    setTimeout(() => {
        numberOfPages.value = publicationsStore.$state.numberOfPages;
        loading.value = false;
    }, 3000);
}
function editPublication(id: number, update: any) {
    publicationsStore.updatePublication(id, update.post);
}

function deletePublication(id: number) {
    publicationsStore.deletePublication(id);
}

async function checkToken() {
    authStore.checkToken();
}
getAllPublications(page.value);
checkToken();


// watchEffect(() => {
//     loading.value = true;
//     page.value = count.value;
//     getAllPublications(page.value);
// })
// publicationsStore.$subscribe((params) => {
//     console.log('params, publication-component', params);
// })


function getComments(publication: any, more?: boolean) {

    if (postIdOnState !== publication.publication_id) {
        commentsStore.$reset();
    }
    if (more) {
        from.value = from.value + limitValue.value;
        limitValue.value = limitValue.value + limitValue.value;
    };
    if (commentsStore.$state.comments.length >= from.value) {
        commentsStore.getAllComments(publication.publication_id, limitValue.value, from.value);
        let state = publicationsStore.publicationList;
        console.log(state)
        state = state.map((item: any) => {
            if (item.publication_id === postIdOnState.value) {
                item.displayComments = false;
            }
            else if (item.publication_id == publication.publication_id) {
                item.displayComments = true;
            }
            return item;
        });
        publicationsStore.$patch({
            publications: state,
        });
        postIdOnState.value = publication.publication_id;

    }
}

function likePublication(publication: any) {
    // console.log(publication.likes)
    // let newArray = ref<any>();
    // newArray = publicationsStore.$state.publications.map((like: any) => {
    //     if (like.publication_id == publication.publication_id) {
    //         console.log(like.likes);
    //         for (let i = 0; i < like.likes.length; i++) {
    //             console.log(like.likes[i].user_id);
    //             if (like.likes[i].user_id == user.user_id) {
    //                 console.log('je splice')
    //                 return like.likes.splice(i, 1);
    //             } else {
    //                 console.log('je push')
    //                 return like.likes.push(user)
    //             }
    //         }
    //         return like
    //     }
    // });
    // console.log(newArray);

    //     publicationsStore.$state.publications = publicationsStore.$state.publications.map((like: any) => {
    //     if (like.publication_id == publication.publication_id) {
    //         console.log(like.likes);
    //         for (let i = 0; i < like.likes.length; i++) {
    //             if (like.likes[i].user_id == user.id) {
    //                 console.log('je splice')
    //                 return like.likes.splice(i, 1);
    //             } else {
    //                 console.log('je push')
    //                 return like.likes.push(user)
    //             }
    //         }
    //         return like
    //     }
    // });
};
console.log(publications)
</script>

<template>
    <div>
        <!-- <div v-if="loading">
            <Loading />
        </div> -->
        <div>
            <!-- <div v-else-if="!loading"> -->
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
                        <form @submit.prevent="createPublication(inputValue)">
                            <input type="text" v-model="inputValue.content" class="post__content__details__input">
                            <input type="file" ref="fileInput" accept="image/*" @change="onPickFile"
                                class="post__content__details__file">
                            <button class="post__content__details__button">Publier</button>
                        </form>
                    </div>
                </div>
            </div>
            <div v-if="publications.length > 0">
                <div v-for="publication in publications">
                    <div v-if="!publication.editMode">
                        <div class="post" :data-id="publication.publication_id">
                            <div class="post__information">
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
                            </div>
                            <div class="post__likeAndComment">
                                <div class="post__interaction">
                                    <div class="post__interaction__like">

                                        <!-- <span>{{ publication.likes }}</span> -->
                                        <button @click.stop="likePublication(publication)" type="button"><span>{{
                                                publication.likes.length
                                        }}</span> J'aime</button>
                                        <!-- <button @click="like" type="button">J'aime</button> -->
                                    </div>
                                    <div class="post__interaction__comment">
                                        <!-- <span>{{ publication.comments.length }}</span> -->
                                        <button @click.stop="getComments(publication)"
                                            type="button">Commentaires</button>
                                    </div>
                                </div>
                                <div class="post__interaction__comment__list">
                                    <div v-if="publication.displayComments">
                                        <Comment :limit="limitValue" :from="from"
                                            :idPublication="publication.publication_id" :user="user"
                                            @getMore="getComments(publication.publication_id, true)" />
                                    </div>
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
    border-radius: 15px;
    margin: 3rem auto auto auto;
    padding: 20px;
    backdrop-filter: blur(5px);
    background-color: rgb(227, 226, 226);
    filter: drop-shadow(0 0 0.75rem #4E5166);

    &__information {
        padding: 20px;
    }

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

    &__likeAndComment {
        padding: 10px 20px;
    }

    &__interaction {
        display: flex;
        width: 100%;
        border-radius: 0px 0px 15px 15px;
        border-top: 1px solid #b7b7b7;
        padding: 5px 0px;

        &__like {
            width: 50%;

            button {
                width: 100%;
                height: 100%;
                background-color: #e3e2e2;
                border: none;
                cursor: pointer;
            }
        }

        &__comment {
            width: 50%;

            button {
                width: 100%;
                height: 100%;
                background-color: #e3e2e2;
                border: none;
                cursor: pointer;
            }

            &__list {
                // border-top: 1px solid #b7b7b7;
                // padding: 5px 0px;
                // margin-top: 10px;
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