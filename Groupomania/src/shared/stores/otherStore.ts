import { defineStore } from 'pinia';
import moment from 'moment';
import { useAuthStore } from './authStore';

export interface otherStore {
    information: boolean;
    loading: boolean;
    notifications: [];
}

export const useOtherStore = defineStore({
    id: "otherStore",
    state: (): otherStore => ({
        information: false,
        loading: true,
        notifications: [],
    }),
    getters: {
        getCountOfNotificationNotRead: () => {
            let count = 0;
            useOtherStore().$state.notifications.forEach((notification: any) => {
                if (notification.read == false) {
                    count++
                }
            })
            return count;
        }
    },
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
                if (content.user && type == "friendRequest sended") {
                    console.log(content);
                    state.notifications.unshift({
                        type: "friendship invitation",
                        user_id: content.request.sender,
                        idRequest: content.request.idRequest,
                        firstname: content.user.firstname,
                        lastname: content.user.lastname,
                        picture_url: content.user.picture_url,
                        message: "vous a envoyé une demande d'ami",
                        date: today,
                        read: false
                    })
                } else if (content.user && type == "friendRequest accepted") {
                    state.notifications.unshift({
                        type: "friends",
                        user_id: content.response.data.results[0].user_id_recipient,
                        idRequest: content.response.data.results[0].requestId,
                        firstname: content.response.data.results[0].firstname,
                        lastname: content.response.data.results[0].lastname,
                        picture_url: content.response.data.results[0].picture_url,
                        message: "a accepté votre demande d'ami",
                        date: today,
                        read: false
                    })
                } else if (content.user && type == "like") {
                    console.log(content);
                    state.notifications.unshift({
                        type: "like",
                        user_id: content.user.user_id,
                        firstname: content.user.firstname,
                        lastname: content.user.lastname,
                        picture_url: content.user.picture_url,
                        message: "a aimé votre publication",
                        date: today,
                        like_id: content.publication.like_id,
                        publication_id: content.publication.publication_id ? content.publication.publication_id : null,
                        publication_content: content.publication.content ? content.publication.content : null,
                        publication_picture: content.publication.picture ? content.publication.picture : null,
                        read: false
                    })
                } else if (content.user && type == "has commented") {
                    state.notifications.unshift({
                        type: "comment",
                        user_id: content.user.user_id,
                        firstname: content.user.firstname,
                        lastname: content.user.lastname,
                        picture_url: content.user.picture_url,
                        message: "a commenté votre publication",
                        date: today,
                        comment_id: content.comment.comment_id,
                        publication_id: content.comment.publication_id,
                        publication_content: content.comment.publication_content,
                        publication_picture: content.comment.picture,
                        read: false
                    })
                }
            })
        },
        notificationRemove: (type: string, content: any): void => {
            console.log('notification remove');
            if (type == "remove like") {
                useOtherStore().$patch((state: any) => {
                    state.notifications.map((item: any) => {
                        if (item.publication_id == content.publication.publication_id && item.type == "like") {
                            state.notifications.splice(state.notifications.indexOf(item), 1);
                        }
                    })
                })
            } else if (type == "delete comment") {
                useOtherStore().$patch((state: any) => {
                    state.notifications.map((item: any) => {
                        if (item.comment_id == content.comment.comment_id && item.type == "comment") {
                            state.notifications.splice(state.notifications.indexOf(item), 1);
                        }
                    })
                })
            } else if (type == "friendRequest canceled") {
                useOtherStore().$patch((state: any) => {
                    state.notifications.map((item: any) => {
                        if (item.idRequest == content.target.idRequest && item.type == "friendship invitation") {
                            state.notifications.splice(state.notifications.indexOf(item), 1);
                        }
                    })
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
                })
            }
        },
        deleteRelatedNotifications: (publication_id: number) => {
            console.log(useOtherStore().$state.notifications);
            useOtherStore().$patch((state: any) => {
                state.notifications.map((item: any) => {
                    if (item.publication_id == publication_id) {
                        console.log('notification avec le publication_id correspondant', item);
                        state.notifications.splice(state.notifications.indexOf(item), 1);
                    }
                })
            })
            // let indexToRemove: any = []
            // useOtherStore().$patch((state: any) => {
            //     state.notifications.map((item: any) => {
            //         if (item.publication_id == publication_id) {
            //             // console.log(state.notifications.indexOf(item));
            //             indexToRemove.push(state.notifications.indexOf(item))
            //             //     state.notifications.splice(state.notifications.indexOf(item), 1);
            //         }
            //     })
            //     for (let i = 0; i < indexToRemove.length; i++) {
            //         state.notifications.splice(indexToRemove[i], 1);
            //     }
            // })
        },
        notificationRead: () => {
            useOtherStore().$patch((state: any) => {
                state.notifications.map((item: any) => {
                    item.read = true
                })
            })
        }
    }
});