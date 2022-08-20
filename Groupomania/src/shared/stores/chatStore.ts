import axios from 'axios';
import { defineStore } from 'pinia';
import type { Message } from '../interfaces/message.interface';
import { useAuthStore } from './authStore';

export interface chatState {
    newmessage: null;
    messages: Message[];
    typing: boolean;
    users: [];
}

export const useChatStore = defineStore({
    id: "chat",
    state: (): chatState => ({
        newmessage: null,
        messages: [] as Message[],
        typing: false,
        users: [],
    }),
    getters: {
        onlineList: (state: chatState) => state.users,
    },
    actions: {
        userConnected: (user: any) => {
            const store = useChatStore();
            store.$patch((state) => state.users.push(user));
        },
        getUsersConnected: (users: any) => {
            const store = useChatStore();
            store.$patch((state) => state.users = users);
        },
        saveSession: (session_id: any) => {
            axios({
                method: 'post',
                url: 'http://localhost:3000/api/user/initializeSession',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                },
                data: {
                    session_id: session_id,
                },
            }).then(response => {
                console.log('on a mit la session ID dans la bdd');
            }).catch(error => {
                if (error.response.status === 403) {
                    useAuthStore().logout();
                }
                console.log(error);
            });
        },
        sendMessage: (id: number, message: any, from: any) => {
            axios({
                method: 'post',
                url: `http://localhost:3000/api/user/${id}/messages`,
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                },
                data: {
                    message: message,
                    from: from,
                    to: id,
                }
            }).then(response => {
                console.log(response);
                console.log("message envoyé");
            }).catch(error => {
                if (error.response.status === 403) {
                    useAuthStore().logout();
                }
                console.log(error);
            })
        },
        getAllMessages: () => {
            axios({
                method: 'get',
                url: 'http://localhost:3000/api/user/inbox',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                console.log(response);
            }).catch(error => {
                if (error.response.status === 403) {
                    useAuthStore().logout();
                }
                console.log(error);
            })
        }
    },
});