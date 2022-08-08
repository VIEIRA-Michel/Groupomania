import { defineStore, storeToRefs } from 'pinia';
import axios from 'axios';

export interface IAuthStore {
    isConnected: boolean | null;
    user: any | null;
    token: string | null;
    invalidEmail: boolean;
    invalidPassword: boolean;
}

export const useAuthStore = defineStore({
    id: "auth",
    state: (): IAuthStore => ({
        isConnected: false,
        user: {},
        token: '',
        invalidEmail: false,
        invalidPassword: false
    }),
    getters: {},
    actions: {
        register(lastname: string, firstname: string, email: string, password: string, confirmPassword: string) {
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
                        useAuthStore().login(email, password);
                    }).catch(error => {
                        console.log(error);
                    });
                }
            }
        },
        login(username: string, password: string) {
            const store = useAuthStore();
            axios({
                method: 'post',
                url: 'http://localhost:3000/api/auth/login',
                data: {
                    email: username,
                    password: password,
                },
            }).then((response => {
                console.log(response)
                localStorage.setItem('token', response.data.accessToken);
                store.$patch({
                    user: response.data.user,
                    token: response.data.accessToken,
                    isConnected: true,
                });
            }))
                .catch((error => {
                    if (error.response.data.message == `L'adresse email n'existe pas !`) {
                        store.$reset();
                        store.$patch({
                            invalidEmail: true,
                        });
                    } else {
                        store.$reset();
                        store.$patch({
                            invalidPassword: true,
                        });
                    }
                }))
        },
        logout: () => {
            const store = useAuthStore();
            localStorage.clear();
            store.$reset();
        },
        getMyInformations: () => {
            const store = useAuthStore();
            let token = localStorage.getItem('token');
            if (token) {
                store.$patch({
                    isConnected: true,
                })
            };
            axios({
                method: 'get',
                url: 'http://localhost:3000/api/user/me',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                store.$patch({
                    user: response.data,
                    isConnected: true,
                });
            }).catch(error => {
                if (error.response.status === 403) {
                    useAuthStore().logout();
                }
                console.log(error);
            });
        },
        updateProfile: (update: any) => {
            console.log(update);
            let formData = new FormData();
            if (update.picture_url !== undefined) {
                console.log('on a une image!');
                formData.append('picture', update.picture_url);
            }
            if (update.email !== undefined) {
                formData.append('email', update.email);
                console.log('on a un email!');
            }
            if (update.password !== undefined) {
                formData.append('password', update.password);
                console.log('on a un password!');
            }
            axios({
                method: 'put',
                url: 'http://localhost:3000/api/user/profil',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                },
                data: formData
            }).then(response => {
                console.log(response);
            }
            ).catch(error => {
                if (error.response.status === 403) {
                    useAuthStore().logout();
                }
                console.log(error);
            });

        }

    }
});