import { useCommentsStore } from './commentsStore';
import { defineStore } from 'pinia';
import { fetchPublications, addPublication, fetchCountOfPublication, editPublication, removePublication, fetchLikes, likeAndDislike, getHistory } from '../services/publications.service';
import type { Publication } from '../interfaces/publication.interface';
import { useAuthStore } from '../stores/authStore';
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
        // Cette fonction va nous permettre de créer une nouvelle publication
        addNewPublication: (content?: any, picture?: any) => {
            return new Promise((resolve, reject) => {
                // On crée un formData afin de transmettre les informations de la publication au backend
                let formData = new FormData();
                // On ajoute les informations de la publication au formData en vérifiant quelles informations sont présentes
                if (content != null && picture != null) {
                    formData.append('content', content);
                    formData.append('picture', picture);
                } else if (picture != null && content == null) {
                    formData.append('picture', picture);
                } else if (content != null && picture == null) {
                    formData.append('content', content);
                }
                // Et seulement si l'un des deux champs est rempli, on envoie la publication au backend
                if (content || picture) {
                    addPublication(formData).then((response: any) => {
                        // Si tout s'est bien passé, on recupère la date et l'heure de la publication et on change le format afin qu'il soit plus lisible
                        let publicationDate = moment(response.data.data[0].publication_created).format('DD/MM/YYYY à HH:mm').split(" ");
                        publicationDate[0] = "Aujourd'hui";
                        // On crée un objet avec toutes les informations concernant la publication venant d'être crée
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
                            cache: [],
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
                            // Si le state qui contient les publications possède déjà 5 publications nous allons supprimer la dernière publication et l'ajouter au cache
                            if (state.publications.length == 5) {
                                state.cache.unshift(state.publications.pop());
                            }
                            //Dans le cas où le state de numOfResults serait à undefined on va le définir à 0 afin qu'il n'y est pas de problème lorsqu'un utilisateur où nous, publierons une nouvelle publication
                            if (state.numOfResults == undefined) {
                                state.numOfResults = 0;
                            }
                            // On incrémente ensuite la valeur de numOfResults afin qu'elle corresponde au nombre de publications
                            state.numOfResults += 1;
                            // On ajoute la nouvelle publication au début du state publications
                            state.publications.unshift(publication.value);
                            // Si le nombre de page est à undefined on le défini à 1
                            if (state.numberOfPages == undefined) {
                                state.numberOfPages = 1;
                            }
                            // On applique un calcul afin de définir le nombre de pages automatiquement en fonction du nombre de publications
                            state.numberOfPages = Math.floor(state.numOfResults / 5 - 0.2) + 1;
                            // Si le state comprenant la page actuelle est à undefined on le défini à 1
                            if (state.page == undefined) {
                                state.page = 1;
                            }
                        })
                        resolve(publication);
                    }).catch(error => {
                        console.log(error);
                        // Dans le cas où le code erreur est le 429 cela signifie qu'un trop grand nombre de requête a été émise et donc 
                        // on va déclencher la fonction modifiant certaines valeurs du state permettant l'affichage de la modal d'avertissement
                        if (error.response.status == 429) {
                            useAuthStore().displayWarning(error.response.data);
                        };
                        reject(error);
                    })
                }
            })
        },
        // Cette fonction va nous permettre de récupérer l'historique de modification d'une publication
        fetchHistoryOfEdit: (publication_id: number) => {
            return new Promise((resolve, reject) => {
                // On crée une variable avec la date et l'heure du jour
                let date = new Date();
                let newDate = moment(date).format('DD/MM/YYYY HH:mm:ss');
                let newDateSplit = newDate.split(" ");
                // On envoie une requête au backend afin de récupérer l'historique des modifications de la publication
                getHistory(publication_id).then((response: any) => {
                    // Si tout s'est bien passé, nous allons réinitialiser le state contenant l'historique des modifications de la publication
                    usePublicationsStore().$patch((state: any) => {
                        state.history.splice(0, state.history.length);
                        // Parcourir les données reçues afin de changer le format de la date et de l'heure afin qu'il soit plus lisible
                        response.data.history.forEach((item: any) => {
                            let editDate = moment(item.created_at).format('DD/MM/YYYY à HH:mm').split(" ");
                            if (editDate[0] == newDateSplit[0]) {
                                editDate[0] = "Aujourd'hui";
                            } else if (parseInt(editDate[0]) == parseInt(newDateSplit[0]) - 1) {
                                editDate[0] = "Hier";
                            } else if (parseInt(editDate[0]) == parseInt(newDateSplit[0]) - 2) {
                                editDate[0] = "Avant-hier";
                            }
                            // Et ajouter ensuite chaque modification de la publication au state contenant l'historique des modifications
                            state.history.push({
                                ...item,
                                edit_date: editDate.join(" "),
                            })
                        });
                    })
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    // Dans le cas où le code erreur est le 429 cela signifie qu'un trop grand nombre de requête a été émise et donc 
                    // on va déclencher la fonction modifiant certaines valeurs du state permettant l'affichage de la modal d'avertissement
                    if (error.response.status == 429) {
                        useAuthStore().displayWarning(error.response.data);
                    };
                    reject(error);
                })
            })
        },
        // Cette fonction va nous permettre de récupérer toutes les publications de nos amis ainsi que les nôtre
        fetchAllPublication: (page?: number, cache?: boolean) => {
            return new Promise((resolve, reject) => {
                // On exécute la requête permettant de récupérer les publications
                fetchPublications(page).then((response: any) => {
                    // Si tout s'est bien passé, nous allons crée une variable à la date et l'heure du jour
                    let date = new Date();
                    let newDate = moment(date).format('DD/MM/YYYY HH:mm:ss');
                    let newDateSplit = newDate.split(" ");
                    // Si des résultats ont été récupérés grâce à la requête
                    if (response.Publications) {
                        // Nous allons parcourir les résultats
                        response.Publications.map((publication: any) => {
                            // Exécuter la fonction permettant la récupération des likes de la publication
                            usePublicationsStore().getLikes(publication.publication_id);
                            // Exécuter la fonction permettant la récupération du nombre de commentaires présents dans la publication
                            useCommentsStore().getnumberOfComments(publication.publication_id);
                            let publicationEdit: any = null;
                            // Si la publication a été modifiée, nous allons récupérer la date de la modification
                            if (publication.updated_at) {
                                // Puis nous allons changer le format de la date de la modification afin qu'il soit plus lisible
                                publicationEdit = moment(publication.updated_at).format('DD/MM/YYYY à HH:mm').split(" ");
                                if (publicationEdit[0] == newDateSplit[0]) {
                                    publicationEdit[0] = "Aujourd'hui";
                                } else if (parseInt(publicationEdit[0]) == parseInt(newDateSplit[0]) - 1) {
                                    publicationEdit[0] = "Hier";
                                } else if (parseInt(publicationEdit[0]) == parseInt(newDateSplit[0]) - 2) {
                                    publicationEdit[0] = "Avant-hier";
                                }
                            }
                            // Nous allons ensuite changer le format de la date de création afin qu'il soit plus lisible
                            let publicationDate = moment(publication.publication_created).format('DD/MM/YYYY à HH:mm').split(" ");
                            if (publicationDate[0] == newDateSplit[0]) {
                                publicationDate[0] = "Aujourd'hui";
                            } else if (parseInt(publicationDate[0]) == parseInt(newDateSplit[0]) - 1) {
                                publicationDate[0] = "Hier";
                            } else if (parseInt(publicationDate[0]) == parseInt(newDateSplit[0]) - 2) {
                                publicationDate[0] = "Avant-hier";
                            };
                            // Si le cache ne contient pas de données, nous allons ajouter les publications récupérées directement dans le state contenant les publications
                            if (!cache) {
                                usePublicationsStore().$patch((state: any) => {
                                    state.publications.push({
                                        ...publication,
                                        editMode: false,
                                        menu: false,
                                        displayComments: false,
                                        likes: [],
                                        comments: [],
                                        cache: [],
                                        numberOfComments: 0,
                                        publication_date: publicationDate.join(" "),
                                        publication_edit: publicationEdit ? publicationEdit.join(" ") : null,
                                        limit: 5,
                                        from: 0,
                                        previewOnEdit: null,
                                    })
                                })
                                // Si le cache contient des données, nous allons ajouter les publications récupérées dans le state cache
                            } else {
                                usePublicationsStore().$patch((state: any) => {
                                    state.cache.push({
                                        ...publication,
                                        editMode: false,
                                        menu: false,
                                        displayComments: false,
                                        likes: [],
                                        comments: [],
                                        cache: [],
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
                        usePublicationsStore().$patch((state: any) => {
                            // Indiquer que le chargement des publications est terminé
                            state.isLoading = false;
                            // Et si le cache ne contient aucune données
                            if (!cache) {
                                // Si dans la réponse reçue de la requête il nous a été retourné le nombre de page total
                                if (response.numOfPages) {
                                    // On va ajouter ce nombre de page total au state contenant le nombre de page total
                                    state.numberOfPages = response.numOfPages;
                                }
                                // Si dans la réponse reçue de la requête il nous a été retourné le nombre de publications total
                                if (response.numOfResults) {
                                    // On va ajouter ce nombre de publications total au state contenant le nombre de publications total
                                    state.numOfResults = response.numOfResults;
                                }
                                // Si dans la réponse reçue de la requête il nous a été retourné le numéro de la page
                                if (response.page) {
                                    // On va ajouter ce numéro de page au state contenant le numéro de la page
                                    state.page = response.page;
                                }
                                // Et dans le cas sait-on jamais où le cache contient des données
                                if (state.cache.length > 0) {
                                    // Nous allons supprimer les données du cache
                                    state.cache.splice(0, state.cache.length)
                                }
                            }
                        })
                        // Si aucune publication n'a pu être récupérée
                    } else {
                        usePublicationsStore().$patch((state: any) => {
                            // Nous allons réinitialiser différentes valeurs
                            state.publications.splice(0, state.publications.length);
                            // On initialise la valeur du nombre de page à 1
                            state.numberOfPages = 1;
                            // Terminer le chargement
                            state.isLoading = false;
                            // On initialise la valeur du nombre de publications à 0
                            state.numOfResults = 0;
                            // Dans le cas où le cache comporte des données, nous allons réinitialiser le cache
                            if (state.cache.length > 0) {
                                state.cache.splice(0, state.cache.length)
                            }
                        })
                    }
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    // Dans le cas où le code erreur est le 429 cela signifie qu'un trop grand nombre de requête a été émise et donc 
                    // on va déclencher la fonction modifiant certaines valeurs du state permettant l'affichage de la modal d'avertissement
                    if (error.response.status == 429) {
                        useAuthStore().displayWarning(error.response.data);
                    };
                    reject(error);
                });
            })
        },
        // Cette fonction va nous permettre de connaître le nombre total de publications
        fetchCount: () => {
            return new Promise((resolve, reject) => {
                // On va exécuter la requête permettant de récupérer le nombre de publications
                fetchCountOfPublication().then((response: any) => {
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    // Dans le cas où le code erreur est le 429 cela signifie qu'un trop grand nombre de requête a été émise et donc 
                    // on va déclencher la fonction modifiant certaines valeurs du state permettant l'affichage de la modal d'avertissement
                    if (error.response.status == 429) {
                        useAuthStore().displayWarning(error.response.data);
                    };
                    reject(error)
                })
            })
        },
        activateEditMode: (publication_id: number, operation?: string) => {
            return new Promise<void>((resolve, reject) => {
                usePublicationsStore().$patch((state: any) => {
                    // On va parcourir les publications
                    state.publications.map((publication: any) => {
                        // Si l'id d'une publication correspond à l'id de la publication sur laquelle on a cliqué  et que l'on désire annuler la modification
                        if (publication.publication_id == publication_id && operation == 'deactivate') {
                            // On va passer la valeur de l'attribut editMode à false afin de fermer le mode édition de la publication
                            publication.editMode = false;
                            // Dans le cas où l'id d'une publication correspond à l'id de la publication sur laquelle on a cliqué et qu'on ne lui passe aucune autre instruction
                        } else if (publication.publication_id == publication_id) {
                            // On passe la publication en mode édition
                            publication.editMode = true;
                        } else {
                            // Dans le cas où l'id d'une publication ne correspond pas à l'id de la publication sur laquelle on a cliqué on ferme le mode édition 
                            // Afin de ne pas avoir plusieurs publications en mode édition en même temps
                            publication.editMode = false;
                        }
                    })
                })
                resolve();
            })
        },
        // Cette fonction sert à prévisualiser une image lors de la modification d'une publication
        previewMode: (publication_id: number, file: Blob) => {
            return new Promise<void>((resolve, reject) => {
                usePublicationsStore().$patch((state: any) => {
                    // On va parcourir les publications
                    state.publications.map((publication: any) => {
                        // Si l'id d'une publication correspond à l'id de la publication sur laquelle on désire change l'image de la publication
                        if (publication.publication_id == publication_id) {
                            // On va placer l'image dans la propriété previewOnEdit de la publication afin d'avoir une prévisualisation de l'image sélectionnée
                            publication.previewOnEdit = file;
                        }
                    })
                })
                resolve();
            })
        },
        // Cette fonction sert à annuler la prévisualisation d'une image lors de la modification d'une publication
        resetPreview: (publication_id: number) => {
            return new Promise<void>((resolve, reject) => {
                usePublicationsStore().$patch((state: any) => {
                    // On va parcourir les publications
                    state.publications.map((publication: any) => {
                        // Si l'id d'une publication correspond à l'id de la publication sur laquelle on désire annuler la prévisualisation de l'image
                        if (publication.publication_id == publication_id) {
                            // On réinitialise la valeur de la propriété previewOnEdit de la publication
                            publication.previewOnEdit = null;
                        }
                    })
                })
                resolve();
            })
        },
        // Cette fonction va nous servir à mettre à jour une publication
        updatePublication: (id: number, update: any) => {
            return new Promise((resolve, reject) => {
                // On crée un objet FormData afin de pouvoir envoyer des données de type fichier
                let formData = new FormData();
                // On va crée une variable contenant la date et l'heure du jour
                let date = new Date();
                // Et changer son format afin de le rendre plus lisible
                let publicationEdit = moment(date).format('DD/MM/YYYY à HH:mm').split(" ");
                publicationEdit[0] = "Aujourd'hui";
                // On va vérifier les différents champs de l'objet update afin de savoir si l'utilisateur a modifié la valeur de ces champs
                // Et appliqué les valeurs présentes dans l'objet update à l'objet formData
                update.content ? formData.append('content', update.content) : "";
                update.picture ? formData.append('picture', update.picture) : "";
                // Exécuter la requête permettant de modifier une publication en transmettant l'id de la publication et le formData contenant les données à modifier
                editPublication(id, formData).then((response: any) => {
                    usePublicationsStore().$patch((state: any) => {
                        // Si tout s'est bien passé on va parcourir les publications
                        state.publications.map((item: any) => {
                            // Si l'id d'une publication correspond à l'id de la publication modifiée
                            if (item.publication_id == id) {
                                // On va mettre à jour les données de la publication
                                item.content = response.data.data[0].content;
                                item.picture = response.data.data[0].picture;
                                item.editMode = false;
                                item.menu = false;
                                item.publication_edit = publicationEdit.join(" ");
                            }
                        })
                    })
                    // On va également mettre à jour les données de la publication dans les notifications afin de toujours reconnaître les notifications qui sont liées à cette publication
                    useOtherStore().$patch((state: any) => {
                        state.notifications.map((item: any) => {
                            if (item.publication_id == id) {
                                item.publication_content = response.data.data[0].content;
                                item.publication_picture = response.data.data[0].picture;
                            }
                            return item;
                        })
                    })
                    resolve({ ...response.data.data[0], publication_edit: publicationEdit.join(" ") });
                }).catch(error => {
                    console.log(error);
                    // Dans le cas où le code erreur est le 429 cela signifie qu'un trop grand nombre de requête a été émise et donc 
                    // on va déclencher la fonction modifiant certaines valeurs du state permettant l'affichage de la modal d'avertissement
                    if (error.response.status == 429) {
                        useAuthStore().displayWarning(error.response.data);
                    };
                    reject(error)
                })
            })
        },
        // Cette fonction va nous servir à supprimer une publication
        deletePublication: (id: number) => {
            return new Promise((resolve, reject) => {
                // On va exécuter la requête permettant de supprimer une publication en transmettant l'id de la publication
                removePublication(id).then((response: any) => {
                    usePublicationsStore().$patch((state: any) => {
                        // Si tout s'est bien passé on va parcourir les publications
                        for (let i = 0; i < state.publications.length; i++) {
                            // Si l'id d'une publication correspond à l'id de la publication que l'on souhaite supprimée
                            if (state.publications[i].publication_id == id) {
                                // On va supprimer la publication du state
                                state.publications.splice(i, 1);
                            }
                        }
                        // On réduit le nombre de publications de 1
                        state.numOfResults = state.numOfResults - 1;
                        // S'il y a plus de 1 page et que le nombre de publications est égal à 0
                        if (state.numberOfPages != 1 && state.publications.length == 0) {
                            // On est redirigé vers la page précédente
                            state.page -= 1;
                            // S'il y a plus de 1 page et que le nombre de publications est différent de 5
                        } else if (state.numberOfPages != 1 && state.publications.length != 5) {
                            // Et qu'il y a des publications dans le cache
                            if (state.cache.length > 0) {
                                // On va ajouter la première publication du cache à la fin de la liste des publications
                                state.publications.push(state.cache.shift());
                            }
                            // Et calculer ensuite le nombre de page selon le nombre de publications
                            state.numberOfPages = Math.floor(state.numOfResults / 5 - 0.2) + 1;
                        };
                    })
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    if (error.response.status == 429) {
                        useAuthStore().displayWarning(error.response.data);
                    };
                    reject(error);
                })
            })
        },
        // Cette fonction va nous permettre de réinitialiser les données contenant l'historique de modification 
        // afin de pouvoir réutiliser la fonctionnalité permettant la récupération de l'historique de modification
        resetHistory: () => {
            usePublicationsStore().$patch((state: any) => {
                state.history.splice(0, state.history.length);
            })
        },
        // Cette fonction va nous permettre de récupérer les likes d'une publication
        getLikes: (id: number) => {
            // On exécute la requête permettant de récupérer les likes d'une publication
            fetchLikes(id).then((response: any) => {
                // Si tout s'est bien passé
                usePublicationsStore().$patch((state: any) => {
                    // On va parcourir les publications
                    state.publications.map((item: any) => {
                        // Si l'id d'une publication correspond à l'id de la publication dont on veut récupérer les likes
                        if (item.publication_id == id) {
                            // On va parcourir le tableau des résultats de la requête
                            response.data.data.forEach((element: any) => {
                                // Et ajouter les likes à la publication
                                item.likes.push(element);
                                // Et dans le cas où notre id fait parti des likes on va mettre à jour la valeur de la propriété iLike afin d'indiquer 
                                // que  nous avons aimé également cette publication
                                if (element.user_id == useAuthStore().$state.user.user_id) {
                                    item.iLike = true;
                                }
                            });
                        }
                    })
                });
            }).catch(error => {
                console.log(error);
                // Dans le cas où le code erreur est le 429 cela signifie qu'un trop grand nombre de requête a été émise et donc 
                // on va déclencher la fonction modifiant certaines valeurs du state permettant l'affichage de la modal d'avertissement
                if (error.response.status == 429) {
                    useAuthStore().displayWarning(error.response.data);
                };
            })
        },
        likePublication: (id: number) => {
            return new Promise((resolve, reject) => {
                // On exécute la requête permettant de liker une publication
                likeAndDislike(id).then((response: any) => {
                    usePublicationsStore().$patch((state: any) => {
                        // Si tout s'est bien passé on va parcourir les publications
                        state.publications.map((item: any) => {
                            // Si l'id d'une publication correspond à l'id de la publication que l'on vient de liker
                            if (item.publication_id == id) {
                                // Si la réponse reçu est true cela signifie que l'on vient de liker la publication
                                if (response.data.liked) {
                                    item.likes.push({ ...useAuthStore().$state.user, like_id: response.data.results.insertId });
                                    item.iLike = true;
                                    // Sinon cela signifie que l'on vient de retirer notre like
                                } else {
                                    item.likes.splice(item.likes.indexOf(item.likes.find((element: any) => element.user_id == useAuthStore().$state.user.user_id)), 1);
                                    item.iLike = false;
                                }
                            }
                        })
                    })
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    // Dans le cas où le code erreur est le 429 cela signifie qu'un trop grand nombre de requête a été émise et donc 
                    // on va déclencher la fonction modifiant certaines valeurs du state permettant l'affichage de la modal d'avertissement
                    if (error.response.status == 429) {
                        useAuthStore().displayWarning(error.response.data);
                    };
                    reject(error);
                })
            })
        },
        // Cette fonction va nous permettre de réinitialiser toutes les valeurs du state 
        resetPublicationsAndCache: () => {
            usePublicationsStore().$reset();
        },
        // Cette fonction va nous permettre d'afficher le menu avec les boutons de modification et de suppression d'une publication
        displayMenu: (publication: any) => {
            usePublicationsStore().$patch((state: any) => {
                // On va parcourir les publications
                state.publications.map((item: any) => {
                    // Si l'id d'une publication correspondant à l'id de la publication dont on veut afficher le menu
                    if (item.publication_id == publication.publication_id) {
                        item.menu = !item.menu;
                        // Dans le cas contraire on va cacher le menu de toutes les autres publications afin de ne pas avoir plusieurs menus affichés en même temps
                    } else {
                        item.menu = false;
                    }
                    return item;
                })
            })
        },
        // Cette fonction va nous permettre de changer de page
        changePage: (operation: string) => {
            usePublicationsStore().$patch((state: any) => {
                // Selon l'opération passé en paramètre on va incrémenter ou décrémenter la valeur de la page
                if (operation == 'next') {
                    state.page++
                } else if (operation == 'previous') {
                    state.page--
                }
            })
        },
        // Cette fonction s'exécute à la réception d'un évènement de type 'like' émis par le serveur socket.io
        onLike: (data: any) => {
            usePublicationsStore().$patch((state: any) => {
                // On va parcourir les publications
                state.publications.map((item: any) => {
                    // Si l'id d'une publication correspond à l'id de la publication dont on vient de recevoir un like
                    if (item.publication_id == data.publication.publication_id) {
                        // On va vérifier si l'utilisateur qui a liké la publication n'est pas déjà présent dans le tableau des likes
                        if (item.likes.find((like: any) => like.user_id !== data.user.user_id) || item.likes.length == 0) {
                            // S'il n'est pas présent on va ajouter l'utilisateur dans le tableau des likes
                            item.likes.push({
                                ...data.user,
                                like_id: data.publication.like_id,
                                publication_id: data.publication.publication_id,
                            });
                        }
                    }
                    return item;
                })
            })
        },
        // Cette fonction s'exécute à la réception d'un évènement de type 'remove like' émis par le serveur socket.io
        onRemoveLike: (data: any) => {
            usePublicationsStore().$patch((state: any) => {
                // On va parcourir les publications
                state.publications.map((item: any) => {
                    // Si l'id d'une publication correspond à l'id de la publication dont on vient de recevoir un retrait de like
                    if (item.publication_id == data.publication.publication_id) {
                        // On va parcourir le tableau des likes de la publication
                        for (let i = 0; i < item.likes.length; i++) {
                            // Si l'user_id d'un like correspond à l'user_id de l'utilisateur qui a retiré son like
                            if (item.likes[i].user_id == data.user.user_id) {
                                // On va supprimer le like de l'utilisateur dans le tableau des likes
                                item.likes.splice(i, 1);
                            }
                        }
                    }
                    return item;
                })
            });
        },
        // Cette fonction s'exécute à la réception d'un évènement de type 'new publication' émis par le serveur socket.io
        onNewPublication: (data: any) => {
            useFriendshipStore().$patch((state: any) => {
                // On va vérifier si l'utilisateur qui a publié une nouvelle publication fait partie de nos amis
                state.friends.map((item: any) => {
                    // Si l'user_id d'un ami correspond à l'user_id de l'utilisateur qui a publié une nouvelle publication
                    if (item.user_id == data.publication._value.user_id) {
                        usePublicationsStore().$patch((state: any) => {
                            // Et que le nombre de publication présent sur la page est égal a 5
                            if (state.publications.length == 5) {
                                // On va transférer la dernière publication dans le cache
                                state.cache.unshift(state.publications.pop());
                            }
                            // Si la valeur du nombre de publications est égal à undefined
                            if (state.numOfResults == undefined) {
                                // On va l'initialiser à 0 afin de pouvoir l'incrémenter par la suite
                                state.numOfResults = 0;
                            }
                            // Puis on va incrémenter la valeur du nombre de publications
                            state.numOfResults += 1;
                            // Et ajouter la nouvelle publication au début de notre liste de publications
                            state.publications.unshift(data.publication._value);
                            // Si le nombre de pages est égal à undefined
                            if (state.numberOfPages == undefined) {
                                // On va l'initialiser à 0 afin de pouvoir l'incrémenter par la suite
                                state.numberOfPages = 1;
                            }
                            // Et calculer ensuite le nombre de page selon le nombre de publications divisé par 5
                            // On ajoute 1 au nombre de pages car on commence à compter à partir de 1
                            state.numberOfPages = Math.floor(state.numOfResults / 5 - 0.2) + 1;
                            // On va vérifier si la valeur de la page où nous somme est undefined 
                            if (state.page == undefined) {
                                // Si c'est le cas on l'initialise à 1 afin de pouvoir l'incrémenter ou la décrémenter par la suite
                                // pour naviguer entre les pages
                                state.page = 1;
                            }
                        });
                    }
                })
            })
        },
        // Cette fonction s'exécute à la réception d'un évènement de type 'edit publication' émis par le serveur socket.io
        onEditPublication: (data: any) => {
            console.log(data);
            usePublicationsStore().$patch((state: any) => {
                // On va parcourir les publications
                state.publications.map((item: any) => {
                    // Si l'id d'une publication correspond à l'id de la publication dont on vient de recevoir une modification
                    if (item.publication_id == data.publication_id) {
                        // On va modifier le contenu de la publication
                        item.content = data.content;
                        item.picture = data.picture;
                        item.publication_edit = data.publication_edit;
                    }
                    return item;
                });
            });
        },
        // Cette fonction s'exécute à la réception d'un évènement de type 'delete publication' émis par le serveur socket.io
        onDeletePublication: (data: any) => {
            usePublicationsStore().$patch((state: any) => {
                // On va parcourir les publications
                if (state.page < state.numberOfPages && state.cache.length == 0 && state.publications.length < state.numOfResults) {
                    // On récupère les publications de la page suivante s'il existe une page après celle sur laquelle nous sommes
                    usePublicationsStore().fetchAllPublication(state.page + 1, true).then((response: any) => {
                        // Puis on parcours les publications
                        for (let i = 0; i < state.publications.length; i++) {
                            // Si l'id d'une publication correspond à l'id de la publication dont on vient de recevoir une suppression
                            if (state.publications[i].publication_id == data.publication.publication_id) {
                                // On va supprimer la publication de la liste des publications
                                state.publications.splice(i, 1);
                            }
                        }
                        // On réduit le nombre de publications de 1
                        state.numOfResults = state.numOfResults - 1;
                        // S'il y a plus de 1 page et que le nombre de publications est égal à 0
                        if (state.numberOfPages != 1 && state.publications.length == 0) {
                            // On est redirigé vers la page précédente
                            state.page -= 1;
                            // S'il y a plus de 1 page et que le nombre de publications est différent de 5
                        } else if (state.numberOfPages != 1 && state.publications.length != 5) {
                            // Et qu'il y a des publications dans le cache
                            if (state.cache.length > 0) {
                                // On va ajouter la première publication du cache à la fin de la liste des publications
                                state.publications.push(state.cache.shift());
                            }
                            // Et calculer ensuite le nombre de page selon le nombre de publications
                            state.numberOfPages = Math.floor(state.numOfResults / 5 - 0.2) + 1;
                        };
                    }).catch((error) => {
                        console.log(error);
                        // Dans le cas où le code erreur est le 429 cela signifie qu'un trop grand nombre de requête a été émise et donc 
                        // on va déclencher la fonction modifiant certaines valeurs du state permettant l'affichage de la modal d'avertissement
                        if (error.response.status == 429) {
                            useAuthStore().displayWarning(error.response.data);
                        };
                    })
                    // Si aucune page n'est présente après celle sur laquelle nous sommes
                } else {
                    // On parcours les publications
                    for (let i = 0; i < state.publications.length; i++) {
                        // Si l'id d'une publication correspond à l'id de la publication dont on vient de recevoir une suppression
                        if (state.publications[i].publication_id == data.publication.publication_id) {
                            // On va supprimer la publication de la liste des publications
                            state.publications.splice(i, 1);
                        }
                    }
                    // On réduit le nombre de publications de 1
                    state.numOfResults = state.numOfResults - 1;
                    // S'il y a plus de 1 page et que le nombre de publications est égal à 0
                    if (state.numberOfPages != 1 && state.publications.length == 0) {
                        // On est redirigé vers la page précédente
                        state.page -= 1;
                        // S'il y a plus de 1 page et que le nombre de publications est différent de 5
                    } else if (state.numberOfPages != 1 && state.publications.length != 5) {
                        // Et qu'il y a des publications dans le cache
                        if (state.cache.length > 0) {
                            // On va ajouter la première publication du cache à la fin de la liste des publications
                            state.publications.push(state.cache.shift());
                        }
                        // Et calculer ensuite le nombre de page selon le nombre de publications
                        state.numberOfPages = Math.floor(state.numOfResults / 5 - 0.2) + 1;
                    };
                }
            })
        },
    }
});