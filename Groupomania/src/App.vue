<script setup lang="ts">
import FormLogin from '@/components/Form/FormLogin.vue';
import FormRegister from '@/components/Form/FormRegister.vue';
import NavigationBar from '@/components/Header/NavigationBar.vue';
import HomeView from '@/views/HomeView.vue';
// import ListPublicationsVue from './components/ListPublications.vue';
// import Publication from './components/Publication.vue';
// import RegisterView from './views/RegisterView.vue';
import { watch, defineProps } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
// console.log(route.params.userId);

// watch(() => route.params.userId, (newValue) => {
//     console.log(newValue);
// })
</script>

<template>
  <div class="App">
    <!-- <NavigationBar /> -->
    <router-view>
    </router-view>

  </div>

  <!-- <ListPublicationsVue /> -->
</template>

<style>
body {
  margin: auto;
  max-width: 1440px;
}
</style>