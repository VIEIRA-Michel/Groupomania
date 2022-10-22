<a href="#">
  <img src="https://i.gyazo.com/b21238e421d4be7db891935593f2e4b2.png" alt="Groupomania">
</a>

**Groupomania** est le projet 7 de la formation développeur web d'OpenClassrooms.

---

## Scénario

> Vous êtes développeur depuis plus d'un an chez CONNECT-E, une petite agence web regroupant une douzaine d'employés.Votre directrice, Stéphanie, vient de signer un nouveau contrat avec Groupomania, un groupe spécialisé dans la grande distribution, et l'un des plus fidèles clients de l'agence.
>
> Le projet consiste à construire un réseau social interne pour les employés de Groupomania. Le but de cet outil est de faciliter les interactions entre collègues. Le département RH de Groupomania a imaginé plusieurs fonctionnalités pour favoriser les échanges entre collègues.

## Objectifs

- Authentifier un utilisateur et maintenir sa session
- Implémenter un stockage de données sécurisé en utilisant une base de données
- Développer l’interface d’un site web grâce à un framework front-end

## Installation

### 1. MySQL
Télécharger tout d'abord MySQL, si vous ne l'avez pas encore 
je vous invite à vous rendre sur cette page qui vous expliquera point par point comment l'obtenir et l'installer sur votre machine  : [Guide d'installation MySQL](https://openclassrooms.com/fr/courses/6971126-implementez-vos-bases-de-donnees-relationnelles-avec-sql/7152681-installez-le-sgbd-mysql)

Une fois installé ouvrez un terminal et connectez-vous à MySQL en tapant la commande suivante : 
```bash
mysql -u root -p
```
Il vous sera demandé de saisir votre mot de passe dans le cas où vous n'en avez pas appuyé sur la touche 'Entrer'

**ATTENTION** : Pour des raisons de sécurité il est recommandé d'en avoir un !

Maintenant que vous êtes connecté à MySQL vous allez pouvoir créer la base de données en utilisant la commande suivante :

```bash
CREATE DATABASE groupomania;
```

**RAPPEL** : Dans le cas où vous n'utiliseriez pas le nom de groupomania pensez à modifier les informations d'accès à la base de données dans le dossier 

*backend/database/mysql_connexion.js* 

pensez à bien remplir les différents champs si vous avez configuré un mot de passe pensez également à bien le remplir dans quel cas vous rencontrerez des problèmes par la suite !


#### Installation de la base de données

Maintenant que vous avez finis d'installer MySQL et créer la base de donnée il est temps de créer les différentes tables, pour cela rien de plus simple
récupérer le projet et ouvrez un terminal depuis la racine du projet c'est à dire depuis

```bash
/projet-7-oc 
```

Cela doit être la dernière mention affichée dans votre terminal avant le champ de saisie

et saisissez la commande suivante : 

```bash
mysql -u root -p groupomania < ./backend/database/create_db.sql --default-character-set=UTF8
```
**RAPPEL** : Dans le cas où vous n'avez pas choisi '*groupomania*' comme nom de base de donnés pensez à remplacer groupomania

par le nom de votre base de données



Si tout s'est bien passé vous ne devriez pas avoir de message s'afficher.



### 2. Redis



Télécharger également Redis, s'il n'est pas présent sur votre machine je vous invite à suivre le guide d'installation

présent sur le site officiel : [Guide d'installation Redis](https://redis.io/docs/getting-started/)

**RAPPEL** : Dans le cas où vous seriez sous windows pensez à lancer les services redis via la commande suivante :

```bash
sudo service redis-server start
```

Autrement vous risquerez de rencontrer des erreurs avec redis dès l'authentification.


### 3. Installer Node



Télécharger Node afin de pouvoir lancer le serveur [Télécharger Node](https://nodejs.org/en/)



### 4. Installer les packages



Placez-vous à présent dans le dossier backend et ouvrez un terminal afin d'installer les différentes librairies

nécessaire au bon fonctionnement du projet:



*projet-7-oc/backend*



Puis utilisez la commande suivante :



```bash

npm install

```



Faites la même chose dans le dossier frontend



*projet-7-oc/Groupomania*



### 5. Avant de démarrer le projet



Avant de lancer le projet assurez-vous d'être connecté à MySQL et effectuez ses commandes dans l'ordre



```bash

mysql -u root -p

```

Puis une fois connecté à MySQL exécutez cette commande :

```bash

SET GLOBAL sql_mode='';

```

Vous devriez voir s'afficher un message indiquant :



"*Query OK, 0 rows affected*"

Pensez également à créer un dossier 'images' dans le dossier backend, voici a quoi cela devrait ressembler : 

*projet-7-oc/backend/images*


### 5. Démarrer le projet



Depuis le dossier backend exécutez la commande suivante :



```bash

nodemon server

```

Depuis le dossier Groupomania exécutez la commande suivante :



```bash

npm run dev

```



Et voilà le tour est joué il ne vous reste plus qu'à profiter !
