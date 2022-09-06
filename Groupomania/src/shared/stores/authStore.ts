import { defineStore, storeToRefs } from 'pinia';
import axios from 'axios';
import socket from "../../socket";

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
                        axios({
                            method: 'post',
                            url: 'http://localhost:3000/api/auth/signup',
                            data: {
                                lastname: lastname,
                                firstname: firstname,
                                email: email,
                                password: password,
                            }
                        }).then(response => {
                            // useAuthStore().login(email, password);
                            resolve(response);
                        }).catch(error => {
                            console.log(error);
                            reject(error);
                        })
                    }
                }
            })
        },
        login(username: string, password: string) {
            return new Promise((resolve, reject) => {
                axios({
                    method: 'post',
                    url: 'http://localhost:3000/api/auth/login',
                    data: {
                        email: username,
                        password: password,
                    },
                }).then((response => {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    localStorage.setItem('token', response.data.accessToken);
                    useAuthStore().$patch({
                        user: response.data.user,
                        isConnected: true,
                    });
                    resolve(response);
                })).catch((error => {
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
            return new Promise((resolve, reject) => {
                let user = JSON.parse(localStorage.getItem('user'));
                axios({
                    method: 'post',
                    url: 'http://localhost:3000/api/auth/logout',
                    headers: {
                        authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    data: {
                        userID: user.userID
                    }
                }).then(response => {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    useAuthStore().$patch((state: IAuthStore) => {
                        state.isConnected = false;
                        state.user = null;
                    });
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        },
        getMyInformations: () => {
            let token = localStorage.getItem('token');
            token ? useAuthStore().$patch({
                isConnected: true,
            }) : "";
            axios({
                method: 'get',
                url: 'http://localhost:3000/api/user/me',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                },
            }).then(response => {
                useAuthStore().$patch({
                    user: response.data,
                    isConnected: true,
                });
                const session = JSON.parse(localStorage.getItem("user"));
                if (socket.connected == false) {
                    socket.auth = { username: session.firstname + ' ' + session.lastname, picture: session.picture_url, user: session.user_id, sessionID: session.session_id };
                    socket.connect();
                }

            }).catch(error => {
                error.response.status === 403 ? useAuthStore().logout() : "";
                console.log(error);
            })
        },
        updateProfile: (update: any) => {
            return new Promise((resolve, reject) => {
                let formData = new FormData();
                update.picture_url !== undefined ? formData.append('picture', update.picture_url) : "";
                update.email !== '' && update.email !== undefined ? formData.append('email', update.email) : "";
                update.password !== '' && update.password !== undefined ? formData.append('password', update.password) : "";
                axios({
                    method: 'put',
                    url: 'http://localhost:3000/api/user/profil',
                    headers: {
                        authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    data: formData
                }).then((response: any) => {
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
                    error.response.status === 403 ? useAuthStore().logout() : "";
                    console.log(error);
                    reject(error);
                })
            })
        }

    }
});