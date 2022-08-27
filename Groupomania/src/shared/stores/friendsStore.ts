import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';


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
            axios({
                method: 'get',
                url: 'http://localhost:3000/api/friends/requests',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
            }).then(response => {
                response.data.data == undefined ?
                    useFriendshipStore().$patch({
                        requests: [],
                        numOfResults: 0,
                        numberOfPages: 1,
                    }) :
                    response.data.data = response.data.data.map((item: any) => {
                        useFriendshipStore().$patch((state: FriendshipState) => {
                            state.requests.push(item);
                            state.isLoading = false;
                        });
                    });
            }).catch(error => {
                error.response.status === 403 ? useAuthStore().logout() : "";
                console.log(error);
            })
        },
        getAllFriends: (id?: number) => {
            return new Promise((resolve, reject) => {
                let BASE_URL = "";
                id ? BASE_URL = `http://localhost:3000/api/friends/${id}` : BASE_URL = 'http://localhost:3000/api/friends/';
                axios({
                    method: 'get',
                    url: BASE_URL,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                }).then(response => {
                    let userToCompare = 0;
                    let newFriend = ref({
                        user_id: 0,
                        picture_url: '',
                        firstname: '',
                        lastname: '',
                    });
                    id ? userToCompare = id : userToCompare = useAuthStore().$state.user.user_id;
                    response.data.results.map((item: any) => {
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
                        id ?
                            useFriendshipStore().$patch((state: FriendshipState) => {
                                state.friendsOfUser.push(newFriend.value);
                                state.isLoading = false;
                            }) :
                            useFriendshipStore().$patch((state: FriendshipState) => {
                                state.friends.push(newFriend.value);
                                state.isLoading = false;
                            });
                    })
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    error.response.status === 403 ? useAuthStore().logout() : "";
                    reject(error);
                })
            })
        },
        acceptOrDeclineRequest: (req: any, answer: string) => {
            axios({
                method: 'put',
                url: `http://localhost:3000/api/friends/requests/${req.sender}`,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                data: {
                    response: answer
                }
            }).then(response => {
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
                                id: req.sender,
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

            }).catch(error => {
                error.response.status === 403 ? useAuthStore().logout() : "";
                console.log(error);
            })
        },
        removeFriend: (id: number) => {
            axios({
                method: 'delete',
                url: `http://localhost:3000/api/friends/${id}`,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
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
            }).catch(error => {
                error.response.status === 403 ? useAuthStore().logout() : "";
                console.log(error);
            })
        },
        searchUser: (search: string) => {
            useFriendshipStore().$patch({
                searchResults: [],
            });
            axios({
                method: 'get',
                url: `http://localhost:3000/api/friends/search/?search=${search}`,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
            }).then(response => {
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
                error.response.status === 403 ? useAuthStore().logout() : "";
                console.log(error);
            })
        },
        sendFriendRequest: (user_id: number) => {
            axios({
                method: 'post',
                url: `http://localhost:3000/api/friends/search/${user_id}`,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                useFriendshipStore().$state.searchResults.map((item: any) => {
                    item.user_id == user_id ? item.pending = true : "";
                    return item;
                });
            }).catch(error => {
                error.response.status === 403 ? useAuthStore().logout() : "";
                console.log(error);
            })
        },
        cancelRequest: (user_id: number) => {
            axios({
                method: 'delete',
                url: `http://localhost:3000/api/friends/search/${user_id}`,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                let state = ref([]);
                useFriendshipStore().$state.searchResults.map((item: any) => {
                    if (item.user_id == user_id) {
                        item.pending = false;
                        state.value.push(item);
                    }
                    item.user_id !== user_id ? state.value.push(item) : "";
                });
                useFriendshipStore().$patch({
                    searchResults: state.value,
                });
            }).catch(error => {
                error.response.status === 403 ? useAuthStore().logout() : "";
                console.log(error);
            })
        },
        checkRequestsSended: () => {
            axios({
                method: 'get',
                url: `http://localhost:3000/api/friends/requests/sended`,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                let state = ref([]);
                response.data.results.map((item: never) => {
                    state.value.push(item);
                });
                useFriendshipStore().$patch({
                    invitSendedTo: response.data.results,
                });
            }).catch(error => {
                error.response.status === 403 ? useAuthStore().logout() : "";
                console.log(error);
            })
        }
    }
});