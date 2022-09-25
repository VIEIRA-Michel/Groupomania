<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
import { useFriendshipStore } from '../shared/stores/friendsStore';
import socket from '../socket';

const isConnected = computed(() => useAuthStore().$state.isConnected);
const requests = computed(() => useFriendshipStore().$state.requests);
const friends = computed(() => useFriendshipStore().$state.friends);
const usersFound = computed(() => useFriendshipStore().$state.searchResults);

const search = ref('');
let open = ref(false);
let modalRequest = ref(false);
let userToBeDeleted = ref(null);
let invitToBeCanceled = ref(null);

function removeFriend(user_id: number) {
    useFriendshipStore().removeFriend(user_id).then((response: any) => {
        open.value = false;
        socket.emit('friend removed', { user: useAuthStore().$state.user.user_id, target: user_id }, useAuthStore().$state.user);
    });
}

function addToFriends(user_id: any) {
    useFriendshipStore().sendFriendRequest(user_id).then((response: any) => {
        let req = ref({
            approve_date: response.data.results[0].approve_date,
            denied_date: response.data.results[0].denied_date,
            email: useAuthStore().$state.user.email,
            firstname: useAuthStore().$state.user.firstname,
            idRequest: response.data.results[0].id,
            lastname: useAuthStore().$state.user.lastname,
            picture_url: useAuthStore().$state.user.picture_url,
            recipient: response.data.results[0].user_id_recipient,
            request_date: response.data.results[0].request_date,
            sender: response.data.results[0].user_id_sender,
            session_id: response.data.results[0].session_id,
            userID: response.data.results[0].userID,
        })
        socket.emit('friendRequest sended', { request: req.value, user: useAuthStore().$state.user });
    })
}

function replyToRequest(invitation: any, reply: string) {
    useFriendshipStore().acceptOrDeclineRequest(invitation, reply).then((response) => {
        if (reply == 'accepted') {
            socket.emit('friendRequest accepted', { response, user: useAuthStore().$state.user });
        } else {
            socket.emit('friendRequest refused', { user: useAuthStore().$state.user.user_id, target: invitation.sender }, useAuthStore().$state.user);
        }
    })
}

function searchUser() {
    useFriendshipStore().checkRequestsSended().then((response: any) => {
        useFriendshipStore().searchUser(search.value).then((response: any) => {
        })
    });
};

function cancelRequest(user_id: number) {
    useFriendshipStore().cancelRequest(user_id).then((response) => {
        modalRequest.value = false;
        socket.emit('friendRequest canceled', { user: useAuthStore().$state.user.user_id, target: user_id }, useAuthStore().$state.user);
    });
}

function cancelModal(user: any) {
    modalRequest.value = true
    invitToBeCanceled.value = user;
}
function deleteModal(user: any) {
    open.value = true;
    userToBeDeleted.value = user;
}

watch(modalRequest, (value: boolean) => {
    if (value == true) {
        document.querySelector('body')!.style.overflowY = 'hidden';
    } else if (value == false) {
        document.querySelector('body')!.style.overflowY = 'scroll';
    }
})

</script>
<template>
    <div v-if="isConnected" class="container">
        <div class="search-user">
            <div class="search-user__title">Rechercher un utilisateur</div>
            <div class="search-user__input">
                <input type="text" v-model="search" @keyup.enter="searchUser" />
            </div>
            <div v-if="usersFound" class="search-user__results">
                <div class="search-user__results__list">
                    <div v-for="user in usersFound" class="search-user__results__list__item">

                        <div class="search-user__results__list__item__avatar">
                            <img :src="user.picture_url" alt="avatar-1">
                        </div>
                        <div class="search-user__results__list__item__name">
                            <div class="search-user__results__list__item__name__text">
                                <div class="search-user__results__list__item__name__text__username">
                                    <span>{{ user.firstname }} {{ user.lastname }}</span>
                                </div>
                            </div>
                            <button v-if="!user.isFriend && !user.pending && !user.waitingReply"
                                @click="addToFriends(user.user_id)">
                                <fa icon="fa-solid fa-user-plus" />
                            </button>
                            <button v-if="user.pending && !user.isFriend && !user.waitingReply"
                                @click="cancelModal(user)" class="pending">
                                <fa icon="fa-solid fa-user-clock" />
                            </button>
                            <button v-if="user.isFriend && !user.pending && !user.waitingReply"
                                @click="deleteModal(user)" class="friend">
                                <fa icon="fa-solid fa-user-check" />
                            </button>
                            <div v-if="user.waitingReply && !user.pending && !user.isFriend"
                                class="search-user__results__list__item__name__button">
                                <button @click="replyToRequest({ sender: user.user_id }, 'refused')" class="refused">
                                    <fa icon="fa-solid fa-xmark" />
                                </button>
                                <button @click="replyToRequest({ sender: user.user_id }, 'accepted')" class="accepted">
                                    <fa icon="fa-solid fa-check" />
                                </button>
                            </div>
                            <Teleport to="body">
                                <div v-if="modalRequest" @click="modalRequest = false"
                                    class="calc d-flex flex-row justify-content-center align-items-center">
                                    <div @click.stop class="modal-container">

                                        <div class="modal-container__content">
                                            <div class="modal-container__content__header">
                                                <div class="modal-container__content__header__title">Êtes-vous
                                                    certains de
                                                    vouloir annuler votre demande d'amitié envers <span>{{
                                                    invitToBeCanceled.firstname
                                                    }}</span> ?
                                                </div>
                                            </div>
                                            <div class="modal-container__content__footer">
                                                <button @click="modalRequest = false" type="button"
                                                    class="btn btn-secondary" data-dismiss="modal">Annuler</button>
                                                <button @click="cancelRequest(invitToBeCanceled.user_id)" type="button"
                                                    class="btn btn-primary">Retirer ma demande</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Teleport>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="friends-request">
            <div class="friends-request__title">
                <div class="friends-request__title__text">
                    Demandes d'amis
                </div>
            </div>
            <div v-if="requests.length >= 1" class="friends-request__list">
                <div v-for="req in requests" class="friends-request__list__item">
                    <div class="friends-request__list__item__avatar">
                        <img :src="req.picture_url" alt="avatar-1">
                    </div>
                    <div class="friends-request__list__item__name">
                        <div class="friends-request__list__item__name__text">
                            <div class="friends-request__list__item__name__text__username">
                                <span>{{ req.firstname }} {{ req.lastname }}</span>
                            </div>
                        </div>
                        <div class="friends-request__list__item__name__button">
                            <button @click="replyToRequest(req, 'refused')" class="refused">
                                <fa icon="fa-solid fa-xmark" />
                            </button>
                            <button @click="replyToRequest(req, 'accepted')" class="accepted">
                                <fa icon="fa-solid fa-check" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                <div class="friends-request__empty-requests">
                    <div class="friends-request__empty-requests__text">
                        <span>Vous n'avez aucune demande</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="friends-list">
            <div class="friends-list__title">
                <div class="friends-list__title__text">
                    Mes amis
                </div>
            </div>
            <div v-if="friends.length > 0" class="friends-list__list">
                <div v-for="friend in friends" class="friends-list__list__item">
                    <div class="friends-list__list__item__avatar">
                        <img :src="friend.picture_url" alt="avatar-1">
                    </div>
                    <div class="friends-list__list__item__name">
                        <div class="friends-list__list__item__name__text">
                            <div class="friends-list__list__item__name__text__username">
                                <span>{{ friend.firstname }} {{ friend.lastname }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="friends-list__list__item__button">

                        <button class="friend" @click="deleteModal(friend)">
                            <fa icon="fa-solid fa-user-minus" />
                        </button>
                    </div>
                    <Teleport to="body">
                        <div v-if="open" @click="open = false"
                            class="calc d-flex flex-row justify-content-center align-items-center">
                            <div @click.stop class="modal-container">

                                <div class="modal-container__content">
                                    <div class="modal-container__content__header">
                                        <div class="modal-container__content__header__title">Êtes-vous certains de
                                            vouloir retirer <span>{{ userToBeDeleted.firstname }}</span> de votre liste
                                            d'amis ?</div>
                                    </div>
                                    <div class="modal-container__content__footer">
                                        <button @click="open = false" type="button" class="btn btn-secondary"
                                            data-dismiss="modal">Annuler</button>
                                        <button @click="removeFriend(userToBeDeleted.user_id)" type="button"
                                            class="btn btn-primary">Retirer
                                            {{ userToBeDeleted.firstname }}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Teleport>
                </div>
            </div>
            <div v-else>
                <div class="friends-list__empty-friends">
                    <div class="friends-list__empty-friends__text">
                        <span>Vous n'avez aucun ami</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
@import '../styles/Components/buttons';
@import '../styles/Utils/keyframes';

* {
    font-family: 'Lato', sans-serif;
}

.container {
    display: flex;
    flex-direction: column;
    margin-top: 50px;

    .search-user {
        background: floralwhite;
        border: 1px solid #FD2D01;
        width: 70%;
        margin: 10px auto 0px auto;
        border-radius: 5px;
        padding: 20px;
        -webkit-animation: slide-in-top 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        animation: slide-in-top 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;

        &__title {
            text-align: center;
            margin-bottom: 20px;
            font-weight: 700;
            width: 100%;
            border-radius: 5px;
            padding: 10px 0;
            background-color: #ffffff;
            border: 1px solid #dbdbdb;
        }

        &__input {
            display: flex;
            justify-content: center;
            margin: 20px;

            input {
                border: 1px solid #dbdbdb;
                border-radius: 5px;
                outline: none;
            }
        }

        &__results {
            &__list {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                margin: auto;
                width: 70%;
                justify-content: space-between;

                @media (max-width: 768px) {
                    width: 100%;
                }

                &__item {
                    margin: 10px auto;
                    width: 105px;
                    background: #ffffff;
                    border: 1px solid #dbdbdb;
                    border-radius: 5px;

                    &__avatar {
                        display: flex;
                        justify-content: center;

                        img {
                            width: 100%;
                            height: 80px;
                            object-fit: cover;
                            border-radius: 5px 5px 0 0;
                        }
                    }

                    &__name {
                        &__text {
                            margin: 5px;

                            &__username {
                                display: flex;
                                justify-content: center;

                                span {
                                    font-size: 12px;
                                    font-weight: 300;
                                }
                            }
                        }

                        &__button {
                            display: flex;
                            flex-direction: row;
                            border-top: 1px solid #dbdbdb;
                            border-radius: 0 0 5px 5px;

                            button {
                                width: 100%;
                            }

                            .refused {
                                border-radius: 0 0 0 5px;
                                background: #ff7a7a;
                                border: none;
                            }

                            .accepted {
                                border-radius: 0 0 5px 0;
                                background: #bcffcb;
                                border: none;
                            }
                        }

                        button {
                            background: #bcffcb;
                            width: 100%;
                            height: 30px;
                            border: none;
                            border-top: 1px solid #dbdbdb;
                            border-radius: 0 0 5px 5px;
                            font-weight: bold;
                            cursor: pointer;
                        }

                        .pending {
                            background: #4E5166;
                        }

                        .friend {
                            background: #FFD7D7;
                        }

                    }
                }
            }
        }
    }

    .friends-request {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: floralwhite;
        border: 1px solid #FD2D01;
        width: 70%;
        padding: 20px;
        margin: 10px auto 0px auto;
        border-radius: 5px;
        -webkit-animation: slide-in-bottom 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.3s both;
        animation: slide-in-bottom 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.3s both;

        &__title {
            width: 100%;
            border-radius: 5px;
            padding: 10px 0;
            background-color: #ffffff;
            border: 1px solid #dbdbdb;
            margin-bottom: 20px;
            text-align: center;

            &__text {
                font-weight: 700;
            }
        }

        &__list {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            margin: auto;
            width: 70%;
            justify-content: space-between;

            @media (max-width: 768px) {
                width: 100%;
            }

            &__item {
                margin: 10px auto;
                width: 105px;
                background: #ffffff;
                border: 1px solid #dbdbdb;
                border-radius: 5px;

                &__name {
                    &__text {
                        margin: 5px;

                        &__username {
                            display: flex;
                            justify-content: center;

                            span {
                                font-size: 12px;
                                font-weight: 300;
                            }
                        }
                    }

                    &__button {
                        display: flex;
                        flex-direction: row;
                        justify-content: space-between;

                    }

                    button {
                        font-size: 1rem;
                        width: 100%;
                        height: 30px;
                        cursor: pointer;
                        border: none;
                        border-top: 1px solid #DBDBDB;

                        transition: all 0.3s ease-in-out;
                    }

                    .refused {
                        background: #ff7a7a;
                        border-radius: 0 0 0 5px;
                    }

                    .accepted {
                        background: #bcffcb;
                        border-radius: 0 0 5px 0;
                    }
                }

                &__avatar {
                    display: flex;
                    justify-content: center;

                    img {
                        width: 100%;
                        height: 80px;
                        object-fit: cover;
                        border-radius: 5px 5px 0 0;
                    }
                }
            }
        }

        &__empty-requests {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
        }
    }

    .friends-list {
        background: floralwhite;
        border: 1px solid #FD2D01;
        width: 70%;
        padding: 20px;
        margin: 10px auto 0px auto;
        border-radius: 5px;
        -webkit-animation: slide-in-bottom 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.6s both;
        animation: slide-in-bottom 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.6s both;

        &__title {
            width: 100%;
            border-radius: 5px;
            padding: 10px 0;
            background-color: #ffffff;
            border: 1px solid #dbdbdb;
            text-align: center;
            margin-bottom: 10px;
            font-weight: 700;
        }

        &__list {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            margin: auto;
            width: 70%;
            justify-content: space-between;

            @media (max-width: 768px) {
                width: 100%;
            }

            &__item {

                margin: 10px auto;
                width: 105px;
                background: #ffffff;
                border: 1px solid #dbdbdb;
                border-radius: 5px;


                &__button {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;

                    button {
                        font-size: 1rem;
                        width: 100%;
                        height: 30px;
                        cursor: pointer;
                        border: none;
                        border-top: 1px solid #DBDBDB;
                        border-radius: 0 0 5px 5px;
                        transition: all 0.3s ease-in-out;

                    }

                    .message {
                        background-color: #fffa7a;
                    }

                }

                &__avatar {
                    display: flex;
                    justify-content: center;

                    img {
                        width: 100%;
                        height: 80px;
                        object-fit: cover;
                        border-radius: 5px 5px 0 0;
                    }
                }

                &__name {
                    &__text {
                        margin: 5px;

                        &__username {
                            display: flex;
                            justify-content: center;

                            span {
                                font-size: 12px;
                                font-weight: 300;
                            }
                        }
                    }
                }


            }
        }

        &__empty-friends {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
        }
    }

}

.calc {
    position: fixed;
    top: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.modal-container {
    background-color: #FFF;
    color: #4E5166;
    padding: 20px;
    border-radius: 5px;
    width: 300px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    backdrop-filter: blur(2px);
    transition: all 0.3s ease-in-out;
    transform: translateY(-100px);
    transform-origin: center;

    &__content {
        width: 100%;

        &__header {

            &__title {
                margin-bottom: 20px;
                margin-top: 0;

                span {
                    color: $color-primary;
                    font-weight: 600;
                }
            }
        }

        &__footer {
            display: flex;
            justify-content: flex-end;

            .btn.btn-primary {
                @include button-primary;
                margin-left: 10px;
            }

            .btn.btn-secondary {
                @include button-secondary;
            }
        }
    }
}
</style>