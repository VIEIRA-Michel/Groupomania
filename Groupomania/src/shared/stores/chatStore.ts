import { useFriendshipStore } from './friendsStore';
import { defineStore } from 'pinia';
import type { Message } from '../interfaces/message.interface';
import { sendMsg, fetchMessages, fetchUsers, getCount } from '../services/chat.service';

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
                        state.users.push({
                            ...user,
                            limit: 25,
                            from: 0,
                            messagesQty: 0
                        });
                    })
                }
            })
        },
        sendMessage: (id: number, message: any) => {
            return new Promise((resolve, reject) => {
                sendMsg(id, message).then((response: any) => {
                    useChatStore().$patch((state: any) => {
                        console.log(response.data);
                        state.selectedUser.messagesQty += 1;
                        // state.selectedUser.messages.push({

                        // })
                    });
                    resolve(response.data.message_sended_id);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        },
        getMessagesOfConversation: (conversation_id: number, limit: number, from: number) => {
            return new Promise((resolve, reject) => {
                fetchMessages(conversation_id, limit, from).then((response: any) => {
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error)
                })
            })
        },
        getUsersConnected() {
            return new Promise((resolve, reject) => {
                fetchUsers().then((response: any) => {
                    if (response.data?.length > 0) {
                        const session: any = JSON.parse(localStorage.getItem("user")!);
                        let currentUserConnected = response.data.filter((user: any) => user.userID !== session.userID);
                        currentUserConnected.map((user: any) => {
                            useFriendshipStore().$state.friends.map((item: any) => {
                                if (item.user_id == user.user) {
                                    useChatStore().$patch((state: any) => {
                                        state.users.splice(0, state.users.length);
                                        state.users.push({
                                            ...user,
                                            messages: [],
                                            hasNewMessages: false,
                                            limit: 25,
                                            from: 0,
                                            messagesQty: 0
                                        });
                                    })
                                }
                            })
                        })
                    }
                    resolve(useChatStore().$state.users);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        },
        getCountOfMessages: (conversation_id: number) => {
            return new Promise((resolve, reject) => {
                getCount(conversation_id).then((response: any) => {
                    resolve(response.data.count);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        },
        fetchMoreMessages: () => {
            return new Promise((resolve, reject) => {
                useChatStore().$patch((state: any) => {
                    state.selectedUser.from += 25;
                    console.log(state.selectedUser);
                    fetchMessages(state.selectedUser.user, state.selectedUser.limit, state.selectedUser.from).then((response: any) => {
                        console.log(response);
                        if (response.length > 0) {
                            for (let i = response.length; i !== 0; i--) {
                                state.selectedUser.messages.unshift(response.pop());
                            }
                        }
                        resolve(response);
                    }).catch(error => {
                        console.log(error);
                        reject(error)
                    })
                })
            })
        }
    }
});