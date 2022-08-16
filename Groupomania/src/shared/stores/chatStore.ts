import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import type { Information } from '../interfaces/information.interface';
import type { Online } from '../interfaces/online.interface';
import type { Message } from '../interfaces/message.interface';
import { useAuthStore } from '../stores/authStore';

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
        }
    },
});