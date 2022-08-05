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
}

export const useFriendshipStore = defineStore({
    id: "friendship",
    state: (): FriendshipState => ({
        friends: [],
        requests: [],
        isLoading: true,
        numOfResults: 0,
        numberOfPages: 1,
    }),
    getters: {
        friendsList: (state: FriendshipState) => state.friends,
    },
    actions: {
        getRequests: () => {
            const store = useFriendshipStore();
            axios({
                method: 'get',
                url: 'http://localhost:3000/api/friends/requests',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
            }).then(response => {
                if (response.data.data == undefined) {
                    store.$patch({
                        requests: [],
                        numOfResults: 0,
                        numberOfPages: 1,
                    });
                } else {
                    response.data.data = response.data.data.map((item: any) => {
                        store.$patch((state: FriendshipState) => {
                            state.requests.push(item);
                            state.isLoading = false;
                        });
                    });
                }
            }).catch(error => {
                console.log(error);
                if (error.response.status === 403) {
                    useAuthStore().logout();
                }
            });
        },
        getAllFriends: () => {
            const store = useFriendshipStore();
            axios({
                method: 'get',
                url: 'http://localhost:3000/api/friends/',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
            }).then(response => {
                console.log(response.data.results);
                let newFriend = ref({
                    user_id: 0,
                    picture_url: '',
                    firstname: '',
                    lastname: '',
                });
                response.data.results.map((item: any) => {
                    console.log(item);
                    console.log(useAuthStore().$state.user.user_id);
                    if(useAuthStore().$state.user.user_id == item.sender_user_id) {
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
                    store.$patch((state: FriendshipState) => {
                        state.friends.push(newFriend.value);
                        state.isLoading = false;
                    });
                })
            }).catch(error => {
                console.log(error);
                if (error.response.status === 403) {
                    useAuthStore().logout();
                }

            })
        },
        acceptOrDeclineRequest: (req: any, answer: string) => {
            const store = useFriendshipStore();
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
                    store.$state.requests.map((item: any) => {
                        if (item.sender !== req.sender) {
                            state.value.push(item);
                        }
                    });
                    console.log(state);
                    store.$patch({
                        requests: state.value,
                    });
                } else {
                    let stateRequests = ref([]);
                    let stateFriends = ref([]);
                    store.$state.requests.map((item: any) => {
                        if (item.sender !== req.sender) {
                            stateRequests.value.push(item);
                        } else {
                            stateFriends.value.push({
                                id: req.sender,
                                firstname: req.firstname,
                                lastname: req.lastname,
                                picture_url: req.picture_url,
                                email: req.email,
                            });
                        }
                    })
                    console.log(stateFriends)
                    store.$patch({
                        requests: stateRequests.value,
                        friends: [...store.$state.friends, ...stateFriends.value],
                    });
                }

            }).catch(error => {
                console.log(error);
                if (error.response.status === 403) {
                    useAuthStore().logout();
                }
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
                console.log(response);
                const store = useFriendshipStore();
                let state = ref([]);
                store.$state.friends.map((item: any) => {
                    if (item.id !== id) {
                        state.value.push(item);
                    }
                });
                store.$patch({
                    friends: state.value,
                });
            }).catch(error => {
                console.log(error);
                if (error.response.status === 403) {
                    useAuthStore().logout();
                }
            });
        },
    }
});