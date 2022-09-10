import { useFriendshipStore } from './friendsStore';
import axios from 'axios';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Message } from '../interfaces/message.interface';

export interface chatState {
    newmessage: null;
    messages: Message[];
    typing: boolean;
    users: [];
    selectedUser: any;
}

export const useChatStore = defineStore({
    id: "chat",
    state: (): chatState => ({
        newmessage: null,
        messages: [] as Message[],
        typing: false,
        users: [],
        selectedUser: null,
    }),
    getters: {
        onlineList: (state: chatState) => {
            return state.users.filter((user: any) => user.connected);
        },
    },
    actions: {
        userConnected: (user: any) => {
            useFriendshipStore().$state.friends.map((friend: any) => {
                if (user.user == friend.user_id) {
                    useChatStore().$patch((state: any) => {
                        state.users.push(user);
                    })
                }
            })
        },
        sendMessage: (id: number, message: any, from: any) => {
            return new Promise((resolve, reject) => {
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
                    resolve(response.data.message_sended_id);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        },
        getMessagesOfConversation: (conversation_id: number) => {
            return new Promise((resolve, reject) => {
                axios({
                    method: 'get',
                    url: `http://localhost:3000/api/user/${conversation_id}/messages`,
                    headers: {
                        authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                }).then(response => {
                    console.log(response)
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error)
                })
            })
        },
        getUsersConnected() {
            return new Promise((resolve, reject) => {
                axios({
                    method: 'get',
                    url: 'http://localhost:3000/api/user/connected',
                    headers: {
                        authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }).then(response => {
                    let obj = ref([]);
                    console.log(response);
                    if (response.data?.length > 0) {
                        const session: any = JSON.parse(localStorage.getItem("user")!);
                        let currentUserConnected = response.data.filter((user: any) => user.userID !== session.userID);
                        currentUserConnected.map((user: any) => {
                            useFriendshipStore().$state.friends.map((item: any) => {
                                if (item.user_id == user.user) {
                                    obj.value.push({
                                        ...user,
                                        messages: [],
                                        hasNewMessages: false
                                    });
                                    // console.log(obj.value);
                                }
                            })
                        })
                        useChatStore().$patch((state: any) => {
                            state.users = obj.value
                        });
                    }
                    resolve(obj.value);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        },
    },
});