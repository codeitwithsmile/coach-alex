# Mettre Coach Alex en ligne avec Firebase (gratuit, hébergé en Europe)

Durée : environ 20 minutes. Il faut un compte Google et un ordinateur (PC ou Mac).
Rien n'est à payer et aucune carte bancaire n'est demandée (plan Spark).

## 1. Créer le projet Firebase (5 min)

1. Ouvrez https://console.firebase.google.com et cliquez sur **Créer un projet**.
2. Nom : `coach-alex` (Firebase ajoute un suffixe, par exemple `coach-alex-7f3a2`). Désactivez Google Analytics (inutile ici). Créez.
3. Dans le menu de gauche, **Build → Authentication → Commencer**. Onglet *Sign-in method* : activez **E-mail/Mot de passe** (le premier interrupteur seulement). Enregistrez.
4. Toujours dans Authentication, onglet **Users → Ajouter un utilisateur** : saisissez l'e-mail du coach et un mot de passe solide (12 caractères ou plus). C'est le compte coach.
5. **Build → Firestore Database → Créer une base de données**. Emplacement : choisissez **europe-west9 (Paris)** si proposé, sinon **europe-west1 (Belgique)** ou **eur3**. Mode : **production** (les règles seront remplacées à l'étape 3). Créez.
6. **Build → Hosting → Commencer** : cliquez sur Suivant jusqu'à la fin sans rien installer (on le fait à l'étape 3).
7. Roue dentée en haut à gauche → **Paramètres du projet** → tout en bas, **Vos applications → icône `</>` (Web)**. Surnom : `coach-alex-web`. Ne cochez pas Hosting ici. Enregistrez, puis copiez le bloc `firebaseConfig` affiché : il contient `apiKey`, `authDomain`, `projectId`, `appId`.

## 2. Renseigner la configuration (2 min)

Dans le dossier `firebase/`, copiez `coach-config.example.json` en `coach-config.json` et remplissez :

```json
{
  "coachEmail": "l-email-du-coach@exemple.fr",
  "firebase": {
    "apiKey": "…",
    "authDomain": "coach-alex-7f3a2.firebaseapp.com",
    "projectId": "coach-alex-7f3a2",
    "appId": "…"
  }
}
```

`coachEmail` doit être exactement l'e-mail créé à l'étape 1.4 : c'est lui qui a tous les droits.

Puis, à la racine du projet : `python3 tools/build_firebase.py`
(ou envoyez-moi ce fichier et je vous renvoie le dossier prêt).

Cela génère `firebase/public/index.html`, `firebase/public/config.js`, `firebase/firestore.rules` et `firebase/.firebaserc`.

## 3. Déployer (5 min)

Installez Node.js (https://nodejs.org, version LTS) si ce n'est pas déjà fait, puis dans un terminal :

```bash
npm install -g firebase-tools
cd firebase
firebase login
firebase deploy
```

`firebase login` ouvre le navigateur pour vous connecter au compte Google du projet.
`firebase deploy` envoie le site et les règles de sécurité. À la fin, l'adresse s'affiche : `https://coach-alex-7f3a2.web.app`.

Pour chaque nouvelle version : remplacer les fichiers, `python3 tools/build_firebase.py`, puis `firebase deploy`.

## 4. Première ouverture

1. Ouvrez l'adresse sur le téléphone du coach, « Ajouter à l'écran d'accueil ».
2. Pied de page → **Espace coach** → e-mail et mot de passe de l'étape 1.4.
3. Pour tester avec des données : **Plus → Compta → Restaurer une sauvegarde** avec `coach-alex-exemples.json`.

## Comment les clients entrent

1. Le coach valide le bilan d'un client : l'app affiche un code à 6 chiffres (retrouvable dans la fiche, bouton Actions).
2. Le client ouvre le site, **Se connecter → Créer mon compte** : son e-mail, un mot de passe, le code.
3. Il arrive dans son espace. Les règles de sécurité côté serveur ne lui laissent voir et modifier que ses propres documents ; les bibliothèques (leçons, recettes, challenges…) sont en lecture seule.

Avec Google : le client saisit le code puis « Continuer avec Google », aucun mot de passe à créer. Un compte Google et un compte e-mail/mot de passe avec la même adresse sont le même compte.

Mot de passe oublié (coach ou client) : lien sur la mire, Firebase envoie un e-mail de réinitialisation.

Connexion Apple : possible aussi, mais Apple exige un compte développeur payant (99 $/an) pour l'activer ; Google couvre déjà iPhone et Android.

## Paiement en un clic

Plus → Compta → **Moyens de paiement** : lien PayPal.Me (par exemple `paypal.me/coachalex`), identifiant Lydia, consigne libre. Aucune coordonnée bancaire (RIB, IBAN, carte) n'est saisie ni stockée dans l'application : le paiement a lieu chez PayPal ou Lydia. Il faut un compte PayPal (Business de préférence, obligatoire pour un usage professionnel ; PayPal prend sa commission sur chaque encaissement).

Côté client, chaque séance ou suivi à régler affiche « Payer X € avec PayPal » (montant pré-rempli) et « J'ai payé ». Côté coach, « À faire » affiche « Nahia dit avoir payé 90 € » avec un bouton **Confirmer** après vérification sur PayPal ou la banque. Les règles de sécurité empêchent un client de marquer lui-même une séance payée : il ne peut que la déclarer.

## Nom de domaine (optionnel, ~10 €/an)

Hosting → **Ajouter un domaine personnalisé** : suivez les instructions (deux enregistrements DNS à copier chez le registrar). HTTPS est automatique. Ajoutez ensuite ce domaine dans **Authentication → Settings → Domaines autorisés**, sinon « Continuer avec Google » refusera.

## Ce qu'il faut savoir

- Quotas gratuits : 50 000 lectures et 20 000 écritures par jour, 10 Go de trafic par mois. Un coach avec 20 clients reste très loin de ces limites. Si un quota est dépassé, le service se bloque jusqu'au lendemain, il ne facture jamais.
- Pas de stockage de fichiers sur le plan gratuit : les vidéos d'exercices ne sont pas disponibles dans cette version.
- Le questionnaire public « Devenir client » peut être rempli sans compte (c'est voulu). Si des faux bilans apparaissent un jour, on activera App Check.
- Sauvegarde : Plus → Compta → Télécharger une sauvegarde, à faire régulièrement. Firebase garde aussi vos données, mais une sauvegarde à vous ne coûte rien.
- Les règles de sécurité (`firestore.rules`) n'ont pas pu être exécutées dans un émulateur ici : au premier déploiement, testez le parcours client avec un faux client et signalez tout message « Accès refusé ».
