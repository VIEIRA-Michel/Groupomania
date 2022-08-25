import { usePublicationsStore } from './publicationsStore';
import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';

interface CommentState {
    isLoading: boolean;
    limit: number;
    from: number
}

export const useCommentsStore = defineStore({
    id: "comment",
    state: (): CommentState => ({
        isLoading: true,
        limit: 5,
        from: 0
    }),
    getters: {
    },
    actions: {
        getAllComments: (id: number, limit: number, from: number) => {
            axios({
                method: 'get',
                url: `http://localhost:3000/api/publications/${id}/comments/?limit=${limit}&from=${from}`,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                for (let comment of response.data.comments) {
                    usePublicationsStore().$state.publications.map((publication) => {
                        if (publication.publication_id === comment.publication_id) {
                            publication.comments!.push(comment);
                            publication.numberOfComments = response.data.numOfResults;
                        }
                    })
                }
            }).catch(error => {
                error.response.status === 403 ? useAuthStore().logout() : "";
                console.log(error);
            })
        },
        deleteComment: (publication_id: number, id: number) => {
            axios({
                method: 'delete',
                url: `http://localhost:3000/api/publications/${publication_id}/comments/${id}`,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                let state = ref<any>();
                state.value = usePublicationsStore().$state.publications.map((publication: any) => {
                    if (publication.publication_id == publication_id) {
                        if (publication.comments!.length > 0) {
                            publication.numberOfComments = publication.numberOfComments! - 1;
                            publication.comments!.splice(publication.comments!.findIndex((item: any) => item.comment_id === id), 1);
                        }
                    }
                    return publication;
                });
            }).catch(error => {
                error.response.status === 403 ? useAuthStore().logout() : "";
                console.log(error);
            })
        },
        createComment: (publication_id: number | undefined, comment: string) => {
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
                usePublicationsStore().$state.publications.map((publication) => {
                    if (publication.publication_id === publication_id) {
                        publication.comments!.push(obj.value);
                        publication.numberOfComments = publication.numberOfComments! + 1;
                    }
                })
            }).catch(error => {
                error.response.status === 403 ? useAuthStore().logout() : "";
                console.log(error);
            })
        }
    }
});