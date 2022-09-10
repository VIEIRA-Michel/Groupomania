import { usePublicationsStore } from './publicationsStore';
import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import socket from '../../socket';
import moment from 'moment';

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
            return new Promise((resolve, reject) => {
                let date = new Date();
                let newDate = moment(date).format('DD/MM/YYYY HH:mm:ss');
                let newDateSplit = newDate.split(" ");
                axios({
                    method: 'get',
                    url: `http://localhost:3000/api/publications/${id}/comments/?limit=${limit}&from=${from}`,
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }).then(response => {
                    usePublicationsStore().$patch((state: any) => {
                        for (let comment of response.data.comments) {
                            state.publications.map((publication: any) => {
                                if (publication.publication_id === comment.publication_id) {
                                    let commentDate = moment(comment.comment_created_at).format('DD/MM/YYYY à HH:mm').split(" ");
                                    if (commentDate[0] == newDateSplit[0]) {
                                        commentDate[0] = "Aujourd'hui";
                                    } else if (parseInt(commentDate[0]) == parseInt(newDateSplit[0]) - 1) {
                                        commentDate[0] = "Hier";
                                    } else if (parseInt(commentDate[0]) == parseInt(newDateSplit[0]) - 2) {
                                        commentDate[0] = "Avant-hier";
                                    }
                                    comment.comment_created_at = commentDate.join(" ");
                                    publication.numberOfComments = response.data.numOfResults;
                                    if (publication.comments.length > 0) {
                                        console.log(publication);
                                        publication.comments.map((commentPublication: any) => {
                                            console.log(commentPublication);
                                            if (commentPublication.comment_id !== comment.comment_id) {
                                                console.log(commentPublication.comment_id, comment.comment_id);
                                                publication.comments!.push(comment);
                                            }
                                        });
                                    } else {
                                        publication.comments!.push(comment);
                                    }
                                }
                            })
                        }
                    });
                    resolve(response);
                }).catch(error => {
                    error.response.status === 403 ? useAuthStore().logout() : "";
                    console.log(error);
                    reject(error);
                })
            })
        },
        getnumberOfComments: (id: number) => {
            axios({
                method: 'get',
                url: `http://localhost:3000/api/publications/${id}/comments/count`,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                usePublicationsStore().$state.publications.map((publication: any) => {
                    if (publication.publication_id === id) {
                        publication.numberOfComments = response.data.data
                    }
                })
            }).catch(error => {
                error.response.status === 403 ? useAuthStore().logout() : "";
                console.log(error);
            })
        },
        getCommentOfPublication: (id: number) => {
            let date = new Date();
            let newDate = moment(date).format('DD/MM/YYYY HH:mm:ss');
            let newDateSplit = newDate.split(" ");
            axios({
                method: 'get',
                url: `http://localhost:3000/api/publications/${id}/comments`,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                console.log(response);
                for (let comment of response.data.comments) {
                    usePublicationsStore().$state.publications.map((publication: any) => {
                        if (publication.publication_id === comment.publication_id) {
                            let commentDate = moment(comment.comment_created_at).format('DD/MM/YYYY à HH:mm').split(" ");
                            if (commentDate[0] == newDateSplit[0]) {
                                commentDate[0] = "Aujourd'hui";
                            } else if (parseInt(commentDate[0]) == parseInt(newDateSplit[0]) - 1) {
                                commentDate[0] = "Hier";
                            } else if (parseInt(commentDate[0]) == parseInt(newDateSplit[0]) - 2) {
                                commentDate[0] = "Avant-hier";
                            }
                            comment.comment_created_at = commentDate.join(" ");
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
                socket.emit('delete comment', { publication_id, id });
            }).catch(error => {
                error.response.status === 403 ? useAuthStore().logout() : "";
                console.log(error);
            })
        },
        createComment: (publication_id: number | undefined, comment: string) => {
            return new Promise((resolve, reject) => {
                let date = new Date();
                let newDate = moment(date).format('DD/MM/YYYY HH:mm:ss');
                let newDateSplit = newDate.split(" ");
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
                    console.log(response);

                    let commentDate = moment(response.data.data[0].comment_created_at).format('DD/MM/YYYY à HH:mm').split(" ");
                    if (commentDate[0] == newDateSplit[0]) {
                        commentDate[0] = "Aujourd'hui";
                    } else if (parseInt(commentDate[0]) == parseInt(newDateSplit[0]) - 1) {
                        commentDate[0] = "Hier";
                    } else if (parseInt(commentDate[0]) == parseInt(newDateSplit[0]) - 2) {
                        commentDate[0] = "Avant-hier";
                    }
                    commentDate.join(" ");

                    let obj = ref({
                        account_disabled: response.data.data[0].account_disabled,
                        comment_content: response.data.data[0].comment_content,
                        comment_created_at: commentDate.join(" "),
                        comment_id: response.data.data[0].comment_id,
                        comment_publication_id: response.data.data[0].comment_publication_id,
                        comment_user_id: response.data.data[0].comment_user_id,
                        email: response.data.data[0].email,
                        firstname: response.data.data[0].firstname,
                        lastname: response.data.data[0].lastname,
                        picture: response.data.data[0].picture,
                        picture_url: response.data.data[0].picture_url,
                        publication_content: response.data.data[0].publication_content,
                        publication_created: response.data.data[0].publication_created,
                        publication_id: response.data.data[0].publication_id,
                        publication_updated_at: response.data.data[0].publication_updated_at,
                        role_id: response.data.data[0].role_id,
                        user_id: response.data.data[0].user_id,
                    });
                    socket.emit('has commented', obj);
                    usePublicationsStore().$state.publications.map((publication: any) => {
                        if (publication.publication_id === publication_id) {
                            if (publication.comments.find((comment: any) => comment.comment_id == response.data.data[0].comment_id)) {
                                console.log('comment already exists');
                            } else {
                                publication.comments.push(obj.value)
                                publication.numberOfComments = publication.numberOfComments! + 1;
                            }
                        }
                    })
                    resolve(response);
                }).catch(error => {
                    error.response.status === 403 ? useAuthStore().logout() : "";
                    console.log(error);
                    reject(error);
                })
            })
        }
    }
});