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
                let com = ref();
                for(let comment of response.data.comments) {
                    com.value = comment;
                    if(store.$state.comments) {
                        store.$patch({
                            comments: [...store.$state.comments, com.value],
                        });
                    } else {
                        store.$patch({
                            comments: [com.value],
                        });
                    }
                }
            }).catch(error => {
                console.log(error);
            });

        },
        deleteComment: (publication_id:number, id: number) => {
            const store = useCommentsStore();
            axios({
                method: 'delete',
                url: `http://localhost:3000/api/publications/${publication_id}/comments/${id}`,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                let updateComments = store.$state.comments.filter(item => {
                    console.log('item', item);
                    return item.comment_id !== id;
                }
                );
                console.log(updateComments);
                store.$patch({
                    comments: updateComments
                });
            })
        }
    },
});