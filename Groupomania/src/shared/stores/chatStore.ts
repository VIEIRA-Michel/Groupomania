import { defineStore } from 'pinia';
import type { Message } from '../interfaces/message.interface';

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