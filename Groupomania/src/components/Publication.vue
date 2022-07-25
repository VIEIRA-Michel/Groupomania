<template>
    <div>
        <!-- <div class="createPost">
            <form @submit.prevent="createPublication(inputValue)" action="">
                <input type="text" v-model="inputValue">
                <input type="file">
            </form>
        </div> -->
        <div v-if="arrayPublications">
            <div v-for="({ id }, publication) of arrayPublications" :key="id">
                <div class="post">
                    <div class="post__top">
                        <div class="post__top__avatar">
                            <img src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200"
                                alt="avatar" />
                        </div>
                        <div class="post__top__info">
                            <div class="post__top__info__name">
                                <span>{{ publication.lastname + publication.firstname }}</span>
                            </div>
                            <div class="post__top__info__date">
                                <span>{{ publication.createdAt }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="post__content">
                        <p>{{ publication.content }}</p>
                        <img :src="publication.picture" alt="">
                    </div>
                    <div class="post__interaction">
                        <div class="post__interaction__like">
                            <span>{{ publication.likes }}</span>
                            <!-- <button @click="like" type="button">J'aime</button> -->
                        </div>
                        <div class="post__interaction__comment">
                            <span>{{ publication.comments.length }}</span>
                            <!-- <button @click="comment" type="button">Commenter</button> -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePublicationsStore } from '../shared/stores/publicationsStore';
let arrayPublications = ref([]);
let inputValue = ref('');

const publicationsStore = usePublicationsStore();

function createPublication(inputValue: string, picture?: string) {
    let result = publicationsStore.createPublication(inputValue, picture);
    return result;
}


function getAllPublications() {
    arrayPublications.value = publicationsStore.publications;
    console.log(arrayPublications.value)
}
getAllPublications();
</script>

<style>
</style>