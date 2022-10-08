import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { fetchRequests, fetchFriends, acceptOrDecline, deleteFriend, searchFriend, addFriend, cancelReq, checkReq } from '../services/friends.service';
import { useChatStore } from './chatStore';
import { useOtherStore } from './otherStore';
import moment from 'moment';

interface FriendshipState {
    friends: any[];
    requests: any[];
    isLoading: boolean;
    numOfResults: number;
    numberOfPages: number;
    searchResults: any[];
    invitSendedTo: any[];
    friendsOfUser: any[]
}

export const useFriendshipStore = defineStore({
    id: "friendship",
    state: (): FriendshipState => ({
        friends: [],
        requests: [],
        isLoading: true,
        numOfResults: 0,
        numberOfPages: 1,
        searchResults: [],
        invitSendedTo: [],
        friendsOfUser: []
    }),
    getters: {
        friendsList: (state: FriendshipState) => state.friends,
        requestsList: (state: FriendshipState) => state.requests,
        searchList: (state: FriendshipState) => state.searchResults,
        invitationList: (state: FriendshipState) => state.invitSendedTo,
    },
    actions: {
        // Cette fonction a pour but de récupérer les demandes d'amis reçus
        getRequests: () => {
            return new Promise((resolve, reject) => {
                // Cette requête transmet l'information à l'api afin de nous renvoyer le résultat
                fetchRequests().then((response: any) => {
                    // Si le tableau de résultat comporte au moins 1 élément
                    if (response.results && response.results.length > 0) {
                        // On va parcourir le tableau des résultats
                        response.results.map((item: any) => {
                            useFriendshipStore().$patch((state: any) => {
                                // Et vérifier si au sein de notre state qui est censé contenir les demandes d'amis reçus il n'y aurait pas une demande d'ami
                                //  d'un émetteur différent que ceux récupérer depuis notre requête
                                if (state.requests.find((request: any) => request.sender !== item.sender) || state.requests.length == 0) {
                                    // Si c'est le cas on passe de cette façon isLoading à false afin de terminer le chargement
                                    state.isLoading = false;
                                    // Et on ajoute la demande d'ami en question dans le state prévue à cet effet
                                    state.requests.push(item);
                                }
                            })
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
                })
            })
        },
        // Cette fonction va nous permettre de récupérer la liste de nos amis ou celle d'un utilisateur
        getAllFriends: (id?: number) => {
            return new Promise((resolve, reject) => {
                // Si un id est passé en paramètre on va l'enregistrer dans une variable
                let param = id ? id : '';
                // On va ensuite exécuté la requête qui va nous permettre de récupérer la liste de nos amis ou celle d'un utilisateur dans le cas où param est différent de ''
                fetchFriends(param).then((response: any) => {
                    let userToCompare = 0;
                    let newFriend = ref({
                        user_id: 0,
                        picture_url: '',
                        firstname: '',
                        lastname: '',
                    });
                    // 
                    // Si un id est passé en paramètre on va l'enregistrer dans userToCompare afin de
                    id ? userToCompare = id : userToCompare = useAuthStore().$state.user.user_id;
                    response.results.map((item: any) => {
                        // Dans le cas où l'id de l'utilisateur ou le notre est égal de l'émetteur de la demande d'ami
                        if (userToCompare == item.sender_user_id) {
                            // Alors nous allons enregistrer les informations du destinataire de la requête dans la valeur newFriend
                            newFriend.value = {
                                user_id: item.recipient_user_id,
                                picture_url: item.recipient_picture_url,
                                firstname: item.recipient_firstname,
                                lastname: item.recipient_lastname,
                            };
                            // Dans le cas où nous sommes pas l'émetteur de la demande d'ami
                        } else {
                            // Nous allons récupérer les informations de l'éméteur de la demande d'ami et les enregistrer dans la valeur newFriend
                            newFriend.value = {
                                user_id: item.sender_user_id,
                                picture_url: item.sender_picture_url,
                                firstname: item.sender_firstname,
                                lastname: item.sender_lastname,
                            };
                        }
                        // Si un id est passé en paramètre
                        if (id) {
                            useFriendshipStore().$patch((state: any) => {
                                // Et les informations de l'ami présent dans newFriend ne sont pas déjà présente dans les amis de l'utilisateur
                                if (state.friendsOfUser.find((item: any) => item.user_id !== newFriend.value.user_id) || state.friendsOfUser.length == 0) {
                                    // Nous allons ajouté l'ami dans sa liste d'amis
                                    state.friendsOfUser.push(newFriend.value);
                                    // Et mettre fin au chargement
                                    state.isLoading = false;
                                }
                            })
                            // Dans le cas où aucun id est passé en paramètre
                        } else {
                            useFriendshipStore().$patch((state: any) => {
                                // Et que les l'id de l'ami présent dans newFriend ne sont pas déjà présente dans notre liste d'amis
                                if (state.friends.find((item: any) => item.user_id !== newFriend.value.user_id) || state.friends.length == 0) {
                                    // Nous allons ajouté l'ami dans notre liste d'amis
                                    state.friends.push(newFriend.value);
                                    // Et mettre fin au chargement
                                    state.isLoading = false;
                                }
                            })
                        }
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
        // Cette fonction va nous permettre d'accepter ou de refuser une demande d'ami
        acceptOrDeclineRequest: (req: any, answer: string) => {
            return new Promise((resolve, reject) => {
                // On exécute la requête qui va nous permettre d'accepter ou de refuser une demande d'ami avec notre réponse et la requête en question passé en paramètre
                acceptOrDecline(req.idRequest, answer).then((response: any) => {
                    // Si nous déclinons la demande d'ami
                    if (answer == 'refused') {
                        useFriendshipStore().$patch((state: any) => {
                            // Nous allons parcourir nos demande d'amis reçues
                            for (let i = 0; i < state.requests.length; i++) {
                                // Et dans le cas où l'id d'un utilisateur d'une des demandes d'ami correspond à l'id de l'utilisateur de la demande d'ami que nous venons de décliner
                                if (state.requests[i].sender == req.sender) {
                                    // Nous allons la supprimer de notre liste de demande d'amis reçues
                                    state.requests.splice(i, 1);
                                }
                            }
                            // Nous allons ensuite parcourir la liste des résultats de recherche d'amis
                            state.searchResults.map((item: any) => {
                                // Et si l'id d'un utilisateur correspond à l'id de l'émetteur de la demande d'ami que nous venons de décliner
                                // Nous passons la propriété waitingReply à false afin de faire correspondre le bon état du bouton présent sur la carte de l'utilisateur
                                item.user_id == req.sender ? item.waitingReply = false : "";
                            })
                        });
                        // Dans le cas où nous acceptons la demande d'ami
                    } else {
                        useFriendshipStore().$patch((state: any) => {
                            // Nous parcourons nos demande d'amis reçues
                            for (let i = 0; i < state.requests.length; i++) {
                                // Et dans le cas où l'id d'un utilisateur d'une des demandes d'ami reçu correspond à l'id de l'utilisateur de la demande d'ami que nous venons d'accepter
                                if (state.requests[i].sender == req.sender) {
                                    // Puis on supprime la demande de notre liste de demande d'amis reçues
                                    state.requests.splice(i, 1);
                                }
                            }
                            // Nous parcourons ensuite la liste des résultats de recherche d'utilisateur
                            state.searchResults.map((item: any) => {
                                // Si l'id d'un utilisateur correspond à l'émetteur de la demande d'ami que nous venons d'accepter
                                if (item.user_id == req.sender) {
                                    // Nous passons la propriété isFriend à true
                                    item.isFriend = true;
                                    // et waitingReply à false afin de faire correspondre le bon état du bouton présent sur la carte de l'utilisateur
                                    item.waitingReply = false;
                                }
                            });
                            // On l'ajoute ensuite à notre liste d'amis
                            state.friends.push({
                                ...req,
                                user_id: req.sender,
                            })
                        })
                        // Puis on déclenche la fonction permettant d'ajouter l'ami dans notre liste d'amis interagissant avec les sockets en lui passant en paramètre la demande d'ami
                        useChatStore().newFriend(req);
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
        // Cette fonction va nous permettre de supprimer un ami
        removeFriend: (id: number) => {
            return new Promise((resolve, reject) => {
                // On exécute la requête qui va nous permettre de supprimer un ami avec l'id de l'ami en question passé en paramètre
                deleteFriend(id).then((response: any) => {
                    useFriendshipStore().$patch((state: any) => {
                        // On va parcourir notre liste d'amis
                        for (let i = 0; i < state.friends.length; i++) {
                            // Et dans le cas où l'id d'un utilisateur de notre liste d'amis correspond à l'id de l'ami que nous venons de supprimer
                            if (state.friends[i].user_id == id) {
                                // On le supprime de notre liste d'amis
                                state.friends.splice(i, 1);
                            }
                        }
                        // On va ensuite parcourir la liste des résultats de recherche d'utilisateur
                        state.searchResults.map((item: any) => {
                            // Et dans le cas où l'id d'un utilisateur correspond à l'id de l'ami que nous venons de supprimer
                            if (item.user_id == id) {
                                // On passe la propriété isFriend à false afin de faire correspondre le bon état du bouton présent sur la carte de l'utilisateur
                                item.isFriend = false;
                            }
                        })
                    })
                    useOtherStore().deleteRelatedNotifications(id, "friend");
                    useChatStore().friendDeleted(id);
                    resolve(response);
                }).catch(error => {
                    reject(error);
                    if (error.response.status == 429) {
                        useAuthStore().displayWarning(error.response.data);
                    };
                    console.log(error);
                })
            })
        },
        // Cette fonction permet de réinitialiser le state stockant la liste d'ami de l'utilisateur sur lequel nous avons souhaité obtenir plus d'informations
        // Afin de pouvoir réutiliser cette fonction pour un autre utilisateur
        resetFriendlist: () => {
            useFriendshipStore().$patch((state) => {
                state.friendsOfUser.splice(0, state.friendsOfUser.length)
            })
        },
        // Cette fonction permet de rechercher un utilisateur en fonction de son nom ou de son prénom
        searchUser: (search: string) => {
            return new Promise((resolve, reject) => {
                // Nous allons exécuter la requête qui va nous permettre de rechercher un utilisateur en lui passant en paramètre la chaîne de caractère saisie dans le champ de recherche
                searchFriend(search).then((response: any) => {
                    useFriendshipStore().$patch((state: any) => {
                        // Avant d'afficher si des résultats de recherche ont été trouvés ou non, nous allons réinitialiser la liste des résultats de recherche
                        state.searchResults.splice(0, state.searchResults.length)
                    });
                    // Si des résultats ont été trouvés
                    if (response.data.results) {
                        useFriendshipStore().$patch((state: any) => {
                            // Nous allons parcourir la liste des résultats de notre recherche
                            response.data.results.map((item: any) => {
                                // Si notre liste d'amis contient au moins un utilisateur
                                if (state.friends.length > 0) {
                                    // Nous allons parcourir notre liste d'amis
                                    state.friends.map((friend: any) => {
                                        // Et vérifier si l'id d'utilisateur d'un des résultats de notre recherche correspond à l'id d'un utilisateur de notre liste d'amis
                                        if (item.user_id == friend.user_id) {
                                            // Si c'est le cas on passe la propriété isFriend à true afin de faire correspondre le bon état du bouton présent sur la carte de l'utilisateur
                                            item.isFriend = true;
                                        }
                                    })
                                }
                                // Si nous avons des demandes d'amis en attente que nous avons émise
                                if (state.invitSendedTo.length > 0) {
                                    // Nous allons parcourir nos demandes d'amis émise en attente de réponse
                                    state.invitSendedTo.map((invit: any) => {
                                        // Si l'id d'un utilisateur pour lequel nous avons émis une demande d'amis correspond à l'id d'un utilisateur de notre liste de résultats de recherche
                                        if (item.user_id == invit.id) {
                                            // Nous allons passer la propriété pending à true afin de faire correspondre le bon état du bouton présent sur la carte de l'utilisateur
                                            item.pending = true;
                                        }
                                    })
                                }
                                // Si nous avons des demandes d'amis en attente que nous avons reçu
                                if (state.requests.length > 0) {
                                    // Nous allons parcourir la liste des demandes d'amis que nous avons reçu
                                    state.requests.map((request: any) => {
                                        // Si l'id d'un utilisateur d'une de nos demande d'amis reçues correspond à l'id d'un utilisateur de notre liste de résultats de recherche
                                        if (item.user_id == request.sender) {
                                            // Nous allons passer la propriété waitingReply à true afin de faire correspondre le bon état du bouton présent sur la carte de l'utilisateur
                                            item.waitingReply = true;
                                        }
                                    })
                                }
                                // Si l'id d'utilisateur présent dans le résultat de notre recherche correspond au notre nous le retirons de la liste des résultats de recherche
                                useAuthStore().$state.user.user_id == item.user_id ? response.data.results.splice(response.data.results.indexOf(item), 1) : state.searchResults.push(item);
                            })
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
                    reject(error)
                })
            })
        },
        // Cette fonction permet d'envoyer une demande d'amis à un utilisateur
        sendFriendRequest: (user_id: number) => {
            return new Promise((resolve, reject) => {
                // On va exécuter la requête qui va nous permettre d'envoyer une demande d'amis à un utilisateur en lui passant en paramètre l'id de l'utilisateur
                addFriend(user_id).then((response: any) => {
                    // Si tout s'est bien passé on va parcourir la liste des résultats de recherche
                    useFriendshipStore().$state.searchResults.map((item: any) => {
                        // Si l'id de l'utilisateur pour lequel nous avons souhaité envoyer une demande d'amis correspond à l'id d'un utilisateur de la liste des résultats de recherche
                        // On lui passe la propriété pending à true afin de faire correspondre le bon état du bouton présent sur la carte de l'utilisateur
                        item.user_id == user_id ? item.pending = true : "";
                        return item;
                    });
                    // Si la demande d'ami a bien été envoyée
                    if (response.data.results) {
                        useFriendshipStore().$patch((state: FriendshipState) => {
                            // On va pouvoir ajouter les informations de l'utilisateur à notre liste de demandes d'amis en attente que nous avons émise
                            state.invitSendedTo.push({
                                account_disabled: response.data.results[0].account_disabled,
                                email: response.data.results[0].email,
                                firstname: response.data.results[0].firstname,
                                id: response.data.results[0].id,
                                idRequest: response.data.results[0].requestId,
                                lastname: response.data.results[0].lastname,
                                picture_url: response.data.results[0].picture_url,
                                request_date: response.data.results[0].request_date,
                                role_id: response.data.results[0].role_id,
                                session_id: response.data.results[0].session_id,
                                userID: response.data.results[0].userID
                            })
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
                })
            })
        },
        // Cette fonction va nous permettre d'annuler une demande d'amis que nous avons émise
        cancelRequest: (user_id: number) => {
            return new Promise((resolve, reject) => {
                // On exécute la requête qui va nous permettre d'annuler une demande d'amis que nous avons émise en lui passant en paramètre l'id de l'utilisateur
                cancelReq(user_id).then((response: any) => {
                    useFriendshipStore().$patch((state: FriendshipState) => {
                        // On va parcourir la liste des résultats de recherche
                        state.searchResults.map((item: any) => {
                            // Si l'id de l'utilisateur pour lequel nous avons souhaité annuler une demande d'amis correspond à l'id d'un utilisateur de la liste des résultats de recherche
                            if (item.user_id == user_id) {
                                // On lui passe la propriété pending à false afin de faire correspondre le bon état du bouton présent sur la carte de l'utilisateur
                                item.pending = false;
                            }
                        })

                        // On va parcourir la liste des demandes d'amis que nous avons émise
                        for (let i = 0; i < state.invitSendedTo.length; i++) {
                            // Si l'id de l'utilisateur pour lequel nous avons souhaité annuler une demande d'amis correspond à l'id d'un utilisateur de la liste des demandes d'amis que nous avons émise
                            if (state.invitSendedTo[i].id == user_id) {
                                // On retire l'utilisateur de la liste des demandes d'amis que nous avons émise
                                state.invitSendedTo.splice(i, 1);
                                i = -1;
                            }
                        }
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
        // Cette fonction va nous permettre de récupérer la liste des demandes d'amis que nous avons émise
        checkRequestsSended: () => {
            return new Promise((resolve, reject) => {
                // On exécute la requête qui va nous permettre de récupérer la liste des demandes d'amis que nous avons émise
                checkReq().then((response: any) => {
                    useFriendshipStore().$patch((state: any) => {
                        // On va réinitialiser la liste des demandes d'amis que nous avons émise
                        state.invitSendedTo.splice(0, state.invitSendedTo.length),
                            // On va parcourir les résultats de la requête
                            response.data.results.forEach((item: any) => {
                                // Et ajouté chaque élément à la liste des demandes d'amis que nous avons émise
                                state.invitSendedTo.push(item);
                            });
                    });
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
        // Cette fonction va s'exécuter lorque un utilisateur émet une demande d'amis à un autre utilisateur 
        onFriendRequestSended: (data: any) => {
            // Si l'id du destinataire correspond a notre id
            if (data.request.recipient == useAuthStore().$state.user.user_id) {
                useFriendshipStore().$patch((state: any) => {
                    // Et que l'id de l'émetteur ne correspond pas à l'id d'un utilisateur présent dans la liste de nos demande d'amis reçues
                    // pour lesquelles nous n'avons pas encore répondu
                    if (state.requests.find((item: any) => item.sender !== data.request.sender) || state.requests.length == 0) {
                        // Alors on ajoute la demande d'amis reçue à la liste des demandes d'amis reçues
                        state.requests.push(data.request);
                    }
                    // Si la liste des résultats de recherche n'est pas vide
                    if (state.searchResults.length > 0) {
                        // On parcours la liste des résultats de recherche
                        state.searchResults.map((item: any) => {
                            // Si l'id de l'émetteur de la demande d'amis correspond à l'id d'un utilisateur présent dans la liste des résultats de recherche
                            if (item.user_id == data.request.sender) {
                                // On lui passe la propriété waitingReply à true afin de faire correspondre le bon état du bouton présent sur la carte de l'utilisateur
                                item.waitingReply = true;
                            }
                        })
                    }
                    // Et on termine le chargement
                    state.isLoading = false;
                });
            }
        },
        // Cette fonction va s'exécuter lorsque un utilisateur décline une demande d'amis
        onFriendRequestRefused: (data: any) => {
            // Si l'id de l'émetteur de la demande d'amis correspond à notre id
            if (data.target.sender == useAuthStore().$state.user.user_id) {
                useFriendshipStore().$patch((state: any) => {
                    // Si la liste de nos demandes d'amis émises n'est pas vide
                    if (state.invitSendedTo.length > 0) {
                        // On va parcourir la liste de nos demandes d'amis émises
                        for (let i = 0; i < state.invitSendedTo.length; i++) {
                            if (state.invitSendedTo[i].id == data.user.user_id) {
                                // On retire l'utilisateur de la liste de nos demandes d'amis émises
                                state.invitSendedTo.splice(i, 1);
                                // Je réinitialise l'index pour ne pas sauter d'élément
                                i = -1;
                            }
                        }
                    }
                    // Si la liste des résultats de recherche n'est pas vide
                    if (state.searchResults.length > 0) {
                        // On parcours la liste des résultats de recherche
                        state.searchResults.map((item: any) => {
                            // Si l'id de l'utilisateur qui a décliné la demande d'amis correspond à l'id d'un utilisateur présent dans la liste des résultats de recherche
                            if (item.user_id == data.user.user_id) {
                                // On lui passe la propriété pending à false
                                item.pending = false;
                                // Et isFriend à false afin de faire correspondre le bon état du bouton présent sur la carte de l'utilisateur
                                item.isFriend = false;

                            }
                        })
                    }
                    // Et on termine le chargement
                    state.isLoading = false;
                })
            }
        },
        // Cette fonction va s'exécuter lorsqu'un utilisateur accepte une demande d'amis
        onFriendRequestAccepted: (data: any) => {
            // Si l'id de l'émetteur de la demande d'amis correspond à notre id
            if (data.target.sender == useAuthStore().$state.user.user_id) {
                useFriendshipStore().$patch((state: any) => {
                    // Si la liste de nos demandes d'amis émises n'est pas vide
                    if (state.invitSendedTo.length > 0) {
                        // On va parcourir la liste de nos demandes d'amis émises
                        for (let i = 0; i < state.invitSendedTo.length; i++) {
                            if (state.invitSendedTo[i].id == data.target.recipient) {
                                // On retire l'utilisateur de la liste de nos demandes d'amis émises
                                state.invitSendedTo.splice(i, 1);
                                // Je réinitialise l'index pour ne pas sauter d'élément
                                i = -1;
                            }
                        }
                    }
                    // Si la liste des résultats de recherche n'est pas vide
                    if (state.searchResults.length > 0) {
                        // On parcours la liste des résultats de recherche
                        state.searchResults.map((item: any) => {
                            // Si l'id de l'utilisateur qui a accepté la demande d'amis correspond à l'id d'un utilisateur présent dans la liste des résultats de recherche
                            if (item.user_id == data.target.recipient) {
                                // On lui passe la propriété pending à false
                                item.pending = false;
                                // Et isFriend à true afin de faire correspondre le bon état du bouton présent sur la carte de l'utilisateur
                                item.isFriend = true;
                            }
                        })
                    }
                    // Et on ajoute l'utilisateur à la liste de nos amis
                    state.friends.push({
                        ...data.user,
                        idRequest: data.target.idRequest,
                    })
                    // Et on termine le chargement
                    state.isLoading = false;

                })
                // Puis on déclenche la fonction permettant d'ajouter l'utilisateur à notre liste d'amis interagissant avec les évènements sockets
                useChatStore().newFriend(data.user)
            }
        },
        // Cette fonction va s'exécuter lorsqu'un utilisateur supprime un ami
        onFriendRemoved: (data: any) => {
            // Si notre id correspond à l'id de l'utilisateur supprimé
            if (useAuthStore().$state.user.user_id == data.target.user_id) {
                useFriendshipStore().$patch((state: any) => {
                    // Si la liste de nos amis n'est pas vide
                    if (state.friends.length > 0) {
                        // On parcours la liste de nos amis
                        for (let i = 0; i < state.friends.length; i++) {
                            // Si l'id de l'utilisateur qui a supprimé un ami correspond à l'id d'un utilisateur présent dans la liste de nos amis
                            if (state.friends[i].user_id == data.user.user_id) {
                                // On retire l'utilisateur de la liste de nos amis
                                state.friends.splice(i, 1);
                                // Je réinitialise l'index pour ne pas sauter d'élément
                                i = -1;
                            }
                        }
                        useOtherStore().deleteRelatedNotifications(data.user.user_id, "friend");
                    }
                    // Si la liste des résultats de recherche n'est pas vide
                    if (state.searchResults.length > 0) {
                        // On parcours la liste des résultats de recherche
                        state.searchResults.map((item: any) => {
                            // Si l'id de l'utilisateur qui a supprimé un ami correspond à l'id d'un utilisateur présent dans la liste des résultats de recherche
                            if (item.user_id == data.user.user_id) {
                                // On lui passe la propriété isFriend à false afin de faire correspondre le bon état du bouton présent sur la carte de l'utilisateur
                                item.isFriend = false;
                            }
                        })
                    }
                    // Et on termine le chargement
                    state.isLoading = false;
                })
                // Puis on déclenche la fonction permettant de supprimer l'utilisateur de notre liste d'amis interagissant avec les évènements sockets
                useChatStore().friendDeleted(data.user.user_id);
            }
        },
        // Cette fonction va s'exécuter lorsqu'un utilisateur annule une demande d'amis
        onFriendRequestCanceled: (data: any) => {
            // Si l'id du destinataire correspond à notre id
            if (useAuthStore().user.user_id == data.request.user_id) {
                useFriendshipStore().$patch((state: any) => {
                    // Si notre liste de demandes d'amis reçu n'est pas vide
                    if (state.requests.length > 0) {
                        // On va parcourir la liste de nos demandes d'amis reçu
                        for (let i = 0; i < state.requests.length; i++) {
                            // Si l'id de l'émetteur de la demande d'amis correspond à l'id de l'utilisateur qui a annulé la demande d'amis
                            if (state.requests[i].sender == data.user.user_id) {
                                // On retire l'utilisateur de la liste de nos demandes d'amis reçu
                                state.requests.splice(i, 1);
                            }
                        }
                    }
                    // Et on termine le chargement
                    state.isLoading = false;
                })
            }
        }
    }
});