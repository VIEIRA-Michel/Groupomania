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
                response.data.data = response.data.data.map((item: any) => {
                    store.$patch((state: FriendshipState) => {
                        state.friends.push(item);
                        state.isLoading = false;
                    });
                });
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
                    let state = ref([]);
                    store.$state.requests.map((item: any) => {
                        if (item.sender !== req.sender) {
                            state.value.push(item);
                        } else {
                            store.$patch({
                                friends: [...store.$state.friends,
                                {
                                    id: req.sender,
                                    firstname: req.firstname,
                                    lastname: req.lastname,
                                    picture_url: req.picture_url,
                                    email: req.email,
                                }
                                ],
                            })
                        }
                    })
                    store.$patch({
                        requests: state.value,
                    });
                }

            }).catch(error => {
                console.log(error);
                if (error.response.status === 403) {
                    useAuthStore().logout();
                }
            })
        },
        removeFriend: (friend_id: number) => {
            axios({
                method: 'delete',
                url: `http://localhost:3000/api/friends/${friend_id}`,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                // const store = useFriendshipStore();
                // let updateFriends = store.$state.friends.filter(item => {
                //     return item.publication_id !== id;
                // }
                // );
                // store.$patch({
                //     friends: updateFriends
                // });
            }).catch(error => {
                console.log(error);
                if (error.response.status === 403) {
                    useAuthStore().logout();
                }
            });
        },
    }
});