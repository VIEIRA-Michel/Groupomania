<script setup lang="ts">
const props = defineProps<{
    user: any
}>();
</script>
<template>
    <div class="container-right__profil">
        <div class="container-right__profil__details">
            <div class="container-right__profil__details__avatar">
                <img :src="props.user.picture" alt="avatar" />
            </div>
            <div class="container-right__profil__details__name">
                <span>{{ props.user.username }}</span>
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
</template>
<style scoped lang="scss">
.container-right {
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
</style>