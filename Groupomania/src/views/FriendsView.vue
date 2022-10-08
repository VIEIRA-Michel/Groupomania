<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAuthStore } from '../shared/stores/authStore';
import { useFriendshipStore } from '../shared/stores/friendsStore';
import socket from '../socket';

// isConnected va nous permettre de savoir si nous sommes connectés ou non
const isConnected = computed(() => useAuthStore().$state.isConnected);

// requests va nous permettre de récupérer la liste de nos demandes d'amis reçu
const requests = computed(() => useFriendshipStore().$state.requests);

// friends va nous permettre de récupérer la liste de nos amis
const friends = computed(() => useFriendshipStore().$state.friends);

// usersFound va nous permettre de récupérer la liste d'utilisateurs trouvés qui correspondent à notre recherche
const usersFound = computed(() => useFriendshipStore().$state.searchResults);

// search va nous permettre de récupérer la valeur de notre saisie dans la barre de recherche
const search = ref('');

// open va nous permettre de faire apparaître la modal de confirmation lors de l'action permettant la suppression d'un ami
let open = ref(false);

// modalRequest va nous permettre de faire apparaître la modal de confirmation lors de l'action permettant l'annulation d'une demande d'ami envoyée
let modalRequest = ref(false);

// userToBeDeleted va nous permettre de récupérer l'utilisateur que nous souhaitons supprimer de notre liste d'amis
let userToBeDeleted = ref(null);

// invitToBeCanceled va nous permettre de récupérer l'utilisateur dont nous souhaitons annuler la demande d'ami
let invitToBeCanceled = ref(null);

// Cette fonction va nous permettre de transmettre l'id de notre ami à la fonction présente dans le store communiquant directement à l'api
function removeFriend(utilisateur: number) {
    console.log(utilisateur);
    useFriendshipStore().removeFriend(utilisateur.user_id).then((response: any) => {
        // Si tout s'est bien passé on réinitialise la valeur de open afin que la modal puisse de nouveau s'ouvrir dans le cas où nous souhaiterions supprimé par la suite un autre ami
        open.value = false;
        // Et on émet ensuite l'évènement en lien afin de prévenir le serveur que nous avons supprimé un ami
        socket.emit('friend removed', { user: useAuthStore().$state.user, target: utilisateur });
    });
}

// Cette fonction va nous permettre de transmettre l'id de l'utilisateur que nous souhaitons ajouter à notre liste d'amis
function addToFriends(user_id: any) {
    useFriendshipStore().sendFriendRequest(user_id).then((response: any) => {
        let req = ref({
            approve_date: response.data.results[0].approve_date,
            denied_date: response.data.results[0].denied_date,
            email: useAuthStore().$state.user.email,
            firstname: useAuthStore().$state.user.firstname,
            idRequest: response.data.results[0].requestId,
            lastname: useAuthStore().$state.user.lastname,
            picture_url: useAuthStore().$state.user.picture_url,
            recipient: response.data.results[0].user_id_recipient,
            request_date: response.data.results[0].request_date,
            sender: response.data.results[0].user_id_sender,
            session_id: response.data.results[0].session_id,
            userID: useAuthStore().$state.user.userID,
        })
        // Et on émet ensuite l'évènement en lien afin de prévenir le serveur que nous avons envoyé une demande d'ami
        socket.emit('friendRequest sended', { request: req.value, user: useAuthStore().$state.user });
    })
}

// Cette fonction va nous permettre de transmettre notre réponse à la demande d'ami reçu
function replyToRequest(invitation: any, reply: string) {
    useFriendshipStore().acceptOrDeclineRequest(invitation, reply).then((response) => {
        // Si tout s'est bien passé on émet l'évènement en lien afin de prévenir le serveur que nous avons accepté ou refusé une demande d'ami
        if (reply == 'accepted') {
            socket.emit('friendRequest accepted', { user: useAuthStore().$state.user, target: invitation });
        } else {
            socket.emit('friendRequest refused', { user: useAuthStore().$state.user, target: invitation });
        }
    })
}

// Cette fonction va nous permettre de rechercher un utilisateur en fonction de ce que nous avons saisie dans la barre de recherche
function searchUser() {
    // On vérifie d'abord nos demandes d'ami envoyées afin d'afficher le bon bouton sous la carte d'utilisateur en fonction de la situation
    useFriendshipStore().checkRequestsSended().then((response: any) => {
        // On éxécute ensuite la fonction de recherche présente dans le store communiquant directement à l'api
        useFriendshipStore().searchUser(search.value).then((response: any) => {
        })
    });
};

// Cette fonction va nous permettre de transmettre l'id de l'utilisateur dont nous souhaitons annuler la demande d'ami
function cancelRequest(utilisateur: any) {
    useFriendshipStore().cancelRequest(utilisateur.user_id).then((response) => {
        // Si tout s'est bien passé on réinitialise la valeur de modalRequest afin que la modal puisse de nouveau s'ouvrir dans le cas où nous souhaiterions annulé par la suite une autre demande d'ami
        modalRequest.value = false;
        // Et on émet ensuite l'évènement en lien afin de prévenir le serveur que nous avons annulé une demande d'ami
        socket.emit('friendRequest canceled', { user: useAuthStore().$state.user, request: utilisateur });
    });
}

// Cette fonction va nous permettre d'afficher la modal de confirmation pour annuler une demande d'ami en cours et transmettre les informations de l'utilisateur dont nous souhaitons annuler la demande d'ami
function cancelModal(user: any) {
    modalRequest.value = true
    invitToBeCanceled.value = user;
}

// Cette fonction va nous permettre d'afficher la modal de confirmation pour supprimer un ami et transmettre les informations de l'utilisateur que nous souhaitons supprimer de notre liste d'amis
function deleteModal(user: any) {
    open.value = true;
    userToBeDeleted.value = user;
}

// On place un watch sur la valeur permettant l'affichage de la modal permettant l'annulation d'une demande d'ami afin de bloquer le scroll de la page lorsque la modal est ouverte
watch(modalRequest, (value: boolean) => {
    if (value == true) {
        document.querySelector('body')!.style.overflowY = 'hidden';
    } else if (value == false) {
        document.querySelector('body')!.style.overflowY = 'scroll';
    }
})

// On place un watch sur la valeur permettant l'affichage de la modal permettant la suppression d'un ami afin de bloquer le scroll de la page lorsque la modal est ouverte
watch(open, (value: boolean) => {
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
                                                <button @click="cancelRequest(invitToBeCanceled)" type="button"
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
                                        <button @click="removeFriend(userToBeDeleted)" type="button"
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