import { useFriendshipStore } from './friendsStore';
import { defineStore } from 'pinia';
import type { Message } from '../interfaces/message.interface';
import { sendMsg, fetchMessages, fetchUsers, getCount } from '../services/chat.service';
import { useAuthStore } from './authStore';
import moment from 'moment';
import { ref } from 'vue';

export interface chatState {
    newmessage: null;
    messages: Message[];
    typing: boolean;
    users: [];
    selectedUser: any;
    friendsConnected: [],
    messagesToDisplay: Message[],
}

export const useChatStore = defineStore({
    id: "chat",
    state: (): chatState => ({
        newmessage: null,
        messages: [] as Message[],
        typing: false,
        users: [],
        selectedUser: null,
        friendsConnected: [],
        messagesToDisplay: [] as Message[]
    }),
    getters: {
        onlineList: (state: chatState) => {
            return state.friendsConnected.filter((user: any) => user.connected);
        },
    },
    actions: {
        newFriend: (user: any) => {
            useChatStore().$patch((state: any) => {
                state.friendsConnected.push({
                    user: user.sender ? user.sender : user.user_id,
                    connected: true,
                    picture: user.picture_url,
                    username: user.firstname + ' ' + user.lastname,
                    userID: user.userID,
                    from: 0,
                    limit: 25,
                    hasNewMessages: false,
                    messages: [],
                    messagesQty: 0
                })
            })
        },
        friendDeleted: (user_id: number) => {
            useChatStore().$patch((state: any) => {
                state.friendsConnected.map((friend: any) => {
                    if (friend.user == user_id) {
                        state.friendsConnected.splice(state.friendsConnected.indexOf(friend), 1);
                    }
                })
                if (state.selectedUser !== null) {
                    if (state.selectedUser.user == user_id) {
                        state.selectedUser = null;
                    }
                }
            })
        },
        unselectUser: () => {
            useChatStore().$patch((state: any) => {
                state.selectedUser = null;
            })
        },
        messageRead: () => {
            useChatStore().$patch((state: any) => {
                state.selectedUser.hasNewMessages = false;
            })
        },
        removeMessageAtDisplay: () => {
            return new Promise<void>((resolve, reject) => {
                useChatStore().$patch((state: any) => {
                    if (state.messagesToDisplay.length > 0) {
                        state.messagesToDisplay[0].disapear = true;
                        setTimeout(() => {
                            state.messagesToDisplay.splice(0, 1);
                            resolve();
                        }, 400)
                    }
                })
            })
        },
        sendMessage: (id: number, message: any) => {
            return new Promise((resolve, reject) => {
                sendMsg(id, message).then((response: any) => {
                    useChatStore().$patch((state: any) => {
                        console.log(response.data);
                        state.selectedUser.messagesQty += 1;
                        state.messages.push({
                            sender: useAuthStore().$state.user.user_id,
                            id: response,
                            content: message.value,
                            recipient: state.selectedUser.user,
                        });
                        state.selectedUser.messages.push({
                            sender: useAuthStore().$state.user.user_id,
                            id: response,
                            content: message,
                            recipient: state.selectedUser.user,
                        });
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
                    if (response.data?.length > 0 && useFriendshipStore().$state.friends.length > 0) {
                        useChatStore().$patch((state: any) => {
                            state.friendsConnected.splice(0, state.friendsConnected.length);
                            response.data.map((user: any) => {
                                useFriendshipStore().$state.friends.map((friend: any) => {
                                    if (friend.user_id == user.user) {
                                        state.friendsConnected.push({
                                            connected: user.connected,
                                            from: 0,
                                            hasNewMessages: false,
                                            limit: 25,
                                            messages: [],
                                            messagesQty: 0,
                                            picture: friend.picture_url,
                                            user: user.user,
                                            userID: user.userID,
                                            username: user.username
                                        })
                                    }
                                })
                            })
                        })
                    }
                    resolve(useChatStore().$state.friendsConnected);
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
        },
        onTyping: (typing: boolean, data?: any) => {
            useChatStore().$patch((state: any) => {
                typing ? state.typing = data : state.typing = false;
            })
        },
        onPrivateMessage: (data: any) => {
            return new Promise<void>((resolve, reject) => {
                let date = new Date();
                let newDate = moment(date).format('HH:mm');
                useChatStore().$patch((state: any) => {
                    useChatStore().$state.friendsConnected.map((utilisateur: any) => {
                        if (utilisateur.userID == data.from) {
                            state.messages.push({
                                sender: utilisateur.user,
                                id: data.id,
                                content: data.message,
                                recipient: useAuthStore().$state.user.user_id,
                            });
                            utilisateur.messages.push({
                                sender: utilisateur.user,
                                id: data.id,
                                content: data.message,
                                recipient: useAuthStore().$state.user.user_id,
                            });
                            utilisateur.messagesQty += 1;
                            if (utilisateur !== state.selectedUser) {
                                utilisateur.hasNewMessages = true;
                            }

                            state.messagesToDisplay.push({
                                user_id: utilisateur.user,
                                username: utilisateur.username,
                                picture: utilisateur.picture,
                                message: data.message,
                                userID: utilisateur.userID,
                                at: newDate,
                                disapear: false
                            })
                            setTimeout(() => {
                                if (state.messagesToDisplay.length !== 0) {
                                    useChatStore().removeMessageAtDisplay();
                                }
                            }, 2500)
                            return utilisateur;
                        }
                    })

                })
                resolve();
            })
        },
        onUserConnnected: (data: any) => {
            useChatStore().$patch((state: any) => {
                state.friendsConnected.map((friend: any) => {
                    if (friend.userID === data.userID) {
                        friend.connected = true;
                    }
                    return friend;
                })
            })
        },
        onUserDisconnected: (data: any) => {
            useChatStore().$patch((state: any) => {
                state.friendsConnected.map((friend: any) => {
                    if (friend.userID === data) {
                        friend.connected = false;
                    }
                    return friend;
                });
            });
        }
    }
});