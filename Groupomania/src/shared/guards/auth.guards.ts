import { useAuthStore } from '@/shared/stores/authStore';
export function isAuthenticatedGuard() {
    if (useAuthStore().$state.isConnected == false || useAuthStore().$state.isConnected == null) {
        return '/login';
    }
}

export function isNotAuthenticatedGuard() {
    if (useAuthStore().$state.isConnected) {
        return '/app/home';
    }
}