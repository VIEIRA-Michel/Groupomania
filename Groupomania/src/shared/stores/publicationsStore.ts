import { useCommentsStore } from './commentsStore';
import { defineStore } from 'pinia';
import { fetchPublications, addPublication, fetchCountOfPublication, editPublication, removePublication, fetchLikes, likeAndDislike } from '../services/publications.service';
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
    },
    actions: {
        addNewPublication: (content?: any, picture?: any) => {
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
                    addPublication(formData).then((response: any) => {
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
                            limit: 5,
                            from: 0
                        });
                        usePublicationsStore().$patch((state: any) => {
                            if (state.publications.length == 5) {
                                state.cache.unshift(state.publications.pop());
                            }
                            if (state.numOfResults == undefined) {
                                state.numOfResults = 0;
                            }
                            state.numOfResults += 1;
                            state.publications.unshift(publication.value);
                            if (state.numberOfPages == undefined) {
                                state.numberOfPages = 1;
                            }
                            state.numberOfPages = Math.floor(state.numOfResults / 5 - 0.2) + 1;
                            if (state.page == undefined) {
                                state.page = 1;
                            }
                        })
                        socket.emit('new publication', publication);
                        resolve(response);
                    }).catch(error => {
                        console.log(error);
                        reject(error);
                    })
                }
            })
        },
        fetchAllPublication: (page?: number, cache?: boolean) => {
            return new Promise((resolve, reject) => {
                fetchPublications(page).then((response: any) => {
                    console.log(response);
                    let date = new Date();
                    let newDate = moment(date).format('DD/MM/YYYY HH:mm:ss');
                    let newDateSplit = newDate.split(" ");
                    if (response.Publications) {
                        response.Publications.map((publication: any) => {
                            usePublicationsStore().getLikes(publication.publication_id);
                            useCommentsStore().getnumberOfComments(publication.publication_id);
                            let publicationDate = moment(publication.publication_created).format('DD/MM/YYYY à HH:mm').split(" ");
                            if (publicationDate[0] == newDateSplit[0]) {
                                publicationDate[0] = "Aujourd'hui";
                            } else if (parseInt(publicationDate[0]) == parseInt(newDateSplit[0]) - 1) {
                                publicationDate[0] = "Hier";
                            } else if (parseInt(publicationDate[0]) == parseInt(newDateSplit[0]) - 2) {
                                publicationDate[0] = "Avant-hier";
                            };
                            if (!cache) {
                                usePublicationsStore().$patch((state: any) => {
                                    state.publications.push({
                                        ...publication,
                                        editMode: false,
                                        menu: false,
                                        displayComments: false,
                                        likes: [],
                                        comments: [],
                                        numberOfComments: 0,
                                        publication_date: publicationDate.join(" "),
                                        limit: 5,
                                        from: 0,
                                    })
                                })
                            } else {
                                usePublicationsStore().$patch((state: any) => {
                                    state.cache.push({
                                        ...publication,
                                        editMode: false,
                                        menu: false,
                                        displayComments: false,
                                        likes: [],
                                        comments: [],
                                        numberOfComments: 0,
                                        publication_date: publicationDate.join(" "),
                                        limit: 5,
                                        from: 0,
                                    });
                                    state.isLoading = false;
                                })
                            }
                        });
                    } else {
                        usePublicationsStore().$patch((state: any) => {
                            state.publications.splice(0, state.publications.length);
                            state.numberOfPages = 1;
                            state.isLoading = false;
                            state.numOfResults = 0;
                            if (state.cache.length > 0) {
                                state.cache.splice(0, state.cache.length)
                            }
                        })
                    }
                    usePublicationsStore().$patch((state: any) => {
                        state.isLoading = false;
                        if (!cache) {
                            state.numberOfPages = response.numOfPages;
                            state.numOfResults = response.numOfResults;
                            state.page = response.page;
                            if (state.cache.length > 0) {
                                state.cache.splice(0, state.cache.length)
                            }
                        }
                    })
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                });
            })
        },
        fetchCount: () => {
            return new Promise((resolve, reject) => {
                fetchCountOfPublication().then((response: any) => {
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error)
                })
            })
        },
        activateEditMode: (publication_id: number) => {
            usePublicationsStore().$patch((state: any) => {
                state.publications.map((publication: any) => {
                    if (publication.publication_id == publication_id) {
                        publication.editMode = true;
                    }
                })
            })
        },
        updatePublication: (id: number, update: any) => {
            let formData = new FormData();
            update.content ? formData.append('content', update.content) : "";
            update.picture ? formData.append('picture', update.picture) : "";
            editPublication(id, formData).then((response: any) => {
                usePublicationsStore().$patch((state: any) => {
                    state.publications.map((item: any) => {
                        if (item.publication_id == id) {
                            item.content = response.data.data[0].content;
                            item.picture = response.data.data[0].picture;
                            item.editMode = false;
                        }
                    })
                })
                socket.emit('edit publication', response.data.data[0]);
            }).catch(error => {
                console.log(error);
            })
        },
        deletePublication: (id: number) => {
            return new Promise((resolve, reject) => {
                removePublication(id).then((response: any) => {
                    usePublicationsStore().$patch((state: any) => {
                        state.publications.map((item: any) => {
                            if (item.publication_id == id) {
                                state.publications.splice(state.publications.indexOf(item), 1);
                            }
                        });
                        state.numOfResults = state.numOfResults - 1;
                        if (state.numberOfPages != 1 && state.publications.length == 0) {
                            state.page -= 1;
                        } else if (state.numberOfPages != 1 && state.publications.length != 5) {
                            state.publications.push(state.cache.shift());
                            state.numberOfPages = Math.floor(state.numOfResults / 5 - 0.2) + 1;
                        };
                    })
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        },
        getLikes: (id: number) => {
            fetchLikes(id).then((response: any) => {
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
            return new Promise((resolve, reject) => {
                likeAndDislike(id).then((response: any) => {
                    const user: any = useAuthStore().$state.user;
                    usePublicationsStore().$patch((state: any) => {
                        state.publications.map((item: any) => {
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
                        })
                    })
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        },
        resetPublicationsAndCache: () => {
            usePublicationsStore().$patch((state: any) => {
                state.publications.splice(0, state.publications.length);
                state.cache.splice(0, state.cache.length);
            })
        },
        displayMenu: (publication: any) => {
            usePublicationsStore().$patch((state: any) => {
                state.publications.map((item: any) => {
                    if (item.publication_id == publication.publication_id) {
                        item.menu = !item.menu;
                    } else {
                        item.menu = false;
                    }
                    return item;
                })
            })
        },
    }
});