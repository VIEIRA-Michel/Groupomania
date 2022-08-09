<script setup lang="ts">
import NavigationBar from './components/NavigationBar.vue';
import HomeView from '@/views/HomeView.vue';

import { watch, defineProps } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
</script>

<template>
    <router-view>
    </router-view>
</template>

<style>
body {
  margin: auto;
  background-color: #FAFAFA;
}
</style>