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

- ~~**Sécurité de la base Firebase.**~~ *Bouclé le 26/09.* Cobey : « il
  manquerait une étape qu'on n'avait pas faite » côté sécurité. Vrai
  trou : la base Firebase était ouverte à qui connaissait son adresse
  (visible dans le code de l'application), sans rien qui prouve que la
  demande vient bien de l'application elle-même.

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

- **Régler les accès depuis les Réglages.** Aujourd'hui la liste des cases
  de chacun se change dans Firebase (champ `cases` de sa fiche), pas depuis
  un écran. À faire quand un deuxième poste sortira du moule.

---

## 2 · Améliorations

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

---

## 2 bis · France & Europe

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

---

## 3 · Bug

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

- Pouvoir créer des **factures manuelles** rattachées à un container,
  pour le suivi.
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

**Fait le 01/10 (v2.11.0 / v3.95.0)**, sauf les totaux de livraison
chiffrés (voir plus bas — une question reste en suspens). Nouvelle page
`mamadou.html`, à part comme `chauffeur.html`/`facture.html` (ne charge
pas departs.js, relit ses propres données en direct). Lien permanent
généré et régénérable depuis **Réglages > Livreur** (Direction) :
affiche le lien, permet de le copier (message WhatsApp prêt), de le
régénérer (invalide l'ancien), et de **« Voir son interface »** — ouvre
littéralement le lien de Mamadou dans un nouvel onglet, pas une
réimplémentation séparée à maintenir en double (leçon tirée du
chantier facture.html/departs.js, qui a déjà demandé plusieurs
rattrapages cette session pour rester synchronisé).

Construit : les 3 cases d'accueil (scanner, saisie de secours,
containers), le scan QR (même jeton `DCTQR1:` que l'appli interne — les
étiquettes déjà imprimées fonctionnent telles quelles), la saisie de
secours par numéro de client dans le container choisi, la liste des
clients d'un container avec filtres (payé/reste à payer, avec
livraison, par région de livraison) et tri par numéro de place comme
Départ, la fiche client (photos, description, nombre de colis,
statut payé/reste visible immédiatement), l'encaissement du colis et
de la livraison (deux caisses séparées, comme partout ailleurs dans
l'appli), et la validation de la livraison — verrouillée tant qu'il
reste un montant à encaisser, sur le colis comme sur la livraison.

**Non construit : les totaux de livraison chiffrés dans sa case
container** (ce qu'il va toucher, ce qui a été encaissé par DCT, ce
qu'il encaisse sur place, le total). **Question pour Cobey :** sur
quelle base Mamadou est-il rémunéré par livraison (un forfait fixe ? un
pourcentage du prix de la livraison ?) — rien dans l'appli ne définit
encore cette règle, impossible de calculer « ce qu'il va toucher » sans
elle.

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

---

## 6 · Rapport financier

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
