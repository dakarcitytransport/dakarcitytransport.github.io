# Mises à jour à faire — DCT

Notes prises le 22/09/2026, à traiter à partir du 23/09.
Rien de tout cela n'est codé. Les points marqués **?** sont à préciser
avant de commencer.

---

## Règle de rédaction (Cobey, 24/09/2026)

> « Je te dis juste des consignes, à titre informatif. Tu n'es pas obligé
> de tout remettre sur l'application. »

Une consigne dit **pourquoi** construire quelque chose. Elle n'a pas à
être recopiée à l'écran. Pas de phrase d'introduction qui répète la
raison d'être d'un écran à ceux qui s'en servent déjà tous les jours.

Une seule exception, validée le 24/09 : une phrase qui **explique
pourquoi un chiffre affiché n'est pas celui qu'on attendrait** reste
utile. Les quatre encore en place sont les deux caisses séparées, la
livraison hors bénéfice, le périmètre du Bilan, et le Mali affrété par
un prestataire.

---

## 1 · Droits et profils

- ~~**Connexion par Face ID / empreinte.**~~ *Fait le 26/09 (v3.92.0 /
  v2.8.0).* Cobey : « est-il possible d'accéder à chaque profil par la
  reconnaissance faciale ? ». Pas une vraie reconnaissance faciale
  (deviner tout seul qui pose son visage devant n'importe quel téléphone
  de l'équipe — ça suppose de garder le visage de chacun quelque part,
  une vraie question de vie privée) : « ah nan la version 2 je veux pas
  ça, je veux un collaborateur sur son téléphone ». Face ID (iPhone) ou
  l'empreinte (Android) remplacent donc le code PIN, sur son propre
  téléphone, une fois qu'on a déjà choisi son nom — exactement comme ces
  capteurs déverrouillent déjà l'appareil lui-même.

  Proposé une fois, juste après une connexion réussie par PIN (jamais
  si déjà activé ou déjà refusé sur ce téléphone). La clé créée à
  l'activation (WebAuthn) reste enfermée dans le téléphone — rien
  n'est envoyé à Firebase ni ailleurs, seul un petit repère local
  (« ce téléphone a une clé pour Samba ») est gardé sur l'appareil. Une
  fois activée, ouvrir son nom tente Face ID/l'empreinte en premier,
  avant même d'afficher le clavier du code — qui reste disponible si la
  biométrie échoue ou n'est pas encore activée.

  *Ne remplace le code que sur les téléphones utilisés par une seule
  personne habituellement — sur un appareil partagé entre plusieurs
  collaborateurs, mieux vaut continuer à taper le code.*

  **v2.8.1 :** Cobey a demandé ce qui s'affichait sur Android — bonne
  remarque, le texte disait toujours « l'empreinte digitale » à tort
  (certains Android utilisent aussi le visage). Texte neutre qui ne
  présume plus laquelle des deux c'est, sauf pour l'iPhone où Face ID
  reste la norme.

  **v2.8.2-v2.8.3 : rien ne se proposait, même Face ID bien réglé.**
  Cobey a testé en vrai : après le code, aucune proposition. Un
  diagnostic temporaire (v2.8.2) a trouvé la cause exacte : « aucun
  capteur biométrique détecté (réponse : false) ». Pas son téléphone —
  depuis iOS 26.2, Apple a durci `isUserVerifyingPlatformAuthenticator
  Available()` pour qu'elle ne réponde « oui » que s'il existe déjà au
  moins une clé, ce qui la rend impossible à satisfaire avant même la
  toute première activation (et elle est connue pour répondre « false »
  à tort dans d'autres cas sur iOS). Ce test préalable n'avait donc plus
  rien de fiable — retiré en v2.8.3 : c'est désormais la création de la
  clé elle-même qui sert de seul vrai test, avec un message clair en cas
  d'échec.

  Au passage (v2.8.3) : les messages du diagnostic, comme plusieurs
  autres dans Planning et la case Notification, affichaient des accents
  en toutes lettres (« biom&eacute;trique » au lieu de « biométrique »)
  — un `toast()` affiche du texte brut, pas du HTML, contrairement au
  reste de l'écran ; toutes les entités HTML qui s'y étaient glissées
  sont corrigées.

- ~~**Planning et Notification manquaient dans le fil Activité.**~~
  *Fait le 26/09 (v3.93.0 / v2.9.0).* Cobey : « chaque action du
  collaborateur doit y être inscrite ». Le fil Activité (onglet du bas,
  pastille rouge) couvrait déjà départs, clients, dispatch, France — mais
  rien de ce qui a été construit cette semaine. Ajoutés : poser/retirer sa
  disponibilité, une correction ou un ajout d'intervenant ponctuel par un
  admin, une relance envoyée (Planning), un message envoyé à toute
  l'équipe (case Notification), et l'activation de Face ID/l'empreinte.
  Comme pour le reste de l'app, un admin (Eric) reste invisible dans ce
  fil — règle déjà en place, pas quelque chose d'ajouté ici.

- **Sécurité de la base Firebase.** *Rouvert le 09/10 — voir Étape 3
  plus bas, en cours.* Cobey : « il manquerait une étape qu'on n'avait
  pas faite » côté sécurité. Vrai trou : la base Firebase était ouverte
  à qui connaissait son adresse (visible dans le code de l'application),
  sans rien qui prouve que la demande vient bien de l'application
  elle-même.

  **Étape 1, déjà faite depuis le 31/08** — la connexion anonyme à
  Firebase (« badge invisible », aucun écran, aucun mot de passe) :
  `_depConnexionAnonyme` dans departs.js, posée sur `initFirebase()`,
  avec `firebase-auth-compat.js` préchargé en parallèle
  (`_depPrechargerFirebaseAuth`) — présente aussi dans `chauffeur.html`
  et `facture.html` (`_connexionAnonyme`). Cobey a activé
  l'authentification anonyme dans la console Firebase (Authentication →
  Sign-in method → Anonymous) et vérifié qu'un utilisateur apparaît bien
  après ouverture de l'application.

  *Au passage : sans le savoir (l'historique de cette étape remonte à
  avant cette session), une deuxième connexion anonyme avait été
  ajoutée par erreur directement dans dct-app.html — doublon avec
  `_depConnexionAnonyme`, retiré aussitôt repéré (v3.93.2).*

  **Étape 2, faite le 26/09** — règles resserrées dans la console
  Firebase (Realtime Database → Rules) :
  ```json
  { "rules": { ".read": "auth != null", ".write": "auth != null" } }
  ```
  Une seule règle à la racine plutôt qu'un détail par chemin : les trois
  points d'entrée (application, chauffeur, facture) passent tous par la
  même connexion anonyme, il n'y a pas de chemin qui doive rester public.
  Vérifié en conditions réelles par Cobey : connexion normale, lien
  chauffeur et facture fonctionnent toujours.

  **Oublié dans ce tour d'horizon, découvert par Cobey en vrai :** un
  quatrième point d'entrée — `cloudflare-worker.js`, qui tourne à part,
  sans jamais ouvrir l'application. Il parlait à Firebase par simples
  requêtes, sans la moindre connexion : dès les règles resserrées, ses
  lectures/écritures ont commencé à échouer (« j'ai envoyé une
  notification, rien reçu après trois minutes »). Corrigé (v1.3.0) :
  connexion anonyme réécrite en requêtes brutes (le fichier n'a pas le
  SDK Firebase) — voir `jetonAuth` — avec le jeton gardé en mémoire et
  réutilisé tant qu'il reste valable, pour ne pas créer un nouvel
  utilisateur anonyme à chaque réveil du minuteur. **À recoller chez
  Cloudflare** (Overview → Edit code → coller le fichier à jour →
  Deploy), sinon les notifications restent bloquées.

  **Étape 3, en cours (v2.20.37), le 09/10 — la connexion anonyme ne
  suffisait pas.** Cobey a reçu une nouvelle alerte Firebase malgré
  l'Étape 2. Raison : une connexion ANONYME ne prouve rien — n'importe
  qui connaissant la clé publique Firebase (visible dans le code, ça
  fait partie du fonctionnement normal) peut s'authentifier anonymement
  lui-même, directement, sans jamais ouvrir l'application. La règle
  `auth != null` de l'Étape 2 était donc vraie pour N'IMPORTE QUI, pas
  seulement pour l'appli.

  `_depConnexionAnonyme` (departs.js) devient `_depConnexionStaff` :
  l'appli des collaborateurs se connecte désormais avec un vrai compte
  (email/mot de passe dédié), ce qui permet aux règles de distinguer
  l'appli (`auth.provider == 'password'`) des pages publiques, qui
  restent en connexion anonyme inchangée (`facture.html`,
  `chauffeur.html`, `mamadou.html` — chacune garde sa propre copie du
  mécanisme, non touchée).

  Nouvelles règles écrites par section, plutôt qu'une seule règle
  globale : accès complet réservé au compte staff ; les 3 pages
  publiques n'ont accès qu'aux chemins précis dont chacune a
  effectivement besoin (établi en lisant entièrement leur code),
  jamais à la base entière, et jamais en écriture libre (champs
  autorisés listés un par un pour les pages qui modifient des fiches
  client).

  **Limite assumée, pas encore résolue :** `chauffeur.html` (l'écran
  Chartres) et surtout `mamadou.html` sont codés aujourd'hui pour
  télécharger des noeuds ENTIERS plutôt qu'un client précis à la fois
  (ex. `mamadou.html` charge tous les clients Collecte, tous les
  clients Dépôt, tous les clients France, à chaque connexion — pas
  seulement ceux de ses propres livraisons). Fermer ça pour de vrai
  demande de réécrire la façon dont ces deux pages chargent leurs
  données, pas seulement les règles — laissé en lecture ouverte pour
  l'instant (jamais en écriture) pour ne rien casser en production.
  À reprendre dans un prochain passage si Cobey le souhaite.

  Reste à faire pour boucler cette étape : Cobey crée le compte
  `staff@dakarcitytransport.app` dans la console (Authentication →
  Sign-in method → activer Email/Password, puis Users → Add user),
  vérifie que l'appli se connecte bien avec ce compte une fois le code
  déployé, PUIS seulement colle les nouvelles règles dans Realtime
  Database → Rules — jamais l'inverse, sinon l'appli entière perd
  l'accès à la base le temps que le compte existe.

- ~~**Ablaye** passe administrateur, comme Issyaka.~~
  **Fait le 24/09 (v1.55.0).** Abdoulaye (AB) rejoint la direction, aux
  mêmes conditions qu'Issyaka : il garde son profil, son PIN et sa
  couleur, et voit en plus DÉPARTS, RAPPORT FINANCIER, STATISTIQUES et
  RÉGLAGES. Seule la case MAINTENANCE (passe-partout) reste à Cobey —
  comme pour Issyaka.
- ~~**Le bouton « Relancer » aussi.**~~ *Fait le 26/09 (v3.89.2 /
  v2.5.2).* Cobey : « le bouton relancer laisse dans la modification et
  non dans la lecture seule ». Oubli du commit précédent — c'est une
  action, comme les corrections, elle n'a rien à faire dans la lecture
  seule.

- ~~**Les corrections passent derrière un bouton « Modifier ».**~~
  *Fait le 26/09 (v3.89.1 / v2.5.1).* Cobey, aussitôt après la
  fonctionnalité précédente : « les modifications […] doivent se faire
  dans un menu de gestion à part, car là elles sont faisables directement
  dans chaque jour, une fausse manœuvre est vite arrivée. Faut un bouton
  pour modifier le jour de planning ».

  L'onglet Équipe est maintenant en pure lecture par défaut — les
  boutons Dispo/Pas dispo/Effacer et « + Ajouter quelqu'un » n'existent
  dans la page que pour le dimanche dont on a ouvert
  **« ✏️ Modifier ce dimanche »**. Un seul dimanche modifiable à la fois ;
  la carte se souligne en orange pendant ce temps, et
  **« ✅ Terminer la modification »** referme tout.

- ~~**L'admin peut corriger le planning, et ajouter des ponctuels.**~~
  *Fait le 26/09 (v3.89.0 / v2.5.0).* Cobey : « même si un collaborateur
  dit qu'il est dispo mais qu'au final non, l'admin peut moduler le
  planning, car il se peut que l'autre collaborateur ne changera pas son
  statut ». Et : « il va falloir que les admins puissent mettre des
  intervenants externes (chauffeur externe, aide d'un neveu) — des
  personnes ponctuelles ».

  Sous chaque collaborateur, dans l'équipe (Direction + Aminata
  seulement) : trois petits boutons **Dispo / Pas dispo / Effacer**, qui
  écrivent à sa place. La personne concernée voit alors « modifié par
  Eric » à la place de « répondu le » sur sa propre fiche, pour
  comprendre que ce n'est pas elle qui a changé quoi que ce soit.

  Sous l'équipe, une section **Intervenants ponctuels** : un bouton
  « + Ajouter quelqu'un pour ce dimanche » ouvre un petit formulaire
  (nom, mot facultatif, Disponible/Pas dispo). Ces personnes n'ont pas de
  profil ni de connexion ; elles n'existent que pour ce dimanche-là, et
  les mêmes trois boutons servent à corriger ou retirer leur fiche.
  Volontairement en dehors des compteurs « X dispo / X non » de l'équipe
  fixe, pour ne pas les rendre illisibles d'une semaine à l'autre.

- ~~**Le délai de réponse : jeudi 22h, sinon absent d'office.**~~ *Fait le
  26/09 (v3.90.0 / v2.6.0 côté application ; v1.1.0 côté Cloudflare — à
  recoller chez Cloudflare pour que les rappels et le couperet partent
  réellement, voir plus bas).* Cobey : « si le collaborateur n'a pas
  répondu avant le jeudi 22h précédent le dimanche, il ne pourra plus
  répondre et sera considéré comme absent, seuls les admins pourront
  modifier ça ! […] des notifications push automatique avant et après
  l'heure de 22h ». Puis, en cours de route : « notification le lundi
  également pour rappeler de valider leur disponibilité pour le dimanche
  en cours ».

  **Le délai lui-même** (application) : passé jeudi 22h, plus aucun
  bouton pour un collaborateur — sa fiche affiche son statut final
  (« Noté disponible » / « Noté absent » / « Absent d'office » s'il n'a
  rien mis) et un mot expliquant que seule la direction peut encore
  changer ça. Avant l'échéance, un rappel du délai s'affiche tant qu'il
  n'a pas répondu. Direction + Aminata gardent la main à tout moment,
  verrouillé ou non — un badge « 🔒 verrouillé » le leur signale dans
  L'équipe.

  **Les rappels et le couperet** (Cloudflare, tourne même appli fermée) :
  trois rappels à ceux qui n'ont encore rien mis — lundi 9h, mercredi
  20h, jeudi 18h — puis, jeudi 22h passé, une fiche « absent » écrite
  d'office pour les silencieux et une notification de statut final
  (disponible ou absent) envoyée à chacun des cinq, pas seulement aux
  absents. Ce fichier ne connaît pas l'équipe par lui-même : l'application
  lui laisse un mémo à jour (`dct_planning_participants`) chaque fois que
  la case Planning s'affiche.

  *Recollé chez Cloudflare le 26/09, vérifié en ouvrant l'adresse du
  Worker : `"planning"` apparaît bien à côté de `"envoi"`.*

  **v2.6.1 :** Cobey, après avoir vu l'aperçu des nouveaux messages :
  « je veux en revoir un pour tester ». Un deuxième bouton d'essai,
  à côté de celui déjà en place, réservé à la direction et Aminata :
  « Tester le rappel du délai (texte réel) », dans Planning. Il envoie,
  à soi-même, exactement le texte que recevront lundi/mercredi/jeudi
  ceux qui n'ont pas répondu — pas juste la confirmation générique de
  l'autre bouton.

  **v2.6.2 :** Cobey, capture d'écran à l'appui : « le texte sur les
  notifications n'est pas toujours correct. Il n'est jamais correct, si
  je puis dire » — les accents s'affichaient en toutes lettres
  (« r&eacute;ussi » au lieu de « réussi »). Les deux textes d'essai
  ci-dessus avaient été écrits avec des entités HTML (`&eacute;` et
  consorts), qui ne veulent rien dire pour une vraie notification — ce
  n'est pas une page web, le texte s'affiche tel quel. Corrigé : texte
  brut, accents normaux.

  **v2.6.3 :** Eric, capture d'écran à l'appui : « moi, il me met absent
  alors que je ne participe pas. Il faudrait changer ça et je pense que
  Aminata doit aussi avoir la même chose ». « Mes disponibilités »
  n'avait jamais vérifié qui a vraiment une disponibilité à donner — Eric
  et Aminata, exclus de Planning depuis le début (ils organisent, sans
  rouler le dimanche), s'y voyaient quand même proposer des boutons, puis
  un « Noté absent » trompeur une fois le délai passé. Corrigé : pour eux
  deux, cet onglet affiche désormais un simple rappel de leur rôle
  d'organisateurs, sans bouton ni statut — la place pour suivre les
  réponses reste « L'équipe », déjà correcte de son côté.

  **v1.4.0 (Cloudflare) :** Eric : « Rajoute moi, j'ai besoin de savoir
  quand sa sera envoyer, pour vérifier si c fonctionnel ». Il n'est
  toujours pas participant (il n'organise, ne roule pas le dimanche),
  mais reçoit désormais, en plus, une notification à chaque étape du
  minuteur — les trois rappels et le résultat final — même les semaines
  où personne n'a besoin d'être relancé (« Personne à relancer, tout le
  monde avait déjà répondu »), pour vérifier que le Worker tourne
  réellement.

  **v1.4.1 (Cloudflare) :** Cobey : « Pour le résultat final on vas
  plutôt le décaler à vendredi matin 10h ! Jeudi 22h sa peut être tard ».
  Seul l'*envoi* de la notification de statut final (disponible/absent,
  à chacun des cinq, et le résumé chiffré à Eric) est décalé au
  lendemain matin 10h — le délai lui-même, et l'absence d'office pour
  qui n'a rien répondu, restent inchangés à jeudi 22h.

- ~~**La notification de relance amène directement sur Planning.**~~
  *Fait le 26/09 (v3.89.3 / v2.5.3).* Cobey : « comment ça sera quand
  l'équipe recevra les notifications de rappel ? ». En touchant la
  notification, l'équipe se retrouvait sur l'application, mais pas
  forcément sur l'écran Planning — il fallait rouvrir la case soi-même.
  Corrigé dans les deux cas : application fermée (l'adresse ouverte porte
  la destination) et application déjà ouverte en arrière-plan (le service
  worker prévient l'onglet, qui navigue tout seul).

- ~~**Planning, corrigé après le premier essai.**~~ *Fait le 26/09
  (v3.88.2 / v2.4.2).* Cobey, après avoir testé avec Samba :
  - la case Planning passe **avant** Collecte, et porte sa propre icône
    (une main levée) — elle partageait celle de Collecte ;
  - **Eric et Aminata retirés de la liste des participants** : ils
    organisent et relancent, mais ne roulent pas le dimanche — seuls les
    5 collecteurs (Issyaka, Abdoulaye, Samba, Ibrahima, Boubacar) donnent
    une disponibilité ;
  - **« Retirer ma réponse »** : on peut revenir à « rien mis », pas
    seulement basculer entre Oui et Non ;
  - **la date et l'heure** de chaque réponse s'affichent, dans l'équipe
    comme sur sa propre fiche.

  Au passage, `_depEspaceDe` — déjà appelée ailleurs via
  `window._depEspaceDe` sans jamais avoir été exportée — est maintenant
  exposée : les futures notifications par espace (colis 30 jours,
  paiement, camion) pourront s'en servir.

- ~~**Case Planning**~~ — *faite le 26/09 (v3.88.0 / v2.4.0).*
  Le problème d'Issyaka : ses frères ne répondaient pas toujours quand il
  demandait qui serait là le dimanche, et il ne pouvait pas décider s'il
  fallait un chauffeur externe.

  Chacun pose ses disponibilités à l'avance sur les 5 dimanches à venir,
  avec un mot facultatif. Tout le monde consulte le tableau de l'équipe —
  qui est dispo, qui ne l'est pas, **et qui n'a rien mis**, ce que WhatsApp
  ne savait pas montrer. La direction et Aminata peuvent relancer ceux qui
  n'ont rien mis ; la relance part dans une file que Cloudflare videra.

  **Reste :** brancher l'envoi (voir les notifications ci-dessous). En
  attendant, la relance se dépose mais ne part pas.

- ~~**Notifications sur le téléphone.**~~ *Fait le 26/09 (v3.87.0 /
  v2.3.0 pour la partie application ; Cloudflare recollé et vérifié le
  même jour pour l'envoi réel).* Manifeste, service worker (sans aucun
  cache, pour ne jamais bloquer l'équipe sur une vieille version),
  demande d'autorisation, abonnement rangé dans `dct_push/<téléphone>`,
  bandeau qui explique aux iPhone qu'il faut d'abord ajouter l'application
  à l'écran d'accueil, et `cloudflare-worker.js` qui vide la file toutes
  les minutes.

  **Trois notifications automatiques par évènement métier avaient été
  envisagées** (colis en attente depuis 30 jours, paiement encaissé,
  camion qui a fini sa tournée) — abandonnées avant d'être construites.
  Cobey, le 26/09/2026 : « on va changer de méthode […] une case
  notification pour les admin, moi et Aminata, qui va permettre d'envoyer
  une notification à tout le monde, moi y compris ». Plus simple qu'une
  détection automatique : voir la case **Notification** ci-dessous.

- ~~**Case Notification.**~~ *Fait le 26/09 (v3.91.0 / v2.7.0).* Un
  message libre, écrit par la direction ou Aminata, envoyé immédiatement
  à toute l'équipe — l'auteur compris, pour qu'il voie lui-même que ça
  part bien. Réservée à Issyaka, Abdoulaye, Aminata et Cobey (case
  `annonce`, dans `DEP_CASES_BUREAU` pour Aminata, incluse d'office pour
  la direction). Chaque envoi garde une trace dans un petit historique
  sous le champ de saisie (qui a écrit quoi, et quand), séparé de la file
  d'envoi qui se vide au fur et à mesure — l'historique, lui, reste.

- ~~**Le titre des notifications se répétait.**~~ *Fait le 26/09
  (v3.91.1 / v2.7.1, et v1.2.0 côté Cloudflare — à recoller).* Cobey,
  capture d'écran à l'appui : « Dakar City Transport, from Dakar City
  Transport […] ça parle deux fois du titre ». L'iPhone affiche déjà tout
  seul le nom de l'application (celui du manifeste) en gras ; toutes nos
  notifications reprenaient ce même nom comme titre, que l'iPhone
  affichait donc une seconde fois, précédé de « from ». Chaque
  notification a maintenant un titre court et différent : « Planning »
  pour les rappels et résultats, « Essai » pour le bouton de test.

  *v2.9.1, retour en arrière partiel : la case Notification affichait le
  nom de l'auteur (« from Eric »), le 27/09 Cobey préfère un titre neutre
  — « je veux plus que les noms apparaissent dans les notifs, vaut mieux
  avoir un message de façon générale ». Titre remplacé par « Message ».*

- ~~**Les boutons d'essai, retirés.**~~ *Fait le 26/09 (v3.91.2 /
  v2.7.2).* Ils avaient servi à vérifier que les notifications
  marchaient bien (dont à retrouver, avec Issyaka, qu'il n'avait tout
  simplement pas encore activé les siennes — pas un bug). Une fois la
  chaîne complète vérifiée bout en bout, Cobey : « tu peux supprimer les
  boutons de test qu'on avait mis, c'est plus la peine de les avoir ».
  `depTesterNotif`, `depTesterRappelDelai` et le bouton qui les affichait
  dans Planning sont retirés.

- ~~**L'écran de connexion était froid.**~~
  **Fait le 26/09 (v3.84.0 / v2.0.0).** Cobey : « je la trouve pas très
  esthétique […] assez froid en fait. Il n'y a pas de modèle de design ? ».
  Il n'y en avait aucun : quatre rectangles blancs identiques et des
  emojis pris au téléphone, dessinés dans quatre styles différents.
  Trois maquettes proposées : cartes en couleur pleine, icônes tracées
  d'un même trait, drapeau du Sénégal sous le nom, et les numéros de
  version descendus en bas — c'est du dépannage, pas de la bienvenue.
  Le fond est d'abord passé en sombre, puis toute l'application avec ;
  Cobey a tranché le 26/09 : **tout reste en clair**, accueil compris,
  une seule couleur du début à la fin (v3.86.0 / v2.2.0).

- ~~**L'accueil s'allongeait** d'une case par personne.~~
  **Fait le 25/09 (v3.82.0 / v1.94.0).** Quatre espaces, nommés par le
  métier et non par la personne, dans l'ordre d'usage réel :
  **👔 Direction** (Issyaka, Abdoulaye — tous les jours) ·
  **🏢 Bureau** (Aminata) ·
  **🚚 Terrain** (Samba, Ibrahima, Boubacar — le dimanche) ·
  **🔐 Administration** (Cobey).
  Un nouveau venu entre dans un espace existant : l'accueil reste à
  quatre cases pour toujours. Un espace vide ne s'affiche pas.

- ~~**Nouveau profil : Aminata**, et ses accès.~~
  **Fait le 26/09 (v3.83.0 / v1.99.0).** Collaboratrice, pas
  administratrice. Neuf cases sur son accueil : **Devis · Prix articles ·
  Client · Collecte · France & Europe · Inscription au dépôt · QR Code ·
  Archivage · Statistiques**. Les trois qui portent l'argent de
  l'entreprise et ses réglages lui sont fermées — **Départs, Rapport
  financier, Réglages** — case masquée *et* entrée refusée.

  Son rôle : prendre les appels, enregistrer les devis, les clients et les
  dispatchs, tenir les réseaux sociaux.

  Au passage, l'application ne connaît plus seulement « direction » et
  « les autres » : chacun porte la liste des cases qui lui sont ouvertes.
  Personne n'a rien perdu — les trois frères et la direction voient
  exactement ce qu'ils voyaient.

  **?** « numéro cette semaine » — à quoi cela correspond-il ? Rien dans
  l'application ne porte ce nom aujourd'hui.

  **Suite, le 12/10 (v2.20.50) — la case Départs s'y ajoute.** Cobey :
  « Aminata de Bureau, on lui rajoute la case de départ. » Sa liste de
  cases passe de dix à onze entrées ; Rapport financier et Réglages
  restent fermés — seule la case Départs s'ouvre désormais (case
  visible *et* entrée autorisée, comme pour les autres cases).

- **Régler les accès depuis les Réglages.** Aujourd'hui la liste des cases
  de chacun se change dans Firebase (champ `cases` de sa fiche), pas depuis
  un écran. À faire quand un deuxième poste sortira du moule.

---

## 2 · Améliorations

### ~~Notification push client « container arrivé »~~
**Essayé le 12/10 (v2.20.51), retiré le même jour.** Cobey, après
discussion sur l'envoi groupé de messages aux clients (WhatsApp ne
permet pas d'envoyer en un clic à plusieurs numéros à la fois —
seulement un par un) avait demandé un bouton « 🔔 M'avertir quand le
container est arrivé » sur chaque facture publique, pour abonner le
client à une notification push envoyée automatiquement quand Mamadou
Niass validerait l'arrivée d'un container. Construit, testé, déployé
(voir `facture.html`, mécanisme repris de `depActiverNotifs` côté
personnel — `dct_push_clients/`, une clé par facture plutôt que par
téléphone).

**Retiré après un test réel.** Cobey a testé depuis son propre
téléphone : le lien ouvert directement dans WhatsApp (le cas normal —
c'est comme ça qu'un client reçoit sa facture) affichait « Les
notifications ne sont pas disponibles sur ce téléphone ou ce
navigateur. » Deux restrictions qui s'ajoutent, aucune des deux liée à
l'application :
- le navigateur intégré de WhatsApp ne gère les notifications sur
  aucun téléphone ;
- sur iPhone, même ouvert dans Safari, il faudrait en plus que la page
  ait été ajoutée à l'écran d'accueil avant.

Seul un client Android ouvrant le lien aurait pu, dans certains cas,
activer la notification malgré tout. Mais DCT ne sait pas, parmi ses
clients, qui est sur iPhone et qui est sur Android — Cobey : « de ce
fait de ne pas avoir cette info-là, autant tout supprimer et le faire
manuellement avec les boutons WhatsApp. » Plutôt qu'une fonctionnalité
à moitié fiable selon le téléphone du client, retour à une solution
qui touche tout le monde pareil : les boutons WhatsApp par client (voir
ci-dessous), un par un, mais garantis.

### Boutons WhatsApp « container arrivé », par client
**Fait le 12/10 (v2.20.52 / v1.8.0 Mamadou).** Après l'abandon du push
ci-dessus, la solution retenue pour prévenir un client de l'arrivée d'un
container : pas d'envoi groupé en un clic (WhatsApp ne le permet pas
sans un compte WhatsApp Business payant), mais un bouton par client,
prêt à l'emploi (message déjà rédigé), pour aller plus vite que de taper
le message à chaque fois. En 2 parties, toutes les deux faites :

1. **Côté DCT** (`departs.js`, écran du départ/container — `depDetail`)
   — sur chaque client, un bouton « 💬 Prévenir (arrivé) » vers
   l'**expéditeur** (`c.tel`, numéro français → indicatif 33, même
   formatage que les relances de ramasse). N'apparaît que si le
   container est réellement arrivé (`d.statut === 'arrive'`), exactement
   la même condition que le badge « en attente de livraison » déjà en
   place (voir plus haut) — cohérent avec ce que l'équipe voit déjà.
   Fonctionne pour les 3 parcours (Collecte, Dépôt direct, France &
   Europe), `window.depPrevenirArriveeExpediteur(...)`.

2. **Côté Mamadou Niass** (`mamadou.html`, écran d'un container —
   `cdAppliquerFiltres`) — sur chaque client, un bouton « 💬 Prévenir le
   destinataire (arrivé) » vers le **destinataire**
   (`c.destinataireTel`). N'apparaît qu'une fois l'arrivée validée PAR
   LUI (`validerArriveeDepot`, son propre bouton, déjà en place) —
   indépendant du statut côté DCT, qui est une confirmation à part.
   Numéro formaté à l'indicatif du PAYS du container (Sénégal 221, Mali
   223 — jamais 33, le destinataire n'est jamais en France),
   `_mnTelIntlDestinataire(tel, pays)` + `mnPrevenirDestinataire(...)`.

**L'historique demandé** (« je veux aussi un historique des messages de
notification pour ça voir qui a reçu le message ») : WhatsApp ne donne
aucune confirmation de lecture ni d'envoi réel une fois la conversation
ouverte — chaque clic note donc dans la fiche du client QUI a ouvert le
message et QUAND (`c.hist`, type `arrivee`, déjà consultable dans le
Suivi de la fiche), avec la mention explicite « expéditeur » ou
« destinataire » selon le bouton, pour les distinguer.

Message à l'expéditeur : « 📦 Votre container est bien arrivé à Dakar !
Vous pouvez prévenir votre contact sur place pour qu'il vienne
récupérer son colis. » Message au destinataire (direct, avec l'adresse
du dépôt) : « 📦 Le colis envoyé par [expéditeur] est bien arrivé à
notre dépôt de Dakar (Parcelle Assainie, Unité 8). Vous pouvez venir le
récupérer. »

**Suite, le 12/10 (v2.20.53 / v1.9.0 Mamadou) — le bouton change
d'état.** Cobey, après avoir vu que l'historique n'était visible que
dans la fiche d'un client à la fois : « je veux que quand un
collaborateur clique sur prévenir, bah, qu'il y ait un changement sur
le bouton. Comme ça, un autre collaborateur, s'il ouvre l'application,
lui, il voit ceux qui ont été prévenus ou pas en défilant sur les
clients. » Pas de registre séparé par container, donc : directement le
bouton, dans la liste des clients déjà sous les yeux. Une fois cliqué
(un champ dédié, posé à côté de `hist` pour que chaque carte de la
liste n'ait qu'un champ à vérifier, pas tout l'historique à relire) :
- Côté DCT : « 💬 Prévenir (arrivé) » devient « ✅ Prévenu » (vert).
- Côté Mamadou : « 💬 Prévenir le destinataire (arrivé) » devient
  « ✅ Destinataire prévenu » (vert).
Le bouton reste cliquable après — une relance reste possible, pour le
cas où le client n'aurait pas vu le premier message. Le changement est
immédiat, sans recharger l'écran : toute l'équipe le voit à sa
prochaine ouverture, puisque c'est enregistré sur la fiche du client
dans Firebase, pas seulement affiché localement.

**Suite, le 12/10 (v2.20.54 / v1.10.0 Mamadou) — couleurs trop
proches.** Cobey : « faudrait un changement de couleur [...] pour
différencier l'action effectuée à l'action validée. » Les deux états du
bouton étaient tous les deux en vert (juste une nuance différente), pas
assez tranché pour repérer d'un coup d'œil en défilant — justement
l'objectif de la demande ci-dessus. Corrigé avec le même code couleur
déjà utilisé ailleurs dans l'appli pour "reste à faire" / "fait" (ex. le
badge livraison de Mamadou, `.cli-liv-reste`/`.cli-liv-soldee`) :
orange tant que le client n'a pas été prévenu, vert une fois fait.

**Suite, le 12/10 (v2.20.55 / v1.11.0 Mamadou) — date et heure sur le
bouton.** Cobey : « faudrai heure et date à côté de la case, comme ça on
sait quand le client a était prévenu, côté DCT et côté Mamadou. » Posée
directement dans le texte du bouton une fois prévenu (même esprit que le
badge « Délivré au client », qui affiche déjà sa date) : « ✅ Prévenu —
12/10 à 14h32 ». Même format court (jour/mois + heure, sans l'année) des
deux côtés — `_depDateHeureCourte` (departs.js) et `_mnDateHeureCourte`
(mamadou.html), écrites en miroir pour que les deux écrans affichent ça
pareil, sans toucher `_mnDateHeure` qui garde son propre format pour le
badge livraison.

**Suite, le 12/10 (v2.20.56) — relancer les clients qui doivent encore
de l'argent.** Cobey, captures d'écran de la Caisse d'un container à
l'appui : « un bouton de relance pour chaque client qui doit encore de
l'argent, pour leur dire que le conteneur va bientôt arriver et que
pour récupérer leur colis, ils doivent solder leur paiement [...] avec
le montant qu'il leur doit, qu'il doit rester à payer sur le montant
total. » Puis : « si le conteneur est en statut déjà arrivé [...] le
message doit changer. Il ne doit plus dire qu'il va bientôt arriver,
mais que le conteneur est arrivé et que pour récupérer, il faut
payer. » Et enfin : « fait pareil pour la livraison. »

Ajouté sur l'écran "qui doit" (Rapport financier > un container >
VOIR QUI DOIT, `depRapfinContainer`) — colis **et** livraison, chacune
sa propre caisse et sa propre liste, déjà en place. Même mécanique que
"Prévenir (arrivé)" vu plus haut : bouton « 💬 Relancer le paiement »
orange, qui devient « ✅ Relancé — JJ/MM à HHhMM » (vert) une fois
cliqué, reste cliquable pour relancer. N'apparaît que sur la vraie
liste "doit" — jamais sur "en trop" ou "sans prix fixé", où il n'y a
rien à réclamer.

Message personnalisé par client, avec son reste et son total exacts
(`depCalculerPaiement`/`depCalculerPaiementLivraison`, déjà ce qui
alimente "reste X € sur Y €" affiché sur sa carte), et deux variantes
selon `d.statut === 'arrive'` :

- **Pas encore arrivé** (colis) : « 📦 Le container [nom] arrive
  bientôt à Dakar. Pour récupérer votre colis, merci de bien vouloir
  régler le solde restant de [reste] € (sur un total de [total] €)
  avant l'arrivée. »
- **Déjà arrivé** (colis) : même message sans "bientôt" ni "avant
  l'arrivée" — « [...] est arrivé à Dakar. [...] merci de bien vouloir
  régler le solde restant de [reste] € (sur un total de [total] €). »
- **Livraison** : « Pour que nous puissions vous livrer votre colis,
  merci de bien vouloir régler le solde restant [...] pour la
  livraison » — au lieu de "récupérer votre colis", puisque justement
  il n'y a rien à venir récupérer soi-même.

**Suite, le 12/10 (v2.20.57 / v1.12.0 Mamadou) — un bouton « Copier » à
côté de chaque WhatsApp.** Cobey : « à côté de chaque case qu'on a
faite pour les nouveaux boutons WhatsApp [...] que ce soit pour les
relances ou pour prévenir de l'arrivée du conteneur, il faut mettre un
bouton copier-coller au cas où si le client n'a pas WhatsApp, qu'on
puisse copier-coller pour envoyer autre part. » Même raison et même
mécanisme que le bouton « 📋 Copier » déjà en place pour le rappel de
ramasse (`_depAjouterWhatsappCamion`/`_depCopierTexteRelance`) —
repris tel quel côté departs.js, et construit pour la première fois
côté mamadou.html (`_mnCopierTexte`), qui n'avait jusque-là jamais
rien à copier.

Posé à côté des 3 boutons WhatsApp de ce chantier : « Prévenir
(arrivé) » (DCT), « Prévenir le destinataire » (Mamadou), et
« Relancer le paiement » (colis et livraison). Marquer "prévenu" /
"relancé" (couleur + date) ne dépend donc plus du canal utilisé — un
message copié-collé pour un envoi par SMS compte tout autant qu'un
message ouvert dans WhatsApp, l'historique le précise (« a copié le
message » au lieu de « a ouvert WhatsApp »).

**Au passage (même demande, 12/10) — le message de relance paiement ne
nomme plus le container.** Cobey : « modifie le message pour les
relances, au lieu de "Chargement DKR", tu dis "votre container
France-Sénégal arrive bientôt". » Le nom interne du container (ex.
"Chargement DKR", visible seulement en interne) ne veut rien dire pour
un client — remplacé par le trajet, déduit du pays du départ :
France-Sénégal ou France-Mali. Au passage, « arrivé » redevient Bamako
pour un container Mali plutôt que Dakar — même distinction déjà faite
ailleurs dans l'appli (`depStatutLabel`), reprise ici pour rester
cohérent.

### Notification : diagnostiquer soi-même « j'ai envoyé mais rien reçu »
**Fait le 04/10 (v2.20.26).** Eric, capture d'écran de l'écran
Notification à l'appui : « j'ai envoyé une notif mais j'ai rien reçu ».
Vérifié avec lui : application bien installée sur l'écran d'accueil,
notifications déjà activées une fois par le passé — exactement le cas
que rien, dans l'application, ne savait distinguer d'un abonnement qui
marche : le bandeau de l'écran principal ne regarde que la permission
donnée au navigateur, jamais si Firebase a encore, en face, un
abonnement exploitable pour CE téléphone précis. Un abonnement peut
devenir inutilisable sans que le téléphone s'en rende compte (et sans
jamais repasser par "Activer", puisque cet état-là ressemble en tout
point à "déjà activé").

Un petit bloc apparaît maintenant en haut de l'écran Notification, pour
celui qui regarde son propre téléphone : « Abonné, dernière
confirmation il y a X » quand tout va bien, ou un avertissement avec un
bouton « 🔁 Réabonner cet appareil » quand l'abonnement local ne
correspond plus à rien de valide côté Firebase. Le bouton désabonne
l'ancien (même s'il semblait valide) et recrée un abonnement neuf,
réenregistré dans Firebase — sans attendre un git push ni un passage
par le support, pour que chacun puisse se dépanner seul en un geste.

⚠️ Le fil d'envoi (`dct_file_push`) et le chiffrement des notifications
eux-mêmes vivent dans `cloudflare-worker.js`, hors de ce dépôt — ce
correctif-ci est entièrement côté application (departs.js) et n'avait
donc besoin d'aucun déploiement Cloudflare.

### Collecte : un bouton pour reporter un client à une autre date
**Fait le 03/10 (v2.20.23, ouverte à tout le monde en v2.20.24).** Cobey,
sur l'onglet « Clients » d'une collecte : « il faudrait un bouton pour
chaque client ici pour pouvoir le changer de collecte. Il y arrive
souvent que des clients annulent et disent "on reporte ça la semaine
prochaine". Donc, il faudrait qu'on puisse déplacer directement le
client sur une autre collecte. » La première version (v2.20.23)
réservait le bouton à la direction, comme « Changer de départ » ; Cobey,
juste après : « le bouton changer de collecte peut être appliqué à tout
le monde » — ouvert à tous en v2.20.24.

Même principe que « Changer de départ » (le bouton qui change un client
de container), mais sur la date de ramassage, et accessible à tous
(pas réservé à la direction, à la différence de « Changer de départ »,
qui touche le container et la facture) : un bouton 🔁 sur chaque carte
client ouvre une liste des autres collectes pas encore terminées ; le
client change de collecte avec sa fiche intacte (nom, prix,
paiements…), son éventuelle affectation à un camion de l'ancienne
collecte est nettoyée, et un avertissement bloque le
premier appui si un client au même nom ou au même téléphone existe
déjà dans la collecte de destination (comme pour « Changer de
départ »).

### Administration : ménage dans la grille, « Livreur » remontée à l'écran principal
**Fait le 03/10 (v2.20.22).** Cobey, capture d'écran de la grille
Administration à l'appui : « on va un peu changer les réglages, il y a
des choses qui ne servent plus à rien comme Tournées par exemple [...]
vérifie ce qui fonctionne, ce qui fonctionne pas, vérifie les espaces.
La case Livreur, on va la remettre dans l'écran principal mais on va
l'appeler Mamadou Niass. » Puis, mi-turn : « Code espace sert plus à
rien aussi. »

- **MAMADOU NIASS** (ex-« Livreur ») a quitté Réglages pour devenir
  une vraie case sur l'écran principal (Espaces), à côté de Réglages
  et Notification — toujours réservée à la direction, même accès
  qu'avant. Même contenu exact (lien à envoyer à Mamadou, accès de
  test sans code, réinitialisation du mot de passe) : rien
  réimplémenté, juste déménagé sur son propre écran.
- **TOURNÉES** retirée : reliquat documenté depuis la suppression de
  l'espace Global Logistique (v1.22.1) — ne restait plus derrière
  qu'une liste en lecture seule, sans action réelle.
- **CODES ESPACES** retirée : des codes d'accès par société, pensés
  pour un outil multi-sociétés — jamais utile pour une seule société
  (Dakar City Transport), où chacun a déjà son propre code personnel
  (voir Codes Admin, conservée).

Vérifié que le reste fonctionne : Équipe, Codes Admin, Maintenance,
Alertes (alimentée en vrai par les tentatives de code erroné),
Données et Outils (Civilités, Diagnostic) sont bien vivants. Message
(bandeau affiché à la connexion) n'est pas un doublon de la case
Notification de l'écran principal (qui envoie une vraie notification
push) — les deux ont un rôle différent, aucune des deux touchée.

### Programme de fidélité — premier jet
**Premier jet livré le 02/10 (v2.20.0).** Cobey, depuis la fiche client
(« Actions ») : « on veut créer un programme de fidélité pour chaque
client par rapport à l'envoi [...] le client bénéficie de 10 euros de
réduction à chaque envoi de 200 euros [...] c'est à la date du premier
déclenchement [de la première remise] qu'il a un an pour utiliser ses
remises [...] le compteur se remet à zéro à chaque utilisation totale de
la remise ». Puis, par échanges successifs, « Ne code rien pour
l'instant » répété à plusieurs reprises pendant tout le réglage des
règles, jusqu'au feu vert : « Ok on commence par ce premier jet, Aminata
aussi doit y avoir accès. »

Règle retenue, telle que confirmée point par point par Cobey :
1. 10 € de remise à chaque cumul de 200 € de colis **encaissé** (l'argent
   réellement reçu, pas juste facturé).
2. Seuls les envois dont le container est parti **à partir du
   13 septembre 2026** comptent — rétroactif, mais pas avant cette date.
3. La première fois que 200 € est atteint déclenche un délai d'un an —
   une seule échéance pour toutes les remises, même celles gagnées
   ensuite dans l'année (pas une échéance par remise).
4. S'il utilise **toutes** ses remises avant l'échéance, le compteur
   repart à zéro et un nouveau cycle (avec sa propre nouvelle échéance)
   démarre au prochain palier de 200 €.
5. Si l'échéance passe sans que tout soit utilisé, il perd tout : les
   remises non utilisées ET le cumul en cours repartent à zéro.
6. Sur la facture, appliquer une remise n'est **jamais automatique** —
   toujours un choix du client/collaborateur — et affiche la date
   d'expiration de la remise appliquée.
7. Une case dédiée **« Programme de fidélité »** liste les remises de
   tous les clients, triable par date d'expiration ou par nombre de
   remises, avec le détail par client (ses remises, leur échéance, et
   la liste de ses envois pour vérifier quand et combien).

Ce que ce premier jet construit :
- Bouton **« 🎁 Fidélité »** dans les Actions de chaque fiche client,
  ouvert à tout le monde (comme « Historique d'envoi »), qui montre le
  cumul en cours, les remises disponibles/utilisées/expirées avec leurs
  dates, et ses envois (tous parcours confondus) pour la traçabilité.
- Nouvelle case **« Programme de fidélité »**, réservée à la direction et
  à Aminata, qui liste tous les clients ayant au moins une remise, avec
  le tri par échéance ou par nombre.
- Sur la facture : un encart montre les remises disponibles, leur valeur
  totale et leur échéance, avec un bouton « Appliquer une remise » —
  rien ne s'applique tout seul.

Rien n'est encore stocké en compteur : chaque calcul rejoue à chaque
consultation les versements réels et l'historique des remises déjà
utilisées, pour rester fiable même si une fiche est corrigée après coup.

**Premier jet** — à affiner avec Cobey à l'usage, comme pour la taxe
prestataire (Mali).

**v2.20.1 :** Cobey, après avoir testé en vrai, capture d'écran de la
facture à l'appui (quatre « 🎁 Remise fidélité » accumulées sur la même
ligne « Colis ») : « j'ai appliqué des remises pour tester, mais du
coup, je l'ai enlevé. Comment on fait ? J'arrive pas à supprimer. »
Il n'y avait effectivement aucun moyen de revenir en arrière une fois
une remise appliquée. Un bouton **« ↩️ Annuler »** apparaît maintenant à
côté de chaque remise appliquée sur la facture en cours : il retire la
ligne, remet le prix à ce qu'il était, et la remise redevient
disponible pour ce client (elle n'est pas perdue, juste pas utilisée
sur cette facture-ci).

En creusant pour le construire : `_depLignesColis` (la fonction qui
reconstruit le détail d'une fiche à l'affichage) reconstruit une ligne
toute neuve pour chaque article, et perdait au passage un repère interne
posé sur la ligne de remise — pire, elle pouvait même la "recoller"
depuis le texte et la dédoubler, la ligne de remise n'étant pas un vrai
colis physique et faisant donc mentir le compte de colis de la fiche.
Les deux fonctions de remise (appliquer/annuler) partent désormais
directement du détail déjà enregistré sur la fiche plutôt que de le
faire refabriquer par cette fonction, pour ne plus jamais perdre ce
repère.

**v2.20.2 :** Cobey, en re-testant le bouton Annuler de la v2.20.1 sur
ses 4 remises de test, deux soucis :
1. Le bouton répondait « cette remise ne se trouve plus sur cette
   facture » et n'annulait rien. Cause : ses 4 remises avaient été
   posées AVANT le correctif précédent — leur ligne n'a donc jamais reçu
   le repère que l'annulation cherche. Ajout d'un repli : si aucune
   ligne ne porte ce repère, la dernière ligne de remise trouvée est
   retirée (elles valent toutes rigoureusement la même chose, 10 €,
   peu importe laquelle). Les remises posées à partir de maintenant ne
   passeront plus par ce repli, déjà bien taguées.
2. « Quand j'appuie sur retour [...] ça revient sur la case des clients.
   J'avais dit que chaque retour doit revenir à la case précédente [...]
   Le bouton retour doit toujours revenir en arrière. » Une facture
   ouverte depuis « Ses envois » (écran Fidélité d'un contact) empruntait
   par erreur le même chemin de retour que l'écran Historique d'envoi
   (un paramètre partagé entre les deux pour profiter du même libellé
   « ← Retour »), qui ramenait donc au mauvais endroit. Un repère propre
   à la Fidélité fait maintenant revenir bien sur cet écran-là, pour le
   contact qu'on regardait.

**v2.20.3 :** Cobey, sur l'échéance d'un an : « elle doit être en date de
la fin du mois. Pourquoi ? Car les conteneurs [...] ne sont jamais à la
même date [...] peut-être que dans un an [...] le conteneur partira le
24 septembre [...] pour ne pas pénaliser, on va lui laisser quand même
la possibilité de finaliser le mois avec ses remises. » L'échéance se
calculait jour pour jour (gagnée le 6 septembre 2026 → expire le
6 septembre 2027 pile) — recalée sur la fin du mois (expire le
30 septembre 2027), pour que la cliente garde ses remises jusqu'au
départ réel du container de ce mois-là, quelle que soit sa date exacte.

**v2.20.12 :** Cobey, capture d'écran de la fiche fidélité de Fatou
Sylva Gomis (6 remises disponibles) et de sa facture (1320 € payés,
0 € restant) à l'appui : « je peux appliquer les remises sur la
facture qu'il a déjà payée. C'est pas logique de pouvoir faire ça. »
Exact : une fois la facture soldée, appliquer une remise aurait fait
tomber le prix sous ce qui a déjà été encaissé — comme si DCT devait de
l'argent au client. Le bouton « Appliquer une remise » ne s'affiche
plus dès que « Reste à payer » est à 0 € ; les remises restent
visibles et disponibles (rien n'est perdu), juste plus applicables sur
cette facture-là — un message le dit, à la place du bouton.

**v2.20.13 :** Cobey, sur la fiche de Fallou FALL : un des envois de
« Ses envois » s'affichait sans date, juste « — ». Le tap l'ouvrait
bien (la bonne facture, confirmé par Cobey), mais Cobey : « c'est pas
compréhensible [...] mettre des dates, ou des anciennes collectes [...]
pour que ce soit compréhensible. » Un envoi d'une collecte Sénégal déjà
ancienne/clôturée n'a pas toujours de date posée sur la fiche
elle-même (lacune de données antérieure à ce chantier) ; la date de LA
COLLECTE elle-même, elle, est toujours connue — affichée désormais à la
place du « — » (« Collecte du dimanche 27 septembre 2026 », par
exemple).

Au passage, confirmé avec Cobey : cet envoi étant une facture à 0 €
encaissé sur une collecte déjà clôturée n'a rien d'anormal — une
collecte se clôture dès que chaque client a sa facture **faite**, pas
forcément **payée** (le client peut régler jusqu'à l'arrivée à Dakar,
règle déjà en place).

**v2.20.14 :** en creusant le cas de Fallou FALL, Cobey a remis la règle
au clair : « il faut que les remises commencent à partir du conteneur
du 13 septembre. Tout ce qui a été fait avant ne compte pas. Parce
qu'avant, on n'avait pas de conteneur, l'appli ne gérait pas les
conteneurs. » La règle existait bien depuis le premier jet — mais un
envoi jamais rattaché à un container (comme celui de Fallou FALL, voir
juste au-dessus) était jusqu'ici **toujours** compté éligible, sur
l'hypothèse que « pas de container » voulait dire « forcément récent ».
Vrai pour un client tout juste collecté cette semaine ; faux pour une
vieille fiche Collecte d'avant que les containers n'existent dans
l'application — elle n'a jamais eu de container pour une tout autre
raison (le champ n'existait pas encore), et se faisait donc compter à
tort dans le cumul.

Le cumul distingue maintenant les deux cas par la date elle-même : un
vrai container connu fait foi (inchangé) ; sinon la date de création de
la fiche ; et à défaut (vieille fiche Collecte sans date propre, voir
v2.20.13) la date de la collecte elle-même. Sans aucune date fiable,
l'envoi est exclu par prudence plutôt que compté à tort.

**v2.20.15 :** Cobey, capture d'écran de « Ses envois » (Fallou FALL) à
l'appui : « on peut carrément supprimer au lieu de griser les dates
avant le 13/09/26. » Les envois antérieurs au 13/09/2026 (hors
programme, voir v2.20.14) s'affichaient grisés avec une note en
dessous — ils ne comptent de toute façon pour rien ici, et comme celui
de Fallou FALL (sans date compréhensible), ça n'apportait que de la
confusion. Ils n'apparaissent plus du tout dans « Ses envois » ; le
compteur (« Ses envois (N) ») ne porte plus que sur ceux qui comptent
réellement pour le programme.

**v2.20.16 :** Cobey, capture d'écran du « Suivi financier global »
d'une collecte France & Europe terminée : « ici dans le suivi global de
tout les camions on a le total facturé mais on n'a pas le total
encaissé réel ! dans chaque camion on l'a mais, mais j'ai vu que là ici
y'a pas, je crois c'est un oubli. » Le bandeau global (tous camions
confondus) n'affichait que le « 📋 Facturé » (valeur des clients
ramassés/validés), jamais le « ✅ Collecté » (l'argent réellement
encaissé via les versements) — côté Sénégal ET côté France. En
creusant, le détail d'un camion France non plus ne l'avait jamais eu
(seul le détail d'un camion Sénégal l'affichait déjà). Le « ✅ Collecté »
apparaît maintenant aux trois endroits qui en manquaient : le bandeau
global Sénégal, le bandeau global France, et le détail d'un camion
France.

**v2.20.17 :** Cobey, correction du principe même du programme de
fidélité (le premier jet du 02/10/2026 additionnait les encaissements à
travers PLUSIEURS envois pour atteindre 200€) : « ce n'est pas au cumul
que ça fonctionne, le client gagne une remise de 10€ à chaque facture
qui dépasse 200€ ! ça fonctionne par facture, il peut pour les
prochaines factures utiliser ou non la remise, si il garde il peut les
utiliser jusqu'à 1 an à date de la première facture qui a était
éligible en dépassant les 200€. si il solde ses remises il sera de
nouveau éligible à de prochaines remises avec une facture minimum de
200€ et sa date de 12 mois pour les cumuler recommence » — puis, sur la
base du montant à considérer : « je parle du prix payé par le client
sur sa facture sur les colis, pas sur la livraison à Dakar. »

Le calcul ne regarde donc plus une somme d'encaissements à travers
plusieurs envois d'un même client : chaque FACTURE est jugée seule, sur
ce qui a été payé dessus pour les colis (jamais la livraison, caisse à
part). Une facture dont le payé colis atteint 200€ fait gagner UNE
remise de 10€ — même si elle fait 1000€, jamais plus d'une. Plusieurs
petites factures qui ne dépassent pas 200€ chacune ne s'additionnent
plus entre elles. Les remises de plusieurs factures qualifiantes
partagent toujours la même échéance (1 an, fin de mois), ancrée sur la
PREMIÈRE d'entre elles ; une fois toutes les remises utilisées, le
compteur repart à zéro et une nouvelle facture qualifiante relance son
propre cycle, avec sa propre échéance — ce mécanisme-là ne change pas.

**v2.20.18 :** en signalant le point précédent (aucune remise n'avait en
fait encore été appliquée en vrai depuis le déploiement — le risque
n'était qu'hypothétique), Cobey a tranché sur le principe : « ah nan ça
faut corriger, faut laisser uniquement les remises du nouveau calcul,
une erreur est vite arrivée. » Le moteur ne garde donc JAMAIS plus de
remises « utilisées » que ce que le nouveau calcul (par facture)
reconnaît légitimement : un usage réel qui ne correspondrait à aucune
remise recalculée ne serait pas conservé comme valable — il ne compte
simplement pas, plutôt que d'être toléré par prudence.

**v2.20.19 :** Cobey, capture d'écran de la facture d'Ibrahima Diouf
("Une petite moto piwi Enfant", 0 € de colis, 0 € payé, 0 € restant,
mais 1 remise fidélité disponible via un autre envoi) : « trouve-moi ce
qui ne va pas. » La garde posée en v2.20.12 (pas de remise sur une
facture déjà soldée) se basait sur « reste à payer = 0 » — vrai aussi
pour une facture à 0 € où rien n'a jamais été payé, qui affichait donc
à tort « Facture déjà payée en totalité ». Distingue maintenant les
deux cas : une vraie facture soldée garde ce message ; une facture à
0 € dit « Facture à 0 € — remise non applicable ici » à la place.

**v2.20.21 :** Cobey : « on va faire à partir du conteneur du 18
octobre 2026. C'est à partir de ces factures-là que va commencer. Tout
ce qui est avant, ça ne compte pas. » Décale la date de départ du
programme (`DEP_FIDELITE_DATE_DEBUT`), jusque-là le 13 septembre 2026,
au 18 octobre 2026 — même mécanique (rétroactif à partir de cette
date, exclu par prudence sans date fiable, voir v2.20.14), seule la
date elle-même change. Mise à jour aussi le seul texte affiché à
l'écran qui la citait (« Total envoyé (encaissé, depuis le 13/09) » →
« ... depuis le 18/10 »).

### ~~Inscription au dépôt : numéro de place et ordre, comme Départ~~
**Fait le 30/09 (v2.10.33 / v3.94.34).** Cobey, après une première
tentative où j'avais mal compris (visuel des cartes de containers) :
« faut juste reprendre les numéro de position des clients, l'ordre du
plus récent au plus haut de la liste, on garde ce qui est en place dans
dépôt, mais on met un visuel du type de départ. »

La liste des clients d'un départ, vue depuis le carré « Inscription au
dépôt », triait par ordre alphabétique et n'affichait aucun numéro de
place. Elle reprend maintenant exactement le même principe que l'écran
Départ : la pastille « N°X » (place dans le container, celle imprimée
sur l'étiquette) devant chaque nom, et le tri va du plus récemment
inscrit au plus ancien — tout le reste (recherche, boutons Facture/
Photos, bouton d'inscription) reste inchangé.

### ~~Dépenses des tournées : le détail par poste~~
**Fait le 27/09 (v3.94.7 / v2.10.6).** Sur « Dépenses du container »,
capture d'écran du report des tournées à l'appui (« Camion DCT · 70 € »),
Cobey : « il faudrait mettre le détail de la dépense carburant,
déjeuner ou autre, parce que là on a le prix total, mais on ne sait pas
à quoi ça correspond ». Chaque dépense de camion portait déjà son type
(carburant/déjeuner/autre, choisi à la saisie) — jamais additionné par
poste ni montré ensuite. Chaque ligne du report affiche maintenant ce
détail juste en dessous, par exemple « ⛽ Carburant 50 € · 🍴 Déjeuner
20 € », pour un total de 70 €.

**v1.94.8 :** Cobey, sur ce même écran : « faire à cet endroit-là un
total des mêmes items [...] on pourrait savoir pour le conteneur
combien on a dépensé en déjeuner, combien en carburant [...] que ce
soit bien lisible, propre ». Le même détail, mais additionné sur
l'ensemble du container cette fois, juste sous « 🚚 Tournées des
camions » dans l'encart du haut — une ligne par poste, alignée comme
les autres montants. Quand un camion a rempli plusieurs containers le
même jour, chaque poste est réparti dans la même proportion que le
montant déjà affiché, pour que la somme des postes retombe pile sur ce
total.

**v1.94.9 :** Cobey, nouvelle capture d'écran à l'appui — les tournées
s'affichaient dans le désordre (6 septembre, 20, 20, 13, 13…) : « ça
m'a l'air un peu brouillon, je vois pas d'ordre chronologique [...] il
y a un peu trop d'infos. Essaye de me mettre ça bien organisé, avec
une logique ». Deux choses :
- Le tri comparait les dates comme du **texte** (« Dimanche 6 » passait
  après « Dimanche 20 », le "2" étant alphabétiquement avant le "6") —
  jamais un vrai ordre chronologique. Corrigé : tri sur la vraie date.
- Le report des tournées est désormais **regroupé par collecte** : un
  en-tête de date (avec le sous-total du jour), les camions de ce
  jour-là en dessous, sans répéter la date sur chaque carte — moins
  d'infos redondantes, plus facile à parcourir.

**v1.94.10 :** Cobey, sur « X clients de ce container » (le nombre
sous chaque camion) : « ça veut dire quoi [...] je sais pas, il y a
marqué ça ». Vu depuis l'écran du container, « de ce container »
n'apportait rien — la vraie information (sur combien de clients ramassés
ce jour-là seule une partie appartient à ce container) ne comptait que
si le camion avait aussi rempli un autre container. Simplifié : un
camion qui n'a servi que ce container dit juste « X clients ramassés » ;
un camion qui en a aussi ramassé pour un autre dit « X sur Y ramassés ce
jour-là appartiennent à ce container », avec la part d'argent
correspondante juste à côté.

**v1.94.11 :** Cobey, sur l'encart du haut de « Dépenses du
container » : « on va mettre en avant dépenses propres, on va le
remonter au-dessus de tournées des camions [...] c'est vraiment ce
qu'un conteneur va payer tout le temps. Et on va changer son nom, on va
l'appeler dépenses fixes. » Fait : « Dépenses fixes » (loyer,
dédouanement, container, salaires…) passe en premier, avant « Tournées
des camions », dans l'encart du haut et sur l'écran du container.

Deuxième demande, sur le même message : catégoriser la location de
camion et le paiement de chauffeurs externes pendant une tournée, avec
la question « on entre cette donnée pour la collecte ou sur le camion
concerné ? ». Réponse retenue : **sur le camion**, comme carburant et
déjeuner déjà — deux nouvelles catégories dans le même menu, « 🚛
Location camion » et « 🧑 Chauffeur externe ». Ça profite gratuitement de
tout ce qui existe déjà pour carburant/déjeuner : réparti au prorata
quand un camion sert plusieurs containers le même jour, compté dans le
détail par tournée et dans le total du container par poste. Saisir ça
« pour la collecte » (sans camion précis) aurait cassé ce prorata et
n'aurait pas pu s'afficher dans le détail par camion.

**v1.94.12 :** Cobey, sur le nom de la catégorie « Chauffeur externe » :
« il faut préciser que c'est leur paye du jour [...] on paye ces
chauffeurs, ils viennent travailler vos jours et on les paye ». Choix
retenu : **« Paye chauffeur externe »**.

Dans la foulée, deux demandes sur l'affichage : « le détail des
dépenses fixes doit également être au-dessus du report des tournées »,
et « dans la case dépense de ce container, on doit aussi voir le détail
global ». Le détail par poste (🏠 Loyer, 📋 Dédouanement, 📦 Container,
👤 Salaires…) — déjà calculé pour "Tournées des camions" — existe
maintenant aussi pour "Dépenses fixes", et s'affiche sous chacun des
deux totaux : sur l'écran dédié "Dépenses du container" (donc bien
au-dessus de "Report des tournées"), et sur la case résumé "Dépenses de
ce container" de l'écran du container lui-même.

**v1.94.13 :** Cobey, nouvelle capture d'écran — malgré le détail
ajouté en v1.94.12, la LISTE des dépenses fixes (chaque ligne saisie,
avec son bouton Retirer) restait, elle, tout en bas de l'écran, après
le report des tournées : « c tjr en bas ». Toute la section « Dépenses
fixes » — pas seulement son total — est maintenant remontée juste sous
l'encart résumé, avant le report des tournées.

**v1.94.14 :** Cobey, sur le report des tournées : « pour chaque
journée où on voit les dépenses, un bouton [...] quand on clique on
retombe sur la collecte en question, comme ça on peut modifier s'il y a
besoin, au lieu de retourner dans la case des archivages, c'est trop
long ». Chaque en-tête de date porte maintenant un bouton « ✏️
Modifier » qui ouvre directement la collecte de ce jour-là (mêmes
écrans que Dispatch/Clients, pour tout corriger) — et son bouton Retour
ramène pile sur "Dépenses du container", pas sur l'écran Collecte par
défaut ni sur l'Archivage. Même mécanique que le retour à l'Archivage
(v1.92.0), réutilisée pour ce nouveau chemin.

**v1.94.15 :** Cobey : « il faut ajouter pour les dépenses fixes
"chargeur" et le nombre de personnes, car pour les conteneurs on engage
des chargeurs qui viennent travailler [...] des fois il y en a un, des
fois deux, des fois trois. Et on les paye à la journée [...] ou à
l'heure. » Jusque-là saisi en "Autre" avec le nombre écrit à la main
dans la précision (capture d'écran de Cobey à l'appui : « Chargeurs
conteneur 2 personnes »). Nouveau poste dédié « 👷 Chargeur », avec un
champ « Nombre de personnes » qui n'apparaît que pour ce poste-là et
s'affiche juste à côté sur chaque ligne (« 👷 Chargeur · 2 personnes »).
Le tarif jour/heure reste à écrire dans la précision, en texte libre.

**v1.94.16 :** Cobey : « on va rajouter une catégorie course pour tout
ce qui est dépenses de eau, boisson, café, des trucs comme ça. »
Nouveau poste « 🛒 Course » dans le même menu, juste avant « Autre ».

**v1.94.17 :** Cobey, sur la case CONTAINERS du Rapport Financier :
« on va mettre une autre case conteneur Mali et une case conteneur
Sénégal [...] actuellement dans conteneur il y a les deux mélangés
[...] comme on ne gère pas du tout le conteneur Mali, ça va faire des
lignes pour rien. Donc autant tout centraliser dans une case pour le
Mali et bien laisser une bonne visibilité pour le conteneur de
Sénégal. » La case unique "CONTAINERS" devient deux cases, "🇸🇳
CONTAINERS SÉNÉGAL" et "🇲🇱 CONTAINERS MALI", chacune ouvrant la liste
déjà filtrée sur son pays (l'onglet Tous/Dakar/Mali de l'écran reste
disponible pour changer d'avis une fois dedans).

**v1.94.18 :** Cobey : « tu peux enlever le filtre. » Une fois la case
scindée en Sénégal/Mali, l'onglet Tous/Dakar/Mali de l'écran Containers
n'avait plus de raison d'être — retiré. La liste montre toujours ce
que la case cliquée promettait ; le bouton "Voir les containers" du
Bilan (qui n'a pas de case par pays) montre toujours tout.

**v1.94.19 :** Cobey, sur "Course" (v1.94.16, ajoutée aux dépenses
fixes du container) : « il faut la mettre dans la tournée des camions
et pas dans les dépenses fixes, parce que [...] il y en a un camion et
demi via un camion. » Corrigé — Course a été mise au mauvais endroit :
c'est une dépense DU CAMION ce jour-là (comme carburant, déjeuner), pas
une dépense fixe du container. Déplacée dans le menu des dépenses de
camion : elle profite maintenant du même prorata que carburant/déjeuner
quand un camion sert plusieurs containers le même jour ("un camion et
demi" — 1 container entier + une part d'un second), au lieu d'être
comptée en entier sur un seul container.

**v1.94.20 :** Cobey, sur l'écran "Comparer" : « je pouvais pas voir
juste un conteneur seul » — il avait comparé un container avec
lui-même pour contourner ça. Il a demandé un sous-menu dans la case
STATISTIQUES du Rapport Financier : « on va faire deux sous-menus, le
[Comparer] et [...] une autre case qui permette de voir les stats d'un
conteneur [...] les dépenses au fur et à mesure des collectes avec un
graphisme, les dépenses, les gains [...] plusieurs pylônes ».

La case STATISTIQUES ouvre maintenant un sous-menu à deux entrées :
« Comparer » (l'écran existant, inchangé) et « Un container » (nouveau).
Ce dernier propose la liste des containers ; en choisir un affiche un
pylône par collecte qui l'a alimenté, chronologique de gauche à droite,
avec pour chacune deux barres — dépenses de tournée de ce jour-là (même
calcul, même prorata que le report des tournées) et encaissé de ce
jour-là pour les clients de ce container. Les dépenses fixes (loyer,
dédouanement…) n'appartiennent à aucune collecte précise : elles ne
comptent que dans le total du container, pas ici. Rien d'autre pour
l'instant (Cobey : « et après, pas pour l'instant ça »).

**v1.94.31 :** Cobey, même écran, capture à l'appui : « je voudrais
vraiment avoir toutes les dépenses de chaque catégorie [...] les
courses, les loyers, etc. [...] un vrai graphique avec tout ça pour
bien comparer [...] pour faire un vrai bilan. » Finalement, si — une
suite à « et après, pas pour l'instant ça ».

Une nouvelle section « 💸 Dépenses par catégorie » apparaît sous le
graphique par collecte, quand un container est choisi : l'encaissé, les
dépenses totales et le bénéfice réel en résumé, puis deux graphiques en
barres horizontales — un pour les dépenses fixes (loyer, dédouanement,
container, salaires…), un pour les tournées des camions (carburant,
déjeuner, course…) — chacun trié de la plus grosse dépense à la plus
petite, pour repérer le poste qui pèse le plus d'un coup d'œil. Même
détail que "Dépenses de ce container" (Rapport financier), mais en
graphique plutôt qu'en liste, et rapproché de l'encaissé.

**v1.94.32 :** vu telle quelle, Cobey : « je voulais un graphique avec
des pilonne » — les deux graphiques en barres horizontales, refaits en
pylônes verticaux (mêmes valeur au-dessus / barre / icône+libellé en
dessous que le graphique par collecte juste au-dessus), toujours triés
de la plus grosse dépense à la plus petite.

**?** Comparer catégorie par catégorie ENTRE deux containers ou deux
années (pas seulement les regarder un par un) demanderait d'étendre
l'écran "Comparer" existant — pas fait ici, à confirmer avec Cobey si
le besoin se précise à l'usage.

### ~~Audit des exports PDF de toute l'application~~
**Fait le 28/09 (v3.94.21 / v2.10.20).** Cobey : « qui veut me
vérifier dans toute l'application où est-ce qu'il y a des exports PDF.
Voir s'ils sont utiles, s'ils fonctionnent. Et [...] de me faire un
vrai export PDF et ne plus passer par les exports où il faut passer
par imprimer. »

Ce que l'audit a trouvé : Facture, Étiquettes, Devis et Statistiques
étaient déjà de vrais exports directs (html2canvas + jsPDF, faits plus
tôt). Restaient deux exports oubliés dans dct-app.html (un fichier à
part de departs.js, plus ancien) — toujours sur l'ancien
`window.print()` : « Sur iPhone : Partager → Imprimer → Pincer →
Partager → Enregistrer en PDF », et sur PC un simple fichier **.html**
téléchargé, pas même un PDF.
- La **feuille de route** d'un camion (`exportCamionPDF`, écran Vue
  Camion).
- Le **récapitulatif de collecte** complet, tous camions (`exportPDF`,
  bouton "Exporter PDF complet" du sous-onglet Dispatch).

Les deux génèrent maintenant un vrai `.pdf`, via une nouvelle fonction
partagée (`depGenererPDFParBlocs`, dans departs.js, exposée sur
`window` puisque dct-app.html tourne dans un `<script>` séparé). À la
différence d'une facture (toujours courte, réduite pour tenir sur une
page), ces deux documents sont de longueur variable — une tournée de 3
clients ou de 40. Chaque partie (un paquet de quelques clients, un
paquet de lignes de tableau) est donc capturée séparément et empilée
sur autant de pages A4 que nécessaire, sans jamais couper un bloc en
deux.

Trouvé aussi en creusant : le bouton PDF de la feuille de route était
dupliqué sur quatre écrans sans rapport (Nouvelle collecte, Ajouter
client, Fiche client, Administration) — sans effet utile puisqu'il n'a
de sens que sur l'écran d'un camion précis. Retiré de ces quatre
écrans, gardé seulement là où il sert. Et une fonction `genererPDF()`
plus vieille encore, elle aussi sur `window.print()`, n'était appelée
nulle part dans toute l'application — supprimée.

### ~~Planning : la relance ne partait jamais~~
**Fait le 28/09 (v3.94.22 / v2.10.21).** Cobey : « je devais recevoir
une notification push pour les disponibilités du planning [...]
normalement je devais recevoir lundi à 9h, mais j'ai rien reçu ». Le
Worker Cloudflare répondait `rappels: 0` en boucle, même après avoir
rouvert Planning ("c pareil").

Cause : `dct_planning_participants` (le mémo que l'application laisse
à Cloudflare — qui, lui, n'a pas accès à COLLABS) avait été écrit VIDE
une fois, et rien ne le corrigeait plus jamais après. Ça arrivait si
Planning s'affichait avant que COLLABS ait fini de charger depuis
Firebase (course entre les deux) — cette fonction n'écrivant que
lorsque la liste change depuis la dernière fois, un mémo vide écrit une
fois restait vide pour de bon, même une fois COLLABS chargé, tant que
Planning ne se réaffichait pas. Corrigé : elle n'écrit plus jamais un
mémo vide, et les échecs d'écriture (permissions Firebase) sont
maintenant journalisés au lieu de disparaître en silence.

**v1.94.23 :** malgré ce premier correctif, et après avoir vérifié que
"L'équipe" affichait bien tout le monde (Issyaka, Abdoulaye, Samba,
Ibrahima, Boubacar), le Worker répondait toujours `rappels: 0`. Un
deuxième bug, empilé sur le premier : la fonction marquait "déjà
envoyé" **avant** même de savoir si Firebase avait accepté l'écriture
(`set()` est asynchrone) — un échec silencieux (permissions, réseau)
laissait quand même cette marque, et plus rien ne retentait tant que la
page restait ouverte, même une fois la vraie cause corrigée. Elle ne se
marque plus "envoyée" qu'une fois l'écriture confirmée par Firebase ;
un échec redevient visible par un toast au lieu de disparaître.

Diagnostic mené avec Cobey en direct, étape par étape : un test manuel
via "🔔 Relancer" a montré `traites:1` mais `envois/echecs/oublies`
tous à 0 — personne à qui envoyer (Ibrahima et Boubacar n'avaient pas
activé les notifications sur leur propre téléphone). Un test via la
case "Annonce" (qui inclut toujours l'auteur) a confirmé que la
chaîne complète fonctionne bien pour Cobey lui-même. Conclusion :
le système marche, chaque collaborateur doit encore faire l'étape
"Activer" sur son propre téléphone.

**v1.94.24 :** en creusant, Cobey, sur la case Notification (l'écran
qui liste ses messages manuels à toute l'équipe) : « il faudrait
inscrire aussi les rappels automatique[s] envoyés, et à qui ils ont
été envoyés ». Jusqu'ici un rappel automatique de Planning ne laissait
aucune trace consultable dans l'application — seulement une
notification éphémère à Cobey (l'observateur), facile à manquer et
jamais relisible après coup. Le Worker Cloudflare écrit maintenant
chaque rappel automatique (et le résultat final du vendredi) dans la
même liste que les messages manuels, avec les noms des destinataires
en dessous — visuellement distingué par « 🤖 Planning automatique ».
La relance manuelle depuis Planning (le bouton "🔔 Relancer") y est
journalisée elle aussi, pour la même raison.

**Ce fichier fait partie de `cloudflare-worker.js`, pas de
`departs.js` : le correctif ne prend effet qu'après avoir recollé son
contenu dans Cloudflare et cliqué Deploy** (étape 2 de
`CLOUDFLARE-A-FAIRE.md`) — un git push seul ne suffit pas pour ce
fichier-là.

**v1.94.25 :** une fois le rappel automatique visible dans Notification
vérifié, Cobey : « je voulais m'inclure dans les personnes qui
reçoivent, pour vérifier ». Jusqu'ici il n'était jamais destinataire
du VRAI rappel Planning ("Êtes-vous disponible dimanche...") — retiré
des participants dès le début (il n'a pas de disponibilité à donner),
il ne recevait que le résumé texte de l'observateur. Le rappel
automatique (Worker) et la relance manuelle (bouton "🔔 Relancer")
l'ajoutent maintenant toujours en plus des personnes réellement
concernées, pour qu'il constate lui-même l'arrivée de la notification
sur son téléphone — sans jamais déclencher d'envoi quand il n'y a
personne à relancer (pas de fausse alerte "à vérifier" quand tout le
monde a déjà répondu).

**v1.6.0 (cloudflare-worker.js) :** Cobey, capture d'écran du message
« Résultat final envoyé pour dimanche 4 octobre : 2 disponibles, 3
absents » à l'appui : « il ne précise pas qui est là, qui n'est pas là
et qui n'a pas répondu [...] il faut que ce message confirme qui est
là, qui est présent à la collecte, qui n'est pas présent et qui n'a pas
répondu. » Un simple compte ne distinguait pas un "non" assumé d'un
silence auto-marqué absent à jeudi 22h — les deux tombaient dans
"absents" sans dire qui est qui. Le message final (et celui envoyé à
Cobey en observateur) liste maintenant les noms dans trois catégories
séparées : ✅ Présents, ❌ Absents (ont répondu non), 🔇 Sans réponse
(absent d'office, délai dépassé).

**Rappel : ce fichier fait partie de `cloudflare-worker.js`, pas de
`departs.js` — ce correctif ne prend effet qu'après avoir recollé son
contenu dans Cloudflare et cliqué Deploy (étape 2 de
`CLOUDFLARE-A-FAIRE.md`), un git push seul ne suffit pas.**

**v1.6.1 (cloudflare-worker.js), 04/10 :** Eric : « j'ai envoyé une
notif mais j'ai rien reçu » — et Cobey, en vérifiant : « les autres non
plus ». Plus personne ne recevait rien, du jour au lendemain : ouvrir
l'adresse du Worker (voir `CLOUDFLARE-A-FAIRE.md`, étape 5) montrait
`Erreur : connexion Firebase anonyme : 400` — le Worker n'arrivait même
plus à s'identifier auprès de Firebase, donc rien ne pouvait partir
pour personne. L'erreur elle-même ne disait que le code HTTP (« 400 »),
jamais pourquoi — elle fait maintenant remonter la vraie raison donnée
par Google entre parenthèses, pour ne plus avoir à deviner.

**v1.6.2, même jour :** la parenthèse a donné la vraie raison : `API
key not valid. Please pass a valid API key.` Diagnostiqué en direct
avec Cobey, dans la console Google Cloud (pas évidente à trouver : la
clé vit dans le projet Google Cloud **dakar-collecte**, associé au
compte Google de Firebase — pas dans un projet au nom proche
(« dct-collecte ») qui n'a rien à voir, piège dans lequel on est
d'abord tombé). Cause réelle : la clé API utilisée par ce fichier était
la même que celle de l'application (`dct-app.html`/`departs.js`) — une
« Browser key » que Google restreint par défaut aux appels venant d'un
navigateur. Un Worker Cloudflare n'en est pas un (il n'envoie jamais
l'en-tête de site d'origine attendu), donc Google refusait net. Ce
fichier a maintenant sa propre clé, créée exprès dans Google Cloud
Console sans aucune restriction de site (Identity Toolkit API
autorisée, "Restrictions relatives aux applications" sur "Aucun") —
l'application, elle, garde sa clé d'origine, restreinte, inchangée.
Aucune des deux clés n'est un secret (une clé API Firebase identifie
seulement le projet ; toute la sécurité réelle vient des règles
Firebase), mais elles ne jouent plus le même rôle désormais : l'une
pour les navigateurs, l'autre pour tourner sans navigateur.

**Rappel : ce fichier fait partie de `cloudflare-worker.js`, pas de
`departs.js` — ce correctif ne prend effet qu'après avoir recollé son
contenu dans Cloudflare et cliqué Deploy (étape 2 de
`CLOUDFLARE-A-FAIRE.md`), un git push seul ne suffit pas.**

**v1.7.0, même jour — la clé dédiée n'a pas suffi.** Après avoir recollé
la nouvelle clé (deux fois, en vérifiant caractère par caractère), même
erreur. Testée en direct depuis l'extérieur de Cloudflare (requête brute
vers Google) : la clé était en fait parfaitement valide et fonctionnelle
— la cause de la v1.6.2 ne tenait donc pas. La vraie explication :
Google refuse la connexion « anonyme » à Firebase Authentication quand
elle vient d'une infrastructure serveur comme Cloudflare plutôt que d'un
vrai navigateur, quelle que soit la clé utilisée — un garde-fou anti-abus
non documenté clairement, qu'aucun réglage de clé API ne pouvait
contourner.

Correctif définitif : ce fichier n'utilise plus la connexion « anonyme »
(prévue pour un utilisateur humain) mais un **compte de service**
(Service Account) — la méthode que Google prévoit précisément pour un
serveur. Deux nouvelles variables Cloudflare, `FIREBASE_CLIENT_EMAIL` et
`FIREBASE_PRIVATE_KEY`, obtenues depuis Firebase (Paramètres du projet →
Comptes de service → Générer une nouvelle clé privée — voir
`CLOUDFLARE-A-FAIRE.md`). Le fichier signe lui-même un jeton (JWT, en
RS256, avec `crypto.subtle`, sans bibliothèque) échangé contre un vrai
jeton d'accès Google — vérifié avant livraison par un test direct
(signature + échange réel auprès de Google, avec une fausse identité :
la réponse `invalid_grant` confirme que la construction du jeton est
correcte, seule l'identité elle-même n'existait pas).

**Rappel : ce fichier fait partie de `cloudflare-worker.js`, pas de
`departs.js` — ce correctif ne prend effet qu'après avoir recollé son
contenu dans Cloudflare, réglé les deux nouvelles variables et cliqué
Deploy (étapes 2 et 3 de `CLOUDFLARE-A-FAIRE.md`), un git push seul ne
suffit pas.**

**v1.7.1, même jour — dernier réglage.** Après avoir mis les deux
nouvelles variables et redéployé : le Worker arrivait enfin à
s'authentifier (plus d'erreur de connexion), mais la lecture dans
Firebase échouait avec `401`. Cause : le périmètre (scope) demandé pour
le jeton (`firebase.database` seul) était trop étroit — ajouté
`userinfo.email`, comme le fait toujours le SDK Firebase Admin officiel
pour ce même usage. **Confirmé résolu par Eric** : le message envoyé le
matin même (resté coincé dans la file d'attente tout ce temps) est
arrivé dès que ce correctif a été déployé — notifications de nouveau
fonctionnelles pour toute l'équipe.

**Rappel : ce fichier fait partie de `cloudflare-worker.js`, pas de
`departs.js` — tout correctif ici ne prend effet qu'après l'avoir
recollé dans Cloudflare et cliqué Deploy (`CLOUDFLARE-A-FAIRE.md`), un
git push seul ne suffit pas.**

### ~~Statistiques : par conteneur, en plus de par année~~
**Fait le 27/09 (v2.10.0).** Cobey, capture d'écran des Statistiques à
l'appui : « je trouve ça pas trop lisible et pas trop parlant. On va
plutôt faire des stats par rapport à des conteneurs, c'est-à-dire des
statistiques par conteneur et par rapport à chaque collaborateur. On
pourra aussi faire des statistiques à l'année ». Proposition validée
(« Ok ») après description du plan : bandeau **Par année / Par
conteneur** en haut de l'écran, chaque axe garde sa propre place en
mémoire en passant de l'un à l'autre.

- **Par conteneur** (nouveau) : liste des conteneurs (Chargement DKR,
  Chargement BMK…) avec leur nombre de clients ; on en choisit un et le
  classement des collaborateurs ne compte que SES clients — quelle que
  soit la date de leur inscription, de leur versement ou de leur
  validation. Contrairement au filtre par année (qui regarde la date de
  chaque évènement), un conteneur regroupe des clients : tout ce qui les
  concerne compte, un point c'est tout.
- **Par année** (inchangé dans le fond) : mêmes chiffres qu'avant.
- **Les cartes**, dans les deux modes, sont désormais regroupées en 3
  blocs au lieu d'une seule ligne en vrac : 👤 Clients (inscrits, dont
  Mali) · 💰 Argent (apporté vs encaissé) · 🚛 Terrain (colis validés,
  jours de collecte, tournée moyenne).
- **Export PDF** : « faudrait un bouton pour exporter en pdf » — bouton
  📄 PDF dans l'en-tête, exporte le classement affiché à l'écran (même
  mode, même année/mois ou conteneur).

  **v1.94.1 :** Cobey : « ça ne va pas très bien quand j'appuie [...]
  ça ne fait rien. Je veux un bouton qui permet de l'exporter en pdf
  directement sans avoir besoin d'imprimer autre chose ». La première
  version ouvrait une page à imprimer soi-même (Partager → Imprimer →
  Enregistrer en PDF) — déjà abandonné une fois pour les factures pour
  la même raison. Remplacé par html2canvas + jsPDF (comme la facture,
  les étiquettes) : un vrai fichier .pdf se télécharge directement, sans
  étape intermédiaire.

  **v1.94.2 :** Cobey : « il faut revoir le système de classement des
  statistiques [...] c'est le client apporté. Le client encaissé, un
  collaborateur peut avoir un gros chiffre, mais en fait c'est juste de
  la ramasse — il va ramasser l'argent. Le plus important, c'est le
  client qui sont ainsi apportés ». Le classement était trié par argent
  encaissé — ça récompensait celui qui fait la tournée de collecte sur
  le terrain, pas forcément celui qui a démarché le client (le vrai
  travail commercial). Trié désormais par nombre de clients apportés
  d'abord ; à égalité, la valeur de ces clients départage, puis
  l'encaissé en tout dernier recours.

  **v1.94.3 :** en vérifiant ce classement avec Issyaka, Cobey a relevé
  un écart sur « jours de collecte » (Abdoulaye : « a tourné 3 week-ends
  sur 4 », le classement n'en montrait que 2). Fausse piste corrigée en
  route : l'enregistrement d'un client au dépôt direct n'est PAS une
  tournée de collecte (Cobey : « c'est l'enregistrement d'un client, là
  on parle vraiment de tournée de collecte ») — aucun changement de
  code là-dessus, juste un commentaire pour ne pas s'y reprendre deux
  fois.

  **v1.94.4 — la vraie cause :** Cobey : « tu dois aussi vérifier si son
  nom apparaît dans les camions [...] le chauffeur, par exemple, ne
  valide pas le bouton sur l'application, mais si son nom est inscrit
  dans les camions, c'est qu'il a travaillé ». Un camion porte le nom de
  son équipage (« Samba + Issyaka », choisi à la création) — un
  collaborateur qui conduit sans jamais valider lui-même un colis
  restait invisible de « jours de collecte » et « tournée moyenne ».
  Compte désormais aussi cette journée dès que son nom figure dans un
  camion ayant ramené au moins un client du conteneur (ou de la
  période) suivi — sans toucher « colis validés », qui reste les vraies
  validations.

  **v1.94.5 :** Cobey : « comment faire pour vérifier ses collectes du
  container ? [...] ce qu'il faudrait faire, à côté du nombre de
  collectes que chaque collaborateur a fait, mettre la date des jours
  de collecte qui ont été faits ». Les dates elles-mêmes s'affichent
  maintenant entre parenthèses juste après le nombre (« 3 jours de
  collecte (30/08, 06/09, 13/09) ») — sur l'écran comme dans le PDF —
  pour vérifier soi-même quels jours précis sont comptés, sans
  aller-retour.

  **v1.94.6 :** en creusant l'écart sur le Mali, Cobey a compris tout
  seul et demandé la correction : « c'est les stat du container
  Sénégal, ça comprend pas les clients Mali, faut différencier [...]
  enlève du coup client Mali des Stat du container Sénégal, et
  inversement pour les container de Mali ». Dans un conteneur, tous les
  clients partagent le même pays — le sous-compte Mali y est donc
  toujours à 0 ou à 100 %, jamais informatif. Retiré en mode Par
  conteneur (écran + PDF), gardé en mode Par année (qui mélange les
  deux pays sur toute la période, là il a un sens).

### ~~« Collecté » et « ramassé » — deux mots pour deux choses différentes~~
**Fait le 27/09 (v3.94.0 / v2.9.4).** Cobey, capture d'écran de l'écran
Camion à l'appui : « c'est pas trop compréhensible, au niveau des
chiffres. Il y a marqué collecté, mais ramassé, je sais pas, c'est un
peu bizarre » puis « il faudrait un total facturé et un total qu'ils
ont collecté, quoi. Parce que collecter, c'est le vrai argent qu'ils
ont encaissé. Il y a un prix qui sert à rien, j'ai l'impression ».

Le mot « Collecté » servait à deux choses très différentes sur le même
écran : la valeur des colis déjà ramassés (qu'ils soient payés ou non)
d'un côté, l'argent réellement encaissé de l'autre — d'où la confusion.
Corrigé partout (écran Camion, Suivi financier global, listes de
camions, PDF, bouton sur la carte client) :
- **📋 Facturé** = valeur des clients déjà ramassés (ex-« Collecté »,
  ex-« X € collecté » dans les listes) ;
- **⏳ Restant à ramasser** = ce qu'il reste à ramasser, en valeur
  (ex-« Restant ») ;
- **✅ Collecté** = l'argent réellement reçu — c'est maintenant le
  *seul* endroit où ce mot apparaît (ex-« Encaissé auprès des
  clients ») ;
- **✅ Ramassé — X €** sur la carte d'un client déjà passé (ex-« Collecté
  — X € »).

« Encore dû par les clients ramassés » ne change pas, déjà clair.

### ~~« Livraison à Dakar » — trop précis pour rester clair~~
**Fait le 29/09 (v2.10.29 / v3.94.30).** Cobey, capture d'écran de la
fiche client à l'appui : « au niveau de la mention livraison à Dakar,
il faudrait la modifier parce que ça peut paraître flou. Parce que
comme il y a des livraisons un peu partout, ça peut être confondu.
Donc on va juste mettre livraison. »

« Livraison à Dakar » devient « Livraison » partout où la mention
apparaissait : fiche client (section et question), fiche de dépôt et de
France & Europe, caisse du container, facture (interne et lien public
WhatsApp), devis, historique de fiche (« a activé/désactivé la
livraison »). `livraisonDakar` reste le nom du champ en base — seul le
texte affiché change.

### ~~Le nom du collaborateur sur chaque photo~~
**Fait le 27/09 (v2.9.3).** Cobey : « à côté de la photo que les
collaborateurs prennent pour chaque client, c'est possible de mettre le
nom de la personne qui a pris la photo ? ». Le nom était déjà enregistré
à la prise, jamais affiché : il apparaît maintenant sous chaque
vignette (fiche client et accès rapide depuis un container), et dans la
photo agrandie en plein écran. Une photo prise avant cet ajout, sans
nom enregistré, n'affiche que la date, comme avant.

### ~~Le bouton carte, aussi dans Suivi~~
**Fait le 27/09 (v3.93.4 / v2.9.2).** Cobey : « dans le suivi des
collectes par camion, ce serait bien de mettre le même bouton de trajet
de carte [...] puisque là, pour voir la carte, je suis obligé de
ressortir, aller dans la collecte et aller dans le camion ». Le bouton
« 🗺️ Voir le trajet de ce camion », jusque-là seulement dans Dispatch >
Camion, apparaît maintenant aussi dans l'onglet Suivi, sur la fiche de
chaque camion — la même carte, sans repasser par Dispatch.

### ~~Carré Départ~~
**Fait le 24/09, puis déplacé le même jour (v1.56.0 → v1.59.0).**

Le carré Départ est montré aux clients : plus aucun montant total n'y
figure. Ni le « € COLIS » en haut, ni l'encart Caisse, ni les chiffres
sur les cartes de containers (Départ comme Archivage). Restent le prix
de chaque colis sur la ligne du client, et les pastilles Payés / Non
payés, qui n'affichent pas d'euros.

Tout l'argent vit maintenant dans **Rapport financier > Containers**,
réservé à la direction :
- le cumul de tous les containers, colis et livraison séparés ;
- puis container par container, avec bordure rouge s'il reste à
  encaisser, verte si tout est soldé ;
- en ouvrant un container, l'encart Caisse complet, et les deux cases
  RESTE DÛ qui déplient la liste nominative des retardataires, avec leur
  numéro de téléphone. C'est le seul écran où un nom de client côtoie un
  montant restant.

Les deux caisses n'ont jamais été mélangées : la livraison a la sienne
depuis la v1.19.22.

### ~~Lenteur, et les boutons qui ne répondent pas~~
**Fait le 24/09 (v3.78.0 / v1.81.0).** Même cause pour les deux.

L'application écoutait Firebase sur `dct` tout entier — et le fil
d'Activité vit sous `dct`. Chaque geste de chaque collaborateur y écrit
une ligne, et cette écriture réveillait tout le monde : l'appli
recopiait en entier l'annuaire des clients, puis redessinait l'écran de
fond en comble, pour des données rigoureusement identiques.

Trois corrections :

1. **On ne refait le travail que si quelque chose a bougé.** Sur vingt
   lignes d'Activité sans aucun changement de données, l'écran était
   redessiné vingt fois ; il ne l'est plus qu'une. Le fil d'Activité,
   lui, continue de suivre.
2. **Le garde-doigt.** Un redessin qui tombe entre le moment où le doigt
   touche et celui où il se lève détruit le bouton visé : le navigateur
   n'émet aucun clic, et on a l'impression d'appuyer dans le vide
   (retour de Cobey et des collaborateurs du 24/09). La synchronisation
   attend maintenant que l'écran soit libre, puis rattrape son redessin.
3. **La fiche et la facture ouvertes se rafraîchissent seules.** Un prix
   changé depuis un autre téléphone s'affichait seulement après avoir
   refermé puis rouvert la fiche.

### ~~Suivi du colis~~
**Fait le 24/09 (v1.82.0).** La frise « Suivi de votre colis », sur la
facture envoyée au client, ne porte plus une date à chaque étape.

- L'**arrivée estimée au port de Dakar** s'affiche en clair, dans un
  encadré sous le titre de la frise. C'est la question qu'on nous pose :
  elle n'est plus cachée.
- Les deux seules dates qui comptent pour le client — l'arrivée au port
  et l'arrivée au dépôt — sont pliées derrière un petit bouton
  « 📅 Voir la date ». Les autres étapes n'en portent plus du tout.
- La date d'arrivée estimée vient du container (« Arrivée prévue »),
  déjà saisie à sa création.

Répercuté dans `facture.html`, la page publique autonome, qui reprend la
même mise en page.

**v1.94.36 (01/10) :** Cobey, capture d'écran à l'appui : « le statut
de ce conteneur, il est en train de naviguer, il n'est pas encore
arrivé à Dakar. Mais là, étape en cours, il est sur arrivée à Dakar. Il
n'y a pas un souci ? » — oui : « En cours de navigation » est une
phase qui dure, pas un événement ponctuel comme les autres. La cocher
voulait dire « terminée, passons à la suite » : l'étape SUIVANTE
(Arrivée au port) s'affichait alors « Étape en cours » alors que le
bateau est encore en mer.

Corrigé : tant que « En cours de navigation » est la dernière étape
cochée, c'est elle qui porte « Étape en cours » (avec son icône bateau,
pas une coche verte) — « Arrivée au port » ne passe « en cours » que le
jour où Issyaka la coche à son tour. Corrigé aux deux endroits
(departs.js et facture.html).

**v2.20.45 (12/10) — le message de rappel WhatsApp (avant ramasse)
demande maintenant une confirmation.** Un modèle de message proposé sur
le groupe WhatsApp de l'équipe (« un truc du genre par exemple »),
relayé par Cobey : remplace le texte envoyé par les boutons « 💬
WhatsApp » / « 📋 Copier » posés sur chaque carte client d'une tournée
(v1.20.29, `_depTexteMessageRelance`). Une ligne en plus demande au
client de confirmer la bonne réception du message, pour valider sa
ramasse — avant, le message ne demandait qu'une préparation silencieuse
du colis, sans jamais savoir si le client l'avait seulement vu. Le
créneau (matinée/après-midi) continue de varier selon l'heure
programmée pour CE client précis sur la tournée — plusieurs clients du
même camion reçoivent donc toujours des horaires différents, comme
avant.

---

## 2 bis · France & Europe

### ~~Chauffeur externe : la photo du colis ne s'enregistrait pas~~
**Fait le 04/10 (v3.95.3 / departs.js).** Cobey : « quand je vais sur le
camion du chauffeur externe et que je veux valider le colis [...]
j'appuie sur ramasser. Après, il me demande de faire une photo [...] et
quand j'enregistre, elle ne s'ajoute pas [...] à la fiche du client. »

Cause : l'écran "Valider" (`depOuvrirValidation`/`depValiderConfirmer`,
commun à la Collecte Paris et à France & Europe depuis le 19/09) écrivait
toujours la photo du colis sous `dct_photos_colis/<id>` — le nœud Dakar
— quel que soit le client. Or la fiche d'un client France lit ses photos
sous `france_photos/<id>` (voir `_depChargerPhotos`, et `chauffeur.html`
qui fait déjà bien la distinction) : la photo partait donc à chaque fois
au mauvais endroit, invisible ensuite sur la fiche. Même bug sur le
rechargement automatique (une photo déjà prise par le chauffeur externe
via `chauffeur.html` avant que le bureau ouvre "Valider" — v1.20.22 —
cherchait elle aussi au mauvais endroit). Les deux écritures distinguent
maintenant le nœud selon le client, exactement comme le fait déjà
`chauffeur.html` de son côté.

### ~~Chauffeur externe : "Non ramassé" ne libérait jamais le client~~
**Fait le 04/10 (v3.95.2).** Cobey, capture d'écran de l'écran
"Chauffeur externe" (Dispatch → camion) à l'appui : « quand un client
annule, on peut appuyer que sur non ramassé. Et du coup, il faudrait
qu'on ait un bouton annulé et que le client revienne dans la liste des
clients à planifier pour les tourner [...] si je mets non ramassé, il
me dit qu'il reste dans la collecte, mais après, il reste sur
planifier. »

"Non ramassé" reste inchangé — volontaire : le client reste dans CE
camion, pour retenter plus tard le même jour. Un nouveau bouton (voir
v3.95.3 ci-dessous pour sa forme définitive) retire le client de cette
collecte entièrement (camion, affectation) et remet son statut à
"attente" — le même état qu'un client jamais encore planifié, qui le
fait réapparaître dans "Clients disponibles à ajouter" de n'importe
quelle tournée future.

Jamais le statut `annule` : ce nom est déjà pris, côté "poste" interne
(l'autre écran chauffeur, avec ses motifs "Non ramassé"), par un état
qui sort définitivement le client du circuit — l'inverse de ce qui est
demandé ici. Pas touché à ce deuxième écran ni à `chauffeur.html` (la
page du vrai chauffeur externe, par code) : Cobey a montré l'écran de
Dispatch, réservé au bureau/direction — reporter un client à une
future tournée reste une décision du bureau, pas du chauffeur sur le
terrain.

**v3.95.3, même semaine — même interface que la Collecte.** Cobey : « le
parcours France-Europe [...] il faut que ça soit pareil que le parcours
de la collecte. Pareil en termes de photos, en termes de prise de
photos, en termes de prise de ramasse ou non annulée. Il faut que ce
soit exactement pareil parce que là aussi, je ne peux pas modifier
certaines choses, je n'ai pas les mêmes accès au même endroit. » Puis,
précisé : chaque parcours garde sa propre logique, seule l'interface
doit s'aligner sur le modèle de `renderCamion` (Dakar).

La rangée de boutons d'un client en attente reprend exactement la
disposition de Dakar : « 📦 Valider — X € » en large, « ❌ » et « ⋯ » en
icônes (mêmes classes CSS `.route-action-validate/-refuse/-more`, déjà
utilisées côté Dakar). Le lien discret « Le client a annulé » devient
un vrai bouton « ⋯ », avec le même enchaînement en deux temps que
Dakar (menu, puis confirmation) — seule l'exécution reste propre à
France (retour au vivier "attente"), pas celle de Dakar (simple
marqueur réversible dans le camion, voir plus haut) : les deux
parcours gardent chacun leur approche, seule l'interface est commune.

### ~~La fiche du client, différente entre France & Europe et la Collecte~~
**Fait le 07/10 (v2.20.28 / departs.js).** Cobey, deux captures à
l'appui (fiche « Mme Hauck » côté France & Europe, fiche « Masamba
Mbaye » côté Collecte) : « quand je vais dans le conteneur, en cliquant
sur un client que je collecte et un client quand je départ, c'est pas
du tout la même interface. Il faut tout remettre comme [...] le
parcours collecte. » Puis, pour fixer l'ampleur du chantier : « j'ai
besoin qu'elle soit exactement à l'identique que la collecte, le même
parcours, les mêmes interfaces, la même logique, jusqu'à l'arrivée du
client dans le conteneur [...] chacun a son côté [...] la seule chose
qui va changer, c'est que France on inscrit les clients avant la
collecte, et que pour la collecte on inscrit la collecte avant les
clients. »

La fiche d'un client France & Europe vivait sur son propre écran natif
(`s-france-client` / `_renderFicheFrance`) : pas de Versement/Acompte/
Reste à payer, photos et notes seulement accessibles via un bouton qui
changeait d'écran — alors que la fiche Collecte/Dépôt direct
(`depRenderFicheLecture`) a déjà les deux, en cartes directement sur la
fiche. `ouvrirFicheFrance()` ouvre maintenant ce même écran partagé
(déjà commun à la Collecte et au Dépôt direct) avec les données France
& Europe, au lieu de l'écran natif — qui reste en place mais n'est plus
utilisé pour la consultation. Même principe que l'écran « Valider »
(déjà partagé) : chaque parcours garde ses propres données derrière
(`franceData.clients` pour l'un, les collectes Dakar pour l'autre),
seul l'écran et son comportement sont désormais communs — y compris
l'écriture d'une note, l'ajout d'une photo (sous `france_photos/`,
jamais `dct_photos_colis/`) ou d'un versement/acompte depuis cette
fiche, qui vont bien sous `france/clients/<id>`.

Premier chantier d'une revue complète du parcours France & Europe,
écran par écran, pour l'aligner sur celui de la Collecte jusqu'à
l'arrivée du client dans le conteneur — la seule différence qui reste
volontaire étant l'ordre d'inscription (client avant la collecte côté
France, collecte avant le client côté Collecte).

### ~~"Nouvelle collecte" France & Europe, différente de celle de la Collecte~~
**Fait le 07/10 (v3.95.4).** Suite de la revue écran par écran demandée
par Cobey ci-dessus. Confirmé explicitement : « on touche rien à
parcours collecte, on met France Europe comme parcours collecte » —
l'écran natif `s-new`/`creerCollecte` de la Collecte Dakar n'est pas
modifié d'un seul caractère.

« Nouvelle collecte » côté France & Europe n'était qu'une petite
fenêtre avec une date brute à taper et un statut (En cours/À venir) à
choisir soi-même — alors que la Collecte a un vrai écran guidé : les
prochains dimanches en un clic, une case « Jour exceptionnel » avec sa
propre date, et le statut calculé tout seul selon la semaine en cours.
France & Europe a maintenant son propre écran (`s-new-france`), construit
sur le même gabarit (mêmes classes `sunday-grid`/`toggle-wrap`,
`buildSundaysFrance`/`toggleExcepFrance` recopiant exactement la logique
de `buildSundays`/`toggleExcep`), avec la même garde contre les doublons
de date et le même calcul automatique du statut — plus de menu à choisir
à la main. La seule suite propre à France & Europe, gardée telle
qu'avant : une fois la collecte créée, on enchaîne directement sur le
choix des clients à y mettre (le vivier existe déjà, contrairement à la
Collecte où les clients sont inscrits après coup).

### ~~Confirmations France & Europe : popups natifs au lieu des fenêtres habillées~~
**Fait le 07/10 (v3.95.5).** Suite de la même revue. Pour supprimer une
collecte ou valider un dispatch, la Collecte utilise ses fenêtres
habillées (`modal-del-collecte`, `modal-dispatch-invalid`/`-confirm`) —
France & Europe utilisait à la place les popups basiques du navigateur
(`confirm()`/`alert()`) aux mêmes endroits. France & Europe a maintenant
ses propres fenêtres, construites sur le même gabarit
(`modal-del-collecte-fr`, `modal-dispatch-invalid-fr`/`-confirm-fr`) :
même emoji, même titre, mêmes boutons. « Annuler la validation du
dispatch » n'a plus de confirmation du tout, comme côté Collecte
(`annulerValidationDispatch` n'en a jamais eu). Les écrans natifs de la
Collecte n'ont pas été touchés.

### ~~Bouton "📷 Photos" en trop sur les cartes clients France & Europe~~
**Fait le 07/10 (v3.95.5).** Cobey : « la gestion de photo doit être la
même, possibilité de mettre des photos au même moment que dans le
parcours collecte, à l'inscription, à la ramasse, avec les chauffeurs
externe, vraiment pareil. » Vérifié : les 3 moments où une photo se
prend (ramassage, fiche du client, chauffeur externe) sont déjà
identiques des deux côtés. Mais France & Europe avait un 4ᵉ moyen que la
Collecte n'a pas du tout : un bouton « 📷 Photos » directement sur les
cartes clients des listes (vivier, récapitulatif de tournée), utilisable
à tout moment. Confirmé par Cobey : retiré de ces deux listes pour que
ce soit « vraiment pareil » — il ne reste que les 3 moments communs aux
deux parcours.

### ~~L'écran d'une collecte France & Europe sans récap par collaborateur~~
**Fait le 07/10 (v3.95.6).** Suite de la même revue. Côté Collecte,
l'onglet « Clients » d'une collecte ouverte montre d'abord qui a inscrit
combien de clients et pour quel montant (cartes `collab-grid`, une par
collaborateur). France & Europe n'avait rien d'équivalent sur l'écran
d'une collecte ouverte — juste le suivi financier global et les camions.

Cobey a précisé en cours de route que Danny Diop (partenaire ramassage)
n'intervient plus — les ramasses se font désormais par DCT ou par des
chauffeurs externes directement, ce qui simplifie la comparaison : le
système des « tournées » préparées par Danny (écrans à part, pas revus
ici) n'est plus la préoccupation principale.

Plutôt qu'une reconstruction complète de l'écran France en 4 onglets
séparés comme la Collecte (Clients/Dispatch/Finance/Carte) — plus gros
chantier, plus risqué sur un écran qui marche déjà bien — Cobey a choisi
l'option plus ciblée : le même récap par collaborateur (mêmes cartes
`collab-grid`/`collab-card`) ajouté sur l'écran actuel d'une collecte
France & Europe, juste après le suivi financier global. Compte les
clients de CETTE collecte uniquement (pas tout le vivier), groupés par
`creePar` (qui a inscrit la fiche) — l'équivalent du champ `by` côté
Collecte.

### ~~Impossible de supprimer une fiche France & Europe déjà engagée~~
**Fait le 08/10 (v2.20.29 / departs.js).** Cobey : « un client France &
Europe, quand il est placé dans un conteneur, dans la case départ, ou
quand je le détache même après que je le mets dans le dépôt,
contrairement au parcours client, ce client-là je ne peux pas le
supprimer. Par exemple, j'ai fait un client test, je vais le supprimer,
je ne peux pas. »

Deux causes, les deux réglées :
1. Le bouton « 🗑️ Supprimer cette fiche » vivait sur l'ancien écran natif
   France (`_renderFicheFrance`), devenu inaccessible le 07/10 quand la
   fiche s'est mise à partager l'écran de la Collecte
   (`depRenderFicheLecture`, voir plus haut) — le bouton a disparu avec
   lui. Revenu sur ce nouvel écran partagé, avec sa propre fenêtre
   habillée (`modal-delete-fr`) au lieu d'un `confirm()` natif.
2. La fiche France refusait la suppression dès que le colis n'était
   plus « en attente » (« Impossible : le colis est déjà engagé ») —
   un garde-fou qui n'a pas d'équivalent côté Collecte : `confirmDelete`
   y supprime un client sans aucune condition sur son statut, même déjà
   affecté à un camion. Retiré côté France pour que ce soit vraiment
   pareil ; la suppression retire aussi le client du camion/de la
   collecte où il se trouvait, comme le fait `confirmDelete`.

### ~~Frais de ramassage, pour les clients France & Europe hors Île-de-France~~
**Fait le 08/10 (v2.20.30 / v3.95.7).** Cobey : « pour les clients
France-Europe, on voudrait [...] un endroit pour mettre le prix du
ramassage. Parce qu'en fait, le ramassage en Île-de-France est gratuit,
mais le ramassage pour les autres villes en France, c'est payant. » Puis :
« et du coup le mettre additionnellement dans les factures avec tout ce
qui s'ensuit, logique. »

Nouveau champ « Frais de ramassage (€) » sur le formulaire d'inscription
France & Europe (`fa-ramassage`), stocké à part (`c.prixRamassage`) —
jamais fondu dans le prix du colis (`c.prix`), pour ne rien perdre si le
détail des colis est recalculé plus tard. Ajouté partout où ça compte,
comme demandé :
- **Fiche** et **facture** : ligne « Frais de ramassage » dédiée, en plus
  du prix du colis — le libellé du total passe à « Total (colis +
  ramassage) » sur la facture quand il y en a.
- **Reste à payer / déjà encaissé** (`depCalculerPaiement`, utilisé par
  la fiche et la facture) : inclut désormais les frais de ramassage —
  payés en même temps que le colis, par le même client, contrairement à
  la livraison à Dakar qui garde sa propre caisse séparée.
- **Totaux de la collecte** (suivi financier global, récap par
  collaborateur, sélections du vivier) : `_frPrixClient`/`_totalPrix`
  les comptent aussi.
- **Écran "Valider" (ramassage)** : attention particulière ici — le prix
  affiché/modifiable reste volontairement celui du COLIS SEUL ; les
  frais de ramassage ne sont qu'indiqués à côté, à titre d'info. Les
  fondre dans le champ modifiable aurait risqué de les écrire dans
  `c.prix` dès qu'un collaborateur rouvre ce prix sans le changer — et de
  les doubler au calcul suivant. La modale « Confirmer avant la facture »
  montre quand même le vrai total (colis + ramassage).

Île-de-France n'entre jamais dans ce calcul : ces codes postaux sont déjà
exclus de France & Europe à l'inscription (`zoneDepuisCP`, « à créer dans
une collecte Paris ») — c'est déjà là que le ramassage est gratuit.

**Suite, le 09/10 (v2.20.36) — même champ, pour les devis.** Cobey :
« il faudrait rajouter la case frais de ramassage pour les devis. Car il
y a des clients où on peut faire des devis qui habitent [en France].
Pour ceux qui habitent en Île-de-France, on mettra 0. Et pour ceux qui
habitent hors Île-de-France, on pourra mettre un prix. »

Un devis n'a pas encore de parcours fixé (Collecte, Dépôt direct ou
France & Europe — ce choix ne se fait qu'à la validation, voir
`depDevisValiderVers`) : le nouveau champ « Frais de ramassage (€) »
(`devis-f-ramassage`) est donc toujours disponible sur le formulaire du
devis, stocké à part (`prixRamassage`, jamais mélangé au montant colis)
comme pour une fiche France & Europe. Affiché sur le document du devis
(ligne dédiée + inclus dans le « TOTAL À PAYER », même principe que la
livraison) et sur sa carte dans la liste (« + 25 € ramassage »). S'il est
rempli puis que le devis est validé vers **France & Europe**, le montant
suit automatiquement dans `fa-ramassage` ; ignoré sans dégât si validé
vers Collecte ou Dépôt direct (ces parcours n'ont pas ce champ).

**Fait le 09/10 (v2.20.31) — la ligne n'apparaissait pas sur une fiche
déjà engagée.** Cobey : « je crois que le ramassage France-Europe ne
s'inscrit pas sur la facture. Je viens de faire un test avec un client
France-Europe dans le conteneur, dans la case départ. Et en regardant la
facture, je vois un reste à payer à 10 euros que j'ai mis, mais je ne
vois pas la ligne [...] qui détaille le ramassage. »

Cause plus large que le seul ramassage : **modifier** une fiche France &
Europe plus ancienne, jamais passée par le choix du pays de destination
(`_frClientPaysChoisi`), échouait intégralement et silencieusement —
pas seulement les frais de ramassage, tout l'enregistrement restait sans
effet, sans message clair. `modifierClientFrance` dit pourtant lui-même
dans son propre commentaire « pas de modale forcée en modification,
juste le badge » — mais la garde posée sur `saveClientFrance` (« le pays
de destination doit être choisi avant d'enregistrer ») bloquait quand
même, sans distinguer une inscription d'une modification. Désormais
cette garde ne s'applique plus qu'à une vraie nouvelle inscription ; en
modification, le pays déjà enregistré est conservé tel quel (jamais
écrasé par du vide) même s'il n'est pas re-choisi.

**Fait le 09/10 (v2.20.32) — toujours absent sur la facture PUBLIQUE.**
Cobey, capture à l'appui, sur la facture ouverte depuis le lien/QR
public (`facture.html`, pas l'écran interne de l'appli) : « ça marche
toujours pas [...] j'ai bien 15 euros qui reste à facturer, mais je
n'ai pas de ligne qui stipule le frais de ramassage pour France Europe. »

`facture.html` est une page à part, **sans dépendance à departs.js** —
elle duplique volontairement `depRenderFacturePublique()` et
`depCalculerPaiement()` (le fichier le dit lui-même : « tout futur
changement visuel de la facture doit être répercuté aux DEUX
endroits »). Le premier correctif n'avait touché que departs.js (l'écran
interne) ; cette page-ci, elle, continuait d'ignorer `prixRamassage`
dans son propre calcul ET son propre affichage, d'où l'écart entre le
« Reste à payer » (parfois juste) et un « TOTAL »/« Sous-total colis »
resté bloqué sur le seul colis — 0 € sur la capture de Cobey, alors que
15 € étaient dus. Même correctif appliqué aux deux endroits cette fois :
`depCalculerPaiement` (dans `facture.html`) inclut désormais
`prixRamassage`, et `depRenderFacturePublique` (dans `departs.js` ET
`facture.html`) ajoute la ligne « Frais de ramassage » au tableau et au
total — jamais à part comme la livraison, puisque payés par le même
client au même moment que le colis.

### ~~Scanner un QR code de colis ouvrait la facture, pas la fiche~~
**Fait le 09/10 (v2.20.32).** Cobey : « on avait fait un QR code pour
Mamadou Niass, pour qu'il puisse scanner et faire de la facturation
[...] on laisse le QR code de Mamadou Niass comme tel, on ne le touche
pas. Mais le QR code dans la partie des CT, en scannant aujourd'hui, on
ne tombe que sur la facture. Il faudrait plutôt qu'on puisse atterrir
sur la modification du client pour ajouter des photos ou modifier les
informations [...] pour retrouver un client alors qu'on a le colis
devant nous avec le QR code, on est obligé d'aller rechercher [...]
c'est plus long. »

Le scanner interne de l'appli (icône « QR CODE » de l'accueil →
`depOuvrirScanQR`, écran `s-dep-scan`, caméra + décodage `jsQR`) décode
le même jeton opaque que l'étiquette imprime (`DCTQR1:...`, voir
`_depTokenQR`/`_depDecoderTokenQR`) mais ouvrait ensuite
`depOuvrirFacture`/`depOuvrirFactureFrance`. Ouvre désormais la FICHE du
client (`depOuvrirFicheClient`/`depOuvrirFicheDepot`/`ouvrirFicheFrance`
selon la source) — avec « Modifier la fiche » et « Ajouter une photo »
directement accessibles — exactement ce qui était recherché. `mamadou.html` (la page dédiée
du partenaire, avec son propre scanner et son propre décodage du même
format de jeton) n'a pas été touchée, comme demandé : c'est un fichier
entièrement séparé, pas affecté par ce changement.

**Suite, le 09/10 (v2.20.35), après test sur un client France & Europe.**
Cobey : « je tombe bien sur sa modification de fiche. Par contre, quand
j'appuie en retour, je me retrouve dans la case France-Europe. Il
faudrait plutôt que je me retrouve [...] dans la case départ, comme ça
je peux retrouver le client facilement. Et ainsi modifier également la
facture parce que là en fait je peux pas modifier la facture. »

La fiche partagée (`ouvrirFicheFrance`) lit `_depFicheFranceRetour` pour
savoir où renvoyer le bouton « Retour » — jamais posé par le scanner
avant ce correctif, d'où le repli par défaut vers le hub France &
Europe (`s-france`), qui n'a pas de bouton « Facture ». Le scanner pose
désormais `_depFicheFranceRetour` vers le départ (ou le Dépôt) où le
colis est déjà placé, exactement comme un clic normal depuis l'écran
Départ (`depOuvrirFicheFranceDepuisDepart`) — « Retour » y ramène donc
directement, où le bouton « 🥡 Facture » de chaque client est
accessible. Un client encore « en attente » (jamais placé dans un
départ) retombe sur le hub France & Europe comme avant, faute de départ
à montrer. Le même scan pour un client Collecte/Dépôt direct n'était
pas concerné : `depOuvrirFicheDepot` ramenait déjà au bon départ.

### ~~Photos : accès à la pellicule réservé à l'admin~~
**Fait le 09/10 (v2.20.34 / v3.95.8).** Cobey : « uniquement pour moi,
admin, il faut que tu me laisses la possibilité de pouvoir mettre des
photos via ma pellicule. J'ai programmé uniquement la prise de photos
en temps réel avec l'appareil photo, mais uniquement pour moi, dans
tous les parcours et dans tous les endroits où on peut prendre des
photos, me mettre la possibilité juste à moi de mettre des photos qui
viennent de ma pellicule de mon téléphone. »

Chaque bouton photo utilisait `<input type="file" capture="environment">`,
qui force le téléphone à ouvrir directement l'appareil photo sans
proposer la pellicule. Pour l'admin (`currentUser.admin`) seul, cet
attribut est désormais retiré juste avant d'ouvrir le sélecteur — le
téléphone propose alors aussi "Choisir depuis la pellicule" ; tout le
monde garde l'appareil photo imposé, inchangé. Les quatre endroits où
l'appli principale prend des photos sont concernés : la fiche partagée
Collecte/Dépôt/France (« Ajouter une photo »), le dépôt direct, l'écran
Valider, et le bouton rapide « Prendre une photo » des cartes client
France & Europe. Les pages externes sans notion d'admin pour Cobey
(`chauffeur.html`, et `mamadou.html` qui garde son propre système
intact comme demandé le 09/10) ne sont pas concernées.

### ~~Suivi : une collecte du jour restait "À venir"~~
**Fait le 02/10 (v2.20.4).** Cobey : « la collecte France Europe est
prévue pour aujourd'hui. Alors déjà dans le suivi, on ne voit pas qu'il
est en cours, il est à venir. C'est bizarre. »

Le statut d'une collecte France (En cours / À venir) est un choix fait
une fois pour toutes à sa création (menu « Nouvelle collecte ») — rien
ne le faisait jamais passer à « En cours » tout seul le jour venu. Toute
collecte encore « À venir » dont la date est arrivée (aujourd'hui ou
avant, pour rattraper celles jamais démarrées manuellement) passe
maintenant automatiquement « En cours », vérifié à chaque fois que
l'écran France se rafraîchit — sans jamais toucher une collecte déjà
terminée ni une collecte vraiment à venir.

**?** Le deuxième point du même message — le bouton carte (🗺️, en haut à
droite de l'écran France & Europe) qui ne réagirait pas au clic — n'a
pas pu être reproduit : testé en forçant le même chemin de code, la
carte s'ouvre normalement. Pas corrigé en l'absence d'un cas qui
reproduit le problème.

### ~~Suivi : le clic sur un camion renvoyait vers le Dispatch~~
**Fait le 02/10 (v2.20.5).** Cobey, après clarification du point
précédent : « l'interface du suivi live n'est pas du tout le même que
sur France Collecte. Quand je clique sur le camion, au lieu de me faire
un suivi, il me renvoie sur la ramasse. Enfin, sur le camion dispatch.
Moi, je veux le même suivi que sur le parcours collecte. »

Le clic sur une carte de camion, dans l'écran Suivi France & Europe,
ouvrait par erreur l'écran Dispatch (fait pour cocher les colis un par
un) au lieu du détail qu'affiche déjà la collecte Sénégal pour ce même
geste : une chronologie de chaque client (heure de départ, heure de
passage, durée du trajet, statut coloré). Corrigé en réutilisant
telles quelles les fonctions génériques qui dessinent déjà cette
chronologie côté Sénégal — elles ne connaissaient que la forme d'un
camion (ses clients, qui est passé, qui a été refusé…), strictement la
même côté France. Le clic ouvre maintenant ce même détail, avec un
retour propre vers la liste des camions.

**v2.20.7 :** Cobey, capture d'écran de cet écran tout neuf à l'appui :
« le bouton retour revient à l'accueil, on devrait revenir à l'écran
précédent [...] pourquoi c'est écrit en blanc là, c'est illisible. »
Le texte blanc de l'en-tête (nom du camion, flèche de retour) n'était
lisible que sur le fond bleu marine du bandeau natif de la collecte
Sénégal (posé dans son HTML à part) — recopié ici sans son fond, le même
texte blanc se retrouvait sur le gris clair de l'écran, quasiment
invisible, flèche de retour comprise. Faute de la voir, le seul bouton
visible restant était « ← Accueil » (natif, tout en haut), qui ramène
toujours à l'accueil — d'où l'impression que « le bouton retour » ne
revenait jamais en arrière. Fond marine ajouté : le texte redevient
lisible, et la vraie flèche de retour (vers la liste des camions)
redevient visible et utilisable.

### ~~Chauffeur externe : pas de lien à envoyer~~
**Fait le 01/10 (v2.11.3).** Cobey, capture d'écran à l'appui : « dans la
version chauffeur externe de France Europe, on n'a pas le lien de
génération pour envoyer au client [chauffeur]. Il faudrait faire la
même chose que le parcours collecte, la même interface pour qu'on
puisse lui envoyer un lien avec le code. »

Le Dispatch France & Europe proposait bien un camion qu'on pouvait
nommer « Chauffeur externe », mais c'était un nom comme un autre — sans
code d'accès, sans lien à envoyer. Il a maintenant exactement le même
bouton **🚚 Ajouter un chauffeur externe** que la collecte (Sénégal) :
un code à 4 chiffres généré à la création, un bouton **📋 Copier le
lien + code à envoyer**, et un bandeau « CHAUFFEUR EXTERNE » sur la
carte du camion pour le retrouver.

Les deux mondes ne partagent aucun arbre Firebase (une collecte France
range ses camions dans `france/collectes/{id}/trucks`, jamais dans
`dct/dispatch/{id}/trucks` comme une collecte Sénégal) — `chauffeur.html`
(la page que le chauffeur ouvre) sait désormais distinguer les deux
d'après le code reçu, et va chercher la tournée et les clients au bon
endroit (`france/clients`, pas `dct/clients/{collecteId}`). L'arrêt de
Chartres, propre au Sénégal, ne s'affiche pas sur une tournée France.

**Complété le 01/10 (v2.11.4), Cobey :** « y'a pas l'outil suivi en
direct non plus. » Comme la collecte Sénégal (Suivi live), ce que le
chauffeur signale depuis chauffeur.html doit se voir côté DCT avant
même que la facture soit faite :
- le bandeau du Dispatch distingue maintenant **« X/Y signalés en
  direct »** (ce que le chauffeur a rapporté, `chauffeurStatuts`) de
  **« X/Y facturés »** (le travail de DCT, `validated`/`refused`) ;
- sur l'écran du camion, chaque client que le chauffeur a déjà traité
  mais que DCT n'a pas encore facturé affiche une ligne **📡 Signalé
  récupéré par le chauffeur — à facturer** (ou non récupéré, avec le
  motif) — elle disparaît dès que DCT facture ou refuse le client.

**Complété le 01/10 (v2.11.5), Cobey** (nouvelle capture d'écran, le
vrai écran « Suivi live » du Sénégal à l'appui) : « je veux le même
système que je t'envoie sur la photo de suivi, mais pour France,
Europe. C'est ça que je veux en fait. » France & Europe a maintenant
son propre outil de suivi, un 4e sous-onglet **📍 Suivi** dans sa
barre (à côté de Clients / Collectes / Dispatch), scopé sur la
collecte déjà ouverte :
- une bande sombre reprend la date et le statut de la collecte, avec
  le total **CLIENTS traités / assignés** sur l'ensemble des camions ;
- chaque camion apparaît en carte avec sa couleur, son nombre de
  clients traités, et son état (**pas encore commencé** / **en
  route** / **dernier statut** avec l'heure) ;
- pour un camion chauffeur externe, « en route » et l'heure
  proviennent des vrais horodatages posés par chauffeur.html (Waze
  ouvert, clôture faite) — un suivi réellement en direct, pas une
  simple maquette ;
- toucher une carte ouvre l'écran du camion déjà existant (avec son
  détail client par client, enrichi au point précédent).

**Complété le 01/10 (v2.11.6), Cobey :** « le bouton inscrire client ne
doit être que sur la partie où on voit tous les clients [...] et les
onglets, justement, il faut les descendre en bas, comme dans le
parcours client. » Deux retouches à l'écran France & Europe :
- le bouton **+ Inscrire un client** ne s'affiche plus que sur l'onglet
  Clients (il disparaissait auparavant sur Collectes/Dispatch/Suivi,
  où il n'a pas sa place) ;
- la barre d'onglets **Clients / Collectes / Dispatch / Suivi**, qui
  était sous l'en-tête, est descendue tout en bas de l'écran — au même
  endroit que la barre de navigation (Accueil/Clients/Suivi/Activité)
  utilisée partout ailleurs dans l'appli.

**Complété le 01/10 (v2.11.7), Cobey :** « il y a trop d'onglets,
[l'affichage] chevauche, c'est mal proportionné [...] quand je rentre
dans la collecte, je vois la dispatch [...] alors que dans le parcours
client, on a vraiment d'abord l'accueil et le suivi, et quand on rentre
dans une collecte, on a la dispatch. Il faudrait quelque chose d'assez
similaire. » Avec 4 onglets dans une barre du bas, le mot « Collectes »
retombait à la ligne et chevauchait le trait de l'onglet actif.

Comme dans la collecte Sénégal, « Dispatch » n'est jamais un onglet à
part : **Collectes** et **Dispatch** partagent maintenant le même
emplacement — « 📅 Collectes » tant qu'aucune collecte n'est ouverte,
et ce même emplacement devient « 🚛 Dispatch » dès qu'on en ouvre une
(et revient à « 📅 Collectes » en refermant avec « ← Toutes les
collectes »). La barre repasse ainsi à 3 onglets (Clients / Collectes
ou Dispatch / Suivi), plus lisible et sans chevauchement.

**Complété le 01/10 (v2.11.8), Cobey :** « les boutons du bas sont
assez petits quand même. » Texte et zone tactile de la barre du bas
(Clients / Collectes ou Dispatch / Suivi) agrandis — plus faciles à
toucher du doigt — sans toucher aux onglets identiques utilisés
ailleurs dans l'appli (collecte Sénégal, Espace partenaire), qui
gardent leur taille d'origine.

**Complété le 02/10 (v2.20.8), Cobey :** « théoriquement, il prend une
photo [...] je n'arrive pas à retrouver la photo qu'il a faite [...] je
suis allé sur son camion [...] je n'arrive pas à voir la photo qu'il a
faite. » Un chauffeur externe France photographie bien ses colis
(chauffeur.html, déjà en place), mais DCT n'avait ensuite aucun moyen de
les consulter : un bug de fond, plus une vraie case manquante.

- Le bug : la fonction qui charge les photos d'un client (déjà câblée,
  en apparence, pour la Collecte **et** la France & Europe) se fiait à
  un repère (`c.aPhotoColis`) que seule la Collecte pose jamais — côté
  France, c'est `c.nbPhotos` — et lisait toujours le nœud Firebase de la
  Collecte (`dct_photos_colis`), jamais celui de la France
  (`france_photos`). Pour un client France, la porte se refermait donc
  avant même d'interroger Firebase : « Aucune photo » à coup sûr, photos
  ou pas.
- La case manquante : l'écran du camion France (Dispatch) — celui où
  Cobey est allé chercher, comme pour un camion Sénégal — n'avait tout
  simplement aucun bouton photo, contrairement au parcours Collecte. Un
  bouton **📷 [nombre]** apparaît maintenant sur la carte de chaque
  client qui a des photos, ouvrant la même visionneuse que partout
  ailleurs dans l'application.

**Complété le 02/10 (v2.20.9), Cobey**, capture d'écran du camion
externe côté Collecte à l'appui : « voici l'écran du camion externe du
parcours collecte, on a un bouton pour vérifier la photo, sur parcours
France Europe c'est pas du tout pareil. » Le bouton de la v2.20.8 était
bien là, mais coincé dans la rangée Ramassé/Non ramassé existante —
rien à voir avec la vraie rangée dédiée que montre la Collecte, en
pleine largeur, juste au-dessus. Reproduit maintenant à l'identique
(même rangée à part, même couleurs).

Avec une différence assumée : côté Collecte, ce bouton n'apparaît
qu'une fois le client validé (la photo y est prise par DCT lui-même,
au moment de valider). Côté France, c'est le chauffeur externe qui
prend la photo, avant même que DCT touche l'écran — Cobey : « une fois
qu'il a fini de collecter, il doit venir se présenter à l'entrepôt
[...] ils vérifient avec les photos. » Le bouton apparaît donc dès
qu'il y a une photo, pour pouvoir la consulter **avant** de décider
Ramassé ou Non ramassé, pas seulement après.

**Complété le 02/10 (v2.20.10), Cobey**, nouvelle capture d'écran
(Mamadou Loum) : « toujours rien. » La carte affichait pourtant bien
« 📡 Signalé récupéré par le chauffeur » — la preuve qu'une photo
existait — mais toujours aucun bouton. Cause trouvée, plus profonde que
les deux précédentes : `chauffeur.html` (la page que le chauffeur
externe utilise), en clôturant un client, écrit bien le nombre de
photos — mais seulement dans un coin technique propre au camion
(`chauffeurStatuts`, qui sert juste à afficher cette note), **jamais**
sur la fiche du client elle-même. Le bouton (et le chargement de la
photo au clic) ne regardait que la fiche : pour un client passé par un
chauffeur externe, elle n'a jamais le bon chiffre, photo ou pas.

Trois correctifs, pour que ça ne revienne pas sous une autre forme :
- le bouton du camion regarde maintenant les deux endroits (fiche *et*
  `chauffeurStatuts`) ;
- la fonction qui charge une photo n'exige plus ce chiffre avant
  d'interroger Firebase — elle regarde directement s'il y a quelque
  chose, pour ne plus jamais se fier à un champ qui peut mentir ;
- `chauffeur.html` pose désormais ce chiffre sur la fiche du client en
  clôturant (comme le fait déjà l'ajout de photo depuis l'entrepôt),
  pour que tout le reste de l'application (dont le bouton « 📷 Photos
  des colis » de la fiche client elle-même) le voie aussi — et pour un
  chauffeur externe **Sénégal** aussi, qui avait exactement le même
  trou, jamais remarqué jusqu'ici.

### ~~Suivi : l'onglet traînait même sans collecte ouverte~~
**Fait le 02/10 (v2.20.11).** Cobey, trois captures d'écran à l'appui
(l'écran « Clients inscrits », sans collecte ouverte ; puis une
collecte ouverte sur Dispatch ; puis le vrai écran Suivi) : « sur cette
page le bouton suivi ne sert à rien, il ne fonctionne même pas, il faut
d'abord cliquer sur collecte et aller dans la dispatch pour après avoir
la possibilité de cliquer sur suivi et voir le suivi. On le garde
uniquement dans la collecte, sur la première photo le bouton suivi n'a
pas à être là. »

L'onglet **📍 Suivi** restait affiché dans la barre du bas même tant
qu'aucune collecte n'était ouverte — où il n'y a justement rien à
suivre, et où un tap dessus ne faisait que renvoyer silencieusement
vers « Collectes ». Il disparaît maintenant tant qu'aucune collecte
n'est ouverte, et réapparaît en même temps que « 🚛 Dispatch » (même
emplacement, même logique) dès qu'on en ouvre une.

### ~~Chartres, retiré de l'application~~
**Fait le 25/09 (v3.81.0 / v1.93.0).** « C'est fini Chartres, il n'y a
plus rien qui concerne Chartres. » Cet entrepôt appartenait au montage
avec Global Logistique : les colis de province y étaient déposés, puis
repris par un camion vers Mitry-Mory.

Retiré en entier — environ 900 lignes : l'écran « Entrepôt de Chartres »,
la modale « colis non chargé », l'arrêt sur la feuille de route avec son
heure et son adresse, le choix « Déposer à Chartres », le bloc « À
récupérer à Chartres », le filtre, les badges, l'étape du suivi, les
compteurs et le contrôle de photo au ramassage.

Une fiche qui porte encore `lieu='chartres'` n'est plus mise à part :
elle réapparaît dans le flux normal, comme n'importe quel autre client —
vérifié sur une fiche de 70 jours. Rien n'est perdu.


### ~~Les notes de suivi, visibles depuis la liste~~
**Fait le 25/09 (v3.79.0).** Ces clients ne sont pas à Paris : leur
colis attend parfois quarante-quatre jours, et tout ce qu'on sait d'eux
tient dans les notes. Or la carte n'en disait rien — il fallait ouvrir
chaque fiche, une par une, pour savoir si quelqu'un avait écrit quelque
chose.

Chaque carte porte maintenant :
- sa **dernière note** en clair (date, auteur, deux lignes de texte), et
  « Voir les N notes → » s'il y en a plusieurs ;
- ou, s'il n'y en a aucune, **« 📝 Aucune note · en ajouter »** — c'est
  l'information la plus utile sur un colis qui attend depuis un mois.

Dans les deux cas, on touche le bloc et la fenêtre des notes s'ouvre
directement sur ce client, prête à écrire. Toucher ailleurs sur la carte
ouvre la fiche, comme avant.

### ~~Cumul des frais de ramassage pour estimer une tournée, et pastille "Prêt"~~
**Fait le 12/10 (v3.96.0).** Cobey : « on a besoin de savoir le cumul
des frais de ramassage des clients pour pouvoir estimer une tournée et
voir si on rentre dans ses coûts pour amortir le carburant, le péage du
trajet [...] soit au total des clients, soit en sélectionnant des
clients. » Après discussion (sélection libre plutôt qu'un simple total
par région — « il y a des clients qui sont prêts et d'autres non [...]
des fois on part sur une région et on revient sur une autre sur le
chemin ») :

- La sélection de clients qui existait déjà sur l'onglet Clients (cases
  à cocher, utilisées jusqu'ici pour « Mettre dans un camion ») affiche
  maintenant, dans sa barre du bas, le cumul des frais de ramassage à
  part du total colis + ramassage — c'est ce chiffre-là qui dit si le
  détour est rentable. Chaque carte client affiche aussi son propre
  ramassage (« dont X € ramassage »). La sélection continue de résister
  à un changement de filtre région/département (déjà le cas) — on peut
  cocher en Normandie puis repasser en Île-de-France sur le chemin, la
  sélection et son cumul ne se vident pas.

Puis, deuxième besoin découvert en creusant le premier : « il y a des
clients qui sont prêts, d'autres pas [...] des fois on met dans la
note » — une info enterrée dans du texte libre, invisible sans ouvrir
chaque fiche une par une. Une **pastille "Prêt"** apparaît maintenant
directement sur chaque carte client, modifiable en un tap par
n'importe quel collaborateur (celui qui a le client au téléphone),
sans ouvrir la fiche — 3 états en boucle : non renseigné → ✅ Prêt →
❌ Pas prêt → non renseigné. Une puce "Prêts seulement", sous les
filtres région/département déjà en place, permet de ne garder que les
clients confirmés prêts d'une zone avant de passer à la sélection.

**Suite, le 12/10 (v3.96.1) — le ramassage, plus visible.** Cobey,
après avoir testé : « ça fonctionne, mais je trouve c'est assez petit
comme c'est placé, on le voit pas assez, et sur chaque carte de client
on devrait aussi voir le prix de ramassage en évidence. » Deux
retouches : sur chaque carte, le ramassage quitte le petit texte gris
entre parenthèses pour devenir sa propre pastille (même traitement que
les badges de statut) ; dans la barre de sélection, le cumul quitte lui
aussi le texte 12px discret de la ligne récap pour devenir sa propre
bande turquoise, repérable même en scrollant vite pour cocher des
clients — masquée quand la sélection ne porte aucun ramassage, pour ne
jamais annoncer "0 € de ramassage cumulé".

**Suite, le 12/10 (v3.96.2) — une date à côté du statut "Prêt".**
Cobey : « à côté de prêt ou pas prêt, là où on coche, [il faudrait]
mettre une date. On va en plus savoir à quelle date, si on est prêt ou
pas prêt. » Un "pas prêt" d'il y a trois semaines n'a plus la même
valeur qu'un d'hier. La pastille affiche maintenant la date du dernier
passage à Prêt/Pas prêt, posée automatiquement à chaque tap — et
effacée avec le statut au retour au neutre, pour ne jamais laisser une
date sans rien à expliquer.

**Suite, le 12/10 (v2.20.44 / v3.96.3) — le ramassage, sur la carte-
chiffres tout en haut.** Un collaborateur (Ablaye Diallo), relayé par
Cobey ("Vas-y") : « c'est possible de voir le montant de la ramasse
cumulée France Europe ici ??? » — en désignant la carte "X CLIENTS EN
COURS / Y € MONTANT" en haut de l'onglet Clients, visible sans rien
sélectionner. Cette carte est injectée par departs.js par-dessus la
ligne native de dct-app.html (elle lit le texte de son ".slabel" et le
transforme en tuiles chiffrées, voir le patch sur `window.renderFrance`)
— les deux fichiers ont donc été mis à jour ensemble : dct-app.html
calcule désormais aussi le cumul ramassage de la liste visible (tous
les clients affichés, pas seulement une sélection) et le marque pour
que departs.js l'ajoute en 3e tuile turquoise "Ramassage", à côté de
"Clients en cours" et "Montant" — masquée quand ce cumul est nul.

**Nouveau, le 12/10 (v2.20.47 / v3.97.0) — kilométrage estimé d'un
camion.** Cobey : « on a besoin de savoir chaque camion combien de
kilomètres il parcourt [...] pour mesurer [...] avec quel besoin [...]
amortir le carburant, le péage du trajet [...] le parcours en Europe
également. » Après discussion des options (boîtier GPS externe,
compteur saisi à la main, calcul automatique), choix retenu : « j'ai
une estimation, ça nous va [...] c'est d'avoir une estimation du
kilométrage que le camion fait par rapport aux adresses et à sa
tournée. » Confirmé par itinéraire **routier**, pas à vol d'oiseau.

Un bouton « 📏 Estimer le kilométrage » (et désormais aussi « Recalculer ») :
- **Côté France & Europe** (écran du camion, `estimerKmCamionFrance`) —
  géocode chaque arrêt de la tournée (réutilise `_geocodeClientFr`,
  déjà en place pour la carte Suivi — un client déjà géocodé une fois
  ne l'est jamais deux fois), puis demande au service public et
  gratuit OSRM la distance de l'itinéraire routier entre les arrêts,
  dans l'ordre de passage réel (heure fixée d'abord, ordre
  d'affectation sinon).
- **Côté Collecte** (la carte d'un camion, `depEstimerKmCamion`) —
  même principe, à partir du trajet déjà tracé sur cette carte
  (clients + bornes départ/arrivée du dépôt, Emerainville/Mitry-Mory).

En cas d'échec (service indisponible), un message clair plutôt qu'un
chiffre faux.

**Suite, le 12/10 (v2.20.48 / v3.97.1) — point de départ/arrivée du
dépôt, chauffeur externe, calcul automatique.** Trois affinages, dans
la foulée :

1. « Rajouter le même point de départ et le même point d'arrivée [...]
   oui, c'est la même adresse [...] le rendez-vous pour le départ et
   Mitry-Mory pour l'arrivée. » Le kilométrage France & Europe compte
   désormais aussi l'aller/retour au dépôt — mêmes points que la carte
   Collecte (`window.DEP_CARTE_DEPART`/`ARRIVEE`, exposés par departs.js
   et réutilisés tels quels par dct-app.html : une seule adresse à tenir
   à jour pour les deux parcours).
2. « Pour les chauffeurs externes, il n'y a pas de point de départ, car
   eux démarrent de là où ils habitent. Mais [...] on peut toujours
   mettre un point d'arrivée. » Pour un camion marqué `externe` (lien +
   code à 4 chiffres, déjà utilisé ailleurs), le départ ne compte plus
   dans le calcul — l'arrivée à Mitry-Mory, si.
3. « Ça ne peut pas s'afficher automatiquement sur chaque camion par
   rapport aux adresses déjà [là] ? » Le calcul se lance maintenant
   tout seul à l'ouverture du camion — plus besoin de cliquer pour un
   premier résultat. Toujours une seule fois par ouverture (pas à
   chaque rafraîchissement d'écran, ex. une validation d'arrêt) : le
   bouton, renommé « Recalculer » une fois un résultat affiché, reste
   là pour relancer le calcul à la demande.

**Suite, le 12/10 (v2.20.49 / v3.97.2) — un seul et même endroit pour
les deux parcours.** Cobey, après avoir demandé où ça s'affichait :
« il faudrait faire la même chose pour les deux. Parce qu'avoir la
même chose dans deux parcours avec de façon différente, c'est un peu
déroutant. » Le kilométrage vivait sur l'écran du camion côté France &
Europe, mais seulement dans sa carte côté Collecte — deux façons
différentes d'arriver au même renseignement. Déplacé sur l'écran natif
du camion côté Collecte aussi (`estimerKmCamion`, posé dans
`openCamion` comme côté France), retiré de la carte (`depCarteCamion`)
qui redevient uniquement une vue du trajet. Même emplacement, même
présentation, même déclenchement automatique à l'ouverture, des deux
côtés désormais.

**Suite, le 12/10 (v3.97.3) — une mention pour ne pas "appuyer sur
Recalculer dans le vide".** Cobey, en pensant à un cas concret
(ajouter un client à un camion déjà ouvert) : « quand on appuie sur
recalculer, on met une mention avec le nombre total de clients,
l'heure, la date. Comme ça, on est sûr que ça a bien pris en compte
les dernières modifications [...] je ne vais pas appuyer sur
recalculer dans le vide. » Le calcul automatique ne se relance qu'à
l'ouverture du camion (voir l'entrée juste au-dessus) — ajouter un
client ensuite ne met pas le chiffre à jour tout seul, il faut
rappuyer sur "Recalculer". Chaque résultat (France comme Collecte)
porte désormais une ligne « Calculé le JJ/MM/AAAA à HHhMM · N clients
pris en compte » : de quoi voir d'un coup d'œil si le dernier calcul
a bien eu lieu après la dernière modification, sans avoir à deviner.

**Suite, le 13/10 (v3.98.8) — aucune carte sur l'écran du camion
lui-même.** Cobey, juste après avoir créé une tournée France Europe :
« déjà dans le camion créé on ne voit pas la carte ». Exact : le bouton
🗺️ existait déjà sur l'écran du chauffeur (`s-poste-tournee`) et sur la
carte Collecte d'un camion (`depCarteCamion`), mais jamais sur l'écran
du camion vu par DCT (`s-fr-camion`, celui-là même qui affiche le
kilométrage et l'ordre de passage) — un oubli, pas un choix. Même bouton
🗺️ ajouté dans son en-tête, à la même place que les autres écrans
camion : ouvre la carte scopée sur les seuls clients de ce camion, dans
l'ordre de passage, avec le trajet tracé dans la couleur du camion.

Au passage, pour le second point de son message (les points bleu foncé
sur la « Carte des colis ») : la légende en bas de cette carte le dit
déjà — gris = en attente, **bleu foncé = planifié** (affecté à un
camion, pas encore ramassé), vert = ramassé.

**Suite, le 13/10 (v3.98.9) — deux retouches sur ces mêmes cartes.**

1. « Il manque le point de départ, Emerainville, et le point d'arrivée
   à Mitry-Mory, on a besoin de tout le visuel, avec son cheminement. »
   La carte du camion (ajoutée juste au-dessus) ne traçait le trajet
   qu'entre les clients. Elle pose maintenant les deux mêmes repères
   que la carte d'un camion Collecte (🚛 départ, 🏁 arrivée), avec les
   mêmes bornes que celles déjà utilisées pour le kilométrage
   (Emerainville pour un camion interne, la ville du chauffeur pour un
   externe qui l'a renseignée, Mitry-Mory à l'arrivée dans tous les cas)
   — le trajet complet, pas seulement entre les clients.

2. « Les clients dont le ramassage a été effectué, il faut les retirer
   de la carte principale, pour que lors de la prochaine tournée on ne
   se trompe pas. » Un client déjà ramassé (vert) restait affiché sur
   la « Carte des colis » — simplement vert au lieu de bleu. Il
   disparaît maintenant de cette carte (il reste visible partout
   ailleurs — fiche, listes, suivi financier — seule la carte des colis
   à venir ne le montre plus), pour ne pas le confondre avec un colis
   qui attend encore d'être pris lors de la prochaine tournée.

**Suite, le 13/10 (v3.99.0 / v2.20.58) — le comparatif coûts/ramassage
par camion.** Cobey : « est-il possible d'avoir le calcul de temps de
trajet de la tournée, avec une moyenne de 20 min chez le client, avoir
une estimation de l'essence qu'on va utiliser, des péages qu'on va
prendre, et le tout pour chaque camion un comparatif avec le prix de
ramassage, car on veut voir si on rentre dans nos coûts. » Après
discussion, décision retenue : les péages se saisissent à la main
(aucune API gratuite fiable trouvée pour les calculer automatiquement —
Mappy et Google en ont une, mais payante), et cette estimation reste
séparée des vraies dépenses du rapport financier : « la case des
dépenses doit être identique au parcours Collecte, car ça sera des
dépenses réelles [...] mais pour l'estimation avec comparatif du prix
de ramassage, ça doit être à part. »

Premier chantier fait : la case **« 💰 Dépenses du camion »**, qui
n'existait que côté Collecte, posée aussi sur l'écran du camion France
& Europe — le même écran partagé (catégories, saisie, suppression,
calcul du gain net), juste relié aux données France & Europe au lieu de
Collecte. Nouvelle catégorie commune aux deux : **Péage**. Le temps de
trajet + l'essence estimée + le comparatif face au ramassage (l'outil «
à part » demandé) restent à faire.

**Suite, le 13/10 (v3.99.1 / v2.20.59) — le bouton retour de la fiche
client ramenait sur toute la liste, pas sur le camion.** Cobey : « une
fois le client validé avec sa facture, le bouton retour à la tournée
fait revenir dans l'interface avec tout les camions, il devrait faire
revenir dans la tournée du camion lui-même, pour qu'on puisse enchaîner
avec le prochain client rapidement. » La fiche client, ouverte depuis la
tournée d'un camion, ramenait toujours sur la liste générale France &
Europe au lieu de ce camion précis — le même mécanisme qui fait déjà
revenir une fiche ouverte depuis un container (Départ) ou le rapport
financier sur le bon endroit, étendu au cas "ouverte depuis un camion".
Ouverte depuis la liste Suivi, le retour reste inchangé (liste générale).

**Suite, le 13/10 (v3.99.2-v3.99.3 / v2.20.60-v2.20.61) — trois autres
boutons manquants sur le camion France & Europe.** Cobey : « le bouton
whatsapp et copier (pour prévenir de l'arrivée du chauffeur) et
observation n'existe pas également dans les camions de France Europe »,
puis « quand on prend une photo, le raccourci de la photo devrait
apparaître sur chaque cadre du client, pour avoir un aperçu rapide, ça
ne s'affiche pas non plus. » Les trois existaient déjà côté Collecte
(rappel WhatsApp + Copier avant la ramasse, bouton Observation, bouton
📷 Photos sur une carte déjà ramassée), posés directement sur les cartes
natives (`#camion-route`) — jamais branchés sur les cartes France & Europe
(`#frc-route`), bien que la structure des cartes soit identique des deux
côtés. Même généralisation que pour la case Dépenses : les fonctions qui
posent ces boutons lisent maintenant soit la Collecte soit France & Europe
selon leur source, et les écrans de lecture (historique des observations,
grille de photos) qu'ils ouvrent savaient déjà lire une fiche France
(construits pour ça dès l'origine, juste jamais atteints depuis ce camion).
Au passage, le titre de la fenêtre Photos affichait toujours « Client »
pour une fiche France (champ `.name` qui n'existe que côté Collecte) —
corrigé en même temps.

**Suite, le 13/10 (v3.99.4 / v2.20.62) — le comparatif coûts/ramassage,
« à part » du rapport financier, tel que demandé au départ.** Trois
pièces :

1. **Temps de trajet** — le service déjà utilisé pour le kilométrage
   (OSRM) renvoie aussi la durée du trajet, jamais lue jusqu'ici ; il a
   suffi de la récupérer. Affichée sous le kilométrage : « ⏱️ ≈ 3h 10min
   (trajet 2h 30min + 20 min × 2 clients) » — les 20 min par client
   demandées, ajoutées au trajet routier pur.
2. **Essence estimée** — kilométrage × consommation × prix du litre,
   deux champs modifiables (défaut 11 L/100km, 2,35 €/L — « on a pas de
   chiffre pour ce camion », donc une valeur de départ à corriger au
   besoin plutôt qu'une vraie consommation).

   **Correctif du 13/10 :** le prix par défaut (1,75 €/L) datait, pas le
   prix du jour — vérifié : le gazole tournait autour de 2,35 €/L début
   octobre 2026. Valeur par défaut corrigée ; elle reste modifiable à la
   main si le prix réel payé diffère.
3. **Péages** — repris directement des vraies dépenses de ce camion
   (catégorie « Péage », ajoutée avec la case Dépenses) : saisis une
   seule fois, à la main (toujours aucune API gratuite trouvée), ils
   comptent à la fois comme dépense réelle et dans ce comparatif.

Le tout dans une nouvelle case « 📊 Comparatif coûts / ramassage » sur
l'écran du camion, sous Dépenses : essence + péages comparés au
ramassage de ce camion, avec un verdict (rentable ou non) et la marge
en euros. Volontairement séparée de la case Dépenses (données réelles,
rapport financier) — recalcule à la volée si on change la consommation
ou le prix du litre, sans relancer le calcul d'itinéraire.

**Correctif du 14/10 (v3.99.6) — le ramassage affichait 0 € tant que
la tournée n'avait pas commencé.** Cobey, sur une tournée tout juste
créée, aucun client encore validé : « où est le prix total des prix de
ramassage du camion ? » « Ramassage de ce camion » lisait le montant
déjà COLLECTÉ (les clients validés uniquement — 0 € en début de
tournée), alors que le comparatif veut savoir si toute la tournée
PRÉVUE est rentable, pas seulement ce qui est déjà fait. Lit maintenant
la valeur totale de tous les clients affectés à ce camion, qu'ils
soient déjà ramassés ou non.

**Correctif du 14/10 (v3.99.7) — ce total comptait le prix du colis,
pas seulement le ramassage.** Cobey : « il faut le comparer avec les
prix de ramassage uniquement, pas le prix des colis. » Le correctif
précédent (`_frTotalCamion`) additionnait colis + frais de ramassage —
même mélange que `_totalPrix`, déjà écarté pour cette estimation côté «
Caisse de ce container » (v3.96.0 : « seul le ramassage sert à juger si
le trajet s'amortit »). Reprend `_totalRamassage`, construite pour
exactement ce besoin : seuls les frais de ramassage des clients du
camion entrent dans le comparatif.

**Suite, le 14/10 (v3.99.8 / v2.20.63) — le péage change de
fonctionnement.** Cobey : « on va le laisser dans les dépenses, pour
avoir le chiffre réel, et on va mettre la possibilité de rentrer un
montant total dans le comparatif pour avoir une idée directe, l'un
n'impacte pas l'autre, un c'est la dépense réelle, l'autre c'est pour
le comparatif. » Le comparatif reprenait jusqu'ici le péage déjà saisi
dans les vraies Dépenses — désormais un champ de saisie libre, propre
au comparatif, sans aucun lien avec la dépense réelle : ajouter un
péage dans les Dépenses ne change plus le comparatif, et inversement.

**Suite, le 14/10 (v3.99.9) — l'heure d'arrivée estimée, et l'écran du
camion allégé.** Deux demandes dans le même message :

1. « Je voulais aussi mettre le temps de trajet, avec la moyenne de 20
   min chez le client, et pouvoir choisir une heure de départ, comme ça
   on a une estimation d'arrivée au dépôt à Mitry. » Un champ « Heure de
   départ » sous la durée estimée : l'appli calcule automatiquement
   « 🏁 Arrivée estimée au dépôt (Mitry-Mory) : HH h MM » à partir de
   l'heure saisie + la durée déjà calculée (trajet + 20 min/client).
   Remise à zéro en changeant de camion, comme le reste de l'estimation.

2. « Les clients sont tout en bas [...] ça devient trop chargé [...]
   faudra sinon faire des sous-interfaces ? » Kilométrage + heure de
   départ/arrivée + Comparatif coûts/ramassage déménagent sur un écran à
   part, ouvert par une case résumé compacte (« 📊 Trajet & coûts »,
   km/durée/arrivée + le verdict rentable ou non) — même principe que la
   case Dépenses, déjà construite sur ce modèle. L'écran principal du
   camion ne garde que l'essentiel pour la tournée en cours : le résumé
   financier, les Dépenses (laissées en place, non demandées à
   déménager) et la liste des clients.

**Correctif du 14/10 (v3.99.10) — l'heure de départ se perdait en
quittant l'écran du camion.** Cobey : « l'heure d'estimation ne reste
pas quand on sort du camion, laisse la dernière écriture en place, si
on veut revoir. » `ouvrirCamionFrance` vidait l'heure de départ à
CHAQUE ouverture, y compris en rouvrant le même camion après être
passé par le hub général ou un autre camion entretemps. Elle est
maintenant gardée par camion (tant que la page reste ouverte) et
restaurée à la réouverture — seul le passage sur un AUTRE camion
l'efface, puisqu'elle n'a plus de sens là.

### ~~"Nouveau camion" (France & Europe) : conducteur en saisie libre~~
**Fait le 12/10 (v3.97.4).** Cobey, sur la modale "Nouveau camion" :
« il faudrait remettre les noms des collaborateurs en présélection.
Parce que comme ça pourrait être pratique pour les statistiques plus
tard. » Le champ "Conducteur" n'était qu'un texte libre ("Moussa — ou
un chauffeur externe") — un nom mal tapé, ou tapé différemment d'une
fois sur l'autre, rend impossible tout regroupement futur par
collaborateur.

Reprend telle quelle la présélection déjà en place côté Collecte
(`addTruck`) : une pastille par collaborateur actif (admin et
désactivés exclus), cliquable, qui remplit le champ — plusieurs
pastilles se cumulent avec "+" (ex. "Samba + Issyaka", pour un camion à
deux). "+ Autre" ouvre une petite fenêtre à part pour un chauffeur
extérieur, qui vient s'ajouter au champ de la même façon. Le texte
reste modifiable à la main si besoin — la présélection est un raccourci,
pas une obligation.

**Suite, le 12/10 (v3.98.0) — ville de départ manuelle pour un
chauffeur externe.** Cobey, après le test terrain ci-dessus : « pour les
chauffeurs externes, on va changer. On va plutôt voir si on peut avoir
la possibilité de mettre une ville manuellement pour la ville de
départ. Car le chauffeur externe, selon lequel c'est, sa ville
d'habitation est différente. Comme ça, celui-ci nous communiquera sa
ville de départ et on l'intégrera. »

Sur l'écran du camion, un chauffeur externe (et lui seul — un
collaborateur part toujours d'Emerainville, fixe) voit désormais un
champ « 📍 Ville de départ » : vide au départ, renseigné une fois le
chauffeur prévenu, modifiable à tout moment. Une fois enregistrée, le
kilométrage l'utilise comme point de départ à la place du dépôt — le
retour à Mitry-Mory reste compté comme avant. Sans ville renseignée,
comportement inchangé (aucun point de départ compté). Même champ, même
comportement des deux côtés (France & Europe et Collecte), comme pour
le reste du kilométrage.

---

## 3 · Bug

- ~~Des modifications sur une fiche client (montant, information) qui
  avaient l'air d'être enregistrées, mais disparaissaient en revenant
  sur le client — sans aucun message d'erreur.~~ **Réglé le 12/10
  (v2.20.46).** Plusieurs collaborateurs (dont Aminata) ont fait le même
  retour : « on met un montant ou une information sur un client, on
  appuie enregistrer, quand on revient sur le client, il ne s'enregistre
  pas [...] il n'y a pas de message d'erreur. »

  Trouvé en lisant le code plutôt qu'en devinant : `_depEcrireFacture`
  (les branches France et Dépôt direct — versements, fiche, etc.) et
  `_depEcrireClient` (branche Dépôt direct) n'avaient tout simplement
  **aucun `.catch()` visible** sur leur écriture Firebase — contrairement
  à la branche Collecte, déjà correcte. Un échec d'écriture (le cas le
  plus probable sur le terrain : réseau coupé pendant une tournée) ne
  déclenchait donc RIEN — ni erreur dans la console, ni toast. Le champ
  modifié restait juste à l'écran (déjà mis à jour en mémoire par celui
  qui vient de taper), jusqu'à ce que la fiche se recharge depuis
  Firebase — à ce moment-là seulement, la modification avait disparu,
  sans que personne n'ait jamais vu d'erreur pour comprendre pourquoi.
  Correspond exactement au symptôme décrit.

  Corrigé : les 3 branches (France, Dépôt, Collecte) affichent
  désormais le même toast rouge « ❌ Échec de l'enregistrement,
  réessayez. » en cas d'échec. Ça ne rend pas la connexion plus fiable
  sur le terrain, mais ça rend l'échec visible — un collaborateur qui
  voit ce message sait qu'il doit refaire sa saisie, au lieu de croire
  (à tort) que c'est enregistré.

- ~~Un prix confirmé à la validation d'une **collecte du dimanche**
  pouvait s'enregistrer à 0 € malgré lui, et rester ensuite impossible
  à corriger.~~ **Réglé le 02/10 (v2.19.0).** Cobey, après une première
  piste écartée (voir l'entrée Dépôt direct ci-dessous) : « Boubacar est
  parti faire une collecte d'un dimanche [...] ils sont allés chez les
  clients [...] un client avait un prix à 0 euros. Mais du coup, il
  n'avait pas mis... erreur, 100 euros. Après, il a validé, il a voulu
  rectifier, remettre à 0 euros. Mais là, il était bloqué. Il ne pouvait
  plus valider la facture s'il ne mettait pas un montant. Et c'était
  bien dans le parcours collecte. »

  Reproduit précisément : un client sans détail de colis (juste un texte
  libre, prix 0 €) se voit reconstruire automatiquement une ligne
  fantôme dès l'ouverture de l'écran « Valider » (ex. « Carton · 0 € »),
  invisible pour le collaborateur qui ne touche que le prix simple. Deux
  bugs en cascade :
  1. le prix réellement enregistré se recalculait toujours à partir de
     cette ligne fantôme restée à 0 € — la modale « Confirmer avant la
     facture » affichait bien les 100 € tapés et confirmés, mais 0 €
     étaient réellement sauvegardés, sans aucune erreur ;
  2. pour corriger ensuite (en supprimant cette ligne), le champ Prix
     restait bloqué en lecture seule sur l'ancien total — impossible à
     ramener à 0 € depuis la fiche.

  Le prix confirmé a maintenant toujours le dernier mot (il reflète déjà
  le détail en temps réel dès qu'il y en a un) ; supprimer la dernière
  ligne déverrouille désormais le prix au lieu de le laisser figé. Même
  correctif appliqué à France & Europe, qui partage le même écran
  Valider.

- ~~Impossible de remettre un **prix à 0 €** sur une fiche du Dépôt
  direct — « il faut absolument mettre un prix ».~~ **Réglé le 02/10
  (v2.18.0).** Cobey : « la facture n'est pas forcément obligatoire
  d'être payée pour être validée, car le client peut payer maximum
  jusqu'à l'arrivée du colis à Dakar [...] quand un collaborateur va
  chez un client faire une ramasse et que ce client-là a un prix à 0,
  mais que par accident il met 10 euros et qu'il valide, s'il veut
  rectifier et enlever les 10 euros, une fois qu'il remet 0 euros, on a
  un message d'erreur [...] ça contredit le fait qu'une facture peut
  être validée à 0. »

  Le formulaire « Inscrire un client au dépôt » refusait tout prix
  inférieur OU ÉGAL à 0 — un 0 € volontaire (envoi gratuit, geste
  commercial) tombait dans le même filet qu'un champ resté vide par
  erreur. Seul un prix négatif est désormais bloqué ; 0 € s'enregistre
  normalement, comme partout ailleurs dans l'application.

- ~~Le **regroupement de factures** ne fonctionne pas pour tout le monde.~~
  **Réglé le 24/09 (v1.54.0).** Le bouton « Regrouper avec une autre
  facture » n'existait que sur les fiches de la Collecte. Le carré Départ,
  lui, comptait les doublons des trois parcours : il annonçait « 4 factures »
  puis ne proposait rien sur la fiche du Dépôt direct ni sur celle de
  France & Europe. Les trois parcours partagent désormais le même
  regroupement, dans les deux sens (regrouper et séparer).

- ~~**Lenteur** — après modification d'une facture, le prix met trop de temps
  à apparaître sur la fiche client.~~ **Réglé le 24/09** — voir « Lenteur,
  et les boutons qui ne répondent pas » plus haut.

- ~~Sur la **facture envoyée par WhatsApp**, deux articles achetés
  séparément se retrouvaient **fusionnés en une seule ligne** — alors
  que le PDF interne les affichait bien chacun sur sa ligne.~~
  **Réglé le 28/09 (v2.10.25 / v3.94.26).** Signalé par Cobey avec deux
  photos de la même facture (client Uny, C-SN-130926-82) prises à trois
  minutes d'intervalle : « Carton IKEA » (220 €) et « Achat lit IKEA »
  (404 €) devenaient « Carton IKEA, Achat lit IKEA » à 624 € sur le lien
  envoyé au client.

  Le lien WhatsApp ne pointe pas vers l'application mais vers une page à
  part, `facture.html`, qui reconstruit tout l'affichage de la facture
  de son côté (pour rester consultable sans connexion, sans charger toute
  l'appli). Cette page n'avait jamais été mise à jour pour le détail
  ligne par ligne des colis (ajouté depuis) : elle affichait toujours
  tout le texte résumé sur une seule ligne, avec le prix total dessus.
  Elle reprend désormais le même détail article par article que la
  facture interne.

---

## 4 · Factures et étiquettes

- ~~Pas de **conditions générales** sur la facture.~~ **Fait le 01/10
  (v2.12.0).** Cobey : « je voudrais mettre des conditions générales en
  troisième page sur les factures, après le suivi des colis [...] une
  mention légale comme quoi, au bout d'un certain temps, si les colis
  ne sont pas récupérés, ils sont détruits [...] pour protéger et
  anticiper les problèmes à venir. »

  La facture a maintenant une 3e page, « Conditions générales de
  transport » (7 articles : objet, délais de livraison, retrait des
  colis, contenu/emballage, réclamations, paiement, données
  personnelles) — toujours présente, après la page 1 (prix) et la
  page 2 (suivi des colis, quand il y en a un). Cette page est
  capturée comme une page A4 à part à l'impression comme à l'export
  PDF, exactement comme la page 2.

  **Article 3 (retrait des colis) révisé le 04/10 (v2.20.25).** Cobey,
  capture d'écran de l'article à l'appui : « il faut changer. Alors, à
  l'arrivée du colis à Dakar, les personnes ont 48 heures ouvrées pour
  venir chercher leur colis. Au-delà de ça, Dakar City Transport se
  donne le droit de facturer 5 euros par jour de gardiennage. Et c'est
  au bout de 60 jours qu'ils se gardent le droit aussi d'enlever le
  colis de leur dépôt. » Remplace l'ancienne clause (60 jours puis
  rappel puis 15 jours avant destruction/don/mise en vente, sans frais
  de gardiennage — décision inversée depuis par Cobey) : désormais
  48h ouvrées pour venir chercher le colis, puis 5 €/jour de
  gardiennage, et à 60 jours DCT peut retirer le colis de son dépôt.
  Texte uniquement (mention légale) : aucun calcul de frais n'est
  automatisé dans l'application.

  **Article 5 (« Emballage et casse ») ajouté le 09/10 (v2.20.33).**
  Cobey : « il y a beaucoup de clients qui donnent des colis non
  emballés, non filmés, non protégés. Donc on veut se décharger de
  toute responsabilité, car la société de transport, eux, des fois,
  filment, mais il y a de la casse, parce qu'il y a des objets
  fragiles. La dernière fois, il y a un [objet] qui s'est cassé, et le
  client n'a même pas emballé. Donc on veut se décharger de ça. »

  Nouvel article, inséré juste après « Contenu et emballage » (devenu
  l'article 8 au total) : l'emballage/la protection du colis — en
  particulier tout objet fragile ou cassable — reste la responsabilité
  du client avant la prise en charge. Si Dakar City Transport emballe
  ou filme ponctuellement un colis, c'est un geste commercial sans
  obligation de résultat, qui ne crée aucune responsabilité
  supplémentaire. Dakar City Transport décline toute responsabilité en
  cas de casse ou de détérioration d'un colis remis non emballé, non
  filmé ou insuffisamment protégé — même si Dakar City Transport est
  intervenu sur son emballage.

  ⚠️ Ce texte n'a pas été relu par un juriste — à faire valider avant
  diffusion à grande échelle, en particulier pour la partie France/UE
  (droit de la consommation, RGPD).

- ~~Sur la facture publique (lien client), **"Imprimer / PDF" ouvrait
  la boîte d'impression du navigateur**, pas un vrai PDF.~~ **Fait le
  01/10 (v2.12.1).** Cobey, en vérifiant la page 3 : « quand le client
  appuie sur imprimer/pdf ça va directement dans le menu d'impression,
  faut que ça génère un PDF avant. »

  Un audit précédent (28/09/2026) avait déjà fait remplacer ce
  window.print() par un vrai export PDF (html2canvas + jsPDF) partout
  ailleurs dans l'appli — sauf sur cette page publique autonome
  (facture.html), qui n'était pas concernée à l'époque puisqu'elle n'a
  pas le cadre .app du reste de l'appli. Reprend la même mécanique :
  le bouton génère et télécharge directement un vrai fichier PDF (les
  3 pages — prix, suivi s'il y en a, conditions générales), sans passer
  par la boîte d'impression du navigateur.

  **Complété le 01/10 (v2.12.2), Cobey**, capture du PDF généré à
  l'appui : « adapte bien le texte à la page. » La page 3 n'a que du
  texte (pas de tableau ni de frise comme les pages 1 et 2) : elle
  ressortait bien plus courte que la page A4 une fois mise à l'échelle,
  laissant un grand vide sous le texte. Texte agrandi et plus espacé
  (titre, articles) pour occuper correctement la page — plus lisible
  aussi, un vrai texte de conditions générales imprimé n'est jamais en
  tout petit.

  **Complété le 01/10 (v2.12.3), Cobey :** « supprime l'article 5 et
  pour l'article 6, passe le délai à 24 heures au lieu de 7 jours et
  supprime l'article 9. » L'article « Responsabilité et valeur
  déclarée » et l'article « Litiges » ont été retirés ; l'article
  « Réclamations » passe de 7 jours à 24 heures pour signaler un colis
  endommagé, manquant ou mal livré. 7 articles au lieu de 9,
  renumérotés automatiquement.

- ~~Pouvoir créer des **factures manuelles** rattachées à un container,
  pour le suivi.~~ **Fait le 02/10 (v2.13.0), Cobey :** « il faudrait
  créer une case facture manuelle qui permette d'éditer des factures à
  la main, on pourra les relier à des containers pour qu'ils aient un
  suivi, mais ces factures ne seraient pas comptées dans le container
  et dans les chiffres globaux, c'est des factures fictives pour des
  partenaires, pour direction admin et moi » — puis « Bureau aussi
  doit avoir cette case. »

  Nouvelle case **🧾 Facture manuelle** sur l'écran Départ, à côté de
  Devis — visible pour la Direction, l'admin et Aminata (Bureau), pas
  pour les collaborateurs de terrain. Même éditeur de lignes et même
  mise en page de document que Devis (export PDF compris), mais le
  document dit « FACTURE » (ces factures sont destinées à être remises
  telles quelles à un partenaire). Chaque facture peut être reliée à un
  container (facultatif) pour le suivi ; le détail du container affiche
  alors un petit encart « N facture(s) manuelle(s) liée(s) » avec leur
  montant, marqué « ne compte pas dans ce container ni dans les
  chiffres globaux ».

  Ces factures sont rangées dans un nœud Firebase à part
  (`dct_factures_manuelles`), jamais mêlées aux vrais clients (ni
  `dct/clients`, ni `dct_depot`, ni `france/clients`) : aucun calcul
  de total existant (bilan financier, bénéfice d'un container,
  statistiques) ne lit ce nœud — l'isolement vient de là où c'est
  rangé, pas d'un filtre ajouté à chaque endroit qui somme de l'argent.
- ~~Les **devis** utilisaient encore l'ancienne saisie (texte libre +
  un seul montant), et leur présentation différait de la facture.~~
  **Fait le 30/09 (v2.10.32 / v3.94.33).** Cobey : « pour les devis,
  l'édition de facture est sur l'ancienne version, il faut la mettre
  comme l'édition de facture des clients dans les collectes,
  identique. Ainsi que la présentation du devis doit être similaire à
  celle des factures. »

  Le formulaire Devis a maintenant le même éditeur de lignes que la
  fiche client en Collecte, Dépôt ou France & Europe (catalogue Prix
  articles, quantité/prix par article, lots) — le montant se calcule
  tout seul dès qu'une ligne existe, comme partout ailleurs. Le
  document du devis affiche désormais un vrai tableau ligne par ligne
  (N°/Description/Qté/Unité/Prix unitaire/Montant), identique à celui
  de la facture, au lieu d'une seule ligne "Transport ... — texte
  libre". Le détail suit aussi quand un devis est transformé en client
  réel (Collecte, Dépôt, France & Europe) : il ne se perd plus au
  passage.
- ~~Sur la facture, le **payé / reste à payer** ne se voit pas assez
  d'un coup d'œil.~~ **Fait le 28/09 (v2.10.26 / v3.94.27).** « Il
  faudrait des codes couleurs. Pareil pour la livraison. » Montant payé
  et reste à payer, pour le colis comme pour la livraison, prennent
  désormais les mêmes couleurs que le badge de statut en haut de la
  facture : vert quand c'est réglé, rouge quand il reste quelque chose
  à payer.
- ~~**Agrandir le QR code** de l'étiquette.~~ **Fait le 24/09 (v1.82.0).**
  De 100 à 168 px à l'écran, et le dessin passe de 180 à 300 px pour
  rester net à l'impression. Une étiquette se scanne sur un colis posé au
  sol, souvent de biais et à bout de bras : 100 px, c'était trop juste.
- ~~Remplacer « Scanner en secours » par le **numéro de client**.~~
  **Déplacé le 24/09 vers l'espace Mamadou (§5).** Précision de Cobey :
  il ne s'agissait pas de l'étiquette. C'est la saisie de secours du
  livreur, pour les fois où le QR refuse de se scanner. Rien à faire ici
  tant que son espace n'existe pas.

---

## 5 · Espace Mamadou — livreur à Dakar (lien externe)

**Fait le 01/10 (v2.11.1 / v3.95.1)**, sauf les totaux de livraison
chiffrés (voir plus bas — une question reste en suspens). Nouvelle page
`mamadou.html`, à part comme `chauffeur.html`/`facture.html` (ne charge
pas departs.js, relit ses propres données en direct).

Deux accès bien distincts : Mamadou se connecte avec **son propre mot de
passe**, choisi par lui-même à la première ouverture (écran à son nom,
avec le logo DCT) ; la Direction dispose d'un **accès de test sans
code**, généré et régénérable depuis **Réglages > Livreur**, qui ouvre
littéralement le lien de Mamadou dans un nouvel onglet — pas une
réimplémentation séparée à maintenir en double (leçon tirée du chantier
facture.html/departs.js, qui a déjà demandé plusieurs rattrapages cette
session pour rester synchronisé). La Direction peut aussi réinitialiser
son mot de passe s'il l'oublie.

Construit : les 3 cases d'accueil (scanner, saisie de secours,
containers), le scan QR (même jeton `DCTQR1:` que l'appli interne — les
étiquettes déjà imprimées fonctionnent telles quelles), la saisie de
secours par numéro de client dans le container choisi (containers
affichés avec drapeau, date et nombre de clients pour s'y retrouver), la
liste des clients d'un container — **limitée aux containers du
Sénégal, le Mali est hors de son périmètre** — avec filtres (payé/reste
à payer, avec livraison, par région de livraison) et tri par numéro de
place comme Départ, la fiche client (photos de la collecte cliquables en
plein écran pour bien identifier le colis, description, nombre de
colis, statut payé/reste visible immédiatement), l'encaissement du
colis et de la livraison (deux caisses séparées, comme partout ailleurs
dans l'appli), ses propres photos de remise (1 à 5, obligatoires) et la
validation de la livraison — verrouillée tant qu'il reste un montant à
encaisser ou qu'aucune photo de remise n'a été prise. Il peut aussi
valider lui-même l'étape **« Arrivée au dépôt »** dans le suivi du
container, visible uniquement quand c'est la prochaine étape attendue —
il est sur place avant tout le monde. Chacune de ses actions (mot de
passe, encaissement, validation, arrivée au dépôt) est notifiée dans
l'Activité DCT.

**v2.20.20 (01/10) :** Cobey, après avoir cherché puis testé en
conditions réelles : « je n'ai pas trouvé l'endroit où il valide
l'arrivée du container » (répondu : Accueil > Containers > le container
> le bouton apparaît quand « Arrivée au port de Dakar » a déjà été
validée côté appli), puis : « j'ai vu aussi quand j'ai testé, quand je
valide l'arrivée au dépôt de Dakar par Mamadou Niass, ça ne le mettait
pas à jour sur le suivi transport de DCT. » L'écran Suivi transport
(`s-dep-etapes`) ne se redessinait que sur un clic fait DEDANS — pas
quand la mise à jour venait d'ailleurs (ici, mamadou.html, par le même
chemin Firebase `departs/{id}/etapesTransport`) pendant que l'écran
était déjà ouvert côté DCT. Corrigé : cet écran se met maintenant à
jour tout seul, comme les autres déjà couverts (liste des départs,
Espaces, Nouvelle collecte), dès que la donnée change — où que ce soit.

**v1.6.0 (mamadou.html, 02/10) :** Cobey, capture d'écran de l'espace de
Mamadou Niass à l'appui, trois points dans le même message :

1. « Le statut de livraison affiche toujours une étape en avance par
   rapport au suivi de transport de la case départ de DCT. » Cette page
   affichait `etapeSuivante()` (la PROCHAINE étape à valider) sous le
   libellé « Étape en cours » — alors que « En cours de navigation » est
   une phase qui dure, pas un événement ponctuel : la cocher ne veut pas
   dire que l'étape suivante (Arrivée au port) a déjà commencé. Reprend
   ici l'exception déjà posée côté DCT pour la même raison (facture
   publique, v1.94.36) : tant que « navigation » est la dernière étape
   cochée, c'est elle qui est « en cours », pas celle d'après. Le reste
   (ce qu'il a le droit de valider lui-même) ne change pas.
2. « Niass a besoin de savoir le total facturé en livraison du
   container, le total encaissé et le total restant [...] comme dans
   les containers de bilan financier, mais adapté à la livraison ! »
   Nouveau bandeau en haut du container (visible seulement s'il contient
   au moins un client avec livraison), qui somme la caisse livraison
   (jamais le colis) de tous ses clients.
3. « Pour chaque client on doit avoir le montant du prix de la
   livraison sur sa case. » Chaque carte affiche maintenant son prix de
   livraison et, s'il en reste, ce qu'il reste à payer dessus — même
   principe que le colis juste au-dessus (jamais l'encaissé, règle
   v1.0.0 inchangée pour le colis ET pour ce nouvel ajout livraison).

**v1.6.1 :** Cobey, sur ce même badge livraison : « c'est bon mais ça
manque de couleur pour distinguer ce qui a été payé et ce qui reste. »
Le badge était toujours orange, soldé ou pas. Reprend maintenant le
même code couleur que le colis juste au-dessus : orange tant qu'il
reste à payer, vert une fois soldée.

**v1.6.2 :** Cobey : « est-ce qu'on peut avoir le détail de ce qui a
été encaissé par DCT et le détail de ce qui sera encaissé par Mamadou
Niass. Comme ça, il verra, lui, ce qu'il a récolté et il verra aussi ce
que Dakar a récolté. » Chaque versement livraison porte déjà qui l'a
encaissé (`par` — posé aussi bien côté DCT que depuis cette page) : pas
de nouvelle donnée à ajouter, juste une addition supplémentaire. Le
bandeau « Encaissé » du container se décompose maintenant en 2
sous-lignes : « dont par DCT » et « dont par Mamadou », qui se
partagent ce même total.

**v1.6.3 :** Cobey : « dans activité, on doit voir tout ce que fait
Mamadou Niass quand il se connecte et quand il valide. Et... Enfin,
tout ce qu'il fait sur l'application doit être sur activité. » Trois
trous dans la couverture déjà en place (encaissement, validation de
livraison, arrivée au dépôt, mot de passe choisi/changé) :
- **la connexion elle-même** n'était jamais notifiée (seul un
  changement de mot de passe l'était) — ajoutée au point unique où
  l'accueil s'affiche réellement (une fois par ouverture de l'app,
  quel que soit le chemin : mot de passe saisi, déjà connecté,
  mot de passe tout juste créé) ; jamais pour le lien de test
  Direction, qui n'est pas Mamadou ;
- **l'ajout** d'une photo de remise n'était pas notifié ;
- **la suppression** d'une photo de remise non plus.

Ce qui reste **non construit** : ce que Mamadou touche lui-même par
livraison (commission/forfait) — **question toujours en suspens pour
Cobey**, sur quelle base il est rémunéré ; sans cette règle, impossible
de calculer « ce qu'il va toucher » séparément de ce que DCT encaisse.

Un accès séparé, sur le modèle du lien des chauffeurs externes.

**Confirmé le 01/10 :** c'est bien le livreur à Dakar, avec son **propre
lien permanent** (contrairement au code des chauffeurs externes, qui est
à usage unique par collecte — il faut un nouveau système de code/lien
durable, pas `dct_codes_externe`).

### Ses écrans
- une **case QR code**, pour scanner une étiquette ;
- une **saisie de secours**, juste à côté : quand le QR refuse de se
  scanner (étiquette abîmée, mal imprimée, colis mal éclairé), Mamadou
  tape un numéro à la main et arrive sur la même fiche client. C'est ce
  que Cobey appelait « scanner en secours » (précisé le 24/09) ;
- une **case container**, pour accéder aux clients comme le carré Départ,
  mais **sans aucun total d'argent du container**.

**Confirmé le 01/10 :** il tape le **numéro de client** (`CL-0001`),
selon le container déjà sélectionné à l'écran précédent — pas la grande
ligne complète de l'étiquette.

### Au scan d'une étiquette
- si le client a payé → l'information **en vert** ;
- les photos des colis, la description et le nombre de colis ;
- un bouton pour **valider la livraison** ;
- si le client n'a pas payé, ou partiellement : le **montant restant**,
  qu'il encaisse avant de pouvoir valider ;
- la **livraison** suit le même principe, affichée à part sur le même
  écran.

### Filtres
payé / non payé · avec / sans livraison · par région

### Totaux de livraison, dans sa case container
- ce qu'il va toucher
- ce qui a été encaissé par DCT
- ce qu'il encaisse sur place
- le total des deux, et le total global des livraisons

**Précision du 01/10, Cobey :** « sa case container, lui ne doit voir
uniquement que ce qu'il reste à payer pour les clients, il ne doit voir
aucun prix encaissé ! » — dans la liste des clients d'un container (pas
les totaux de livraison ci-dessus, qui restent), chaque client **n'affiche
que le reste à payer** s'il y en a un ; jamais un montant déjà encaissé.
Un client soldé n'affiche aucun chiffre (juste le vert déjà prévu
ci-dessus).

### Case miroir pour la Direction
**Demandé le 01/10, Cobey :** « il faudra aussi mettre une case miroire
pour la direction et moi, pour qu'on puisse voir son interface, faire des
tests éventuellement aussi. » Un accès (depuis l'espace Direction, pas le
lien externe) qui affiche exactement l'interface de Mamadou — mêmes
écrans, mêmes règles d'affichage — pour qu'Eric et la direction puissent
voir ce qu'il voit et tester sans passer par le lien externe.

**Fait le 01/10 — complété par Cobey dans la foulée :**
> « alors il faudrait un mot de passe qu'il pourra choisir avec une
> interface d'accueil pour lui avec son nom Mamadou Niass et le logo de
> DCT, il ne doit avoir accès qu'aux containers du Sénégal pas du Mali,
> nous pour accéder à son espace on n'aura pas besoin de code, et tout ce
> qu'il fera devra être notifié dans les notifications. Pour la saisie de
> secours, les containers ne sont pas détaillés assez, difficile pour lui
> de se repérer. Il doit pouvoir cliquer sur les photos pour bien
> identifier les colis, et lui doit prendre également maximum 5 photos
> pour valider le paiement [la livraison]. »
>
> « il doit également pouvoir valider dans le suivi des containers
> l'arrivée au dépôt à Dakar, car il sera là-bas en premier lieu ! »

Tout est construit (détail technique ci-dessus, dans le résumé de tête
de section) : mot de passe choisi par Mamadou (écran à son nom + logo
DCT), accès Direction sans code, périmètre Sénégal uniquement, zoom des
photos colis, photos de remise obligatoires (max 5), notifications sur
chaque action, containers détaillés dans la saisie de secours, et
validation de l'arrivée au dépôt.

**01/10 — deux corrections, capture à l'appui :**
- « le logo ne s'affiche pas pour lui » → le fichier image avait été
  tronqué en le recopiant ; puis « reprends le même logo que celui de
  l'écran d'accueil de DCT » → corrigé une seconde fois avec les octets
  exacts du vrai logo de l'écran de connexion (`#dct-logo`),
  au lieu de celui, différent, de facture.html.
- « le système de filtre est plutôt chaotique, il y a trop
  d'informations [...] il faudrait [...] des menus déroulants, pour les
  régions ou quelque chose de plus facile » — la case Container listait
  une pastille par région (jusqu'à 16 sur un seul container). Seul
  payé/reste à payer/soldé reste en pastilles (3 choix) ; livraison et
  région passent en deux menus déroulants.
- « j'ai remarqué aussi que le bouton retour quand on clique sur des
  clients nous revient à l'interface première. Le bouton retour doit
  faire revenir à chaque fois sur l'écran précédent. » — la fiche
  client renvoyait toujours à l'accueil, quel que soit l'écran d'où on
  l'avait ouverte (container, saisie de secours, scan). Elle revient
  maintenant à cet écran précis.

**01/10 — trois autres demandes :**
- « Mamadou Niass devrait avoir aussi les coordonnées du destinataire
  pour chaque client, car c'est avec eux qu'il va être en contact le
  plus souvent ! » — un bloc Destinataire (nom, téléphone, 2e numéro),
  séparé de l'expéditeur, apparaît en tête de la fiche client quand ces
  informations existent.
- « il doit pouvoir entrer les prix soit en euros soit en FCFA aussi »
  — l'encaissement (colis et livraison) propose désormais les deux
  devises, avec conversion en direct, au même taux fixe que le reste de
  l'application (1 € = 655,957 FCFA). Le montant est toujours stocké en
  euros ; le FCFA saisi et le taux du jour sont conservés à part pour
  l'historique.
- « les boutons retour sont mal placés, il faut à chaque fois descendre
  tout en bas de la page pour revenir en arrière, et je n'ai pas trouvé
  l'endroit où il valide l'arrivée du container à Dakar » — le bouton
  retour est désormais en haut de chaque écran (plus besoin de
  descendre toute une liste de clients pour le retrouver). Dans la case
  Container, une ligne reste affichée en permanence avec l'étape en
  cours du suivi transport (« Départ de Mitry », « En cours de
  navigation »…) — avant, seul le bouton « Valider l'arrivée au dépôt »
  apparaissait, et seulement à son tour, sans rien qui explique où en
  est le container en attendant.

**Fait le 01/10 (v1.5.0), Cobey**, capture d'écran de la fiche client
à l'appui : « sur l'interface de Mamadou, sur les photos, il ne voit
pas l'heure et qui a pris la photo. Il faut le mettre. » Chaque photo
de remise (preuve de livraison) enregistrait déjà l'heure exacte et
l'auteur (`ts`/`par`, au moment de la prise) — juste jamais affichés.
Une petite légende apparaît maintenant sous chaque vignette : l'heure
(HH:MM) et le nom de la personne qui l'a prise.

« Et aussi, moi, en tant qu'admin et avec la direction, il faut pouvoir
réinitialiser son mot de passe en cas de problème » — déjà en place
depuis le 01/10 (voir plus haut, "Réglages > Livreur" : bouton
**🔄 Réinitialiser son mot de passe**), Mamadou doit alors en choisir un
nouveau à sa prochaine connexion.

**Complété le 01/10 (v1.5.1), Cobey**, capture d'écran à l'appui :
la légende n'était sous la vignette que dans la petite liste de
photos — pas dans la vue **zoomée en plein écran** (en appuyant sur la
photo), là où Cobey regarde vraiment. L'heure et l'auteur apparaissent
maintenant aussi dans cette vue agrandie, pour une photo de remise.

**Complété le 01/10 (v1.5.2), Cobey :** « pour la photo de Mamadou qui
prend la photo, oui, on voit, mais pas pour les photos qui ont été
prises par les collaborateurs de DCT. » Les photos de colis (prises à
la collecte, affichées juste après "Nombre de colis" sur la fiche)
ont elles aussi une heure et un auteur enregistrés (posés par
l'appli principale au moment de la photo) — jamais montrés ici non
plus jusque-là. Même légende désormais que les photos de remise,
vignette et zoom compris.

**Complété le 01/10 (v1.5.3), Cobey :** « c'est bon, mais il manque la
date. » Les légendes (photos de remise et de colis) n'affichaient que
l'heure — la date (jj/mm) est ajoutée devant, utile pour une photo
qui ne daterait pas du jour même.

**Complété le 01/10 (v1.5.4), Cobey :** « pour son code faut mettre
l'interface sur des chiffres comme pour celui de DCT. » Le mot de
passe de Mamadou (création, connexion, changement) utilise maintenant
le même clavier numérique et la même présentation que le code PIN des
collaborateurs dans l'appli principale (4 chiffres, gros, centrés,
espacés) — un nouveau mot de passe doit désormais être composé de
4 chiffres exactement, comme le PIN. La connexion avec un mot de passe
déjà choisi avant ce changement continue de fonctionner telle quelle
(aucun verrou de format à la saisie, seulement à la création/au
changement), pour ne pas bloquer Mamadou s'il en avait choisi un
différent.

### ~~Visibilité des livraisons à Dakar + nouveau "Dépôt Dakar"~~
**Fait le 09/10 (v2.20.38 / v1.7.0 mamadou.html).** Longue discussion
avec Cobey (maquettes à l'appui, voir le fichier envoyé en PDF), en
plusieurs temps :

« Quand Mamadou Niass va délivrer les colis au client à Dakar [...] il
faudrait [...] sur chaque client une mention "délivré au client" avec
date et heure, comme ça on peut voir en un coup d'œil si un colis a été
livré, et voir ce qui n'a pas été donné. » Mamadou enregistre déjà
`c.livraisonValidee = {fait, ts, par}` depuis sa propre page en
validant une livraison — jamais affiché côté DCT jusqu'ici.
`_depBadgeLivraison(c)` (departs.js) comble ce manque, réutilisé sur
`depDetail`, le carré Dépôt et `depRenderFicheLecture` : badge vert
« Délivré au client · date/heure » + qui l'a fait, ou orange « En
attente de livraison » sinon.

« On va créer un autre stock "dépôt Dakar" [...] » — revu en cours de
discussion : « une fois qu'on met en statut arrivé au dépôt à Dakar,
tous les colis devraient être au dépôt à Dakar [...] c'est Mamadou
Niass qui les délivre [...] ceux qui ne délivrent pas, c'est ceux qui
restent. » Pas de déplacement manuel au final : nouvel écran « Dépôt
Dakar » (case d'accueil ouverte à tout le monde) listant automatiquement
tous les clients (Collecte/Dépôt direct/France confondus) dont le
départ est en statut **Arrivé** et qui ont une livraison à Dakar.

Décompte aligné sur l'article « Retrait des colis » des CGV (48h
ouvrées, puis 5 €/jour de gardiennage, alerte à 60 jours), calculé
depuis l'horodatage de l'étape « Arrivée au dépôt » du départ — déjà
enregistré aujourd'hui (validation par Mamadou lui-même ou côté DCT),
rien de neuf à saisir pour ça. Trois états avec code couleur : gris
dans les 48h, orange avec le montant de gardiennage qui s'additionne
jour après jour, rouge (fond de carte compris) passé 60 jours. Comme
pour les frais de ramassage : le montant de gardiennage est calculé et
affiché, jamais ajouté tout seul à la facture — c'est l'équipe qui
décide de l'appliquer ou non au moment de régler.

« Peut-être mettre un modal de confirmation quand il délivre au
client ? » Fait : même principe que le reste de l'appli (jamais de
`confirm()` natif pour une action qui ne se refait pas) — une fenêtre
habillée « Confirmer la livraison à [nom] ? » avec la dernière photo de
remise en aperçu, avant d'écrire définitivement la date et l'heure.

« Une fois qu'il valide la livraison, l'écran revient dans le container
[...] si il passe par le QR code, il revient dans l'espace QR code pour
scanner un autre client [...] pareil si il passe par le scan de
secours. » `fermerFiche()` (mamadou.html) lisait déjà `_ficheProvenance`
pour savoir où revenir, mais la validation d'une livraison rouvrait la
même fiche au lieu d'y renvoyer — corrigé. Au passage, la provenance du
scan QR pointait vers l'accueil plutôt que vers le scanner lui-même : un
client scanné puis délivré ramenait donc à l'accueil, pas prêt à
scanner le suivant — `fermerFiche()` relance maintenant la caméra
(`ouvrirScan()`) quand on revient sur l'écran de scan, que ce soit après
une validation ou un simple retour.

« Il aurait une case du dépôt de Dakar, la même que pour DCT, mais il
reste dans son appli. » Nouvelle 4ᵉ case sur l'accueil de Mamadou
(« Dépôt Dakar »), menant à une vue consolidée — dans le style propre à
sa page, pas celui de DCT — de tous ses colis encore à livrer, tous
containers arrivés confondus (hors Mali, comme partout ailleurs sur
cette page) ; mêmes clients, même fiche, même bouton de livraison que
depuis l'écran Containers, juste un autre chemin pour y arriver.

**Suite, le 09/10 (v2.20.40 / v3.95.10) — réorganisation côté DCT.**
Cobey, après avoir testé : « je vois pas le dépôt de Dakar côté DCT »
— corrigé d'abord (v3.95.9) : un oubli bumpait `DEP_VERSION` sans
`APP_VERSION`, qui seul force le rechargement de `departs.js` (règle
déjà documentée dans `dct-app.html` depuis un incident similaire le
27/09, récidive). Puis, une fois le Dépôt Dakar bien visible, nouvelle
demande : « on va plutôt faire une case "Stockage" à côté de la case
"Départ" [...] y mettre celui de Mitry, celui de Dakar, pour moi,
Bureau et direction, comme ça dans la case Départ on laisse que les
containers. »

Le Dépôt Dakar quitte donc sa case dédiée sur l'accueil, et le Dépôt
(Mitry) — qui vivait mélangé aux pays Sénégal/Mali dans l'écran
Départs, sans jamais être un vrai container — quitte cet écran aussi.
Les deux rejoignent une nouvelle case unique **STOCKAGE**, réservée au
Bureau et à la direction (jamais ouverte au terrain, contrairement à
« Inscription au dépôt », qui reste un outil opérationnel séparé pour
tous) : un écran de choix (Mitry / Dépôt Dakar), chacun menant à son
écran habituel inchangé, avec un bouton retour qui ramène maintenant à
ce choix plutôt qu'à l'ancien emplacement. L'écran Départs > choix du
pays ne montre plus que Sénégal et Mali.

**Suite, le 09/10 (v2.20.41 / v3.95.11) — compteurs des cases d'accueil
corrigés.** Cobey, sur la nouvelle case STOCKAGE : « C'est quoi 14
Mitry ? Sa sort d'où ? » puis, en comparant : « Même inscription au
dépôt il dise ça ». Les deux sous-titres (case STOCKAGE → "X Mitry" et
case INSCRIPTION AU DÉPÔT → "X clients au dépôt") recopiaient
`Object.keys(depotClients).length` : le nombre TOTAL de clients jamais
inscrits en "Dépôt direct", toutes périodes et tous départs confondus
(y compris des containers archivés depuis longtemps) — un nombre qui ne
correspond à rien de ce que montrent les écrans une fois ouverts.
Corrigé : la case STOCKAGE annonce maintenant le vrai compte de clients
en attente à Mitry (`compteursDepart(DEP_ID_DEPOT).clients`, déjà
utilisé correctement dans l'écran de choix lui-même) ; la case
INSCRIPTION AU DÉPÔT annonce la somme des clients des départs
actuellement ouverts à l'inscription — le même total que l'écran
affiche une fois ouvert.

**Suite, le 09/10 (v2.20.42 / v3.95.12) — filtre "Livraison" de l'écran
Départ, en menu déroulant.** Cobey, sur l'écran "Chargement DKR" :
« Les filtre son mal présenté, je voudrai un truc plus propre [...] Les
filtre de la partie de Mamadou Niass on l'a pas mal. » Même principe
déjà appliqué chez Mamadou (`_cdRenderFiltres`, v1.2.0) : le filtre le
plus consulté (Payé/Non payé) reste en pastilles, une seule ligne ; le
filtre secondaire (Livraison) passe en petit menu déroulant au lieu
d'une deuxième rangée de pastilles qui se chevauchait sur petit écran.

**Suite, le 09/10 (v2.20.43 / v3.95.13) — badge "en attente de
livraison" retiré avant l'arrivée du container.** Cobey, sur un
container encore en préparation (pas même parti) : « Ya des client en
attende de livraison j'ai pas compris pk, aucun container n'est arrivé
au dépôt de Dakar, c'est pas logique. » Le badge orange "⏳ En attente
de livraison" (`_depBadgeLivraison`) s'affichait pour tout client avec
livraison à Dakar, dès son inscription — y compris sur un départ encore
en préparation ou en route, bien avant que Mamadou n'ait quoi que ce
soit à livrer. Corrigé : ce badge n'apparaît plus que si le départ est
réellement arrivé au dépôt (`statut === 'arrive'`, même condition que
_depListeDepotDakar/l'écran Dépôt Dakar) ; avant l'arrivée, l'étiquette
"🚚 livraison" déjà affichée sur la ligne du client suffit à annoncer
l'intention, sans faux sentiment d'urgence. Le badge vert "Délivré au
client" reste affiché normalement dès qu'une livraison est validée.

**Suite, le 14/10 (v1.13.0 Mamadou) — un container reste invisible tant
que DCT n'a pas validé son départ.** Cobey : « il ne doit avoir accès
qu'aux gros conteneurs qui font partie de Mitry-Mory. C'est-à-dire que
tant que DCT n'a pas validé au niveau du suivi de transport l'étape 1,
Mamadou Niass ne peut pas avoir accès aux conteneurs. Par souci de
confidentialité de nos clients. » Puis, précisé : « il ne doit même pas
voir le conteneur. Le conteneur et ses informations n'apparaissent que
quand DCT valide l'étape du transport. »

Jusqu'ici seul le pays (Sénégal/Mali) filtrait ce que Mamadou voit
(`containerAutorise`, déjà le seul passage obligé pour la liste des
containers, le Dépôt Dakar, le scan et la saisie de secours). La même
fonction exige maintenant en plus que la 1ère étape du suivi de
transport (« Départ de Mitry ») soit cochée côté DCT — sinon le
container n'apparaît nulle part, comme s'il n'existait pas encore.

---

## 6 · Rapport financier

### ~~La taxe du partenaire, sur les conteneurs du Mali~~
**Fait le 02/10 (v2.14.0 → v2.17.0).** Cobey : « pour les clients Mali,
en fait, avec le partenaire avec lequel on envoie, il y a des taxes.
[...] si on facture un baril à 150 euros à une cliente, comme ce n'est
pas nous qui gérons le conteneur, c'est le prestataire [...] il va nous
prendre 120 euros, par exemple. Et le reste, ça sera pour nous. [...]
le client, lui, sera facturé de la totalité. [...] on ne veut pas
fausser les résultats. »

DCT ne gère pas les conteneurs du Mali : c'est un partenaire qui prend
en charge l'envoi, et il prélève sa part sur chaque client — le client,
lui, règle bien la totalité facturée, sur sa facture comme avant.

**Revu le même jour (v2.15.0)** : la première version posait le champ
sur la fiche de chaque client (Collecte, Dépôt direct, France &
Europe), comme Cobey l'avait d'abord demandé — mais il manquait de
visibilité (« j'ai pas bien compris où est-ce que j'en rentre le
montant »), puis Cobey a reconsidéré l'emplacement : « je voulais
plutôt pouvoir gérer ça dans le rapport financier, dans la carte
container Mali [...] on ne fait aucune dépense, on ne gère rien [...]
cette étape-là se fait en amont, après avoir enregistré les clients
[...] la taxe prestataire ne concerne que de l'interne [...] il ne faut
pas qu'on le fasse depuis chaque case de Collecte/France &
Europe/Dépôt direct, mais qu'on le fasse directement dans le bilan
financier, dans le container, en interne. »

Le champ a donc été retiré des trois fiches client. La saisie se fait
désormais **uniquement** depuis **Rapport financier > Containers >
[un container du Mali]**, qui liste tous ses clients (Collecte, Dépôt
direct et France & Europe confondus) — rien sur la fiche du client,
rien sur sa facture.

**Ajusté le même jour (v2.16.0)**, encore sur ce même écran. D'abord :
« il faudrait retirer tout ce qui est dépenses et autre gestion du
conteneur similaire à Sénégal, car on n'a pas besoin » — DCT ne gérant
ni le container ni ses dépenses côté Mali, toute la carte « Dépenses de
ce container » (fixes, tournées de camions, bouton « Gérer les
dépenses ») a disparu pour ces containers-là ; elle reste exactement
telle quelle pour le Sénégal. À la place, une carte plus légère :
Total encaissé, Taxe prestataire, Résultat réel.

Ensuite : « il faudrait aussi avoir le détail de la fiche client [...]
les prix, la soustraction pour chaque client [...] une interface qui
reprenne les informations de la facture et qu'on puisse enlever la
taxe et avoir le prix réel pour chaque client [...] sans être dans la
facture réelle, pour pas que ça change la facture du client [...] on
clique sur le client et on tombe sur une interface. » Chaque client de
la liste s'ouvre donc maintenant en tapant dessus, sur un écran dédié
qui reprend son détail de colis **en lecture seule** (jamais l'écran
de la vraie facture), avec la taxe à saisir juste en dessous et le
« Prix réel pour DCT » (facturé − taxe) recalculé automatiquement.

Le bilan financier montre **les deux chiffres** (confirmé par Cobey :
les deux, pas l'un à la place de l'autre) :
- dans le détail d'un container du Mali, sous le « Total encaissé »,
  une ligne « 🤝 Taxe prestataire » et un « Résultat réel après
  taxes » ;
- dans le Bilan global (Rapport financier > Bilan), sous le
  « Bénéfice » habituel, une ligne « Taxes prestataire » (tous
  conteneurs Mali confondus) et un « Bénéfice réel » — n'apparaît que si
  au moins une taxe a été renseignée.

**Corrigé le même jour (v2.17.0)** : Cobey a repéré que la taxe ne se
retirait que dans l'écran du container, pas partout où un « Bénéfice
réel » s'affiche — « les bénéfices réels ne tiennent pas compte de la
soustraction de la taxe du prestataire ». Le calcul central
(`_depResultatColis`, utilisé par le détail du container, les cartes de
la liste Containers et le détail « Dépenses par catégorie ») retire
désormais la taxe prestataire partout où il est utilisé ; le sous-titre
de la carte d'un container Mali dans la liste Containers dit maintenant
« encaissé − taxe prestataire » au lieu de « encaissé − dépenses », qui
n'avait pas de sens pour un container que DCT ne gère pas.

Rien ne change pour les conteneurs du Sénégal.

### ~~Le carburant, absent des dépenses fixes~~
**Fait le 30/09 (v2.10.32 / v3.94.33).** Cobey : « rajoute le carburant
dans les dépenses fixes, dans le bilan financier. »

Le carburant n'existait jusqu'ici que côté tournée des camions (par
jour de collecte). Un achat de carburant qui ne se rattache à aucune
collecte précise (une réserve, un plein pour le générateur…) a
maintenant sa place aussi dans les dépenses fixes d'un container — le
poste « ⛽ Carburant » apparaît dans le menu de "Dépenses du
container", et remonte comme les autres dans le total du Bilan
financier.

### ~~Chauffeur France, absent des dépenses fixes~~
**Fait le 02/10 (v2.20.6).** Cobey : « dans Rapport financier, dans les
dépenses fixes, tu peux ajouter "Chauffeur France". » Nouveau poste
« 🚗 Chauffeur France » dans le menu de "Dépenses du container", pour
la paye du chauffeur des tournées France & Europe — jusqu'ici sans
case dédiée, noyée dans "Autre" ou "Salaires".

### ~~L'en-tête de jour du "Report des tournées", qui se chevauchait~~
**Fait le 29/09 (v2.10.28 / v3.94.29).** Cobey, capture d'écran à
l'appui : « l'affichage des prix total par jour n'est pas optimal.
Elle se chevauche sur d'autres écritures. » La date du jour (« DIMANCHE
13 SEPTEMBRE 2026 ») et le total + bouton Modifier partageaient une
seule ligne, et une date longue poussait le total par-dessus. La date
est maintenant sur sa propre ligne, le total et le bouton juste en
dessous, alignés à droite — plus aucun chevauchement possible, quelle
que soit la longueur de la date.

### ~~Le bénéfice réel, container par container~~
**Fait le 28/09 (v2.10.27 / v3.94.28).** Cobey, capture d'écran de la
liste « Containers » à l'appui : « on devrait voir pour chaque
conteneur les bénéfices réels obtenus, c'est-à-dire les bénéfices
payés, pas facturés. Comme ça on sait directement combien on a touché
par conteneur. »

Chaque carte de la liste affiche désormais une ligne « 💰 Bénéfice réel
(encaissé − dépenses) », en vert ou en rouge selon le signe — le même
chiffre que le « Résultat colis » déjà calculé dans le détail d'un
container (colis réellement encaissés, moins dépenses fixes et
tournées ; la livraison, caisse à part, n'y entre pas), mais visible
sans avoir à ouvrir la carte.

### ~~Salaires : savoir à qui, et combien~~
**Fait le 28/09 (v2.10.27 / v3.94.28).** Cobey, sur l'écran « Dépenses
du container », poste « Salaires » : « on devrait avoir une autre case
avec tous les noms, où on peut choisir les noms de chaque
collaborateur, moi y compris. Et pour savoir le montant versé. C'est-
à-dire tous les collaborateurs à part Aminata. »

Une case « Choisir… » apparaît maintenant sous le poste et le montant,
uniquement pour « Salaires » — tous les collaborateurs sauf Aminata
(Eric compris), reconstruite à chaque bascule vers ce poste pour ne
jamais garder un nom choisi pour une autre dépense. Le choix est
obligatoire pour enregistrer une dépense « Salaires », et le nom
retenu s'affiche ensuite sur sa ligne dans la liste des dépenses du
container.

### ~~Dépenses par camion~~
**Fait le 24/09 (v1.61.0).** Case « 💰 Dépenses du camion » juste sous
l'impression des étiquettes, avec le total sur le bouton. Trois natures :
carburant, déjeuner, autre. Chaque ligne est horodatée et signée.

Le collecteur saisit lui-même (question tranchée par Cobey : « chaque
camion entre les dépenses qu'ils ont fait lors de la collecte »). Il peut
se corriger dans les 30 minutes, comme pour un versement ; passé ce
délai, seule la direction retire une ligne.

L'écran camion affiche désormais **💰 Dépenses de la tournée** et
**✅ Gain net du camion** sous le bloc finance existant. Stocké dans
`dct_depenses/<collecte>/<camion>`, prêt pour l'écran recettes /
dépenses / bénéfice.

### ~~Écran recettes / dépenses / bénéfice~~
**Fait le 24/09 (v1.63.0).** Rapport financier > **Bilan**. Recettes,
dépenses, bénéfice en tête, puis le détail de chaque côté. Le bénéfice
suit tout seul.

Les recettes sont l'argent **réellement encaissé sur les colis**, tous
containers. Ce qui reste dû est rappelé à part, en orange, et ne compte
pas tant qu'il n'est pas versé.

**La livraison ne rejoint jamais le bénéfice** (v1.70.0 / v1.71.0). Elle
a son propre bloc sur le Bilan — encaissé, reste dû — et le résultat
d'un container s'appelle « Résultat colis ». Cet argent se partage avec
le livreur : son décompte viendra dans l'espace Mamadou.

### ~~Dépenses fixes, saisies à la main~~
**Fait le 24/09 (v1.63.0), rattachées au container le même jour
(v1.66.0).** Elles ne vivent plus au niveau du bilan mais **dans chaque
container** : on ouvre le container depuis Rapport financier, puis
« Gérer les dépenses de ce container ». Six motifs dans une case à
choisir, le montant juste à côté : loyer · dédouanement · container ·
salaires · location · autres. Chaque ligne est datée et signée.

Le même écran **reporte les dépenses des camions** qui ont rempli ce
container, collecte par collecte. Quand un camion a rempli deux
containers sénégalais, ses frais se répartissent au prorata de ses
clients : rien n'est compté deux fois, et la somme des containers
redonne le total du bilan.

**Le Mali ne porte aucun frais de tournée** (v1.67.0) : ces containers
sont affrétés par un prestataire, Dakar City ne fait que lui confier des
clients. Le camion a bien roulé pour ces colis, mais la dépense revient
au container Sénégal du même camion. Un container malien n'affiche donc
que ses dépenses propres, avec l'explication à l'écran.

Le container affiche alors son **résultat** : encaissé − dépenses.

### ~~Le doublon du Bilan~~
**Réglé le 24/09 (v1.83.0).** Le bloc « Recettes des colis », en bas du
Bilan, n'avait qu'une ligne — et cette ligne affichait exactement le même
chiffre que « Recettes » en tête d'écran (repéré par Cobey). Le bénéfice,
lui, n'a jamais compté cet argent deux fois : c'était l'affichage qui se
répétait.

Le bloc est retiré. Sa seule information utile, « hors livraison » et le
nombre de containers, est remontée sous la ligne Recettes. Le bloc
Dépenses reste : lui a bien deux sources à détailler, camions et
dépenses fixes, dont la somme fait le total affiché plus haut.

### ~~L'argent enregistré en trop~~
**Fait le 24/09 (v1.84.0).** Cobey, en vérifiant un container à la
main : « je soustrais le montant facturé au montant reçu, le chiffre en
rouge ne correspond pas à l'écart, pourquoi ? » Puis, quand j'ai parlé de
trop-perçu : « un client paye ce qu'il doit, il n'y a pas de surplus ».

Il a raison, et c'est tout le problème. Le « reste dû » se calcule fiche
par fiche et ne descend jamais sous zéro : le trop-versé d'un client
n'annule pas la dette d'un autre — heureusement. Mais du coup il
n'apparaissait nulle part, et ne se devinait qu'en comparant deux totaux
à la main.

Chaque caisse d'un container affiche maintenant, **et seulement s'il y a
lieu**, un bandeau orange : « ⚠️ 534 € enregistrés en trop sur 3 fiches
— le versé dépasse le prix ». On le touche, on obtient les noms, le
détail (facturé / versé / écart) et l'accès direct à la facture pour
corriger. Un container sain n'affiche rien.

C'est presque toujours une erreur de saisie : un versement livraison tapé
dans la case colis, un acompte pris avant que le prix soit fixé, un prix
baissé après un paiement.

### ~~Les fiches sans prix fixé~~
**Fait le 25/09 (v1.89.0).** Repéré par Cobey sur le container du
13/09 : des clients dont le prix n'est pas encore convenu s'affichent
« 0 € ». Ils ne devaient donc rien, et disparaissaient de la liste des
clients à relancer — alors qu'il y a bien de l'argent à encaisser
derrière, on ignore simplement combien.

Ils ne peuvent pas rejoindre le RESTE DÛ : inventer un montant
fausserait la caisse. Ils ont donc leur propre ligne, qui compte des
fiches et non des euros :
- dans chaque container, sous les deux caisses : « ❓ 3 fiches sans prix
  fixé », qui se déplie et donne les noms, avec le bouton
  « Facture · fixer le prix » et la mention de ce qui a déjà été versé ;
- dans le Bilan, un rappel qu'elles ne sont comptées dans aucun des
  chiffres du dessus.

N'apparaît que s'il y en a. Deux cas traités pareil : la fiche marquée
« prix à définir » à l'inscription, et celle dont le prix est resté vide.

### ~~Container~~
**Fait le 24/09 (v1.56.0).** Total payé et total dû, séparément pour les
colis et pour la livraison, sur chaque container et en cumul.

### ~~Anciennes données~~
**Abandonné le 24/09 (v1.73.0).** Pas de reprise du tout : la nouvelle
application repart de zéro en septembre 2026 et ne compte que ce qui
passe par elle. Le bloc « Bénéfice repris de 360 » a été retiré.

### Statistiques

#### ~~Comparer~~
**Fait le 25/09 (v1.86.0), déplacé et renommé le même jour
(v1.87.0 / v1.88.0).** Rapport financier > **Statistiques**, la
troisième case après Bilan et Containers, dans cet ordre voulu par
Cobey : d'abord où on en est, ensuite d'où ça vient, enfin comment ça
évolue. C'est de l'argent et des containers qu'on compare, pas le
travail des collaborateurs — le carré Statistiques de l'accueil, lui,
garde son classement. On choisit d'abord
**quoi** — 📆 Année, 📅 Mois ou 📦 Container — puis **lequel**, de chaque
côté. Le type vaut pour les deux : on compare une année à une année, un
mois à un mois, un container à un container.

Le choix ne dépasse jamais douze cases à la fois : une rangée d'années,
puis la grille des douze mois (les mois sans container sont grisés).
Pour un container, on descend d'un cran de plus — année, mois, puis le
ou les containers de ce mois-là : vingt-quatre containers dans l'année
se réduisent à deux cases. Chaque case porte sa date en gros et son nom
dessous, parce qu'ils s'appellent presque tous « Chargement DKR ». Chaque côté garde son année à lui —
c'est ce qui permet septembre 2026 contre septembre 2027. Un bouton ⇆
intervertit les deux côtés, années comprises.

*(v1.90.0 — la première version empilait mois, années et containers dans
un seul menu déroulant, qui allongeait de quelques lignes chaque mois :
« imaginons qu'on a six mois ou un an de containers, la liste sera
interminable ».)*

Un **graphique en colonnes** en haut — deux colonnes, hauteur
proportionnelle au chiffre, le montant écrit au-dessus. Une rangée de
cases choisit ce qu'on regarde : chiffre d'affaires, encaissé, reste dû,
dépenses, bénéfice, clients, colis. Dessiné en HTML, sans librairie :
marche hors connexion et à l'impression.

Sous le graphique, les sept lignes avec l'écart en euros et en
pourcentage. Vert quand c'est une bonne nouvelle — donc rouge quand les
dépenses ou le reste dû montent. La livraison a son bloc à part, comme
partout ailleurs.

Tout se recalcule à la volée depuis les containers : rien n'est stocké.

**?** Reste à faire : des graphiques par poste (au-delà de la
comparaison), si le besoin se confirme à l'usage.

#### Notes d'origine
**Comparer les containers entre eux** (note de Cobey, 24/09/2026) :
- comparer **au mois** ou **à l'année**, au choix ;
- et surtout **choisir soi-même** les mois ou les années à mettre côte à
  côte — pas seulement le mois en cours contre le précédent. Par
  exemple septembre 2026 contre septembre 2027, ou toute l'année 2026
  contre toute l'année 2027.

Ce qu'on a déjà, container par container, et qui peut donc se comparer
sans rien stocker de nouveau : le total facturé, l'encaissé, le reste
dû, les dépenses (tournées + fixes), le résultat colis, le nombre de
clients et le nombre de colis. La livraison reste à part, comme partout
ailleurs.

**?** Sur quoi porte la comparaison en priorité — le chiffre d'affaires,
le bénéfice, le nombre de clients ? À préciser avec Cobey avant de
dessiner les graphiques : c'est ce qui décide de ce qu'on met en avant.

---

### ~~« Total prévu » retiré de la carte « Suivi financier »~~
**Fait le 14/10 (v3.99.11).** Cobey : « enlève le "total prévu" car ce
qui importe c'est les total facturé, c'est ce prix qu'on facture au
client ! » Cette ligne comptait tous les clients assignés au camion,
pas seulement ceux déjà validés — donc un montant qui ne correspond à
aucune vraie facture. Retirée aux 4 endroits où la carte existe : écran
d'un camion (Collecte et France & Europe) et bandeau « Suivi financier
global » d'une collecte entière (Sénégal et France & Europe). Le calcul
de « Restant à ramasser » continue de tourner pareil en interne (total
des clients assignés moins facturé) — seule la ligne d'affichage
disparaît.

**Suite, le 14/10 (v3.99.12) — « Restant à ramasser » aussi retiré.**
Cobey : « il sert plus à rien du coup, cette ligne est restée. » Une
fois « Total prévu » parti, cette ligne n'avait plus de repère pour se
situer — retirée aux mêmes 4 endroits. Seules ces deux lignes
d'affichage disparaissent ; les calculs internes (dont la barre de
progression « % facturé ») restent inchangés.

---

### Un client supprimé de force décalait la numérotation du camion
**Fait le 14/10 (v3.99.13 / v2.20.64).** Cobey, écran d'un camion
France & Europe : « un client a été retiré, mais le premier client de
la liste reste au numéro 2, bizarre » puis « le client 3 n'a pas de
bouton WhatsApp et le 2 n'a pas le bouton observation. »

Cause réelle : la suppression forcée d'une fiche France & Europe déjà
engagée dans un camion (réservée à la direction, pour nettoyer une
fiche de test allée jusqu'au bout — voir plus haut, "suppression d'une
fiche") effaçait bien la fiche, mais ne retirait pas son id du camion
(`tk.clients`/`tk.hours`/`tk.validated`/`tk.refused`). Ce client
"fantôme" ne produisait plus de carte à l'écran (sa fiche n'existe
plus), mais décalait quand même le numéro de tous les clients suivants
dans l'« Ordre de passage », et désalignait les boutons WhatsApp/
Observation (qui recollent chaque bouton à la bonne carte par
position).

Corrigé à la source : la suppression forcée nettoie maintenant aussi
le camion. Et pour les camions déjà abîmés par l'ancien bug, l'écran
d'un camion France & Europe se répare tout seul à l'ouverture (retire
discrètement tout id sans fiche derrière) — rien à refaire à la main.

---

### Bouton "🧾 Facture" manquant sur un client déjà validé (camion France & Europe)
**Fait le 14/10 (v3.99.14 / v2.20.65).** Cobey : « il manque le bouton
pour accéder à la facture, une fois la facture validée, il manque
aussi le bouton retour pour revenir directement dans le camion lui-
même, pas dans l'espace où on voit tous les camions avec le nom du
chauffeur. »

Côté Collecte, un client déjà validé a toujours eu un petit bouton
"🧾" sur sa carte pour rouvrir sa facture, avec un bouton retour qui
dit "← Camion" et ramène directement sur l'écran de ce camion — jamais
porté côté France & Europe (même angle mort que WhatsApp/Observation/
Photos, corrigés le 13/10). Généralisé aux deux parcours.

---

### Heure de départ et péage du comparatif : perdus en rechargeant l'appli
**Fait le 14/10 (v3.99.15).** Cobey : « dans trajet et coût, quand
j'entre une heure de départ et le montant de péage, ça ne se
sauvegarde pas, ça disparaît quand on quitte. »

Les deux ne vivaient que dans la mémoire du navigateur (l'heure de
départ dans une variable JS, le péage nulle part du tout) — perdus au
moindre vrai rechargement de l'appli, exactement ce qui venait d'être
demandé pour corriger le problème d'affichage en cache (fermer et
rouvrir l'appli). Posés maintenant sur le camion lui-même, comme la
ville de départ déjà sauvegardée juste au-dessus : survivent
désormais à un vrai rechargement, pas seulement à une navigation dans
l'appli.

---

### Bouton pour supprimer un client directement depuis la liste France & Europe
**Fait le 14/10 (v3.99.16).** Cobey : « j'ai pas de bouton pour
supprimer le client de France Europe, je veux supprimer le client de
la liste, pas contact en lui-même. »

Seule la fiche ouverte avait « 🗑️ Supprimer cette fiche » — rien
directement sur la liste « Clients inscrits ». Un bouton 🗑️ apparaît
maintenant sur chaque carte **encore en attente** (même garde que la
fiche : une fois le colis engagé, le bouton disparaît, comme avant).
Il supprime l'inscription — jamais le contact, qui reste dans le
carnet d'adresses pour une prochaine fois, exactement comme la
suppression depuis la fiche le fait déjà.

---

### Le Suivi en direct ne s'enclenchait jamais côté France & Europe
**Fait le 14/10 (v3.99.17).** Cobey : « on a démarré la collecte mais
le suivi ne s'est pas enclenché » puis, après vérification : « le
bouton Waze a été cliqué. »

Cause réelle : la ligne adresse du camion France ouvrait Waze
directement, sans jamais passer par la fonction qui enregistre le
départ (`ouvrirModalWaze`) — contrairement à la Collecte, qui, elle,
passe toujours par cette confirmation avant d'ouvrir Waze. Le Suivi en
direct ne passe "En route" que si cette heure de départ existe :
resté bloqué sur "À venir" quel que soit le nombre de clics, même la
collecte bien démarrée. Même angle mort "construit pour la Collecte
seulement" que WhatsApp/Observation/Photos/Facture avant lui — la
ligne adresse du camion France passe maintenant par la même
confirmation, avec la même écriture d'heure de départ.

---

### Ordre des clients inversé dans le Suivi en direct
**Fait le 14/10 (v3.99.18 / v2.20.66).** Cobey, après une vraie
tournée France & Europe : « j'ai l'impression que l'ordre d'affichage
des clients est pas bon dans le suivi. » Exact, et pas que côté
France : le Suivi en direct listait les clients dans l'ordre
d'affectation au camion (tel quel), alors que « Ordre de passage »
les trie par heure fixée — un client à 9h pouvait apparaître après un
autre à 11h, alors qu'il passe en réalité en premier. Même tri
qu'ailleurs (`_suiviClientsTries`, mis en commun), appliqué au Suivi
Collecte et France & Europe, pour que les deux écrans s'accordent
toujours.

### Dépenses du camion France & Europe absentes du rapport financier du container
**Fait le 14/10 (v3.99.19 / v2.20.67).** Cobey, devant le rapport
financier d'un container : « les dépenses de la tournée du camion
n'apparaissent pas dans le rapport financier du container [...] dans
parcours client ça s'ajoute » puis, après explication de la logique :
« Donc tu vas corriger ça ? Pour France ? »

Cause réelle : `_depCamionsParContainer` (le calcul de « Tournées des
camions » dans le rapport d'un container) ne regardait que les
collectes et camions côté Sénégal (`collectes`/`clientsParCollecte`/
`dispatchParCollecte`) — un camion France & Europe enregistre ses
dépenses exactement au même endroit (`dct_depenses/<collecteId>/
<camion>`), mais n'était jamais pris en compte dans le rapport d'un
container. Même angle mort "construit pour la Collecte seulement".
Généralisé : la même logique de répartition (proportionnelle entre
plusieurs containers servis le même jour par un camion, avec le repli
Mali si le camion n'a validé que des clients Mali) s'applique
maintenant aussi aux collectes France & Europe.

### Ligne « ✅ Collecté » cassée dans le Suivi financier (camion France ET Collecte)
**Fait le 14/10 (v3.99.20 / v2.20.68).** Effet de bord du retrait de
« Restant à ramasser » plus haut le même jour : la ligne « ✅ Collecté »
(l'argent réellement encaissé) s'ancrait sur cet élément pour trouver
où s'insérer dans la carte « Suivi financier » — supprimé, elle
s'accrochait dans le vide et ne s'affichait plus nulle part, ni côté
camion France & Europe, ni côté camion Collecte (même ancrage cassé
aux deux endroits). Réancrée sur la ligne « Facturé », restée en
place.

### Suivi financier du camion France & Europe : dépenses et résultat manquants
**Fait le 14/10 (v3.99.20 / v2.20.68).** Cobey : « je veux le tout
dans le suivi financier [...] le total facturé, le total encaissé,
les dépenses du camion et le résultat total après dépenses. » Déjà le
cas côté Collecte (Facturé/Encaissé/Dépenses/Gain net, posés dans la
carte depuis la v1.62.0) mais jamais porté côté France & Europe, qui
n'affichait que Facturé et Encaissé. Même carte, mêmes lignes,
complétées pour France & Europe : Dépenses de la tournée et Résultat
total après dépenses s'y ajoutent maintenant.

### Dépenses du camion : la case retenue ne garde que « Gain net »
**Fait le 14/10 (v3.99.20 / v2.20.68).** Cobey, sur l'écran « Dépenses
du camion » : « dans ici (sur la photo) uniquement le total de frais
de ramassage moins les dépenses » — la ligne « 💵 Encaissé auprès des
clients − dépenses » faisait doublon avec le « Gain net » déjà affiché
juste au-dessus (Collecté/Dépensé/Gain net), et n'avait plus sa place
une fois celui-ci remonté dans le Suivi financier (voir ci-dessus).
Retirée ; l'écran ne garde que le bloc Collecté/Dépensé/Gain net.

### Bouton « imprimer toutes les étiquettes » absent du camion France & Europe
**Fait le 14/10 (v3.99.20 / v2.20.68).** Existait côté Collecte
(`depOuvrirImpressionToutesEtiquettesCamion`) depuis la v1.21.0,
jamais porté côté France & Europe — même angle mort que les
précédents cette session. Généralisé (src/colId optionnels, même
convention que `depOuvrirDepenses`) et ajouté sur l'écran du camion
France & Europe, juste avant « Ordre de passage », comme côté
Collecte.

### Valider un client France & Europe ne clôturait pas son entrée dans le Suivi en direct
**Fait le 14/10 (v3.99.20 / v2.20.68).** Cobey : « le bouton de
ramasse doit clôturer le ramassé dans le suivi client [...] mais là
y'a rien. » Piste initialement suivie (`validerArretFrance`,
dct-app.html) : fausse piste — cette fonction est en réalité
remplacée depuis la v1.45.0 par un correctif de departs.js qui route
le bouton « Valider » vers le même écran que la Collecte Paris
(`depOuvrirValidation`/`depValiderConfirmer` : photo, container,
facture), exactement comme prévu à l'époque (« on fait désormais comme
à Paris »). Le vrai point où le camion France & Europe marque un
client ramassé est `_depMarquerRamasseCamionFrance` (departs.js) — il
posait `tk.validated` mais jamais `tk.finTs`, dont dépend le Suivi en
direct pour afficher « Collecté à HH:MM ». Corrigé à la bonne
fonction, avec la même écriture que `confirmValider` côté Collecte.

### Écran Dépenses : « Collecté » oublié dans la case à 3 chiffres
**Fait le 14/10 (v3.99.21 / v2.20.69).** Cobey, sur un deuxième
retour écran à l'appui : « ici je t'ai demandé de ne mettre que le
total des frais de ramassage − les dépenses et le total. » Le premier
passage (v3.99.20) avait bien retiré la ligne en double « Encaissé
auprès des clients − dépenses », mais avait laissé la case du dessus
à 3 chiffres (Collecté / Dépensé / Gain net) — oubliée, alors qu'elle
fait exactement le même doublon que la ligne déjà retirée : « Collecté »
est désormais dans le Suivi financier du camion (voir plus haut).
Retirée à son tour : la case ne montre plus que Dépensé et Gain net
(ramassage − dépenses), sur 2 colonnes.

### « Modifier » (Report des tournées du container) ouvrait la mauvaise collecte pour France & Europe
**Fait le 14/10 (v3.99.22 / v2.20.70).** Cobey, 2 captures à l'appui :
« quand on clique sur modifier, dans la tournée de Abdoulaye Eric on
tombe sur la collecte du parcours Collecte, il devrait tomber sur
celle de France Europe, c'est une erreur. Et précise que c'est une
collecte de France Europe dans le carré, comme ça on différencie
direct. »

Rapport financier d'un container → Dépenses du container → Report des
tournées : le bouton « ✏️ Modifier » de chaque groupe (par collecte)
appelait toujours `ouvrirCollecte(colId)` (Sénégal), quel que soit le
vrai parcours du camion listé — conséquence directe du correctif
« dépenses des camions France & Europe dans le rapport du container »
du 14/10 (voir plus haut), qui a fait apparaître pour la première fois
des colId France & Europe dans cette liste. Pour un tel colId,
`ouvrirCollecte` créait même une collecte Sénégal fantôme VIDE sous
cet id (0 client, tous les camions à 0 €) au lieu d'ouvrir la vraie
collecte. Corrigé : le bouton détecte maintenant le parcours du colId
et route vers `ouvrirCollecteFrance` quand il s'agit de France &
Europe. Ajouté en plus, comme demandé : un badge « 🇪🇺 France & Europe »
sur l'en-tête de chaque groupe qui en vient, pour distinguer les deux
parcours d'un coup d'œil dans la liste.

### Total des frais de ramassage manquant à deux endroits
**Fait le 14/10 (v3.99.23 / v2.20.71).** Cobey, 2 captures à l'appui :
« sur l'une [la mini-case Dépenses du camion] je veux une affirmation
[réelle, pas une estimation] ! Voir le gain réel après dépense, mais
uniquement sur le frais de ramassage, et là tu n'as même pas mis le
total des frais de ramassage. » (L'autre capture, « Comparatif
coûts/ramassage », est bien une estimation avant tournée — confirmée
correcte telle quelle, aucun changement là.)

Deux cas :
1. La mini-case « Dépenses du camion » sur l'écran du camion France &
   Europe (`_frMajBlocDepenses`) ne montrait que Dépensé et Gain net,
   jamais le total brut des frais de ramassage dont ce gain net est la
   soustraction. Ajouté — `_depResumeDepenses` (departs.js) expose
   maintenant aussi ce total.
2. L'écran Dépenses (`s-dep-depenses`) avait vu sa case « COLLECTÉ »
   retirée au passage précédent (v3.99.21) en pensant qu'elle faisait
   doublon avec l'encaissé réel du Suivi financier — en réalité elle
   montrait depuis toujours le total FACTURÉ/ramassage (pas
   l'encaissé), exactement ce qui manque ici. Mauvaise ligne retirée,
   bon nom cette fois : remise sous « FRAIS DE RAMASSAGE », à côté de
   Dépensé et Gain net.

### « Frais de ramassage » confondait prix du colis et frais de ramassage (France & Europe)
**Fait le 14/10 (v3.99.24 / v2.20.72).** Suite immédiate du point
précédent : Cobey a demandé confirmation — « tu as bien compris que
les frais de ramassage c'est pas le prix total facturé ? [...] Ces
clients on facture le ramassage de leurs colis pour Dakar [séparément
du colis]. » Vérification faite : `_frCollecteCamion` (utilisé pour
« FRAIS DE RAMASSAGE » dans le point précédent) additionne `prix` (le
colis/transport) ET `prixRamassage` (le vrai frais de ramassage —
gratuit en Île-de-France, payant ailleurs, champ « fa-ramassage » de
la fiche) : c'était donc le total facturé, pas le frais de ramassage
seul.

Cobey a précisé où chaque calcul est juste : « le Suivi financier est
bon, car là on parle du total des colis + le prix du ramassage » —
resté inchangé, `_frInjecterEncaisseCamion` continue d'appeler
`_frCollecteCamion` directement. Mais « dans ce que je t'ai demandé
après, c'est d'avoir uniquement le prix des frais de ramassage et en
déduire les dépenses » — l'écran Dépenses et la mini-case « Dépenses
du camion » isolent maintenant `prixRamassage` seul (nouvelle fonction
`_frFraisRamassageCamion`), moins les dépenses. Côté Collecte
(Sénégal), aucun changement : pas de distinction colis/ramassage,
`c.prix` EST déjà le frais de ramassage.

### Onglet Dispatch (France & Europe) trop chargé : le récap par collaborateur déménage sur Clients
**Fait le 14/10 (v3.99.25).** Cobey, capture à l'appui : « les
montants des collaborateurs sont dans la même interface que les
camions [...] ici je trouve que ça fait trop chargé. » Après
discussion (déplacer sans réduire l'info n'aurait fait que charger
l'autre écran), Cobey a précisé avec 2 captures du parcours Collecte :
« faudra faire comme le parcours collecte, quand on clique sur une
collecte, on tombe sur une interface à deux onglets, l'un des deux
[Clients] c'est les clients sélectionnés pour la collecte, et l'autre
c'est le côté dispatch. »

Vérifié dans le code : côté Collecte, le récap par collaborateur
(`collab-grid`) vit dans l'onglet **Clients** (`renderClientsTab`),
jamais dans Dispatch (`renderDispatchTab`, camions seuls). Côté
France & Europe, il était câblé à l'envers : posé directement dans
`_frDispatchDetail` (l'onglet **Dispatch**), juste au-dessus des
camions — d'où l'écran surchargé. Aligné sur Collecte :
- le récap par collaborateur déménage sur l'onglet Clients de France &
  Europe, scopé à la collecte ouverte (via `_frClientsDeCollecte`) ;
- l'onglet Dispatch ne garde plus que Suivi financier global + camions ;
- `ouvrirCollecteFrance` atterrit maintenant sur l'onglet Clients (pas
  Dispatch), comme `ouvrirCollecte` côté Sénégal.

Noté au passage (pas un bug, juste observé en testant) : contrairement
à la Collecte Sénégal, la liste des clients de l'onglet Clients
France & Europe n'est pas filtrée par collecte ouverte — c'est un
inbox global (tous les clients en cours, toutes collectes confondues).
Seul le nouveau récap par collaborateur est scopé à la collecte
ouverte ; la liste elle-même ne l'était pas avant ce correctif et ne
l'est toujours pas (hors sujet de cette demande, mais à garder en tête
si un jour ça surprend).

### Barre d'onglets France & Europe redescendue en haut, comme la Collecte
**Fait le 14/10 (v3.99.26 / v2.20.73).** Suite du point précédent :
« replace les onglets en haut comme dans le parcours Collecte,
reprendre la même interface, à gauche onglet Clients à droite onglet
Dispatch. »

Cause : `_frDeplacerOngletsEnBas` (v2.11.6, une ancienne demande de
Cobey) déplaçait délibérément la barre d'onglets de France & Europe
tout en bas de l'écran, au même endroit que la barre de navigation
principale — jamais le cas côté Collecte, dont la barre reste en haut,
juste sous l'en-tête. Cobey revient sur cette décision : il veut la
même position qu'à Dakar.

Remplacée par `_frPreparerBarreInscrire`, qui ne garde que l'autre
moitié de la demande d'origine — toujours valable, jamais remise en
cause — à savoir le bouton « + Inscrire un client » limité à l'onglet
Clients. La barre d'onglets n'est plus déplacée ni restylée : elle
reste à sa position native, en haut, déjà structurellement identique
à la Collecte (même agencement `.header` → `.subtabs` → contenu). La
fusion Collectes/Dispatch en un seul onglet (demande séparée, toujours
en place) n'est pas touchée.

### Résultat du Suivi financier basé sur le facturé, pas le collecté — et ventilation espèces/virement
**Fait le 14/10 (v3.99.27 / v2.20.74).** Cobey, capture à l'appui :
« dans suivi financier le prix du résultat doit être soustrait du
prix collecté et non facturé ! Et en dessous du résultat, faut mettre
le total des encaissés en espèce et en virement de la tournée. »

« Résultat total après dépenses » se calculait sur le FACTURÉ
(`_frCollecteCamion`, prix + ramassage de tous les clients ramassés)
moins les dépenses — un chiffre trop optimiste dès qu'un client n'a
pas encore payé (« Encore dû » le montre juste au-dessus). Corrigé :
le résultat part maintenant du COLLECTÉ (l'argent réellement rentré),
moins les dépenses — la vraie situation de caisse de la tournée.

Ajouté juste en dessous, comme demandé : deux nouvelles lignes
« 💵 Encaissé en espèces » et « 🏦 Encaissé en virement », la somme des
versements de la tournée ventilée par méthode (nouvelle fonction
`_frEncaisseParMethodeCamion`) — visibles dès qu'il y a de l'encaissé,
même sans dépense enregistrée (indépendantes de « Dépenses »/
« Résultat », qui restent masquées tant qu'aucune dépense n'existe).
Un versement sans méthode enregistrée (saisi avant l'ajout de ce
champ) n'est compté dans aucun des deux plutôt que deviné.

### Suivi transport : date estimée d'arrivée au dépôt (fusion d'un fichier fourni)
**Fait le 14/10 (v3.99.28 / v2.20.75).** Cobey a fourni directement
`facture.html` et `departs.js` modifiés et demandé « pousse ça
également. » Le fichier fourni datait d'un point légèrement antérieur
à cette session (avant le dernier correctif « Résultat basé sur le
collecté » et avant la remise en haut de la barre d'onglets France) —
fusionné à la main plutôt que copié tel quel, pour ne perdre ni ce
travail-là ni les deux correctifs plus récents.

La feature elle-même (authentifiée par ses propres commentaires
v2.20.73/v1.19.72, datés et signés Cobey) : « l'étape "Arrivée au
dépôt" ne doit jamais s'afficher "Étape en cours" [...] le passage du
port au dépôt n'est pas instantané (douane/déchargement/route) [...]
on remplace par la date estimée saisie par l'administration. » Un
nouveau champ « Date d'arrivée prévue au dépôt » (facultatif) sur le
formulaire d'un départ ; une fois « Arrivée au port » validée, le
suivi transport (facture interne ET page publique de suivi — les deux
copies, « commentaires jumeaux », partagent la même logique) affiche
cette date estimée à la place du badge « Étape en cours », qui n'avait
pas de sens pour une transition qui dure plusieurs jours. Le numéro
de Mamadou Niass (contact du dépôt), pas encore communiqué jusqu'ici,
est maintenant renseigné : +221 78 432 36 17.

### Suivi financier du camion Collecte aligné sur France & Europe
**Fait le 15/10 (v3.99.29 / v2.20.76).** Cobey, après discussion sur
la case « Dépenses du camion » de France & Europe (capture à
l'appui) : « ventilation espèces/virement aussi on le met dans le
parcours Collecte / mais je veux que la présentation du suivi
financier soit comme celle de France Europe, sans les notions de
frais de ramassage qui n'ont pas de sens là. »

Avant : le Suivi financier du camion Collecte montrait DEUX lignes
« Gain net » côte à côte — « sur le ramassé » (facturé − dépenses) et
« sur l'encaissé » (collecté − dépenses), depuis la v1.62.1. Ce
dédoublement reflétait la distinction colis/ramassage propre à France
& Europe (prix du colis vs frais de ramassage, parfois gratuit en
Île-de-France) — sans équivalent côté Collecte, où `c.prix` EST déjà
le frais de ramassage, sans part à part. Remplacé par une seule ligne
« Résultat total après dépenses » basée sur le collecté, exactement
comme côté France & Europe (voir plus haut, v3.99.27). Ajoutée aussi,
comme demandé : la ventilation « Encaissé en espèces »/« Encaissé en
virement » (nouvelle fonction `_depEncaisseParMethodeCamion`, miroir
de `_frEncaisseParMethodeCamion`), jusque-là absente côté Collecte.

### Collectes France & Europe : date libre + possibilité de la changer
**Fait le 15/10 (v3.99.30).** Cobey : « pour les dates de collecte de
France Europe, actuellement ils sont sélectionnables pour les
dimanches [...] il faudrait changer ça parce qu'en fait, France
Europe, on peut aller faire des collectes n'importe quel jour [...]
un lundi, un mardi, un mercredi. Et il faudrait aussi mettre la
possibilité, une fois qu'on a fait une tournée, de changer la date
[...] on programme une tournée pour un lundi, mais pour X raisons, la
tournée va changer, elle sera pour un mercredi. »

Deux correctifs, tous deux propres à France & Europe (la Collecte
Sénégal reste au dimanche, inchangée — sa restriction a un vrai sens
là-bas) :
1. **Création d'une collecte** — la grille des 6 prochains dimanches +
   le mode « jour exceptionnel » (détour pour saisir une autre date)
   sont retirés, remplacés par un simple sélecteur de date libre,
   pré-rempli sur le prochain dimanche à titre de repère mais modifiable
   vers n'importe quel jour.
2. **Changer la date d'une collecte déjà créée** — n'existait pas
   (seul le statut se changeait, via le « ✏️ » sur chaque carte de
   collecte). La même fenêtre porte maintenant aussi un champ date ;
   l'enregistrer recalcule le libellé et, sauf collecte déjà « Terminé »,
   le statut En cours/À venir selon la semaine — avec le même garde-fou
   qu'à la création contre deux collectes à la même date.

### Estimation de temps France & Europe : 30 min/client + 2h de battement
**Fait le 15/10 (v3.99.31).** Cobey : « tu peux rajouter 30 minutes
par client et également un battement de 2 heures. Ces 2 heures
correspondraient aux pauses, déjeuner, aux pauses café sur la route,
heure de repos [...] par tournée [...] pour être large. »

Avant : durée totale = trajet routier (calcul OSRM, voir
`estimerKmCamionFrance`) + 20 min par client. Changé : 20 min devient
30 min par client, et un battement fixe de 2h (120 min) s'ajoute une
seule fois par tournée (pas par client) — pauses, déjeuner, café,
repos. Le détail affiché sous le kilométrage estimé reflète les trois
parts séparément : « trajet Xh + 30 min × N clients + 2h de
battement ».

### Bug réel de lenteur en France & Europe pendant une tournée active
**Fait le 15/10 (v3.99.32 + départs v2.20.77).** Cobey, après la
tournée du Nord : « quand je rentrais dans l'espace France-Europe,
l'application buguait, les boutons ne répondaient pas forcément [...]
il y avait trop de latence, j'étais obligé de sortir de l'application,
la fermer, la réouvrir [...] il y avait un réel bug. »

Cause trouvée dans le code : l'écoute Firebase `db.ref('france')
.on('value', ...)` (fonction `ecouterFrance`) porte sur TOUT le
sous-arbre France — clients, collectes, tournées, postes, lots.
N'importe quelle écriture là-dedans (une validation de colis, un
versement enregistré, un horodatage Waze...), faite par n'importe quel
collaborateur, sur n'importe quelle collecte, redéclenchait un rendu
complet de l'écran (liste des clients, grille des collaborateurs,
cartes...) sur CHAQUE appareil connecté à l'espace France & Europe.
Pendant une tournée active, avec plusieurs collaborateurs qui
écrivaient à quelques secondes d'intervalle les uns des autres, ces
rendus s'enchaînaient et bloquaient l'interface (boutons qui ne
répondent plus, latence).

Un deuxième mécanisme aggravait ça : à chaque rendu de l'écran France,
une fonction vérifie si une collecte « À venir » doit démarrer
automatiquement (passer en « En cours ») et, si oui, réécrit ce statut
sur Firebase — ce qui redéclenchait l'écoute ci-dessus, qui redéclenchait
un rendu, qui pouvait retenter la même écriture avant que l'écho du
premier envoi ne soit redescendu.

Deux correctifs, tous deux sans rien changer au comportement visible :
1. Les événements Firebase proches (moins de 400ms d'écart, typiques
   d'une rafale d'écritures pendant une tournée) sont désormais
   regroupés en un seul rendu, au lieu d'un rendu par événement.
2. Le démarrage automatique d'une collecte n'écrit plus qu'une seule
   fois par collecte (garde-fou en mémoire), au lieu de pouvoir
   réécrire à chaque rendu tant que l'écho Firebase n'était pas encore
   redescendu.

### Un client ramassé restait affiché "Planifié" (carte + fiche)
**Fait le 15/10 (v3.99.33 + départs v2.20.78).** Cobey, cas réel : Mme
Haby Diallo, ramassée lors de la tournée du 14/10 (l'écran du camion
affichait bien « ✅ Ramassé — 790 € »), restait visible sur la carte
des colis avec le badge « Planifié », alors qu'un client ramassé doit
en disparaître (voir le correctif du 13/10 à ce sujet).

Cause : le bouton « Valider » de l'écran camion déclenchait DEUX
écritures Firebase séparées et indépendantes pour le même geste —
`tk.validated` (qui pilote l'affichage « Ramassé » sur l'écran du
camion) d'un côté, `c.statut` (qui pilote la carte et la fiche client)
de l'autre. En tournée, avec une coupure réseau ou un aléa de
synchronisation, l'une pouvait passer sans l'autre : le camion
affichait « Ramassé » mais la fiche du client restait bloquée sur
« Planifié », sans que personne ne s'en rende compte.

Correctif : les deux écritures sont désormais regroupées dans un seul
appel Firebase atomique — soit les deux passent ensemble, soit aucune
des deux, jamais l'une sans l'autre. (Reprend le même principe que la
correction du 15/10 sur la lenteur en tournée : des écritures qui se
marchent dessus pendant une tournée active.)

Pour corriger la fiche déjà bloquée de Mme Haby Diallo : rouvrir la
collecte du 14/10, cocher sa carte dans l'onglet Clients et utiliser
« ✅ Marquer comme ramassés » (qui, lui, écrivait déjà correctement
les deux en même temps).

### Correction automatique des fiches déjà bloquées (sans rien cocher)
**Fait le 15/10 (v3.99.34 + départs v2.20.79).** Cobey, juste après le
correctif ci-dessus : « je veux pas cocher [...] dès que c'est
collecté, les clients partent de la liste. On va pas toujours appuyer
sur ceux qui sont partis. »

Plutôt que de demander à Cobey de cocher manuellement chaque fiche
restée bloquée (comme celle de Mme Haby Diallo), l'application se
corrige maintenant toute seule : à chaque rendu de l'écran France, si
un client apparaît déjà validé dans un camion (ce qui fait afficher
« ✅ Ramassé » côté camion) mais que sa fiche n'a jamais basculé sur
« ramassé » — vieille divergence d'avant le correctif précédent —,
elle est corrigée automatiquement, sans aucune action de personne. La
fiche disparaît alors d'elle-même de la carte et de la liste des
clients, exactement comme pour un ramassage normal.

### Lenteur persistante en France & Europe : archivage des clients "Parti"
**Fait le 15/10 (v3.99.35 + départs v2.20.80).** Cobey, après les deux
correctifs précédents : « l'appli a encore des lenteurs [...] dans
France Europe c'est là que je galère beaucoup, chargement de page
lent, bouton non clicable. »

Cause, différente des deux précédentes : rien ne retirait jamais un
client de `franceData.clients`, même son colis expédié depuis des
mois — l'écoute Firebase télécharge donc l'historique COMPLET de
l'activité France & Europe à chaque ouverture de l'appli, y compris
sur un réseau faible en tournée. Plus l'activité s'accumule, plus ce
téléchargement grossit.

Cobey a confirmé que les clients « En attente »/« Planifié », même
très anciens, sont un vrai travail en cours (« c'est des client qui
attente car on est pas encore passé chez eux, ramasse France ça peut
être long, faut le temps de s'organiser ») — ils ne doivent JAMAIS
être touchés, quel que soit leur âge. Seuls les clients « Parti »
(colis déjà expédié, dossier clos) sont concernés par ce correctif.

Pour ne rien casser des rapports financiers par container ni des
factures déjà envoyées (qui listent tous les clients d'un départ en
filtrant `franceData.clients` par `departId`), le client n'est pas
supprimé de la liste — seuls les deux champs qui grossissent le plus
avec le temps (`colisDetail`, le détail colis par colis, et `hist`,
l'historique complet des modifications) partent dans une archive à
part (`france_archive/clients/<id>`), retirés de la copie téléchargée
par défaut. Tout le reste (prix, versements, dates, container, statut)
reste en place : les rapports, listes et comptages fonctionnent sans
aucun changement. Seule l'ouverture de LA fiche ou LA facture d'un
client déjà archivé va rechercher son détail complet à la demande —
invisible en usage normal, un peu plus long une seule fois sur une
vieille fiche (y compris sur la facture publique que le client
consulte via son lien WhatsApp, `facture.html`, corrigée à l'identique).

### Le vrai responsable : le "garde-doigt" jamais branché sur France & Europe
**Fait le 16/10 (v3.99.36).** Les trois correctifs précédents n'ont pas
réglé le problème. Cobey a précisé le symptôme exact : « je clique au
moins 5-6 fois avant que le bouton se valide » — pas un écran vide, pas
figé en permanence, juste des taps qui ne passent pas.

C'est très exactement un bug déjà rencontré et réglé côté Collecte
Sénégal en v3.78.0 (voir son commentaire, `_dctRedessinerEcranActif`) :
quand une synchronisation Firebase redessine l'écran PENDANT qu'un
doigt est posé dessus, l'élément touché est détruit avant que le
navigateur n'émette le clic — « l'impression d'appuyer dans le vide, et
le réflexe d'appuyer plusieurs fois ». Exactement les mots de Cobey,
un an plus tard, pour France & Europe cette fois.

Ce garde-doigt (`_dctDoigtPose`, qui suit si un doigt est posé sur
l'écran + une petite marge après le relâchement) est déjà GLOBAL à
toute l'application — il n'avait simplement jamais été branché sur
l'écoute Firebase de France & Europe (`ecouterFrance`), qui redessinait
l'écran sans jamais vérifier si quelqu'un était en train de taper
dessus. Corrigé en reprenant le même mécanisme : le redessin attend
que l'écran soit libre avant de reconstruire quoi que ce soit.

### La même lenteur, côté Collecte Sénégal cette fois
**Fait le 16/10 (v3.99.37).** Cobey, juste après le correctif
précédent : « je retrouve ses lenteur et blocage également dans le
parcours collecte, quand j'ouvre une collecte, ça répond pas ou ça
met du temps ! » Précisé ensuite : ça arrive même en wifi (pas un
souci réseau), pas à chaque fois mais souvent (« des fois ça redonne
une fluidité mais pas tout le temps »), et très probablement avec
plusieurs collaborateurs actifs en même temps sur la collecte "en
cours" testée.

Le garde-doigt de Collecte (v3.78.0) protège déjà le clic lui-même
(vérifié par test), et l'empreinte déjà en place évite bien les
redessins quand rien n'a changé. Mais quand PLUSIEURS collaborateurs
écrivent vraiment coup sur coup (un client ajouté, un versement
encaissé...), chaque écriture redessinait encore l'écran actif tout de
suite, une fois par écriture — même défaut que celui corrigé pour
France & Europe. Corrigé en regroupant aussi les écritures rapprochées
(300ms) en un seul redessin, avant d'appliquer le garde-doigt.

### France & Europe vide chez Aminata : erreur Firebase rendue visible
**Fait le 16/10 (v3.99.38).** Cobey : chez Aminata, France & Europe
affiche 0 clients et 0 collectes — y compris le compteur sur le bouton
d'accueil, avant même d'entrer dans l'espace. Ça n'a jamais fonctionné
pour elle depuis qu'elle a l'appli, alors que le reste (Collecte)
marche normalement sur le même appareil, même après un vrai vidage de
cache. Elle est bien inscrite comme collaboratrice normale (profil
"AM", case France incluse) — vérifié dans le code, rien d'anormal sur
sa fiche.

Cause trouvée : l'écoute Firebase de France & Europe
(`db.ref('france').on('value', ...)`) n'avait jamais de callback
d'erreur. Si Firebase refuse la lecture (permission refusée, règles de
sécurité...), ça échouait en silence TOTAL — aucun message, aucune
trace, strictement indiscernable d'un simple "elle n'a pas encore de
client". Impossible à diagnostiquer à distance jusqu'ici.

Un message d'erreur visible (avec le code exact renvoyé par Firebase)
s'affiche désormais si cette écoute est refusée. La prochaine fois
qu'Aminata ouvre l'appli, soit le problème a disparu, soit elle verra
enfin un message précis à transmettre — ce qui dira si c'est un souci
de règles Firebase (à corriger côté console) ou autre chose.

### Alerte Firebase « règles non sécurisées » — connexion staff étendue
**Fait le 17/10 (chauffeur v1.6.2, mamadou v1.13.1).** Cobey a reçu (à
nouveau) l'alerte automatique de Firebase : « N'importe quel utilisateur
connecté peut lire l'intégralité de votre base » / « ... peut écrire sur
votre base ». Vérification faite : règle actuelle `auth != null`,
identique pour tous les chemins (donc pas la cause du problème
d'Aminata, qui reste non résolu — voir plus haut).

Le vrai souci : `chauffeur.html` et `mamadou.html` se connectaient en
anonyme pur (`signInAnonymously`, sans aucun identifiant) — avec la
règle `auth != null`, n'IMPORTE QUI sur Internet qui trouve la
configuration Firebase de l'une de ces pages (visible dans leur code,
ce n'est pas secret pour Firebase mais ça l'est pour des règles aussi
larges) peut s'authentifier sans rien connaître et obtenir un accès
en lecture ET écriture à TOUTE la base, pas seulement à son propre
espace.

Les deux pages utilisent désormais le même compte "service" que
l'appli interne (`staff@dakarcitytransport.app`, voir
`_depConnexionStaff`), avec repli sur l'anonyme UNIQUEMENT si cette
connexion échoue — jamais de coupure d'accès pour un vrai chauffeur ou
pour Mamadou. Leur contrôle d'accès réel (code tournée / mot de passe
dédié) ne change pas.

`facture.html` reste volontairement en connexion anonyme (de vrais
clients externes y accèdent sans aucun compte, juste un lien
WhatsApp) — son accès doit plutôt être restreint par des règles
Firebase précises par chemin (lecture seule, sur les chemins dont elle
a réellement besoin), pas par un identifiant partagé. Reste à faire,
nécessite d'écrire et de tester ces règles avec Cobey (simulateur de
la console Firebase) avant de les publier — changement sensible, pas
fait à l'aveugle.

**Suite (même jour)** : règles testées et publiées par Cobey lui-même
via le simulateur de la console Firebase (lecture refusée sans le bon
compte, autorisée pour une facture via lien externe — conforme). La
connexion staff de `chauffeur.html`/`mamadou.html` (ci-dessus) est donc
maintenant le vrai mécanisme utilisé en production, plus un simple
filet de sécurité en option.

### Profil de secours "Aminata 2"
**Fait le 17/10 (v3.99.39 + départs v2.20.81).** Le problème France &
Europe sur le profil "AM" n'étant toujours pas expliqué (voir plus
haut), Cobey a demandé un second profil, mêmes accès que "AM", en
attendant de retrouver la vraie cause — pas un remplacement définitif.

Nouveau profil `A2` ("Aminata 2") dans `COLLABS`, avec exactement les
mêmes cases Bureau que "AM" (`DEP_CASES_PAR_ID`), et les mêmes règles
annexes déjà spécifiques à "AM" reprises à l'identique (exclu du
calcul de salaire terrain, inclus dans les organisateurs du planning
— `DEP_IDS_PLANNING`). Première connexion : comme pour tout nouveau
profil, l'appli demandera de créer un code PIN.

**Correctif (même jour, v2.20.82)** : Cobey — « le profil Aminata 2 doit
être dans l'espace bureau. » Un oubli dans la liste qui place chaque
profil dans son espace de connexion (`DEP_ESPACE_PAR_ID`) : "A2"
n'y figurait pas, donc retombait par défaut sur l'espace Terrain au
lieu de Bureau. Ajouté, "A2" apparaît maintenant au bon endroit, comme
"AM".

### La vraie cause, enfin trouvée : l'ordre de connexion au démarrage
**Fait le 17/10 (v3.99.41 + départs v2.20.83).** Le message d'erreur
ajouté plus tôt (v3.99.38) a payé : Cobey, test décisif sur son 2e
téléphone, profil Aminata → « France & Europe : connexion refusée
(PERMISSION_DENIED) » ; même téléphone, même session, un autre profil
→ aucun souci. Confirmé ensuite : ça arrive à CHAQUE fermeture/
réouverture de l'appli, sur n'importe quel espace.

Cause réelle : `ecouterFrance()` (et toutes les autres écoutes
Firebase de l'appli, `ecouterChangements()` comprise) s'attachaient
AVANT que la connexion sécurisée (`_depConnexionStaff`, compte
interne) ne soit établie — dans `initFirebase()`, la connexion était
lancée en DERNIER, après que toutes les écoutes aient déjà démarré.
Avec les anciennes règles souples (`auth != null`), ce décalage ne se
voyait jamais : n'importe quel état d'authentification passait. Avec
les nouvelles règles strictes (compte précis exigé, voir plus haut),
une écoute qui démarre une fraction de seconde trop tôt — avant que la
connexion n'aboutisse — se fait refuser, et Firebase RTDB ne revient
JAMAIS tout seul sur un refus une fois la connexion aboutie : il
faudrait rappeler `.on()` pour de bon, ce que rien ne faisait. D'où un
échec qui semblait aléatoire (lié au profil, au téléphone...) alors
qu'il s'agissait d'une course gagnée ou perdue à chaque démarrage.

Corrigé en réordonnant : `initFirebase()` reste synchrone (elle doit
rester ainsi — c'est elle qui initialise l'application Firebase,
sans quoi la connexion n'a encore rien à authentifier), mais
l'attachement des écoutes elles-mêmes est sorti dans une nouvelle
fonction `_demarrerEcoutesFirebase()`, qui attend désormais la fin
réelle de la connexion avant de poser la moindre écoute — France &
Europe, Collecte, et tout le reste.

C'est probablement aussi la vraie explication du problème persistant
d'Aminata depuis le début (son appareil perdait systématiquement
cette course), mais l'ancienne version des règles (plus souple) ne le
révélait jamais par un échec franc — à confirmer la prochaine fois
qu'elle se connecte.

**Confirmé (même jour)** : Cobey a appelé Aminata, ça fonctionne.
Profil "Aminata 2" (A2, voir plus haut) retiré — n'était qu'un
filet de secours temporaire, plus nécessaire (v3.99.42 + départs
v2.20.84).

**17/10, v3.99.43 — deux retours de Cobey sur France & Europe, après le
correctif ci-dessus.**

1. Capture d'écran à l'appui : « après plus de 20 secondes où j'ai
   appuyé sur le bouton collect, la page collect arrive, mais elle est
   comme ça » — un écran totalement vide (ni liste, ni "Aucune
   collecte", ni bouton "+ Créer"). Le délai de 20s+ lui-même reste
   l'attente de connexion/réseau déjà identifiée (téléphone à 9% de
   batterie et réseau très faible sur la capture) ; mais le VIDE total
   qui suit était un vrai bug séparé : la moindre exception JS pendant
   la construction de l'écran Collectes coupait `renderFrance()` avant
   le `box.innerHTML=...`, sans jamais rien afficher ni journaliser —
   invisible exactement comme l'était PERMISSION_DENIED avant le
   correctif sur `ecouterFrance()`. Même remède appliqué : la
   construction réelle de l'écran est encadrée d'un try/catch — une
   erreur affiche désormais un message explicite + bouton "Réessayer"
   au lieu d'un écran mort, et la journalise pour de bon (`renderFrance`
   / `_frRenderFranceCorps`, dct-app.html).

2. Trois captures d'écran : en ouvrant une collecte précise, l'onglet
   "Clients" montrait TOUS les clients France & Europe (l'inbox global,
   22 dans son cas) au lieu des seuls clients DE cette collecte, plus
   le récap par collaborateur (ajouté en v3.99.25 à sa demande) que
   Cobey juge maintenant de trop à cet endroit : « je pense pas que ça
   devrait être là, ça ». Corrigé : l'onglet Clients d'une collecte
   ouverte ne montre plus que ses propres clients (recherche et filtres
   compris), et le récap par collaborateur a été retiré — ne reste que
   le fil d'Ariane "← Toutes les collectes" + la date. L'inbox global
   (aucune collecte ouverte) n'est pas touché.

**17/10, v3.99.45 — RIB sur les factures et les relances de paiement.**

Cobey, capture d'écran du RIB Revolut à l'appui : « à ajouter sur les
factures, juste en dessous des montants totaux, et aussi sur les
messages de relance WhatsApp pour les clients qui ont des retards de
paiement. » Convenu avec lui : IBAN + BIC + titulaire seulement (pas
le RIB détaillé — code banque/agence/compte/clé est redondant avec
l'IBAN, qui le contient déjà, et alourdit inutilement un message
WhatsApp) ; rien sur le devis, qui n'est qu'indicatif, jamais une
demande de paiement ; couvre à la fois la relance paiement colis ET
la relance paiement livraison (même fonction pour les deux).

Nouvelle constante `DEP_RIB` (departs.js, dupliquée à l'identique
dans facture.html comme `DEP_ADRESSE_DEPOT` juste au-dessus) +
`_depBlocRibFacture()` (bloc HTML, inséré juste sous "Reste à payer"
sur la facture publique/interne ET la facture manuelle) et
`_depTexteRib()` (même info en texte brut, ajoutée à la fin de
`_depTexteRelancePaiement`, juste avant la formule de politesse).

**17/10, v3.99.46 — correctif de placement du RIB (même jour).** Cobey,
captures d'écran à l'appui : « le RIB est mal placé [...] il devrait
être en dessous des chiffres total. Pas sur le côté ni au-dessus. »
Cause : `.fac-bas` est en `flex-wrap:wrap-reverse` (pour que sur
mobile le bloc "Arrêtée à la somme de", moins important, passe sous
les totaux) — le RIB, ajouté comme un 3e enfant FRÈRE du bloc
`.fac-totaux`, se faisait remonter AU-DESSUS des totaux par ce même
mécanisme sur mobile, et apparaissait comme une colonne à part sur
l'aperçu PDF large. Corrigé en mettant le RIB DANS `.fac-totaux`
(son dernier élément, pas un frère) sur les 3 emplacements (facture
publique/interne, facture manuelle) : il reste groupé avec les
chiffres, toujours juste en dessous, quelle que soit la largeur
d'écran.

**17/10, v3.99.47 — Planning : onglet "Mes disponibilités" retiré pour
Eric et Aminata.** Cobey : « pour Aminata et moi, tu peux enlever
l'onglet "Mes disponibilités". Au final, il ne sert à rien, vu que
nous, on ne participe pas aux collectes. » `_depGensPlanning()`
excluait déjà Eric (admin) et Aminata (Bureau) de la liste des
participants depuis la v2.6.3 — eux seuls organisent/relancent
(`_depPeutOrganiserPlanning`) sans jamais donner de disponibilité —
et l'onglet "Mes disponibilités" affichait déjà pour eux un message
("vous n'avez pas de disponibilité à donner ici [...] ouvrez
L'équipe") au lieu du vrai formulaire. Mais l'onglet restait affiché
quand même, les obligeant à cliquer "L'équipe" à chaque ouverture.
Corrigé (`depRenderPlanning`) : pour qui n'est pas dans
`_depGensPlanning`, l'onglet disparaît carrément — "L'équipe"
s'affiche d'office, sans bascule à montrer pour un seul choix
possible. Aucun changement pour les vrais participants terrain.

**17/10, v3.99.48 — lenteur générale, nouvelle piste trouvée et
corrigée.** Cobey : « il y a vraiment, vraiment des lenteurs qu'il
n'y avait pas avant [...] cherche-moi le problème. »

Trouvé : `_dctMajActivite(data)` (appelée par `ecouterChangements()`,
l'écoute Collecte Sénégal, à CHAQUE écho Firebase sur `dct` — y
compris la voie "rien n'a changé", délibérément, pour la laisser
tourner même là) reparse et reconstruit tout `#activity-list` à
partir de `data.activite`. Or plus aucun code n'écrit ce champ
Firebase depuis le passage au "SYSTÈME ACTIVITÉ v2" (`addActivity`
écrit désormais sur `activite_items`, un nœud à part ; le commentaire
disant "géré séparément via addActivity" ne correspond plus à la
réalité du code). `data.activite` est donc une valeur FIGÉE, toujours
identique — et pourtant ce travail (reconstruire un bloc HTML
temporaire, reparser, refiltrer, réécrire tout `#activity-list`) se
refaisait en entier à CHAQUE geste de N'IMPORTE QUEL collaborateur
sur Collecte Sénégal, tout au long de la session, qu'on soit sur
l'écran Activité ou non.

Exactement le profil décrit par Cobey : plus l'équipe est active
(donc plus on reste connecté longtemps dans la journée), plus ces
échos s'enchaînent et plus ce travail inutile s'accumule — « ça va
mieux à l'ouverture, pire après un moment ».

Corrigé en mémorisant la dernière valeur de `data.activite` traitée :
le travail est sauté tant qu'elle n'a pas réellement changé (en
pratique : toujours, aujourd'hui). Testé : 40 échos coup sur coup à
valeur identique ne déclenchent plus qu'UNE seule reconstruction (la
toute première), et le mécanisme continue de fonctionner si la valeur
change un jour pour de vrai.

**Important : cette piste est confirmée et corrigée, mais peut-être
pas la seule.** À vérifier avec Cobey si la lenteur persiste malgré
ce correctif.

**Suite (même jour) : Cobey a testé sur son 2e téléphone, fluide
aussi.** La lenteur vient donc de son téléphone précis (batterie/
stockage/mode basse consommation), pas de l'application — conseils
donnés (redémarrer, vérifier le stockage et la batterie, fermer les
apps en arrière-plan), rien à corriger côté code pour ça.

**17/10, v3.99.49 — libellé « Frais de ramassage » renommé en « Frais
de déplacement ».** Cobey : « c'est plus adéquat ». Renommé partout
où ce libellé apparaît à l'écran (formulaire d'inscription France &
Europe, formulaire Devis, facture publique/interne, facture manuelle,
fiche client, carte-chiffres de l'en-tête France, comparatif coûts/
ramassage du camion, case "Dépenses du camion") — dans dct-app.html,
departs.js ET facture.html (copie à l'identique, comme pour le RIB).
Seul le texte affiché change : le nom interne du champ (`prixRamassage`,
`fa-ramassage`, `devis-f-ramassage`) reste inchangé, pour ne rien
casser côté Firebase.

**18/10, v3.99.50 — correctif : "Frais de déplacement" ne devait PAS
s'appliquer à l'écran Dépenses du parcours Collecte Sénégal.** Cobey,
capture d'écran à l'appui (Dépenses du camion d'Abdoulaye, Collecte
Sénégal) : « il y a marqué frais de déplacement [...] c'est pas ça,
c'est les frais réels après facturation. » Cause : l'écran Dépenses
(`depRenderDepenses`) est PARTAGÉ entre France & Europe et Collecte
Sénégal via `_depDepenseCollecteMontant(ctx, tk)` — côté France, ce
chiffre est bien un vrai frais de déplacement payé par client
(`_frFraisRamassageCamion`) ; côté Collecte Sénégal, c'est le total
FACTURÉ/collecté par ce camion (`_depCollecteDuCamion`), une notion
différente. Le renommage de la veille (v3.99.49) avait rendu le
libellé universel par erreur sur cette case précise. Corrigé : le
libellé redevient conditionnel selon `ctx.src` — "FRAIS DE
DÉPLACEMENT" pour France, "FACTURÉ" pour Collecte Sénégal (comme
l'écran s'appelait avant le v3.99.23, cohérent avec ce que ce chiffre
représente réellement). Testé sur les deux contextes du même écran
partagé.

**18/10, v3.99.51 — même écran, Cobey va plus loin : "FACTURÉ" devient
"COLLECTÉ" (le vrai encaissé).** « Au lieu de mettre le prix facturé,
faudrait mettre le prix réellement collecté, moins la dépense [...]
facturer c'est le prix total, mais les gens ne paient pas forcément
tout de suite. » `_depDepenseCollecteMontant` utilisait
`_depCollecteDuCamion` (le prix plein de chaque client ramassé, payé
ou non) côté Collecte Sénégal — remplacé par `_depEncaisseDuCamion`
(l'argent VRAIMENT versé, `depCalculerPaiement(c).paye`), déjà utilisé
ailleurs dans l'appli sous le même nom "✅ Collecté". Le Gain net
(collecte − dépenses) reflète donc maintenant ce qui reste vraiment en
poche pour ce camion, pas un chiffre qui suppose à tort que tout le
monde a déjà payé. France & Europe inchangé (le frais de déplacement
reste un forfait, pas un montant encaissé progressivement). Testé
avec un client facturé 1670 € mais seulement 600 € réellement versés
: l'écran affiche bien 600 € / "COLLECTÉ", pas 1670 € / "FACTURÉ".

**20/10, v3.99.52 — collectes France & Europe : possibilité de leur
donner un nom.** Cobey : « mets la possibilité de mettre un nom pour
les collectes France Europe type (Marseille, Bordeaux, région du
nord), comme ça on peut savoir et préparer des camions à l'avance. »
Un champ "Nom" facultatif, à la création (écran "Nouvelle collecte")
et modifiable après coup (même modale "Modifier la collecte" que la
date, nouveau bouton "🏷️ Enregistrer ce nom") — nouveau champ Firebase
`nom` sur la collecte, vide par défaut.

Affiché partout où la collecte apparaît : en titre de la carte (le
nom passe devant, la date en sous-titre) sur la liste "Collectes" ;
dans le fil d'Ariane "← Toutes les collectes" une fois la collecte
ouverte ; dans l'en-tête de l'écran Dispatch ; dans le sous-titre de
l'écran d'un camion ; dans le titre de "Choisir des clients pour
cette collecte" — un seul format partagé (`_frTitreCollecte`) :
"Nom — date" si un nom est renseigné, sinon juste la date comme
avant (aucun changement visuel pour une collecte sans nom).

**20/10, v3.99.53 — root cause trouvée : les boutons "Prévenir" du
container n'apparaissaient jamais côté appli principale.** Cobey,
capture d'écran à l'appui (container "Chargement DKR" affichant
"Parti" alors que "Suivi transport : Arrivée au dépôt · 4/4") : « le
container est arrivé au dépôt, Mamadou Niass a bien validé, par
contre j'avais demandé d'avoir des boutons [...] pour prévenir les
clients [...] mais là je ne vois rien [...] je veux aussi un statut
pour qu'on voie quel client a été délivré par Mamadou Niass. »

**Cause réelle** : les boutons "Prévenir (arrivé)" de l'écran Départ
(appli principale, `depDetail`) dépendent de `departs/<id>/statut
=== 'arrive'` — jamais de l'étape elle-même. Dans l'appli principale,
valider une étape fait passer ce statut automatiquement
(`_depMajStatutDepuisEtapes`) — mais `mamadou.html` est une page à
part, sans cette synchronisation : `validerArriveeDepot()` n'écrivait
QUE `etapesTransport/arrivee_depot`, jamais `statut`. Résultat : le
container restait affiché "Parti" indéfiniment côté appli principale
même une fois l'arrivée bien validée par Mamadou — alors que SA
propre page affichait déjà ses boutons WhatsApp "Prévenir le
destinataire" correctement (elle se base directement sur l'étape, pas
sur `statut`). D'où la confusion : Mamadou voyait ses boutons, Cobey
non. Corrigé : `validerArriveeDepot()` écrit maintenant aussi
`statut: 'arrive'` (sauf si déjà clôturé administrativement, même
règle que `_depStatutSelonEtapes`). **Le container "Chargement DKR"
déjà bloqué doit être corrigé à la main cette fois** (bouton
"Modifier" en haut de son écran Départ, changer le statut en
"Arrivé") — le correctif ne s'applique qu'aux prochaines validations.

**Statut "remis au client", étendu à tout le monde.** Jusqu'ici,
`livraisonValidee` (remis/pas remis) ne couvrait que les clients en
livraison à domicile (`livraisonDakar`) — un client qui vient chercher
son colis en personne au dépôt n'avait aucun statut du tout, ni côté
Mamadou ni côté appli principale. Nouveau champ `remisAuClient`
(posé par Mamadou, nouveau bouton "📦 Marquer remis au client" sur son
écran container, sans exigence de photo contrairement à
`livraisonValidee` — la remise se fait en personne, devant lui, pas à
distance) ; affiché comme badge "✅ Remis au client" / "⏳ En attente
de retrait" aussi bien sur l'écran container de Mamadou que sur
l'écran Départ de l'appli principale (`_depBadgeLivraison`, étendue
pour couvrir ce cas en plus de la livraison à domicile).

**20/10, v3.99.54 — "Chargement DKR" toujours bloqué : auto-réparation
ajoutée, aucune case pour corriger à la main.** Cobey est allé
vérifier : les 4 étapes de suivi sont bien toutes validées (capture à
l'appui), mais "Modifier le départ" n'a AUCUNE case "statut" (« ya
rien ») — logique, le statut n'a jamais été qu'une déduction
automatique des étapes (`_depStatutSelonEtapes`), jamais un champ
choisi à la main. Un container resté désynchronisé à cause de
l'ancien bug (mamadou.html, voir plus haut) n'avait donc strictement
AUCUN moyen de se corriger, ni automatique ni manuel.

Corrigé : `depDetail` (ouverture de l'écran Départ d'un container)
appelle désormais `_depMajStatutDepuisEtapes` à chaque ouverture —
sans coût pour un container déjà synchronisé (ne réécrit rien si le
statut visé est déjà le bon), elle rattrape silencieusement tout
container resté bloqué par l'ancien bug, "Chargement DKR" compris,
dès la prochaine fois que quelqu'un l'ouvre — plus besoin d'y
toucher à la main.

**20/10, v3.99.55 — le bouton "Marquer remis au client" (mamadou.html)
devient une bascule.** Cobey, capture d'écran à l'appui : « il faut un
autre bouton pour annuler ! ou alors faire en sorte que si on réappuie
ça annule. » Un tap par erreur (mauvais client, faux clic) doit
pouvoir se rattraper. `mnMarquerRemisAuClient` bascule désormais : un
second tap sur le même bouton annule la remise (`remisAuClient` repasse
à `null`, qui supprime bien le champ côté Firebase via `.update()`) au
lieu d'ajouter un bouton "Annuler" séparé — même esprit que les autres
boutons à bascule de l'appli. Rien à changer côté affichage du badge
(mamadou.html et `_depBadgeLivraison` côté appli principale) : les deux
se basent déjà sur la simple présence du champ, absent = "en attente
de retrait" comme avant la remise.

**20/10, v3.99.55 — "container" remplacé par "colis" dans les messages
envoyés aux clients.** Cobey, message collé en exemple : « voici le
message que les clients reçoivent pour être prévenus, remplace "votre
container" par "vos colis". » "Container" est le mot interne de
l'équipe pour désigner le chargement groupé — un client ne sait pas ce
que c'est, lui pense en "colis". Corrigé dans les deux messages
WhatsApp/copier concernés (`_depTexteMessageArriveeExpediteur`, le
message "Prévenir (arrivé)" que Cobey a cité, et `_depTexteRelancePaiement`,
qui avait exactement la même tournure) : "Votre container est/arrive"
→ "Vos colis sont/arrivent". Le message équivalent de mamadou.html
(`_mnTexteArriveeDestinataire`, "Prévenir le destinataire") disait déjà
"colis", rien à y changer.

**20/10, mamadou.html v1.14.2 — "Valider la livraison" pose aussi
"remis au client".** Cobey, après avoir vu le nouveau bouton
"Marquer remis au client" (retrait au dépôt) à côté du bouton existant
"Valider la livraison" (livraison à domicile) sur la fiche d'un client
en livraison : « on va plutôt faire comme ça, quand il appuie sur le
bouton valider ça valide également le bouton remis au client et nous
aussi de notre côté. » Plutôt que deux statuts à suivre séparément
selon le type de client, `mnExecuterValidationLivraison` pose
désormais `remisAuClient` EN PLUS de `livraisonValidee` au moment de
la validation — un seul champ "remis au client", vrai pour tout le
monde une fois le colis effectivement remis, quel que soit le chemin
(livraison à domicile ou retrait au dépôt). Rien ne change côté
affichage (le badge "Délivré au client" en livraison à domicile reste
celui qui s'affiche, `_depBadgeLivraison` côté appli principale) —
seule la donnée devient cohérente pour un usage futur (rapport,
filtre...) qui voudrait compter "remis" sans distinguer le type.

**20/10, mamadou.html v1.14.3 — statut "remis" visible sur la carte
pour les clients en livraison à domicile aussi.** Cobey, capture
d'écran à l'appui : « pk il a rien le client 43 » — N°43 est en
livraison à domicile (badge "🚚 Livraison ... soldée" visible), mais
rien sur sa carte ne disait s'il avait déjà été remis ou pas,
contrairement aux clients du retrait au dépôt (N°46, N°36, un bouton
dédié juste sous leur carte). Il fallait ouvrir la fiche pour le
savoir. Ajouté : un badge en lecture seule (pas un bouton — valider
exige une photo, qui ne se fait que depuis la fiche) juste sous la
ligne "Livraison" : "✅ Remis au client — date" ou "⏳ Pas encore remis
— ouvrir la fiche", visible dès que le container est arrivé — même
langage visuel (vert/orange) que le statut du retrait au dépôt.

**20/10, v3.99.56/v2.20.94 — les photos de remise de Mamadou Niass
apparaissent enfin dans l'appli principale.** Cobey, 3 captures
d'écran à l'appui : « Mamadou Niass a validé une photo pour une
cliente mais nous de notre côté on ne la voit pas. » La cliente (Anita
Ly, retrait sur place) avait une photo dans son bloc "VOS PHOTOS DE
REMISE" sur mamadou.html, mais l'accès rapide "Photos" de l'appli
principale (`_depChargerPhotosFiche`, utilisé par le bouton photo sur
la fiche et sur la liste des clients d'un container) ne lisait que
`france_photos/`/`dct_photos_colis/` — jamais `dct_photos_livraison/`,
le nœud où `mnPhotoLivraisonChoisie` (mamadou.html) écrit ces photos
de preuve de remise. Un nœud entier, jamais lu côté appli, pour
n'importe quel client, pas seulement Anita Ly. Corrigé : ces photos
sont désormais fusionnées avec les photos du colis (triées par date),
marquées pour qu'on les distingue (nom de Mamadou affiché comme
auteur, comme pour les photos classiques).

**20/10, même lot — horodatage "heure de Dakar" pour tout ce que
Mamadou Niass écrit.** Cobey : « l'horodatage, tu peux la faire à
l'heure et à la date de Dakar et le préciser s'il te plaît pour les
infos de Mamadou Niass, que ça soit sur les activités ou sur les
photos qu'il prend. » Les horaires affichés étaient recalculés dans le
fuseau de l'appareil qui regarde l'écran, sans jamais préciser lequel
— un horaire posé par Mamadou à Dakar pouvait s'afficher décalé et
sans étiquette pour quelqu'un qui consulte depuis la France. Corrigé à
deux endroits : à la source, dans `activiteExterne` (mamadou.html,
désormais figée sur le fuseau Africa/Dakar au moment de l'écriture,
pour les entrées du fil d'activité) et à l'affichage, avec une nouvelle
fonction `_depDateHeureDakar` (departs.js, fuseau Africa/Dakar figé via
`Intl.DateTimeFormat`, toujours suivie de "(heure de Dakar)") utilisée
pour les photos de remise ci-dessus et pour les deux badges
exclusivement posés par lui ("Remis au client", "Délivré au client").
Les horodatages posés par d'autres collaborateurs (ex. "Prévenir le
destinataire" depuis l'appli) restent inchangés — les forcer à Dakar
aurait faussé l'origine réelle de l'action.

**20/10, mamadou.html v1.14.5 — un bouton "Annuler" pour une livraison
validée par erreur.** Cobey, après un test sur un vrai client
(Boubacar DIOP, fiche) : « je voudrais revenir en arrière, mais je
vois que je n'ai pas de bouton. » Validation volontairement sans
retour en arrière jusqu'ici (le modal de confirmation le dit
explicitement : « elle ne se défait pas ») — mais un test fait par
erreur sur un vrai client doit pouvoir se rattraper, comme pour
"Marquer remis au client" (v3.99.55). Ajouté un lien "Annuler" sous le
message "✅ Livraison validée" sur la fiche, avec sa propre fenêtre de
confirmation (même style que les autres, pas de confirm() natif) :
`mnExecuterAnnulationLivraison` remet `livraisonValidee` et
`remisAuClient` à vide ensemble (les deux posés ensemble par
`mnExecuterValidationLivraison`, v3.99.56), pour rester cohérent entre
les deux champs.

**20/10, v3.99.57 — le message d'arrivée distingue retrait au dépôt et
livraison à domicile.** Cobey, message collé en exemple : « tu peux
également ajouter les coordonnées de la personne gérante là-bas,
Mamadou Niass, avec son numéro ainsi que l'adresse du dépôt, et aussi
pour les clients qui ont une livraison, mettre un message différent. »
Puis, sur mon premier brouillon ("vos colis sont prévus en livraison à
votre adresse") : « l'adresse est souvent différente car le
destinataire n'est pas l'expéditeur pour les livraisons » — ce message
part à l'expéditeur (souvent en France), jamais à l'adresse du
destinataire qui réceptionne à Dakar ; "votre adresse" laissait croire
le contraire. Corrigé en "chez votre destinataire" (sa suggestion).
`_depTexteMessageArriveeExpediteur` distingue désormais les deux cas
(`c.livraisonDakar`) : retrait au dépôt → adresse (`DEP_ADRESSE_DEPOT`)
+ contact sur place (`DEP_CONTACT_DEPOT`, déjà utilisés sur l'écran de
suivi public, repris ici pour rester cohérent) ; livraison à domicile →
"Ils sont prévus en livraison chez votre destinataire. Notre équipe le
contactera prochainement pour l'organiser.", sans aucune adresse.

**21/10, v3.99.58 — retirer un client "Planifié" d'une tournée France
& Europe.** Cobey, capture d'écran à l'appui (écran Clients d'une
collecte ouverte, un client coché par erreur) : « je peux pas retirer
des clients que je veux plus de la tournée. » Un client déjà
"Planifié" sur une collecte n'avait aucun moyen de ressortir
entièrement de celle-ci (repartir au vivier, "attente") depuis cette
liste : la case à cocher ne sert qu'à EN ajouter à un camion (voir
`toggleSelAdmin`/`dannySel`), et `retirerClientCamionFrance` (existant)
ne fait que sortir du camion sans quitter la collecte. Seule la modale
"Clients de la collecte" (`_frValiderPick`, ouverte autrement, pas
depuis cet écran) permettait de décocher un client pour l'en faire
sortir complètement. Ajouté un bouton "✕" directement sur la carte de
chaque client "Planifié" de la collecte ouverte (verrouillé, comme
`_frPickVerrouille`, si déjà ramassé) : `retirerClientCollecteFrance`
sort le client de son camion ET de la collecte elle-même (y compris
`collectes/.../clients`, le tableau que lit `_frClientsDeCollecte` —
sans ça le client restait visible malgré `collecteId` vidé), avec
confirmation avant d'agir.

**21/10, mamadou.html v1.14.6 / v3.99.59 — retrait du bouton "Marquer
remis au client" + code couleur plus visible (Mamadou et DCT).**
Cobey : « on a vu qu'il appuyait sur ce bouton sans passer par l'étape
photo et validation avant de remettre le colis » — le bouton ajouté en
v3.99.53/55 pour le retrait au dépôt (un tap, aucune preuve) permettait
de sauter exactement la vérification que la fiche impose déjà à tout
le monde (photo + "Valider la livraison"). Retiré (et
`mnMarquerRemisAuClient`, devenu mort, supprimé avec lui) : la fiche
reste désormais l'UNIQUE chemin pour marquer "remis", pour un client
retrait comme pour un client livraison. Remplacé sur la liste par un
badge en lecture seule (déjà utilisé pour la livraison depuis v3.99.57,
étendu ici au retrait) — et, suite à « on va plutôt mettre un code
couleur [...] un visuel plus fort » : une bordure de carte (vert si
remis, orange sinon, dès que le container est arrivé), plus facile à
repérer en défilant vite que le texte du badge seul. Même code couleur
ajouté côté DCT (`depDetail`, l'écran Départ où l'équipe voit la liste
des clients d'un container) : la bordure de chaque carte reflète
désormais aussi remisAuClient une fois le container arrivé, en
priorité sur la bordure "facture regroupée/double" déjà en place
(celle-ci reste affichée avant l'arrivée, le statut remis n'ayant pas
encore de sens).

**21/10, v3.99.60 / mamadou.html v1.14.7 — couleur plus voyante : toute
la carte, pas juste le bord.** Cobey, sur la bordure ci-dessus : « c'est
pas assez voyant les couleurs, sinon tu remplis la case de la couleur
entièrement. » Puis, confirmant le choix de teinte : « oui pastel c'est
bien » et rappelant la règle déjà en place : « ces couleurs ne
s'affichent que à la validation de l'étape où le container est arrivé
au dépôt de Dakar, avant tu peux laisser blanc » (déjà le cas,
inchangé). La bordure de 4-5px devient un fond pastel sur toute la
carte (vert si remis, orange sinon), côté Mamadou (mêmes teintes que
les badges .cli-liv-soldee/.cli-liv-reste existants) et côté DCT (écran
Départ, mêmes teintes que les badges existants de `_depBadgeLivraison`
et la pastille "facture regroupée"). Pour rester lisibles sur une carte
désormais colorée, le badge de statut et le bouton "Facture" (mêmes
teintes de base que les deux cartes) passent en fond blanc — nouveau
3ᵉ paramètre `fondBlanc` sur `_depBadgeLivraison`, optionnel, les 3
autres appels (facture, kv) restent inchangés en fond blanc de toute
façon.

**21/10, v3.99.61 — délai de 48h + frais de gardiennage dans le
message d'arrivée.** Cobey, sur le message WhatsApp d'arrivée (retrait
au dépôt) : « ajoute le fait qu'ils ont 48h pour venir chercher leurs
colis, sinon des frais de gardiennage seront appliqués. » Puis, sur le
choix du mot (l'écran de suivi public utilisait déjà "frais de
stationnement" pour le même avertissement) : « gardiennage c'est
mieux. » `_depTexteMessageArriveeExpediteur` ajoute la phrase (retrait
uniquement — un client en livraison ne vient pas chercher son colis),
avec le même délai "48h ouvrées" déjà en vigueur sur le suivi public.
Et "stationnement" → "gardiennage" aligné aux 2 endroits qui
l'utilisaient (`fac-suivi-alerte`, departs.js ET sa copie dans
facture.html).

**21/10, v3.99.62 — demander un avis client une fois le colis remis.**
Cobey : « pour chaque client dont le statut est passé en délivré, on
voudrait un système de message WhatsApp ou copier [...] ce message lui
demandera de donner un avis sur son expérience avec Dakar City
Transport. » Discuté avant de coder (message sans tirets, plus
humain ; parti à l'expéditeur, pas au destinataire ; juste une réponse
WhatsApp, pas de lien Google pour l'instant — pas encore de page).
Puis, sa propre remarque : « le bouton prévenir peut disparaître une
fois que le colis est remis, nan ? » — effectivement, une fois
remisAuClient posé, prévenir que le container est arrivé n'a plus
d'objet. Ajouté `depDemanderAvisExpediteur`/`depCopierAvisExpediteur`
(même mécanique que "Prévenir (arrivé)" : champ dédié `avisDemande`,
historique, bouton qui change une fois fait) : sur la carte client de
l'écran Départ, "💬 Prévenir (arrivé)" / "📋 Copier" restent affichés
tant que le client n'est pas remis, remplacés par "⭐ Demander un
avis" / "📋 Copier" une fois qu'il l'est.

**22/10, v3.99.63 — trouvé la vraie cause de la lenteur persistante
en France & Europe (et parfois en Collecte).** Cobey : « t'as toujours
de grosses lenteurs quand je vais dans la partie France Europe, et même
dans la partie Collecte aussi par moment, recherche bien la raison. »
Cause trouvée : `_franceRedessinerSiLibre` (la fonction qui redessine
l'écran après chaque écriture sur le nœud `france/` Firebase)
appelait `renderFrance()` SANS AUCUNE garde d'écran actif —
contrairement aux 3 autres blocs juste à côté dans la même fonction
(s-partenaire/s-collecte/s-camion, eux bien gardés) et au même principe
déjà appliqué côté Collecte depuis la v3.78.0
(`_dctRedessinerEcranActif`, qui ne redessine que l'écran réellement
affiché). Résultat concret : CHAQUE écriture n'importe où dans `france/`
par N'IMPORTE QUEL collaborateur (un versement, une validation, un
horodatage Waze...) reconstruisait tout l'écran France & Europe — liste
de clients comprise, potentiellement longue — sur CHAQUE appareil
connecté, même ceux restés sur un tout autre écran. Ce travail bloque
le fil principal de l'appli le temps de tourner, ce qui explique le
ralentissement ressenti même en pleine utilisation de Collecte, "par
moment" (au hasard des écritures des autres). Corrigé : `renderFrance()`
ne tourne plus désormais que si `s-france` est vraiment l'écran affiché
— exactement la même garde que les 3 blocs voisins.

**22/10, v3.99.64 (departs.js v2.21.0) — Bilan d'un container.**
Cobey : « je veux un bilan par container [...] dans les départs [...]
visible uniquement par Issyaka, Abdoulaye et moi », avec « qui a ramené
combien, qui a travaillé, quand, qui a été absent, les dépenses », puis
« les montants encaissés en virement et en espèces, pareil pour les
livraisons, le détail des frais de déplacement [...] des graphiques
(camembert, courbe, barres) » et un export PDF. Maquette validée avant
de coder. Nouveau bouton "📊 Bilan de ce container" sur l'écran Départ
(même règle d'accès que Rapport financier : `estDirection()` — IS, AB,
AD), qui ouvre l'écran `s-dep-bilan` : caisse colis et caisse livraison
avec camembert espèces / virement / non précisé, courbe de l'encaissé
cumulé, dépenses par poste (Mali : taxe prestataire), frais de
déplacement par collecte France & Europe, résultat (même calcul que
`_depResultatColis`), qui a travaillé dessus (clients apportés,
encaissé par mode, durée de tournée et jours de collecte repris de
`_depStatsCalculer` en mode conteneur — Mamadou Niass compris, il
encaisse à Dakar), présences collecte par collecte croisées avec le
Planning (présent / absent / absent d'office / pas de réponse), clients
soldés et relances, délai moyen collecte → remis, avis demandés,
répartition géographique, durée de chaque étape du trajet, comparaison
avec le container précédent du même pays. Export PDF via
`depGenererPDFParBlocs` (un bloc jamais coupé entre deux pages).
"Photos manquantes", prévu dans la maquette, n'a PAS été ajouté : le
repère des photos sur la fiche peut mentir (voir v2.20.10,
`_depChargerPhotosFiche`), et le compter juste demanderait de lire
toutes les photos de chaque client dans Firebase — trop lourd.

**22/10, v3.99.65 (departs.js v2.21.1) — Planning : jours exceptionnels et
disponibilités d'Eric.** Cobey : « ajoute-moi aussi pour mettre mes
disponibilités, parce que maintenant je vais essayer de les aider [...]
tu rajoutes une case jour exceptionnel [...] pour les ramassages
France-Europe, un jour exceptionnel pour demander qui est disponible à
Bordeaux ou à Lyon », puis « pas de délai automatique » et « oui, les
jours exceptionnels doivent compter » (bilan d'un container), « Aminata
doit l'avoir aussi » (le bouton). **Jour exceptionnel** : bouton
« + Jour exceptionnel » en haut du Planning (Direction + Aminata, comme
la relance), avec une date (n'importe quel jour sauf un dimanche déjà au
planning), un motif (« Tournée Bordeaux ») et les personnes à qui on
demande (équipe fixe cochée d'office, Eric/Aminata cochables). Méta dans
`dct_planning_jours/<date>`, réponses dans `dct_planning/<date>/<id>` comme
un dimanche — donc relance, corrections par l'admin et intervenants
ponctuels marchent tels quels. Jamais de verrou du jeudi 22h ni d'absence
d'office (le Worker Cloudflare ne parcourt que les dimanches). Les
personnes cochées reçoivent la notification Planning ; un jour passé
quitte la liste mais reste en base (le bilan en a besoin) ; suppression
possible depuis « Modifier ce jour ». **Eric** retrouve l'onglet « Mes
disponibilités » (`DEP_IDS_PLANNING_VOLONTAIRES`) sans entrer dans
`_depGensPlanning` — sinon il serait relancé et marqué absent d'office
chaque dimanche ; ses réponses apparaissent dans « L'équipe ». Aminata a
l'onglet dès qu'un jour exceptionnel la vise. **Bilan d'un container** :
le tableau des présences ajoute les tournées France & Europe tombant un
jour exceptionnel (colonne marquée « except. »), « – » pour qui n'est
pas concerné ce jour-là. À noter : la nouvelle branche Firebase
`dct_planning_jours` doit être autorisée en écriture par les règles de la
base (comme `dct_planning`) — sinon « Échec, réessayez ».

**22/10, v3.99.66 (departs.js v2.21.2) — Planning : jour de chargement et
collectes France & Europe lus automatiquement.** Cobey : « dimanche 25,
c'est la collecte mais c'est aussi le jour de chargement [...] le planning
lira automatiquement quels jours sont les chargements », précisé : « le
jour de chargement, c'est le jour de départ, c'est exactement la même
chose ». Puis : « la même chose avec les collectes France-Europe [...]
quand on crée une collecte, le planning lit qu'il y a une collecte et met
un planning en adéquation » — « tout le monde peut répondre, comme
maintenant » et « pas besoin de notif » (la collecte bouge parfois
avant de se valider). `_depPlanningJours` relit à chaque affichage
`franceData.collectes` (jour de plus si la date n'est pas déjà au
Planning, pastille « 🇪🇺 COLLECTE FRANCE & EUROPE » + nom sinon) et
`departsData` (pastille « 📦 CHARGEMENT » + nom du container sur sa date
de départ, containers clos exclus ; plusieurs containers le même jour =
plusieurs noms). Aucune donnée stockée : changer une date, renommer ou
supprimer une collecte suit tout seul. Mêmes règles qu'un dimanche pour
les réponses (équipe fixe + volontaires), mais jamais de verrou du jeudi
22h hors dimanche (`_depPlEstDimanche`). Bilan d'un container : une
tournée France & Europe hors dimanche compte dans les présences si le
Planning a au moins une réponse ce jour-là (les anciennes collectes,
sans réponse, n'afficheraient que des « ? »).

**22/10, v3.99.67 — créer une tournée France & Europe sans date.** Cobey :
« pour les tournées France-Europe, il faudrait avoir la possibilité de
créer la tournée sans forcément mettre de date au début. Et une fois
qu'on a bien organisé la tournée, là on met une date. Les tournées
France-Europe, c'est complexe à organiser. » Le formulaire « Nouvelle
collecte » accepte désormais une date vide (bouton « Pas encore de date »),
à condition de donner un nom — sans nom, la tournée serait introuvable
dans la liste. Une tournée sans date (`dateIso` vide, `dateLib` = « date à
fixer ») apparaît dans une section « À organiser · date à fixer » de la
liste des collectes, badge « À organiser », avec « 📅 Date à fixer » ; on
enchaîne comme d'habitude sur le choix des clients et des camions. La
date se renseigne plus tard par le ✏️ de la carte (déjà existant) : la
tournée passe alors dans « En cours »/« À venir » selon sa semaine, et
entre toute seule au Planning (qui ignore les collectes sans date). Le
refus d'une deuxième collecte à la même date est inchangé.

**22/10, v3.99.68 (departs.js v2.21.3) — Planning : bandeau de chargement, plus
de « Jour exceptionnel », retrait de la date d'une collecte France.**
Cobey, captures d'écran à l'appui : « j'ai essayé de retirer la date, ça
ne marche pas » — `changerDateCollecteFr` refusait un champ vide
(« Veuillez sélectionner une date ») ; vide veut maintenant dire « retirer
la date » : la tournée repasse en « À organiser » (statut « À venir », sauf
si elle est terminée) et quitte le Planning. « Pour jour exceptionnel [...]
tu peux retirer, vu que c'est en adéquation avec les collectes » :
bouton, formulaire, notification, suppression, branche Firebase
`dct_planning_jours` et tout le code associé retirés — les collectes
France & Europe font déjà entrer leurs jours au Planning. « La mention de
chargement, c'est pas assez lisible [...] mettre la mention jour de
chargement vers Dakar en majuscule » : la petite pastille devient un
bandeau jaune pleine largeur « 📦 JOUR DE CHARGEMENT VERS DAKAR » avec le
nom du container dessous (« VERS BAMAKO » pour un container du Mali).
Corrigé au passage : une collecte France hors dimanche affichait à tort
« Dernier délai : jeudi 22h » (le verrou, lui, était bien désactivé).
Si un jour exceptionnel avait été créé en base pendant l'essai, il est
simplement ignoré.

**22/10, v3.99.69 (departs.js v2.21.4) — « retour » depuis le Dépôt Dakar
(case Stockage).** Cobey : « quand je vais dans la case Stockage et que je
regarde le stock de Dakar, quand je clique sur un client, je vois ces
infos, mais quand j'appuie sur retour, je me retrouve dans le conteneur de
la case Départ. Je t'avais dit pour chaque bouton retour de revenir à la
page précédente de son interface. » Cause : la liste du Dépôt Dakar
ouvrait la fiche, la facture et le formulaire du client avec les mêmes
fonctions que l'écran Départ, dont le « retour » est figé sur
`depDetail(_depDetailId)` — le dernier container ouvert dans Départs, sans
rapport avec cette liste. Nouveau paramètre `viaDakar` (fiche collecte,
fiche et formulaire dépôt direct, fiche France via `_depFicheFranceRetour`
type « dakar », facture, facture France, écran Documents, bouton
« Enregistrer » de la fiche native) : tous ramènent à « ← Dépôt Dakar ».
Mitry (Stockage > Mitry) revenait déjà à sa propre liste (vérifié) ; seul
son libellé « ← Départ » sur la facture devient « ← Mitry ».

**22/10, v3.99.70 (departs.js v2.21.5) — Dépôt Dakar : seulement les colis
encore au dépôt.** Cobey : « il ne doit rester que les colis qui sont
présents dans le stock. Le but de cette case est de savoir quel colis est
encore dans le dépôt. Ceux qui ne sont plus là, ça ne sert à rien de les
laisser dedans. » Un colis dont la livraison est validée
(`livraisonValidee.fait`) disparaît de la liste Stockage > Dépôt Dakar ;
le compteur « À livrer » ne compte plus que ce qui reste (il est
désormais égal à < 48H + Gardiennage + 60J+, et à celui de l'écran
Stockage). Le client reste évidemment consultable depuis son container.

**22/10, v3.99.71 (departs.js v2.21.6) — Dépôt Dakar : tous les clients non
remis + tarif et paiement.** Cobey : « il reste 70 clients qui n'ont pas
encore récupéré leur colis, mais dans le stockage je vois 12 colis [...]
théoriquement ça ne devrait pas être le même chiffre » puis « tu peux
également mettre le tarif, voir s'ils ont payé ou pas, si ça a été soldé ou
pas, comme ça on a une visio rapide ». Cause : `_depListeDepotDakar` ne
retenait que les clients avec livraison à Dakar (`livraisonDakar`) ; les
clients qui viennent chercher leur colis (retrait) n'y étaient pas, alors
que ce sont eux que concerne le gardiennage 48h. Désormais tous les clients
d'un container « Arrivé » y figurent jusqu'à ce qu'ils soient remis
(`_depColisRemis` : `livraisonValidee.fait` ou `remisAuClient`), avec une
pastille « 🚚 Livraison » / « 🏪 Retrait » et l'état de paiement (soldé /
reste X € sur Y € / non payé, colis + livraison, comme le badge de la
facture). Récap : « au dépôt », « X soldés sur N », total encore à
encaisser. Les cartes orange du container utilisent la même règle, donc
même chiffre des deux côtés. Écran Stockage : « N clients encore au dépôt ».

**22/10, v3.99.72 (departs.js v2.21.7) — Planning : Eric listé sur tous les
jours.** Cobey : « pourquoi j'apparais pas sur les autres dates ? Je suis
que sur les premières dates. » Cause : Eric n'est pas dans l'équipe fixe, il
n'était donc listé dans « L'équipe » que les jours où il avait déjà
répondu (`_depGensPourJour`). L'onglet « L'équipe » ajoute maintenant les
volontaires (`DEP_IDS_PLANNING_VOLONTAIRES`) sur chaque jour, en « rien
mis » tant qu'il n'a pas répondu. Il reste hors des compteurs « sans
réponse », des relances et du Bilan (`_depGensPourJour` n'est pas modifiée).

**22/10, mamadou.html v1.14.9 — Dépôt Dakar de Mamadou + retour vers DCT.**
Cobey : « côté Mamadou Niass, on a le même problème que côté DCT pour le
stockage : il ne montre que les personnes qui restent livrées, et tout en
bas ceux qui ont récupéré leur colis sont affichés. Il faut refaire la
même chose. » Même correction que v3.99.70/71 : tous les clients d'un
container arrivé (livraison + retrait, pastille 🚚/🏪), ceux déjà remis ou
livrés (`livraisonValidee.fait` ou `remisAuClient`) disparaissent. Compteur
« N clients encore au dépôt » (il affichait « &agrave; » en toutes lettres :
`textContent` → `innerHTML`). Paiement, d'après Cobey : « soldé, pas besoin
de mettre le prix ; pour ceux qui restent à payer, le prix » et, avec
livraison, « le détail, manque colis et manque livraison » : ✅ Soldé /
« Reste 60 € » (retrait) / « Reste colis : 40 € · Reste livraison : 15 € » /
« Non payé · colis X € · livraison Y € » si rien n'est payé.
Retour : « quand DCT va dans l'interface de Mamadou on ne peut pas revenir
[...] seulement l'accueil ça suffit » → bouton « ← Retour à DCT » en haut
de l'accueil de Mamadou, visible uniquement avec l'accès Direction
(`?direction=`) ; il ferme l'onglet, sinon renvoie vers dct-app.html.
Non testé sur iPhone (fermeture d'onglet dépend du navigateur).

**22/10, mamadou.html v1.14.10 — fiches regroupées comptées en double chez
Mamadou.** Cobey : « pourquoi Mamadou a 60 clients au dépôt et nous on en a
58 ? » Côté DCT, une fiche absorbée par une autre (`fusionneeDans`, bouton
Regrouper) ne compte plus nulle part ; mamadou.html n'en tenait pas compte
et la listait en plus (2 fiches regroupées = l'écart de 2). Désormais
`clientsDuContainer` ignore ces fiches : Dépôt Dakar, liste des containers,
compteurs et totaux livraison de Mamadou suivent la même règle que DCT.

**22/10, mamadou.html v1.14.11 — date d'arrivée sur chaque client du Dépôt
Dakar de Mamadou.** Cobey : « il faudrait qu'il ait la date pour chaque
client du conteneur auquel il est arrivé. Là on voit Chargement DKR, mais
pas plus d'infos [...] on sait depuis quand il est là. » Chaque carte
affiche « 📦 Arrivé au dépôt le 20/10 à 14h46 » (étape « Arrivée au dépôt »
du container, `_mnDateHeureCourte`), « date inconnue » si l'étape n'a pas
d'horodatage.

**22/10, v3.99.73 (departs.js v2.21.8) — latence au retour dans l'appli :
redessins regroupés.** Cobey : « l'appli a beaucoup de latence [...] je suis
allé sur Mamadou, je suis revenu sur l'appli, je clique sur des cases, ça
ne répond pas ou ça met du temps. » Constat (profil sur un jeu de ~720
clients, CPU ralenti) : au retour, ~15 écoutes Firebase répondent coup sur
coup et chacune redessinait aussitôt l'écran affiché (accueil des espaces,
liste des départs, Planning, container ouvert) — redessins complets
enchaînés, et un redessin sous le doigt détruit le bouton touché. Nouveau
`_depRedessinerDiffere(cle, idEcran, fn)` : un seul redessin par écran,
250 ms après la dernière réponse, jamais pendant qu'un doigt est posé
(`_dctDoigtPose`, même garde que Collecte et France & Europe), et rien si
l'écran n'est plus affiché. 12 réponses de suite → 1 redessin (testé).
Appliqué à : accueil des espaces (5 écoutes), Planning (2), liste des
départs, détail d'un container (écoute dépôt). Non prouvé sur le vrai
téléphone : si la latence revient, il faudra un relevé réel (voir échange).

**22/10, v3.99.74 (departs.js v2.21.9) — Relevé de lenteur (Réglages >
Outils).** Cobey : « oui fais ça » (après « l'appli a beaucoup de latence [...]
tu n'arrives pas à trouver le problème »). La latence ne se reproduit pas
hors du téléphone ; l'appli note désormais elle-même, dans le téléphone
(rien n'est envoyé), les 80 derniers événements : réponses d'écoute
Firebase de plus de 40 ms (nom de la donnée, nombre d'éléments, écran),
« pauses » de plus de 300 ms avec l'écran et les écoutes qui venaient de
répondre, appuis de plus de 150 ms (bouton touché), passages en
arrière-plan / retours, et chaque démarrage de page avec son type
(`navigate` / `reload` / `back_forward` : permet de voir si l'appli est
rechargée en entier au retour de la page de Mamadou). Lecture, copie et
effacement dans Réglages > Outils > « Relevé de lenteur ». Le chronométrage
enveloppe `Query.prototype.on` sans toucher aux données (callback d'origine
inchangé). Non vérifié avec le vrai SDK Firebase (indisponible ici : testé
avec un faux).

**22/10, v3.99.75 (departs.js v2.21.10) — Relevé de lenteur : minuteurs,
affichages et gros JSON chronométrés.** Premier relevé réel de Cobey
(v3.99.74) : toutes les pauses (de 1,5 s à 13,5 s) et appuis lents (jusqu'à
21 s) tombent sur l'écran **France & Europe** (onglet Collectes, filtre
région, ouverture d'une fiche, bouton « Prêt »), alors qu'aucune écoute
Firebase n'est en cause (toutes ≤ 28 ms, /france : 4 ms). Le blocage vient
donc de code déclenché après coup (minuteur, redessin) ou d'un traitement
lourd, pas de la réception des données. Le relevé note maintenant aussi :
les minuteurs (`setTimeout`) de plus de 100 ms, les fonctions d'affichage
principales (France, Collecte, fiches, container) de plus de 80 ms, les
`JSON.parse` / `JSON.stringify` de plus de 40 ms avec leur taille en Ko.
Prochaine étape : nouveau relevé à la prochaine lenteur en France & Europe.

**22/10, v3.99.76 (departs.js v2.21.11) — Relevé de lenteur : poids de la
page et des données.** 2e relevé de Cobey (v3.99.75) : toujours des pauses de
~1,8 s en boucle (jusqu'à 13 s) sur France & Europe, mais AUCUN minuteur
> 100 ms, AUCUNE fonction d'affichage > 80 ms, AUCUN JSON > 40 ms, aucune
écoute lente. Le blocage ne vient donc pas du JavaScript de l'appli
mesurable ici : il est dans le rendu natif (mise en page / dessin d'une page
trop lourde) ou dans le traitement interne du SDK Firebase. Le relevé donne
maintenant, à l'ouverture : nombre d'éléments de la page et des 5 plus gros
écrans, images intégrées (nombre, Ko), poids en Ko de chaque jeu de données
(franceData, clientsParCollecte…), fiche France la plus lourde et médiane ;
chaque « pause » note aussi le nombre d'éléments de la page.

**22/10, v3.99.77 (departs.js v2.21.12) — Relevé : stockage du raccourci.**
Cobey : « quand je vais sur le site depuis Safari ou depuis mon ordinateur,
il n'y a pas de lenteur. C'est que sur le raccourci. J'avais supprimé le
raccourci, ça avait été réglé, mais c'est revenu. » Indice décisif : seul le
raccourci de l'écran d'accueil rame. Il a son propre stockage (séparé de
Safari) et seul lui exécute le code des notifications (service worker,
abonnement push). `sauvegarder()` y recopie en synchrone les collectes, tous
les clients, le dispatch, l'activité et les contacts dans localStorage
(`dct_v3_*`). Le relevé chronomètre désormais chaque lecture/écriture du
stockage local de plus de 30 ms (clé et taille) et affiche : taille totale
du stockage local et des 5 plus grosses clés (quota iOS ≈ 5 Mo), mode
(raccourci / navigateur), espace utilisé par l'appli, caches du navigateur,
services en arrière-plan, bases locales. Pas de correctif tant que la cause
n'est pas confirmée par un relevé pris dans le raccourci.

**22/10, v3.99.78 — Fil d'Activité plafonné à 150 lignes (piste n°1 de la
lenteur du raccourci).** Relevé de lenteur de Cobey (v3.99.77, raccourci
écran d'accueil) : page de **18 950 éléments** dont **16 170 dans le seul
écran Activité**, et `dct_v3_activite` = **1 681 Ko** dans le stockage du
téléphone (sur ~2 480 Ko au total) ; données métier, elles, minuscules
(clients France 36 Ko, 28 fiches). Aucune écoute, minuteur, fonction ou
JSON lent. Cause probable : le fil d'Activité accumulait des milliers de
lignes — `_chargerEtAfficherActivite` relisait TOUT `activite_items`,
`afficherConnexionsAdmin` TOUTES les connexions, `sauvegarder()` recopiait
tout le fil (`innerHTML`) dans localStorage et le restaurait au login. Le
raccourci ayant son stockage propre (qui se remplit avec le temps), ça
explique « seulement sur le raccourci » et « supprimer le raccourci avait
réglé, puis c'est revenu ». Correctif : plafond `ACTIVITE_MAX_AFFICHEE =
150` (affichage, ajout, connexions admin, vieux bloc `data.activite`),
requêtes en `limitToLast` (300 événements, 100 connexions), 40 lignes
seulement dans le stockage du téléphone, et un ancien fil > 120 Ko est jeté
au login (Firebase redonne les récents). Testé : 4 000 événements → 150
affichés, stockage 8 Ko. Non prouvé comme cause unique : un test Chrome avec
16 000 éléments cachés ne ralentit pas France ; WebKit iPhone peut réagir
différemment. À confirmer par un nouveau relevé depuis le raccourci.

**22/10, v3.99.79 (departs.js v2.21.13) — France seulement + outil « Clients
proches ».** Cobey : « pour France-Europe, on va enlever Europe et tout ce
qui concerne les autres pays, on se concentre sur la France » puis « je
veux que tu nous aides à voir les clients proches [...] ça peut être 1
heure, voire 1h30 maximum de trajet [...] il faut aussi prendre en compte
les kilomètres [...] fais l'estimation en kilomètres par rapport au temps
[...] prêt ou pas prêt, non, ça c'est à part [...] minimum 3 clients par
tournée [...] les heures, on ne prend pas en compte, ça sera à part. »
1) Libellés : « France & Europe » devient « France » (cases, en-têtes,
badges, toasts), drapeau 🇫🇷 ; le choix du pays disparaît du formulaire
d'inscription (il ne reste que pour modifier une ancienne fiche déjà
enregistrée dans un autre pays — aucune donnée supprimée). Le texte des
CGV (« entre le Sénégal, la France et l'Europe ») est volontairement
inchangé (texte contractuel). 2) Nouvel écran `s-fr-proches` (bouton « 🧭
Clients proches » en haut de la liste France > Clients) : prend les
clients « En attente » (pas les planifiés), les localise (cache lat/lng sur
la fiche), forme des groupes autour d'un centre : un client est dans le
groupe s'il est à ≤ N minutes de route du centre (curseur 30 min – 1h30,
1h par défaut). Première passe à vol d'oiseau (×1,1 min/km), puis OSRM
`table` pour le vrai temps ET les vrais km de chaque client depuis le
centre (« ≈ » si OSRM indisponible). Chaque groupe : « Autour de <ville du
centre> », nb clients/colis/montant, jusqu'à X min · Y km du centre, ✅ à
partir de 3 clients, 🟠 « il en manque N » sinon ; clients isolés listés à
part ; clients sans adresse localisable signalés. Bouton « Créer la
tournée avec ces N clients » : sélectionne les clients dans la liste France
(même parcours que « Mettre dans un camion »). « Prêt / pas prêt » et les
horaires ne sont pas pris en compte. Testé avec faux OSRM (pas de réseau
ici) : à vérifier en vrai avec les adresses réelles.

**22/10, v3.99.80 — « Clients proches » refait en CARTE.** Cobey : « c'est
une interface pas facile à comprendre. Moi je voulais une interface avec
une carte où les pôles sont visibles via des couleurs différentes, où on
verrait les clients sur la carte proches les uns des autres, que les
régions où les pôles soient distinctes. » La liste de v3.99.79 est
remplacée : carte France (Leaflet/OSM) en haut, un pôle = une couleur
(cercle teinté dont le rayon couvre ses clients, pastille avec le nombre de
clients et le nom de la ville, points de la même couleur pour ses clients) ;
plein = au moins 3 clients (✅), vide en pointillés = il en manque (🟠),
points gris = clients isolés. Dessous, une ligne de pastilles de couleur
(une par pôle) : toucher un pôle (carte ou pastille) zoome dessus et ouvre
le détail (clients, minutes, km depuis le centre, colis, montant, bouton
« Créer la tournée »). Le curseur 30 min – 1h30 reste en haut, tout se
recalcule. Calcul inchangé (OSRM, 3 clients minimum, clients « En
attente »). Testé avec faux OSRM et Leaflet local ; rendu vérifié par
capture. À valider avec les vraies adresses.

**22/10, v3.99.81 (departs.js v2.21.14) — dernier « Europe » visible.** Cobey :
« il y a toujours le titre France et Europe dans la case. » Le titre de la
case sur l'écran d'accueil des espaces (« FRANCE &amp; EUROPE », en
majuscules, donc raté par le remplacement de la v3.99.79 qui cherchait
« Europe » avec la casse) et la pastille « COLLECTE FRANCE & EUROPE » du
Planning deviennent « FRANCE » / « COLLECTE FRANCE ». Contrôle fait sur
toute la page (texte, titres, placeholders) : plus aucun « Europe » visible.
Texte des CGV inchangé volontairement.

**23/10, v3.99.82 (departs.js v2.21.15) — Jours exceptionnels dans le
Planning + prénoms des personnes disponibles sur les cartes de collecte.**
Cobey : « est-ce que c'est possible qu'à côté de chaque collecte, on puisse
voir les personnes qui ont répondu présent dans le planning [...] je veux
plutôt les vrais prénoms » ; « rajoute les jours exceptionnels dans le
planning : si quelqu'un fait un jour exceptionnel, il y a un endroit pour
répondre si on est présent ou pas » ; « pour France Europe, tu mets pareil,
la ligne avec les prénoms » ; « ok » (toute l'équipe terrain peut répondre).
1) `_depIsoDeCollecte` lit le libellé d'une collecte de Dakar (« Samedi 24
octobre 2026 ») ; `_depPlanningJours` ajoute tout seul chaque collecte à
venir non terminée absente des dimanches (pastille « 📦 COLLECTE » sur les
jours hors dimanche) : on y répond comme un dimanche (« Mes disponibilités »
et « L'équipe »), jamais de verrou du jeudi 22 h ni d'absence d'office
(dimanches seulement), pas de notification. Le Planning se redessine quand
les collectes changent. 2) `window._depLigneDisposJour(iso)` : ligne « 🟢
Issyaka · Samba · Ibrahima » (prénoms des « Disponible »), « Personne de
disponible pour l'instant » si tous ont répondu non, « Pas encore de
réponses » sinon ; rien pour un jour passé, une collecte terminée ou une
collecte France sans date. Affichée sous chaque carte de la Collecte et de
France > Collectes ; les cartes se mettent à jour quand le Planning change.
Les « Pas dispo » ne sont pas montrés.

**23/10, v3.99.83 (departs.js v2.21.16) — ligne des disponibles plus soignée.**
Cobey : « l'affichage n'est pas très esthétique » (la ligne de prénoms
collée au bord de la carte, sans marge, avec un gros rond vert). Elle devient
un bandeau en bas de la carte, séparé par un filet, aligné sur les marges de
la carte (14 px) : libellé « DISPONIBLES » en petit gris, puis un prénom par
pastille verte ; « personne pour l'instant » en pastille rouge pâle, « pas
encore de réponses » en pastille grise. Même rendu en Collecte et en France.

**24/10, v3.99.84 — Dispatch allégé (Collecte et France).** Cobey : « ici
aussi, je trouve que c'est trop surchargé de boutons [...] le bouton valider
le dispatch, je crois qu'il sert à rien » puis, après l'aperçu, « vas-y
fait ». Vérifié : « Valider le dispatch » ne posait qu'un drapeau
`dispatchValide` (badge « ✅ Dispatch validé » sur la carte + ligne
d'Activité), rien n'en dépendait. Retiré, avec le badge. Nouvel écran :
une seule carte en haut (Facturé / Collecté / barre + bloc « Affectés à un
camion x / n » avec avertissement « N clients sans camion · M sans heure »,
vert « ✅ Tout le monde est affecté, avec une heure » ; en France
l'avertissement ouvre toujours la liste pour affecter), un seul gros bouton
« 🗺️ Organiser sur la carte » (France : + « 👥 Choisir les clients de la
collecte »), puis « CAMIONS » avec un bouton « ＋ Ajouter ▾ » qui ouvre une
fenêtre : 🚛 Un camion DCT / 🚚 Un chauffeur externe (mêmes fonctions
qu'avant : addTruck, depOuvrirNouveauCamionExterne, et leurs équivalents
France). Les trois compteurs Total/Affectés/Restants et les boutons du bas
(Ajouter un camion, Chauffeur externe, Valider, Carte) disparaissent ; les
bandeaux « chauffeur externe » au-dessus des camions restent. Fonctions
`validerDispatch*` laissées en place, devenues inutilisées.

**24/10, v3.99.85 (departs.js v2.21.17) — France : le Suivi passe sur la page
d'avant.** Cobey : « le bouton Suivi doit être dans la page d'avant, comme
dans le parcours Collecte. » Dans la Collecte, Suivi est à l'accueil (à côté
d'Accueil) et, dans une collecte, il n'y a que Clients et Dispatch. France
faisait l'inverse (v2.20.11 : Suivi seulement dans une collecte ouverte).
Désormais : page des collectes = Clients | Collectes | Suivi ; collecte
ouverte = Clients | Dispatch. Le Suivi n'exige plus de collecte ouverte : il
montre la collecte en cours (`_frCollecteActive`, comme avant quand rien
n'est ouvert) ; sans collecte en cours : « Aucune collecte en cours ».
Limite connue : si deux collectes France sont « en cours » en même temps,
le Suivi montre la première (pas encore de sélecteur de collecte comme côté
Collecte).

**24/10, mamadou.html v1.15.1 + v3.99.86 (departs.js v2.21.18) — colis
encaissés par Mamadou, en FCFA et en euros.** Cobey : « Mamadou nous a dit
qu'il ne voyait pas le montant total de ce qu'il avait récupéré en espèces
pour les colis [...] on a pas le récap pour les colis que les clients n'ont
pas payé avant et qui ont payé là-bas » ; « il prend aucun paiement en
virement, que des espèces » ; « il faut vraiment toujours séparer livraison
et colis » (donc pas de total mélangé sur son accueil) ; « 2 ok » (même
récap côté DCT) ; « le montant en francs CFA et en euros, je crois qu'il
encaisse que en francs CFA, mais je suis pas sûr ». Mamadou : nouveau bloc
« 📦 Colis — encaissé à Dakar » sous le bloc livraison de chaque container :
encaissé par Mamadou (espèces) = somme des `versements` dont `par` est
« Mamadou Niass », nombre de clients concernés, restant à payer (colis) ; les
montants en FCFA (arrondi au millier, comme partout) puis en €. Le bouton
« Virement » disparaît de son écran d'encaissement. DCT : sous « COLIS » de la
caisse du container (Rapport financier) : « dont encaissé à Dakar par
Mamadou : X FCFA · Y € (N clients, espèces) » (`compteursDepart`:
colisMamadou / colisMamadouNb). Le bloc livraison n'est pas modifié (pas de
CFA ajouté : à voir si utile).

**24/10, mamadou.html v1.16.0 + v3.99.87 (departs.js v2.21.19) — prix en
FCFA et en € côte à côte.** Cobey : « il faudrait mettre à côté du prix en
euros le prix en CFA, et en total aussi, parce que lui là-bas il aura des
francs CFA » ; « CFA pour lui d'abord » ; « pareil côté DCT, mais euros
d'abord ». Mamadou : `mnMontantHtml(eur)` → « <b>98 000 FCFA</b> · 150 € »
(arrondi au millier, comme partout) sur les cartes client du container
(reste à payer, livraison), les pastilles du Dépôt Dakar (reste colis /
reste livraison / non payé, gardiennage), la fiche client (statuts,
« reste à payer », « Encaisser — reste ») et les totaux des deux blocs
(livraison : facturé, encaissé, dont DCT, dont Mamadou, restant ; colis :
encaissé, restant). Pour « Encaissé par Mamadou (colis) », le FCFA est le
montant EXACT tapé quand il a payé en FCFA (`v.montantFCFA`), sinon la
conversion du montant en euros au taux fixe. Livraison et colis restent
séparés, aucun total mélangé. DCT : `_depEurCfa(eur)` → « 150 € · ≈ 98 000
FCFA » sur les cartes client du container (Départ), sous PAYÉ / RESTE DÛ de
la caisse du container, dans le Dépôt Dakar (pastilles et « encore à
encaisser ») et sur la ligne « encaissé à Dakar par Mamadou ».

**24/10, mamadou.html v1.16.1 + v3.99.88 (departs.js v2.21.20) — bloc colis
sans « restant », montants lisibles, une couleur par monnaie.** Cobey : « pour
les colis (pas les livraisons), on va enlever les restants à payer : les
clients vont peut-être payer en virement ou en espèces, ce n'est pas dit que
ce total soit ce qu'il va récupérer » ; « fais une distinction, une couleur
entre le montant en francs CFA et le montant en euros ». 1) Bloc « Colis —
encaissé à Dakar » : ligne « Restant à payer (colis) » retirée (reste :
encaissé par Mamadou en espèces + clients concernés) ; le bloc livraison
garde son restant. 2) Totaux des blocs sur deux lignes alignées à droite
(`mnMontantBloc` : CFA au-dessus, euros dessous) au lieu de se couper sur
trois lignes. 3) Couleurs — Mamadou : CFA vert foncé gras, euros bleu marine
plus petit ; pour un reste à payer : CFA rouge foncé, euros rouge clair
(classes `.m-cfa`, `.m-eur`, `.rouge`). DCT (`_depEurCfa`) : euros bleu marine
gras, CFA vert plus petit ; en rouge : euros rouge foncé, CFA rouge clair ;
tuiles PAYÉ / RESTE DÛ de la caisse du container idem.

**24/10, mamadou.html v1.16.2 — le montant ne déborde plus.** Cobey : « ça
déborde les prix » (bloc « Colis — encaissé à Dakar » : « 1 878 005 FCFA »
sortait du cadre). Cause : le libellé « Encaissé par Mamadou (espèces) »
ne pouvait pas rétrécir (`.kv .k{flex-shrink:0}`) et poussait le montant
hors de la boîte. Le libellé passe sur deux lignes (« Encaissé par
Mamadou » / « (espèces) ») et peut rétrécir ; `.kv .v` reçoit `min-width:0`
et `max-width:100%`. Vérifié à 390 px de large avec 3 756 010 FCFA.

**24/10, chauffeur.html v1.7.0 — observations visibles chez le chauffeur
externe.** Issyaka (message relayé par Cobey, avec capture de la page
chauffeur) : « dernière petite chose, si on peut voir les observations chez
le chauffeur externe ». La page chauffeur charge déjà toute la fiche client
(`france/clients/<id>` ou `dct/clients/<collecte>/<id>`) : on affiche sous
la ligne du colis un encart ambre « ⚠️ <observation> » — une ligne par
observation de `c.observations[]` (texte libre noté sur la fiche : accès,
étage, horaire...), ou l'ancien champ unique `observationCollecte`. Rien
n'est affiché si le client n'a pas d'observation. Les fiches n'ont pas été
modifiées. Non couvert : l'arrêt « Chartres » (écran à part).

**24/10, chauffeur.html v1.7.2 — Observation en bouton, plus en encart.**
Cobey : « tu as mis l'observation direct. Tu aurais dû mettre un bouton
observation où il clique dessus et il voit, comme dans DCT, parce que s'il y
a beaucoup d'observations, il aura un écran trop long. » L'encart de la
v1.7.0 est retiré. Sur chaque client qui a des observations : une ligne
ambre pleine largeur « ⚠️ Observation (N) — voir » (sa propre ligne, au-dessus
d'Appeler / Waze : à trois côte à côte les libellés se coupaient). Un appui
ouvre une fenêtre en bas d'écran : une carte par observation (texte complet,
date et auteur quand ils existent), bouton « Fermer » ; fermeture aussi en
touchant le fond. Rien pour un client sans observation. Écran de tournée
inchangé en longueur, quel que soit le nombre d'observations.

**24/10, mamadou.html v1.17.0 — page « Mes encaissements ».** Cobey : « Mamadou
aimerait avoir le détail de ce qu'il a encaissé en colis, on voit six clients,
on voudrait savoir qui sont ces clients-là [...] ça va charger la page et les
clients seront tout en bas. Est-ce possible de mettre tout ce qui est
tarification dans un bouton qui amènera à une autre interface ? » ; « pour
Mamadou, pas besoin de voir tous les containers pour l'instant ». Les deux
blocs (livraison, colis) quittent l'écran du container, qui ne garde qu'un
bouton « 💰 Mes encaissements » (résumé : Colis X FCFA / Livraison Y FCFA,
toujours séparés) — la recherche, les filtres et les clients remontent. Le
bouton ouvre `ecran-encaissements` (retour « ← Retour au container ») avec
deux onglets : Colis (encaissé par Mamadou en espèces, nombre de clients, puis
liste des paiements : client, montant CFA exact + €, date/heure, plus récent
d'abord) et Livraison (bloc facturé / encaissé / dont DCT / dont Mamadou /
restant, puis liste des livraisons qu'il a encaissées). Un appui sur un
paiement ouvre la fiche du client ; « retour » revient sur cette page, mise à
jour. Limité au container ouvert. Rien côté DCT.

**24/10, mamadou.html v1.17.1 — lignes de « Mes encaissements » clairement
cliquables.** Cobey : « il faut que quand il clique sur le client, il puisse
se retrouver sur la page du client [...] j'avais pas vu vrai, ajoute ta
proposition ». Le clic ouvrait déjà la fiche (`ouvrirFiche`, retour vers
« Mes encaissements »), mais rien n'indiquait que les lignes se touchent. Ajout
d'une flèche « › », du texte « Voir la fiche » sous la date, et d'un fond vert
pâle à l'appui, dans les onglets Colis et Livraison ; montant et flèche
regroupés à droite.

**24/10, v3.99.89 (departs.js v2.21.21) — côté DCT, les prix repassent en
euros seulement.** Cobey : « tu peux remettre les prix comme avant ? Les CFA
côté DCT c'est pas la peine. » Retirés : le CFA sur les cartes client du
container (Départ), sous PAYÉ / RESTE DÛ de la caisse du container, dans le
Dépôt Dakar (pastilles, « encore à encaisser ») et sur la ligne « dont
encaissé à Dakar par Mamadou » ; helper `_depEurCfa` supprimé. Inchangé :
tout le CFA + € de mamadou.html (cartes, fiche, Dépôt Dakar, page Mes
encaissements).

**24/10, dct-app.html v3.99.90 / departs.js v2.21.22 — ligne de paiement sur
les cartes client du container.** Cobey : « il me semble avant on avait le prix
genre 100 euros payé sur 200 » puis « Ok fait ». Sous le prix et le téléphone
de chaque carte client d'un container (côté DCT, euros uniquement), une pastille
blanche à bord coloré : « ✅ Colis soldé » (vert), « 🟠 Colis : 100 € payés sur
200 € » (orange) ou « ❌ Colis : rien payé (300 €) » (rouge). La livraison a sa
propre pastille séparée (même trois états) quand le client a une livraison à
Dakar. Rien pour les colis « prix à définir ». Aucun CFA côté DCT.

**24/10, mamadou.html v1.17.2 — encaissement : FCFA d'abord, plus de bouton
« Espèces ».** Cobey, devant la fiche d'un client chez Mamadou (1500 € dus,
984 000 FCFA) : « il faudrait peut-être qu'on change » puis « Ok » sur ma
proposition. Dans le bloc « Encaisser » (colis et livraison) : le bouton FCFA
passe en premier et est sélectionné par défaut (champ « Montant en FCFA »),
« € Euros » reste en second ; le bouton « Espèces » (seule méthode possible,
donc inutile) est retiré, l'encaissement reste enregistré en espèces. Le
choix revient sur FCFA à chaque changement de client. Arrondi du FCFA
(taux 655,957, au millier) inchangé.

**25/10, dct-app.html v3.99.91 / departs.js v2.21.23 / chauffeur.html v1.8.0 —
annuler un départ « Waze » (et alerte à 3 h).** Cobey : « quand on appuie sur
Waze, ça lance le chrono. On ne peut pas annuler, corriger. Trouve-moi une
solution » puis « 1 et 2 » sur ma proposition. Le premier appui sur Waze
écrit `wazeTs[client]` (« le premier clic fait foi ») et rien ne l'effaçait :
le chrono tournait jusqu'à la clôture du client (38 h vues dans le Suivi
France).
1. **Annuler le départ** : bouton « ↩ Annuler le départ » sur chaque client
   « en route » dans le Suivi (Collecte et France) et sur la carte du client
   chez le chauffeur externe (« Parti à 17:44 · ↩ Annuler le départ »). Le
   client repasse à « À venir », le chrono disparaît ; un nouvel appui sur
   Waze en relance un neuf. Écrit `wazeTs/<id>` = null ET une « pierre
   tombale » `wazeAnnules/<id>` = heure d'annulation : un départ plus ancien
   que sa pierre tombale est ignoré (`_suiviWaze`, `_fusionnerTs(…, annules)`),
   sinon la règle « on garde l'heure la plus ancienne » et la copie locale
   d'un autre téléphone ressuscitaient l'ancien départ.
2. **Alerte à 3 h** : au-delà de 3 h le chrono n'est plus compté (« En route
   depuis plus de 3 h », `_chronoSuivi`) avec « ⚠️ Départ oublié ? » et un
   second bouton « 🧭 Repartir maintenant » (annule puis redémarre un chrono
   neuf). Sur la carte du camion (liste du Suivi) : seulement l'alerte.
Non testé contre le vrai Firebase (sandbox sans réseau) : si les règles
Firebase refusent l'écriture de `wazeAnnules`, le bouton affichera « Échec ».
Aussi : retrait de trois captures de test (enc_*.png) commises par erreur.

**26/10, dct-app.html v3.99.92 / departs.js v2.21.24 — collectes France
terminées dans l'Archivage ; vider l'historique d'activité d'un profil.**
1. Cobey : « dans le parcours France, les collectes finies doivent aller dans
   l'archivage, dans une propre catégorie à eux France. » L'onglet Collectes
   de France n'a plus d'« Historique » : il ne montre que En cours / À venir,
   plus une ligne « 📦 N collectes terminées · Archivage › » qui ouvre le
   dossier. Archivage a un 3e dossier « 🇫🇷 Collectes France terminées »
   (Année > Mois > Semaine comme les autres, `_depArchiveItemsBruts
   ('collectesFr')`), avec crayon (date/nom/statut) et corbeille pour la
   direction ; une carte ouvre la collecte dans France (bouton « ← Archivage »
   pour y revenir, remis à « ← Accueil » ensuite). Le compteur de la case
   Archivage de l'accueil compte aussi ces collectes. Rafraîchissement de
   l'archive quand `france/` change.
2. Cobey : « Tu peux supprimer pour Samba, Boubacar et Ibrahim les
   notifications. Ils n'ont pas le réflexe de supprimer l'historique et ça va
   ralentir l'application pour eux. » Le fil d'Activité est un seul nœud
   partagé ; « Effacer » pose la date de coupure du profil dans
   `dct_config/activite_deleted/<id>`. Nouveaux boutons dans Réglages >
   Outils : « Vider l'historique : Samba / Boubacar / Ibrahima » et « Vider
   pour les trois » (confirmation, écrit ces dates, les autres profils gardent
   leur fil). Pas exécutable depuis ici (pas d'accès à Firebase) : à appuyer
   une fois par Cobey.

**26/10, departs.js v2.21.25 — Dépenses du container, poste « Salaires » :
Aminata et « Autre » ajoutés.** Cobey : « Ajoute Aminata et Autre » (liste des
noms du poste Salaires). `_depCollabsPourSalaire` ne retire plus Aminata (AM)
et ajoute l'entrée « Autre » (id `AUTRE`). Nouvelle liste : Issyaka,
Abdoulaye, Samba, Ibrahima, Boubacar, Aminata, Eric, Autre.

**26/10, departs.js v2.21.26 — « Inscription au dépôt » : uniquement les
inscriptions au dépôt.** Cobey : « Pourquoi inscription au dépôt marque 82
clients ? » puis « ici, on doit parler que de clients qui sont inscrits au
dépôt. J'avais mis le récap du conteneur pour les autres collaborateurs [...]
mais ici il faut vraiment qu'on soit ciblé sur les inscriptions au dépôt. »
Le 82 était la somme des clients de tous les containers ouverts à
l'inscription (collecte + France + dépôt, `compteursDepart`), choix de
v1.19.69 (29/08). Maintenant, `_depNbInscritsDepot(departId)` ne compte que les
clients inscrits directement au dépôt (`depotClients`) : la case de l'accueil
des espaces (« N clients inscrits au dépôt »), les cartes de départ de la
liste (« N inscrits au dépôt ») et l'écran détail d'un départ, qui ne liste
plus que ces clients (titre « Clients inscrits au dépôt »). Le récap complet
du container reste dans Départs.

**26/10, dct-app.html v3.99.93 / departs.js v2.21.27 — plus de bouton
Notification/Activité pour Samba, Ibrahima et Boubacar.** Cobey : « enlève
carrément le bouton notification. Je veux plus qu'ils aient des
notifications. Ils n'en ont pas besoin » puis « Je parle de Samba, Ibrahima et
Boubacar. » Pour les profils SA, IB, BO (`PROFILS_SANS_ACTIVITE`) : le bouton
🕒 de l'accueil des espaces et l'onglet « Activité » de la barre du bas sont
masqués (`_appliquerSansActivite`, rappelé à la connexion et à chaque
`depRenderEspaces`), `setNav('activite')` est bloqué pour eux, et
`_ecouterNotifs` ne pose plus l'écoute du fil (`activite_items`,
`dct_connexions`) — plus de pastille ni de travail pour rien. Les autres
profils ne changent pas. Leurs propres actions continuent d'alimenter le fil
vu par la direction. Le vidage d'historique fait la veille reste en place.

**26/10, departs.js v2.21.28 — Historique d'envoi d'un contact : retrouve les
anciens envois.** Cobey : « je sais que ce client a déjà fait plusieurs envois
[...] mais quand je regarde l'historique, je ne trouve rien. Pourquoi ? » puis
« Ok » sur ma proposition. Causes dans `_depTousEnvoisContact` : (1) les
collectes terminées étaient écartées (choix de v1.19.5) — or les anciens
envois y sont ; (2) les clients France n'étaient jamais cherchés ; (3) le
numéro devait être identique au caractère près. Maintenant : collectes
terminées incluses (mention « (terminée) »), clients France inclus (« Ramassage
France », bouton Facture France), et comparaison par les 9 derniers chiffres du
numéro (`_depTelNorm` : +33 6 52…, 06 52…, 06.52… = même numéro, tel2 compris).
La Fidélité garde son propre compte des envois (`_depFideliteEnvoisContact`),
non modifié.

**26/10, dct-app.html v3.99.94 / departs.js v2.21.29 — Historique d'envoi,
suite : toujours vide.** Cobey : « Il n'y a toujours rien sur son historique
et j'ai vu que c'est surtout des clients qu'il n'y a rien du tout. »
Deux causes. (a) **Mon oubli de version** : departs.js est chargé avec
`?v=APP_VERSION` ; le correctif v2.21.28 était sorti SANS changer APP_VERSION
(resté v3.99.93), donc les téléphones ayant déjà chargé `departs.js?v=v3.99.93`
gardaient l'ancien fichier en cache. Règle : tout changement de departs.js
exige un bump d'APP_VERSION. (b) Rapprochement trop strict : les fiches sans
numéro (ou contact sans numéro) ne se retrouvaient jamais, et une collecte
retirée de la liste faisait écarter ses fiches. Maintenant : sans vrai numéro
d'un côté ou de l'autre, on rapproche par le nom (`_depNomNorm` : mots dans
n'importe quel ordre, sans accents/majuscules, 2 mots minimum) ; un numéro
différent écarte les homonymes ; les fiches d'une collecte supprimée sont
gardées.

**26/10, dct-app.html v3.99.95 / departs.js v2.21.30 — Historique d'envoi :
seulement à partir du container de septembre.** Cobey : « on avait dit que tu
recherches uniquement l'historique à partir du conteneur de septembre. »
`_depTousEnvoisContact` ne garde que les envois dont le container part à
partir du 1er septembre 2026 (`DEP_HISTO_DEPUIS`) ; sans container, date de la
collecte, sinon date de création de la fiche ; sans aucune date, écarté.
Si la limite doit être un container précis plutôt que le 1er septembre, changer
cette constante.

**26/10, dct-app.html v3.99.96 / departs.js v2.21.31 — « Voir le départ » de
l'Historique d'envoi : « Départ introuvable ».** Cobey (capture, 09:11) : le
bouton « Voir le départ » d'un envoi (Chargement DKR) affichait « ⚠️ Départ
introuvable ». Le bouton passait `d._id`, or `d` vient de `departsData[...]`
brut, sans `_id` : l'appel partait avec « undefined ». Bug présent depuis
v1.19.x, invisible tant que l'historique restait vide. Il passe maintenant
`c.departId`.

**26/10, dct-app.html v3.99.97 / departs.js v2.21.32 — onglet « Activité »
revenu par erreur ; liste des collectes blindée.** Cobey (capture, écran
Collecte, 09:31) : « l'onglet activité, là, je sais pas pourquoi elle est là,
mais elle n'était pas là à la base » et « il me semble qu'il y avait des
collectes pour les dimanches à venir. Mais là, il n'y a plus rien. »
1. **Onglet Activité** : bug de ma v3.99.93 (`_appliquerSansActivite`) : pour
   les profils autorisés, je vidais le style `display` des onglets « Activité »,
   ce qui effaçait le `display:none` posé par `cacherOngletActiviteAccueil`
   (departs.js, Activité cachée depuis l'ajout du bouton 🕒 des espaces). Corrigé :
   on ne touche plus qu'aux profils sans activité, et on rappelle
   `cacherOngletActiviteAccueil` (désormais exposée sur window).
2. **Liste vide** : cause non établie (aucun accès à Firebase depuis ici). Le
   code de liste (`renderCollectesList`) ne cachait pas de collecte, mais une
   erreur dans la liste (date non texte → `parseDate` plantait) laissait
   l'écran blanc sans message. `parseDate` accepte maintenant n'importe quel
   type, et `renderCollectesList` affiche un message d'erreur lisible au lieu
   d'un écran vide. À vérifier avec Cobey : la case COLLECTE des espaces,
   l'Archivage > Collectes terminées, et si les collectes réapparaissent après
   réouverture.

**26/10, dct-app.html v3.99.98 / departs.js v2.21.33 — « Collectes disparues » :
retrouver une collecte effacée de la liste.** Cobey (captures, 09:34) : plus
aucune collecte à venir sur l'écran Collecte alors que la case des espaces
annonçait « Dimanche 1 novembre 2026, 4 clients » (08:44) ; l'Archivage ne
montre que des collectes d'octobre. Hypothèse : `sauvegarderFirebase`
réécrit en bloc `dct/collectes`, `dct/clients`, `dct/dispatch` avec ce que
l'appareil a en mémoire — un téléphone resté sur une vieille liste (ou passé
au changement de statuts du lundi, `_mettreAJourStatuts`) peut donc écraser une
collecte créée entre-temps. Les fiches clients restent en revanche rangées
sous l'identifiant de la collecte (le listener ne fait qu'`Object.assign`).
Nouveau panneau Réglages > Outils : `_depCollectesOrphelines` repère les
groupes de clients sans collecte, avec noms/camions ; `depRecreerCollecte(id)`
recrée la collecte (même id, date choisie) et sauvegarde, ce qui rebranche
clients et camions. À faire si Cobey le valide : empêcher qu'un appareil
écrase les listes entières (écriture par collecte plutôt qu'en bloc).

**26/10, dct-app.html v3.99.99 / departs.js v2.21.34 — « Collectes disparues » :
trop de lignes.** Cobey (captures 09:39, des dizaines de blocs « N clients ») :
« Ya trop ». Les anciennes collectes supprimées laissent leurs fiches dans la
mémoire du téléphone, donc elles apparaissaient toutes. L'identifiant d'une
collecte est `col_` + l'heure de création : le panneau trie de la plus récente
à la plus ancienne, indique « Créée le JJ/MM · N clients · X € · N camions »,
n'affiche d'abord que les 45 derniers jours, le reste derrière « Voir les plus
anciennes (N) ».

**26/10, dct-app.html v3.99.100 / departs.js v2.21.35 — Outils : « Collectes
en mémoire » + recalcul des statuts.** Cobey (capture 09:43) : le panneau
« Collectes disparues » ne propose que de vieilles fiches test (« M. Eric Un »,
« Berth »), pas les 3 clients à 333 € du 1er novembre. Hypothèse : la collecte
n'a pas disparu, elle est restée dans la liste avec un statut qui la cache de
l'écran Collecte (ex. « Terminée » à tort). Nouveau bloc en tête du panneau :
liste les collectes que l'appli a en mémoire (date, clients, €, statut) et un
bouton « Recalculer les statuts selon les dates » (`_mettreAJourStatuts` +
sauvegarde) qui remet « En cours / À venir » selon la date.

**26/10, dct-app.html v3.99.101 / departs.js v2.21.36 — Outils : retrouver une
collecte par l'Activité.** Cobey : « Je veux retrouver la collecte du premier !
Comment on fait. » La collecte du 1er novembre (3 clients, 333 €) n'est plus
dans la base ni dans les fiches orphelines du téléphone (écrasée par une
sauvegarde en bloc d'un appareil à jour obsolète, hypothèse non prouvée). Le
fil d'Activité (`activite_items`, partagé) garde « X a ajouté Prénom Nom —
colis — prix € · collecte du 1 novembre ». Nouveau bloc Réglages > Outils
« Retrouver une collecte par l'Activité » : `depActiviteChercher` lit les 4000
derniers événements, garde ceux de la date saisie, retranche les « a supprimé »
ultérieurs ; `depActiviteRecreer` recrée la collecte (nouvel id) et ses
clients cochés, avec tel/adresse repris du carnet `dctContacts` quand le nom
correspond ; statut recalculé, sauvegarde. Les camions/affectations et les
modifications de prix faites après l'ajout ne sont pas reconstitués.

**26/10, dct-app.html v3.99.102 / departs.js v2.21.37 — Retrouver une collecte
par l'Activité : clients cités sans « a ajouté ».** Cobey (capture 09:53) :
l'outil ne trouvait qu'un client (Alpha DIALLO, 260 €) sur les 3 de la
collecte du 1er novembre (333 €). Les deux autres ne sont pas passés par
« a ajouté » (fiche déplacée d'une autre collecte, par ex.). La recherche
garde maintenant aussi les clients cités par une modification, une affectation,
un planning, une ramasse... de cette collecte (hors lignes de camion/dispatch),
avec « prix non noté », et chaque client a un champ prix modifiable avant la
recréation.

**26/10, dct-app.html v3.99.103 / departs.js v2.21.38 — « Relire la base » pour
retrouver la collecte du 1er novembre.** Cobey a ouvert la console Firebase :
`dct/collectes` n'a plus la ligne du 1er novembre, mais `dct/clients` garde un
groupe `col_1791646344916` (créé le 10/10, 9 s après la collecte du 25/10),
avec les fiches (ex. colis « 2 Fût 270L », Aminata, creeLe 12/10). Seule la
ligne de la collecte dans la liste a été écrasée. Le téléphone n'avait pas ce
groupe en mémoire. Nouveau bouton en tête du panneau Outils : « Relire la base
(clients et camions) » (`depRelireBaseCollectes` : lit `dct/clients` et
`dct/dispatch`, ajoute à la mémoire les groupes absents) ; le panneau
« Collectes disparues » propose alors la collecte (« Créée le 10/10 · 3 clients
· 333 € »), à recréer avec la date du 1er novembre (même identifiant, donc
fiches, camions et affectations reviennent).

**26/10, dct-app.html v3.99.104 — PROTECTION 1 : une collecte ne peut plus
disparaître « par oubli ».** Cobey : « comment faire pour que ça n'arrive plus ? »
puis « Ok » sur le plan (protection 1, protection 2, sauvegarde quotidienne de
15 jours). Cause : `sauvegarderFirebase` remplaçait `dct/collectes` par la
liste de l'appareil ; un téléphone en retard effaçait les collectes ajoutées
par d'autres (la ligne du 1er novembre avait disparu alors que ses clients
étaient restés dans `dct/clients`).
Maintenant : `sauvegarderFirebase` écrit clients/dispatch/contacts comme avant
mais FUSIONNE la liste des collectes dans la base par transaction
(`_fusionnerListeCollectes` : tout ce qui est dans la base OU sur le téléphone
reste ; le téléphone l'emporte pour une même collecte). Une suppression
volontaire (`_effacerCollecte`, corbeille) retire UNIQUEMENT cette collecte de
la base (transaction) et laisse une trace `dct/collectes_supprimees/<id>` pour
qu'un téléphone en retard ne la ressuscite pas. Testé avec une fausse base :
téléphone en retard (N conservée), suppression volontaire (B retirée + trace),
téléphone en retard après suppression (B ne revient pas), ajout normal.
Reste à faire : protection 2 (n'écrire que les groupes de clients/camions
modifiés), puis sauvegarde quotidienne gardée 15 jours + bouton Restaurer.

**26/10, dct-app.html v3.99.105 — PROTECTION 2 : n'écrire que ce que CE
téléphone a modifié.** Suite du plan validé par Cobey. `sauvegarderFirebase`
n'envoie plus `clients`, `dispatch` et `contacts` en bloc : il compare, groupe
par groupe (une collecte = un groupe de clients, un groupe de camions) et
contact par contact, avec ce que le téléphone avait vu à sa dernière
synchronisation (`_baseSync`, renseigné par `_noterBaseSync` aux trois
chargements : démarrage, connexion, écoute temps réel) et n'écrit que
les différences. Rien n'est supprimé par omission (un contact supprimé ici est
retiré explicitement ; une collecte supprimée passe par `_effacerCollecte`).
Les groupes dont la collecte n'existe plus sur le téléphone ou qui sont dans
`dct/collectes_supprimees` ne sont jamais réécrits. Testé avec une fausse base :
un téléphone en retard modifie G1, supprime k1, ajoute k3 pendant que d'autres
ont ajouté la collecte N, un client dans G2 et le contact k4 : seuls
`clients/G1` et les contacts k1/k3 sont écrits, N, le client de G2 et k4
restent ; une 2e sauvegarde sans changement n'écrit rien.

**26/10, dct-app.html v3.99.106 / departs.js v2.21.39 — SAUVEGARDE QUOTIDIENNE
(15 jours) + restauration par collecte.** Fin du plan validé par Cobey (pas de
sauvegarde Firebase automatique : payante). `depSauvegardeQuotidienne` (lancée
6 s après l'ouverture de l'écran des espaces par la direction, une fois par
jour) copie tout `dct` (sauf `activite`) dans `dct_sauvegardes/<AAAA-MM-JJ>` et
écrit un index léger `dct_sauvegardes_index/<jour>` {ts, collectes, clients,
par}; ne copie jamais une base vide ; purge au-delà de 15 jours
(`DEP_SAUV_JOURS`). Réglages > Outils > « Sauvegardes » : liste des copies
(date, nb collectes/clients), « Faire une copie maintenant », ouverture d'une
copie (collectes, clients, €, « absente de l'appli ») et « Restaurer cette
collecte » (réinsère la collecte, ses clients et ses camions, lève la trace de
suppression, sauvegarde). Pas de restauration globale (trop risquée).
Testé avec une fausse base : copie, purge à 15, restauration d'une collecte
absente avec ses clients et son camion. Les règles Firebase doivent autoriser
l'écriture de `dct_sauvegardes*` : sinon un message d'échec s'affiche à la copie manuelle.

**26/10, dct-app.html v3.99.107 / departs.js v2.21.40 — Réglages > Outils
allégé.** Cobey : « dans le réglage outils, il y a trop de menus. Il faut
alléger ça. Garder le plus simple et le plus utile. » Une longue page de huit
blocs remplacée par QUATRE blocs repliés (`<details>`, `_depAccordeon`, état
ouvert/fermé retenu dans `_depOutilsOuverts`) : 💾 Sauvegardes ; 🛡️ Retrouver
une collecte (Relire la base + collectes disparues, avec le nombre à
récupérer sur la ligne) ; 🗑️ Vider l'historique d'un profil ; 🔧 Avancé
(recherche par l'Activité, collectes en mémoire + recalcul des statuts,
diagnostic, civilités, relevé de lenteur). Aucune fonction retirée : tout est
rangé, plus rien n'est supprimé.

**26/10, dct-app.html v3.99.108 / departs.js v2.21.41 — Outils : bloc « Vider
l'historique d'un profil » retiré.** Cobey : « Le 3 ne sert à rien vu qu'on a
supprimé pour ces collaborateurs-là l'onglet des activités. » Samba, Ibrahima
et Boubacar n'ont plus de bouton Activité (v3.99.93) : plus rien à vider pour
eux. Bloc et code supprimés (`_depHtmlViderActivite`, `depViderActiviteProfil`,
`DEP_PROFILS_ACTIVITE`). Outils = Sauvegardes, Retrouver une collecte, Avancé.

**26/10, dct-app.html v3.99.109 / departs.js v2.21.42 — Outils : une seule
façon de retrouver une collecte.** Cobey : « pour la recherche des collectes,
j'ai l'impression qu'il y a plusieurs fonctions qui font la même chose, vu
qu'on a fait plusieurs tests. » Retirés : « Retrouver par l'Activité »
(`depActiviteChercher/Recreer`, `_depNormNom`), « Collectes en mémoire » et
« Recalculer les statuts » (`_depHtmlToutesCollectes`,
`depRecalculerStatutsCollectes`) : outils de dépannage du 26/10, remplacés par
les sauvegardes quotidiennes et la relecture de la base. Reste, dans
« Retrouver une collecte » : un bouton « Chercher les collectes manquantes »
(relit la base) qui liste les collectes disparues à recréer (`depRecreerCollecte`).
Outils = 💾 Sauvegardes, 🛡️ Retrouver une collecte, 🔧 Avancé (diagnostic,
civilités, lenteur).

**26/10, dct-app.html v3.99.110 / departs.js v2.21.43 — Case PLANNING : les
disponibilités au lieu des compteurs.** Cobey (capture des espaces) : « dans le
sous-titre de planning, c'est possible de mettre les disponibilités des gens
au lieu de mettre ce qu'il y a actuellement ? » Le sous-titre « 14 sans réponse
à venir » (ou « N jours à renseigner », « Disponibilités à jour » selon le
profil) est remplacé, pour tout le monde, par le prochain jour du Planning et
les prénoms de ceux qui sont disponibles : « Dimanche 1 novembre / Issyaka,
Samba, Boubacar » (4 prénoms au plus, puis « +N »), « personne pour
l'instant » si tous ont répondu non, « pas encore de réponses » sinon. Mêmes
règles que la ligne « DISPONIBLES » des cartes de collecte (`_depGensPourJour`,
`_depDispoDe`).

**26/10, mamadou.html v1.18.0 — Containers de Mamadou : couleur selon l'état.**
Cobey (capture de la liste, deux « Chargement DKR » indiscernables) : « fais bien
une distinction des conteneurs pour Mamadou [...] s'ils sont arrivés ou pas »,
puis « plutôt que des pastilles, des couleurs directement dans les espaces,
couleur pastel », « Mamadou ne voit que les conteneurs à partir du statut
parti » et « les containers clos on les retire pour lui ». Liste
(`ouvrirContainers`) : carte VERTE pastel = « ✅ Arrivé à Dakar · le <date> »
avec « N à remettre sur M clients · part le … » ; carte BLEUE pastel = « 🚢 En
route · pas encore arrivé » (reste cliquable : c'est de là qu'il valide
l'arrivée au dépôt). Dates en français. Arrivés d'abord (récents en tête), puis
en route. Containers clôturés retirés de la liste (le Dépôt reste, neutre).
`_cdEtat(d)` : « arrivé » = étape « Arrivée au dépôt » faite ou statut
« arrivé » ; « clôturé » = statut cloture. En tête de la fiche d'un container,
la ligne de suivi prend la même couleur avec l'état. `containerAutorise` n'est
pas modifié (scan, Dépôt Dakar et saisie de secours fonctionnent comme avant).

**26/10, dct-app.html v3.99.111 / departs.js v2.21.44 — Activité : une seule
ligne claire par modification de fiche.** Cobey (capture de l'Activité) :
« quand on voit ces notifications-là, on ne sait pas trop à quoi ça
correspond » puis « Ok fait tout ». Constats : (1) chaque modification
écrivait deux lignes (« a modifié X · collecte du 25 octobre » de
`saveClientEdit` + « a modifié la facture de X — prix » de
`_depTracerModifsFacture`) ; (2) on ne voyait pas de combien à combien ; (3)
« livraison activ&eacute;e » s'affichait avec son code (étiquette déjà en HTML
échappée une 2e fois par `esc()`) ; (4) les retouches rapprochées donnaient
des lignes quasi identiques.
Maintenant : `_depActiviteFacture` écrit UNE ligne : « Issyaka a modifié la
facture de <client> · collecte du 25 octobre » puis le détail avant → après
(« prix : 100 € → 130 € · adresse : … → … ») ; la ligne générique de
`saveClientEdit` est supprimée quand la confirmation détaillée est utilisée
(`window._depActiviteDetaillee`) ; les retouches de la même personne sur la
même fiche en moins de 3 minutes mettent à jour la même ligne
(`_depDerniereActFacture`) ; le code « &eacute; » n'est plus échappé. S'applique
aux fiches collecte (écran de confirmation, validation de collecte) et au
formulaire dépôt direct (sans mention de collecte).

**26/10, dct-app.html v3.99.112 / departs.js v2.21.45 — Activité : du détail
pour TOUTES les notifications.** Cobey (capture « Eric a modifié le départ
Chargement DKR » ×2) : « le détail des notifications doit être pour tout type
de notification, pas que les changements [...] j'ai changé le statut du
conteneur, mais il ne me met rien. Alors que j'ai ouvert l'inscription, il
aurait dû le marquer » puis « Ok fait ». Audit des ~70 messages (departs.js,
dct-app.html) : la plupart avaient déjà leur détail (versements avec montant,
affectations, ramasses...). Corrigés :
- **Container** (`depEnregistrer`) : un message unique avec les différences
  avant → après : date de départ, arrivée prévue (port / dépôt), inscriptions
  OUVERTES/FERMÉES, statut ; rien n'est écrit s'il n'y a aucun changement.
  Création : pays, date de départ, inscriptions. Suppression : date.
  Étape de transport validée et passage de statut : « a fait passer le
  container X (départ du …) de Parti à Arrivé » (l'ancienne phrase « Eric le
  container X passe en … » était mal construite). Déplacement d'un client :
  « de A vers B ».
- **Collecte** : `changerStatut` → « a changé le statut de la collecte du
  <date> : En cours → Terminée » (avant : « a modifié le statut d'une collecte »,
  sans dire laquelle) ; renommage de camion « <ancien> en <nouveau> » avec la
  collecte ; clôture « a clôturé la collecte du <date> ». France : changement de
  date (ancienne → nouvelle) et de statut avec avant → après.
- **Doublons** : une même ligne de la même personne répétée en moins d'une
  minute n'est écrite qu'une fois (`addActivity` et `depActivite`).

**27/10, dct-app.html v3.99.113 / departs.js v2.21.46 — Salaires : Mamadou
Niass ajouté.** Cobey : « J'ai oublié de mettre Mamadou Niass dans les
salaires. » Liste du poste « Salaires » (Dépenses du container,
`_depCollabsPourSalaire`) : Issyaka, Abdoulaye, Samba, Ibrahima, Boubacar,
Aminata, Eric, **Mamadou Niass** (id `MN`), Autre.

**27/10, dct-app.html v3.99.114 / departs.js v2.21.47 — Statistiques > Comparer :
résultat refait, avec le détail par poste.** Cobey (capture de l'écran, « rien
d'esthétique, c'est pas facile à lire ») puis : « je veux pouvoir comparer les
différents détails par items, précis comme les différentes dépenses [...] le but
est d'analyser pour les prochains containers » et « fais l'interface pour la
comparaison des deux containers » (après aperçu validé en artifact). Le choix
des deux côtés (Année / Mois / Container, grilles de cases) est conservé ; ce
qui était en dessous est refait : plus de sept boutons de mesure, un seul
écran lisible : (1) deux cartes A (bleu pastel) et B (vert pastel) avec nom,
date, nombre de containers et de clients ; (2) le BÉNÉFICE en tête, avec une
phrase d'explication de l'écart (encaissé en plus/moins, reste dû, dépenses) et
le bénéfice « une fois tout encaissé » (CA − dépenses) ; (3) une ligne par
chiffre (chiffre d'affaires, encaissé, reste dû, dépenses, clients, colis) avec
deux barres à la même échelle et une pastille verte/rouge selon le sens des
affaires (dépenses et reste dû : une baisse est verte) ; (4) dépliable, le
détail poste par poste : ENCAISSÉ (DCT / Mamadou Niass en espèces) et DÉPENSES
(frais du container : dédouanement, loyer, container, chargeur...; salaires par
personne grâce à `collabNom`; tournées des camions : carburant, déjeuner...).
Fonctions : `_depCmpDetails`, `_depCmpGroupe`, `_depCmpLigne`, `_depCmpHero`.
Montants arrondis à l'euro. La carte « Livraison, caisse séparée » est gardée.
Non fait (à voir) : vue Évolution sur plusieurs containers (graphique) et détail
du chiffre d'affaires, dont la donnée par type de colis n'existe pas.

**27/10, dct-app.html v3.99.116 / departs.js v2.21.49 — Comparer : choix des
dates simplifié.** Cobey (capture 21:43) : « les dates aussi c'est trop
fouilli » (trois onglets Année/Mois/Container + deux grilles de douze mois,
libellés coupés « S… », « N… »). Remplacés par UN menu dans chaque carte A et B
(`_depCmpSelecteurs`) : containers d'abord (récents en haut, « 20/09/2026 ·
Chargement DKR », la date en premier car c'est elle qui les distingue), puis
mois, puis années ; un lien « Intervertir A et B » ; au premier passage, les
deux derniers containers sont proposés. Sous-titre : « Deux containers, deux
mois ou deux années ». Plus d'onglet de type ni de grille.

**27/10, dct-app.html v3.99.117 / departs.js v2.21.50 — Statistiques :
nouvel écran « Évolution » (graphique sur plusieurs containers).** Cobey, après
avoir vu la démo : « Il est où cette interphase ? » (il avait demandé : « Et on
pourra comparer sur une période donnée ? Voir un graphique sur plusieurs
containers ? », et « trop fouilli » pour les boutons). Statistiques > ÉVOLUTION
(carte verte, au-dessus de « Un container »). Seulement deux menus : *Période*
(3 / 6 derniers containers, 3 / 6 derniers mois, cette année, tous, ou dates à
choisir) et *Ce qu'on suit* (dépenses, bénéfice, chiffre d'affaires, encaissé,
dépenses par client, ou un poste précis : dédouanement, salaire d'une personne,
carburant d'une tournée…). Un graphique en barres (ligne pointillée = moyenne,
deux derniers containers en bleu/vert, négatif en rouge) puis la liste avec la
variation vs le précédent (vert = bonne nouvelle, rouge = mauvaise). Toucher un
container l'ouvre dans Comparer avec le précédent. Fonctions : `depOuvrirStatsEvo`,
`depRenderEvo`, `_depEvoValeur`, `_depEvoPostes`, `depEvoComparer`.

**29/10, dct-app.html v3.99.118 / departs.js v2.21.51 / mamadou.html v1.18.1 —
Clôturer un container ne retire plus ses colis du Dépôt Dakar.** Cobey : « quand
je clôturais un conteneur dans départ, ça retirait les colis qui étaient dans le
dépôt à Dakar [...] le conteneur est déjà parti, tout est dans le dépôt à Dakar,
c'est juste que dans l'application on classe les colis par conteneur [...]
Mamadou ne voit plus le conteneur clôturé mais il peut toujours voir les colis
du dépôt. » Cause : `_depListeDepotDakar` (DCT) et `_mnListeDepotDakar`
(Mamadou) ne prenaient que les départs `statut === 'arrive'`. Maintenant :
`_depDepartAuDepotDakar(d)` / `_mnAuDepotDakar(d)` = « Arrivé » OU « Clôturé »
avec l'étape « Arrivée au dépôt » validée (un container clôturé encore en mer
n'est pas compté). Un colis ne sort du dépôt que quand il est remis. Compteur
Stockage idem ; badges « en attente de livraison / remis » et couleurs de la
liste des clients d'un container clôturé aussi. La liste « Containers » de
Mamadou cache toujours les clôturés (inchangé).

**30/10, dct-app.html v3.99.119 / departs.js v2.21.52 — Planning : le nom de
l'admin apparaît dans les notifications.** Cobey : « dans les notifications pour
les plannings, il n'y a pas mon nom. Je me suis noté pas dispo, mais il n'y a pas
marqué mon nom [...] Eric, mon nom. » Cause : `addActivity` n'écrit rien dans le
fil quand l'utilisateur est admin (« Admin invisible »), donc ses actions de
Planning n'y étaient jamais. Ajout d'un 5e paramètre `memeAdmin` (dct-app.html,
et dans l'enrobage « passe-partout » de departs.js) passé à `true` pour les 6
lignes du Planning : dispo / pas dispo, réponse retirée, correction de la réponse
d'un autre, intervenant ponctuel, relance. Le reste de ce que fait un admin
reste invisible dans le fil (comportement d'origine inchangé).

**01/11, dct-app.html v3.99.120 / departs.js v2.21.53 — Clients France supprimés :
corbeille + outil « Retrouver un client France ».** Cobey : des clients France
« déjà ramassés par un chauffeur externe » (donc rangés dans un container mais
encore « en attente » dans la liste) ont été supprimés par Aminata : la fiche,
son container, son prix et ses photos ont disparu (Masamba Mbaye, Aliou Mansaly,
et sans doute d'autres de la même tournée). « Ok, vas-y, fais ça. »
- Toute suppression de fiche France (poubelle de la liste, bouton de la fiche,
  suppression forcée direction, « vider l'historique ») copie d'abord la fiche
  complète dans `france_corbeille/<id>` (`_frMettreCorbeille`, dct-app.html) ;
  les photos ne sont plus effacées (même id, elles reviennent avec la fiche).
  Corbeille et photos purgées après 30 jours.
- Défaut corrigé : le bouton « Supprimer cette fiche » de la fiche ouverte
  (`depConfirmerSuppressionFrance`) ne copiait PAS la personne dans le carnet
  (dct/contacts), contrairement à la poubelle de la liste — d'où Aliou absent
  du carnet.
- Les deux écrans de confirmation disent maintenant « ce client est rangé dans
  le container X et en sera retiré ».
- Outils > « Retrouver un client France » : (1) « Supprimés récemment » =
  corbeille, bouton Rétablir (tout revient tel quel, container compris) ;
  (2) « Retrouvés dans le carnet » = contacts sans fiche, bouton Recréer : refait
  une fiche (nom/tél/adresse du carnet) et demande container, colis, nombre, prix.
  Pour les suppressions faites AVANT la corbeille, seul (2) est possible.
Non fait : sauvegarde quotidienne des clients France (comme pour la Collecte).

**01/11, dct-app.html v3.99.121 / departs.js v2.21.54 — « Retrouver un client
France » : plus de clients d'Île-de-France.** Cobey : « il m'a retrouvé des
clients d'Île-de-France. Il n'y a aucun client du carnet de France. » Le carnet
(dct/contacts) contient aussi les clients de la Collecte (Paris, départements
75/77/78/91-95) ; `_depCarnetARecreer` les écarte, ainsi que tout contact déjà
client d'une collecte (`clientsParCollecte`) ou du dépôt. Le code postal est
affiché sur chaque ligne.

**01/11, dct-app.html v3.99.122 / departs.js v2.21.55 — Outils : « Chercher dans
l'historique ».** Cobey, pour retrouver le 3e client rangé par le chauffeur
externe le 02/10 (n° 38-39-40 manquants dans le container, tournée absente de
Firebase) : « Activité j'ai plus, j'ai effacé l'historique depuis. » « Effacer »
ne cache les lignes que sur le téléphone ; elles restent dans `activite_items`.
Nouveau panneau (mot à chercher + dates du/au, lecture seule, 200 lignes max,
sans accents ni majuscules) : `_depHtmlHistorique`, `depHistoChercher`.

**01/11, chauffeur.html v1.8.1 — le nom du client manquait dans les lignes
d'Activité du chauffeur externe.** Trouvé grâce à « Chercher dans l'historique »
(Cobey) : « Le chauffeur Chauffeur excterne a récupéré le colis de » — rien après.
`_activiteExterne` (récupéré / colis mis à jour / non récupéré) écrivait
`c.name`, qui n'existe pas sur une fiche France (champs `nom`/`prenom`). Remplacé
par `nomChartres(c)`. Les anciennes lignes restent sans nom (le 02/10 : 3 colis
récupérés à 15:11, 18:42 et 21:11 ; Issyaka a mis 5 clients dans le camion le
01/10 à 15:43).

**01/11, dct-app.html v3.99.123 / departs.js v2.21.56 — « Chercher dans
l'historique » : émojis lisibles.** Cobey a trouvé le 3e client (Mamadou Loum :
« Eric a ramassé / déclaré parti pour Dakar — Chargement DKR » le 04/10 à 15:52,
puis Aliou 15:54 et Masamba 17:06 = n° 38-39-40). Les lignes affichaient
« &#9999;&#65039; » en toutes lettres : certaines gardent leur émoji en entité HTML ;
décodé dans `depHistoChercher`.
Trou noté : `depConfirmerSuppressionFrance` (fiche ouverte) n'a aucune garde sur
le statut (« parti » inclus) — seul l'avertissement « rangé dans le container X »
et la corbeille 30 jours (v3.99.120) protègent maintenant.

**01/11, dct-app.html v3.99.124 / departs.js v2.21.57 — « Retrouver un client
France » : ligne de diagnostic.** Cobey (capture) : « Aucun contact sans fiche »
alors que Masamba devrait y être. Ajout sous la liste : « Carnet : N contacts · X
ont déjà une fiche · Y d'Île-de-France » (`_depCarnetStats`), pour voir pourquoi
un contact est écarté (fiche France recréée entre-temps, client d'une collecte,
Île-de-France).

**01/11, dct-app.html v3.99.125 / departs.js v2.21.58 — « Retrouver un client
France » lit le carnet directement dans Firebase.** Cobey : « il n'y a aucun
contact trouvé » alors que Masamba est bien dans dct/contacts (console Firebase).
La liste s'appuyait sur `window.dctContacts` (copie en mémoire, vide ou périmée
sur ce navigateur). Elle relit maintenant `dct/contacts` (`_depContactsFb`) en
plus de la mémoire.

**01/11, dct-app.html v3.99.126 / departs.js v2.22.0 — CORBEILLE DE 30 JOURS,
classée.** Cobey, après les clients France supprimés : « une sauvegarde des
suppressions des 30 derniers jours, même si on supprime un client, une collecte
ou autre, on puisse la retrouver [...] mais on garde un classement : par
container, par collecte, par client. » Chaque suppression écrit d'abord une
copie dans `dct_corbeille/<clé>` (`_depCorbeille`, departs.js) : { ts, par,
type, titre, sous, conteneur, ecritures:[{p,v}], apres, extra, photos }.
Couvert : client France (`_frMettreCorbeille`, dct-app), client de Collecte
(patch de `confirmDelete`, + trace `dct_supprimes` effacée au rétablissement),
client du dépôt direct (`depSupprimerDepot`, photos conservées), collecte Dakar
entière (patch de `_effacerCollecte` : collecte, clients, camions, dépenses),
collecte France (clients remis à leur état), container (`depSupprimer`),
facture manuelle, dépenses (fixes et tournées), contact du carnet + toutes ses
fiches de collecte (`confirmerSupprimerContact`). Écran : Outils > « Corbeille ·
30 jours », classé en Containers / Collectes / Clients (sous-titres par
container) / Contacts / Factures / Dépenses, avec recherche et « Rétablir »
(`depCorbRetablir`). Purge au-delà de 30 jours (avec photos). Les anciennes
entrées `france_corbeille` (v3.99.120) sont relues. Sauvegarde quotidienne :
15 → 30 jours (`DEP_SAUV_JOURS`). Le bloc « Retrouvés dans le carnet » reste
dessous. Non couvert : suppressions faites avant le 01/11 (sauf via le carnet).

**01/11, dct-app.html v3.99.127 / departs.js v2.22.1 — La corbeille a sa propre
case dans Réglages.** Cobey (capture de Administration) : « ajoute plutôt une
case Corbeille ici, avec à l'intérieur l'espace où on voit tout ce qui a été
supprimé, classé par objet : le container, les collectes, les clients, chacun a
sa place. » Nouvelle tuile « CORBEILLE » (rouge pâle, entre Outils et Message ;
sous-titre « N à retrouver ») dans `DEP_REGLAGES_ITEMS`, section
`admin-section-corbeille` (`renderAdminCorbeille`) : la liste classée de la
v3.99.126 + « Retrouvés dans le carnet ». Retirée d'Outils (où ne reste que
« Chercher dans l'historique »).

**03/11, dct-app.html v3.99.128 / departs.js v2.22.2 — Les containers clôturés
quittent la liste des départs.** Cobey : « les containers clôturés doivent aller
dans les archives. » `depRenderListe` n'affiche plus les départs au statut
« clôturé » : une ligne en bas dit « N départ(s) clôturé(s) dans Archives ».
Les compteurs (case Départs des Espaces, choix du pays) disent « N en cours »
au lieu de « N au total ». Les clôturés restent dans Archives > Départs
clôturés (existant) et dans les rapports financiers / statistiques.

**03/11, dct-app.html v3.99.129 / departs.js v2.22.3 / mamadou.html v1.18.2 —
Bouton « Visible par Mamadou » sur le container.** Cobey : « le container parti
a son statut en cours de navigation, du coup Mamadou a la visibilité du
container [...] le problème, c'est qu'il a accès aux clients qui n'ont pas
forcément tout payé, trop de vue. On va mettre un bouton en dessous de "ouvert à
l'inscription" et "clôturer le container" qui va donner la visibilité du
container à Mamadou au moment où on le décidera. » Interrupteur dans Modifier le
départ (Sénégal seulement), champ `departs/<id>/visibleMamadou` ; les nouveaux
containers sont créés cachés. `containerAutorise` (mamadou.html) : true/false
explicite prime ; sans décision (anciens containers), l'ancienne règle (étape
« Départ de Mitry » cochée) continue de s'appliquer, jusqu'à ce qu'on enregistre
le container. Le Dépôt Dakar de Mamadou passe par la même fonction : les colis
d'un container caché n'y figurent pas non plus. Changement tracé dans l'Activité.

**03/11, dct-app.html v3.99.130 / departs.js v2.22.4 / mamadou.html v1.18.3 —
« Visible par Mamadou » devient automatique à l'arrivée à Dakar.** Cobey :
« bien sûr la visibilité sera automatique pour Mamadou Niass une fois le statut
du container arrivé à Dakar, au cas où on oublie d'appuyer sur le bouton. »
`containerAutorise` (mamadou.html) et `_depVisibleMamadou` (departs.js) :
statut « arrivé » ou étape « Arrivée au dépôt » validée => visible, quoi que dise
le bouton ; sinon le bouton (true/false) décide ; sans décision, l'ancienne règle
(« Départ de Mitry » cochée).

**03/11, dct-app.html v3.99.131 / departs.js v2.22.5 — Planning : jour « chauffeur
externe, personne à solliciter ».** Cobey : « on a créé une collecte France pour
le 5 novembre, prise en charge par un chauffeur externe, or dans le planning le
prochain jour de disponibilité qu'on voit est ce jeudi : aucun collaborateur ne
sera sollicité. » Puis : « on n'a pas encore fait le dispatch [...] le planning
reste au même statut pendant ce temps » -> choix MANUEL immédiat, pas seulement
la détection du camion. `dct_planning_ext/<date>` = { externe, par, ts }
(listener + `window.planningExt`). `_depPlSansEquipe(iso)` : externe:true => jour
grisé (« Chauffeur externe — personne à solliciter », ni boutons, ni relance, ni
pastille : `_depDimanchesSansMaReponse` l'ignore) ; externe:false => forcé normal ;
rien => automatique si une collecte France ce jour-là n'a que des camions
externes et qu'il n'y a pas de collecte Dakar le même jour. Où le décider : case
« Faite par un chauffeur externe » à la création d'une collecte France
(dct-app.html), ou bouton « Chauffeur externe — personne à solliciter » dans
« Modifier ce jour » du Planning (direction + Aminata) ; « Remettre à l'équipe »
sur la carte grisée. Tracé dans l'Activité. La date de la collecte n'est pas
suivie si on la change après coup (le drapeau reste sur l'ancienne date).
À reprendre : la réponse obligatoire à la connexion (pas encore faite) devra
ignorer ces jours.

**03/11, dct-app.html v3.99.132 / departs.js v2.22.6 — « Faite par un chauffeur
externe » se change aussi sur une collecte France déjà créée.** Cobey : « pour la
collecte en cours je ne peux pas modifier. » La case n'existait qu'à la création.
Ajoutée dans la fenêtre « Modifier la collecte » (`ouvrirStatutCollecteFr`, bouton
🚚 Enregistrer → `changerExterneCollecteFr` → `depPlanningExterneBasculer`) ; cochée
d'office si le jour est déjà grisé au Planning. Si on change la date de la
collecte (`changerDateCollecteFr`), le choix la suit à la nouvelle date.

**03/11, dct-app.html v3.99.133 / departs.js v2.22.7 — Case Planning : le prochain
jour à pourvoir.** Cobey (capture des Espaces) : après avoir grisé le jeudi 5
novembre (chauffeur externe), « ici on devrait voir la collecte du dimanche qui
suit pour voir qui sera dispo. » Le sous-titre de la tuile Planning sautait pas
le jour « sans équipe » : il prend le premier jour à venir qui n'est pas grisé
(`_depPlSansEquipe`), ici le dimanche 8 novembre avec les prénoms des dispos.

**03/11, dct-app.html v3.99.134 / departs.js v2.22.8 — Carte de collecte : mention
« Chauffeur externe ».** Cobey (capture France > Collectes, « Tournée sud ») :
« chauffeur externe bien coché pour la tournée, mais zéro indication ici. » La
ligne sous la carte (`_depLigneDisposJour`) affichait « DISPONIBLES · pas encore
de réponses ». Pour un jour « chauffeur externe » (`_depPlSansEquipe`), elle dit
maintenant « 🚚 Chauffeur externe · personne à solliciter ». Les cartes (Collecte
et France) se redessinent dès que le choix change (listener `dct_planning_ext`).

**03/11 — Sauvegarde des règles Firebase (Realtime Database) avant d'ajouter un
compte lecteur.** Cobey a collé les règles en vigueur ; copie dans
`firebase-rules-sauvegarde-2026-11-03.json` (à recoller telles quelles dans
Console Firebase > Realtime Database > Règles pour revenir en arrière). Projet
Dakar Collecte (forfait Spark). Compte `lecteur@dakarcitytransport.app` créé par
Cobey dans Authentication ; la modification prévue des règles ne touche que la
ligne `.read` racine (ajout du lecteur, écriture inchangée). À traiter à part :
le mot de passe du compte staff est écrit en clair dans departs.js (dépôt
public ?) — changer le mot de passe et revoir la connexion.

---

## 7 · Sécurité — sortir le mot de passe `staff@` du code public

### 03/11/2026 — Étape 1/4 : le Worker remet des laissez-passer (cloudflare-worker.js v1.8.0)
> Cobey : « on peut le faire maintenant » (changer le mot de passe / ne plus l'avoir dans le code public).

Constat : le dépôt est public ; le mot de passe de `staff@` est écrit en clair dans `departs.js`, `mamadou.html`
et `chauffeur.html`. De plus le PIN admin « 1010 » est écrit en clair dans `dct-app.html` (`validerPinAdmin`).

Fait (rien ne change encore pour l'équipe) : `POST /auth` sur le Worker. Il vérifie PIN équipe
(`dct_config/pins`, passe-partout, blocage au 5e échec), mot de passe/lien de Mamadou (`dct_acces_mamadou`) ou code
chauffeur (`dct_codes_externe`), puis renvoie un jeton Firebase personnalisé (`staff:true`, `role`). Limite : 10
échecs / 15 min par adresse. Testé avec un faux Firebase (signature, blocage, limites, origine refusée).
À faire par Cobey : coller le nouveau `cloudflare-worker.js` dans Cloudflare (Deploy). Aucune nouvelle variable.

Suite : 2) règles Firebase (`|| auth.token.staff == true`) + brancher l'appli équipe (avec repli sur l'ancien
mot de passe) ; 3) Mamadou puis chauffeurs ; 4) retirer le mot de passe du code, Cobey change le mot de passe
dans la console. Point ouvert : le PIN admin 1010 à déplacer dans la base.

### 03/11/2026 — Étape 3a : page chauffeur externe (chauffeur.html v1.9.0)
> Cobey : « les chauffeurs ont un code à entrer pour se connecter via leurs liens » ; les « postes » (P1…P4, DD) :
> « je n'utilise plus, c'était une interface pour une personne qui travaille plus avec nous » (rien à faire pour eux).

Le code saisi est d'abord vérifié par le Worker (`POST /auth`, mode `chauffeur`) ; la page se connecte avec le
laissez-passer reçu. Si le Worker ne répond pas, ou si Firebase refuse le laissez-passer (règles pas encore à
jour), repli automatique sur l'ancienne connexion : rien ne change pour le chauffeur. Testé (Playwright, faux
Firebase) : laissez-passer accepté / refusé / Worker coupé. **Pas encore testé avec le vrai Firebase.**
Constat : rendre le dépôt privé ne cacherait PAS le mot de passe (le site publie `departs.js` tel quel).
Reste : règles Firebase (`|| auth.token.staff == true`), Mamadou, appli équipe (démarrage à couper en deux :
avant/après PIN ; Face ID à rattacher à un code d'appareil), puis retrait de l'ancien mot de passe.

### 03/11/2026 — Étape 3b : page Mamadou (mamadou.html v1.19.0)
> Cobey : « ok la suite c'est du coup ? » (après chauffeur.html).

Le mot de passe de Mamadou et le lien Direction sont d'abord vérifiés par le Worker (`POST /auth`, mode
`mamadou`). Trois résultats : accepté (connexion avec le laissez-passer), refusé (« mot de passe incorrect »),
ou indisponible (Worker coupé, ou Firebase refuse encore le laissez-passer) → ancienne méthode, rien ne change
pour Mamadou. Testé (Playwright, faux Firebase) : 8 cas, dont règles pas à jour et Worker coupé. **Pas encore
testé avec le vrai Firebase.** À noter : son mot de passe n'a que 4 chiffres (le Worker limite à 10 essais par
15 min et par adresse) ; au retrait de l'ancien mot de passe, la réouverture « déjà connecté » devra s'appuyer
sur la session Firebase conservée par le navigateur.

### 03/11/2026 — Étape 4a : appli de l'équipe, PIN vérifié par le Worker (dct-app.html v3.99.135, Worker v1.8.1)
> Cobey : « ok » (après l'explication de ce que Face ID et PIN changent pour l'équipe).

Le PIN (profils et admins) est d'abord vérifié par le Worker ; l'appli se reconnecte avec le laissez-passer seulement
si une connexion à part (sonde) prouve que les règles Firebase l'acceptent — sinon la connexion actuelle reste
(changer pour une connexion refusée couperait les écoutes ouvertes pour de bon). Repli sur l'ancienne vérification si
le Worker est coupé ou ne connaît pas de PIN pour ce profil. Admins : le code posé dans `dct_config/pins/AD` et `/AI`
remplace « 1010 » ; tant qu'il n'y en a pas, « 1010 » marche encore (à retirer à la dernière étape). Worker v1.8.1 :
les profils AD/AI ne se bloquent jamais. Testé (12 cas, faux Firebase). Pas encore fait : démarrage en deux temps
(avant/après PIN), Face ID, passe-partout/PIN créé via Worker, règles Firebase, retrait de l'ancien mot de passe.
- 03/11 : dct-app v3.99.135 mis en ligne (main) après « collé » de Cobey (Worker v1.8.1).

### 03/11/2026 — Étape 4b : l'appli ne lit plus la base avant le PIN (dct-app.html v3.99.136, departs.js v2.22.9)
> Cobey : « ok » (après l'explication du démarrage en deux temps).

Avant le PIN, l'appli ne lit plus que la liste des profils, le message d'accueil et le passe-partout. Les ~25 autres
écoutes (clients, France, finances, planning, départs…) démarrent au début de `finalisLogin` via
`_demarrerEcoutesApresPin` (dct-app.html) et `window._depEcouterApresPin` (departs.js). Le mot de passe de l'ancien
compte sert encore en coulisses : aucun changement visible. Testé : faux Firebase en mémoire + vraies données de la
base (lecture seule), 74 écrans comparés avant/après, même contenu, aucune erreur.
Reste avant de retirer l'ancien mot de passe : lecture avant PIN sans compte (profils, « PIN existe ? », « profil
bloqué ? ») et écritures faites au démarrage (`dct_config/collabs`, `profils_poses`) à déplacer après le PIN ; passe-partout
et création de PIN via le Worker ; Face ID ; règles Firebase.

### 03/11/2026 — Étape 4c : profils, PIN et Face ID sans lire la base (dct-app.html v3.99.137, departs.js v2.22.10, Worker v1.9.0)
> Cobey : « Issyaka a son propre code PIN » (réponse sur le profil admin AI : son code est dans la base, pas 1010).

- Worker v1.9.0 : `public` (profils, message, « a un PIN ? », « bloqué ? » — jamais un PIN), `creer_pin`, `debloquer`
  (code de maintenance), `appareil_creer` / `appareil` (code secret par téléphone pour Face ID, haché dans
  `dct_config/appareils/<id>` ; supprimer ce nœud coupe les téléphones), passe-partout accepté même sans PIN.
- Appli : la liste des profils, le message et le statut d'un profil viennent du Worker (repli sur la base s'il est
  coupé). Écritures de démarrage (`_completerEquipe`) et passe-partout déplacés après le PIN. Face ID : le code secret du
  téléphone se crée tout seul à la prochaine saisie du PIN ; tant que l'ancien mot de passe vit (`DCT_ANCIEN_MDP`),
  un téléphone sans code secret entre comme avant.
- **Correctif important** : `_dctSeReconnecter` (v3.99.135-136) testait le laissez-passer avec une « 2e appli Firebase »,
  mais departs.js renvoie toujours l'appli existante (`firebase.initializeApp` enveloppé) : le test touchait la connexion
  principale et pouvait supprimer l'appli Firebase. Le test se fait maintenant par l'API REST (échange du jeton + lecture),
  sans toucher à la connexion de l'appli.
- Testé : faux Firebase + vraies données, 12 scénarios (Worker ok / coupé, règles ok / refusées, PIN créé, passe-partout,
  Face ID avec/sans code secret/refusé) et 74 écrans identiques à la v3.99.136.

### 03/11/2026 — Étape 5 : l'ancien mot de passe est retiré du code (dct-app v3.99.138, departs v2.22.11, mamadou v1.20.0, chauffeur v1.10.0, Worker v1.10.0)
> Cobey : « c'est fait » (Worker v1.10.0 collé), après avoir publié les règles Firebase (`|| auth.token.staff == true`, lecteur gardé en lecture).

Vérifié en réel avant le retrait : un laissez-passer du Worker lit la base (200), sans rien 401, le compte lecteur lit mais
ne peut pas écrire. Retiré : `DEP_STAFF_PASSWORD` (departs.js), les 2 copies dans mamadou.html et chauffeur.html, le PIN admin
« 1010 » (les admins utilisent leur code dans `dct_config/pins`). Mamadou : « a-t-il un mot de passe ? » et création via le
Worker (modes `mamadou_public`, `mamadou_creer`) ; une ancienne session « compte staff » sur son téléphone est refusée.
Plus de repli : Worker coupé = « Connexion impossible ». Testé (faux Firebase + vraies données) : 74 écrans, 12 scénarios appli,
12 scénarios Mamadou/chauffeur. **À faire par Cobey** : désactiver le compte `staff@` dans Firebase après quelques jours.

### 03/11/2026 — Bouton « Relancer le paiement » dans la fiche d'un container (dct-app v3.99.139, departs v2.22.12)
> Cobey : « il faudrait qu'on puisse mettre un bouton de relance des paiements dans la case des départs, par container, pour chaque client qui a un manquement de paiement, colis ou livraison » — puis : « un bouton par client, c'est pour Aminata, comme elle n'a pas accès au bilan financier, on veut rajouter ce bouton-là » et « ce bouton doit être visible par tout ce qui a la case départ ».

Dans Départs > un container, chaque client qui doit encore quelque chose (colis ou livraison) a « 💬 Relancer le paiement »
(+ « 📋 Copier » s'il ne doit qu'une des deux caisses). S'il doit le colis ET la livraison, le bouton ouvre un petit choix (une ligne
par caisse, WhatsApp / Copier). Même message, même marquage « relancé » (vert + date, historique du client) que « Qui doit »
du Rapport financier (`depRelancerPaiement`, qui accepte maintenant le départ en 5e paramètre). Aucun total de container n'est
affiché ; visible par toute personne qui a la case Départs (Aminata incluse). Testé avec les vraies données (en lecture) : boutons
= clients qui doivent, message WhatsApp correct, bouton vert après relance, choix colis/livraison.

### 03/11/2026 — Message de relance de paiement : « en cours d'acheminement » puis « arrivés à Dakar… dépôt » (dct-app v3.99.140, departs v2.22.13)
> Cobey : « il faut changer le message et mettre "vos colis sont en cours d'acheminement", et il doit se changer automatiquement avec le message actuel uniquement quand le statut du container est arrivé à Dakar, et ça doit être pareil pour les boutons dans le bilan financier » ; puis : « on garde "Vos colis France-Sénégal sont bien arrivés à Dakar" et on ajoute à la suite : ils vont arriver prochainement dans notre dépôt aux Parcelles Assainies ».

`_depTexteRelancePaiement` (une seule fonction pour la fiche du container et le Rapport financier) : tant que le container n'est pas
« arrivé » → « Vos colis France-Sénégal sont en cours d'acheminement. » ; une fois « arrivé » → « …sont bien arrivés à Dakar. Ils vont
arriver prochainement dans notre dépôt aux Parcelles Assainies. » (phrase du dépôt seulement pour le Sénégal ; Mali : « arrivés à
Bamako »). Le reste (montant, RIB, « avant l'arrivée ») est inchangé. Pas encore fait : version « colis déjà au dépôt » (étape
« Arrivée au dépôt » validée), proposée à Cobey, pas demandée.

### 03/11/2026 — Message de relance de paiement en 3 moments pour le Sénégal (dct-app v3.99.141, departs v2.22.14)
> Cobey : « il faut avoir arrivé au port de Dakar, après ça l'arrivée au dépôt de DCT, entre les deux il y a souvent 2 ou 3 jours d'attente, pour tout ce qui est administratif » ; « pour le 2 il faut quand même mettre Veuillez régler votre facture avant l'arrivée [...] et pour le 3 veuillez régler vos factures avant de récupérer vos colis » ; « pour le Mali, fais rien » ; « vas-y code » (après validation par Issyaka).

`_depTexteRelancePaiement`, selon les étapes du container (Sénégal) : (1) avant « Arrivée au port de Dakar » : « …sont en cours
d'acheminement. Veuillez régler votre facture avant l'arrivée. » ; (2) port fait, dépôt pas fait : « …sont bien arrivés à Dakar. Ils vont
arriver prochainement dans notre dépôt aux Parcelles Assainies. Veuillez régler votre facture avant l'arrivée. » ; (3) dépôt fait :
« …sont bien arrivés dans notre dépôt aux Parcelles Assainies. Veuillez régler vos factures avant de récupérer vos colis. » La phrase
du solde ne finit plus par « avant l'arrivée » (Sénégal). Mali : texte d'origine remis (« arrivent bientôt à Bamako » / « sont bien
arrivés à Bamako », « avant l'arrivée »). Même fonction pour la fiche du container et le Rapport financier. Testé : 7 cas (3 phases
colis, 2 livraison, 2 Mali), IBAN présent.

### 03/11/2026 — Relance de paiement : message 1 sans « Pour récupérer votre colis » (dct-app v3.99.142, departs v2.22.15)
> Cobey : « supprime "pour récupérer vos colis" du 1, pour le 2 et le 3 tu peux laisser ».

Sénégal, avant « Arrivée au port de Dakar » (colis) : la phrase du solde commence par « Merci de bien vouloir régler le solde restant de X € (sur un
total de Y €). » Moments 2 et 3 inchangés. La phrase de livraison (« Pour que nous puissions vous livrer votre colis… ») n'a pas été touchée.

### 03/11/2026 — Relance de paiement : message 1 livraison sans « Pour que nous puissions vous livrer » (dct-app v3.99.143, departs v2.22.16)
> Cobey : « Oui retire aussi pour le 1 ».

Sénégal, avant « Arrivée au port de Dakar », livraison : « Merci de bien vouloir régler le solde restant de X € (sur un total de Y €) pour la livraison. »
Moments 2 et 3 inchangés.

### 04/11/2026 — France : la liste des clients ne montre plus ceux déjà dans une tournée (dct-app v3.99.144)
> Cobey : « dans la case France, on a fait une collecte, la collecte de Sud, où il y a 7 clients [...] quand je reviens sur la liste des clients, je retrouve toujours cette Béatrice Colli là [...] marquée planifiée, mais ça porte à confusion. Il faudrait la retirer de la liste des clients une fois qu'elle est sélectionnée dans une tournée. Mais si de cette même tournée elle est supprimée, on la remettrait dedans. » Puis, sur les ramassés : « ils vont être validés par un collaborateur de DCT qui va le mettre dans un colis, dans un container » (déjà hors de la liste depuis v3.98.9).

`_frRenderFranceCorps` : sans collecte ouverte, la liste générale exclut les clients `statut === 'planifie'` (elle ne garde que « en attente »,
titre « Clients à planifier »). Un client retiré / annulé d'une tournée redevient « en attente » (code existant) et revient. L'intérieur d'une
collecte ouverte garde ses clients planifiés ; la recherche trouve toujours tout le monde (avec l'étiquette « Planifié »). Testé avec les vraies
données : 8 en attente visibles, 7 planifiés cachés ; Tournée sud : 7 clients ; retrait d'un client de sa tournée → il revient (9).
Constat non traité : la recherche France ne trouve pas un nom à plusieurs mots si on tape l'espace (« Diouldé DIA » → rien, « Diouldé » → trouvé).

### 04/11/2026 — France : la recherche trouve les noms à plusieurs mots (dct-app v3.99.145)
> Cobey : « oui corrige la recherche ».

`_frMatch` (recherche France, aussi dans le choix des clients d'une tournée et d'un camion) : le texte tapé ET les champs sont comparés sans espaces,
sans accents, sans majuscules ni ponctuation, et on cherche aussi dans prénom + nom et dans le nom d'affichage. « Diouldé DIA », « dioulde dia »,
« Béatrice Colli », « Colli Béatrice » trouvent maintenant. Non traité : un numéro tapé au format 06… ne trouve pas un numéro enregistré en +33 6….

### 04/11/2026 — « Retour » ramène à l'écran d'avant, partout (dct-app v3.99.146, departs v2.22.17)
> Cobey : « dans France, je clique sur les trucs d'archivage, en retour ça me laisse dans l'archive, alors qu'à la base j'étais rentré dans France » ; « je veux qu'en fait, dans tout, ce soit la même logique. Chaque fois qu'on appuie sur retour, on vient sur l'interface d'avant. »

Cause : ~80 boutons Retour avec une destination écrite en dur (liste des Départs, Espaces…). Ici : `goTo()` (dct-app.html) retient l'écran quitté
(`_navPile`, remise à zéro à l'accueil / aux Espaces / à la connexion). Un clic sur un bouton `.btn-back` exécute son ancien comportement (mises à jour,
remontée d'un niveau dans un dossier d'archive) mais, s'il veut quitter l'écran, on va à l'écran d'avant, retrouvé tel qu'on l'a laissé (`_navCapturer` :
France + onglet/collecte, Collecte + sous-onglet, container, Qui doit, Archive + niveau ; `_navRafraichir` : Départs, Espaces, liste des containers,
Clients). Sans historique, l'ancienne destination s'applique. La déconnexion (`s-login`) n'est jamais détournée. Cas de Cobey : le raccourci « N collectes
terminées » de France ouvre l'Archive (`depOuvrirArchiveDepuisFrance`) ; Retour revient à France.
Testé (vraies données, clics réels) : France > archive > Retour ; Départs > container > fiche > Retour x3 ; Rapport financier > container > fiche > Retour x3 ; Archive
imbriquée ; 74 écrans dont 68 avec bouton Retour, aucun écran blanc ; connexion, Mamadou, chauffeur inchangés.
Non couvert : un écran retrouvé qui n'est pas dans la liste ci-dessus est montré comme on l'a laissé (non redessiné).

---

## 8 · Nouveau look (V2) — chantier

### 04/11/2026 — Étape 1 : la base, l'écran de connexion et l'accueil (dct-app v3.99.147, departs v2.22.18, look.js v0.1.0)
> Cobey : « on va appeler le look actuel V1 et le look prochain V2, comme ça au cas où si un jour je voudrais rechanger on aura des versions » ;
> « je veux que moi je puisse, si je veux, décider de revenir à l'ancienne » ; « quand on va faire le changement, elle sera mise à jour pour
> tout le monde » ; « il faut aussi modifier l'écran d'accueil [...] l'écran où on choisit notre espace, notre profil avant le code. »

Posé : `look.js` + `look-v2.css` (V2 = couche activée par `html.look-v2`), réglage `dct_config/look` (V1/V2) pour toute l'équipe, bouton
Eric dans Réglages > APPARENCE (+ essai V2 sur son téléphone seulement), bouton soleil/lune et choix Automatique/Clair/Sombre (personnel, V2).
V2 déjà dessinée : écran de connexion (choix de l'espace, puis du profil), accueil « Où souhaitez-vous travailler ? » avec carte « Prochain
départ » et icônes à la place des emojis. **L'équipe reste en V1** (`LOOK_DEFAUT='v1'`) : rien ne change pour elle, hormis la case APPARENCE
visible d'Eric seul. Testé : V1 identique (74 écrans, 0 erreur), V2 clair et sombre, écriture et retour V1 dans Firebase.
Reste : redessiner les ~70 autres écrans + remappage des couleurs en dur pour le mode sombre ; puis passer `LOOK_DEFAUT` à `'v2'`.

### 04/11/2026 — V2 : carrousel des départs sur l'accueil (dct-app v3.99.148, departs v2.22.19)
> Cobey : « ce conteneur-là, il est déjà parti [...] celui en préparation, c'est sur celui-là qu'on travaille [...] pas possible de faire un truc du genre on swipe vers la gauche et on voit le conteneur suivant, et vers la droite le conteneur d'avant ? » ; « les clôturés, on les prend pas en compte, que ceux qui sont en cours ou en préparation, et éventuellement les suivants, peut-être pour Bamako. »

La grande carte de l'accueil V2 est un carrousel (`depDepartsCarte`, departs.js ; `carteDepart`, look.js) : tous les départs non clôturés, du plus ancien au plus
récent, qui s'ouvre sur celui où l'on travaille (le premier « en préparation », sinon le dernier parti). Glisser à droite = le départ d'avant, à gauche = le suivant ;
points de position ; un appui ouvre le container ; la position est gardée quand l'écran se redessine. Testé avec les vraies données (4 cartes : 2 BMK, DKR 25/10, DKR 22/11 ouvert). V1 inchangée.

### 04/11/2026 — V2 : cartes du carrousel colorées selon le statut (dct-app v3.99.149)
> Cobey : « ils ont tous la même couleur. Ça serait bien de les différencier selon leur statut, non ? » — « ok vas-y ».

Orange = en préparation, bleu = en route / parti, vert = arrivé (versions plus profondes en mode sombre). V1 inchangée.

### 04/11/2026 — Pastille MALI / SÉNÉGAL sur les cartes + correction Stockage (dct-app v3.99.150, departs v2.22.20)
> Cobey : « il faut différencier les chargements Mali et chargements Sénégal » ; « dans le stockage du dépôt à Dakar, tu as mis des clients qui étaient dans des chargements BMK [...] Isaka a passé le conteneur BMK arrivé à Bamako [...] le suivi des conteneurs Mali ne doit pas être mélangé avec ceux de Dakar » — « ok vas-y pour les deux ».

- Carrousel V2 : pastille 🇲🇱 MALI / 🇸🇳 SÉNÉGAL en haut à droite de chaque carte.
- Bug (ancien, pas lié à V2) : `_depDepartAuDepotDakar` prenait tout départ « arrivé », même Mali → ses clients apparaissaient au Dépôt Dakar (liste, compteur Stockage, étiquettes de livraison). Un container Mali est maintenant exclu. Aucune donnée touchée.

### 04/11/2026 — V2 : barre du bas Accueil · Clients · Suivi · Activité (dct-app v3.99.151)
> Cobey : « dans la maquette, il y avait des lignes en dessous avec client, accueil. Et là, il n'y a pas » ; « continue de faire les changements dans la suite que tu avais déjà programmée ».

Barre flottante en verre, V2 seulement (`#lk-dock`, look.js) : visible sur les écrans de liste (accueil, clients, suivi, activité, départs, stockage, France, collecte, planning…), cachée sur les formulaires et documents ; onglet actif en vert ; « Activité » masquée pour les profils sans activité. L'ancienne barre V1 est masquée en V2. V1 inchangée.

### 04/11/2026 — V2 : Départs, Container et mode sombre partout (dct-app v3.99.156)
> Cobey : « ok vas-y » (écrans Départs et Container).

- Cartes des départs, cartes clients, boutons, pastilles, alertes : surfaces en verre, boutons arrondis (V2 seulement).
- Mode sombre : `tools/gen_dark_remap.py` génère (depuis les sources) les versions sombres des couleurs écrites en dur (fonds pastel, textes foncés, règles CSS de departs.js / dct-app.html). `look-v2.css` passe à ~245 Ko (à alléger plus tard si besoin). Les teintes en ligne (ex. client livré) restent visibles. Écran « facture manuelle liée » et tuiles de l'accueil / Réglages corrigés.
- Pas encore fait : bouton d'action principal unique par client (maquette K), balayage des ~70 autres écrans en sombre. V1 inchangée (74 écrans identiques).

### 04/11/2026 — V2 : une action principale par client dans le container (dct-app v3.99.157)
> Cobey : « ok vas-y » (le gros bouton par client, comme dans la maquette).

Dans le détail d'un container (V2 seulement), chaque client a un grand bouton (Relancer le paiement / Prévenir / Avis demandé, sinon Facture) et les autres actions (Facture, Photos, Copier, Déplacer, Détacher) en petites icônes. Les boutons gardent leur code et leur clic ; `look.js` (`actionsClients`) ne change que la présentation, et la remet comme avant en V1.

### 04/11/2026 — V2 : France, Collecte, Planning, Suivi, Activité en sombre (dct-app v3.99.159)
> Cobey : « continue avec France et Collecte ».

Le remappage sombre couvre aussi les styles réécrits par le navigateur (`background: rgb(...)`, `white`) : carte de chiffres et barre de recherche de France, etc. Vérifiés en clair et en sombre : France, Collecte, Planning, Suivi, Activité. `look-v2.css` ~270 Ko. V1 inchangée (74 écrans identiques).

### 04/11/2026 — V2 : la barre du bas seulement sur les écrans principaux (dct-app v3.99.160)
> Cobey : « il y a des boutons qui n'ont pas forcément l'utilité d'être là tout le temps [...] la barre reste toujours là, mais elle sert à rien par moment » — « ok vas-y ».

Barre visible uniquement sur Accueil, Clients, Suivi, Activité ; cachée ailleurs (Départs, container, Stockage, France, Collecte, Planning…). V1 inchangée (74 écrans identiques).

### 04/11/2026 — V2 sombre : fil d'activité et traits de séparation (dct-app v3.99.162)
> Cobey : « en mode sombre, il y a des écrans pas du tout esthétiques, des fonds blancs, par exemple dans l'activité, la notification d'une personne qui s'est connectée, le fond est blanc et c'est très moche ».

Les lignes de connexion de l'Activité ont un fond bleu sombre ; les traits de séparation clairs (bordures écrites en dur) deviennent discrets en sombre dans toute l'appli. V1 inchangée.

### 04/11/2026 — V2 : couleurs pastel par case et par espace (dct-app v3.99.163)
> Cobey : « ce qu'on a perdu, que je trouvais pas mal : pour chaque espace une couleur en version pastel, et dans l'accueil pour chaque case des couleurs. Quelle est ton opinion ? » — « ok vas-y ».

Chaque case de l'accueil reprend la couleur pastel de V1 (teinte sur le verre ; version profonde en sombre) ; les 4 cartes d'espace de la connexion sont teintées (indigo, rose, cyan, rouge). Générées par `tools/gen_look_css.py` depuis les couleurs de departs.js. V1 inchangée.

### 04/11/2026 — V2 : teintes de l'écran de choix d'espace (dct-app v3.99.164)
> Cobey : « t'as pas mis pour l'écran de choix d'espace, celui où on rentre avant le code ».

Les teintes des 4 espaces (Direction, Bureau, Terrain, Administration) étaient écrasées par une règle plus prioritaire : corrigé, vérifié en clair et en sombre. V1 inchangée.

### 04/11/2026 — V2 : le fichier de style n'était pas rafraîchi sur les téléphones (dct-app v3.99.165)
> Cobey : « je suis passé à la 164, mais il n'y a aucune couleur qui apparaît ».

Cause : `<link href="look-v2.css?v=…">` était resté à 3.99.149 (mon `sed` ne reconnaissait pas ce numéro sans « v »), donc les téléphones gardaient l'ancienne copie du style. Remis à jour. **Penser à monter ce `?v=` à chaque commit** (voir CLAUDE.md) : `sed -i "s#look-v2.css?v=[0-9.]*#look-v2.css?v=NOUVEAU#"`.

### 04/11/2026 — Correction : « Modifier » du détail d'un départ (dct-app v3.99.166)
> Cobey : « quand je clique sur un conteneur et que je veux aller dans modifier en haut à droite, il me revient en arrière sur le choix d'un conteneur Sénégal ou Mali ».

Cause : le bouton Modifier porte la classe `btn-back` (style), et la navigation « Retour = écran d'avant » (v3.99.13x) le prenait pour un retour. Exclu par son id `dep-d-btn-modifier`. Testé : Modifier ouvre le formulaire, retour → détail → liste (V1 et V2). Aucun autre bouton `btn-back` sans flèche dans le code.

### 04/11/2026 — V2 : bouton flottant « Créer un départ » (dct-app v3.99.167)
> Cobey : « tu avais créé un petit bouton en bas à droite qui était créer un départ [...] dans l'application c'est toujours le même système que d'avant ».

Maquette I/J : en V2 le grand bouton vert du haut de la liste des départs devient une pastille flottante en bas à droite (même action, `depNouveau()`). CSS seulement. V1 inchangée.

### 04/11/2026 — V2 : rapprochement de la maquette (dct-app v3.99.168)
> Cobey : « l'application ressemble à la V1, il n'y a pas forcément de changement à part les couleurs [...] les nouveautés que tu m'avais montrées en maquette et en PDF, il n'y a rien » — « ok ».

Accueil : barre de recherche (Entrée → liste Clients déjà filtrée). Titres plus gros. Cartes de départ plus grandes. Container : grands chiffres (clients, arrivée) ; filtres Tous / Payés / Non payés en une seule barre. V1 inchangée.

### 04/11/2026 — V2 sombre : palette adoucie (dct-app v3.99.169)
> Cobey : « en mode sombre les couleurs ne matchent pas entre elles, le vert est assez fluo [...] des incohérences » — « ok vas-y ».

Mode sombre seulement : vert émeraude plus profond (#2E9E68, texte clair dessus) au lieu du vert fluo ; teintes des pastilles, boutons et liens adoucies ; cases de l'accueil moins saturées ; textes remappés moins brillants. Mode clair et V1 inchangés.

### 04/11/2026 — Rapport financier : nouvel ordre des cases (dct-app v3.99.170, departs v2.22.21)
> Cobey : « Pour le bilan financier, on va changer l'ordre : d'abord Bilan, Statistiques, Container Sénégal, puis Container Mali ».

Ordre : BILAN, STATISTIQUES, CONTAINERS SÉNÉGAL, CONTAINERS MALI. Chaque case ouvre toujours le même écran (testé).

### 04/11/2026 — MISE EN LIGNE DE V2 POUR TOUTE L'ÉQUIPE (dct-app v3.99.171)
> Cobey : « on déploie ça pour tout le monde, du coup, let's go. »

`LOOK_DEFAUT` passé de `'v1'` à `'v2'` (look.js). `dct_config/look` est vide dans Firebase (null), donc tout le monde prend V2 ; clair / sombre / automatique reste un choix personnel (bouton soleil/lune). **Pour revenir en arrière : Eric, Réglages > Apparence > V1 > Appliquer** (écrit `dct_config/look='v1'`, toute l'équipe repasse en V1 sans mise à jour). Testé : téléphone vierge → V2 dès l'écran de choix d'espace ; connexion ; carrousel et barre du bas ; retour V1 par Eric.
À savoir : une partie des ~70 écrans n'a que les couleurs / le mode sombre de V2, pas encore la nouvelle mise en page.

### 04/11/2026 — V2 : les cartes de l'accueil ne s'ouvrent que pour la case Départs (dct-app v3.99.173, departs v2.22.22)
> Cobey : « est-ce que l'équipe terrain voit les cartes que j'ai mises en gros ? En cliquant dessus ça amène à la case départ qu'ils n'ont pas [...] Ou alors ils voient les cartes, mais ils ne peuvent pas cliquer dessus. Juste, ils voient. »

Tout le monde voit les cartes (et peut les faire défiler). Seuls les profils qui ont la case Départs (`_depPeutCase('departs')` : direction, Aminata…) peuvent les ouvrir ; pour les autres elles ne sont pas cliquables (`lk-fixe`). Testé : Eric → clic ouvre le détail ; Samba (terrain) → 4 cartes visibles, clic sans effet, défilement OK.

### 04/11/2026 — Règle : on ne clôture un container que s'il est soldé (dct-app v3.99.174, departs v2.22.23)
> Cobey : « un conteneur clôturé doit être clôturé uniquement quand il est soldé. S'il reste du paiement, il ne doit pas être clôturé. J'ai clôturé un conteneur, mais en vrai il reste des gens qui n'ont pas payé. »

`_depNbImpayesDepart(id)` compte les clients du départ avec un reste à payer (colis + livraison, fiches fusionnées exclues). Dans Modifier, cocher « Clôturé » est refusé (message : « Impossible de clôturer : N clients n'ont pas tout payé ») ; l'enregistrement le refuse aussi. Testé : BMK et DKR avec impayés refusés ; départs sans impayé acceptés. **Les containers déjà clôturés ne sont pas touchés** : pour en rouvrir un, Modifier > décocher « Clôturé ».

### 04/11/2026 — Cartes de l'accueil : date réelle d'arrivée (dct-app v3.99.175, departs v2.22.24)
> Cobey : « dans les cartes où les conteneurs sont arrivés, il y a toujours marqué arrivée prévue. Or ils sont déjà arrivés. Je pense qu'il faudrait mettre la date où ils sont arrivés. »

Pour un container « arrivé », la carte affiche « Arrivé le JJ/MM » (horodatage de l'étape « Arrivée au dépôt », sinon du passage au statut arrivé) ; sans cette date, elle garde « Arrivée prévue ». Les autres statuts ne changent pas. Testé avec deux cas (étape validée / historique de statut).

### 05/11/2026 — Carte « En préparation » : décompte J-n avant le départ (dct-app v3.99.176)
> Cobey : « sur la carte en préparation, tu peux mettre un décompte jusqu'au prochain départ, par exemple J-17 ou J-16 » ; « pas besoin de la date d'arrivée [...] il faut toujours se baser sur la date de départ » ; « quand on change la date, il faut recalculer » — « ok vas-y ».

Pastille « J-n » sur la carte « En préparation » de l'accueil V2 (look.js `decompte`), calculée à chaque affichage depuis la date de départ prévue (jours calendaires, fuseau Paris) : J-17, J-1, « Départ aujourd'hui » le jour même ; date dépassée ou absente → rien. Aucun décompte sur les cartes « en route » / « arrivé ». Testé : +17, +1, 0, -1, +24 jours.

### 05/11/2026 — Cartes de l'accueil : date de départ sous le nom (dct-app v3.99.177)
> Cobey : « pour les conteneurs arrivés, on ne sait pas de quel conteneur on parle, de quel départ [...] également pour les conteneurs en route » — « oui ».

Sous le nom, « départ du JJ/MM » sur les cartes « en route » et « arrivé » (deux « Chargement BMK » se distinguent : 13/09 et 27/09). Pas sur « En préparation » : la date de départ est déjà en bas de la carte, avec le J-n. V1 inchangée.

### 05/11/2026 — Accueil : plus de bénéfice sous « Rapport financier » (dct-app v3.99.178, departs v2.22.25)
> Cobey : « dans la case rapport financier on voit le montant des bénéfices en sous-titre. Je veux retirer ça, c'est trop visible. On va le laisser à l'intérieur. »

La case de l'accueil affiche « Bilan, statistiques, containers » au lieu du bénéfice. Le bénéfice reste visible dans Rapport financier > case Bilan. Valable en V1 et V2.

### 05/11/2026 — Pastille de statut : l'étape réelle au lieu de « Parti » (dct-app v3.99.179, departs v2.22.26)
> Cobey : « il y a un conteneur de Dakar, son statut est parti [...] ça devrait être en cours de navigation plutôt » — « ok vas-y ».

`depStatutLabel` : pour un départ « parti », la pastille affiche l'étape du suivi transport — « En cours de navigation » (après Départ de Mitry), « Arrivé au port de Dakar » (après navigation / port), « En route vers Bamako » (Mali, après le port). Le statut enregistré reste « parti » (aucune donnée modifiée) ; sans étapes, la pastille reste « Parti ». Testé sur les listes Sénégal et Mali.

### 05/11/2026 — V2 : icônes des cases Départs (cargo) et Mamadou Niass (colis remis) (dct-app v3.99.180)
> Cobey : « l'icône de Mamadou Niass ne correspond pas à lui, on a mis un camion, mais c'est l'opérateur qui donne les colis aux clients à Dakar » ; « même l'icône de départ, c'est un colis, alors que le départ concerne les conteneurs » — « Choix A ».

Départs : cargo (Lucide « ship »). Mamadou Niass : colis avec coche (Lucide « package-check »). Collecte garde le camion. Dans `tools/gen_look_css.py`, une icône peut maintenant avoir plusieurs tracés. V2 seulement (V1 garde ses emojis).

### 05/11/2026 — Activité : la ligne « s'est connecté » n'a plus de fond (dct-app v3.99.181)
> Cobey : « dans les notifications de l'activité, quand quelqu'un se connecte, sa notification est entourée d'un fond, alors que pas les autres. C'est pas trop beau au final. »

Les lignes de connexion (visibles par Eric) n'ont plus de fond ni de trait bleu : elles ressemblent aux autres lignes. V1 et V2. Barre du bas : inchangée (essai de retrait annulé à la demande de Cobey).

### 05/11/2026 — Facture : boutons toujours visibles + fin de la boucle « Facture ↔ PDF » (dct-app v3.99.182, departs v2.22.27)
> Cobey : « quand on consulte une facture, les boutons sont tout en bas après les conditions générales [...] pas trop pratique » — « ok, parfait » ; « je appuie sur PDF, ça ouvre la facture en PDF, je descends pour appuyer retour, et quand j'appuie sur le bouton facture en haut à gauche, ça me renvoie la facture en PDF. J'arrive pas à revenir sur l'application. Peux-tu vérifier ? »

1. Facture (écran `s-facture-publique`) : « Retour » collé en haut (pastille) ; « Imprimer / PDF », « Envoyer par WhatsApp » et « Copier le message » collés en bas de l'écran. Ils n'ont plus besoin du défilement jusqu'aux conditions générales.
2. Bug de navigation (introduit par « Retour = écran d'avant », v3.99.13x) : la pile était Facture → Facture PDF → Documents ; « ← Facture » sur Documents reculait d'un cran (retour à la Facture PDF), en boucle. `goTo` : si le bouton vise un écran présent plus bas dans la pile, on y va directement et on vide la pile jusque-là. Testé en rejouant ce parcours : Retour → Documents, « ← Facture » → Facture.

### 05/11/2026 — Facture : barre de titre avec icônes (dct-app v3.99.183, departs v2.22.28)
> Cobey : « les boutons que tu as mis [...] c'est pas très beau, on dirait des boutons collés sur la page. Faut changer l'approche. » — choix « B ».

Les gros boutons collés (v3.99.182) sont remplacés par une barre de titre collée en haut de la facture : « ‹ Facture » à gauche, et à droite les icônes Imprimer/PDF, WhatsApp, Copier. Pour un visiteur non connecté (lien client) : titre + Imprimer/PDF seulement. Plus aucun bouton en bas. Correction au passage : la v3.99.182 avait par erreur redéfini la classe `.fac-topbar` (le liseré vert du haut des documents) ; rétabli. La navigation Retour → Documents → « ← Facture » reste corrigée.

### 05/11/2026 — Écran Documents : liste d'actions (dct-app v3.99.184, departs v2.22.29)
> Cobey : « la page de consultation des documents, là où on peut imprimer, consulter la facture, imprimer les étiquettes, copier le message WhatsApp. Je trouve cette page vraiment moche. Peut-on trouver autre chose ? » — choix « B ».

Les 4 gros boutons de couleur empilés sont remplacés par un bandeau « Collecte validée » (avec nom du client et n° de facture) et une liste : Facture en PDF, Étiquette du colis, Envoyer par WhatsApp, Copier le message (icône, titre, explication, flèche). « Retour à la tournée » devient un lien discret, toujours masqué hors tournée. Mêmes fonctions qu'avant ; clair / sombre / V1.

### 05/11/2026 — Cartes de l'accueil : clients restant à solder (dct-app v3.99.185, departs v2.22.30)
> Cobey : « sur les cartes, le nombre de clients qui restent à solder, parce qu'un conteneur ne se clôture que quand tout le monde a payé, voir les clients manquants justifierait pourquoi la carte est encore affichée » — « ok vas-y pour les deux ».

Cartes « en route » et « arrivé » : pastille « N clients à solder » (clients avec un reste à payer, colis + livraison) ou « Tout est soldé ✓ » (signal qu'on peut clôturer). Rien sur « En préparation ». Nombre de clients seulement, jamais de montant ; visible par tous ceux qui voient les cartes (terrain compris). Calcul : `_depNbImpayesDepart` (departs.js), exposé par `depDepartsCarte` (`impayes`).

### 05/11/2026 — Cartes de l'accueil : « N impayés » en rouge (dct-app v3.99.186)
> Cobey : « je pense que la couleur des clients qui restent à solder devrait être rouge » ; « trouve une autre phrase que client non soldé, c'est pas très explicatif » — choix « 1 » : « 31 impayés ».

La pastille « N clients à solder » devient « N impayés » (« 1 impayé » au singulier), en rouge. « Tout est soldé ✓ » reste blanc / vert.

### 05/11/2026 — Cartes de l'accueil : « Tout est soldé ✓ » en vert plein (dct-app v3.99.187)
> Cobey : « les couleurs ne sont pas cohérentes, l'un est en full rouge, l'autre blanc avec écriture verte [...] c'est bizarre » — « ok vas-y ».

Les deux pastilles ont maintenant le même modèle : « N impayés » rouge plein, « Tout est soldé ✓ » vert plein, texte blanc.

### 05/11/2026 — Photos de profil (dct-app v3.99.188, nouveau fichier `photos.js`)
> Cobey : « c'est possible de mettre des photos de profil au lieu des icônes ? Moi j'ai AD, au lieu de voir AD, une photo de profil » ; « tout le monde peut changer sa photo de profil, tu la mets dans l'accueil, dans la connexion et dans l'activité aussi ».

- Toucher sa pastille en haut à droite de l'accueil ouvre un menu : Ajouter/Changer ma photo, Retirer ma photo, Se déconnecter (la pastille déconnectait directement avant : un geste de plus pour se déconnecter).
- Photo recadrée en carré 192 px, JPEG (~10 Ko), écrite dans Firebase `dct_profils_photos/<ID>` ; copie dans le téléphone (`dct_profils_photos_cache`) pour l'écran de connexion (avant le code, donc : la photo n'y apparaît qu'après une première connexion sur ce téléphone).
- Affichée : accueil (pastille), cartes de profil à la connexion, Activité (photo de l'auteur, l'emoji de l'action devient un petit badge). Pas de photo : initiales comme avant. V1 et V2.
- Limite : l'Activité retrouve l'auteur par son prénom (liste COLLABS) ; Mamadou Niass (appli à part) n'a pas de photo ici. Écriture réelle dans Firebase non testée (comptes lecture seule) : à vérifier au premier essai.

### 05/11/2026 — Photos de profil : correction de la lenteur (dct-app v3.99.189)
> Cobey : « Je viens de valider ma photo de profil. Juste après, j'essaye de naviguer dans l'application. Je vois des grosses lenteurs. » puis « Une fois que j'ai retiré ma photo de profil, l'application est redevenue fluide. »

Cause : la v3.99.188 recopiait la photo (18 Ko) dans le style de chaque ligne de l'Activité (150 lignes) : 1,6 Mo de DOM, un passage mesuré à 24 s (contre 28 ms sans photo). Correctif (`photos.js`) : la photo n'est écrite qu'une fois dans une feuille de style (`[data-ph="ID"]`), les éléments portent seulement l'attribut `data-ph`. Mesuré après : 30 ms avec photos, DOM 45 Ko. À retenir : ne jamais recopier une image en base64 dans plusieurs éléments.

### 05/11/2026 — Photos de profil : cadrage dans le rond (dct-app v3.99.190)
> Cobey : « j'ai mis une photo de profil mais elle n'est pas bien cadrée, c'est possible que je puisse bien la cadrer dans le rond ? »

Après le choix de la photo, un écran « Cadre ta photo » : on déplace la photo avec le doigt, on zoome au pincement ou au curseur (jusqu'à ×4), puis « Valider » (ou « Annuler », la photo actuelle reste). Résultat : carré 192 px, JPEG, comme avant. Pour re-cadrer une photo déjà posée, il faut la rechoisir (l'original n'est pas gardé, seulement la version réduite). Testé : glisser, zoomer, valider, annuler (souris ; le tactile utilise les mêmes évènements « pointer »).

### 05/11/2026 — Activité / notifications : actions de l'admin visibles + filtre par case (dct-app v3.99.191)
> Cobey : « rends visibles mes actions pour tout le monde (ceux qui ont les notifications) » ; « les notifications s'affichent pour ceux qui ont les outils concernés : le rapport financier, uniquement ceux qui ont cette case [...] cette logique s'applique à toutes les cases » ; lignes non reconnues : direction seulement « ok » ; connexions : « tout ceux qui ont activité » ; annonces (case Notification) : « que à moi » (compris : rien ne change, la case reste réservée à la direction, envoi à toute l'équipe).

- `addActivity` n'ignore plus l'admin ; chaque ligne reçoit sa/ses cases (`cle`, ex. `departs,collecte`) ; les anciennes lignes sont classées d'après leur texte (`_activiteCases`, 150/150 reconnues sur l'historique réel). Une ligne n'est vue que par ceux qui ont l'une de ces cases (`_depPeutCase`). Non reconnue → direction seulement. La pastille (nombre de nouveautés) suit le même filtre.
- Les lignes « untel s'est connecté » (dct_connexions) sont visibles de tous ceux qui ont l'Activité ; « Effacer » vide les connexions pour soi seulement (`dct_config/activite_deleted/<ID>_connexions`). La connexion d'Eric lui-même n'est toujours pas enregistrée.
- Samba, Ibrahima, Boubacar : toujours pas d'Activité.
- Testé : l'admin écrit dans le fil ; sur 4 lignes (dépense, départ, planning, connexion) Eric voit 4, Aminata 3 (pas la dépense), Samba 2.

### 05/11/2026 — Activité : la connexion d'Eric apparaît aussi (dct-app v3.99.192)
> Cobey : « Oui, ma connexion peut être affichée dans le fil. »

La connexion de l'admin est maintenant enregistrée (`dct_connexions`) comme celle des autres et affichée dans le fil (« Eric s'est connecté(e) »). Sa propre pastille ne la compte pas. Testé : après connexion, 1 entrée « Eric / AD » et la ligne s'affiche.

### 05/11/2026 — Activité : actions qui n'écrivaient rien dans le fil, maintenant tracées (dct-app v3.99.194, departs v2.22.31)
> Cobey : « il faut que tu vérifies toutes les nouveautés qu'il y a sur l'application pour les remettre dans les activités, parce qu'on a dû ajouter de nouveaux outils qui ne sont peut-être pas référencés. » (exemple : une dépense de carburant ajoutée dans le Rapport financier)

Inventaire par script (toutes les fonctions qui écrivent dans Firebase, avec/sans trace dans le fil), puis ajout des traces manquantes (chacune classée dans sa case pour le filtre) :
- Rapport financier : dépense fixe ajoutée / retirée ; dépense de tournée ajoutée / retirée → case Rapport financier.
- Devis : créé, modifié, refusé et supprimé → Devis. Facture manuelle supprimée → Facture manuelle.
- Prix articles : article ajouté / modifié / supprimé, thème renommé / supprimé → Prix articles.
- Départs : étape de suivi annulée → Départs.
- Réglages (direction) : code PIN réinitialisé ou modifié, passe-partout défini / supprimé, code d'accès d'un espace défini / supprimé, profil ajouté / retiré de l'équipe, message de l'écran de connexion publié / retiré, collecte restaurée depuis une sauvegarde. Jamais de code ni de mot de passe dans le texte.
- Classement : « chauffeur externe » (ajout d'un camion) passe de Planning à Collecte / France ; « sauvegarde » → Réglages.
Volontairement non tracé : tâches techniques (références clients, rangs, nettoyages, sauvegarde quotidienne, corbeille automatique, photos de fiche). Testé : une dépense fixe ajoutée écrit bien une ligne classée Rapport financier ; 13 textes types classés dans la bonne case.
Non audité en profondeur : mamadou.html et chauffeur.html (une trace chacun via `activiteExterne`).

### 05/11/2026 — Photos de profil : rond parfait et cadrage plus sûr (dct-app v3.99.195)
> Cobey (capture à l'appui) : « ma photo dans la notification n'a pas l'air d'être arrondie, on dirait un octogone ».

Forme non reproduite en test (rayon 50 % bien appliqué sur ordinateur) ; durcissements : `border-radius:50% !important` sur toutes les photos de profil ; cadrage (`photos.js`) : la photo est lue avec son orientation (`createImageBitmap … from-image`, sinon `Image`) au lieu de `naturalWidth/Height` seuls (les photos d'iPhone portent une rotation dans le fichier : le rectangle découpé pouvait sortir de l'image et laisser des bandes noires) ; fond blanc sous l'image ; plus de bords noirs possibles. Les photos déjà enregistrées ne sont pas modifiées : à remettre si le défaut persiste.

### 05/11/2026 — Photos de profil : vraie cause de « l'octogone » (dct-app v3.99.196)
> Cobey (2e capture) : la photo dans l'Activité garde des bords plats.

Cause trouvée en rendant le rond à fort grossissement : le rond de l'Activité a une bordure de 1,5 px (presque transparente) ; l'image de fond (`no-repeat`) ne couvrait que l'intérieur de la bordure (carré de 35 px) alors que le rond s'étend sur 38 px → l'image carrée coupait le rond (flancs plats, coins arrondis = « octogone »). Correctif : `background-origin` et `background-clip` en `border-box` pour toutes les photos. Les photos enregistrées n'ont pas à être remises (le défaut n'était que dans l'affichage ; le correctif de v3.99.195 sur l'orientation reste utile pour les nouvelles).

### 05/11/2026 — Fenêtre « Nouveauté » : photo de profil (dct-app v3.99.197)
> Cobey : « à leur prochaine connexion, un pop-up pour leur indiquer la nouveauté qu'ils peuvent maintenant mettre une photo de profil, et expliquer comment [...] comme dans une application, on le voit à la première connexion, après ça disparaît » — « ok vas-y » ; même texte pour Samba, Ibrahima, Boubacar ; pas prévu pour Mamadou ni les chauffeurs (autres applis).

`photos.js` : système de nouveautés (liste `NOUVEAUTES`, une entrée pour l'instant : `photo_profil`). À l'arrivée sur l'accueil (≈1,5 s), si la personne n'a pas de photo et n'a jamais vu la nouveauté : fenêtre avec les 3 étapes ; « Ajouter ma photo maintenant » ouvre le choix de photo, « Plus tard » ferme. Mémorisé par personne dans Firebase `dct_nouveautes_vues/<ID>/<nouveauté>` (+ copie locale) : ne revient plus, sur aucun téléphone. Qui a déjà une photo : rien affiché, marqué comme vu. Testé : 1re connexion, « Plus tard », retour accueil, autre téléphone, autre personne, « Ajouter », personne avec photo. Pour une future nouveauté : ajouter une entrée à `NOUVEAUTES`.

### 05/11/2026 — Accueil : titre et recherche retirés (dct-app v3.99.198, departs v2.22.32)
> Cobey : « le "Où souhaitez-vous travailler" et la recherche client, je sais pas si c'est nécessaire » ; la recherche fait doublon avec la case et l'onglet Clients ; rien à mettre à la place — « ok vas-y ».

Le titre « Où souhaitez-vous travailler ? » (V1 et V2) et la barre de recherche de l'accueil (V2) sont retirés : l'accueil commence par « Bonjour Eric ! », puis les cartes et les cases. Le code de la recherche reste dans `look.js`, désactivé.

### 05/11/2026 — Bandeau animé de l'accueil + réglage BANDEAU (dct-app v3.99.199, departs v2.22.33, nouveau `bandeau.js`)
> Cobey : « on pourrait mettre un bandeau animé où je pourrais leur envoyer des messages [...] un bandeau pour tout le monde peut le voir, je veux quelque chose d'animé, dynamique » ; « d'autres couleurs, puisque ça se mélangerait aux couleurs des cartes » ; « maintenant que les messages sont là, c'est plus la peine de mettre les messages dans l'écran des espaces avant de se connecter. Et fais-moi une case spéciale dans les réglages » (choix B : messages qui alternent, recommandé).

- Accueil (toute l'équipe, V1 et V2) : bandeau sous « Bonjour … » ; un message = fixe, plusieurs = alternent toutes les 5 s (glissement, barre de progression, lueur, icône qui pulse). Couleurs : Info violet, Attention rose, Urgent rouge profond (aucune ne ressemble aux cartes). Croix : ferme pour la personne ; revient pour un message nouveau ou modifié (`dct_bandeau_ferme`, local). Date de fin facultative (le message disparaît tout seul).
- Réglages : la case MESSAGE est remplacée par **BANDEAU** (réservée à Eric) : liste des messages (modifier / supprimer), formulaire titre (60 car.) + détail (90) + couleur + date de fin, aperçu en direct. Chaque publication / modification / suppression est tracée dans l'Activité (case Réglages).
- Écran de connexion : le message n'est plus affiché (`chargerMessageAdmin` masque la zone). L'ancien message `dct_config/message` reste en base, inutilisé.
- Testé : création de 3 messages (1 expiré → non affiché), rotation à 5 s avec changement de couleur, croix, réapparition pour un nouveau message, zone de connexion masquée.

### 05/11/2026 — Bandeau : les textes longs défilent (dct-app v3.99.200)
> Cobey : « le texte est très long, il ne défile pas de gauche à droite, il reste immobile. Moi je voulais que le texte défile » — seuls les textes trop longs défilent (recommandé) — « ok vas-y ».

`bandeau.js` : une ligne (titre ou détail) plus large que le bandeau défile doucement (≈55 px/s, pause de 1,6 s au début et 1,4 s à la fin) ; le message reste affiché le temps du défilement, la barre de progression suit ; un message court reste fixe. Un message long seul se rejoue en boucle. Limites de saisie élargies (titre 300, détail 500 caractères). Testé : texte de 1122 px dans 266 px → pause, défilement, décalage −140 puis −473 px ; message court : fixe, aucune animation.

### 05/11/2026 — Bandeau : le défilement marche aussi avec « Réduire les animations » (dct-app v3.99.201)
> Cobey : « je viens de vérifier, mais ça ne défile toujours pas. Pourtant je suis sur la bonne mise à jour. »

Cause probable : le défilement de v3.99.200 était coupé quand le téléphone a « Réduire les animations » (Réglages iPhone > Accessibilité > Mouvement) — le texte restait coupé par « … ». Défilement refait à la main (`requestAnimationFrame`), qui ne dépend ni de ce réglage ni de `Element.animate()`. Testé avec le mode « mouvement réduit » forcé : le texte avance (0 → −141 → −475 px). Les effets décoratifs (lueur, icône qui pulse) restent coupés dans ce mode.

### 05/11/2026 — Bandeau : plus de croix (dct-app v3.99.202)
> Cobey : « je vois également une croix. Il faut la retirer. Le message disparaîtra que quand moi je déciderai. »

La croix de fermeture est retirée : un message du bandeau ne disparaît que quand Eric le supprime (Réglages > BANDEAU) ou que sa date de fin est passée. Le texte de l'aide dans Réglages est mis à jour.

### 05/11/2026 — Bandeau : le texte défile enfin à la connexion (dct-app v3.99.203)
> Cobey : « ça ne bouge toujours pas. La seule chose qui bouge, c'est un genre de reflet. Mais le texte en lui-même ne défile pas. » (donc le mode « Réduire les animations » n'était pas en cause)

Vraie cause (reproduite) : à la connexion, le bandeau est construit avant que l'écran d'accueil soit affiché ; sa largeur est alors nulle, donc le texte ne peut pas être mesuré et ne défile pas (cas d'un seul message : aucun nouvel essai). Correctif (`bandeau.js`) : si le bandeau n'est pas encore à l'écran, on réessaie toutes les 0,3 s jusqu'à ce qu'il le soit, puis on mesure et on lance le défilement ; et on recalcule si la fenêtre change de taille. Testé : bandeau construit pendant que l'accueil est caché → 0 puis −104 px après 3 s ; cas normal inchangé.

### 05/11/2026 — Activité : les actions d'administration ne sont vues que par Eric (dct-app v3.99.204)
> Cobey : « j'ai mis le message [du bandeau]. Dans la logique, il n'y a que moi qui le vois, vu qu'il n'y a que moi qui ai la case ? » → non : la direction a toutes les cases (Réglages compris). — « ok vas-y » (ces lignes seulement pour moi).

Nouvelle catégorie `admin` dans le filtre de l'Activité (`_activiteCases` / `_activiteVisibleCles`) : bandeau, bascule V1/V2, codes PIN, passe-partout, codes d'espace, équipe (ajout / retrait de profils), message de connexion → visibles d'Eric seul. Les autres actions de Réglages (ex. restauration d'une sauvegarde) restent visibles de la direction. Les lignes déjà écrites avec la case « reglages » sont reclassées d'après leur texte. Testé : bandeau / look / PIN / passe-partout / équipe → Eric seul ; sauvegarde et dépense fixe → Eric, Issyaka, Abdoulaye ; départ → + Aminata.

### 05/11/2026 — Bandeau : pastille « NOUVEAU » (dct-app v3.99.205)
> Cobey : « une mention nouveau message pour une personne qui vient de se connecter et qui voit le message ; si elle se déconnecte et se reconnecte, elle ne voit plus la mention vu qu'elle avait déjà lu ; quand il y aura un autre message nouveau, la mention reviendra pour lui » — « ok vas-y ».

`bandeau.js` : pastille jaune « NOUVEAU » (qui pulse) devant le titre d'un message que la personne n'a pas vu lors d'une connexion précédente. Mémoire par personne dans Firebase `dct_bandeau_lus/<ID>/<message> = horodatage`. La liste est lue une fois par connexion et ne bouge pas pendant la session (la pastille reste jusqu'à la connexion suivante) ; ce qui a été affiché est enregistré comme vu. Un message modifié redevient nouveau. L'auteur ne voit pas « NOUVEAU » sur son propre message. Déconnexion (`goTo('s-login')`) = nouvelle session. Testé : 1re connexion (A, B nouveaux) → 2e (aucun) → C publié (seul C) → A modifié (seul A) → autre personne (tous nouveaux), puis plus rien à sa 2e connexion.

### 05/11/2026 — Bandeau : l'auteur voit aussi « NOUVEAU » (dct-app v3.99.206)
> Cobey : « si c'est moi qui le mets, il devrait avoir la pastille nouveau aussi, tant que je ne l'ai pas lu. »

Plus d'exception pour l'auteur : le message qu'Eric publie porte « NOUVEAU » chez lui comme chez les autres, jusqu'à sa connexion suivante. Testé : publié via Réglages → « NOUVEAU » à l'accueil ; reconnexion → plus de pastille.

### 05/11/2026 — Planning : photos de profil à côté des prénoms (dct-app v3.99.207, departs v2.22.34)
> Cobey : « dans le planning, à côté des noms, j'aimerais avoir la photo de profil de chaque personne, et aussi dans le petit carré de planning, à côté du prénom. »

`photos.js` : `photosProfil.avatar(id, px)` = petit rond (photo, sinon initiales aux couleurs du profil). Écran Planning > L'équipe : un rond devant chaque nom ; case Planning de l'accueil : un rond devant chaque prénom disponible. Les deux se redessinent quand une photo change (écoute Firebase). Testé : case avec la photo d'Issyaka ; écran : 30 ronds dont 5 photos (reste = initiales).

### 05/11/2026 — Photo mise d'office pour Abdoulaye (dct-app v3.99.208)
> Cobey : « en attendant que chacun mette sa photo, on va en mettre une d'office pour certains » ; (photo envoyée) « celle-là pour Abdoulaye, tu centres sur sa tête et tu la mets ».

Mon accès à la base est en lecture seule : la photo est donc livrée avec l'appli. Recadrée sur le visage (carré 192 px, `photos-defaut/AB.jpg`) et déclarée dans `DEFAUT` (photos.js). Elle s'affiche partout où une photo s'affiche (pastille d'accueil, connexion, Activité, Planning) et la fenêtre « Nouveauté » ne s'affiche pas pour lui. Dès qu'Abdoulaye enregistre sa propre photo, la sienne remplace celle-ci. Pour ajouter d'autres photos d'office : déposer `photos-defaut/<ID>.jpg` et ajouter l'ID dans `DEFAUT`. Le bouton « Photo » par personne dans Réglages > Équipe (proposé) n'est pas fait : en attente de la réponse de Cobey.

### 05/11/2026 — Photo d'office d'Abdoulaye : annulée (dct-app v3.99.209)
> Cobey : « ANNULE, il en a déjà une. »

Abdoulaye a déjà mis sa propre photo : la photo d'office (v3.99.208) est retirée (`photos-defaut/AB.jpg` supprimé, `DEFAUT` vidé dans photos.js). Le mécanisme reste prêt pour d'autres personnes. La nouvelle image reçue (« voilà pour Abdoulaye ») n'a pas été utilisée.

### 05/11/2026 — Photo d'office pour Ibrahima (dct-app v3.99.210)
> Cobey : « mets celle-là pour Ibrahima » (photo de face, crâne rasé, barbe grise).

`photos-defaut/IB.jpg` (recadrée sur le visage, 192 px) ; `DEFAUT = { IB: … }` dans photos.js. S'affiche partout où une photo s'affiche ; remplacée par la sienne dès qu'il en enregistre une ; pas de fenêtre « Nouveauté » pour lui. Testé : rond photo dans Planning, fichier servi (200).

### 05/11/2026 — Photos d'office : Boubacar, Samba, Aminata (dct-app v3.99.211)
> Cobey : « photo 1 pour Boubacar, photo 2 pour Samba, photo 3 Aminata. »

`photos-defaut/BO.jpg`, `SA.jpg`, `AM.jpg` (recadrées sur le visage, 192 px) + entrées dans `DEFAUT` (photos.js), comme Ibrahima. Aminata n'apparaît pas dans le Planning (elle n'y participe pas) mais a sa photo à l'accueil, à la connexion et dans l'Activité. Les images sources sont petites et la photo d'Aminata est sombre : à remplacer par de meilleures si Cobey en a.

### 05/11/2026 — Photo d'office pour Issyaka (dct-app v3.99.212)
> Cobey : « ajoute pour Issyaka » (photo : casquette noire, barbe, sourire).

`photos-defaut/IS.jpg` (recadrée sur le visage, 192 px) + entrée `IS` dans `DEFAUT` (photos.js).

### 05/11/2026 — Carnet clients : fin des doublons de numéro (dct-app v3.99.213, departs v2.22.35)
> Cobey (capture : « M. Mamadou Loum » et « Mamadou Loum » en double) : « à la base c'était pas possible d'avoir le même client en doublon, c'était bloqué via son numéro. Tu peux vérifier ? » — « ok » aux 3 propositions.

Cause : la clé d'une fiche du carnet (`dct/contacts/<clé>`) = numéro sans espaces ; mais seuls les espaces ordinaires étaient retirés. Un numéro copié depuis les contacts iPhone contient des espaces insécables et des marques invisibles (U+202A/U+202C) → « +33 7 73… » ≠ « +33773… » → deuxième fiche (cas typique : inscription France & Europe par Issyaka après une fiche d'Eric). 11 clés sur 41 en contenaient ; 2 vrais doublons (Mamadou Loum, Masamba Mbaye).
1. `_telNet` (nettoyage) et `_telCmp` (chiffres seulement, 0773… = +33773…) ; `_cleCarnet` réutilise la clé d'une fiche qui a déjà ce numéro. Tous les endroits qui fabriquaient une clé ou comparaient des numéros (dct-app.html, departs.js : inscription, modification de fiche, France, import CSV, suppression, recherche) passent par là.
2. Nettoyage une seule fois, lancé par Eric à sa première connexion (marqueur `dct_config/nettoyage_carnet_v1`, ~9 s après la connexion) : fusion des fiches de même numéro (la plus complète sert de base, les autres comblent ses trous ; l'ancienne va à la corbeille 30 jours, type « contact ») et clés remises à plat. Une ligne dans l'Activité (Eric seul n'est PAS appliqué : visible par ceux qui ont Client) et un message à l'écran.
3. Testé avec la copie réelle des 41 contacts : 41 → 39 fiches, 0 clé spéciale, Loum et Mbaye fusionnés (fiche d'Eric gardée), 2e passage sans effet, base de test identique à la mémoire.
Non traité : doublons éventuels côté fiches France (`france/clients`) ou clients d'une collecte — seul le carnet l'était. Ne touche pas aux fiches de clients des collectes.

### 05/11/2026 — Carnet : le nettoyage de la v3.99.213 n'avait rien écrit dans la base → corrigé (dct-app v3.99.214)
> Cobey (capture : recherche « LOUM » → « Aucun résultat ») : « maintenant il n'y a plus de Mamadou Loum ».

Constat dans la base (lecture seule) : les 2 fiches Loum et les 11 clés à caractères invisibles étaient toujours là, aucune entrée de corbeille, marqueur posé ; la v1 du nettoyage avait modifié la MÉMOIRE du navigateur d'Eric et marqué « fait » sans que l'écriture dans Firebase soit confirmée. Résultat : sur son écran, Loum avait disparu alors que la base était intacte (rien n'a été perdu).
v2 : le nettoyage lit le carnet dans Firebase (pas la mémoire), écrit directement (`update` en un bloc), n'annonce et ne pose le marqueur (`dct_config/nettoyage_carnet_v2`) qu'une fois l'écriture confirmée, sinon message d'erreur visible et nouvel essai à la connexion suivante ; fiches de corbeille écrites après succès. Il relancera donc à la prochaine connexion d'Eric (≈9 s) et rétablira Loum (fiche fusionnée, clé propre).
Testé : base de test à l'état réel (58 fiches, Loum absent de la mémoire) → base 55 fiches, 0 clé spéciale, Loum et Mbaye fusionnés, recherche « LOUM » trouve la fiche, 2e passage sans effet.

### 05/11/2026 — Case Client : tous les clients de toutes les branches, même supprimés (dct-app v3.99.215, departs v2.22.36)
> Cobey : « dans la case client, il doit y avoir tous les clients inscrits par n'importe quelle branche de l'application. Comme ça, même si on les supprime d'une collecte ou d'une tournée France, on a toujours leurs coordonnées pour les appeler plus tard. »

1. Liste de la case Client (`getAllContacts`) : carnet + clients des collectes + **clients France** + **dépôt direct** (avant : France seulement s'ils avaient été copiés au carnet ; 7 clients France nommés manquaient).
2. Plus de perte à la suppression : `_garderDansCarnet(fiche)` copie les coordonnées au carnet (si absentes) avant la suppression d'un client de collecte (`confirmDelete`), d'une collecte entière (`_effacerCollecte`) et d'un client du dépôt (`depSupprimerDepot`). Le côté France le faisait déjà (`_versCarnet`).
3. Rattrapage (une fois, par Eric, marqueur `dct_config/nettoyage_carnet_v3`, ~9 s après sa connexion) : tous les clients des collectes (50 collectes en base, y compris celles qui ne s'affichent plus), de France et du dépôt qui ne sont pas dans le carnet y sont ajoutés (comparaison par numéro, un seul contact par personne, doublons déjà fusionnés). Testé sur la copie réelle : carnet 55 → 334 fiches, 0 doublon de numéro, tous les clients France nommés dans la liste, 2e passage sans effet.
Note : 334 fiches contre ~75 visibles avant → la liste de la case Client sera nettement plus longue (c'est voulu : annuaire de tous les clients passés).

### 05/11/2026 — Case Client : les devis aussi (dct-app v3.99.216, departs v2.22.37)
> Cobey : « y a aussi le passage par un devis. »

Les clients passés par un devis (`devis/`, 1 en base) rejoignent la case Client : affichés en direct (`getAllContacts`), copiés au carnet quand le devis est créé, modifié, refusé/supprimé (`_garderDansCarnet`), et ajoutés par le rattrapage (marqueur passé à `dct_config/nettoyage_carnet_v4`, il relancera à la prochaine connexion d'Eric ; le v3 n'avait pas encore tourné). Testé : carnet 55 → 335, 0 doublon, 2e passage sans effet.

### 05/11/2026 — Fiche client refaite (dct-app v3.99.217, departs v2.22.38)
> Cobey (capture de la fiche + menu « Actions ») : « cette page aussi je voudrais la refaire, il y a des boutons qui servent à rien » → aperçu validé « ok let's go » ; « on y voit aussi ses collectes, au client ? ».

Fiche (`s-client-fiche`, departs.js `depOuvrirFicheContact`) : nom + ville + nombre d'envois ; 3 gros boutons ronds **Appeler**, **WhatsApp** (wa.me, numéro international via `_telCmp`) et **Modifier** ; carte coordonnées (téléphone, 2e numéro, adresse + bouton **Itinéraire** Google Maps, infos) ; **« Ses envois »** affichés directement (container + date de départ + colis + étape, ou « Collecte du … » pour un envoi pas encore rattaché ; pastille « N € dus » rouge ou « Payé » vert ; un appui ouvre la facture) — collectes, France, dépôt direct, via `_depTousEnvoisContact` ; ligne **Fidélité** seulement s'il y a une remise disponible. Menu « ⋯ » : Fidélité (détail), Historique détaillé / Factures, Supprimer ce client. Retirés : bouton « Actions », « Bordereau d'envoi (à venir) ». Fonctionne aussi pour les fiches pas encore dans le carnet (France, dépôt, devis). Testé : fiche d'un client à 4 envois (clair / sombre), menu, suppression (confirmation).

### 05/11/2026 — Fiche client : historique par container (dct-app v3.99.218, departs v2.22.39)
> Cobey : « une lecture intuitive entre les collectes et les envois container, de chaque client » ; « Fidélité en dessous de l'adresse » ; « on devrait plutôt avoir le container d'abord, et après le clic la collecte concernée du client » ; « pour pas trop charger la page » — aperçu validé « ok ».

Fiche : coordonnées → **Fidélité** (sous l'adresse) → **« Son historique · par container »**. Un container = une ligne (nom, date de départ, étape, « N € dus » rouge / « Payé » vert). Un appui l'ouvre (un seul à la fois) et montre **les collectes du client** qui y sont (« Collecte du … », colis, mini-bouton « Facture ») ; un appui sur une collecte l'ouvre (Dakar `ouvrirCollecte`, France `ouvrirCollecteFrance`), « Voir le container » ouvre le container. Les envois pas encore dans un container sont groupés en haut (« Pas encore dans un container »). Collecte supprimée → message « Cette collecte n'existe plus ». Dépôt direct : la ligne ouvre la facture. Testé : Fallou Fall (2 groupes, un seul ouvert, clic → collecte du 4 octobre).
Non fait : surligner le client dans la collecte ouverte.

### 05/11/2026 — Fiche client : Modifier revient sur la fiche (dct-app v3.99.219, departs v2.22.40)
> Cobey : « quand j'appuie sur modifier un client dans sa fiche, si j'annule ou j'enregistre une modif, il revient sur l'écran de la liste des clients et non dans la fiche du client en lui-même. »

« Modifier » ne quitte plus la fiche : la fenêtre de modification s'ouvre par-dessus. Annuler → on reste sur la fiche. Enregistrer → la fiche est rouverte à jour (ville, adresse… ; si le numéro change, elle suit la nouvelle clé du carnet). Depuis la liste des clients, rien ne change. (`saveContactEdit` enveloppé dans departs.js.) Au passage : chevrons des lignes de collecte non retournés à l'ouverture d'un container ; libellé « 2 collectes · pas encore chargées » quand plusieurs envois n'ont pas de container.

## 05/11/2026 — Container : boutons des cartes client qui débordent (v3.99.220)
Cobey : « Remarquez que cette case-là, le texte ne rentre pas forcément dans la case sur mon PC et sur mon téléphone. »
- V2 : le bouton principal (« Relancer le paiement »…) prend toute la largeur sur sa ligne (texte qui peut passer à la ligne), les petites icônes (Facture, Photos, Copier…) se partagent la ligne du dessous. Plus de texte coupé ni de bouton qui passe en dessous. Testé à 400 px : 79 clients, aucun débordement.

### 05/11/2026 — Étiquettes / PDF : toujours en clair, même en mode nuit (v3.99.221)
> Cobey : « En mode nuit, quand on imprime les étiquettes, elles sortent noires, c'est pas bon. » → « ok vas-y »

Cause : les PDF (étiquettes, factures, feuilles de route) sont des captures de la page (html2canvas), qui reprenaient le mode nuit. `look.js` enveloppe `html2canvas` : la copie capturée passe en `data-mode="light"` (l'écran ne change pas). Couvre tous les PDF d'un coup. Testé (stub html2canvas, mode nuit : copie en clair, écran en nuit) ; régression 0/74.

### 05/11/2026 — Photo de fond de l'écran de connexion (EN ATTENTE de validation, pas encore sur `main`)
> Cobey : « c'est possible dans la page d'accueil, là où on choisit notre profil, de mettre un arrière-plan d'une photo qu'on ferait ensemble ? » ; image créée avec Higgsfield (port de Dakar au crépuscule, camion jaune) sur la base de mon prompt.

`fond-connexion.jpg` (768×1344, 45 Ko) + règles dans `tools/gen_look_css.py` (V2 seulement : photo, voile dégradé, titres en blanc, cartes en verre). Aperçu envoyé (clair / sombre). Poussé sur la branche de session seulement ; à passer sur `main` (et monter `APP_VERSION` + `?v=` du CSS) après le « ok » de Cobey.

### 05/11/2026 — Photo de fond de connexion MISE EN LIGNE + photo de Mamadou Niass dans l'activité (v3.99.222)
> Cobey : « Ok » (photo de fond) ; « et en même temps ajouter cette photo pour Mamadou Niass, pour que l'on voie dans les notifications, par contre pas besoin de la rajouter pour son espace à lui »
- Écran de connexion (V2) : photo du port au crépuscule décalée vers le bas (camion visible), cases d'espaces en verre dépoli teinté (une couleur par espace : bleu-violet, rose, turquoise, rouge), texte blanc.
- `photos-defaut/MN.jpg` + `MN` dans la table `DEFAUT` de photos.js ; `idDeNom` reconnaît « Mamadou Niass » → sa photo apparaît dans le fil d'Activité seulement (mamadou.html ne charge pas photos.js : rien dans son espace). Testé (ligne d'activité factice).

### 05/11/2026 — Connexion : la photo monte jusqu'en haut de l'écran (v3.99.223)
> Cobey : « Pourquoi le haut ne prend pas la photo ? » (bande claire sous l'heure / le réseau de l'iPhone)
La photo est maintenant posée sur toute la page (pas seulement sur l'écran de connexion) tant qu'on est sur la connexion, et la couleur de la barre du haut passe en sombre (`theme-color` créé par look.js). Revient normal dès qu'on quitte la connexion. (Ne peut pas être testé avec la vraie barre iPhone : à vérifier sur son téléphone.)

### 05/11/2026 — Connexion : cases plus transparentes (v3.99.224)
> Cobey : « Je trouve les cases pas assez transparentes, on ne voit pas l'image. »
Teinte par espace réduite de moitié, flou 14 → 5 px, verre presque clair : la photo se voit à travers ; la couleur reste dans le liseré et un léger voile.

### 05/11/2026 — Connexion : retour au verre d'avant + même verre sur les profils (v3.99.225)
> Cobey : « Nan, revient comme celui d'avant, et par contre rajoute aussi le même style pour chaque profil, ils sont restés blancs. »
Cases d'espaces remises comme en v3.99.223 (verre dépoli teinté). Cartes de profil (Qui êtes-vous ?) : même verre dépoli, texte blanc, bouton retour en verre ; l'anneau de couleur de chaque personne est gardé.

### 05/11/2026 — Connexion : cartes de profil colorées + PIN en verre (v3.99.226)
> Cobey : « Faut mettre des couleurs aussi aux cases pour chaque profil. » ; « Oui, PIN en verre aussi. »
- Chaque carte de profil prend la couleur de la personne (celle de son anneau) dans le verre (look.js `colorerProfils` met `--pc`, CSS `color-mix`).
- Fenêtres du code PIN (collaborateurs et administrateur) : verre dépoli, texte blanc, champ et boutons en verre (seulement quand on est sur l'écran de connexion).

### 05/11/2026 — Code PIN : couleur de la personne (v3.99.227)
> Cobey : « L'écran PIN doit avoir une couleur aussi. »
La fenêtre du PIN prend la couleur du profil choisi (violet pour Ibrahima, etc.) ; le PIN administrateur est en bleu-violet. look.js enveloppe `_ouvrirModalPinCollab` (met `--pc`).

### 05/11/2026 — Code PIN : photo de profil (v3.99.228)
> Cobey : « Il manque la photo de profil là » (écran du PIN, initiales « AD » au lieu de la photo)
photos.js enveloppe `_ouvrirModalPinCollab` : la pastille du PIN reçoit `data-ph` (la photo de la personne), comme les cartes de profil.

### 05/11/2026 — Connexion : logo DCT entier, sans contour blanc, avec ombre (v3.99.229)
> Cobey : « Et pour le logo de DCT, tu peux le mettre en entier ? Sans le contour blanc, avec effet d'ombrage. »
`logo-dct.png` (logo détouré, fond transparent, 320 px) ; en V2 sur l'écran de connexion, `#dct-logo` l'affiche en entier (plus de rognage rond ni de bordure blanche) avec une ombre portée. V1 inchangée.

### 05/11/2026 — Logo : détourage refait (v3.99.230)
> Cobey : « Au-dessus du logo on voit un petit bout blanc, on dirait que le détourage est mal fait. »
Le détourage était un cercle un peu trop grand (le logo est légèrement ovale) : refait sur l'ellipse exacte, 3 px à l'intérieur. `logo-dct.png?v=2`.

### 05/11/2026 — Icônes en verre duotone : connexion, accueil, barre du bas (v3.99.231)
> Cobey : « les icônes ont l'air plus anciennes… la nouvelle version est très moderne, avec des effets de verre » → aperçu → « Ce style me plaît… tu peux coder le tout. »
- Connexion : 4 icônes redessinées (mallette arrondie, immeuble + bâtiment, camion à grosses roues, bouclier-cadenas) dans une tuile en verre de la couleur de l'espace.
- Accueil (18 cases) : tuile colorée par teinte (vert, orange, violet, rouge, bleu) + icône blanche duotone (trait 2, remplissage translucide, lueur). Même dessins qu'avant, nouveau style.
- Barre du bas : bouton actif en dégradé vert, icônes à remplissage translucide.
- Générateur : `uri_duo`, `COUL`, `LOGIN_ICO` dans tools/gen_look_css.py. V1 inchangée. Les emojis des listes/boutons ne changent pas. Reste possible : redessiner les formes des 18 icônes d'accueil.

### 05/11/2026 — Nouveau look, vague 1 : cartes de menu en verre (v3.99.232, departs.js v2.22.41)
> Cobey : « cette interface-là fait trop ancienne version » → aperçu → « on peut faire ça pour tout ce qu'on a trouvé » → « ok vas-y » (en 3 vagues).
Vague 1 (V2 seulement) : Départs (choix du pays : tuile drapeau, chiffres « ouvert / en cours » en pastilles, prochain départ), Stockage, Archivage, liste des départs d'un pays, Statistiques (choix de l'année).
- look.js `cartesVerre()` : les `.dep-card` de ces zones passent en verre teinté (couleur de l'ancienne barre latérale), tuile d'icône (emoji → icône duotone), flèche ; observe les zones `dep-departs-pays-content`, `dep-stockage-content`, `dep-archive-content`, `dep-liste`, `dep-stats-content`.
- departs.js : la carte pays ajoute `.lk-pp` / `.lk-pn` (cachés en V1). V1 inchangée (74/74).
- À venir : vague 2 (Réglages, Administration, Rapport financier), vague 3 (Collecte, Planning, Fidélité, Dépôt Dakar, Devis, Facture manuelle).

### 05/11/2026 — Nouveau look, vague 2 : Réglages / Administration / Rapport financier (v3.99.233)
> Cobey : « Ok » (après la vague 1).
look.js `tuilesVerre()` (V2 seulement) : les emojis des tuiles de Réglages et du Rapport financier deviennent des icônes duotone blanches (équipe, clé, cloche, base de données, clé à molette, corbeille, mégaphone, palette, graphiques) dans une tuile de la couleur de la case ; les drapeaux restent dans une tuile blanche. L'en-tête noir de « Administration » devient clair comme les autres écrans, et la grille retrouve ses marges. V1 inchangée (74/74).

### 05/11/2026 — Nouveau look, vague 3 : Collecte, Dépôt Dakar, Devis, Facture manuelle (v3.99.234)
> Cobey : « ok vas-y » (vague 3).
V2 seulement, en CSS (aucun bouton ni action modifié) : cartes Collecte en verre teinté (vert « en cours », bleu « à venir ») ; cartes à barre colorée sur le côté (`.dep-cli`, ex. Dépôt Dakar) en verre teinté de la couleur de la barre (look.js `barresLaterales`) ; boutons de cartes (`.dep-cli-btn`) plus ronds ; cartes Devis / Facture manuelle en verre, pastilles rondes. NON touchés : boutons Disponible / Pas dispo du Planning (styles écrits dans le code) et la liste Fidélité — à voir avec Cobey. V1 inchangée (74/74).

### 05/11/2026 — Nouveau look : Planning + Fidélité (v3.99.235)
> Cobey : « Oui fait » (Planning et Fidélité).
V2 seulement, CSS uniquement : Planning — cartes de jours arrondies avec liseré clair, boutons Disponible / Pas dispo plus hauts et arrondis (couleurs et actions inchangées), champ « Un mot » arrondi. Fidélité — chaque client : verre ambré, tuile cadeau, nom en gras, pastille « N € disponibles », flèche. V1 inchangée (74/74).

### 05/11/2026 — Planning : vraie refonte (v3.99.236)
> Cobey : « Planning c'est la même chose qu'avant. » (mon CSS de la v3.99.235 visait le mauvais conteneur : `#pl-contenu`)
V2 seulement, CSS : onglets « Mes disponibilités / L'équipe » en pilule segmentée (actif en dégradé orange) ; cartes de jours en verre arrondies, titre 19 px ; boutons Disponible / Pas dispo hauts (✓ / ✕), sélection en dégradé vert / rouge avec lueur ; bandeau « JOUR DE CHARGEMENT » en dégradé ambre ; statuts « Noté absent / disponible » arrondis. Actions inchangées. V1 inchangée (74/74).

### 05/11/2026 — Planning > L'équipe : lignes alignées (v3.99.237, departs.js v2.22.42)
> Cobey : « Quand tu vas dans l'onglet équipe, c'est pas en ordre. »
Chaque ligne (icône | avatar + nom | statut) était en flex avec retour à la ligne : les statuts « Disponible / rien mis / Pas dispo » flottaient à des hauteurs et positions différentes. departs.js : classes `pl-lg / pl-ic / pl-nm / pl-st / pl-qd` ajoutées (aucun effet en V1). V2 : grille à 3 colonnes, statut en pastille colorée aligné à droite, « modifié par… / répondu le… » sous le nom. V1 inchangée (74/74).

### 05/11/2026 — Planning : « Pas dispo » → « Indisponible » (v3.99.238, departs.js v2.22.43)
> Cobey : « Et le pas dispo là, ça me gêne un peu, c'est pas trop français ça. »
Boutons, statuts, messages et traces du Planning : « Pas dispo » devient « Indisponible » (et « pas disponible » → « indisponible »), le bouton court « Dispo » devient « Disponible ». Aucune donnée ni logique changée.

### 05/11/2026 — Planning : compteurs « disponible / indisponible » (v3.99.239, departs.js v2.22.44)
> Cobey : « Oui, mets « disponible » aussi. »
Pastilles en haut de chaque dimanche : « 1 dispo » → « 1 disponible » (pluriel géré), « 1 non » → « 1 indisponible » (pour rester cohérent avec « Indisponible »).

### 05/11/2026 — Planning : « 🔒 verrouillé » remonté à droite du titre (v3.99.240)
> Cobey : « Le verrouillé, tu peux le mettre ailleurs, parce que là ça fait une ligne pour rien. »
V2 : la pastille passe en haut à droite de la carte, sur la ligne du titre ; les compteurs tiennent sur une seule ligne. CSS seulement, V1 inchangée (74/74).

### 06/11/2026 — Planning : « Absent d'office » ne déborde plus (v3.99.241, departs.js v2.22.45)
> Cobey (capture) : le statut « Absent d'office (pas répondu à temps) » passait par-dessus le nom (Ibrahima, Boubacar).
Texte raccourci en « Absent d'office » ; la pastille de statut peut maintenant passer sur deux lignes (largeur max 48 %) au lieu de forcer une seule ligne.

### 06/11/2026 — Planning : « noté absent le … » pour les absents d'office (v3.99.242, departs.js v2.22.46)
> Cobey : « ok vas-y » (sous Ibrahima / Boubacar il était écrit « répondu le 05/11 à 23h00 » alors qu'ils n'ont pas répondu).
`_depPlQuiEtQuand` : si la réponse est automatique (`r.auto`), la ligne dit « noté absent le JJ/MM à HHhMM » au lieu de « répondu le … ». Non testé avec une vraie donnée auto (fausses données sans absent d'office) ; code relu.

### 06/11/2026 — Nouveau look, vague 4 : détail d'une collecte, Équipe, Codes admin (v3.99.244)
> Cobey : « Fais ça maintenant » (fiches ouvertes depuis les écrans refaits).
V2 seulement, CSS + look.js `barresLaterales` (étendu) : détail d'une collecte — bandeau chiffres vert en carte arrondie, onglets Clients / Dispatch en pilule, cartes collaborateurs en verre teinté, pastilles de filtre et recherche arrondies ; Administration > Équipe — chaque collaborateur en verre teinté, nom + flèches ↑↓ sur la première ligne et boutons (✏️ 🚫 🔑 🗑️) en dessous (avant : 6 boutons écrasaient le nom) ; Codes admin — carte en verre, bouton arrondi. V1 inchangée (74/74). Le détail d'un départ (container) avait déjà été refait (boutons v3.99.220).

### 06/11/2026 — Photos à la place des initiales dans le détail collecte, Équipe, etc. (v3.99.245)
> Cobey : « Au niveau des initiales, on aurait pu mettre leurs photos. Maintenant on a des photos. »
photos.js `pastilles()` : toute pastille d'initiales `.av` dont le texte est l'identifiant d'une personne ayant une photo reçoit sa photo (détail d'une collecte, etc.), et les pastilles rondes d'Administration > Équipe / Codes admin aussi. Observation légère (une passe par image d'écran). Les personnes sans photo gardent leurs initiales (ex. Abdoulaye / Eric dans mes fausses données). 74/74.

### 06/11/2026 — Fenêtres (modales) en verre dépoli (v3.99.247)
> Cobey : « Il y a aussi des modales avec l'ancien look » (capture : « Ajouter… Un camion DCT / Un chauffeur externe / Annuler »).
V2, CSS : toutes les fenêtres `.modal-overlay` — fond flouté, feuille en verre aux coins arrondis 30 px avec poignée, titres 20 px, boutons arrondis 52 px (principal en vert), « Annuler » en verre, champs arrondis. Testé sur 3 fenêtres (Ajouter camion, Valider dispatch, Client déjà existant) ; 74/74. Reste : la case France (écrans).

### 06/11/2026 — Nouveau look partout : couche générale (v3.99.248 → .250)
> Cobey : « Je veux plus aucun ancien look » ; « moi je vais dormir, je te laisse tout faire » ; l'espace chauffeur « poste » (Global Logistique / Danny) est supprimé de son côté : aucune donnée, écrans inaccessibles depuis la v3.57.0.
V2, CSS (tools/gen_look_css.py) : boutons (.btn, .btn-green/gray/red, -sm, pdf) en dégradé / verre, champs et menus arrondis en verre avec halo vert au focus, étiquettes en petites capitales, cartes `.card / .dept-block / .suivi-card` en verre, lignes client, pastilles, barres de progression arrondies ; onglets `.subtabs` en pilule partout (dont case France) ; blocs à bordure bleue épaisse → verre ; fonds gris plats → transparents ; boutons noirs → vert sombre ; barres blanches → verre. Écrans concernés : case France (liste, proches, camion, stats), nouvelle collecte, inscrire un client, formulaires (client, départ, dépôt, devis, facture manuelle), dépenses, stats, prix articles, suivi, activité. Vérifié par captures de ~50 écrans ; 74/74 en V1.
Non fait : suppression du code mort Danny / postes (entremêlé avec les tournées France), scan QR (caméra), écran noir.

### 06/11/2026 — Case France : liste des clients au nouveau look (v3.99.251)
> Cobey : « Par contre la liste des clients de France est encore dans l'ancien look. »
dct-app.html : classes `fr-carte` (carte client) et `fr-chip` (puces région / département / prêts) ajoutées dans le HTML généré (sans effet en V1). V2 : cartes en verre arrondies, nom 16,5 px, puces en pilule (active en vert), bandeau « Clients proches » et avertissement d'ancienneté arrondis. Testé avec 3 faux clients ; 74/74.

### 06/11/2026 — Écran Collecte : logo DCT retiré (v3.99.252)
> Cobey : « Le logo de DCT ici ne devrait plus y être. Il était avant parce qu'il n'y avait que la collecte. »
V2 : le logo rond à gauche du titre « Collecte » (écran `s-home`) est masqué. V1 inchangée (74/74).

### 06/11/2026 — Gros boutons : fin des contours épais (v3.99.253–254)
> Cobey : « Oui, c'est vrai [le bouton Créer une nouvelle collecte]. Et vérifie dans l'application qu'il n'y a pas d'autres boutons qui ont le même style de l'ancien look. »
V2 : `.add-banner` / `.new-btn` (Créer une collecte, Ajouter un client…) en dégradé vert, bord fin, 26 px ; tous les boutons / lignes cliquables à contour de 2–2,5 px (écrans et fenêtres) passent en bord fin arrondi, les fonds pleins marine / vert / rouge / orange en dégradé, les gris foncés en verre. Contrôle par script sur 75 écrans : plus de bouton à contour ≥ 2 px sur les écrans visibles (écrans vides sans données non vus). 74/74.

### 06/11/2026 — Détail d'une collecte : clients en cartes de verre (v3.99.255)
> Cobey (capture d'une collecte archivée, « ça, c'est un look, non ? ») : les clients étaient de longues lignes plates dans un grand bloc blanc.
V2 : chaque client = une carte en verre arrondie (avatar 42 px, prix 16 px, pastilles d'auteur / camion arrondies, bouton de changement arrondi) ; les en-têtes de département deviennent de petits titres en capitales. V1 inchangée (74/74).

### 06/11/2026 — Bug : un client « MN » avait la photo de Mamadou Niass (v3.99.256)
> Cobey : « Pourquoi ce client a la photo de profil de Mamadou Niass ? » (Mor Ndoye, initiales MN, collecte archivée du 20/09).
Cause : ma règle v3.99.245 (photos.js `pastilles`) mettait la photo de toute pastille `.av` dont les initiales = l'identifiant d'une personne ; or « MN » (Mor Ndoye) = identifiant de Mamadou Niass. Corrigé : seules les pastilles de collaborateurs (`.collab-card .av`, pastille d'en-tête) reçoivent une photo ; les pastilles de CLIENTS ne sont plus concernées. Peut aussi avoir touché d'autres clients aux initiales IS, AB, SA, IB, BO, AM, AD dans les listes — corrigé pareil.

### 06/11/2026 — Pastilles auteur et camion en verre, avec photo (v3.99.257–258)
> Cobey : « L'endroit où les noms des collaborateurs sont affichés pour chaque client encadré… un peu à l'ancien look ? » → aperçu → « Ya pas la photo là ? » → « on peut faire ça partout où il y a cette même pastille ? »
`_pastilleAuteurClient` (dct-app.html) et les pastilles camion (liste des clients d'une collecte, France) portent maintenant `.pl` + une pastille ronde `.pl-i` (cachée en V1) : l'auteur reçoit sa photo (`data-ph`, photos.js), le camion une icône camion. V2 : verre teinté à la couleur de la personne / du camion. Bouton « Changer de collecte » en tuile blanche arrondie. Non couvert : d'éventuelles pastilles auteur écrites autrement dans departs.js (cartes du départ). V1 inchangée (74/74).

### 06/11/2026 — Carte client d'une collecte en trois bandes (v3.99.259)
> Cobey : « la mise en place, dans la capture… les clients… pas belle, pas bien organisée. Que peux-tu me proposer ? » → aperçu → « Ok ».
dct-app.html : les pastilles auteur + camion sont dans un conteneur `.cr-bas` (`display:contents` → V1 strictement identique). V2 : grille — haut : avatar, nom 16,5 px (sur toute la largeur), prix 18 px ; milieu : adresse et colis sur des lignes entières (plus de « … ») ; bas sous un fin trait : pastilles à gauche, bouton de changement à droite. Testé avec une carte ; 74/74.

### 06/11/2026 — Même organisation et mêmes pastilles partout : clients France (v3.99.260)
> Cobey : « faire ça partout, même dans les collectes de France… Tous les endroits où il y a la pastille, on fait la même chose. »
`_pastilleAuteur` (France, fiche contact, fiche client du départ…) reçoit le même habillage que `_pastilleAuteurClient` : rond photo `pl-i` + verre teinté en V2 (rond d'initiales d'avant conservé en V1). Carte client France : classes `fr-h / fr-nm / fr-ch / fr-ad / fr-co / fr-bas` ; V2 : nom sur toute la largeur, puces de statut dessous, adresse et colis sur lignes entières, bande basse séparée (date · ancienneté à gauche, pastille auteur à droite). Testé avec 3 faux clients ; 74/74.

### 06/11/2026 — Case France : bloc « Dernière note », état de collecte, barre du bas (v3.99.261)
> Cobey (capture d'un client planifié, message dicté : « il y a encore de l'ancien look dans la case »).
Interprété : le bloc « DERNIÈRE NOTE » (barre bleue sur le côté, fond plat), la ligne « Collecte du … » et la barre blanche du bas. Classes `fr-note`, `fr-etat` ajoutées ; V2 : note en verre bleuté arrondi (texte 13,5 px), « Aucune note » en pastille pointillée, état de collecte en pastille, barres du bas transparentes en dégradé, bouton « Mettre dans un camion » en dégradé. Non vu avec une vraie note : testé seulement « Aucune note ». 74/74.

### 06/11/2026 — Clients France : prix en évidence (v3.99.262–263)
> Cobey : « Et le prix est mal placé du client, c'est pas mis en évidence comme dans la collecte classique. »
Ajout d'un `<span class="fr-px">` (caché en V1) dans l'en-tête de la carte : en V2, le prix (19 px, vert, gras) est en haut à droite sur la ligne du nom ; il disparaît de la ligne des colis (`fr-sep` + `b` masqués). 74/74.

### 06/11/2026 — Clients France : adresse / colis / déplacement distincts (v3.99.264)
> Cobey : « leur carte c'est un peu brouillon. On ne distingue pas l'adresse des colis, c'est écrit en même couleur. Le prix du déplacement est mis soit en bas, soit à droite selon le client. »
V2 : adresse en gris avec 📍 ; colis dans une pastille verte (📦 N colis · description) ; « 🛣️ N € déplacement » toujours sur sa propre ligne sous les colis (plus de wrap aléatoire à droite). 74/74.

### 06/11/2026 — Client d'un container : nouvelle organisation (v3.99.265–266)
> Cobey : « pour les clients des conteneurs, je voudrais une nouvelle organisation. Trop brouillon. Les icônes, on ne sait pas trop à quoi ça correspond. » → aperçu → « Pourquoi as-tu retiré les factures d'un client impayé ? » (oubli de la maquette, Facture reste partout) → « Ok ».
V2 (CSS + look.js `actionsClients`) : haut = rang + nom à gauche, prix 19 px vert à droite ; ligne d'état (pastille paiement) + bouton téléphone rond ; un gros bouton principal (Relancer / Prévenir / Avis / Facture) ; boutons secondaires avec leur NOM écrit (Facture, Photos, Déplacer, Copier, Détacher) en grille de 2 colonnes, Détacher seul en rouge pleine largeur. Plus de boutons icône seule. Aucune action modifiée. Testé sur 3 clients ; Déplacer / Détacher non visibles dans mon test (droits). 74/74.

### 06/11/2026 — Déplacer unique, Aminata autorisée, Copier à côté de Relancer (v3.99.267, departs.js v2.22.47)
> Cobey : « le bouton Copier… doit être à côté » ; « un seul bouton qui permette soit de le remettre dans le dépôt de Mitry, soit de changer de conteneur » ; « ce bouton accessible pour moi, Issyaka, Abdoulaye et Aminata… je veux juste que cette action soit accessible par Aminata, tu ne changes rien d'autre ».
- departs.js : nouveau droit à part `peutDeplacerClient()` = direction (IS, AB, AD) + AM, SANS toucher à `IDS_DIRECTION` (Aminata n'a aucun autre droit de direction). Utilisé par `depOuvrirMove` et `depDetacherClient`. Message : « Réservé à la direction et à Aminata. »
- Un seul bouton « ⇄ Déplacer » (`depChoixDeplacement`) : fenêtre « Vers un autre container » (ancien Déplacer) ou « Remettre au dépôt de Mitry » (ancien Détacher, avec sa confirmation). Le bouton Détacher disparaît de la carte. Les deux anciennes fonctions sont réutilisées telles quelles.
- look.js (V2) : « Copier » (relance / prévenir / avis) se range à droite du bouton principal, dans la même ligne (`.lk-ln`).
Test : droits (BO non, SA non, AM / IS / AB / AD oui) ; fenêtre vue ; 74/74. Le bouton Déplacer lui-même n'apparaît que sur un container « en préparation » : non vu dans mes fausses données.

### 06/11/2026 — Relance de paiement : annuler + ouverture de WhatsApp plus fiable (v3.99.268, departs.js v2.22.48)
> Cobey : « Pour Kudjassar, j'ai appuyé sur relancer le paiement sans faire exprès, ça a validé. Peux-tu remettre normalement ? » ; « c'est pas censé m'envoyer sur WhatsApp ? ça ne m'a pas amené sur WhatsApp » → « ok vas-y ».
- Je ne peux pas écrire dans la base (compte lecteur seulement) : nouvelle action « ↩ Annuler » sous « Relancé — … » (`depAnnulerRelancePaiement`) — réservée à la direction et Aminata (`peutDeplacerClient`) ; demande confirmation, supprime `relancePaiementColis/Livraison` et la dernière ligne d'historique « relance » correspondante. Pas encore dans la fenêtre du double choix colis + livraison.
- `_depOuvrirWhatsapp` : ouvre WhatsApp par un lien « cliqué » (au lieu de window.open, souvent bloqué dans le raccourci iPhone) pour les 5 endroits (relance, prévenir, avis, etc.) ; si l'appli reste au premier plan 1,6 s après, un message dit d'utiliser « Copier ». Le marquage « relancé » est inchangé (on ne peut pas savoir côté web si WhatsApp s'est ouvert).
Test (fausses données) : relance → « Relancé » + 1 ouverture ; Annuler → « Relancer le paiement ». Non testé : l'ouverture réelle de WhatsApp sur iPhone. 74/74.

### 06/11/2026 — Bouton « Annuler » de la relance retiré (v3.99.269, departs.js v2.22.49)
> Cobey : « J'ai annulé la relance, c'est bon, et ça marche sur WhatsApp. Tu peux retirer le bouton annuler, c'était juste pour moi. »
Le bouton n'est plus affiché (fonction `depAnnulerRelancePaiement` conservée, inutilisée). L'ouverture de WhatsApp (v3.99.268) est confirmée par Cobey sur iPhone.

### 06/11/2026 — Drapeaux : seulement le Mali (v3.99.270, departs.js v2.22.50)
> Cobey : « on va retirer les drapeaux à côté de chaque client. On laisse juste un drapeau du Mali pour les clients du Mali. Le reste, c'est 99 % sénégalais. » ; « sur les autres écrans, on enlève, pareil. »
Cartes des clients d'un container, liste des clients d'une collecte et titre de la fiche contact : plus de 🇸🇳, seul 🇲🇱 reste (V1 aussi). Les drapeaux des containers / départs (titres) ne sont pas touchés. NON fait : la nouvelle carte (bandeau coloré, numéro en tuile, bouton de relance réduit) — aperçu validé en cours, en attente du « ok » de Cobey.

### 06/11/2026 — Client d'un container : carte à bandeau coloré (v3.99.271–272, departs.js v2.22.51)
> Cobey : « fait un aperçu avec ce style-là, des clients soldés et tout » → « le numéro de la position doit être plus voyant » → « une séparation entre le nom et les boutons d'en bas, une couleur derrière le nom » → « réduire la case de relance » → « Ok code ».
departs.js (carte du container) : markup en deux blocs `.cli-hd` (numéro, nom, mentions, prix, téléphone) et `.cli-bd` (état de paiement, boutons) ; `_depEtatCarte` donne la couleur du bandeau (`hk` reste à payer, `ho` soldé, `hn` France) ; le numéro `.rg-n` contient `.rg-l` (« N° »). Le texte « 🚚 livraison » est dupliqué (`cli-liv` cachée en V2, `cli-liv2` cachée en V1). V2 : bandeau rose / vert / bleu-violet ; numéro en tuile sombre ; prix 18 px ; mentions grises sous le nom ; « Relancer… » en dégradé orange réduit avec « Copier » à côté ; Facture / Photos / Déplacer en 3 colonnes ; un client soldé n'a plus de gros bouton Facture. V1 inchangée (74/74). Non vu : client Mali, France, container arrivé (Prévenir / Avis), bouton Déplacer.

### 06/11/2026 — Versements côté DCT : plus de choix FCFA (v3.99.273, departs.js v2.22.52)
> Cobey : « Pour les versements côté DCT, tu peux enlever francs CFA. En France, on n'encaisse qu'en euros. »
Les 3 formulaires de versement (facture colis, facture livraison, versement avant la collecte) n'affichent plus les boutons « € Euros / FCFA » : la rangée est cachée, la devise reste « euros ». Le code de conversion FCFA et les anciens versements en FCFA sont conservés (ils s'affichent toujours). mamadou.html (côté Dakar) non touché. 74/74.

### 06/11/2026 — Pastilles de paiement au nouveau look (v3.99.274, departs.js v2.22.53)
> Cobey : « la pastille colis soldé ou colis non payé, elle fait ancien look » → aperçu → « et si la livraison est soldée, il est indiqué aussi » → « ok code ».
`_depLignePaiementCarte` : chaque pastille porte `pp pp-v|k|o` (+ `pp-liv`) avec 4 morceaux (emoji + texte long, icône + texte court) ; V1 inchangée, V2 : pastille pleine sans contour, icône en trait (coche / croix / camion pour la livraison), texte court « Colis · reste 230 € », « Livraison · reste 15 € », « Colis soldé », « Livraison soldée ». Partiel = ambre « reste X € ». Vu : impayé colis, soldé, impayé livraison. Non vu : livraison soldée, partiel. 74/74.

### 06/11/2026 — Client d'un container : contenu des colis + traits de séparation (v3.99.275, departs.js v2.22.54)
> Cobey : « dans ces cases on n'a pas le détail des colis » → encadré « contenu » (proposition A) ; « sépare le nom, les colis, les boutons et les statuts avec des petits tirets » → « pas les tirets, des petits traits comme pour les collectes ».
Carte du container : nouveau bloc `.cli-ct` (champ `colis` du client tel quel, `nb` dans la tuile, 📦 sinon) ; visible en V2 seulement ; `.cli-b1` regroupe pastilles de paiement + badge de livraison ; traits fins (1 px) entre bandeau / statut / colis / boutons. La livraison n'est pas retirée du texte (26 anciens clients l'ont seulement là). 74/74.

### 06/11/2026 — Même carte pour les clients d'une collecte et de France (v3.99.276–277, departs.js v2.22.55)
> Cobey : « La présentation des clients, comme tu as fait dans le départ, est très belle. Tu peux la refaire la même sur les collectes France et sur les collectes classiques ? »
- Collecte classique : lignes `.client-row` → `cr-hd` (avatar, nom, adresse, prix, bandeau rose / vert selon paiement, bleu sans paiement) + `cr-bd` (pastille de paiement, contenu des colis avec tuile 📦 / nombre, auteur + camion + bouton changer de collecte), traits fins ; `cr-hd` / `cr-bd` en `display:contents` en V1. Le bouton « Changer de collecte » est maintenant ajouté dans `.cr-dr`.
- France : `fr-hd` (bandeau : case, nom, prix, puces de statut) + `fr-bd` (adresse, colis, déplacement, date et auteur, note) ; bandeau vert si ramassé, rose si ancien, bleu-violet sinon.
`_depLignePaiementCarte` et `_depEtatCarte` exposées sur window. 74/74. Non vu avec un camion affecté ni avec un client de collecte soldé.

### 06/11/2026 — « Changer de collecte » devient « Changer de date » (v3.99.278–279, departs.js v2.22.56)
> Cobey : « le bouton changement n'est pas trop compréhensible » → « Changer de date ».
Bouton sur chaque client d'une collecte : en V2, « 🔁 Changer de date » (vrai bouton arrondi avec texte, bas de carte à droite) ; V1 garde la petite 🔁 (texte caché). Titre de la fenêtre : « Changer de date ». 74/74.

### 06/11/2026 — Clients France : le déplacement sous le prix, bien distinct (v3.99.280–283)
> Cobey : « le prix du déplacement devrait être plutôt en dessous du tarif total en haut à droite » ; « c'est pas "dont" : le prix du colis est différent du prix de déplacement, il faut faire une distinction. »
V2 : le prix du colis (vert, gros) en haut à droite ; juste dessous une pastille turquoise « 🛣️ 15 € déplacement » (séparée, pas « dont »). L'ancienne pastille dans la ligne des colis est cachée en V2. Question restée ouverte avec Cobey : signification des couleurs de bandeau en France (rose = attend depuis plus de 14 j, vert = ramassé, bleu = autre) — proposition : orange pour l'ancienneté, rose réservé aux impayés.

### 06/11/2026 — Clients France : le total en premier (v3.99.284)
> Cobey : « le prix du déplacement et le prix des colis ne s'additionnent pas… vérifie » → « mettre d'abord le total, après le prix du colis, après le déplacement, comme ça le collaborateur sait quel total prendre. Le code part. »
Vérification : le bandeau de la liste (« Montant ») et la facture additionnent déjà colis + déplacement ; la carte client, non. V2 : en haut à droite de chaque carte avec déplacement — « TOTAL 75 € » (gros, vert), « Colis 60 € », puis la pastille « 🛣️ 15 € déplacement ». Sans déplacement : le prix seul. V1 inchangée (74/74).

### 06/11/2026 — Clients France : couleurs sans paiement + total plus grand (v3.99.285–286)
> Cobey : « dans France, les clients ne paient pas avant qu'on aille récupérer leur colis, donc pas de paiement en attente, sauf ceux qui veulent payer quand même » ; « vers le colis ramassé non, parce que si le colis est ramassé il disparaît de la liste » ; « le total colis est un peu trop petit ».
Bandeau d'un client de France : bleu-violet (normal) ou orange (attend depuis plus de 14 j) — plus de rose ni de vert. Aucune pastille « reste à payer » : seulement « Payé X € » / « Soldé » si un versement existe (`_frPastillePaye`). Total (27 px), « Colis X € » et déplacement plus grands ; prix seul en 24 px. 74/74.

### 06/11/2026 — Clients France : total, colis et déplacement toujours affichés (v3.99.287)
> Cobey : « chaque client en France va obligatoirement avoir un prix de déplacement ; s'il n'est pas indiqué, tu mettras 0 ; il y aura toujours total, colis et déplacement affichés. »
Bloc en haut à droite : « TOTAL », « Colis », « 🛣️ N € déplacement » même quand le déplacement est vide (0 €). 74/74.

### 06/11/2026 — Mention « Livraison à Dakar » sur les cartes client (v3.99.288–289)
> Cobey : « on n'a mis aucune visuelle sur livraison à Dakar. Même si c'est pas dans la caisse, il faut que ce soit mentionné quelque part sur la carte du client. »
Nouvelle pastille violette « 🚚 Livraison à Dakar · <ville> · <prix> € » (`_htmlLivDakar`), sur les cartes France (dans le bloc colis) et sur les clients d'une collecte (avec le bloc paiement) ; dans un container, la mention « 🚚 livraison » sous le nom existait déjà. Visible en nouveau look seulement. Premier essai (v3.99.288) cassé : `esc` au lieu de `_esc` → écran France en erreur ; corrigé en v3.99.289 avant mise en ligne par Cobey. 74/74.

### 06/11/2026 — Bloc « TOTAL À PAYER », pastilles sur une ligne, adresse sous le nom (v3.99.290–294, departs.js v2.22.57)
> Cobey : « il faut le total différencié des restes » → aperçus → « Ok, c'est bien. Mets les deux pastilles colis reste / livraison reste sur la même ligne. » ; « pour les clients France, l'adresse doit être en dessous du nom, pas en dessous des prix. »
`_htmlBlocPrix(c, france)` : bandeau sombre « TOTAL À PAYER » = colis + déplacement + livraison, puis cases Colis (bleu), Déplacement (turquoise, France seulement, toujours), Livraison (violet, si livraison). Collecte : cases seulement s'il y a une livraison. Remplace le prix du bandeau (`cr-px`, `fr-px`) et la pastille violette séparée. Pastilles de paiement (`.pp-ln`) : toujours sur une seule ligne, plus petites. France : adresse sous le nom, dans le bandeau. Container : inchangé (le prix reste en haut à droite). Vu : collecte sans livraison, France avec livraison, container ; non vu : collecte avec livraison et deux pastilles sur de vraies données. 74/74.

### 06/11/2026 — Listes qui se mettent à jour au retour + Dispatch réparé (v3.99.295–296, departs.js v2.22.58)
> Cobey : « j'avais ajouté 10 € de livraison pour tester ; j'ai retiré, ça l'a retiré dans sa fiche mais pas ici » ; « problème d'affichage ici » (onglet Dispatch).
- Cause : les listes France / Collecte ne se redessinaient que si l'écran était affiché au moment du changement ; modifié depuis une fiche, elles gardaient l'ancienne image au retour. departs.js (N bis) : `goTo` redessine `renderFrance` / `renderCollecteContent` quand on arrive sur ces écrans. Test : livraison ajoutée puis retirée pendant qu'on est ailleurs → au retour, la liste est à jour.
- Dispatch : mon nouveau style de carte (v3.99.277+) s'appliquait aussi aux lignes simples de l'onglet Dispatch (même classe) et les cassait. Il ne s'applique plus qu'aux cartes avec bandeau (`:has(> .cr-hd)`) ; les lignes du Dispatch ont leur propre style (avatar, nom, ville, colis, prix, pastille « Non affecté »). 74/74.

### 06/11/2026 — Bas de carte de collecte sur une seule ligne (v3.99.297)
> Cobey (capture, collecte du 18/10) : « on regarde Aminata, le camion et changer la date : normalement tout doit être sur une ligne, pas sur deux. »
`.cr-dr` : plus de retour à la ligne ; pastilles auteur et camion plus petites (11 px, texte tronqué si trop long) ; bouton « Changer de date » compact. Testé avec auteur + camion + bouton : 41 px de haut = une seule ligne à 400 px. 74/74.

### 06/11/2026 — Bloc des prix dans les containers + bandeau qui change selon le paiement (v3.99.298, departs.js v2.22.59)
> Cobey : « dans le container, la même logique pour les prix, une nouvelle case » ; « pour chaque client, son détail » ; « la case total devrait changer de couleur une fois que tout est payé… pareil partout » → « Ok code ».
`_htmlBlocPrix(c, france)` (dct-app.html) : bandeau sombre « TOTAL À PAYER » ; vert « TOTAL PAYÉ ✓ » quand le reste est ≤ 0 (colis + déplacement + livraison) ; sombre « RESTE X € SUR Y € » (montant = reste) quand payé en partie. Cases détail : Colis + Déplacement (France, ou si > 0) + Livraison (si livraison) ; client simple = bandeau seul. Utilisé en France, en collecte classique et maintenant dans les containers (`cli-bd`), où le prix en haut à droite et « 🚚 livraison » sous le nom disparaissent en nouveau look. `depCalculerPaiementLivraison` exposée sur window. Vu : container (3 clients), France. Non vu : bandeau « RESTE… SUR… » (paiement partiel) et un client de France dans un container. 74/74.

### 07/11/2026 — Feuille de route du camion au nouveau look (v3.99.299)
> Cobey (captures de la feuille de route « Issyaka + Samba ») : « à cet endroit-là aussi on est sur l'ancien look » ; « dans la case c'est brouillon, pas organisé, tout est compacté. »
V2, CSS : cartes du haut (tournée, suivi financier, kilométrage) en verre arrondi ; barres de progression en pilule ; cartes d'étape `.route-card` en verre (bandeau bleuté, pastille numéro, vert si fait, rouge si refusé) ; boutons Valider / Refuser en dégradé, « ⋯ » en verre ; boutons Observation / Photos / WhatsApp / Copier arrondis, sans contour épais. Non codé : la nouvelle organisation interne d'une étape (blocs Adresse / Téléphone / Colis + prix, aperçu envoyé, en attente du « ok »). 74/74.

### 07/11/2026 — Feuille de route : « Ajouté par » en bande + blocs organisés (v3.99.300–301)
> Cobey : « la mention ajouté par est moins visible, c'est important de savoir qui a ajouté le client au premier coup d'œil » ; « c'est brouillon, tout compacté » → aperçus → « Ok code ».
Camion collecte (`renderCamion`) et camion France (`renderCamionFrance`) : bande `.route-by` (« AJOUTÉ PAR » + pastille auteur avec photo, 14 px) entre l'en-tête et le corps ; adresse et téléphone avec icône et étiquette (`rd-adr`, `rd-tel`) ; colis avec le prix à droite en vert (`rd-col` / `rd-px`), l'ancienne ligne 💰 est cachée en V2 (`rd-prix1`) ; Observation en bouton arrondi avec marges. Tout est caché ou inchangé en V1 (74/74). France : l'auteur lu dans `c.creePar` — non vérifié avec de vraies données.

### 07/11/2026 — Feuille de route : ligne Livraison, Déplacement et Total à payer (v3.99.302)
> Cobey : « une ligne spéciale pour la livraison, pour savoir s'il y en a une et son prix ; les prix du colis, de la livraison et un total » → aperçu → « Ok code ».
Étape d'un camion (collecte et France), nouveau look : « Colis » + prix en bleu ; ligne violette « Livraison à Dakar » (ville + prix) si livraison ; ligne turquoise « Déplacement » (France, toujours) ; bandeau sombre « TOTAL À PAYER » (`_htmlBlocPrix(c, france, true)` = colis + déplacement + livraison). Le bouton Valider garde son montant d'avant (prix du colis) : la livraison a sa propre caisse. V1 inchangée (74/74). Vu : collecte avec et sans livraison ; non vu : France.

### 07/11/2026 — États d'une étape de la feuille de route (v3.99.303–304)
> Cobey : « quand on valide un client pendant la ramasse, y a-t-il un changement visuel ? » → « montre les coloris : pas validé, validé, reporté, annulé » → « Ok code ».
V2 : bandeau et liseré de la carte — bleu-violet (à faire), vert soutenu + « ✓ heure » (ramassé), orange (reporté), violet (annulé), rouge (refusé) ; pastille numéro de la même couleur ; boutons « Ramassé / Reporté / Annulé / Non effectuée » teintés ; ↩️ en tuile blanche. Piège : les styles posés en JS sont réécrits par le navigateur (`#856404` → `rgb(…)`), donc les sélecteurs `[style*="#hex"]` ne les attrapent pas — utiliser des classes. Vu : à faire, ramassé, refusé, reporté ; non vu : annulé. 74/74.

### 07/11/2026 — Feuille de route : toute la carte colorée selon l'état (v3.99.305)
> Cobey : « les bandeaux sont coloriés mais le fond est blanc ; comme le fond blanc est plus grand que le bandeau, c'est moins facile de se repérer vite quel client a été fait, annulé ou autre. »
V2 : le fond entier de la carte prend la teinte de l'état (vert ramassé, orange reporté, violet annulé, rouge refusé, bleu-violet léger à faire) ; bandeau plus soutenu ; zones « Ajouté par » et détails transparentes. 74/74.
