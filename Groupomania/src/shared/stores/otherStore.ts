import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';

export interface otherStore {
    burgerMenu: boolean | null;
    information: boolean;
    loading: boolean;
    notifications: []
}

export const useOtherStore = defineStore({
    id: "otherStore",
    state: (): otherStore => ({
        burgerMenu: null,
        information: false,
        loading: true,
        notifications: []
    }),
    getters: {},
    actions: {
        toggleBurgerMenu: (): void => {
            if (useOtherStore().$state.burgerMenu == null) {
                useOtherStore().$patch({
                    burgerMenu: true,
                })
            } else {
                useOtherStore().$patch({
                    burgerMenu: !useOtherStore().$state.burgerMenu
                })
            }
        },
        loadedResources: (): void => {
            useOtherStore().$patch({
                loading: false
            })
        },
        notificationPush: (type: string, content: any): void => {
            console.log(type);
            console.log(content);
            useOtherStore().$patch((state: any) => {
                if (type == "like" && content[0].publication.user_id == useAuthStore().$state.user.user_id) {
                    type = "a aimé votre publication"
                } else if (type == "has commented") {
                    type = "a commenté votre publication"
                } else if (type == "friendRequest sended") {
                    type = "a envoyé une demande d'ami"
                } else if (type == "friendRequest accepted") {
                    type = "a accepté votre demande d'ami"
                } else if (type == "new publication") {
                    type = "a poster une nouvelle publication"
                } else if (type == "private message") {
                    type = "a envoyé un message"
                }
                if (content[0].user) {
                    state.notifications.push({
                        type: type,
                        firstname: content[0].user.firstname,
                        lastname: content[0].user.lastname,
                        picture_url: content[0].user.picture_url,
                        // content: content
                    })
                }
            })
        }
    }
});