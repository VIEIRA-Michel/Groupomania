import { defineStore, storeToRefs } from 'pinia';
import socket from "../../socket";
import { signUp, signIn, fetchInformation, editProfile, fetchNotifications } from "../services/auth.service";
import { useChatStore } from './chatStore';
import { useCommentsStore } from './commentsStore';
import { useFriendshipStore } from './friendsStore';
import { useOtherStore } from './otherStore';
import { usePublicationsStore } from './publicationsStore';
import moment from 'moment';

export interface IAuthStore {
    isConnected: boolean | null;
    user: any | null;
    invalidEmail: boolean;
    invalidPassword: boolean;
    errorMessage: string | null;
    warningLimiter: string | null;
}

export const useAuthStore = defineStore({
    id: "auth",
    state: (): IAuthStore => ({
        isConnected: false,
        user: {},
        invalidEmail: false,
        invalidPassword: false,
        errorMessage: null,
        warningLimiter: null,
    }),
    getters: {
        isAuthenticated(state): boolean | null {
            if (state.user) {
                return true;
            } else if (!state.user && state.isConnected) {
                return false;
            } else {
                return null;
            }
        }
    },
    actions: {
        register(lastname: string, firstname: string, email: string, password: string, confirmPassword: string) {
            return new Promise((resolve, reject) => {
                if (lastname && firstname && email && password && confirmPassword) {
                    if (password === confirmPassword) {
                        signUp(lastname, firstname, email, password).then((response: any) => {
                            useAuthStore().$patch((state: any) => {
                                state.errorMessage = null;
                            })
                            resolve(response);
                        }).catch(error => {
                            let text = ''
                            console.log(error.response.data);
                            if (error.response.data.length > 0) {
                                text = 'Le mot de passe doit comporter '
                                let arrError: any = [];
                                if (typeof (error.response.data) !== 'string') {
                                    error.response.data.forEach((element: any) => {
                                        if (element == 'uppercase') {
                                            arrError.push('1 majuscule');
                                        } else if (element == 'digits') {
                                            arrError.push('2 chiffres ');
                                        } else if (element == 'lowercase') {
                                            arrError.push('1 minuscule ');
                                        }
                                    });
                                    text = text + arrError.join(' et ');
                                    useAuthStore().displayErrorMessage(text);
                                } else if (error.response.status == 429) {
                                    useAuthStore().$patch((state: any) => {
                                        state.warningLimiter = error.response.data
                                    })
                                }
                            } else {
                                useAuthStore().displayErrorMessage(error.response.data.message);
                            }
                            reject(error);
                        })
                    }
                }
            })
        },
        displayErrorMessage(message: string) {
            useAuthStore().$patch((state: any) => {
                state.errorMessage = message;
            })
        },
        login(email: string, password: string) {
            return new Promise((resolve, reject) => {
                signIn(email, password).then((response: any) => {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    localStorage.setItem('token', response.data.accessToken);
                    useAuthStore().$patch({
                        user: response.data.user,
                        isConnected: true,
                    });
                    useAuthStore().getMyInformations().then(() => {
                        resolve(response);
                    });
                }).catch((error => {
                    if (error.response.data.message == `L'adresse email n'existe pas !`) {
                        useAuthStore().$reset();
                        useAuthStore().$patch({
                            invalidEmail: true,
                        });
                    } else {
                        useAuthStore().$reset();
                        useAuthStore().$patch({
                            invalidPassword: true,
                        });
                    }
                    if (error.response.status == 429) {
                        useAuthStore().$patch((state: any) => {
                            console.log(error.response.data);
                            state.warningLimiter = error.response.data
                        })
                    };
                    reject(error);
                }))
            })
        },
        removeWarningMessage() {
            useAuthStore().$patch((state: any) => {
                state.warningLimiter = null;
            })
        },
        logout() {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            useAuthStore().$patch((state: IAuthStore) => {
                state.isConnected = false;
                state.user = null;
            });
            useAuthStore().$reset();
            useChatStore().$reset();
            useFriendshipStore().$reset();
            usePublicationsStore().$reset();
            useCommentsStore().$reset();
            useOtherStore().$reset();
        },
        getMyInformations: () => {
            return new Promise<void>((resolve, reject) => {
                let token = localStorage.getItem('token');
                token ? useAuthStore().$patch({
                    isConnected: true,
                }) : "";
                fetchInformation().then((response: any) => {
                    useAuthStore().$patch({
                        user: response.data,
                        isConnected: true,
                    });
                    const session = JSON.parse(localStorage.getItem("user"));
                    if (socket.connected == false) {
                        socket.auth = { username: session.firstname + ' ' + session.lastname, picture: session.picture_url, user: session.user_id, sessionID: session.session_id };
                        socket.connect();
                    }
                    useAuthStore().getAllNotifications().then(() => {
                        resolve(response);
                    });
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        },
        getAllNotifications: () => {
            return new Promise<void>((resolve, reject) => {
                let date = new Date();
                let newDate = moment(date).format('DD/MM/YYYY HH:mm:ss');
                let newDateSplit = newDate.split(" ");
                fetchNotifications().then((response: any) => {
                    console.log(response);
                    response.data.forEach((element: any) => {
                        if (element.type == 'like' || element.type == 'comment') {
                            element.publication_id = element.param1;
                            element.publication_picture = element.param2;
                            element.publication_content = element.param3;

                            if (element.type == 'like') {
                                element.like_id = element.id;
                                element.message = 'a aimé votre publication';
                            } else {
                                element.comment_id = element.id;
                                element.message = 'a commenté votre publication';
                            }
                        } else if (element.type == 'friendship') {
                            element.idRequest = element.id;
                            if (element.created_at > element.param2) {
                                element.message = 'a accepté votre demande d\'ami';
                            } else {
                                element.message = 'vous a envoyé une demande d\'ami';
                            }
                        }
                        let date = moment(element.created_at).format('DD/MM/YYYY à HH:mm').split(" ");
                        if (date[0] == newDateSplit[0]) {
                            date[0] = "Aujourd'hui";
                        } else if (parseInt(date[0]) == parseInt(newDateSplit[0]) - 1) {
                            date[0] = "Hier";
                        } else if (parseInt(date[0]) == parseInt(newDateSplit[0]) - 2) {
                            date[0] = "Avant-hier";
                        }
                        useOtherStore().$patch((state: any) => {
                            state.notifications.push({
                                ...element,
                                read: true,
                                date: date.join(" ")
                            });
                        })
                    })
                    resolve();
                })
            })
        },
        updateProfile: (update: any) => {
            return new Promise((resolve, reject) => {
                let formData = new FormData();
                update.picture_url !== undefined ? formData.append('picture', update.picture_url) : "";
                update.email !== '' && update.email !== undefined ? formData.append('email', update.email) : "";
                update.password !== '' && update.password !== undefined ? formData.append('password', update.password) : "";
                editProfile(formData).then((response: any) => {
                    if (update.picture_url) {
                        useAuthStore().$patch((state: any) => {
                            state.user.picture_url = response.data[0].picture_url
                        })
                    };
                    if (update.email) {
                        useAuthStore().$patch((state: any) => {
                            state.user.email = response.data[0].email
                        })
                    };
                    localStorage.getItem('user') ? localStorage.setItem('user', JSON.stringify(useAuthStore().user)) : "";
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        },
        onUpdateProfile: (data: any) => {
            useFriendshipStore().$patch((state: any) => {
                if (state.friends.length > 0) {
                    state.friends.map((item: any) => {
                        if (item.user_id == data.data[0].id) {
                            item.picture_url = data.data[0].picture_url;
                        }
                        return item;
                    })
                }
                if (state.searchResults.length > 0) {
                    state.searchResults.map((item: any) => {
                        if (item.user_id == data.data[0].id) {
                            item.picture_url = data.data[0].picture_url;
                        }
                        return item;
                    })
                }
                if (state.invitSendedTo.length > 0) {
                    state.invitSendedTo.map((item: any) => {
                        if (item.id == data.data[0].id) {
                            item.picture_url = data.data[0].picture_url;
                        }
                        return item;
                    })
                }
                if (state.requests.length > 0) {
                    state.requests.map((item: any) => {
                        if (item.sender == data.data[0].id) {
                            item.picture_url = data.data[0].picture_url;
                        }
                        return item;
                    })
                }
            });
            useChatStore().$patch((state: any) => {
                if (state.users.length > 0) {
                    state.users.map((item: any) => {
                        if (item.user == data.data[0].id) {
                            item.picture = data.data[0].picture_url;
                        }
                        return item;
                    })
                };
                if (state.friendsConnected.length > 0) {
                    state.friendsConnected.map((item: any) => {
                        if (item.user == data.data[0].id) {
                            item.picture = data.data[0].picture_url
                        }
                    })
                }
            });
            useOtherStore().$patch((state: any) => {
                if (state.notifications.length > 0) {
                    state.notifications.map((item: any) => {
                        if (item.user_id == data.data[0].id) {
                            item.picture_url = data.data[0].picture_url;
                        }
                    })
                }
            });
            usePublicationsStore().$patch((state: any) => {
                if (state.publications.length > 0) {
                    state.publications.map((item: any) => {
                        if (item.user_id == data.data[0].id) {
                            item.picture_url = data.data[0].picture_url;
                        }
                        if (item.comments.length > 0) {
                            item.comments.map((com: any) => {
                                console.log(com.user_id);
                                console.log(data.data[0].id);
                                if (com.user_id == data.data[0].id) {
                                    com.picture_url = data.data[0].picture_url;
                                }
                                return com;
                            })
                        }
                        return item;
                    })
                    state.publications.map((item: any) => {
                        return item;
                    })
                }
            })
        }
    }
});