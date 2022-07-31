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
                for (let comment of response.data.comments) {
                    com.value = comment;
                    if (store.$state.comments) {
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
        deleteComment: (publication_id: number, id: number) => {
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
        },
        createComment: (publication_id: number, comment: string) => {
            const store = useCommentsStore();
            axios({
                method: 'post',
                url: `http://localhost:3000/api/publications/${publication_id}/comments`,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`
                },
                data: {
                    "content": comment
                },
            }).then(response => {
                console.log('response', response);
                let obj = ref({
                    account_disabled: response.data.data[0].account_disabled,
                    comment_content: response.data.data[0].comment_content,
                    comment_created_at: response.data.data[0].comment_created_at,
                    comment_id: response.data.data[0].comment_id,
                    comment_publication_id: response.data.data[0].comment_publication_id,
                    comment_user_id: response.data.data[0].comment_user_id,
                    email: response.data.data[0].email,
                    firstname: response.data.data[0].firstname,
                    lastname: response.data.data[0].lastname,
                    picture: response.data.data[0].picture,
                    publication_content: response.data.data[0].publication_content,
                    publication_created: response.data.data[0].publication_created,
                    publication_id: response.data.data[0].publication_id,
                    publication_updated_at: response.data.data[0].publication_updated_at,
                    role_id: response.data.data[0].role_id,
                    user_id: response.data.data[0].user_id,
                });
                if (!store.$state.comments) {
                    store.$patch({
                        comments: [obj.value]
                    });
                } else {
                    store.$patch({
                        comments: [...store.$state.comments, obj.value]
                    })
                }
            }).catch(error => {
                console.log(error);
            }
            );

        },
    }
});