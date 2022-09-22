import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';

export interface otherStore {
    information: boolean;
    loading: boolean;
    notifications: []
}

export const useOtherStore = defineStore({
    id: "otherStore",
    state: (): otherStore => ({
        information: false,
        loading: true,  
        notifications: []
    }),
    getters: {},
    actions: {
        loadedResources: (): void => {
            useOtherStore().$patch({
                loading: false
            })
        },
        notificationPush: (type: string, content: any): void => {
            console.log(type);
            console.log(content);
            useOtherStore().$patch((state: any) => {
                if (type == "like") {
                    type = "a aimé votre publication"
                } else if (type == "has commented") {
                    type = "a commenté votre publication"
                } else if (type == "friendRequest sended") {
                    type = "a envoyé une demande d'ami"
                } else if (type == "friendRequest accepted") {
                    type = "a accepté votre demande d'ami"
                } else if (type == "private message") {
                    type = "a envoyé un message"
                }
                if (content.user) {
                    state.notifications.push({
                        type: type,
                        firstname: content.user.firstname,
                        lastname: content.user.lastname,
                        picture_url: content.user.picture_url,
                        // content: content
                    })
                }
            })
        }
    }
});