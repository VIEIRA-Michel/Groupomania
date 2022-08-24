<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
import { useFriendshipStore } from '../shared/stores/friendsStore';
import NavigationBar from '../components/NavigationBar.vue';

useAuthStore().getMyInformations();
useAuthStore().$state.isConnected == false ? window.location.href = '/' : "";
useFriendshipStore().$reset();

const isConnected = computed(() => useAuthStore().$state.isConnected);
const user = computed(() => useAuthStore().$state.user);
const requests = computed(() => useFriendshipStore().$state.requests);
const friends = computed(() => useFriendshipStore().$state.friends);
const usersFound = computed(() => useFriendshipStore().$state.searchResults);

const search = ref('');
let open = ref(false);
let modalRequest = ref(false);

useFriendshipStore().getRequests();
useFriendshipStore().getAllFriends();

function logout() {
    useAuthStore().logout();
    window.location.href = '/';
}

function removeFriend(user_id: number) {
    open.value = false;
    useFriendshipStore().removeFriend(user_id);
}

function searchUser(search: string) {
    useFriendshipStore().$patch({
        isLoading: true,
    });
    useFriendshipStore().checkRequestsSended();
    useFriendshipStore().searchUser(search);
}

function cancelRequest(user_id: number) {
    modalRequest.value = false;
    useFriendshipStore().cancelRequest(user_id);
}

</script>
<template>
    <div>
        <NavigationBar :user="user" :isConnected="isConnected" @logout="logout()" />
        <div v-if="isConnected" class="container">
            <div class="search-user">
                <div class="search-user__title">Rechercher un utilisateur</div>
                <div class="search-user__input">
                    <input type="text" v-model="search" @keyup.enter="searchUser(search)" />
                </div>
                <div v-if="usersFound" class="search-user__results">
                    <div class="search-user__results__list">
                        <div v-for="user in usersFound" class="search-user__results__list__item">

                            <div class="search-user__results__list__item__avatar">
                                <img :src="user.picture_url" alt="avatar-1">
                            </div>
                            <div class="search-user__results__list__item__name">
                                <div class="search-user__results__list__item__name__text">
                                    <div class="search-user__results__list__item__name__text__firstname">
                                        <span>{{ user.firstname }}</span>
                                    </div>
                                    <div class="search-user__results__list__item__name__text__lastname">
                                        <span>{{ user.lastname }}</span>
                                    </div>
                                </div>
                                <button v-if="!user.isFriend && !user.pending"
                                    @click="useFriendshipStore().sendFriendRequest(user.user_id)">
                                    <fa icon="fa-solid fa-user-plus" />
                                </button>
                                <button v-if="user.pending" @click="modalRequest = true" class="pending">
                                    <fa icon="fa-solid fa-user-clock" />
                                </button>
                                <button v-if="user.isFriend" @click="open = true" class="friend">
                                    <fa icon="fa-solid fa-user-check" />
                                </button>
                                <Teleport to="body">
                                    <div v-if="modalRequest" @click="modalRequest = false"
                                        class="calc d-flex flex-row justify-content-center align-items-center">
                                        <div @click.stop class="modal-container">

                                            <div class="modal-container__content">
                                                <div class="modal-container__content__header">
                                                    <h5 class="modal-container__content__header__title">Êtes-vous
                                                        certains de
                                                        vouloir annuler votre demande d'amitié envers {{ user.firstname
                                                        }} ?
                                                    </h5>
                                                </div>
                                                <div class="modal-container__content__footer">
                                                    <button @click="modalRequest = false" type="button"
                                                        class="btn btn-secondary" data-dismiss="modal">Annuler</button>
                                                    <button @click="cancelRequest(user.user_id)" type="button"
                                                        class="btn btn-primary">Retirer
                                                        {{ user.firstname }}</button>
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
                                <div class="friends-request__list__item__name__text__firstname">
                                    <span>{{ req.firstname }}</span>
                                </div>
                                <div class="friends-request__list__item__name__text__lastname">
                                    <span>{{ req.lastname }}</span>
                                </div>
                            </div>
                            <div class="friends-request__list__item__name__button">
                                <button @click="useFriendshipStore().acceptOrDeclineRequest(req, 'refused')"
                                    class="refused">
                                    <fa icon="fa-solid fa-xmark" />
                                </button>
                                <button @click="useFriendshipStore().acceptOrDeclineRequest(req, 'accepted')"
                                    class="accepted">
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
                                <div class="friends-list__list__item__name__text__firstname">
                                    <span>{{ friend.firstname }}</span>
                                </div>
                                <div class="friends-list__list__item__name__text__lastname">
                                    <span>{{ friend.lastname }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="friends-list__list__item__button">

                            <button class="friend" @click="open = true">
                                <fa icon="fa-solid fa-user-minus" />
                            </button>
                        </div>
                        <Teleport to="body">
                            <div v-if="open" @click="open = false"
                                class="calc d-flex flex-row justify-content-center align-items-center">
                                <div @click.stop class="modal-container">

                                    <div class="modal-container__content">
                                        <div class="modal-container__content__header">
                                            <h5 class="modal-container__content__header__title">Êtes-vous certains de
                                                vouloir retirer {{ friend.firstname }} de votre liste d'amis ?</h5>
                                        </div>
                                        <div class="modal-container__content__footer">
                                            <button @click="open = false" type="button" class="btn btn-secondary"
                                                data-dismiss="modal">Annuler</button>
                                            <button @click="removeFriend(friend.user_id)" type="button"
                                                class="btn btn-primary">Retirer
                                                {{ friend.firstname }}</button>
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
    </div>
</template>
<style scoped lang="scss">
@import '../styles/Components/buttons';


* {
    font-family: 'Lato', sans-serif;
}

.container {
    display: flex;
    flex-direction: column;

    .search-user {
        background: #FFFFFF;
        border: 1px solid #FD2D01;
        width: 70%;
        margin: 10px auto 0px auto;

        &__title {
            text-align: center;
            margin-top: 20px;
            font-weight: 700;
        }

        &__input {
            display: flex;
            justify-content: center;
            margin: 20px;

            input {
                border: 1px solid #FD2D01;
                border-radius: 5px;
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
                    width: 90px;
                    padding: 15px;
                    background: linear-gradient(180deg, #FFD7D7, transparent);
                    border: 1px solid #FD2D01;
                    border-radius: 5px;

                    &__avatar {
                        display: flex;
                        justify-content: center;

                        img {
                            width: 50px;
                            height: 50px;
                            object-fit: cover;
                        }
                    }

                    &__name {
                        &__text {
                            margin-bottom: 5px;

                            &__firstname {
                                display: flex;
                                justify-content: center;

                                span {
                                    font-size: 20px;
                                    font-weight: bold;
                                }
                            }

                            &__lastname {
                                display: flex;
                                justify-content: center;

                                span {

                                    font-size: 20px;
                                    font-weight: bold;
                                }
                            }
                        }

                        button {
                            background: #bcffcb;
                            width: 100%;
                            height: 30px;
                            border-radius: 5px;
                            font-weight: bold;
                            cursor: pointer;
                            border: 1px solid #DBDBDB;
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
        background: #FFFFFF;
        border: 1px solid #FD2D01;
        width: 70%;
        margin: 10px auto 0px auto;

        &__title {
            margin-top: 20px;

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
                width: 90px;
                padding: 15px;
                background: linear-gradient(180deg, #FFD7D7, transparent);
                border: 1px solid #FD2D01;
                border-radius: 5px;

                &__name {
                    &__text {
                        margin-bottom: 5px;

                        &__firstname {
                            display: flex;
                            justify-content: center;

                            span {
                                font-size: 20px;
                                font-weight: bold;
                            }
                        }

                        &__lastname {
                            display: flex;
                            justify-content: center;

                            span {

                                font-size: 20px;
                                font-weight: bold;
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
                        width: 40px;
                        height: 30px;
                        font-weight: bold;
                        cursor: pointer;
                        border: 1px solid #DBDBDB;
                        padding: 5px 10px;
                        border-radius: 5px;
                        transition: all 0.3s ease-in-out;
                    }

                    .refused {
                        background: #ff7a7a;
                    }

                    .accepted {
                        background: #bcffcb;
                    }
                }

                &__avatar {
                    display: flex;
                    justify-content: center;

                    img {
                        width: 50px;
                        height: 50px;
                        object-fit: cover;
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
        background: #FFFFFF;
        border: 1px solid #FD2D01;
        width: 70%;
        margin: 10px auto 0px auto;

        &__title {
            text-align: center;
            margin-top: 20px;
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
                width: 90px;
                padding: 15px;
                background: linear-gradient(180deg, #FFD7D7, transparent);
                border: 1px solid #FD2D01;
                border-radius: 5px;


                &__button {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;

                    button {
                        background-color: #ff7a7a;
                        font-size: 1rem;
                        width: 40px;
                        height: 30px;
                        font-weight: bold;
                        cursor: pointer;
                        border: 1px solid #DBDBDB;
                        padding: 5px 10px;
                        border-radius: 5px;
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
                        width: 50px;
                        height: 50px;
                        object-fit: cover;
                    }
                }

                &__name {
                    &__text {
                        margin-bottom: 5px;

                        &__firstname {
                            display: flex;
                            justify-content: center;

                            span {
                                font-size: 20px;
                                font-weight: bold;
                            }
                        }

                        &__lastname {
                            display: flex;
                            justify-content: center;

                            span {

                                font-size: 20px;
                                font-weight: bold;
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
    position: absolute;
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
    border-radius: 20px;
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
                margin-top: 0;
            }
        }

        &__footer {
            display: flex;
            justify-content: flex-end;

            .btn.btn-primary {
                @include button-primary;
            }

            .btn.btn-secondary {
                @include button-primary;
                color: #FD2D01;
                background-color: #FFFFFF;
            }
        }
    }
}
</style>