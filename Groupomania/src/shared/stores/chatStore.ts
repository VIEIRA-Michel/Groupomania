import axios from 'axios';
import { defineStore } from 'pinia';
import type { Message } from '../interfaces/message.interface';
import { useAuthStore } from './authStore';

export interface chatState {
    newmessage: null;
    messages: Message[];
    typing: boolean;
    users: [];
    friendsConnected: []
}

export const useChatStore = defineStore({
    id: "chat",
    state: (): chatState => ({
        newmessage: null,
        messages: [] as Message[],
        typing: false,
        users: [],
        friendsConnected: []
    }),
    getters: {
        onlineList: (state: chatState) => state.users,
    },
    actions: {
        userConnected: (user: any) => {
            useChatStore().$patch((state) => state.users.push(user));
        },
        friendsConnected: (friend: any) => {
            useChatStore().$patch((state) => state.friendsConnected.push(friend));
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
            }).catch(error => {
                error.response.status === 403 ? useAuthStore().logout() : "";
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
                useChatStore().$patch((state) => state.messages = response.data);
            }).catch(error => {
                error.response.status === 403 ? useAuthStore().logout() : "";
                console.log(error);
            })
        }
    },
});