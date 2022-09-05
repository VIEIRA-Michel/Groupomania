<script setup lang="ts">
import Loading from '../components/Loading.vue';
import PublicationForm from '../components/PublicationForm.vue';
import Comment from '../components/Comment.vue';
import { computed, ref, onBeforeMount, onMounted, watchEffect } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
import { useChatStore } from '../shared/stores/chatStore';
import { useFriendshipStore } from '../shared/stores/friendsStore';
import { usePublicationsStore } from '../shared/stores/publicationsStore';
import { useCommentsStore } from '../shared/stores/commentsStore';
import socket from '../socket';

const isConnected = computed(() => useAuthStore().$state.isConnected);
const user = computed(() => useAuthStore().$state.user);
const users = computed(() => useChatStore().$state.users);
const friendsConnected = computed(() => useChatStore().$state.friendsConnected);
const friends = computed(() => useFriendshipStore().$state.friends);
const publications = computed(() => usePublicationsStore().$state.publications);
const isLoading = computed(() => usePublicationsStore().$state.isLoading);
const numberOfPages = computed(() => usePublicationsStore().$state.numberOfPages);

useFriendshipStore().getRequests();
useFriendshipStore().checkRequestsSended();
useFriendshipStore().getAllFriends();

const selectedUser = ref<any>(null);
let page = ref(1);
let content = ref('');
let picture = ref();

function onPickFile(event: any) {
    picture.value = event.target.files[0];
}

function autoResize(event: any) {
    console.log(event);
    event.path[0].style.height = 'auto';
    event.path[0].style.height = event.path[0].scrollHeight + 'px';
}

function createPublication(event: any) {
    event.preventDefault()
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
        socket.emit('delete publication', id);
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
function likePublication(publication_id: any) {
    usePublicationsStore().likePublication(publication_id);
}

watchEffect(() => {
    usePublicationsStore().$reset();
    usePublicationsStore().getAllPublications(page.value);
})


function displayFriends(usersOnline: any) {
    usersOnline.forEach((userOnline: any) => {
        friends.value.forEach((friend: any) => {
            friend.user_id == userOnline.user ? useChatStore().friendsConnected(userOnline) : "";
        });
    });
}

function checkIsFriend(utilisateur: any) {
    friendsConnected.value.find(friend => friend.user == utilisateur.user) ? "" : friends.value.length > 0 && friends.value.find(friend => friend.user_id === utilisateur.user) ? useChatStore().friendsConnected(utilisateur) : "";
}

onBeforeMount(() => {
    if (isConnected.value) {
        useFriendshipStore().getAllFriends().then((response) => {
            const session = JSON.parse(localStorage.getItem("user"));
            if (session) {
                socket.auth = { username: session.firstname + ' ' + session.lastname, picture: session.picture_url, user: session.user_id, sessionID: session.session_id };
                socket.connect();
            }
            socket.on("session", ({ sessionID, userID }) => {
                socket.auth = { sessionID };
                socket.userID = userID;
            });
            socket.on('typing', (data) => {
                useChatStore().$patch((state) => {
                    state.typing = data;
                });
            });
            socket.on('stoptyping', (data) => {
                useChatStore().$patch((state) => {
                    state.typing = false;
                });
            });
            socket.on("connect", () => {
                users.value.forEach((utilisateur: any) => {
                    utilisateur.self ? utilisateur.connected = true : "";
                });
            });
            socket.on("disconnect", () => {
                users.value.forEach((utilisateur: any) => {
                    utilisateur.self ? utilisateur.connected = false : "";
                });
            });
            const initReactiveProperties = (utilisateur: any) => {
                utilisateur.connected = true;
                utilisateur.messages = [];
                utilisateur.hasNewMessages = false;
            };
            socket.on("users", (users2) => {
                users2.forEach((utilisateur: any) => {
                    for (let i = 0; i < users2.length; i++) {
                        const existingUser = users2[i];
                        if (existingUser.userID === utilisateur.userID) {
                            initReactiveProperties(existingUser);
                            return;
                        }
                    }
                    utilisateur.self = utilisateur.userID === socket.userID;
                    initReactiveProperties(utilisateur);
                });
                users2 = users2.sort((a: any, b: any) => {
                    if (a.self) return -1;
                    if (b.self) return 1;
                    if (a.username < b.username) return -1;
                    return a.username > b.username ? 1 : 0;
                });
                let currentUserConnected = users2.filter((user: any) => user.userID !== socket.userID);
                displayFriends(currentUserConnected);
            });
            socket.on("user connected", (utilisateur: any) => {
                for (let i = 0; i < users.value.length; i++) {
                    const existingUser: any = useChatStore().$state.users[i];
                    if (existingUser.userID === utilisateur.userID) {
                        existingUser.connected = true;
                        return;
                    }
                }
                initReactiveProperties(utilisateur);
                useChatStore().userConnected(utilisateur);
                checkIsFriend(utilisateur);
            });
            socket.on("user disconnected", (id) => {
                let newArray = ref(users.value.filter((utilisateur: any) => utilisateur.userID !== id));
                let newArrayFriend = ref(friendsConnected.value.filter((utilisateur: any) => utilisateur.user !== id));
                useChatStore().$patch((state: any) => {
                    state.users = newArray.value;
                    state.friendsConnected = newArrayFriend.value;
                });
            });
            socket.on("private message", ({ content, from, to }) => {
                for (let i = 0; i < friendsConnected.value.length; i++) {
                    const utilisateur: any = friendsConnected.value[i];
                    if (utilisateur.userID === from) {
                        utilisateur.messages.push({
                            message: content,
                            fromSelf: false,
                        });
                        if (utilisateur !== selectedUser) {
                            utilisateur.hasNewMessages = true;
                        }
                        break;
                    }
                }
            });
            socket.on('like', (data) => {
                console.log(data);
                usePublicationsStore().$patch((state: any) => {
                    state.publications.map((item: any) => {
                        if (item.publication_id == data.publication_id) {
                            item.likes.push(data.user_id);
                        }
                        return item;
                    })
                })
            })
            socket.on('remove like', (data) => {
                console.log(data);
                usePublicationsStore().$patch((state: any) => {
                    state.publications.map((item: any) => {
                        if (item.publication_id == data.publication_id) {
                            item.likes = item.likes.filter((like: any) => like != data.user_id);
                        }
                        return item;
                    });
                });
            })
            socket.on('new publication', (data) => {
                usePublicationsStore().$patch((state: any) => {
                    state.publications.unshift(data._value);
                });
            });
            socket.on('edit publication', (data) => {
                usePublicationsStore().$patch((state: any) => {
                    state.publications.map((item: any) => {
                        if (item.publication_id == data.publication_id) {
                            item.content = data.content;
                            item.picture = data.picture;
                            item.updated_at = data.updated_at;
                        }
                        return item;
                    });
                });
            });

            socket.on('delete publication', (data) => {
                usePublicationsStore().$patch((state: any) => {
                    state.publications.map((item: any) => {
                        if (item.publication_id == data) {
                            state.publications.splice(usePublicationsStore().$state.publications.indexOf(item), 1);
                        }
                    });
                });
            });
            socket.on('has commented', (data: any) => {
                usePublicationsStore().$patch((state: any) => {
                    state.publications.map((item: any) => {
                        if (item.publication_id == data._value.publication_id) {
                            item.comments.push(data._value);
                            item.numberOfComments = item.numberOfComments + 1;
                        }
                        return item;
                    });
                });
            });

            socket.on('delete comment', (data: any) => {
                usePublicationsStore().$patch((state: any) => {
                    state.publications.map((item: any) => {
                        if (item.publication_id == data.publication_id) {
                            item.comments = item.comments.filter((itemComment: any) => {
                                return itemComment.comment_id != data.id;
                            });
                            console.log(item);
                            item.numberOfComments = item.numberOfComments - 1;
                        }
                        return item;
                    });
                })
            })
        });
    }
});

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
                            </div>
                            <div class="post__content">
                                <div class="post__content__text">
                                    <template v-if="publication.editMode">
                                        <textarea ref="jedi" type="text" v-model="publication.content"
                                            class="create_post__content__details__text post-edit" @click="autoResize"></textarea>
                                        <input type="file" ref="fileInput" accept="image/*" @change="onPickFile"
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
                                <button
                                    @click="usePublicationsStore().updatePublication(publication.publication_id, { editMode: false, post: $event })"
                                    class="submit">Sauvegarder</button>
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
                                        :comments="publication.comments" @getMore="getComments(publication, true)" />
                                </template>
                            </div>
                        </div>
                    </div>
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

            form {
                width: 100%;
            }

            &__text {
                width: 94%;
                display: block;
                overflow: hidden;
                resize: none;
                border: none;
                border-radius: 5px;
                padding: 0px 7px 0px 7px;
                background-color: rgb(255, 255, 255);
                color: rgb(0, 0, 0);

                &:focus-visible {
                    outline-color: #FFFFFF;
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

    &__top {
        display: flex;
        padding: 10px 0 0 10px;

        &__details {
            width: 50%;
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
                    color: #4E5166;
                }
            }


        }

        &__menu {
            width: 50%;
            display: flex;
            justify-content: end;
            margin-right: 20px;

            &__button {
                position: relative;

                svg {
                    cursor: pointer;
                    color: #4E5166;
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
            margin: 0 10px;
            display: flex;
            flex-direction: column;
            color: #4E5166;
            width: 100%;

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