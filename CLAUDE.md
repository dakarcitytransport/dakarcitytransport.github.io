# Consignes pour Claude — appli « Dakar City Transport » (DCT)

Fichiers : `photos.js` (photos de profil, `dct_profils_photos/<ID>` dans Firebase), `look.js` + `look-v2.css` (**V2**, nouveau look — voir « Look V1 / V2 » plus bas), `dct-app.html` (appli principale, `APP_VERSION`), `departs.js` (module chargé par
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

## Sécurité — connexion à la base (état au 03/11/2026)
- Plus aucun mot de passe de compte dans le code. Le **Worker Cloudflare** (`cloudflare-worker.js`, route `POST /auth`)
  vérifie le PIN / le mot de passe de Mamadou / le code chauffeur / le code secret d'un téléphone (Face ID), puis
  remet un jeton Firebase portant `staff:true` ; les règles Firebase l'acceptent (`auth.token.staff == true`).
  Avant le PIN, l'appli ne lit que ce que le Worker lui donne (`mode: 'public'`). Si le Worker est coupé, personne
  ne peut se connecter (message « Connexion impossible »).
- **Reste à faire par Cobey** : désactiver le compte `staff@dakarcitytransport.app` dans Firebase (Authentication >
  Users) après quelques jours stables, puis retirer `auth.token.email == 'staff@…'` des règles (garder `lecteur@…`
  en `.read` seulement). L'ancien mot de passe reste lisible dans l'historique GitHub : tant que le compte n'est pas
  désactivé, il ouvre encore la base.
- Mamadou a un mot de passe de 4 chiffres seulement (le Worker limite à 10 essais / 15 min / adresse).

## Look V1 / V2 (04/11/2026)
- **V1** = l'apparence actuelle (intacte). **V2** = le nouveau look, posé comme une COUCHE par-dessus : la classe `look-v2` sur
  `<html>` active `look-v2.css`. Sans elle, l'appli est exactement la V1 : revenir en arrière = retirer la classe.
- Le look de toute l'équipe est dans Firebase `dct_config/look` (`'v1'`|`'v2'`) ; seul Eric (AD) le change : Réglages > APPARENCE.
  `LOOK_DEFAUT` (en haut de `look.js`) = **`'v2'` depuis le 04/11/2026 (mise en ligne pour toute l'équipe)** ; Eric peut tout remettre en V1
  d'un geste (Réglages > Apparence, écrit `dct_config/look='v1'`). Eric peut aussi « Essayer V2 » sur son téléphone seulement (`dct_look_test`). Clair / sombre / automatique : choix
  personnel dans V2 (`dct_look_mode`).
- `look-v2.css` est GÉNÉRÉ par `tools/gen_look_css.py` (`python3 tools/gen_look_css.py look-v2.css`) : modifier le générateur, pas le fichier.
  À chaque commit : monter aussi `?v=` du `<link href="look-v2.css?v=…">` dans le `<head>` de `dct-app.html` (même numéro qu'`APP_VERSION`).
- IMPORTANT : à chaque commit, monter aussi `?v=` du `<link href="look-v2.css?v=…">` (sinon les téléphones gardent l'ancien style).
- Fait en V2 : écran de connexion (espaces + profils), accueil (Espaces), Réglages > Apparence. Reste : les ~70 autres écrans, et le
  remappage automatique des couleurs écrites en dur (pour le mode sombre). Tester V2 avec `localStorage.dct_look_test='v2'`.
