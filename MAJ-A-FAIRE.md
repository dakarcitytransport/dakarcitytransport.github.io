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
