import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';
import moment from 'moment';

export interface otherStore {
    information: boolean;
    loading: boolean;
    notifications: [];
    notificationsCount: number;
}

export const useOtherStore = defineStore({
    id: "otherStore",
    state: (): otherStore => ({
        information: false,
        loading: true,
        notifications: [],
        notificationsCount: 0,
    }),
    getters: {},
    actions: {
        loadedResources: (): void => {
            useOtherStore().$patch({
                loading: false
            })
        },
        notificationPush: (type: string, content: any): void => {
            let date = new Date();
            let newDate = moment(date).format('DD/MM/YYYY HH:mm');
            let newDateSplit = newDate.split(" ");
            newDateSplit[0] = "Aujourd'hui à ";
            let today = newDateSplit.join(" ");
            useOtherStore().$patch((state: any) => {
                if (type == "like") {
                    type = "like";
                    content.message = "a aimé votre publication"
                } else if (type == "has commented") {
                    type = "comment";
                    content.message = "a commenté votre publication"
                } else if (type == "friendRequest sended") {
                    type = "friendship invitation";
                    content.message = "vous a envoyé une demande d'ami"
                } else if (type == "friendRequest accepted") {
                    type = "friends";
                    content.message = "a accepté votre demande d'ami"
                }
                if (content.user && type == "friendship invitation") {
                    console.log(content);
                    state.notifications.unshift({
                        type: type,
                        user_id: content.request.sender,
                        idRequest: content.request.idRequest,
                        firstname: content.user.firstname,
                        lastname: content.user.lastname,
                        picture_url: content.user.picture_url,
                        message: content.message,
                        date: today
                    })
                    state.notificationsCount += 1;
                } else if (content.user && type == "friends") {
                    state.notifications.unshift({
                        type: type,
                        user_id: content.response.data.results[0].user_id_recipient,
                        idRequest: content.response.data.results[0].requestId,
                        firstname: content.response.data.results[0].firstname,
                        lastname: content.response.data.results[0].lastname,
                        picture_url: content.response.data.results[0].picture_url,
                        message: content.message,
                        date: today
                    })
                } else if (content.user && type == "like") {
                    state.notifications.unshift({
                        type: type,
                        user_id: content.user.user_id,
                        firstname: content.user.firstname,
                        lastname: content.user.lastname,
                        picture_url: content.user.picture_url,
                        message: content.message,
                        date: today,
                        publication_id: content.publication.publication_id ? content.publication.publication_id : null,
                        publication_content: content.publication.content ? content.publication.content : null,
                        publication_picture: content.publication.picture ? content.publication.picture : null,
                    })
                    state.notificationsCount += 1;
                } else if (content.user && type == "comment") {
                    state.notifications.unshift({
                        type: type,
                        user_id: content.user.user_id,
                        firstname: content.user.firstname,
                        lastname: content.user.lastname,
                        picture_url: content.user.picture_url,
                        message: content.message,
                        date: today,
                        comment_id: content.comment.comment_id,
                        publication_id: content.comment.publication_id,
                        publication_content: content.comment.publication_content,
                        publication_picture: content.comment.picture,
                    })
                    state.notificationsCount += 1;
                }
            })
        },
        notificationRemove: (type: string, content: any): void => {
            console.log('type', type);
            console.log('content', content);
            if (type == "remove like") {
                useOtherStore().$patch((state: any) => {
                    state.notifications.map((item: any) => {
                        if (item.publication_id == content.publication.publication_id && item.type == "like") {
                            state.notifications.splice(state.notifications.indexOf(item), 1);
                        }
                    })
                    state.notificationsCount -= 1;
                })
            } else if (type == "delete comment") {
                useOtherStore().$patch((state: any) => {
                    state.notifications.map((item: any) => {
                        if (item.comment_id == content.comment_id && item.type == "comment") {
                            state.notifications.splice(state.notifications.indexOf(item), 1);
                        }
                    })
                    state.notificationsCount -= 1;
                })
            } else if (type == "friendRequest canceled") {
                useOtherStore().$patch((state: any) => {
                    state.notifications.map((item: any) => {
                        if (item.idRequest == content.target.idRequest && item.type == "friendship invitation") {
                            state.notifications.splice(state.notifications.indexOf(item), 1);
                        }
                    })
                    state.notificationsCount -= 1;
                })
            } else if (type == "friend removed") {
                useOtherStore().$patch((state: any) => {
                    state.notifications.map((item: any) => {
                        if (item.user_id == content.user.user_id && item.type == "friends") {
                            state.notifications.splice(state.notifications.indexOf(item), 1);
                        };
                        if (item.user_id == content.user.user_id && item.type == "friendship invitation") {
                            state.notifications.splice(state.notifications.indexOf(item), 1);
                        }
                    })
                    state.notificationsCount -= 1;
                })
            }
        },
        notificationRead: () => {
            useOtherStore().$patch((state: any) => {
                state.notificationsCount = 0;
            })
        }
    }
});