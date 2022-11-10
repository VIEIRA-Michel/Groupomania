<script setup lang="ts">
import { computed, ref, onBeforeMount, onUnmounted, watch } from 'vue';
import { useAuthStore } from '@/shared/stores/authStore';
import { usePublicationsStore } from '@/shared/stores/publicationsStore';
import { useChatStore } from '@/shared/stores/chatStore';
import { useFriendshipStore } from '@/shared/stores/friendsStore';
import Loading from '@/components/Loading.vue';
import socket from '@/socket';
import { useOtherStore } from '@/shared/stores/otherStore';
import { useCommentsStore } from '@/shared/stores/commentsStore';
import { router } from '@/router';

// user va nous permettre de récupérer nos informations en tant qu'utilisateur
const user = computed(() => useAuthStore().$state.user);

// isConnected va nous permettre de savoir si nous sommes connectés ou non
const isConnected = computed(() => useAuthStore().isConnected);

// loading va nous permettre de savoir si nous sommes en train de charger les publications ou non
const loading = computed(() => useOtherStore().$state.loading);

// messages va nous permettre d'afficher les messages reçus sous forme de pop-up dans le cas où nous ne serions pas dans la discussion où nous avons reçu un message
const messages = computed(() => useChatStore().$state.messagesToDisplay);

// warningMessage va nous permettre d'afficher le message d'avertissement reçu lors d'un trop grand nombre de requête émise
const warningMessage = computed(() => useAuthStore().$state.warningLimiter);

// modalAlert va nous permettre de faire apparaitre la modal d'alerte dans le cas où un trop grand nombre de requête seraient émises
const modalAlert = computed(() => useAuthStore().$state.modalAlert);

// Cette fonction va nous permettre de nous rediriger directement vers la discussion lors du clic sur un message sous forme de pop-up
function redirect(user_id: number) {
    router.push({ name: 'chat' });
    // On passe les informations de l'utilisateur qui nous a envoyé le message
    useChatStore().selectedUser(user_id);
}

onBeforeMount(() => {
    // Si nous sommes connectés
    if (isConnected.value) {
        // On récupères les demandes d'amis que nous avons émise et si tout se déroule correctement
        useFriendshipStore().checkRequestsSended().then((response: any) => {
            // On récupères les demandes d'amis que nous avons reçue et si tout se déroule correctement
            useFriendshipStore().getRequests().then((response: any) => {
                // On récupères les utilisateurs avec qui nous sommes amis et si tout se déroule correctement
                useFriendshipStore().getAllFriends().then((response) => {
                    // on récupère nos informations utilisateur stocké dans le localStorage
                    const session = JSON.parse(localStorage.getItem("user"));
                    // Si nos informations utilisateur sont bien présentes dans le localStorage
                    if (session) {
                        // On se connecte au serveur socket
                        socket.auth = { username: session.firstname + ' ' + session.lastname, picture: session.picture_url, user: session.user_id, sessionID: session.session_id };
                        socket.connect();
                    }
                    socket.on("session", ({ sessionID, userID }) => {
                        socket.auth = { sessionID };
                        socket.userID = userID;
                    });
                    // Cette fonction va nous permettre de récupérer à présent l'intégralité des utilisateurs et filtrer la liste pour ne garder que les amis
                    useChatStore().getUsersConnected().then((response2: any) => {

                        // Cette fonction nous permet d'indiquer que les informations ont finis d'être chargé et d'arrêter l'écran de chargement
                        useOtherStore().loadedResources();

                        // Ceci va nous permettre de récupérer chacun des évènements émis par le serveur socket et pour chaque évènement exécuter une fonction différente qui va interagir avec notre store
                        socket.onAny((event: string, ...args: any) => {
                            switch (event) {
                                case 'typing':
                                    useChatStore().onTyping(true, args[0]);
                                    break;
                                case 'stoptyping':
                                    useChatStore().onTyping(false);
                                    break;
                                case 'user connected':
                                    useChatStore().onUserConnnected(args[0]);
                                    break;
                                case 'user disconnected':
                                    useChatStore().onUserDisconnected(args[0]);
                                    break;
                                case 'private message':
                                    if (messages.value.length !== 0) {
                                        useChatStore().removeMessageAtDisplay().then(() => {
                                            useChatStore().onPrivateMessage(args[0])
                                        });
                                    } else {
                                        useChatStore().onPrivateMessage(args[0])
                                    }
                                    break;
                                case 'like':
                                    usePublicationsStore().onLike(args[0]);
                                    break;
                                case 'remove like':
                                    usePublicationsStore().onRemoveLike(args[0]);
                                    break;
                                case 'new publication':
                                    usePublicationsStore().onNewPublication(args[0]);
                                    break;
                                case 'edit publication':
                                    usePublicationsStore().onEditPublication(args[0]);
                                    break;
                                case 'delete publication':
                                    usePublicationsStore().onDeletePublication(args[0]);
                                    break;
                                case 'has commented':
                                    useCommentsStore().onComment(args[0]);
                                    break;
                                case 'delete comment':
                                    useCommentsStore().onDeleteComment(args[0]);
                                    break;
                                case 'friendRequest sended':
                                    useFriendshipStore().onFriendRequestSended(args[0]);
                                    break;
                                case 'friendRequest refused':
                                    useFriendshipStore().onFriendRequestRefused(args[0]);
                                    break;
                                case 'friendRequest accepted':
                                    useFriendshipStore().onFriendRequestAccepted(args[0]);
                                    break;
                                case 'friend removed':
                                    useFriendshipStore().onFriendRemoved(args[0]);
                                    break;
                                case 'friendRequest canceled':
                                    useFriendshipStore().onFriendRequestCanceled(args[0]);
                                    break;
                                case 'update profil':
                                    useAuthStore().onUpdateProfile(args[0]);
                                    break;
                                default:
                                    console.log(`Sorry, we are out of ${event}.`);
                            }
                            if (event == 'like' && args[0].publication.user_id == user.value.user_id
                                || event == 'has commented' && args[0].comment.user_id == user.value.user_id
                                || event == 'friendRequest sended' && args[0].request.recipient == user.value.user_id
                                || event == 'friendRequest accepted' && args[0].target.sender == user.value.user_id) {
                                // Ceci va nous permettre de récupérer certains évènements émis par le serveur socket et pour chaque évènement cité dans les conditions, déclencher la fonction qui va nous permettre d'ajouter les informations dans nos notifications
                                useOtherStore().notificationPush(event, args[0])
                            } else if (event == 'remove like' && args[0].publication.user_id == user.value.user_id
                                || event == 'delete comment' && args[0].comment.user_id == user.value.user_id
                                || event == 'friendRequest canceled' && args[0].request.user_id == user.value.user_id
                                || event == 'friend removed' && args[0].target.user_id == user.value.user_id) {
                                // Ceci va nous permettre de récupérer certains évènements émis par le serveur socket et pour chaque évènement cité dans les conditions, déclencher la fonction qui va nous permettre de supprimer les informations dans nos notifications
                                useOtherStore().notificationRemove(event, args[0])
                            }
                        })
                    })
                })
            })
        })
    }
});

onUnmounted(() => {
    useAuthStore().logout()
    socket.off("connect");
    socket.off("disconnect");
    socket.off("users");
    socket.off("user connected");
    socket.off("user disconnected");
    socket.off("private message");
    socket.off("friendRequest sended");
    socket.off("friendRequest refused");
    socket.off("friendRequest accepted");
    socket.off("friend removed");
    socket.off("friendRequest canceled");
    socket.disconnect();
});
</script>

<template>
    <Loading v-if="loading" />
    <router-view v-else>
    </router-view>
    <div class="notification-container">
        <div class="notification-container__list">
            <div v-for="message in messages" @click="redirect(message.user_id)"
                :class="[message.disapear ? 'notification-container__list__item hidden' : 'notification-container__list__item']">
                <div class="notification-container__list__item__content">
                    <div class="notification-container__list__item__content__avatar">
                        <img :src="message.picture" alt="">
                    </div>
                    <div class="notification-container__list__item__content__body">
                        <div class="notification-container__list__item__content__body__top">
                            <div class="notification-container__list__item__content__body__top__username">
                                {{ message.username}}
                            </div>
                            <div class="notification-container__list__item__content__body__top__date">{{ message.at }}
                            </div>
                        </div>
                        <div class="notification-container__list__item__content__body__bottom">
                            <div class="notification-container__list__item__content__body__bottom__text">
                                <p>{{ message.message }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Teleport to="body">
        <div v-if="modalAlert" @click="useAuthStore().resetWarning" class="calc">
            <div @click.stop class="modal-container">
                <div class="modal-container__content">
                    <div class="modal-container__content__header">
                        <div class="modal-container__content__header__title">
                            {{ warningMessage }}
                        </div>
                    </div>
                    <div class="modal-container__content__footer">
                        <button @click="useAuthStore().resetWarning" type="button"
                            class="btn btn-primary">Fermer</button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped lang="scss">
@import '../styles/Utils/keyframes';
@import '../styles/Components/buttons';
@import '../styles/Utils/keyframes';

* {
    font-family: 'Lato', sans-serif;
}

.notification-container {
    position: absolute;
    top: 60px;
    right: 10px;
    width: 250px;
    z-index: 10;

    &__list {
        &__item {
            background: floralwhite;
            margin-bottom: 10px;
            border-radius: 5px;
            border: 1px solid #FD2D01;
            -webkit-animation: text-focus-in 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) 0.3s both;
            animation: text-focus-in 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) 0.3s both;
            cursor: pointer;

            &.hidden {
                -webkit-animation: text-blur-out 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
                animation: text-blur-out 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
            }

            &__content {
                display: flex;
                flex-direction: row;

                &__avatar {
                    margin: 5px;
                    display: flex;
                    align-items: center;

                    img {
                        width: 45px;
                        height: 45px;
                        border-radius: 5px;
                        object-fit: cover;
                    }
                }

                &__body {
                    width: 100%;
                    padding: 5px;

                    &__top {
                        display: flex;
                        justify-content: space-between;

                        &__username {
                            font-weight: bold;
                            font-size: 12px;
                        }

                        &__date {
                            color: #FD2D01;
                            font-size: 12px;
                        }
                    }

                    &__bottom {
                        &__text {
                            margin: 5px 0;
                            padding: 5px;
                            background-color: #FFFFFF;
                            border-radius: 5px;
                            font-size: 12px;
                            width: 170px;
                            border: 1px solid #dbdbdb;

                            p {
                                white-space: nowrap;
                                text-overflow: ellipsis;
                                width: 100%;
                                display: block;
                                overflow: hidden;
                            }
                        }
                    }
                }
            }

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
    z-index: 99;
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