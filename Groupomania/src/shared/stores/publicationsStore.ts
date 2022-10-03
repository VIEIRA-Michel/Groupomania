import { useCommentsStore } from './commentsStore';
import { defineStore } from 'pinia';
import { fetchPublications, addPublication, fetchCountOfPublication, editPublication, removePublication, fetchLikes, likeAndDislike, getHistory } from '../services/publications.service';
import type { Publication } from '../interfaces/publication.interface';
import { useAuthStore } from '../stores/authStore';
import socket from "../../socket";
import { ref } from 'vue';
import moment from 'moment';
import { useFriendshipStore } from './friendsStore';
import { useOtherStore } from './otherStore';


interface PublicationState {
    publications: Publication[];
    isLoading: boolean;
    numOfResults: number;
    numberOfPages: number;
    cache: Publication[];
    page: number;
    history: Publication[];
}

export const usePublicationsStore = defineStore({
    id: "publication",
    state: (): PublicationState => ({
        publications: [] as Publication[],
        isLoading: true,
        numOfResults: 0,
        numberOfPages: 1,
        cache: [] as Publication[],
        page: 1,
        history: [] as Publication[],
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
                            limit: 5,
                            from: 0,
                            previewOnEdit: null,
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
                        socket.emit('new publication', { publication, user: useAuthStore().$state.user });
                        resolve(response);
                    }).catch(error => {
                        console.log(error);
                        reject(error);
                    })
                }
            })
        },
        fetchHistoryOfEdit: (publication_id: number) => {
            return new Promise((resolve, reject) => {
                let date = new Date();
                let newDate = moment(date).format('DD/MM/YYYY HH:mm:ss');
                let newDateSplit = newDate.split(" ");
                getHistory(publication_id).then((response: any) => {
                    usePublicationsStore().$patch((state: any) => {
                        state.history.splice(0, state.history.length);
                        response.data.history.forEach((item: any) => {
                            let editDate = moment(item.created_at).format('DD/MM/YYYY à HH:mm').split(" ");
                            if (editDate[0] == newDateSplit[0]) {
                                editDate[0] = "Aujourd'hui";
                            } else if (parseInt(editDate[0]) == parseInt(newDateSplit[0]) - 1) {
                                editDate[0] = "Hier";
                            } else if (parseInt(editDate[0]) == parseInt(newDateSplit[0]) - 2) {
                                editDate[0] = "Avant-hier";
                            }
                            state.history.push({
                                ...item,
                                edit_date: editDate.join(" "),
                            })
                        });
                    })
                    console.log(response);
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                })
            })
        },
        fetchAllPublication: (page?: number, cache?: boolean) => {
            return new Promise((resolve, reject) => {
                fetchPublications(page).then((response: any) => {
                    let date = new Date();
                    let newDate = moment(date).format('DD/MM/YYYY HH:mm:ss');
                    let newDateSplit = newDate.split(" ");
                    if (response.Publications) {
                        response.Publications.map((publication: any) => {
                            usePublicationsStore().getLikes(publication.publication_id);
                            useCommentsStore().getnumberOfComments(publication.publication_id);
                            let publicationEdit: any = null;
                            if (publication.updated_at) {
                                publicationEdit = moment(publication.updated_at).format('DD/MM/YYYY à HH:mm').split(" ");
                                if (publicationEdit[0] == newDateSplit[0]) {
                                    publicationEdit[0] = "Aujourd'hui";
                                } else if (parseInt(publicationEdit[0]) == parseInt(newDateSplit[0]) - 1) {
                                    publicationEdit[0] = "Hier";
                                } else if (parseInt(publicationEdit[0]) == parseInt(newDateSplit[0]) - 2) {
                                    publicationEdit[0] = "Avant-hier";
                                }
                            }
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
                                        publication_edit: publicationEdit ? publicationEdit.join(" ") : null,
                                        limit: 5,
                                        from: 0,
                                        previewOnEdit: null,
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
                                        publication_edit: publicationEdit ? publicationEdit.join(" ") : null,
                                        limit: 5,
                                        from: 0,
                                        previewOnEdit: null,
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
                            if (response.numOfPages) {
                                state.numberOfPages = response.numOfPages;
                            }
                            if (response.numOfResults) {
                                state.numOfResults = response.numOfResults;
                            }
                            if (response.page) {
                                state.page = response.page;
                            }
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
        activateEditMode: (publication_id: number, operation?: string) => {
            return new Promise<void>((resolve, reject) => {
                usePublicationsStore().$patch((state: any) => {
                    state.publications.map((publication: any) => {
                        if (publication.publication_id == publication_id && operation == 'deactivate') {
                            publication.editMode = false;
                        } else if (publication.publication_id == publication_id) {
                            publication.editMode = true;
                        } else {
                            publication.editMode = false;
                        }
                    })
                })
                resolve();
            })
        },
        previewMode: (publication_id: number, file: Blob) => {
            return new Promise<void>((resolve, reject) => {
                usePublicationsStore().$patch((state: any) => {
                    state.publications.map((publication: any) => {
                        if (publication.publication_id == publication_id) {
                            publication.previewOnEdit = file;
                        }
                    })
                })
                resolve();
            })
        },
        resetPreview: (publication_id: number) => {
            return new Promise<void>((resolve, reject) => {
                usePublicationsStore().$patch((state: any) => {
                    state.publications.map((publication: any) => {
                        if (publication.publication_id == publication_id) {
                            publication.previewOnEdit = null;
                        }
                    })
                })
                resolve();
            })
        },
        updatePublication: (id: number, update: any) => {
            return new Promise((resolve, reject) => {
                let formData = new FormData();
                let date = new Date();
                let newDate = moment(date).format('DD/MM/YYYY HH:mm:ss');
                let newDateSplit = newDate.split(" ");
                update.content ? formData.append('content', update.content) : "";
                update.picture ? formData.append('picture', update.picture) : "";
                formData.get('picture');
                editPublication(id, formData).then((response: any) => {
                    usePublicationsStore().$patch((state: any) => {
                        state.publications.map((item: any) => {
                            if (item.publication_id == id) {
                                let publicationEdit: any = null;
                                publicationEdit = moment(date).format('DD/MM/YYYY à HH:mm').split(" ");
                                if (publicationEdit[0] == newDateSplit[0]) {
                                    publicationEdit[0] = "Aujourd'hui";
                                } else if (parseInt(publicationEdit[0]) == parseInt(newDateSplit[0]) - 1) {
                                    publicationEdit[0] = "Hier";
                                } else if (parseInt(publicationEdit[0]) == parseInt(newDateSplit[0]) - 2) {
                                    publicationEdit[0] = "Avant-hier";
                                }
                                item.content = response.data.data[0].content;
                                item.picture = response.data.data[0].picture;
                                item.editMode = false;
                                item.publication_edit = publicationEdit.join(" ");
                            }
                        })
                    })
                    useOtherStore().$patch((state: any) => {
                        state.notifications.map((item: any) => {
                            if (item.publication_id == id) {
                                item.publication_content = response.data.data[0].content;
                                item.publication_picture = response.data.data[0].picture;
                            }
                            return item;
                        })
                    })
                    resolve(response);
                    socket.emit('edit publication', response.data.data[0], useAuthStore().$state.user);
                }).catch(error => {
                    console.log(error);
                    reject(error)
                })
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
                            if (state.cache.length > 0) {
                                state.publications.push(state.cache.shift());
                            }
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
        resetHistory: () => {
            usePublicationsStore().$patch((state: any) => {
                state.history.splice(0, state.history.length);
            })
        },
        getLikes: (id: number) => {
            fetchLikes(id).then((response: any) => {
                const user_id: any = useAuthStore().$state.user.user_id;
                response.data.data = response.data.data.map((publication: any) => {
                    return {
                        user_id: publication.user_id,
                        lastname: publication.user_lastname,
                        firstname: publication.user_firstname,
                    };
                })

                let publication: any = usePublicationsStore().$state.publications.map((item: any) => {
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
            // usePublicationsStore().$patch((state: any) => {
            //     state.publications.splice(0, state.publications.length);
            //     state.cache.splice(0, state.cache.length);
            // })
            usePublicationsStore().$reset();
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
        changePage: (operation: string) => {
            usePublicationsStore().$patch((state: any) => {
                if (operation == 'next') {
                    state.page++
                } else if (operation == 'previous') {
                    state.page--
                }
            })
        },
        onLike: (data: any) => {
            usePublicationsStore().$patch((state: any) => {
                state.publications.map((item: any) => {
                    if (item.publication_id == data.publication.publication_id) {
                        if (item.likes.find((like: any) => like.user_id !== data.user.user_id) || item.likes.length == 0) {
                            item.likes.push(data.user);
                        }
                    }
                    return item;
                })
            })
        },
        onRemoveLike: (data: any) => {
            usePublicationsStore().$patch((state: any) => {
                state.publications.map((item: any) => {
                    if (item.publication_id == data.publication.publication_id) {
                        item.likes.map((like: any) => {
                            if (like.user_id == data.user.user_id) {
                                item.likes.splice(item.likes.indexOf(like), 1);
                            }
                            return like;
                        })
                    }
                    return item;
                })
            });
        },
        onNewPublication: (data: any) => {
            useFriendshipStore().$patch((state: any) => {
                state.friends.map((item: any) => {
                    if (item.user_id == data.publication._value.user_id) {
                        usePublicationsStore().$patch((state: any) => {
                            if (state.publications.length == 5) {
                                state.cache.unshift(state.publications.pop());
                            }
                            if (state.numOfResults == undefined) {
                                state.numOfResults = 0;
                            }
                            state.numOfResults += 1;
                            state.publications.unshift(data.publication._value);
                            if (state.numberOfPages == undefined) {
                                state.numberOfPages = 1;
                            }
                            state.numberOfPages = Math.floor(state.numOfResults / 5 - 0.2) + 1;
                            if (state.page == undefined) {
                                state.page = 1;
                            }
                        });
                    }
                })
            })
        },
        onEditPublication: (data: any) => {
            usePublicationsStore().$patch((state: any) => {
                state.publications.map((item: any) => {
                    if (item.publication_id == data.publication_id) {
                        item.content = data.content;
                        item.picture = data.picture;
                        item.updated_at = data.updated_at;
                    }
                    return item;
                });
            });
        },
        onDeletePublication: (data: any) => {
            console.log('on rentre la dedans ?');
            usePublicationsStore().$patch((state: any) => {
                state.publications.map((item: any) => {
                    if (item.publication_id == data) {
                        usePublicationsStore().fetchCount().then((response: any) => {
                            usePublicationsStore().$patch((state: any) => {
                                state.numOfResults = response.qty;
                                state.numberOfPages = Math.floor(state.numOfResults / 5 - 0.2) + 1;
                            })
                            let newValue = ref(0);
                            state.page.value < usePublicationsStore().$state.numberOfPages ? newValue.value = state.page.value + 1 : newValue.value = state.page.value;
                            if (usePublicationsStore().$state.cache.length > 0) {
                                usePublicationsStore().$patch((state: any) => {
                                    state.publications.map((item: any) => {
                                        if (item.publication_id == data) {
                                            state.publications.splice(state.publications.indexOf(item), 1);
                                            let tmp = ref(state.cache.shift());
                                            state.publications.find((item: any) => item.publication_id == tmp._value.publication_id) ? "" : state.publications.push(tmp._value);
                                        }
                                    })
                                })
                            } else {
                                usePublicationsStore().fetchAllPublication(newValue.value, true).then((response: any) => {
                                    usePublicationsStore().$patch((state: any) => {
                                        state.publications.map((item: any) => {
                                            if (item.publication_id == data) {
                                                state.publications.splice(state.publications.indexOf(item), 1);
                                            }
                                        });
                                        state.cache.map((item: any) => {
                                            if (item.publication_id == data) {
                                                state.cache.splice(state.cache.indexOf(item), 1);
                                            }
                                        })
                                        if (state.numberOfPages != 1 && state.publications.length == 0) {
                                            state.page -= 1;
                                        } else if (state.numberOfPages != 1 && state.publications.length != 5) {
                                            state.publications.push(state.cache.shift());
                                        };
                                    });
                                });
                            }
                        });
                    }
                })
            })
        },
    }
});