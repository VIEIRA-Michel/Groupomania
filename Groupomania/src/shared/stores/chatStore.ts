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
    online: Online[];
    name: null;
    ready: boolean;
    info: Information[];
    connectionCount: number;
}

export const useChatStore = defineStore({
    id: "chat",
    state: (): chatState => ({
        newmessage: null,
        messages: [] as Message[],
        typing: false,
        online: [] as Online[],
        name: null,
        ready: false,
        info: [] as Information[],
        connectionCount: 0,
    }),
    getters: {
        onlineList: (state: chatState) => state.online,
    },
    actions: {
        addMessage: (message: any, user: any) => {
            const store = useChatStore();
            store.$patch((state) => {
                state.messages.push({
                    message: message.message._value, type: 1, picture_url: message.picture_url,
                    firstname: message.firstname, lastname: message.lastname,
                });
                state.typing = false;
            });
        },
    },
});