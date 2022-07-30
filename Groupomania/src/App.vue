<script setup lang="ts">
import NavigationBar from './components/NavigationBar.vue';
import HomeView from '@/views/HomeView.vue';

import { watch, defineProps } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
</script>

<template>
  <div class="App">
    <router-view>
    </router-view>

  </div>
</template>

<style>
body {
  margin: auto;
  max-width: 1440px;
}
</style>