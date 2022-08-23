import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
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
            const store = usePublicationsStore();
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
                    store.$reset();
                    store.getAllPublications();
                }).catch(error => {
                    console.log(error);
                    if (error.response.status === 403) {
                        useAuthStore().logout();
                    }
                })
            };
        },
        getAllPublications: (page?: number) => {
            const store = usePublicationsStore();
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
                        store.getLikes(publication.publication_id);
                        return {
                            editMode: false,
                            displayComments: false,
                            likes: [],
                            ...publication,
                        }
                    });
                    store.$patch({
                        publications: response.data.Publications,
                        numberOfPages: response.data.numOfPages,
                        isLoading: false,
                        numOfResults: response.data.numOfResults,
                    });
                }
                else {
                    store.$patch({
                        publications: [],
                        numberOfPages: 1,
                        isLoading: false,
                        numOfResults: 0,
                    });
                }
            }).catch(error => {
                console.log(error);
                if (error.response.status === 403) {
                    useAuthStore().logout();
                }
            });
        },
        updatePublication: (id: number, update: any) => {
            let formData = new FormData();
            formData.append('content', update.content);
            formData.append('picture', update.picture);
            const store = usePublicationsStore();
            axios({
                method: 'put',
                url: `http://localhost:3000/api/publications/${id}`,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                data: formData,
            }).then(response => {
                store.getAllPublications();
            }).catch(error => {
                console.log(error);
                if (error.response.status === 403) {
                    useAuthStore().logout();
                }
            });
        },
        deletePublication: (id: number) => {
            axios({
                method: 'delete',
                url: `http://localhost:3000/api/publications/${id}`,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                const store = usePublicationsStore();
                let updatePublications = store.$state.publications.filter(item => {
                    return item.publication_id !== id;
                }
                );
                store.$patch({
                    publications: updatePublications
                });
            }).catch(error => {
                console.log(error);
                if (error.response.status === 403) {
                    useAuthStore().logout();
                }
            });
        },
        getLikes: (id: number) => {
            const store = usePublicationsStore();
            axios({
                method: 'get',
                url: `http://localhost:3000/api/publications/${id}`,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                const authStore = useAuthStore();
                const user_id: any = authStore.$state.user.user_id;
                response.data.data = response.data.data.map((publication: any) => {
                    return {
                        user_id: publication.user_id,
                        lastname: publication.user_lastname,
                        firstname: publication.user_firstname,
                        // profil_picture: publication.picture,
                    };
                })

                let publication: any = store.$state.publications.map(item => {
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
                store.$patch({
                    publications: publication
                });
            }).catch(error => {
                console.log(error);
                if (error.response.status === 403) {
                    useAuthStore().logout();
                }
            });
        },
        likePublication: (id: number) => {
            const store = usePublicationsStore();
            axios({
                method: 'post',
                url: `http://localhost:3000/api/publications/${id}`,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`
                },
            }).then(response => {
                const authStore = useAuthStore();
                const user: any = authStore.$state.user;
                store.$state.publications.map((item: any) => {
                    if (item.publication_id == id) {
                        if(response.data.liked) {
                            item.likes.push(user);
                            item.iLike = true;
                            console.log(item.likes);
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
                if (error.response.status === 403) {
                    useAuthStore().logout();
                }
            });
        }
    }
});