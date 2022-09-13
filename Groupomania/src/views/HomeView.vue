<script setup lang="ts">
import Loading from '../components/Loading.vue';
import Comment from '../components/Comment.vue';
import { computed, ref, watch, reactive } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
import { usePublicationsStore } from '../shared/stores/publicationsStore';
import { useCommentsStore } from '../shared/stores/commentsStore';
import socket from '../socket';

const user = computed(() => useAuthStore().$state.user);
const publications = computed(() => usePublicationsStore().$state.publications);
const isLoading = computed(() => usePublicationsStore().$state.isLoading);
const numberOfPages = computed(() => usePublicationsStore().$state.numberOfPages);
const numOfResults = computed(() => usePublicationsStore().$state.numOfResults);

let page = ref(1);
let content = ref('');
let picture = ref();
let updateInput = ref('');
let updatePicture = ref();

let editPost = reactive({
    content: '',
    picture: ''
});

function onPickFile(event: any) {
    picture.value = event.target.files[0];
}

function autoResize(event: any) {
    event.target.style.height = 'auto';
    event.target.style.height = event.target.scrollHeight + 'px';
}

function createPublication(event: any) {
    event.preventDefault()
    if (picture.value && content.value) {
        usePublicationsStore().addNewPublication(content.value, picture.value).then((response: any) => {
            picture.value = '';
            content.value = '';
        });
    } else if (content.value) {
        usePublicationsStore().addNewPublication(content.value, null).then((response: any) => {
            content.value = '';
        });
    } else if (picture.value) {
        usePublicationsStore().addNewPublication(null, picture.value).then((response: any) => {
            picture.value = '';
        });
    }
}

function activeEditMode(publication: any) {
    editPost.content = publication.content;
    usePublicationsStore().activateEditMode(publication.publication_id);
}

function editPickFile(event: any) {
    editPost.picture = event.target.files[0];
}

function updatePublication(publication: any) {
    usePublicationsStore().updatePublication(publication.publication_id, editPost);
}

function deletePublication(id: number) {
    if (page.value < numberOfPages.value && usePublicationsStore().$state.cache.length == 0 && publications.value.length < numOfResults.value) {
        usePublicationsStore().fetchAllPublication(page.value + 1, true).then((response: any) => {
            usePublicationsStore().deletePublication(id).then((response: any) => {
                socket.emit('delete publication', id);
            });
        })
    } else {
        usePublicationsStore().deletePublication(id).then((response: any) => {
            socket.emit('delete publication', id);
        });
    }
}

function getComments(publication: any) {
    // if (!publication.displayComments) {
    //     usePublicationsStore().$state.publications.map((item: any) => {
    //         if (item.publication_id == publication.publication_id) {
    //             useCommentsStore().getAllComments(publication.publication_id, item.limit, item.from).then((response) => {
    //                 usePublicationsStore().$patch((state: any) => {
    //                     state.publications.map((post: any) => {
    //                         if (post.publication_id == publication.publication_id) {
    //                             post.displayComments = true;
    //                         }
    //                         return post;
    //                     })
    //                 })
    //             })

    //         }
    //     })
    // } else {
    //     usePublicationsStore().$patch((state: any) => {
    //         state.publications.map((item: any) => {
    //             if (item.publication_id == publication.publication_id) {
    //                 item.displayComments = false;
    //                 item.comments.splice(0, item.comments.length);
    //                 item.limit = 5;
    //                 item.from = 0;
    //                 return item;
    //             }
    //         })
    //     })
    // }
    useCommentsStore().beforeGetComments(publication);
}


function getMoreComments(publication: any) {
    useCommentsStore().getMoreComments(publication);
    // usePublicationsStore().$patch((state: any) => {
    //     state.publications.map((item: any) => {
    //         if (item.publication_id == publication.publication_id) {
    //             item.from = item.from + item.limit;
    //             item.limit = item.limit + item.limit;
    //             item.comments.length >= item.from ? useCommentsStore().getAllComments(publication.publication_id, item.limit, item.from) : null;
    //         }
    //         return item;
    //     })
    // })
}

function displayMenu(publication: any) {
    usePublicationsStore().displayMenu(publication);
}
function likePublication(publication_id: any) {
    usePublicationsStore().likePublication(publication_id);
}

function changePage(operation: string) {
    usePublicationsStore().resetPublicationsAndCache();
    if (operation == 'next') {
        page.value++
    } else if (operation == 'previous') {
        page.value--
    }
}

function init() {
    usePublicationsStore().resetPublicationsAndCache();
    // usePublicationsStore().getAllPublications(page.value, false);
    usePublicationsStore().fetchAllPublication(page.value, false);
}

watch(page, (newPageValue) => {
    usePublicationsStore().fetchAllPublication(newPageValue, false).then((response: any) => {
    });
})

init();

</script>
<template>
    <template v-if="isLoading">
        <Loading />
    </template>
    <template v-else-if="!isLoading">
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
                    <form @keyup.enter="createPublication">
                        <textarea v-model="content" placeholder="Quoi de neuf ?"
                            class="create_post__content__details__text" @input="autoResize"></textarea>
                        <div class="create_post__content__details">
                            <input type="file" ref="fileInput" accept="image/*" @change="onPickFile"
                                @submit="picture = ''" class="create_post__content__details__file" id="file">
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div v-if="publications.length > 0">
            <div class="publication" v-for="publication in publications">
                <div>
                    <!-- <div v-if="!publication.editMode">-->
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
                                            <span>{{ publication.publication_date }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="user.user_id == publication.user_id" class="post__top__menu">
                                    <div v-if="!publication.editMode" class="post__top__menu__button">
                                        <fa icon="fa-solid fa-ellipsis" @click="displayMenu(publication)" />
                                        <div v-if="publication.menu" class="post__top__menu__content">
                                            <div class="post__top__menu__content__diamond"></div>
                                            <div class="post__top__menu__content__item">
                                                <fa @click="activeEditMode(publication)"
                                                    icon="fa-solid fa-pen-to-square" />
                                            </div>
                                            <div class="post__top__menu__content__item">
                                                <fa @click="deletePublication(publication.publication_id)"
                                                    icon="fa-solid fa-trash-can" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="post__content">
                                <div class="post__content__text">
                                    <template v-if="publication.editMode">
                                        <textarea ref="jedi" type="text" v-model="editPost.content"
                                            class="create_post__content__details__text post-edit"
                                            @click="autoResize"></textarea>
                                        <input type="file" ref="fileInput" accept="image/*" @change="editPickFile"
                                            class="create_post__content__details__file">
                                    </template>
                                    <template v-else>
                                        <p v-if="publication.content">{{ publication.content }}</p>
                                    </template>
                                </div>
                                <img v-if="publication.picture" :src="publication.picture" alt="">
                            </div>
                        </div>
                        <div v-if="publication.editMode" class="post__button">
                            <div class="post__button__list">
                                <button @click="publication.editMode = false" class="cancel">Annuler</button>
                                <button @click="updatePublication(publication)" class="submit">Sauvegarder</button>
                            </div>
                        </div>
                        <div v-else class="post__likeAndComment">
                            <div class="post__interaction">
                                <div class="post__interaction__like">
                                    <button v-if="!publication.iLike"
                                        @click.stop="likePublication(publication.publication_id)">
                                        <span>{{ publication.likes.length + ' ' }}</span>
                                        <fa icon="fa-regular fa-heart" />
                                    </button>
                                    <button v-else class="like"
                                        @click.stop="likePublication(publication.publication_id)">
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
                                <template v-if="publication.displayComments">
                                    <Comment :publication_id="publication.publication_id" :user="user"
                                        :numberOfComments="publication.numberOfComments"
                                        :comments="publication.comments" @getMore="getMoreComments(publication)" />
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="post__page">
                <div v-if="page > 1" class="post__page__previous">
                    <button @click="changePage('previous')" type="button">Page Précédente</button>
                </div>
                <div v-if="page < numberOfPages" class="post__page__next">
                    <button @click="changePage('next')" type="button">Page Suivante</button>
                </div>
            </div>
        </div>
    </template>
</template>
<style scoped lang="scss">
@import '../styles/Utils/keyframes';

* {
    font-family: 'Lato', sans-serif;
}

@import '../styles/Components/buttons';
@import '../styles/Utils/keyframes';

.create_post {
    max-height: 860px;
    display: flex;
    width: 470px;
    border-radius: 5px;
    margin: 60px auto auto auto;
    background-color: floralwhite;
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
                    border-radius: 5px;
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

            svg {
                color: #4E5166;
                cursor: pointer;
                position: absolute;
                font-size: 20px;
                position: absolute;
                right: 17px;
                top: 17px;
            }

            form {
                width: 100%;
            }

            &__text {
                width: 94%;
                display: block;
                overflow: hidden;
                resize: none;
                border: 1px solid #DBDBDB;
                border-radius: 5px;
                padding: 0px 7px 0px 7px;
                background-color: rgb(255, 255, 255);
                color: rgb(0, 0, 0);

                &:focus-visible {
                    outline: none;
                }

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

    &__information {
        border-radius: 5px;
        background-color: floralwhite;
    }

    &__top {
        display: flex;
        padding: 10px 0 0 10px;

        &__details {
            width: 90%;
            display: flex;
            flex-direction: row;

            &__avatar {
                margin-right: 0.5rem;

                img {
                    width: 40px;
                    border-radius: 5px;
                    height: 40px;
                    object-fit: cover;
                }
            }

            &__info {
                &__name {
                    font-weight: bold;
                }

                &__date {
                    font-size: 12px;
                    color: #FD2D01;
                }
            }


        }

        &__menu {
            width: 10%;
            display: flex;
            justify-content: end;
            margin-right: 20px;

            &__button {
                position: relative;

                svg {
                    cursor: pointer;
                    color: #FD2D01;
                }
            }

            &__content {
                position: absolute;
                right: -10px;
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
            margin: 0px 10px 20px;
            display: flex;
            flex-direction: column;
            color: #4E5166;
            width: 96%;

            span {
                font-weight: bold;
            }

            p {
                width: 95%;
                overflow-wrap: break-word;
            }
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-top: 1px solid #FD2D01;
            background: #FFFFFF;
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
        border-top: 1px solid #dbdbdb;
    }

    &__interaction {
        display: flex;
        width: 100%;
        border-radius: 0px 0px 15px 15px;

        &__like {
            width: 50%;
            padding: 5px;

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
            padding: 5px;
            border-left: 1px solid #dbdbdb;

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

            &__list {
                width: 100%;
            }
        }
    }

    &__button {
        &__list {
            display: flex;
            justify-content: flex-end;
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