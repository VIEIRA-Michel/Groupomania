import { useCommentsStore } from './commentsStore';
import { defineStore } from 'pinia';
import axios from 'axios';
import type { Publication } from '../interfaces/publication.interface';
import { useAuthStore } from '../stores/authStore';


interface PublicationState {
    publications: Publication[];
    isLoading: boolean;
    numOfResults: number;
    numberOfPages: number
}

export const usePublicationsStore = defineStore({
    id: "publication",
    state: (): PublicationState => ({
        publications: [] as Publication[],
        isLoading: true,
        numOfResults: 0,
        numberOfPages: 1
    }),
    getters: {
        publicationList: (state: PublicationState) => state.publications,
        likeList: (state: PublicationState) => state.publications.map(publication => publication.likes),
    },
    actions: {
        createPublication: (content?: any, picture?: any) => {
            let formData = new FormData();
            if (content != null && picture != null) {
                formData.append('content', content);
                formData.append('picture', picture);
            } else if (picture != null && content == null) {
                formData.append('picture', picture);
            } else if (content != null && picture == null) {
                formData.append('content', content);
            }
            if (content || picture) {
                axios({
                    method: 'post',
                    url: 'http://localhost:3000/api/publications',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    data: formData,
                }).then(response => {
                    usePublicationsStore().$reset();
                    usePublicationsStore().getAllPublications();
                }).catch(error => {
                    console.log(error);
                    error.response.status === 403 ? useAuthStore().logout() : "";
                })
            };
        },
        getAllPublications: (page?: number) => {
            let BASE_URL = ""
            if (page) {
                BASE_URL = `http://localhost:3000/api/publications/?page=${page}`;
            } else {
                BASE_URL = 'http://localhost:3000/api/publications';
            }
            axios({
                method: 'get',
                url: BASE_URL,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                if (response.data.Publications) {
                    response.data.Publications = response.data.Publications.map((publication: any) => {
                        usePublicationsStore().getLikes(publication.publication_id);
                        useCommentsStore().getAllComments(publication.publication_id, 5, 0);
                        return {
                            editMode: false,
                            menu: false,
                            displayComments: false,
                            likes: [],
                            comments: [],
                            numberOfComments: 0,
                            ...publication,
                        }
                    });
                    usePublicationsStore().$patch({
                        publications: response.data.Publications,
                        numberOfPages: response.data.numOfPages,
                        isLoading: false,
                        numOfResults: response.data.numOfResults,
                    });
                }
                else {
                    usePublicationsStore().$patch({
                        publications: [],
                        numberOfPages: 1,
                        isLoading: false,
                        numOfResults: 0,
                    });
                }
            }).catch(error => {
                console.log(error);
                error.response.status === 403 ? useAuthStore().logout() : "";
            })
        },
        updatePublication: (id: number, update: any) => {
            let formData = new FormData();
            update.post.content ? formData.append('content', update.post.content) : "";
            update.post.picture ? formData.append('picture', update.post.picture) : "";
            axios({
                method: 'put',
                url: `http://localhost:3000/api/publications/${id}`,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                data: formData,
            }).then(response => {
                usePublicationsStore().getAllPublications();
            }).catch(error => {
                console.log(error);
                error.response.status === 403 ? useAuthStore().logout() : "";
            })
        },
        deletePublication: (id: number) => {
            return new Promise((resolve, reject) => {
                axios({
                    method: 'delete',
                    url: `http://localhost:3000/api/publications/${id}`,
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }).then(response => {
                    let updatePublications = usePublicationsStore().$state.publications.filter(item => {
                        return item.publication_id !== id;
                    });
                    usePublicationsStore().$patch({
                        publications: updatePublications
                    });
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    error.response.status === 403 ? useAuthStore().logout() : "";
                    reject(error);
                })
            })
        },
        getLikes: (id: number) => {
            axios({
                method: 'get',
                url: `http://localhost:3000/api/publications/${id}`,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                const user_id: any = useAuthStore().$state.user.user_id;
                response.data.data = response.data.data.map((publication: any) => {
                    return {
                        user_id: publication.user_id,
                        lastname: publication.user_lastname,
                        firstname: publication.user_firstname,
                    };
                })

                let publication: any = usePublicationsStore().$state.publications.map(item => {
                    if (item.publication_id == id) {
                        for (let post of response.data.data) {
                            item.likes?.push(post);
                        }
                    };
                    let hasLiked = item.likes.map((item: any) => {
                        if (item.user_id == user_id) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                    if (hasLiked.includes(true)) {
                        item.iLike = true;
                    } else {
                        item.iLike = false;
                    }
                    return item;
                });
                usePublicationsStore().$patch({
                    publications: publication
                });
            }).catch(error => {
                console.log(error);
                error.response.status === 403 ? useAuthStore().logout() : "";
            })
        },
        likePublication: (id: number) => {
            axios({
                method: 'post',
                url: `http://localhost:3000/api/publications/${id}`,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`
                },
            }).then(response => {
                const user: any = useAuthStore().$state.user;
                usePublicationsStore().$state.publications.map((item: any) => {
                    if (item.publication_id == id) {
                        if (response.data.liked) {
                            item.likes.push(user);
                            item.iLike = true;
                        } else {
                            item.likes = item.likes.filter((item: any) => {
                                return item.user_id !== user.user_id;
                            });
                            item.iLike = false;
                        }
                    }
                });
            }).catch(error => {
                console.log(error);
                error.response.status === 403 ? useAuthStore().logout() : "";
            })
        }
    }
});