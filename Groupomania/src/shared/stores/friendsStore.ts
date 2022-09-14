import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { fetchRequests, fetchFriends, acceptOrDecline, deleteFriend, searchFriend, addFriend, cancelReq, checkReq } from '../services/friends.service';

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
                            if (useFriendshipStore().$state.requests.find((requests: any) => requests.sender == item.sender)) {
                                return;
                            } else {
                                useFriendshipStore().$patch((state: FriendshipState) => {
                                    state.requests.push(item);
                                    state.isLoading = false;
                                });
                            }
                        })
                    }
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
                            useFriendshipStore().$state.friendsOfUser.find((item: any) => {
                                if (item.user_id == newFriend.value.user_id) {
                                    return true;
                                }
                            }) ? "" : useFriendshipStore().$patch((state: any) => {
                                state.friendsOfUser.push(newFriend.value);
                                state.isLoading = false;
                            });
                        } else {
                            useFriendshipStore().$state.friends.find((item: any) => {
                                if (item.user_id == newFriend.value.user_id) {
                                    return true;
                                }
                            }) ? "" : useFriendshipStore().$patch((state: any) => {
                                state.friends.push(newFriend.value);
                                state.isLoading = false;
                            });
                        }
                    })
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        },
        acceptOrDeclineRequest: (req: any, answer: string) => {
            console.log(req, answer);
            return new Promise((resolve, reject) => {
                acceptOrDecline(req.sender, answer).then((response: any) => {
                    if (answer == 'refused') {
                        let state = ref([]);
                        useFriendshipStore().$state.requests.map((item: any) => {
                            item.sender !== req.sender ? state.value.push(item) : "";
                        });
                        useFriendshipStore().$patch({
                            requests: state.value,
                        });
                    } else {
                        let stateRequests = ref([]);
                        let stateFriends = ref([]);
                        useFriendshipStore().$state.requests.map((item: any) => {
                            item.sender !== req.sender ?
                                stateRequests.value.push(item)
                                : stateFriends.value.push({
                                    user_id: req.sender,
                                    firstname: req.firstname,
                                    lastname: req.lastname,
                                    picture_url: req.picture_url,
                                    email: req.email,
                                });
                        });
                        useFriendshipStore().$patch({
                            requests: stateRequests.value,
                            friends: [...useFriendshipStore().$state.friends, ...stateFriends.value],
                        });
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
                    let stateFriends = ref([]);
                    let stateSearch = ref([])
                    useFriendshipStore().$state.friends.map((item: any) => {
                        item.user_id !== id ? stateFriends.value.push(item) : "";
                    });
                    useFriendshipStore().$state.searchResults.map((result: any) => {
                        result.user_id == id ? result.isFriend = false : "";
                        stateSearch.value.push(result);
                    })
                    useFriendshipStore().$patch({
                        friends: stateFriends.value,
                        searchResults: stateSearch.value,
                    });
                    resolve(response);

                }).catch(error => {
                    reject(error);
                    console.log(error);
                })
            })
        },
        searchUser: (search: string) => {
            useFriendshipStore().$patch((state: any) => {
                state.searchResults.splice(0, state.searchResults.length)
            });
            searchFriend(search).then((response: any) => {
                if (response.data.results) {
                    let state = ref([]);
                    if (useFriendshipStore().$state.friends.length > 0) {
                        response.data.results.map((item: any) => {
                            useFriendshipStore().$state.friends.map((friend: any) => {
                                friend.user_id == item.user_id ? item.isFriend = true : "";
                            })
                            useFriendshipStore().$state.invitSendedTo.map((invit: any) => {
                                item.user_id == invit.id ? item.pending = true : "";
                            })
                            useAuthStore().$state.user.user_id !== item.user_id ? state.value.push(item) : "";
                        })
                        useFriendshipStore().$patch({
                            searchResults: state.value,
                        });
                    } else {
                        response.data.results.map((item: any) => {
                            useFriendshipStore().$state.invitSendedTo.map((invit: any) => {
                                item.user_id == invit.id ? item.pending = true : "";
                            })
                            useAuthStore().$state.user.user_id !== item.user_id ? state.value.push(item) : "";
                        })
                    };
                    useFriendshipStore().$patch({
                        searchResults: state.value,
                    });
                }
            }).catch(error => {
                console.log(error);
            })
        },
        sendFriendRequest: (user_id: number) => {
            return new Promise((resolve, reject) => {
                addFriend(user_id).then((response: any) => {
                    console.log(response);
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
                    let state = ref([]);
                    response.data.results.map((item: never) => {
                        state.value.push(item);
                    });
                    useFriendshipStore().$patch({
                        invitSendedTo: response.data.results,
                    });
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        }
    }
});