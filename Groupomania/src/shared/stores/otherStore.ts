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
        // Cette fonction va nous permettre de mettre fin au chargement
        loadedResources: (): void => {
            // Si les données ont fini d'être chargée on passe la valeur à false afin que le chargement se termine
            useOtherStore().$patch({
                loading: false
            })
        },
        // Cette fonction va nous permettre de soumettre une notification dans la liste des notifications
        notificationPush: (type: string, content: any): void => {
            // On crée une variable avec la date et l'heure du jour
            let date = new Date();
            // Et on change son format pour un format plus conventionnelle
            let newDate = moment(date).format('DD/MM/YYYY HH:mm');
            let newDateSplit = newDate.split(" ");
            newDateSplit[0] = "Aujourd'hui à ";
            let today = newDateSplit.join(" ");
            useOtherStore().$patch((state: any) => {
                // Si la notification concerne un évènement en particulier on ajoutera les informations nécessaires au bon affichage de la notification
                if (content.user && type == "friendRequest sended") {
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
                        ...content.user,
                        type: "friends",
                        idRequest: content.target.idRequest,
                        message: "a accepté votre demande d'ami",
                        date: today,
                        read: false
                    })
                } else if (content.user && type == "like") {
                    state.notifications.unshift({
                        type: "like",
                        user_id: content.user.user_id,
                        firstname: content.user.firstname,
                        lastname: content.user.lastname,
                        picture_url: content.user.picture_url,
                        message: "a aimé votre publication",
                        date: today,
                        like_id: content.publication.like_id,
                        publication_id: content.publication.publication_id,
                        publication_content: content.publication.content,
                        publication_picture: content.publication.picture,
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
        // Cette fonction va nous permettre de supprimer une notification 
        notificationRemove: (type: string, content: any): void => {
            // Et en fonction de l'évènement socket reçu nous allons procéder au retrait de la notification en comparant avec les données reçues
            if (type == "remove like") {
                useOtherStore().$patch((state: any) => {
                    for (let i = 0; i < state.notifications.length; i++) {
                        if (state.notifications[i].publication_id == content.publication.publication_id && state.notifications[i].type == "like") {
                            state.notifications.splice(i, 1);
                        }
                    }
                })
            } else if (type == "delete comment") {
                useOtherStore().$patch((state: any) => {
                    for (let i = 0; i < state.notifications.length; i++) {
                        if (state.notifications[i].comment_id == content.comment.comment_id && state.notifications[i].type == "comment") {
                            state.notifications.splice(i, 1);
                            i = -1;
                        }
                    }
                })
            } else if (type == "friendRequest canceled") {
                useOtherStore().$patch((state: any) => {
                    for (let i = 0; i < state.notifications.length; i++) {
                        if (state.notifications[i].idRequest == content.target.idRequest && state.notifications[i].type == "friendship invitation") {
                            state.notifications.splice(i, 1);
                            i = -1;
                        }
                    }
                })
            } else if (type == "friend removed") {
                useOtherStore().$patch((state: any) => {
                    for (let i = 0; i < state.notifications.length; i++) {
                        if (state.notifications[i].user_id == content.user.user_id && state.notifications[i].type == "friends" || state.notifications[i].user_id == content.user.user_id && state.notifications[i].type == "friendship invitation") {
                            state.notifications.splice(i, 1);
                            i = -1;
                        }
                    }
                })
            }
        },
        // Cette fonction a pour but de supprimer les notifications en lien avec l'argument passé en paramètre
        // Dans le cas où l'on supprime une publication, on supprime les notifications en lien avec cette publication
        // Dans le cas où l'on supprime un ami, on supprime les notifications en lien avec cet ami
        deleteRelatedNotifications: (id: number, operation: string) => {
            useOtherStore().$patch((state: any) => {
                for (let i = state.notifications.length; i >= 0; i--) {
                    if (state.notifications[i] && operation == "publication" && state.notifications[i].publication_id == id
                        || state.notifications[i] && operation == "friend" && state.notifications[i].user_id == id) {
                        state.notifications.splice(i, 1);
                    }
                }
            })
        },
        // Cette fonction a pour but de faire disparaître la petite pastille indiquant que des nouvelles notifications non-lus sont présentes
        notificationRead: () => {
            useOtherStore().$patch((state: any) => {
                state.notifications.map((item: any) => {
                    item.read = true
                })
            })
        }
    }
});