import { usePublicationsStore } from './publicationsStore';
import { defineStore } from 'pinia';
import { fetchComments, fetchCountOfComments, removeComment, addComment } from '../services/comments.service';
import { ref } from 'vue';
import moment from 'moment';
import { useAuthStore } from './authStore';

interface CommentState {
    isLoading: boolean;
}

export const useCommentsStore = defineStore({
    id: "comment",
    state: (): CommentState => ({
        isLoading: true,
    }),
    getters: {
    },
    actions: {
        // Cette fonction va permettre l'affichage des commentaires sous la publication
        beforeGetComments: (publication: any) => {
            // Dans le cas où la valeur de la propriété permettant l'affichage est à false
            if (!publication.displayComments) {
                // Nous allons parcourir le state contenant les publications
                usePublicationsStore().$state.publications.map((item: any) => {
                    // Si l'id d'une publication correspond avec les données reçues en paramètre de cette fonction
                    if (item.publication_id == publication.publication_id) {
                        // Nous allons déclencher la requête permettant la récupération d'une certaine quantité de commentaire concernant cette publication
                        useCommentsStore().getAllComments(publication.publication_id, item.limit, item.from, false).then((response: any) => {
                            usePublicationsStore().$patch((state: any) => {
                                // Et passer la valeur de la propriété permettant l'affichage des commentaires à true
                                item.displayComments = true;
                                return item;
                            })
                        }).catch((error) => {
                            // Dans le cas où le code erreur est le 429 cela signifie qu'un trop grand nombre de requête a été émise et donc 
                            // on va déclencher la fonction modifiant certaines valeurs du state permettant l'affichage de la modal d'avertissement
                            if (error.response.status == 429) {
                                useAuthStore().displayWarning(error.response.data);
                            };
                        })

                    }
                })
                // Dans le cas où la valeur de la propriété displayComments serait déjà à true, nous allons réinitialiser l'intégralité des propriétés 
                // concernant les commentaires et ne plus afficher les commentaires, afin qu'il ne soit possible que d'accéder aux commentaires d'une seule publication à la fois
            } else {
                usePublicationsStore().$patch((state: any) => {
                    state.publications.map((item: any) => {
                        if (item.publication_id == publication.publication_id) {
                            item.displayComments = false;
                            return item;
                        }
                    })
                })
            }
        },
        // Cette fonction va nous permettre de récupérer une certaine quantité de commentaires
        getAllComments: (id: number, limit: number, from: number, cache?: boolean) => {
            return new Promise((resolve, reject) => {
                // On crée une variable contenant la date du jour
                let date = new Date();
                let newDate = moment(date).format('DD/MM/YYYY HH:mm:ss');
                let newDateSplit = newDate.split(" ");
                // On exécute la requête transmettant l'information à l'api que nous souhaitons récupérer des commentaires
                fetchComments(id, limit, from).then((response: any) => {
                    // Si le tableau des résultats comportent au moins 1 élément
                    if (response.comments.length > 0) {
                        // On parcours le tableau des résultats
                        response.comments.map((comment: any) => {
                            // Nous allons à présent récupérer la date et l'heure de création des commentaires et les formater dans un format plus facilement lisible pour l'enregistrer par la suite dans une variable
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
                        if (!cache) {
                            usePublicationsStore().$patch((state: any) => {
                                // Nous allons ensuite parcourir le tableau contenant les différentes publications
                                state.publications.map((post: any) => {
                                    // Si une publication à le même publication_id que le commentaire en question
                                    if (post.publication_id == response.comments[0].publication_id) {
                                        // On parcours notre tableau de résultat et si le commentaire n'est pas déjà présent au sein de la publication on l'ajoute
                                        response.comments.map((comment: any) => {
                                            post.comments.find((item: any) => item.comment_id == comment.comment_id) ? "" : post.comments.unshift(comment);
                                        })
                                    }
                                })
                            })
                            // Dans le cas où cache est à true cela signifie que nous souhaitons stocker les commentaires dans le cache
                        } else {
                            usePublicationsStore().$patch((state: any) => {
                                for (let i = 0; i < state.publications.length; i++) {
                                    if (state.publications[i].publication_id == response.comments[0].publication_id) {
                                        for (let j = 0; j < response.comments.length; j++) {
                                            state.publications[i].cache.push(response.comments[j]);
                                        }
                                    }
                                }
                            })
                        }
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
                })
            })
        },
        // Cette fonction va nous permettre de récupérer le nombre de commentaires d'une publication
        getnumberOfComments: (id: number) => {
            // On exécute la requête transmettant l'ordre à l'api
            fetchCountOfComments(id).then((response: any) => {
                // Puis nous parcours ensuite le state comportant les différentes publications
                usePublicationsStore().$state.publications.map((publication: any) => {
                    // Si une publication a le même publication_id que celui passé en paramètre de cette fonction 
                    if (publication.publication_id === id) {
                        // On lui attribue le résultat de la requête
                        publication.numberOfComments = response.data
                    }
                })
            }).catch(error => {
                console.log(error);
                // Dans le cas où le code erreur est le 429 cela signifie qu'un trop grand nombre de requête a été émise et donc 
                // on va déclencher la fonction modifiant certaines valeurs du state permettant l'affichage de la modal d'avertissement
                if (error.response.status == 429) {
                    useAuthStore().displayWarning(error.response.data);
                };
            })
        },
        // Cette fonction va nous permettre de supprimer un commentaire
        deleteComment: (comment: any) => {
            // On exécute la requête transmettant l'information à l'api que nous désirons supprimer un commentaire
            removeComment(comment.publication_id, comment.comment_id).then((response: any) => {
                usePublicationsStore().$patch((state: any) => {
                    // On parcours à présent le state comportant les différentes publications
                    for (let i = 0; i < state.publications.length; i++) {
                        // Si une publication à le même publication_id qu'un commentaire
                        if (state.publications[i].publication_id == comment.publication_id) {
                            // On parcours la liste des commentaires
                            for (let j = 0; j < state.publications[i].comments.length; j++) {
                                // Si un commentaire à le même comment_id que le commentaire venant d'être supprimé
                                if (state.publications[i].comments[j].comment_id == comment.comment_id) {
                                    // On supprime le commentaire
                                    state.publications[i].comments.splice(j, 1);
                                    // Et on décrémente la valeur de numberOfComments
                                    state.publications[i].numberOfComments = state.publications[i].numberOfComments - 1;
                                }
                            }
                            // Si un élément est présent dans le cache
                            if (state.publications[i].cache.length > 0) {
                                // On supprime le premier élément dans le cache pour l'ajouter au début de la liste des commentaires
                                state.publications[i].comments.unshift(state.publications[i].cache.shift());
                            }
                        }
                    }
                })
            }).catch(error => {
                console.log(error);
                // Dans le cas où le code erreur est le 429 cela signifie qu'un trop grand nombre de requête a été émise et donc 
                // on va déclencher la fonction modifiant certaines valeurs du state permettant l'affichage de la modal d'avertissement
                if (error.response.status == 429) {
                    useAuthStore().displayWarning(error.response.data);
                };
            })
        },
        // Cette fonction va nous permettre d'ajouter un commentaire à une publication
        createComment: (publication_id: number, comment: string) => {
            return new Promise((resolve, reject) => {
                // On exécute la requête transmettant l'ordre à l'api afin d'ajouter un commentaire à la publication
                addComment(publication_id, comment).then((response: any) => {
                    // On récupère la date et l'heure du jour et on la formate pour la mettre à un format plus facilement lisible
                    let commentDate = moment(response.data.data[0].comment_created_at).format('DD/MM/YYYY à HH:mm').split(" ");
                    commentDate[0] = "Aujourd'hui";
                    commentDate.join(" ");

                    // On crée une variable comprenant l'ensemble des informations reçues du commentaire que l'on vient de créer
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
                        publication_picture: response.data.data[0].picture,
                        publication_created: response.data.data[0].publication_created,
                        publication_id: response.data.data[0].publication_id,
                        publication_updated_at: response.data.data[0].publication_updated_at,
                        role_id: response.data.data[0].role_id,
                        user_id: response.data.data[0].user_id,
                    });
                    usePublicationsStore().$patch((state: any) => {
                        // On parcours ensuite le state comportant les différentes publications
                        state.publications.map((publication: any) => {
                            // Si une publication a le même publication_id que les données reçues
                            if (publication.publication_id === publication_id) {
                                // On parcours les commentaires de la publication afin de savoir si le commentaire n'est pas déjà présent afin d'éviter les doublons
                                if (publication.comments.find((comment: any) => comment.comment_id == response.data.data[0].comment_id)) {
                                } else {
                                    // S'il n'est pas présent on l'ajoute à notre liste des commentaires sur la publication
                                    publication.comments.push(obj.value)
                                    // Et on incrémente la quantité de commentaire sur la publication
                                    publication.numberOfComments = publication.numberOfComments! + 1;
                                }
                            }
                        })
                    })
                    resolve(obj.value);
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
        // Cette fonction va nous permettre de récupérer d'avantages de commentaires
        getMoreComments: (publication_id: number) => {
            usePublicationsStore().$patch((state: any) => {
                // Nous allons parcourir le state comportant les publications
                state.publications.map((item: any) => {
                    // Vérifier si une publication a le même publication_id que les données reçues
                    if (item.publication_id == publication_id) {
                        // Si un élément est présent dans le cache
                        if (item.cache.length > 0) {
                            // On va parcourir le cache
                            for (let i = item.cache.length; i > 0; i--) {
                                // On va ajouter le premier élément du cache au début de la liste des commentaires
                                item.comments.unshift(item.cache.shift());
                            }
                            // Et on va déclencher la fonction permettant de récupérer d'avantages de commentaires
                            useCommentsStore().getAllComments(publication_id, 10 - item.cache.length, item.comments.length + item.cache.length, false);
                            // Dans le cas où aucun élément n'est présent dans le cache
                        } else {
                            // On va déclencher la fonction permettant de récupérer d'avantages de commentaires
                            useCommentsStore().getAllComments(publication_id, 10, item.comments.length, false);
                        }
                    }
                    return item;
                })
            })
        },
        // Cette fonction se déclenche lorsqu'un utilisateur commente une publication
        onComment: (data: any) => {
            usePublicationsStore().$patch((state: any) => {
                // On parcours notre state qui contient les différentes publications
                state.publications.map((item: any) => {
                    // Si une publication a le même publication_id que les données reçues
                    if (item.publication_id == data.comment.publication_id) {
                        // On ajoute le commentaire au début de la liste des commentaires
                        item.comments.push(data.comment);
                        // Et on incrémente le nombre de commentaire
                        item.numberOfComments = item.numberOfComments + 1;
                    }
                    return item;
                });
            });
        },
        // Cette fonction se déclenche lorsqu'un utilisateur supprime son commentaire
        onDeleteComment: (data: any) => {
            usePublicationsStore().$patch((state: any) => {
                // On parcours notre state qui contient les différentes publications
                for (let i = 0; i < state.publications.length; i++) {
                    // Si une publication a le même publication_id que les données reçues
                    if (state.publications[i].publication_id == data.comment.publication_id) {
                        // Si le nombre de commentaire affiché est inférieur au nombre total de commentaire et que le cache ne comporte aucun élément
                        if (state.publications[i].comments!.length < state.publications[i].numberOfComments!
                            && state.publications[i].cache!.length == 0) {
                            if (state.publications[i].displayComments) {
                                // On va déclencher la fonction permettant de récupérer d'avantages de commentaires et les ajouter au cache
                                useCommentsStore().getAllComments(data.comment.publication_id, 10, 4, true).then((response: any) => {
                                    // On parcours ensuite la liste des commentaires
                                    for (let j = 0; j < state.publications[i].comments.length; j++) {
                                        // Si un commentaire a le même comment_id que les données reçues
                                        if (state.publications[i].comments[j].comment_id == data.comment.comment_id) {
                                            // On supprime le commentaire
                                            state.publications[i].comments.splice(j, 1);
                                            // Et on décrémente le nombre de commentaire
                                            state.publications[i].numberOfComments = state.publications[i].numberOfComments - 1;
                                        }
                                    }
                                });
                            } else {
                                state.publications[i].numberOfComments = state.publications[i].numberOfComments - 1;
                            }
                        } else {
                            // On parcours ensuite la liste des commentaires
                            for (let j = 0; j < state.publications[i].comments.length; j++) {
                                // Si un commentaire a le même comment_id que les données reçues
                                if (state.publications[i].comments[j].comment_id == data.comment.comment_id) {
                                    // On supprime le commentaire
                                    state.publications[i].comments.splice(j, 1);
                                    // Et on décrémente le nombre de commentaire
                                    state.publications[i].numberOfComments = state.publications[i].numberOfComments - 1;
                                }
                            }
                        }
                        // Si un élément est présent dans le cache
                        if (state.publications[i].cache.length > 0) {
                            // On va retirer le premier élément du cache pour l'ajouter au début de la liste des commentaires
                            state.publications[i].comments.unshift(state.publications[i].cache.shift());
                        }
                    }
                }
            })
        }
    }
});