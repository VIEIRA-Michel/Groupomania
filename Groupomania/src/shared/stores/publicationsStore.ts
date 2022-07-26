import { defineStore } from 'pinia';
import axios from 'axios';


export interface Publication {
    id?: string;
    content: string;
    picture?: string;
    user_id: number;
    created_at?: string;
    updated_at?: string;
    // editMode: boolean;
    // done: boolean;
    publications : Array<Publication>;
    isLoading: boolean;
    numberOfPages: number;
}

export const usePublicationsStore = defineStore({
    id: "publication",
    state: () => ({
        publications: [],
        isLoading: true,
        numberOfPages: 1,
    }),
    getters: {
        publication: (state) => state.publications,
    },
    actions: {
        createPublication: (content:string, picture? : string) => {
            axios({
                method: 'post',
                url: 'http://localhost:3000/api/publications',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                data: {
                    content: content,
                    picture: picture,
                }
            }).then(response => {
                // console.log(response.data);
                const store = usePublicationsStore();
                let updatePublications = [...store.$state.publications, response.data]
                store.$patch({
                    publications: updatePublications
                })
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
                console.log('publication:', response.data);
                const store = usePublicationsStore();
                store.$patch({
                    publications: response.data.Publications,
                    numberOfPages: response.data.numOfPages,
                    isLoading: false,
                });
                return response.data.Publications;
            }).catch(error => {
                console.log(error);
            });
        },
    }
});
