import { useFriendshipStore } from './friendsStore';
import { defineStore } from 'pinia';
import type { Message } from '../interfaces/message.interface';
import { sendMsg, fetchMessages, fetchUsers, getCount } from '../services/chat.service';
import { useAuthStore } from './authStore';
import moment from 'moment';
import { ref } from 'vue';

export interface chatState {
    newmessage: null;
    typing: boolean;
    users: [];
    selectedUser: any;
    friendsConnected: [],
    messagesToDisplay: Message[],
}

export const useChatStore = defineStore({
    id: "chat",
    state: (): chatState => ({
        newmessage: null,
        typing: false,
        users: [],
        selectedUser: null,
        friendsConnected: [],
        messagesToDisplay: [] as Message[]
    }),
    getters: {
        onlineList: (state: chatState) => {
            return state.friendsConnected.filter((user: any) => user.connected);
        },
    },
    actions: {
        // Dans le cas où nous viendrions a accepté un nouvel ami on viendra directement 
        // l'enregistrer dans notre liste d'ami spécialement conçu pour interagir avec les différents évènements lié aux sockets
        newFriend: (user: any) => {
            useChatStore().$patch((state: any) => {
                state.friendsConnected.push({
                    user: user.sender ? user.sender : user.user_id,
                    connected: true,
                    picture: user.picture_url,
                    username: user.firstname + ' ' + user.lastname,
                    userID: user.userID,
                    from: 0,
                    limit: 25,
                    hasNewMessages: false,
                    messages: [],
                    messagesQty: 0
                })
            })
        },
        // Dans le cas où l'on supprime un utilisateur ou qu'un utilisateur nous supprime de sa liste d'ami on viendra également le retirer de notre liste d'amis spécialement conçu pour les sockets
        friendDeleted: (user_id: number) => {
            useChatStore().$patch((state: any) => {
                for (let i = 0; i < state.friendsConnected.length; i++) {
                    if (state.friendsConnected[i].user == user_id) {
                        state.friendsConnected.splice(i, 1);
                    }
                }
                // Et dans le cas où nous serions présents dans la page de messagerie avec la conversation ouverte avec un utilisateur et que ce même utilisateur venais à nous supprimé on fermerait la conversation
                if (state.selectedUser !== null) {
                    if (state.selectedUser.user == user_id) {
                        state.selectedUser = null;
                    }
                }
            })
        },
        // Cette fonction sert à ouvrir la discussion avec un utilisateur
        selectedUser: (user: any) => {
            if (typeof (user) == 'number') {
                useChatStore().$patch((state: any) => {
                    // Si des messages sont déjà présents dans la discussion on les supprimes afin qu'à l'ouverture de la discussion il n'y est pas de doublon
                    if (state.selectedUser && state.selectedUser.messages.length > 0) {
                        state.selectedUser.messages.splice(0, state.selectedUser.messages.length);
                    }
                    // Nous parcourons notre liste d'ami spécialement conçu pour les sockets
                    for (let i = 0; i < state.friendsConnected.length; i++) {
                        // Et si l'id d'un ami correspond à l'id que l'on reçoit
                        if (state.friendsConnected[i].user == user) {
                            // On récupère les informations de notre ami
                            state.selectedUser = state.friendsConnected[i];
                            // Puis on interroge l'api afin de savoir combien de messages sont présents dans notre conversation
                            useChatStore().getCountOfMessages(user).then((count: any) => {
                                // Et nous récupérons un nombre limité de nos messages afin de ne pas avoir un délais d'attente trop long
                                useChatStore().getMessagesOfConversation(user, state.selectedUser.limit, state.selectedUser.from).then((response: any) => {
                                    // Si la longueur du tableau reçu de l'api est plus grande que 0 cela veux donc dire que des messages ont été récupérées
                                    if (response.length > 0) {
                                        // nous parcourons à présent le tableau de résultat reçu
                                        response.map((message: any) => {
                                            // Si l'id de l'émetteur ou du destinataire d'un message correspond à celui de notre ami sélectionné nous allons ajouter le message dans la discussion avec notre ami
                                            if (message.sender == user || message.recipient == user) {
                                                state.selectedUser.messages.push(message)
                                            }
                                        });
                                    }
                                    // Et attribuer la réponse de notre requête quand nous avons interrogé l'api concernant la quantité de message présente dans notre discussion
                                    state.selectedUser.messagesQty = count;
                                    // Et faire disparaitre l'icone nous indiquant que nous avons un ou plusieurs nouveaux messages non-lus dans le cas où notre ami nous aurait envoyé des messages
                                    state.selectedUser.hasNewMessages = false;
                                }).catch((error) => {
                                    // Dans le cas où le code erreur est le 429 cela signifie qu'un trop grand nombre de requête a été émise et donc 
                                    // on va déclencher la fonction modifiant certaines valeurs du state permettant l'affichage de la modal d'avertissement
                                    if (error.response.status == 429) {
                                        useAuthStore().displayWarning(error.response.data);
                                    };
                                });
                                // Dans le cas où le code erreur est le 429 cela signifie qu'un trop grand nombre de requête a été émise et donc 
                                // on va déclencher la fonction modifiant certaines valeurs du state permettant l'affichage de la modal d'avertissement
                            }).catch((error) => {
                                if (error.response.status == 429) {
                                    useAuthStore().displayWarning(error.response.data);
                                };
                            })
                        }
                    }
                })
            } else {
                useChatStore().$patch((state: any) => {
                    state.selectedUser = user;
                })
            }
        },
        // Cette fonction va nous permettre de désélectionner un utilisateur afin de fermer la discussion qui est ouverte
        unselectUser: () => {
            useChatStore().$patch((state: any) => {
                state.selectedUser = null;
            })
        },
        // Cette fonction va nous permettre de faire disparaitre l'icone nous indiquant que nous avons un ou plusieurs nouveaux messages non-lus dans le cas où notre ami nous aurait envoyé des messages
        messageRead: () => {
            useChatStore().$patch((state: any) => {
                state.selectedUser.hasNewMessages = false;
            })
        },
        // Cette fonction va nous permettre de faire disparaître au bout d'un certain laps de temps l'aperçu du message affiché à l'écran
        removeMessageAtDisplay: () => {
            return new Promise<void>((resolve, reject) => {
                useChatStore().$patch((state: any) => {
                    if (state.messagesToDisplay.length > 0) {
                        // On passe la valeur disapear à true afin d'enclencher l'animation qui le fera disparaitre progressivement et finira par le masquer côté html 
                        state.messagesToDisplay[0].disapear = true;
                        setTimeout(() => {
                            // Puis au bout d'un certain temps on viendra le supprimer directement du tableau où son stocker les messages qui sont censés apparaître quelques secondes à l'écran
                            state.messagesToDisplay.splice(0, 1);
                            resolve();
                        }, 400)
                    }
                })
            })
        },
        sendMessage: (id: number, message: any) => {
            return new Promise((resolve, reject) => {
                // Nous allons effectuer la requête pour envoyer un message nous lui passons en paramètre l'id du destinataire ainsi que le contenu du message
                sendMsg(id, message).then((response: any) => {
                    // Si tout s'est bien déroulé
                    useChatStore().$patch((state: any) => {
                        // Nous allons incrémenter la quantité de message présente dans la discussion avec notre ami
                        state.selectedUser.messagesQty += 1;
                        // Et ajouter ensuite le message dans notre discussion
                        state.selectedUser.messages.push({
                            sender: useAuthStore().$state.user.user_id,
                            id: response,
                            content: message,
                            recipient: state.selectedUser.user,
                        });
                    });
                    resolve(response.data.message_sended_id);
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
        // Cette fonction va nous permettre de récupérer les messages de la discussion que l'on vient d'ouvrir
        getMessagesOfConversation: (conversation_id: number, limit: number, from: number) => {
            return new Promise((resolve, reject) => {
                fetchMessages(conversation_id, limit, from).then((response: any) => {
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    if (error.response.status == 429) {
                        useAuthStore().displayWarning(error.response.data);
                    };
                    reject(error)
                })
            })
        },
        // Cette fonction va nous permettre de récupérer tous les utilisateurs connectés actuellement au serveur
        getUsersConnected() {
            return new Promise((resolve, reject) => {
                fetchUsers().then((response: any) => {
                    // Si tout s'est bien passé et que le tableau de résultat contient au moins 1 élément et que notre liste d'amis comporte au moins 1 ami
                    if (response.data?.length > 0 && useFriendshipStore().$state.friends.length > 0) {
                        useChatStore().$patch((state: any) => {
                            // Nous allons supprimer tous nos amis présents dans la liste d'amis interagissant avec les sockets
                            state.friendsConnected.splice(0, state.friendsConnected.length);
                            // Puis parcourir le tableau de résultat
                            response.data.map((user: any) => {
                                // Parcourir notre liste d'ami
                                useFriendshipStore().$state.friends.map((friend: any) => {
                                    // Et si une personne de notre liste d'ami correspond avec un des éléments présents dans le tableau de résultat
                                    if (friend.user_id == user.user) {
                                        // On l'ajoute à notre liste d'amis interagissant avec les sockets
                                        state.friendsConnected.push({
                                            connected: user.connected,
                                            from: 0,
                                            hasNewMessages: false,
                                            limit: 25,
                                            messages: [],
                                            messagesQty: 0,
                                            picture: friend.picture_url,
                                            user: user.user,
                                            userID: user.userID,
                                            username: user.username
                                        })
                                    }
                                })
                            })
                        })
                    }
                    resolve(useChatStore().$state.friendsConnected);
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
        // Cette fonction va nous permettre de récupérer le nombre de message présent au sein de la conversation
        getCountOfMessages: (conversation_id: number) => {
            return new Promise((resolve, reject) => {
                getCount(conversation_id).then((response: any) => {
                    resolve(response.data.count);
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
        // Cette fonction va nous permettre de récupérer d'avantages de messages au sein de la discussion qui ont été précédemment envoyés
        fetchMoreMessages: () => {
            return new Promise((resolve, reject) => {
                useChatStore().$patch((state: any) => {
                    // On incrémente de 25 le point de départ depuis lequel nous souhaitons récupérer des messages
                    state.selectedUser.from += 25;
                    fetchMessages(state.selectedUser.user, state.selectedUser.limit, state.selectedUser.from).then((response: any) => {
                        // Si la longueur du tableau de résultat est supérieur à 0
                        if (response.length > 0) {
                            // On va boucler sur le tableau de résultat
                            for (let i = response.length; i !== 0; i--) {
                                // Et ajouter à chaque fois le dernier élément du tableau de résultat au début de notre tableau qui conserve tous les messages de notre discussion
                                state.selectedUser.messages.unshift(response.pop());
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
                        reject(error)
                    })
                })
            })
        },
        // Cette fonction va nous permettre d'enregistrer dans notre state quand un ami est en train d'écrire
        onTyping: (typing: boolean, data?: any) => {
            useChatStore().$patch((state: any) => {
                typing ? state.typing = data : state.typing = false;
            })
        },
        // Cette fonction va s'effectuer à la réception d'un nouveau message
        onPrivateMessage: (data: any) => {
            return new Promise<void>((resolve, reject) => {
                // On crée une valeur avec l'heure du jour
                let date = new Date();
                let newDate = moment(date).format('HH:mm');
                useChatStore().$patch((state: any) => {
                    // On parcours à présent notre liste d'ami qui interagit avec les sockets
                    useChatStore().$state.friendsConnected.map((utilisateur: any) => {
                        // Si le userID d'un ami présent dans notre liste correspond à l'userID de l'émetteur du message
                        if (utilisateur.userID == data.from) {
                            // Et si l'id de l'utilisateur sélectionné correspond à l'id de l'émetteur du message
                            if (state.selectedUser !== null && utilisateur.user == state.selectedUser.user) {
                                // On ajoute le message dans la discussion
                                utilisateur.messages.push({
                                    sender: utilisateur.user,
                                    id: data.id,
                                    content: data.message,
                                    recipient: useAuthStore().$state.user.user_id,
                                });
                                // Et on incrémente le nombre de message total échanger
                                utilisateur.messagesQty += 1;
                            }
                            // Si aucun utilisateur est sélectionné ou que l'utilisateur sélectionné ne correspond pas avec l'émetteur du message
                            if (state.selectedUser == null || state.selectedUser.user !== utilisateur.user) {
                                // On indique que nous avons un nouveau message non lus
                                utilisateur.hasNewMessages = true;
                                // Et on l'ajoute au tableau qui va nous permettre d'afficher à l'écran sous forme de pop up un aperçu du message durant quelques instants
                                state.messagesToDisplay.push({
                                    user_id: utilisateur.user,
                                    username: utilisateur.username,
                                    picture: utilisateur.picture,
                                    message: data.message,
                                    userID: utilisateur.userID,
                                    at: newDate,
                                    disapear: false
                                })
                            }
                            // Puis au bout d'un certain laps de temps
                            setTimeout(() => {
                                // Si un message est déjà présent dans le tableau qui nous permet d'afficher à l'écran un pop up contenant l'aperçu d'un message
                                if (state.messagesToDisplay.length !== 0) {
                                    // On va déclencher la fonction permettant la suppression du message au sein du tableau
                                    useChatStore().removeMessageAtDisplay();
                                }
                            }, 2500)
                            return utilisateur;
                        }
                    })

                })
                resolve();
            })
        },
        // Cette fonction se déclenche dès qu'un utilisateur se connecte
        onUserConnnected: (data: any) => {
            useChatStore().$patch((state: any) => {
                // On parcours la liste d'amis interagissant avec les sockets
                state.friendsConnected.map((friend: any) => {
                    // Si le userID de l'utilisateur venant de se connecter correspond à l'userID d'un de nos amis
                    if (friend.userID === data.userID) {
                        // On passe le statut de notre ami a connecté
                        friend.connected = true;
                    }
                    return friend;
                })
            })
        },
        // Cette fonction se déclenche dès qu'un utilisateur se déconnecte
        onUserDisconnected: (data: any) => {
            useChatStore().$patch((state: any) => {
                // On parcours la liste d'amis interagissant avec les sockets
                state.friendsConnected.map((friend: any) => {
                    if (friend.userID === data) {
                        // Si l'userID de l'utilisateur venant de se déconnecter correspond à l'userID d'un de nos amis alors on passe le statut de notre ami a déconnecté
                        friend.connected = false;
                    }
                    return friend;
                });
            });
        }
    }
});