import { defineStore, storeToRefs } from 'pinia';
import axios from 'axios';

export interface IAuthStore {
    isConnected: boolean | null;
    user: any | null;
    token: string | null;
}

export const useAuthStore = defineStore({
    id: "auth",
    state: (): IAuthStore => ({
        isConnected: false,
        user: {},
        token: '',
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
                        const store = useAuthStore();
                        localStorage.setItem('token', response.data.accessToken);
                        localStorage.setItem('user', JSON.stringify(response.data.user));
                        store.$patch({
                            user: response.data.user,
                            token: response.data.accessToken,
                            isConnected: true,
                        });
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
                // localStorage.setItem('user', JSON.stringify(response.data.user));
                store.$patch({
                    user: response.data.user,
                    token: response.data.accessToken,
                    isConnected: true,
                });
            }))
                .catch((error => {
                    console.log(error);
                }))
        },
        logout: () => {
            const store = useAuthStore();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            store.$reset();
        },
        checkToken: () => {
            const store = useAuthStore();
            const token = localStorage.getItem('token');
            if (!token) {
                localStorage.clear()
            } else {
                store.$patch({
                    token: token,
                    isConnected: true,
                })
            }
            store.getMyInformations();
        },
        getMyInformations: () => {
            axios({
                method: 'get',
                url: 'http://localhost:3000/api/user/me',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                console.log(response.data);
                const store = useAuthStore();
                store.$patch({
                    user: response.data,
                    isConnected: true,
                });
            }).catch(error => {
                console.log(error);
            });
        }

    }
});