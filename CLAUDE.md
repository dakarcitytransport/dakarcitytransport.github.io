# Consignes pour Claude — appli « Dakar City Transport » (DCT)

Fichiers : `dct-app.html` (appli principale, `APP_VERSION`), `departs.js` (module chargé par
dct-app.html, `DEP_VERSION` ; à chaque modification de departs.js, monter aussi `APP_VERSION`,
sinon les téléphones gardent l'ancienne copie en cache), `mamadou.html` (`MAMADOU_VERSION`),
`chauffeur.html` (`CHAUFFEUR_VERSION`), `facture.html`. Historique détaillé de tout ce qui a été fait,
avec les phrases de Cobey : **`MAJ-A-FAIRE.md`**. **À lire en premier : `RESUME-CONVERSATION-2026-11-03.md`**
(contexte, décisions, incident des fiches France, ce qui reste à faire).

## Comment travailler avec Cobey (Eric Koy)
- Non technique, parle en français, messages dictés à la voix (souvent déformés) : comprendre
  l'intention, ne pas relever les fautes. **Réponses courtes, en français simple.**
- **« Ne code pas » = on discute / on propose seulement** (une prévisualisation privée est possible).
  **« ok », « fait », « vas-y » = implémenter.** Ne pas coder sans cet accord.
- Il en a assez des listes d'options et des longues explications : donner une recommandation.
- Il n'aime pas ce qui est « fouillis » : peu de boutons, des menus plutôt que des rangées de puces.

## Routine à chaque modification
1. Monter les versions concernées (`APP_VERSION` toujours si departs.js change).
2. Tester (Playwright + faux Firebase ; balayage des 17 écrans) ; ne rien affirmer sans l'avoir testé.
3. Ajouter une entrée datée à `MAJ-A-FAIRE.md`, avec la citation de Cobey.
4. Commit (avec les lignes d'attribution), push sur la branche de la session, puis fast-forward sur `main`.
5. Répondre en quelques lignes : ce qui change, où le trouver, **quelle version attendre** après
   réouverture du raccourci iPhone (ex. « attends v3.99.134 »).

## Base de données (Firebase Realtime Database, projet `dakar-collecte`)
- Lecture seule possible avec le compte `lecteur@dakarcitytransport.app` : les identifiants sont dans les
  variables d'environnement `FIREBASE_LECTEUR_EMAIL` / `FIREBASE_LECTEUR_MOTDEPASSE` (jamais dans un fichier,
  jamais dans le chat). Connexion : API REST Firebase Auth (clé web publique dans dct-app.html), puis
  `https://dakar-collecte-default-rtdb.europe-west1.firebasedatabase.app/<chemin>.json?auth=<idToken>`.
  Ce compte ne peut PAS écrire ; ne jamais utiliser le compte staff du code.
- Règles Firebase d'avant l'ajout du lecteur : `firebase-rules-sauvegarde-2026-11-03.json`.
- Corbeille de 30 jours : `dct_corbeille/` (voir « Corbeille » dans Réglages de l'appli).

## À traiter avec Cobey (sécurité)
- Le mot de passe du compte `staff@` est écrit en clair dans `departs.js` (dépôt probablement public) :
  à changer et à sortir du code, en discutant d'abord de la connexion.
