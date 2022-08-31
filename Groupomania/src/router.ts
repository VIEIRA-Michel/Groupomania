import { useAuthStore } from './shared/stores/authStore';
import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticatedGuard, isNotAuthenticatedGuard } from './shared/guards';
export const router = createRouter({
    history: createWebHistory(),
    routes: [
{
    path: "/",
    component: () => import('@/views/HomeView.vue'),
},
{
    path: "/login",
    beforeEnter: [isNotAuthenticatedGuard],
    component: () => import('@/views/AuthView.vue'),
},
{
    path: "/friends",
    beforeEnter: [isAuthenticatedGuard],
    component: () => import('@/views/FriendsView.vue'),
},
{
    path: "/chat",
    beforeEnter: [isAuthenticatedGuard],
    component: () => import('@/views/ChatView.vue'),
},
{
    path: "/profil",
    beforeEnter: [isAuthenticatedGuard],
    component: () => import('@/views/ProfileView.vue'),
}
],
});

router.beforeEach(async () => {
  if (!useAuthStore().$state.isConnected) {
    await useAuthStore().getMyInformations();
  }
});
