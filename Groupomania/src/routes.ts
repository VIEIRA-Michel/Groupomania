import type { RouteRecordRaw } from "vue-router";
import HomeView from "./views/HomeView.vue"
import FriendsView from "./views/FriendsView.vue"
export const routes: RouteRecordRaw[] = [
{
    path: "/",
    component: HomeView,
}, 
{
    path: "/friends",
    component: FriendsView,
}
]