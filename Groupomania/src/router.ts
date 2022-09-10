import { useAuthStore } from './shared/stores/authStore';
import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticatedGuard, isNotAuthenticatedGuard } from './shared/guards';
export const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/app',
            component: () => import('@/views/ContainerSocket.vue'),
            children: [
                {
                    path: "home",
                    beforeEnter: [isAuthenticatedGuard],
                    component: () => import('@/views/HomeView.vue'),
                },
                {
                    path: "friends",
                    beforeEnter: [isAuthenticatedGuard],
                    component: () => import('@/views/FriendsView.vue'),
                },
                {
                    path: "chat",
                    beforeEnter: [isAuthenticatedGuard],
                    component: () => import('@/views/ChatView.vue'),
                },
                {
                    path: "profil",
                    beforeEnter: [isAuthenticatedGuard],
                    component: () => import('@/views/ProfileView.vue'),
                }
            ]
        },
        {
            path: "/login",
            beforeEnter: [isNotAuthenticatedGuard],
            component: () => import('@/views/AuthView.vue'),
        },
        {
            path: "/",
            redirect: "/login",
        },
        {
            path: "/:pathMatch(.*)*",
            component: () => import('@/views/NotFoundView.vue'),
        }
    ],
});

router.beforeEach(async () => {
    if (!useAuthStore().$state.isConnected) {
        useAuthStore().getMyInformations().then((response: any) => {
            if (response.status == 403) {
                router.push('/login');
            }
        });
    }
});
