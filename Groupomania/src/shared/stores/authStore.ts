import { defineStore, storeToRefs } from 'pinia';
import socket from "../../socket";
import { signUp, signIn, fetchInformation, editProfile } from "../services/auth.service";
import { useChatStore } from './chatStore';
import { useFriendshipStore } from './friendsStore';
import { usePublicationsStore } from './publicationsStore';

export interface IAuthStore {
    isConnected: boolean | null;
    user: any | null;
    invalidEmail: boolean;
    invalidPassword: boolean;
}

export const useAuthStore = defineStore({
    id: "auth",
    state: (): IAuthStore => ({
        isConnected: false,
        user: {},
        invalidEmail: false,
        invalidPassword: false
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
                            resolve(response);
                        }).catch(error => {
                            console.log(error);
                            reject(error);
                        })
                    }
                }
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
                    resolve(response);
                }).catch((error => {
                    console.log(error);
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
                    reject(error);
                }))
            })
        },
        logout() {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            useAuthStore().$patch((state: IAuthStore) => {
                state.isConnected = false;
                state.user = null;
            });
        },
        getMyInformations: () => {
            return new Promise((resolve, reject) => {
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
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error);
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
            })
            useChatStore().$patch((state: any) => {
                if (state.users.length > 0) {
                    state.users.map((item: any) => {
                        if (item.user == data.data[0].id) {
                            item.picture = data.data[0].picture_url;
                        }
                        return item;
                    })
                }
            })
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