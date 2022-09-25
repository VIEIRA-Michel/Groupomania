import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { fetchRequests, fetchFriends, acceptOrDecline, deleteFriend, searchFriend, addFriend, cancelReq, checkReq } from '../services/friends.service';
import { useChatStore } from './chatStore';

interface FriendshipState {
    friends: any[];
    requests: any[];
    isLoading: boolean;
    numOfResults: number;
    numberOfPages: number;
    searchResults: any[];
    invitSendedTo: any[];
    friendsOfUser: any[]
}

export const useFriendshipStore = defineStore({
    id: "friendship",
    state: (): FriendshipState => ({
        friends: [],
        requests: [],
        isLoading: true,
        numOfResults: 0,
        numberOfPages: 1,
        searchResults: [],
        invitSendedTo: [],
        friendsOfUser: []
    }),
    getters: {
        friendsList: (state: FriendshipState) => state.friends,
        requestsList: (state: FriendshipState) => state.requests,
        searchList: (state: FriendshipState) => state.searchResults,
        invitationList: (state: FriendshipState) => state.invitSendedTo,
    },
    actions: {
        getRequests: () => {
            return new Promise((resolve, reject) => {
                fetchRequests().then((response: any) => {
                    if (response.results && response.results.length > 0) {
                        response.results.map((item: any) => {
                            useFriendshipStore().$patch((state: any) => {
                                if (state.requests.find((request: any) => request.sender !== item.sender) || state.requests.length == 0) {
                                    state.isLoading = false;
                                    state.requests.push(item);
                                }
                            })
                        })
                    }
                    console.log(response);
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        },
        getAllFriends: (id?: number) => {
            return new Promise((resolve, reject) => {
                let param = id ? id : '';
                fetchFriends(param).then((response: any) => {
                    let userToCompare = 0;
                    let newFriend = ref({
                        user_id: 0,
                        picture_url: '',
                        firstname: '',
                        lastname: '',
                    });
                    id ? userToCompare = id : userToCompare = useAuthStore().$state.user.user_id;
                    response.results.map((item: any) => {
                        if (userToCompare == item.sender_user_id) {
                            newFriend.value = {
                                user_id: item.recipient_user_id,
                                picture_url: item.recipient_picture_url,
                                firstname: item.recipient_firstname,
                                lastname: item.recipient_lastname,
                            };
                        } else {
                            newFriend.value = {
                                user_id: item.sender_user_id,
                                picture_url: item.sender_picture_url,
                                firstname: item.sender_firstname,
                                lastname: item.sender_lastname,
                            };
                        }
                        if (id) {
                            useFriendshipStore().$patch((state: any) => {
                                if (state.friendsOfUser.find((item: any) => item.user_id !== newFriend.value.user_id) || state.friendsOfUser.length == 0) {
                                    state.friendsOfUser.push(newFriend.value);
                                    state.isLoading = false;
                                }
                            })
                        } else {
                            useFriendshipStore().$patch((state: any) => {
                                if (state.friends.find((item: any) => item.user_id !== newFriend.value.user_id) || state.friends.length == 0) {
                                    state.friends.push(newFriend.value);
                                    state.isLoading = false;
                                }
                            })
                        }
                    })
                    console.log(response);
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        },
        acceptOrDeclineRequest: (req: any, answer: string) => {
            return new Promise((resolve, reject) => {
                acceptOrDecline(req.sender, answer).then((response: any) => {
                    if (answer == 'refused') {
                        useFriendshipStore().$patch((state: any) => {
                            state.requests.map((item: any) => {
                                item.sender == req.sender ? state.requests.splice(state.requests.indexOf(item), 1) : "";
                            });
                            state.searchResults.map((item: any) => {
                                item.user_id == req.sender ? item.waitingReply = false : "";
                            })
                        });
                    } else {
                        useFriendshipStore().$patch((state: any) => {
                            state.requests.map((item: any) => {
                                if (item.sender == req.sender) {
                                    state.friends.push({
                                        user_id: item.sender,
                                        firstname: item.firstname,
                                        lastname: item.lastname,
                                        picture_url: item.picture_url,
                                        email: item.email
                                    })
                                    state.requests.splice(state.requests.indexOf(item), 1);
                                }
                            });
                            state.searchResults.map((item: any) => {
                                if (item.user_id == req.sender) {
                                    item.isFriend = true;
                                    item.waitingReply = false;
                                }
                            });
                        })
                        useChatStore().newFriend(req);
                    }
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        },
        removeFriend: (id: number) => {
            return new Promise((resolve, reject) => {
                deleteFriend(id).then((response: any) => {
                    useFriendshipStore().$patch((state: any) => {
                        state.friends.map((item: any) => {
                            if (item.user_id == id) {
                                state.friends.splice(state.friends.indexOf(item), 1);
                            }
                        })
                        state.searchResults.map((item: any) => {
                            if (item.user_id == id) {
                                item.isFriend = false;
                            }
                        })
                    })
                    useChatStore().friendDeleted(id);
                    resolve(response);
                }).catch(error => {
                    reject(error);
                    console.log(error);
                })
            })
        },
        searchUser: (search: string) => {
            return new Promise((resolve, reject) => {
                searchFriend(search).then((response: any) => {
                    useFriendshipStore().$patch((state: any) => {
                        state.searchResults.splice(0, state.searchResults.length)
                    });
                    if (response.data.results) {
                        useFriendshipStore().$patch((state: any) => {
                            response.data.results.map((item: any) => {
                                if (state.friends.length > 0) {
                                    state.friends.map((friend: any) => {
                                        if (item.user_id == friend.user_id) {
                                            item.isFriend = true;
                                        }
                                    })
                                }
                                if (state.invitSendedTo.length > 0) {
                                    state.invitSendedTo.map((invit: any) => {
                                        if (item.user_id == invit.id) {
                                            item.pending = true;
                                        }
                                    })
                                }
                                if (state.requests.length > 0) {
                                    state.requests.map((request: any) => {
                                        if (item.user_id == request.sender) {
                                            item.waitingReply = true;
                                        }
                                    })
                                }
                                useAuthStore().$state.user.user_id == item.user_id ? response.data.results.splice(response.data.results.indexOf(item), 1) : state.searchResults.push(item);
                            })
                        })
                    }
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error)
                })
            })
        },
        sendFriendRequest: (user_id: number) => {
            return new Promise((resolve, reject) => {
                addFriend(user_id).then((response: any) => {
                    useFriendshipStore().$state.searchResults.map((item: any) => {
                        item.user_id == user_id ? item.pending = true : "";
                        return item;
                    });
                    if (response.data.results) {
                        useFriendshipStore().$patch((state: FriendshipState) => {
                            state.invitSendedTo.push({
                                account_disabled: response.data.results[0].account_disabled,
                                email: response.data.results[0].email,
                                firstname: response.data.results[0].firstname,
                                id: response.data.results[0].id,
                                lastname: response.data.results[0].lastname,
                                picture_url: response.data.results[0].picture_url,
                                request_date: response.data.results[0].request_date,
                                role_id: response.data.results[0].role_id,
                                session_id: response.data.results[0].session_id,
                                userID: response.data.results[0].userID
                            })
                        })
                    }
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        },
        cancelRequest: (user_id: number) => {
            return new Promise((resolve, reject) => {
                cancelReq(user_id).then((response: any) => {
                    useFriendshipStore().$patch((state: FriendshipState) => {
                        state.searchResults.map((item: any) => {
                            if (item.user_id == user_id) {
                                item.pending = false;
                            }
                        })
                        state.invitSendedTo.map((item: any) => {
                            if (item.id == user_id) {
                                state.invitSendedTo.splice(state.invitSendedTo.indexOf(item), 1);
                            }
                        })
                    })
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        },
        checkRequestsSended: () => {
            return new Promise((resolve, reject) => {
                checkReq().then((response: any) => {
                    useFriendshipStore().$patch((state: any) => {
                        state.invitSendedTo.splice(0, state.invitSendedTo.length),
                            response.data.results.map((item: never) => {
                                state.invitSendedTo.push(item);
                            });
                    });
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        },
        onFriendRequestSended: (data: any) => {
            if (data.request.recipient == useAuthStore().$state.user.user_id) {
                useFriendshipStore().$patch((state: any) => {
                    if (state.requests.find((item: any) => item.sender !== data.request.sender) || state.requests.length == 0) {
                        state.requests.push(data.request);
                    }
                    if (state.searchResults.length > 0) {
                        state.searchResults.map((item: any) => {
                            if (item.user_id == data.request.sender) {
                                item.waitingReply = true;
                            }
                        })
                    }
                    state.isLoading = false;
                });
            }
        },
        onFriendRequestRefused: (data: any) => {
            if (data.target == useAuthStore().$state.user.user_id) {
                useFriendshipStore().$patch((state: any) => {
                    if (state.invitSendedTo.length > 0) {
                        state.invitSendedTo.map((item: any) => {
                            if (item.id == data.user) {
                                state.invitSendedTo.splice(state.invitSendedTo.indexOf(item), 1);

                            }
                        })
                    }
                    if (state.searchResults.length > 0) {
                        state.searchResults.map((item: any) => {
                            console.log(item);
                            if (item.user_id == data.user) {
                                item.pending = false;
                                item.isFriend = false;

                            }
                        })
                    }

                    state.isLoading = false;
                })
            }
        },
        onFriendRequestAccepted: (data: any) => {
            if (data.response.data.results[0].user_id_sender == useAuthStore().$state.user.user_id) {
                useFriendshipStore().$patch((state: any) => {
                    if (state.invitSendedTo.length > 0) {
                        state.invitSendedTo.map((item: any) => {
                            if (item.id == data.response.data.results[0].user_id_recipient) {
                                state.invitSendedTo.splice(state.invitSendedTo.indexOf(item), 1);
                            }
                        })
                    }
                    if (state.searchResults.length > 0) {
                        state.searchResults.map((item: any) => {
                            if (item.user_id == data.response.data.results[0].user_id_recipient) {
                                item.pending = false;
                                item.isFriend = true;
                            }
                        })
                    }
                    state.friends.push({
                        user_id: data.response.data.results[0].id,
                        firstname: data.response.data.results[0].firstname,
                        lastname: data.response.data.results[0].lastname,
                        picture_url: data.response.data.results[0].picture_url
                    })
                    state.isLoading = false;

                })
                useChatStore().newFriend(data.user)
            }
        },
        onFriendRemoved: (data: any) => {
            if (useAuthStore().$state.user.user_id == data.target) {
                useFriendshipStore().$patch((state: any) => {
                    if (state.friends.length > 0) {
                        state.friends.map((item: any) => {
                            if (item.user_id == data.user) {
                                state.friends.splice(state.friends.indexOf(item), 1);
                            }
                        })
                    }
                    if (state.searchResults.length > 0) {
                        state.searchResults.map((item: any) => {
                            if (item.user_id == data.user) {
                                item.isFriend = false;
                            }
                        })
                    }
                    if (useChatStore().$state.users.length > 0) {
                        useChatStore().$patch((state: any) => {
                            state.users.map((item: any) => {
                                if (item.user == data.user) {
                                    state.users.splice(state.users.indexOf(item), 1);
                                }
                            })
                        })
                    }
                    state.isLoading = false;
                })
                useChatStore().friendDeleted(data.user);
            }
        },
        onFriendRequestCanceled: (data: any) => {
            if (useAuthStore().user.user_id == data.target) {
                useFriendshipStore().$patch((state: any) => {
                    if (state.requests.length > 0) {
                        state.requests.map((item: any) => {
                            if (item.sender == data.user) {
                                state.requests.splice(state.requests.indexOf(item), 1);
                            }
                        })
                    }
                    state.isLoading = false;
                })
            }
        }
    }
});