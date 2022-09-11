import { useCommentsStore } from './commentsStore';
import { defineStore } from 'pinia';
import axios from 'axios';
import type { Publication } from '../interfaces/publication.interface';
import { useAuthStore } from '../stores/authStore';
import socket from "../../socket";
import { ref } from 'vue';
import moment from 'moment';


interface PublicationState {
    publications: Publication[];
    isLoading: boolean;
    numOfResults: number;
    numberOfPages: number;
    page: number;
    cache: Publication[];
}

export const usePublicationsStore = defineStore({
    id: "publication",
    state: (): PublicationState => ({
        publications: [] as Publication[],
        isLoading: true,
        numOfResults: 0,
        numberOfPages: 1,
        page: 1,
        cache: [] as Publication[],
    }),
    getters: {
        publicationList: (state: PublicationState) => state.publications
        // likeList: (state: PublicationState) => state.publications.map(publication => publication.likes),
    },
    actions: {
        createPublication: (content?: any, picture?: any) => {
            return new Promise((resolve, reject) => {
                let date = new Date();
                let newDate = moment(date).format('DD/MM/YYYY HH:mm:ss');
                let newDateSplit = newDate.split(" ");
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
                    }).then((response: any) => {
                        console.log(response);
                        let publicationDate = moment(response.data.data[0].publication_created).format('DD/MM/YYYY à HH:mm').split(" ");
                        if (publicationDate[0] == newDateSplit[0]) {
                            publicationDate[0] = "Aujourd'hui";
                        } else if (parseInt(publicationDate[0]) == parseInt(newDateSplit[0]) - 1) {
                            publicationDate[0] = "Hier";
                        } else if (parseInt(publicationDate[0]) == parseInt(newDateSplit[0]) - 2) {
                            publicationDate[0] = "Avant-hier";
                        }
                        let publication = ref({
                            publication_id: response.data.data[0].publication_id,
                            user_id: response.data.data[0].user_id,
                            content: response.data.data[0].content,
                            picture: response.data.data[0].picture,
                            created_at: response.data.data[0].publication_created,
                            updated_at: null,
                            publication_date: publicationDate.join(" "),
                            likes: [],
                            comments: [],
                            menu: false,
                            displayComments: false,
                            editMode: false,
                            numberOfComments: 0,
                            firstname: useAuthStore().$state.user.firstname,
                            lastname: useAuthStore().$state.user.lastname,
                            email: useAuthStore().$state.user.email,
                            picture_url: useAuthStore().$state.user.picture_url,
                        });
                        // usePublicationsStore().$patch((state: any) => {
                        //     if (state.publications.length == 5) {
                        //         state.cache = state.publications.pop();
                        //     }
                        //     state.numOfResults += 1;
                        //     state.publications.unshift(publication.value);
                        // })
                        socket.emit('new publication', publication);
                        resolve(publication);
                    }).catch(error => {
                        console.log(error);
                        reject(error);
                    })
                };
            })
        },
        getAllPublications: (page?: number) => {
            console.log(page);
            return new Promise((resolve, reject) => {
                let date = new Date();
                let newDate = moment(date).format('DD/MM/YYYY HH:mm:ss');
                let newDateSplit = newDate.split(" ");
                let BASE_URL = "";
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
                    console.log(response);
                    if (response.data.Publications) {
                        response.data.Publications = response.data.Publications.map((publication: any) => {
                            usePublicationsStore().getLikes(publication.publication_id);
                            useCommentsStore().getnumberOfComments(publication.publication_id);
                            let publicationDate = moment(publication.publication_created).format('DD/MM/YYYY à HH:mm').split(" ");
                            if (publicationDate[0] == newDateSplit[0]) {
                                publicationDate[0] = "Aujourd'hui";
                            } else if (parseInt(publicationDate[0]) == parseInt(newDateSplit[0]) - 1) {
                                publicationDate[0] = "Hier";
                            } else if (parseInt(publicationDate[0]) == parseInt(newDateSplit[0]) - 2) {
                                publicationDate[0] = "Avant-hier";
                            }

                            return {
                                editMode: false,
                                menu: false,
                                displayComments: false,
                                likes: [],
                                comments: [],
                                numberOfComments: 0,
                                publication_date: publicationDate.join(" "),
                                limit: 5,
                                from: 0,
                                ...publication,
                            }
                        });
                    }
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        },
        getNumberOfPublications: (id: number) => {
            return new Promise((resolve, reject) => {
                axios({
                    method: 'get',
                    url: `http://localhost:3000/api/publications/count/${id}`,
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }).then(response => {
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
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
                socket.emit('edit publication', response.data.data[0]);
                usePublicationsStore().getAllPublications();
            }).catch(error => {
                console.log(error);
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
                    usePublicationsStore().$patch((state: any) => {
                        state.publications = updatePublications;
                        state.numOfResults -= 1;
                    });
                    resolve(response);
                }).catch(error => {
                    console.log(error);
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
                // console.log(response)
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
                            socket.emit('like', {
                                publication_id: id,
                                user_id: useAuthStore().$state.user.user_id
                            });
                        } else {
                            item.likes = item.likes.filter((item: any) => {
                                return item.user_id !== user.user_id;
                            });
                            item.iLike = false;
                            socket.emit('remove like', {
                                publication_id: id,
                                user_id: useAuthStore().$state.user.user_id
                            })
                        }
                    }
                });
            }).catch(error => {
                console.log(error);
            })
        }
    }
});