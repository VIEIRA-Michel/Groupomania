<template>
    <div>
        <NavigationBar :user="user" :isConnected="isConnected" @logout="logout()" />
    </div>
    <div class="container">
        <div class="container-left">
            <div class="container-left__settings"></div>
            <div class="container-left__list">
                <div v-for="friend in friends" class="container-left__list__item">
                    <div class="container-left__list__item__left">
                        <img :src="friend.picture_url" alt="avatar" />
                    </div>
                    <div class="container-left__list__item__right">
                        <div class="container-left__list__item__right__name">
                            {{ friend.firstname }} {{ friend.lastname }}
                        </div>
                        <div class="container-left__list__item__right__status">
                            <div class="container-left__list__item__right__status__online">
                                <div v-if="isOnline" class="online"></div>
                                <div v-else class="offline"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="container-center">
            <div class="container-center__top">
                <div class="container-center__top__details">
                    <div class="container-center__top__details__left">
                        <img src="https://media.lesechos.com/api/v1/images/view/5f3f5be68fe56f0be8160fab/1280x720/0603734518167-web-tete.jpg" alt="avatar" />
                    </div>
                    <div class="container-center__top__details__right">
                        <div class="container-center__top__details__right__name">
                            <!-- {{ friend.firstname }} {{ user.lastname }} -->
                            Elon Musk
                        </div>
                        <div class="container-center__top__details__right__status">
                            <div class="container-center__top__details__right__status__online">
                                <div v-if="isOnline" class="status-online">
                                    <div class="online"></div>
                                    <span class="online-message">En Ligne</span>
                                </div>
                                <div v-else class="status-offline">
                                    <div class="offline"></div>
                                    <span class="offline-message">Hors Ligne</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container-center__body">
                <div class="container-center__body__chat">
                    <!-- <div v-for="message in messages" class="container-center__body__chat__item">
                        <div class="container-center__body__chat__item__left">
                            <img :src="message.picture_url" alt="avatar" />
                        </div>
                        <div class="container-center__body__chat__item__right">
                            <div class="container-center__body__chat__item__right__name">
                                {{ message.firstname }} {{ message.lastname }}
                            </div>
                            <div class="container-center__body__chat__item__right__message">
                                {{ message.message }}
                            </div>
                        </div>
                    </div> -->
                </div>
            </div>
            <div class="container-center__bottom">
                <div class="container-center__bottom__input">
                    <input type="text" v-model="message" @keyup.enter="sendMessage()"
                        placeholder="Ecrivez votre message..." />
                    <button>
                        <fa icon="fa-solid fa-paper-plane" />
                    </button>
                </div>
            </div>
        </div>
        <div class="container-right">
            <div class="container-right__profil">
                <div class="container-right__profil__details">
                    <div class="container-right__profil__details__avatar">
                        <img src="https://media.lesechos.com/api/v1/images/view/5f3f5be68fe56f0be8160fab/1280x720/0603734518167-web-tete.jpg" alt="avatar" />
                    </div>
                    <div class="container-right__profil__details__name">
                        <!-- <span>{{ user.firstname + ' ' + user.lastname }}</span> -->
                        <span>Elon Musk</span>
                    </div>
                    <div class="container-right__profil__details__status">
                        <div class="container-right__profil__details__status__text">
                            <p>" Je pense que les gens ordinaires peuvent choisir d’être extraordinaires. "</p>
                        </div>
                    </div>
                    <div class="container-right__profil__details__informations">
                        <div class="container-right__profil__details__informations__birthday">
                            <div class="container-right__profil__details__informations__birthday__icon">
                                <fa icon="fa-solid fa-birthday-cake" />
                            </div>
                            <div class="container-right__profil__details__informations__birthday__text">
                                <span> 28 Juin</span>
                            </div>
                        </div>
                        <div class="container-right__profil__details__informations__registered-since">
                            <div class="container-right__profil__details__informations__registered-since__icon">
                                <fa icon="fa-solid fa-pencil" />
                            </div>
                            <div class="container-right__profil__details__informations__registered-since__text">
                                <span> Inscrit depuis le 10 août 2022 </span>
                            </div>
                        </div>
                        <div class="container-right__profil__details__informations__email">
                            <div class="container-right__profil__details__informations__email__icon">
                                <fa icon="fa-solid fa-envelope" />
                            </div>
                            <div class="container-right__profil__details__informations__email__text">
                                <span> elonmusk@spacex.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import NavigationBar from '../components/NavigationBar.vue';
import { useAuthStore } from '../shared/stores/authStore';
import { useFriendshipStore } from '../shared/stores/friendsStore';
const authStore = useAuthStore();
const friendshipStore = useFriendshipStore();
checkIsConnected();
getAllFriends();

const isConnected = computed(() => authStore.$state.isConnected);
const user = computed(() => authStore.$state.user);
const friends = computed(() => friendshipStore.$state.friends);

console.log(friends);

function checkIsConnected() {
    authStore.getMyInformations();
    if (authStore.$state.isConnected == false) {
        window.location.href = '/';
    }
}

function getAllFriends() {
    friendshipStore.getAllFriends();
}
</script>

<style scoped lang="scss">
.container {
    width: 100%;
    background: #FFFFFF;
    display: flex;
    flex-direction: row;

    .container-left {
        width: 30%;
        // background: blue;
        border-right: 1px solid #DBDBDB;

        &__settings {}

        &__list {
            &__item {
                display: flex;
                margin: 5px;
                flex-direction: row;
                align-items: center;
                justify-content: start;
                border-bottom: 1px solid #DBDBDB;
                background-color: #FFFFFF;
                transition: all 0.4s;

                &:hover {
                    background-color: #DBDBDB;
                }

                &__left {
                    img {
                        width: 45px;
                        height: 45px;
                        border-radius: 50px;
                        object-fit: cover;
                        background-color: black;
                    }

                    margin-right: 10px;
                }

                &__right {
                    &__name {
                        font-weight: bold;
                    }

                    &__status {
                        &__online {
                            .offline {
                                border: 1px solid #DBDBDB;
                                position: absolute;
                                left: 30px;
                                width: 10px;
                                height: 10px;
                                border-radius: 50px;
                                background-color: #FD2D01;
                            }

                            .online {
                                width: 10px;
                                height: 10px;
                                border-radius: 50px;
                                background-color: #00FF00;
                            }
                        }
                    }
                }
            }
        }
    }

    .container-center {
        width: 50%;
        background: #FFFFFF;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        &__top {
            &__details {
                display: flex;
                flex-direction: row;
                width: 100%;
                margin: auto;
                padding: 5px;

                &__left {
                    img {
                        width: 45px;
                        height: 45px;
                        border-radius: 50px;
                        object-fit: cover;
                        background-color: black;
                    }
                }

                &__right {
                    &__name {
                        font-weight: bold;
                    }

                    &__status {
                        &__online {
                            .status-online {
                                .online {
                                    border: 1px solid #DBDBDB;
                                    width: 10px;
                                    height: 10px;
                                    border-radius: 50px;
                                    background-color: #00FF00;

                                    &-message {
                                        margin-left: 5px;
                                    }
                                }

                            }

                            .status-offline {
                                display: flex;
                                flex-direction: row;
                                align-items: center;

                                .offline {
                                    border: 1px solid #DBDBDB;
                                    width: 10px;
                                    height: 10px;
                                    border-radius: 50px;
                                    background-color: #FD2D01;

                                    &-message {
                                        margin-left: 5px;
                                    }
                                }

                            }


                        }
                    }
                }
            }
        }

        &__body {}

        &__bottom {
            &__input {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                padding: 5px;
                border-top: 1px solid #DBDBDB;
                background-color: #FFFFFF;

                input {
                    width: 90%;
                    border: none;
                    padding: 5px;
                    border-radius: 5px;
                    background-color: #FFFFFF;

                    &::placeholder {
                        color: #DBDBDB;
                    }
                }

                button {
                    border: none;
                    background-color: #FFFFFF;
                    cursor: pointer;
                    transition: all 0.4s;

                    &:hover {
                        color: #FD2D01;
                    }
                }
            }
        }
    }

    .container-right {
        display: flex;
        flex-direction: column;
        width: 20%;
        border-left: 1px solid #DBDBDB;

        &__profil {
            display: flex;
            flex-direction: column;

            &__details {
                width: 100%;
                display: flex;
                flex-direction: column;

                &__avatar {
                    display: flex;
                    justify-content: center;
                    margin-top: 10px;

                    img {
                        width: 45px;
                        height: 45px;
                        object-fit: cover;
                        background-color: black;
                        border-radius: 50px;
                    }
                }

                &__name {
                    font-weight: bold;
                    display: flex;
                    justify-content: center;
                    font-size: 1.4em;
                    margin-bottom: 10px;
                }

                &__status {
                    &__text {
                        p {
                            text-align: center;
                            font-size: 1em;
                            font-style: italic;
                            margin-bottom: 15px;
                        }
                    }
                }

                &__informations {
                    &__birthday {
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        margin-bottom: 15px;

                        &__icon {}

                        &__text {}
                    }

                    &__registered-since {
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        margin-bottom: 15px;

                        &__icon {}

                        &__text {}
                    }

                    &__email {
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        margin-bottom: 15px;

                        &__icon {}

                        &__text {}
                    }
                }
            }
        }
    }
}
</style>