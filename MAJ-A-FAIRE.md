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
  pour les rappels et résultats, « Essai » pour le bouton de test, et le
  nom de l'auteur pour la case Notification (« from Eric », par
  exemple) — plus utile que de répéter le nom de l'application.

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

---

## 4 · Factures et étiquettes

- Pouvoir créer des **factures manuelles** rattachées à un container,
  pour le suivi.
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

Un accès séparé, sur le modèle du lien des chauffeurs externes.

**?** Confirmer : c'est bien le livreur à Dakar, avec son propre lien ?

### Ses écrans
- une **case QR code**, pour scanner une étiquette ;
- une **saisie de secours**, juste à côté : quand le QR refuse de se
  scanner (étiquette abîmée, mal imprimée, colis mal éclairé), Mamadou
  tape un numéro à la main et arrive sur la même fiche client. C'est ce
  que Cobey appelait « scanner en secours » (précisé le 24/09) ;
- une **case container**, pour accéder aux clients comme le carré Départ,
  mais **sans aucun total d'argent du container**.

**?** Quel numéro tape-t-il : le numéro de client (`CL-0001`), ou la
grande ligne de l'étiquette en entier (`CL-0001-051026-7`) ? À trancher
au moment de construire l'écran — le second est unique par colis, le
premier retombe sur le client quel que soit l'envoi.

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

---

## 6 · Rapport financier

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
