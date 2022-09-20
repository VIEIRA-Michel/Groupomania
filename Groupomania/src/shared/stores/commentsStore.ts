import { usePublicationsStore } from './publicationsStore';
import { defineStore } from 'pinia';
import { fetchComments, fetchCountOfComments, removeComment, addComment } from '../services/comments.service';
import { ref } from 'vue';
import socket from '../../socket';
import moment from 'moment';
import { useAuthStore } from './authStore';

interface CommentState {
    isLoading: boolean;
}

export const useCommentsStore = defineStore({
    id: "comment",
    state: (): CommentState => ({
        isLoading: true
    }),
    getters: {
    },
    actions: {
        beforeGetComments: (publication: any) => {
            if (!publication.displayComments) {
                usePublicationsStore().$state.publications.map((item: any) => {
                    if (item.publication_id == publication.publication_id) {
                        useCommentsStore().getAllComments(publication.publication_id, item.limit, item.from).then((response: any) => {
                            usePublicationsStore().$patch((state: any) => {
                                state.publications.map((post: any) => {
                                    if (post.publication_id == publication.publication_id) {
                                        post.displayComments = true;
                                    }
                                    return post;
                                })
                            })
                        })

                    }
                })
            } else {
                usePublicationsStore().$patch((state: any) => {
                    state.publications.map((item: any) => {
                        if (item.publication_id == publication.publication_id) {
                            item.displayComments = false;
                            item.comments.splice(0, item.comments.length);
                            item.limit = 5;
                            item.from = 0;
                            return item;
                        }
                    })
                })
            }
        },
        getAllComments: (id: number, limit: number, from: number) => {
            return new Promise((resolve, reject) => {
                let date = new Date();
                let newDate = moment(date).format('DD/MM/YYYY HH:mm:ss');
                let newDateSplit = newDate.split(" ");
                fetchComments(id, limit, from).then((response: any) => {
                    console.log(response);
                    if (response.comments.length > 0) {
                        response.comments.map((comment: any) => {
                            let commentDate = moment(comment.comment_created_at).format('DD/MM/YYYY à HH:mm').split(" ");
                            if (commentDate[0] == newDateSplit[0]) {
                                commentDate[0] = "Aujourd'hui";
                            } else if (parseInt(commentDate[0]) == parseInt(newDateSplit[0]) - 1) {
                                commentDate[0] = "Hier";
                            } else if (parseInt(commentDate[0]) == parseInt(newDateSplit[0]) - 2) {
                                commentDate[0] = "Avant-hier";
                            }
                            comment.comment_created_at = commentDate.join(" ");
                        })
                        usePublicationsStore().$patch((state: any) => {
                            state.publications.map((post: any) => {
                                if (post.publication_id == response.comments[0].publication_id) {
                                    response.comments.map((comment: any) => {
                                        console.log(comment);
                                        post.comments.find((item: any) => item.comment_id == comment.comment_id) ? "" : post.comments.push(comment);
                                    })
                                }
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
        getnumberOfComments: (id: number) => {
            fetchCountOfComments(id).then((response: any) => {
                usePublicationsStore().$state.publications.map((publication: any) => {
                    if (publication.publication_id === id) {
                        publication.numberOfComments = response.data
                    }
                })
            }).catch(error => {
                console.log(error);
            })
        },
        deleteComment: (publication_id: number, id: number) => {
            removeComment(publication_id, id).then((response: any) => {
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
                socket.emit('delete comment', { publication_id, id }, useAuthStore().$state.user);
            }).catch(error => {
                console.log(error);
            })
        },
        createComment: (publication_id: number, comment: string) => {
            console.log(publication_id);
            return new Promise((resolve, reject) => {
                let date = new Date();
                let newDate = moment(date).format('DD/MM/YYYY HH:mm:ss');
                let newDateSplit = newDate.split(" ");
                addComment(publication_id, comment).then((response: any) => {
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
                    socket.emit('has commented', { comment: obj.value, user: useAuthStore().$state.user });
                    usePublicationsStore().$patch((state: any) => {
                        state.publications.map((publication: any) => {
                            if (publication.publication_id === publication_id) {
                                if (publication.comments.find((comment: any) => comment.comment_id == response.data.data[0].comment_id)) {
                                    console.log('comment already exists');
                                } else {
                                    publication.comments.unshift(obj.value)
                                    publication.numberOfComments = publication.numberOfComments! + 1;
                                }
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
        getMoreComments: (publication: any) => {
            usePublicationsStore().$patch((state: any) => {
                state.publications.map((item: any) => {
                    if (item.publication_id == publication.publication_id) {
                        item.from = item.from + item.limit;
                        item.limit = item.limit + item.limit;
                        item.comments.length >= item.from ? useCommentsStore().getAllComments(publication.publication_id, item.limit, item.from) : null;
                    }
                    return item;
                })
            })
        },
        onComment: (data: any) => {
            usePublicationsStore().$patch((state: any) => {
                state.publications.map((item: any) => {
                    if (item.publication_id == data.comment.publication_id) {
                        item.comments.unshift(data.comment);
                        item.numberOfComments = item.numberOfComments + 1;
                    }
                    return item;
                });
            });
        },
        onDeleteComment: (data: any) => {
            usePublicationsStore().$patch((state: any) => {
                state.publications.map((item: any) => {
                    if (item.publication_id == data.publication_id) {
                        item.comments = item.comments.filter((itemComment: any) => {
                            return itemComment.comment_id != data.id;
                        });
                        console.log(item);
                        item.numberOfComments = item.numberOfComments - 1;
                    }
                    return item;
                });
            })
        }
    }
});