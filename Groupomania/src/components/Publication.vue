<script setup lang="ts">
import Loading from './Loading.vue';
import PublicationForm from './PublicationForm.vue';
import Comment from './Comment.vue';
import { ref, watchEffect, computed } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
import { usePublicationsStore } from '../shared/stores/publicationsStore';
import { useCommentsStore } from '../shared/stores/commentsStore';
const authStore = useAuthStore();
const publicationsStore = usePublicationsStore();
const commentsStore = useCommentsStore();

checkIsConnected();

let publications = computed(() => publicationsStore.$state.publications);
let user = computed(() => authStore.$state.user);
let isLoading = computed(() => publicationsStore.$state.isLoading);

let page = ref(1);
let count = ref(1);
let numberOfPages = ref();
let content = ref('');
let picture = ref();
let postIdOnState = ref();
let loading = ref(publicationsStore.$state.isLoading);


function onPickFile(event: any) {
    picture.value = event.target.files[0];
}

function createPublication() {
    if (picture.value && content.value) {
        publicationsStore.createPublication(content.value, picture.value);
        picture.value = '';
        content.value = '';
    } else if (content.value) {
        publicationsStore.createPublication(content.value, null);
        content.value = '';
    } else if (picture.value) {
        publicationsStore.createPublication(null, picture.value);
        picture.value = '';
    }
}

function getAllPublications(page: number) {
    publicationsStore.getAllPublications(page);
    setTimeout(() => {
        numberOfPages.value = publicationsStore.$state.numberOfPages;
        loading.value = false;
    }, 1500);
}
function editPublication(id: number, update: any) {
    publicationsStore.updatePublication(id, update.post);
}

function deletePublication(id: number) {
    publicationsStore.deletePublication(id);
}

function checkIsConnected() {
    authStore.getMyInformations();
}

watchEffect(() => {
    loading.value = true;
    page.value = count.value;
    getAllPublications(page.value);
})

function getComments(publication: any, more?: boolean) {
    if (postIdOnState.value !== publication.publication_id && commentsStore.$state.comments.length !== 0) {
        console.log('on reset');
        commentsStore.$reset();
        publicationsStore.publicationList.map((item: any) => {
            if (item.publication_id == postIdOnState.value) {
                console.log('display false');
                item.displayComments = false;
            };
            return item;
        });
    } else if (more) {
        console.log('jen veux plus');
        commentsStore.$patch((state) => {
            state.from = state.from + state.limit;
            state.limit = state.limit + state.limit;
        });
        if (commentsStore.$state.comments.length >= commentsStore.$state.from) {
            // console.log('avant la requête');
            commentsStore.getAllComments(publication.publication_id, commentsStore.$state.limit, commentsStore.$state.from);
        }
    }
    if (!more) {
        console.log("on rentre ici normalement car more n'est pas à true");
            commentsStore.getAllComments(publication.publication_id, commentsStore.$state.limit, commentsStore.$state.from);
            console.log(commentsStore.$state.comments);
            let state = publicationsStore.publicationList;
            console.log(state)
            state = state.map((item: any) => {
                if (item.publication_id == publication.publication_id) {
                    console.log('display true');
                    item.displayComments = true;
                }
                return item;
            });
            publicationsStore.$patch({
                publications: state,
            });
            postIdOnState.value = publication.publication_id;
            console.log('postIdOnState', postIdOnState.value);

    }
}




function likePublication(id_publication: any) {
    publicationsStore.likePublication(id_publication);
};
</script>

<template>
    <div>
        <div v-if="isLoading">
            <Loading />
        </div>
        <div v-else-if="!isLoading">
            <div v-if="user" class="create_post">
                <div class="create_post__top">
                    <div class="create_post__top__details">
                        <div class="create_post__top__details__avatar">
                            <img :src="user.picture_url" alt="avatar" />
                        </div>
                    </div>
                </div>
                <div class="create_post__content">
                    <div class="create_post__content__details">
                        <form @submit.prevent="createPublication">
                            <input type="text" v-model="content" placeholder="Quoi de neuf ?"
                                class="create_post__content__details__input">
                            <div class="create_post__content__details">
                                <input type="file" ref="fileInput" accept="image/*" @change="onPickFile"
                                    @submit="picture = ''" class="create_post__content__details__file" id="file">
                                <button class="create_post__content__details__button">
                                    <fa icon="fa-solid fa-paper-plane" />
                                </button>
                            </div>
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
                                            <img :src="publication.picture_url" alt="avatar" />
                                        </div>
                                        <div class="post__top__details__info">
                                            <div class="post__top__details__info__name">
                                                <span>{{ publication.firstname + ' ' + publication.lastname
                                                }}</span>
                                            </div>
                                            <div class="post__top__details__info__date">
                                                <span>{{ 'Publiée ' + publication.created_at }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="user.user_id == publication.user_id" class="post__top__button">
                                        <fa @click.stop="publication.editMode = true"
                                            icon="fa-solid fa-pen-to-square" />
                                        <fa @click="deletePublication(publication.publication_id)"
                                            icon="fa-solid fa-trash-can" />
                                    </div>
                                </div>
                                <div class="post__content">
                                    <div class="post__content__text">
                                        <p v-if="publication.content">{{ publication.content }}</p>
                                    </div>
                                    <img v-if="publication.picture" :src="publication.picture" alt="">
                                </div>
                            </div>
                            <div class="post__likeAndComment">
                                <div class="post__interaction">
                                    <div class="post__interaction__like">
                                        <button @click.stop="likePublication(publication.publication_id)"
                                            v-bind:class="[publication.iLike ? 'liked' : '']">
                                            <span>{{ publication.likes.length + ' ' }}</span>
                                            <fa icon="fa-solid fa-thumbs-up" />
                                        </button>
                                        <!-- <button @click="like" type="button">J'aime</button> -->
                                    </div>
                                    <div class="post__interaction__comment">
                                        <!-- <span>{{ publication.comments.length }}</span> -->
                                        <button @click.stop="getComments(publication)" type="button">
                                            <!-- <span>{{ publication.comments.length }}</span> -->
                                            <fa icon="fa-solid fa-comment-dots" />
                                        </button>
                                    </div>
                                </div>
                                <div class="post__interaction__comment__list">
                                    <div v-if="publication.displayComments">
                                        <Comment :publication_id="publication.publication_id" :user="user"
                                            @getMore="getComments(publication, true)" />
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

.create_post {
    max-height: 860px;
    display: flex;
    width: 470px;
    border-radius: 5px;
    margin: 10px auto auto auto;
    backdrop-filter: blur(5px);
    background-color: #FFFFFF;
    border: 1px solid #FD2D01;

    @media (max-width: 768px) {
        width: 90%;
    }

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
                    width: 40px;
                    border-radius: 30px;
                    height: 40px;
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
            flex-direction: row;
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

                @media (max-width: 768px) {
                    width: 90%;
                }

            }

            &__file {
                margin: 10px 0px;

            }

            &__button {
                margin-right: 15px;
                background-color: #FD2D01;
                border-color: #FD2D01;
                color: #FFFFFF;
                padding: 5px 10px;
                border: 1px solid #FD2D01;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s ease-in-out;
            }
        }
    }
}

.post {
    display: flex;
    flex-direction: column;
    width: 470px;
    border-radius: 5px;
    margin: 10px auto auto auto;
    backdrop-filter: blur(5px);
    background-color: #FFFFFF;
    border: 1px solid #FD2D01;

    @media (max-width: 768px) {
        width: 90%;
    }

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
                    width: 40px;
                    border-radius: 30px;
                    height: 40px;
                    object-fit: cover;
                }
            }

            &__info {
                &__name {
                    font-weight: bold;
                }
            }


        }

        &__button {
            display: flex;
            justify-content: end;
            width: 50%;

            svg {
                width: 20px;
                height: 20px;
                margin-right: 10px;
            }

            button {
                @include button-primary;
            }

        }
    }

    &__content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 10px 0 0 0;

        &__text {
            margin: 0 20px;
            display: flex;
            flex-direction: row;
            color: #4E5166;

            span {
                font-weight: bold;
            }
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            background: black;
        }

        &__details {

            &__input {
                width: 94%;
                height: 30px;
                border: none;
                border-radius: 15px;
                padding: 0px 7px 0px 7px;
                background-color: rgb(255, 255, 255);
                color: rgb(0, 0, 0);
            }

            &__button {
                @include button-primary;
            }

            &__file {
                margin: 10px 0px;
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
        padding: 5px 0px;

        &__like {
            width: 50%;

            button {
                width: 100%;
                height: 100%;
                background-color: #FFFFFF;
                border: none;
                cursor: pointer;

                svg {
                    font-size: 30px;
                }


            }

            .liked {
                background-color: #FFFFFF;

                svg {
                    color: #FD2D01;
                }
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

                svg {
                    font-size: 30px;
                }
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