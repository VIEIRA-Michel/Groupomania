<script setup lang="ts">
import Loading from './Loading.vue';
import PublicationForm from './PublicationForm.vue';
import Comment from './Comment.vue';
import { ref, watchEffect, computed } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
import { usePublicationsStore } from '../shared/stores/publicationsStore';
import { useCommentsStore } from '../shared/stores/commentsStore';

useAuthStore().getMyInformations();

const publications = computed(() => usePublicationsStore().$state.publications);
const user = computed(() => useAuthStore().$state.user);
const isLoading = computed(() => usePublicationsStore().$state.isLoading);
const numberOfPages = computed(() => usePublicationsStore().$state.numberOfPages);

let page = ref(1);
let content = ref('');
let picture = ref();

function onPickFile(event: any) {
    picture.value = event.target.files[0];
}

function createPublication() {
    if (picture.value && content.value) {
        usePublicationsStore().createPublication(content.value, picture.value);
        picture.value = '';
        content.value = '';
    } else if (content.value) {
        usePublicationsStore().createPublication(content.value, null);
        content.value = '';
    } else if (picture.value) {
        usePublicationsStore().createPublication(null, picture.value);
        picture.value = '';
    }
}

function deletePublication(id: number) {
    usePublicationsStore().deletePublication(id).then((response) => {
        if (numberOfPages.value != 1 && usePublicationsStore().$state.publications.length == 0) {
            page.value = page.value - 1;
        } else if (numberOfPages.value != 1 && usePublicationsStore().$state.publications.length != 5) {
            page.value = 1;
            usePublicationsStore().getAllPublications(page.value);
        }
    });
}

function getComments(publication: any, more?: boolean) {
    usePublicationsStore().publicationList.map((item: any) => {
        if (item.publication_id == publication.publication_id) {
            item.displayComments = true;
        } else {
            item.displayComments = false;
            useCommentsStore().$reset();
        }
        return item;
    })

    if (more) {
        useCommentsStore().$patch((state) => {
            state.from = state.from + state.limit;
            state.limit = state.limit + state.limit;
        });
        usePublicationsStore().publicationList.map((item: any) => {
            if (item.publication_id == publication.publication_id) {
                item.comments.length >= useCommentsStore().$state.from ? useCommentsStore().getAllComments(publication.publication_id, useCommentsStore().$state.limit, useCommentsStore().$state.from) : null;
            }
        });
    }
}

function displayMenu(menu: any) {
    usePublicationsStore().publicationList.map((item: any) => {
        if (item.publication_id == menu.publication_id) {
            item.menu = !item.menu;
        } else {
            item.menu = false;
        }
        return item;
    });
}

watchEffect(() => {
    usePublicationsStore().$reset();
    usePublicationsStore().getAllPublications(page.value);
})
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
                <div class="publication" v-for="publication in publications">
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
                                    <div v-if="user.user_id == publication.user_id" class="post__top__menu">
                                        <div class="post__top__menu__button">
                                            <fa icon="fa-solid fa-ellipsis" @click="displayMenu(publication)" />
                                        </div>
                                        <div v-if="publication.menu" class="post__top__menu__content">
                                            <div class="post__top__menu__content__diamond"></div>
                                            <div class="post__top__menu__content__item">
                                                <fa @click="publication.editMode = true"
                                                    icon="fa-solid fa-pen-to-square" />
                                            </div>
                                            <div class="post__top__menu__content__item">
                                                <fa @click="deletePublication(publication.publication_id)"
                                                    icon="fa-solid fa-trash-can" />
                                            </div>
                                        </div>
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
                                        <button v-if="!publication.iLike"
                                            @click.stop="usePublicationsStore().likePublication(publication.publication_id)">
                                            <span>{{ publication.likes.length + ' ' }}</span>
                                            <fa icon="fa-regular fa-heart" />
                                        </button>
                                        <button v-else class="like"
                                            @click.stop="usePublicationsStore().likePublication(publication.publication_id)">
                                            <span>{{ publication.likes.length + ' ' }}</span>
                                            <fa icon="fa-solid fa-heart" />
                                        </button>
                                    </div>
                                    <div class="post__interaction__comment">
                                        <button @click.stop="getComments(publication)" type="button">
                                            <span>{{ publication.numberOfComments + ' ' }}</span>
                                            <fa icon="fa-regular fa-comment-dots" />
                                        </button>
                                    </div>
                                </div>
                                <div class="post__interaction__comment__list">
                                    <div v-if="publication.displayComments">
                                        <Comment :publication_id="publication.publication_id" :user="user"
                                            :numberOfComments="publication.numberOfComments"
                                            :comments="publication.comments"
                                            @getMore="getComments(publication, true)" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else>
                        <PublicationForm :content="publication.content" :picture="publication.picture"
                            :id="publication.publication_id" :user="user" @cancel="publication.editMode = false"
                            @update="usePublicationsStore().updatePublication(publication.publication_id, { editMode: false, post: $event })" />
                    </div>
                </div>
                <div class="post__page">
                    <div v-if="page > 1" class="post__page__previous">
                        <button @click="page--" type="button">Page Précédente</button>
                    </div>
                    <div v-if="page < numberOfPages" class="post__page__next">
                        <button @click="page++" type="button">Page Suivante</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
@import '../styles/Components/buttons';
@import '../styles/Utils/keyframes';

.create_post {
    max-height: 860px;
    display: flex;
    width: 470px;
    border-radius: 5px;
    margin: 60px auto auto auto;
    backdrop-filter: blur(5px);
    background-color: #FFFFFF;
    border: 1px solid #FD2D01;
    -webkit-animation: slide-in-top 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.3s both;
    animation: slide-in-top 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.3s both;

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
                width: 240px;

            }

            &__button {
                margin-right: 7px;
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
    background-color: #FFFFFF;
    border: 1px solid #FD2D01;

    @media (max-width: 768px) {
        width: 90%;
    }

    &__top {
        display: flex;
        padding: 10px 0 0 10px;

        &__details {
            width: 50%;
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

        &__menu {
            width: 50%;
            display: flex;
            justify-content: end;
            margin-right: 20px;

            &__button {
                svg {
                    cursor: pointer;
                    color: #4E5166;
                }
            }

            &__content {
                position: absolute;
                right: 10px;
                top: 30px;
                -webkit-animation: scale-in-ver-top 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                animation: scale-in-ver-top 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                border-radius: 5px;
                background: #FFFFFF;
                border: 1px solid #FD2D01;

                &__diamond {
                    transform: translate(-10px, -7px) rotate(-45deg);
                    width: 10px;
                    height: 10px;
                    background: #FFFFFF;
                    position: absolute;
                    right: 0px;
                    top: 1px;
                    border-top: 1px solid #FD2D01;
                    border-right: 1px solid #FD2D01;
                }

                &__item {
                    display: flex;
                    justify-content: center;
                    margin: 10px;

                    svg {
                        cursor: pointer;
                    }
                }
            }
        }

        &__button {
            display: flex;
            justify-content: end;
            width: 50%;

            &__ellipsis {
                cursor: pointer;
            }

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
                display: flex;
                justify-content: center;
                align-items: center;

                span {
                    font-size: 20px;
                    margin-right: 5px;
                }

                svg {
                    font-size: 20px;
                    color: #4E5166;
                }


            }

            .like {
                svg {
                    font-size: 20px;
                    // color: linear-gradient(to right, #FD2D01, #FFD7D7);
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
                display: flex;
                justify-content: center;
                align-items: center;

                span {
                    font-size: 20px;
                    margin-right: 5px;
                }

                svg {
                    font-size: 20px;
                    color: #4E5166;
                }
            }

            &__list {}
        }
    }

    &__page {
        display: flex;
        flex-direction: row;
        justify-content: center;
        margin-top: 3rem;
        -webkit-animation: slide-in-blurred-bottom 0.6s cubic-bezier(0.230, 1.000, 0.320, 1.000) 0.3s both;
        animation: slide-in-blurred-bottom 0.6s cubic-bezier(0.230, 1.000, 0.320, 1.000) 0.3s both;

        :nth-child(1) {
            margin-right: 15px;
            margin-bottom: 20px;
        }

        button {
            @include button-primary;
        }
    }
}

.publication {
    &:nth-child(1) {
        -webkit-animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.5s both;
        animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.5s both;
    }

    &:nth-child(2) {
        -webkit-animation: slide-in-right 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.7s both;
        animation: slide-in-right 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.7s both;
    }

    &:nth-child(3) {
        -webkit-animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.9s both;
        animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.9s both;
    }

    &:nth-child(4) {
        -webkit-animation: slide-in-right 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.1s both;
        animation: slide-in-right 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.1s both;
    }

    &:nth-child(5) {
        -webkit-animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.3s both;
        animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.3s both;
    }
}
</style>