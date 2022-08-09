import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from 'pinia';
import App from "./App.vue";
import { routes } from "./routes";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

library.add(fas, fab);

const router = createRouter({
    history: createWebHistory(),
    routes
});

const pinia = createPinia();
const app = createApp(App).component('fa', FontAwesomeIcon);

app.use(router);
app.use(pinia);
app.mount("#app");
