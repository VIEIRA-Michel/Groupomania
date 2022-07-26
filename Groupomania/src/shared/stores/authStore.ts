import { defineStore } from 'pinia';
import axios from 'axios';

export interface IAuthStore {
    // isConnected: boolean | null;
    user: any | null;
    // token: string | null;
}

export const useAuthStore = defineStore({
    id: "auth",
    state: (): IAuthStore => ({
        // isConnected: null,
        user: {},
        // token: '',
    }),
    getters: {
        // isLogged: (state) => this.checkToken(),
        // token: (state) => state.token,
    },
    
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
                        this.login(email, password);
                    }).catch(error => {
                        console.log(error);
                    });
                }
            }
        },
        login(username: string, password: string){

            const api = axios.create({
                baseURL: 'http://localhost:3000/api',
                timeout: 2500,
            });
            let data = { email: username, password: password };
            axios.post(`http://localhost:3000/api/auth/login`,
                data).then((response => {
                    localStorage.setItem('token', response.data.accessToken);
                    // this.$state.token = response.data.accessToken;
                    // this.$state.isConnected = true;
                    // console.log(this.isLogged)
                    console.log(response);
                    return response;

                }))
                .catch((error => {
                    console.log(error);
                }))
        },
        logout: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // state.isConnected = false;
            // console.log(state);
        },
        checkToken: (state: any) => {
            const token = localStorage.getItem('token');
            if (token) {
                state.isConnected = true;
            }
        },
        getMyInformations: () => {
            axios({
                method: 'get',
                url: 'http://localhost:3000/api/user/me',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                // console.log(response.data);
                const store = useAuthStore();
                // store.$patch({
                //     user: response.data,
                // });
                localStorage.setItem('user', JSON.stringify(response.data));
                return response.data;
            }).catch(error => {
                console.log(error);
            });
        }

    }
});