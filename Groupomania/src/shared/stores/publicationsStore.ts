import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import type { Publication } from '../interfaces/publication.interface';

interface PublicationState {
    isLoading: boolean;
    numberOfPages: number;
    publications: Publication[];
}

export const usePublicationsStore = defineStore({
    id: "publication",
    state: (): PublicationState => ({
        publications: [] as Publication[],
        isLoading: true,
        numberOfPages: 1,
    }),
    getters: {
        publicationList: (state: PublicationState) => state.publications,
    },
    actions: {
        createPublication: (inputValue: any) => {
            let formData = new FormData();
            // console.log(inputValue.picture);
            formData.append('content', inputValue.content);
            formData.append('picture', inputValue.picture);
            console.log(formData.get('content'));
            console.log(formData.get('picture'));
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
                    editMode: false,
                });
                console.log('voici obj', obj.value)
                if (!store.$state.publications) {
                    store.$patch({
                        publications: [obj.value]
                    });
                } else {
                    store.$patch({
                        publications: [...store.$state.publications, obj.value]
                    })
                }
                console.log(store.$state.publications)
            }).catch(error => {
                console.log(error);
            });
        },
        getAllPublications: (page: number) => {
            const store = usePublicationsStore();
            axios({
                method: 'get',
                url: `http://localhost:3000/api/publications/?page=${page}`,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }).then(response => {
                const store = usePublicationsStore();
                if (response.data.Publications) {
                    response.data.Publications = response.data.Publications.map((publication: any) => {
                        return {
                            editMode: false,
                            ...publication,
                        }
                    });
                    store.$patch({
                        publications: response.data.Publications,
                        numberOfPages: response.data.numOfPages,
                        isLoading: false,
                    });
                } else {
                    console.log(response.data.message);
                }
            }).catch(error => {
                console.log(error);
            });
        },
        updatePublication: (id: number, update: any) => {
            console.log('update:', update.content);
            let formData = new FormData();
            formData.append('content', update.content);
            formData.append('picture', update.picture);
            const store = usePublicationsStore();
            console.log(formData.get('content'));
            console.log(formData.get('picture'));
            axios({
                method: 'put',
                url: `http://localhost:3000/api/publications/${id}`,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                data: formData,
                // File: update.picture,
            }).then(response => {
                console.log('response', response)
                const store = usePublicationsStore();
                let updatePublications = store.$state.publications.map(item => {
                    if (item.publication_id == id) {
                        return update.content, update.picture;
                    }
                    return item;
                });
                store.$patch({
                    publications: updatePublications
                });
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
                console.log(updatePublications);
                store.$patch({
                    publications: updatePublications
                });
            })
        }
    }
});