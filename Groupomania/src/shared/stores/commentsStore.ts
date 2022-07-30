import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import type { Comment } from '../interfaces/comment.interface';

interface CommentState {
    isLoading: boolean;
    numberOfPages: number;
    comments: Comment[];
}

export const useCommentsStore = defineStore({
    id: "comment",
    state: (): CommentState => ({
        comments: [] as Comment[],
        isLoading: true,
        numberOfPages: 1,
    }),
    getters: {
        commentsList: (state: CommentState) => state.comments,
    },
    actions: {
        getAllComments: (id: number, limit: number, from: number) => {
            const store = useCommentsStore();
            axios({
                method: 'get',
                url: `http://localhost:3000/api/publications/${id}/comments/?limit=${limit}&from=${from}`,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                console.log('response', response);
                if(store.$state.comments) {
                    store.$patch({
                        comments: [...store.$state.comments, response.data.comments],
                    });
                } else {
                    store.$patch({
                        comments: response.data.comments,
                    });
                }
            }).catch(error => {
                console.log(error);
            });

        },
    },
});