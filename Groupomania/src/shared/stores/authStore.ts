import { defineStore, storeToRefs } from 'pinia';
import socket from "../../socket";
import { signUp, signIn, fetchInformation, editProfile, fetchNotifications } from "../services/auth.service";
import { useChatStore } from './chatStore';
import { useCommentsStore } from './commentsStore';
import { useFriendshipStore } from './friendsStore';
import { useOtherStore } from './otherStore';
import { usePublicationsStore } from './publicationsStore';
import moment from 'moment';

export interface IAuthStore {
    isConnected: boolean | null;
    user: any | null;
    invalidEmail: boolean;
    invalidPassword: boolean;
    errorMessage: string | null;
    warningLimiter: string | null;
    modalAlert: boolean;
}

export const useAuthStore = defineStore({
    id: "auth",
    state: (): IAuthStore => ({
        isConnected: false,
        user: {},
        invalidEmail: false,
        invalidPassword: false,
        errorMessage: null,
        warningLimiter: null,
        modalAlert: false,
    }),
    getters: {
        isAuthenticated(state): boolean | null {
            if (state.user) {
                return true;
            } else if (!state.user && state.isConnected) {
                return false;
            } else {
                return null;
            }
        }
    },
    actions: {
        register(lastname: string, firstname: string, email: string, password: string, confirmPassword: string) {
            return new Promise((resolve, reject) => {
                // On vérifie que tous les champs soient correctement bien remplis
                if (lastname && firstname && email && password && confirmPassword) {
                    // Si le mot de passe et la confirmation de mot de passe correspondent on exécute la requête faisant appel à l'api et on lui passe les informations des différents champs en paramètre
                    if (password === confirmPassword) {
                        signUp(lastname, firstname, email, password).then((response: any) => {
                            // Si tout s'est bien passée on réinitialise le state comportant le message d'erreur à null étant donner que l'authentification a réussi
                            useAuthStore().$patch((state: any) => {
                                state.errorMessage = null;
                            })
                            resolve(response);
                        }).catch(error => {
                            let text = ''
                            if (error.response.data.length > 0) {
                                text = 'Le mot de passe doit comporter '
                                let arrError: any = [];
                                // On vérifie le type de la réponse et si la réponse est différente d'une string on passe à la suite
                                if (typeof (error.response.data) !== 'string') {
                                    // On parcours le tableau listant les différentes erreurs
                                    error.response.data.forEach((element: any) => {
                                        // Dans le cas où une erreur présente dans le tableau correspond a une des erreurs suivantes on va ajouter le message d'erreur correspondant 
                                        // au sein d'un tableau qui nous permettra d'afficher les différentes erreurs
                                        if (element == 'uppercase') {
                                            arrError.push('1 majuscule');
                                        } else if (element == 'digits') {
                                            arrError.push('2 chiffres ');
                                        } else if (element == 'lowercase') {
                                            arrError.push('1 minuscule ');
                                        }
                                    });
                                    // Puis concaténer les différentes erreurs entre elles
                                    text = text + arrError.join(' et ');
                                    // Et transmettre le message d'erreur en paramètre de la fonction permettant l'affichage de celui ci
                                    useAuthStore().displayErrorMessage(text);
                                }
                            } else {
                                useAuthStore().displayErrorMessage(error.response.data.message);
                            }
                            // Dans le cas où le code erreur est le 429 cela signifie qu'un trop grand nombre de requête a été émise et donc 
                            // on va déclencher la fonction modifiant certaines valeurs du state permettant l'affichage de la modal d'avertissement
                            if (error.response.status == 429) {
                                useAuthStore().displayWarning(error.response.data);
                            };
                            reject(error);
                        })
                    }
                }
            })
        },
        // Cette fonction va nous permettre d'enregistrer le message d'erreur dans le state
        displayErrorMessage(message: string) {
            useAuthStore().$patch((state: any) => {
                state.errorMessage = message;
            })
        },
        // Cette fonction va nous permettre d'enregistrer le message d'erreur dans le state et de changer une valeur qui déclenchera l'apparition d'une modal
        displayWarning(data: string) {
            useAuthStore().$patch((state: any) => {
                state.warningLimiter = data;
                state.modalAlert = true;
            })
        },
        // Cette fonction va réinitialiser la valeur qui permet de déclencher l'affichage ou non de la modal
        resetWarning() {
            useAuthStore().$patch((state: any) => {
                state.modalAlert = false;
            })
        },
        // Cette fonction va nous permettre de transmettre les informations à l'api et de vérifier au sein de la base de données si un utilisateur a été trouvé avec les informations de connexions saisies
        login(email: string, password: string) {
            return new Promise((resolve, reject) => {
                signIn(email, password).then((response: any) => {
                    // Si tout s'est bien passé on enregistre les différentes valeurs récupérer de la requête au sein du localStorage
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    localStorage.setItem('token', response.data.accessToken);
                    // On vient ensuite stocker les informations d'utilisateur dans notre state et passé la valeur isConnected à true maintenant que nous sommes connectés
                    useAuthStore().$patch({
                        user: response.data.user,
                        isConnected: true,
                    });
                    // On déclenche à présent la fonction permettant de vérifier si nous sommes connectés afin de se connecter au socket 
                    // et par la même occasion de déclencher la fonction permettant la récupération des notifications
                    useAuthStore().getMyInformations().then(() => {
                        resolve(response);
                    }).catch((error) => {
                        // Dans le cas où le code erreur est le 429 cela signifie qu'un trop grand nombre de requête a été émise et donc 
                        // on va déclencher la fonction modifiant certaines valeurs du state permettant l'affichage de la modal d'avertissement
                        if (error.response.status == 429) {
                            useAuthStore().displayWarning(error.response.data);
                        };
                    });
                }).catch((error => {
                    // Dans le cas où la saisie comporterait des erreurs on afficherais un message en fonction de l'erreur émise par l'api
                    if (error.response.data.message == `L'adresse email n'existe pas !`) {
                        useAuthStore().$reset();
                        useAuthStore().$patch({
                            invalidEmail: true,
                        });
                    } else {
                        useAuthStore().$reset();
                        useAuthStore().$patch({
                            invalidPassword: true,
                        });
                    }
                    // Dans le cas où le code erreur est le 429 cela signifie qu'un trop grand nombre de requête a été émise et donc 
                    // on va déclencher la fonction modifiant certaines valeurs du state permettant l'affichage de la modal d'avertissement
                    if (error.response.status == 429) {
                        useAuthStore().displayWarning(error.response.data);
                    };
                    reject(error);
                }))
            })
        },
        // Cette fonction va permettre de réinitialiser la valeur du state conservant le message d'alerte concernant les nombreuses requêtes émises
        removeWarningMessage() {
            useAuthStore().$patch((state: any) => {
                state.warningLimiter = null;
            })
        },
        // Cette fonction va permettre de vider le localStorage et de réinitialiser tous les states afin d'éviter tout problème dans le cas où l'on se connecterai avec un autre compte
        logout() {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            useAuthStore().$patch((state: IAuthStore) => {
                state.isConnected = false;
                state.user = null;
            });
            useAuthStore().$reset();
            useChatStore().$reset();
            useFriendshipStore().$reset();
            usePublicationsStore().$reset();
            useCommentsStore().$reset();
            useOtherStore().$reset();
        },
        // Cette fonction va permettre de vérifier si nous sommes bien connectés et de nous reconnecter au serveur socket si c'est le cas ainsi que récupérer l'intégralité des notifications
        getMyInformations: () => {
            return new Promise<void>((resolve, reject) => {
                // On récupère les valeurs présentes sur la clef token dans le cas où il y en aurait
                let token = localStorage.getItem('token');
                // Si le token est toujours valable on se reconnecte dans le cas contraire rien ne se passe
                token ? useAuthStore().$patch({
                    isConnected: true,
                }) : "";
                // On exécute l'appel à l'api permettant de tester si le token est toujours valable et nous permettant de récupérer nos informations d'utilisateur
                fetchInformation().then((response: any) => {
                    // Si tout s'est bien passée on stocke les informations d'utilisateur dans notre state
                    useAuthStore().$patch({
                        user: response.data,
                        isConnected: true,
                    });
                    // Si des informations sont présentes dans le localStorage sous la clef 'user' on récupères les informations d'utilisateur
                    const session = JSON.parse(localStorage.getItem("user"));
                    // Si nous ne sommes pas connectés au serveur socket on déclenche la connexion au serveur grâce aux informations que l'on a récupérés juste avant
                    if (socket.connected == false) {
                        socket.auth = { username: session.firstname + ' ' + session.lastname, picture: session.picture_url, user: session.user_id, sessionID: session.session_id };
                        socket.connect();
                    }
                    // On déclenche la fonction permettant la récupération des notifications
                    useAuthStore().getAllNotifications().then(() => {
                        resolve(response);
                    }).catch((error) => {
                        // Dans le cas où le code erreur est le 429 cela signifie qu'un trop grand nombre de requête a été émise et donc 
                        // on va déclencher la fonction modifiant certaines valeurs du state permettant l'affichage de la modal d'avertissement
                        if (error.response.status == 429) {
                            useAuthStore().displayWarning(error.response.data);
                        };
                    });
                }).catch(error => {
                    // Dans le cas où le code erreur est le 429 cela signifie qu'un trop grand nombre de requête a été émise et donc 
                    // on va déclencher la fonction modifiant certaines valeurs du state permettant l'affichage de la modal d'avertissement
                    if (error.response.status == 429) {
                        useAuthStore().displayWarning(error.response.data);
                    };
                    reject(error);
                })
            })
        },
        // Cette fonction va nous permettre de récupérer les notifications
        getAllNotifications: () => {
            return new Promise<void>((resolve, reject) => {
                // On crée une nouvelle valeur avec la date du jour
                let date = new Date();
                let newDate = moment(date).format('DD/MM/YYYY HH:mm:ss');
                let newDateSplit = newDate.split(" ");
                // On exécute la requête permettant la récupération des notifications
                fetchNotifications().then((response: any) => {
                    // On parcours à présent le tableau de notifications
                    response.data.forEach((element: any) => {
                        // Selon le type de la notification on va lui rajouter de nouvelles propriétés
                        if (element.type == 'like' || element.type == 'comment') {
                            element.publication_id = element.param1;
                            element.publication_picture = element.param2;
                            element.publication_content = element.param3;

                            if (element.type == 'like') {
                                element.like_id = element.id;
                                element.message = 'a aimé votre publication';
                            } else {
                                element.comment_id = element.id;
                                element.message = 'a commenté votre publication';
                            }
                        } else if (element.type == 'friendship') {
                            element.idRequest = element.id;
                            if (element.created_at > element.param2) {
                                element.message = 'a accepté votre demande d\'ami';
                            } else {
                                element.message = 'vous a envoyé une demande d\'ami';
                            }
                        }
                        // On change le format de la date présente dans la notification afin de la rendre plus facilement lisible
                        let date = moment(element.created_at).format('DD/MM/YYYY à HH:mm').split(" ");
                        if (date[0] == newDateSplit[0]) {
                            date[0] = "Aujourd'hui";
                        } else if (parseInt(date[0]) == parseInt(newDateSplit[0]) - 1) {
                            date[0] = "Hier";
                        } else if (parseInt(date[0]) == parseInt(newDateSplit[0]) - 2) {
                            date[0] = "Avant-hier";
                        }

                        // Puis on enregistre l'intégralité des notifications avec les changements apportés et on ajoute une propriété read à true afin d'indiquer que nous les avons déjà consultés 
                        // afin d'éviter qu'à chaque rafraichissement de la page nous nous retrouvons avec la totalité des notifications en non-lues
                        useOtherStore().$patch((state: any) => {
                            state.notifications.push({
                                ...element,
                                read: true,
                                date: date.join(" ")
                            });
                        })
                    })
                    resolve();
                }).catch((error: any) => {
                    // Dans le cas où le code erreur est le 429 cela signifie qu'un trop grand nombre de requête a été émise et donc 
                    // on va déclencher la fonction modifiant certaines valeurs du state permettant l'affichage de la modal d'avertissement
                    if (error.response.status == 429) {
                        useAuthStore().displayWarning(error.response.data);
                    };
                })
            })
        },

        updateProfile: (update: any) => {
            return new Promise((resolve, reject) => {
                // On crée un formData pour envoyer la saisie des différents champs
                let formData = new FormData();
                // Si la valeur de picture_url est différente de 'undefined' cela signifie qu'une image a été sélectionnée et donc nous l'ajoutons a notre formData
                update.picture_url !== undefined ? formData.append('picture', update.picture_url) : "";
                // Si une adresse email a été saisie et que la valeur est différente de 'undefined' ou une string vide on l'ajoute dans notre formData
                update.email !== '' && update.email !== undefined ? formData.append('email', update.email) : "";
                // Si un mot de passe a été saisie et que la valeur est différente de 'undefined' ou une string vide on l'ajoute dans notre formData
                update.password !== '' && update.password !== undefined ? formData.append('password', update.password) : "";
                // On exécute la fonction faisant appel à l'api avec notre formData passé en paramètre
                editProfile(formData).then((response: any) => {
                    // Si tout s'est bien passée et qu'une image avait été sélectionné on va mettre à jour notre state en enregistrant notre nouvelle photo de profil
                    if (update.picture_url) {
                        useAuthStore().$patch((state: any) => {
                            state.user.picture_url = response.data[0].picture_url
                        })
                    };
                    // Si une adresse email avait été saisie on va mettre à jour notre state en enregistrant notre nouvelle adresse mail dans le state
                    if (update.email) {
                        useAuthStore().$patch((state: any) => {
                            state.user.email = response.data[0].email
                        })
                    };
                    // Si des informations d'utilisateur sont bien présentes dans le localStorage on va stocker nos informations d'utilisateur de nouveau en y incluant les modifications apportées à notre profil
                    localStorage.getItem('user') ? localStorage.setItem('user', JSON.stringify(useAuthStore().user)) : "";
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
        // Cette fonction est déclenchée lorsque un utilisateur a mis à jour son profil
        onUpdateProfile: (data: any) => {
            useFriendshipStore().$patch((state: any) => {
                // Si notre liste d'amis comporte au moins 1 utilisateur
                if (state.friends.length > 0) {
                    // On va parcourir notre liste d'amis
                    state.friends.map((item: any) => {
                        // Et vérifier si un de nos amis à le même id que l'id d'utilisateur présent dans les données reçues
                        if (item.user_id == data.data[0].id) {
                            item.picture_url = data.data[0].picture_url;
                        }
                        return item;
                    })
                }
                // Si le résultat de nos recherche comporte au moins 1 résultat
                if (state.searchResults.length > 0) {
                    // On va parcourir la liste de nos résultats de recherches
                    state.searchResults.map((item: any) => {
                        // Et vérifier si un utilisateur présent dans le résultat de notre recherche à le même id que l'id d'utilisateur présent dans les données reçues
                        if (item.user_id == data.data[0].id) {
                            item.picture_url = data.data[0].picture_url;
                        }
                        return item;
                    })
                }
                // Si nous avons émis au moins une demande d'ami
                if (state.invitSendedTo.length > 0) {
                    // Nous allons parcourir la liste de nos demandes d'amis envoyée
                    state.invitSendedTo.map((item: any) => {
                        // Et vérifier si l'id d'un utilisateur présent dans nos demandes d'amis envoyée correspond à l'id d'utilisateur présent dans les données reçues
                        if (item.id == data.data[0].id) {
                            item.picture_url = data.data[0].picture_url;
                        }
                        return item;
                    })
                }
                // Si nous avons au minimum 1 requête
                if (state.requests.length > 0) {
                    // Nous allons parcourir la liste de nos demandes d'ami reçu
                    state.requests.map((item: any) => {
                        // Et vérifier si l'id d'un utilisateur présent dans nos demandes d'amis reçu correspond à l'id d'utilisateur présent dans les données reçues
                        if (item.sender == data.data[0].id) {
                            item.picture_url = data.data[0].picture_url;
                        }
                        return item;
                    })
                }
            });
            useChatStore().$patch((state: any) => {
                // Si la liste des utilisateurs comporte au moins 1 utilisateur
                if (state.users.length > 0) {
                    // Nous allons parcourir la liste des utilisateurs
                    state.users.map((item: any) => {
                        // Et vérifier si l'id d'un utilisateur présent dans la liste correspond à l'id d'utilisateur présent dans les données reçues
                        if (item.user == data.data[0].id) {
                            item.picture = data.data[0].picture_url;
                        }
                        return item;
                    })
                };
                // Si la liste de nos amis sur le chat est plus grande que 1
                if (state.friendsConnected.length > 0) {
                    // On parcours la liste de nos amis
                    state.friendsConnected.map((item: any) => {
                        // Et on vérifie si l'id d'un de nos amis correspond à l'id d'utilisateur présent dans les données reçues
                        if (item.user == data.data[0].id) {
                            item.picture = data.data[0].picture_url
                        }
                    })
                }
            });
            useOtherStore().$patch((state: any) => {
                // Si nous avons au moins une notification
                if (state.notifications.length > 0) {
                    // Nous allons parcourir nos notifications
                    state.notifications.map((item: any) => {
                        // Et vérifier si l'id d'un utilisateur présent dans nos notifications correspond à l'id d'utilisateur présent dans les données reçues
                        if (item.user_id == data.data[0].id) {
                            item.picture_url = data.data[0].picture_url;
                        }
                    })
                }
            });
            usePublicationsStore().$patch((state: any) => {
                // Si nous avons au moins 1 publication dans notre fil d'actualité
                if (state.publications.length > 0) {
                    // Nous allons parcourir nos publications
                    state.publications.map((item: any) => {
                        // Et vérifier si l'id d'un auteur d'une publication correspond à l'id d'utilisateur présent dans les données reçues
                        if (item.user_id == data.data[0].id) {
                            item.picture_url = data.data[0].picture_url;
                        }
                        // Et si nous avons au minimum 1 commentaire sur la publication
                        if (item.comments.length > 0) {
                            // Nous allons parcourir les commentaires
                            item.comments.map((com: any) => {
                                // Et vérifier si l'id d'un auteur d'un commentaire correspond à l'id d'utilisateur présent dans les données reçues
                                if (com.user_id == data.data[0].id) {
                                    com.picture_url = data.data[0].picture_url;
                                }
                                return com;
                            })
                        }
                        return item;
                    })
                    state.publications.map((item: any) => {
                        return item;
                    })
                }
            })
        }
    }
});