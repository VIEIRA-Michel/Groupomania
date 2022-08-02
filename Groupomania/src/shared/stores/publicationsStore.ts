import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import type { Publication } from '../interfaces/publication.interface';

interface PublicationState {
    publications: Publication[];
    isLoading: boolean;
    numOfResults: number;
    numberOfPages: number;
}

export const usePublicationsStore = defineStore({
    id: "publication",
    state: (): PublicationState => ({
        publications: [] as Publication[],
        isLoading: true,
        numOfResults: 0,
        numberOfPages: 1,
    }),
    getters: {
        publicationList: (state: PublicationState) => state.publications,
    },
    actions: {
        createPublication: (inputValue: any) => {
            let formData = new FormData();
            formData.append('content', inputValue.content);
            formData.append('picture', inputValue.picture);
            axios({
                method: 'post',
                url: 'http://localhost:3000/api/publications',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                data: formData,
            }).then(response => {
                const store = usePublicationsStore();
                let obj = ref({
                    publication_id: response.data.data[0].publication_id,
                    content: response.data.data[0].content,
                    picture: response.data.data[0].picture,
                    user_id: response.data.data[0].user_id,
                    publication_created: response.data.data[0].publication_created,
                    updated_at: response.data.data[0].updated_at,
                    // editMode: false,
                });
                store.getAllPublications();
            }).catch(error => {
                console.log(error);
            });
        },
        getAllPublications: (page?: number) => {
            let BASE_URL = ""
            if (page) {
                BASE_URL = `http://localhost:3000/api/publications/?page=${page}`;
            } else {
                BASE_URL = 'http://localhost:3000/api/publications';
            }
            const store = usePublicationsStore();
            axios({
                method: 'get',
                url: BASE_URL,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                const store = usePublicationsStore();
                if (response.data.Publications) {
                    response.data.Publications = response.data.Publications.map((publication: any) => {
                        store.getLikes(publication.publication_id);
                        return {
                            // editMode: false,
                            // displayComments: false,
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
                } else {
                    console.log(response.data.message);
                }
                // console.log()
            }).catch(error => {
                console.log(error);
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
                    console.log('item', item.publication_id);
                    return item.publication_id !== id;
                }
                );
                store.$patch({
                    publications: updatePublications
                });
            }).catch(error => {
                console.log(error);
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
                    }
                    return item;
                });
                store.$patch({
                    publications: publication
                });
            }).catch(error => {
                console.log(error);
            });
        },
        likeOrDislike: (id: number, value?: number | string) => {
            console.log(value);
            if (value == '1' || value == 1) {
                console.log('like');
            } else {
                console.log('je retire mon like');
            }
            const store = usePublicationsStore();
            axios({
                method: 'post',
                url: `http://localhost:3000/api/publications/${id}`,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`
                },
                data: {
                    liked: value,
                },
            }).then(response => {
                store.getLikes(id);
            }).catch(error => {
                console.log(error);
            });
        }
    }
});