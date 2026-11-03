# Résumé de la longue conversation du 26/10 au 03/11/2026 (pour reprendre le fil)

> À lire après `CLAUDE.md`. Le détail de chaque modification, avec les phrases de Cobey, est dans
> `MAJ-A-FAIRE.md` (entrées datées). Ici : le contexte, les décisions, les leçons et ce qui reste à faire.

## Versions en ligne à la fin de cette conversation
`dct-app.html` v3.99.134 · `departs.js` v2.22.8 · `mamadou.html` v1.18.3 · `chauffeur.html` v1.8.1.
Branche de travail : `claude/dreamy-hawking-jutjpq`, toujours fusionnée en fast-forward sur `main`.

## Vocabulaire de Cobey (dictée vocale)
« collègue/collège » = collecte · « conteneur » = container (départ) · « tournée » = collecte France ·
« France-Europe » = « France » (même chose, nœud `france` dans Firebase) · « Mamadou » = Mamadou Niass
(livreur à Dakar, page `mamadou.html`) · « Issyaka », « Abdoulaye », « Aminata » = collaborateurs ·
« chauffeur externe » = chauffeur avec son propre camion (page `chauffeur.html`).

## Ce qui a été fait (grandes lignes, ordre approximatif)
- **Statistiques refaites** : écran « Comparer » (deux containers/mois/années, détail poste par poste :
  dépenses fixes, salaires par personne, tournées de camions, encaissé par Mamadou…) et écran **Évolution**
  (2 menus seulement : Période + Ce qu'on suit ; graphique en barres sur plusieurs containers).
  Cobey déteste le « fouillis » : peu de boutons, menus déroulants.
- **Perte de la collecte du 1er novembre** (cause : un téléphone en retard a écrasé la liste) →
  protections : fusion par transaction des collectes, écriture des seuls groupes modifiés, tombstones,
  sauvegarde quotidienne (**30 jours** maintenant), outil « Relire la base » / collectes orphelines.
- **Activité** : messages précis (ce qui a changé avant → après) pour départs, factures, planning ; pas
  d'Activité pour Samba, Ibrahima, Boubacar ; Outils allégé en accordéons.
- **Mamadou** : ne voit que les containers du Sénégal ; clôturés cachés ; cartes pastel (vert = arrivé,
  bleu = en route) ; **bouton « Visible par Mamadou »** sur le container (fiche du départ), **automatique dès
  l'arrivée à Dakar** (`containerAutorise`, mamadou.html). Un container sans décision garde l'ancienne règle
  (étape « Départ de Mitry » cochée).
- **Dépôt Dakar** : un container clôturé garde ses colis non remis (`_depDepartAuDepotDakar`).
- **Containers clôturés** : retirés de la liste des départs, visibles dans Archives > Départs clôturés.
- **Planning** : le nom d'un admin apparaît dans l'Activité (`addActivity(..., memeAdmin)`) ; **jour
  « chauffeur externe, personne à solliciter »** (`dct_planning_ext/<date>`, case à la création d'une collecte
  France, dans « Modifier la collecte », ou « Modifier ce jour » du Planning ; carte grisée, mention sur les
  cartes de collecte, la tuile Planning saute ce jour).
- **Suppressions de fiches France (incident du 30/10)** : Aminata a supprimé 7 clients (Francine D'almeida,
  Mamadou Loum, Masamba Mbaye, Ada, Beasaly, Mame Seynabou Mbaye, Aliou Mansaly) dont 3 déjà rangés dans le
  container « Chargement DKR » (n° 38, 39, 40 = Mamadou Loum, Aliou, Masamba, déclarés partis le 04/10). Cause :
  le bouton « Supprimer cette fiche » (fiche ouverte) efface la fiche, son container et ses photos sans garde, et
  ne copiait pas la personne dans le carnet. Réponse : **Corbeille de 30 jours** (case « CORBEILLE » dans
  Réglages, classée par container / collecte / client / contact / facture / dépense, bouton Rétablir) + outil
  « Retrouvés dans le carnet » (recréer une fiche depuis `dct/contacts`) + « Chercher dans l'historique »
  (Outils, relit `activite_items` même effacé). Masamba a été recréé par Cobey ; Aliou et Mamadou Loum à
  refaire/vérifier à la main (colis, prix, container). Photos perdues (les 4 vignettes ont été découpées
  dans ses captures et envoyées).
- **chauffeur.html** : le nom du client manquait dans les lignes d'Activité (fiche France = `nom`, pas `name`).
- **Outil de lecture Firebase** (voir `CLAUDE.md`) : compte `lecteur@dakarcitytransport.app` en lecture seule,
  règles publiées par Cobey (copie des anciennes : `firebase-rules-sauvegarde-2026-11-03.json`).

## Faits utiles sur les données (Firebase RTDB, projet `dakar-collecte`, forfait Spark)
- Clients Collecte : `dct/clients/<colId>/<clientId>` ; camions : `dct/dispatch/<colId>` ; carnet France :
  `dct/contacts/<téléphone>` (ne contient que des clients **France** ; l'écran Carnet de l'appli y ajoute les
  clients des collectes) ; dépôt direct : `dct_depot` ; France : `france/clients`, `france/collectes`.
- Containers : `departs/<id>` (`visibleMamadou`, `etapesTransport`, `statut`, `prochainRang`) ; un client France
  porte son container dans `departId` + un n° d'ordre `rangDepart`. **Un n° manquant dans un container = un
  client retiré.**
- Dépenses fixes `dct_finance/fixes/<departId>` ; dépenses de tournée `dct_depenses/<colId>/<camion>`.
- Activité `activite_items` (« Effacer » ne fait que masquer sur le téléphone) ; corbeille `dct_corbeille` ;
  jours chauffeur externe `dct_planning_ext` ; planning `dct_planning/<date>/<idPersonne>`.
- `departs.js` est chargé par `dct-app.html?v=APP_VERSION` : **toujours monter APP_VERSION**.

## À faire / en suspens (par ordre d'importance)
1. **Sécurité** : le mot de passe du compte `staff@dakarcitytransport.app` est écrit en clair dans
   `departs.js` (`DEP_STAFF_PASSWORD`) ; si le dépôt est public, n'importe qui peut lire/écrire toute la base
   (les règles n'autorisent que ce compte). À discuter AVANT de coder : changer le mot de passe, revoir la
   connexion de l'appli, rendre le dépôt privé si possible.
2. **Réponse obligatoire au Planning à la connexion** — proposé, pas codé. Design discuté : écran plein écran
   avant de naviguer, pour l'équipe fixe seulement (pas Eric, Aminata, Mamadou, chauffeurs), sur le **prochain
   jour** à pourvoir (pas les autres) ; **ignorer les jours « chauffeur externe »** (`_depPlSansEquipe`) ;
   après jeudi 22h la réponse ne compte plus (on a besoin de s'organiser avant pour les chauffeurs externes) :
   la personne non répondante reste bloquée jusqu'à ce que la direction (Eric/Aminata) la débloque en saisissant
   sa réponse, sans bouton « plus tard » ; options à confirmer avec Cobey (déblocage auto le dimanche midi ?).
3. **Sauvegarde quotidienne de France** (comme celle de la Collecte) : non faite ; la corbeille couvre les
   suppressions futures mais pas les écrasements.
4. **Nettoyage automatique de la corbeille** : il ne se fait aujourd'hui qu'à l'ouverture de l'écran Corbeille ;
   Cobey peut demander un nettoyage au démarrage de l'appli (direction).
5. **Chauffeur externe — création automatique d'une tournée** pour ne plus avoir de ramasse sans trace (proposé,
   pas validé). Le 02/10, la ramasse du chauffeur externe n'avait aucune tournée enregistrée.
6. Bloquer le bouton « Supprimer cette fiche » (France) pour une fiche déjà rangée dans un container : proposé,
   pas validé (aujourd'hui : avertissement + corbeille).
7. Messages d'Activité non détaillés restants : planning et connexions des comptes (proposé).
8. Renommer « Paye chauffeur externe » en « Chauffeur (avec son camion) » dans les dépenses de tournée (proposé,
   pas validé) ; pas de poste fixe « Chauffeur » pour éviter les doublons.
9. Le chiffre d'affaires par type de colis est impossible (la donnée n'existe pas).
10. Si on change la date d'une collecte France, le choix « chauffeur externe » la suit (fait) ; l'ancien
    comportement laissait le gris sur l'ancienne date.
11. Cloudflare (`cloudflare-worker.js`, `CLOUDFLARE-A-FAIRE.md`) : rappels de planning ; il ne connaît pas
    `dct_planning_ext` — un jour « chauffeur externe » peut encore déclencher un rappel si le Worker les lit.

## Pièges rencontrés (à ne pas refaire)
- Oublier de monter `APP_VERSION` quand `departs.js` change → anciens téléphones en cache.
- Ne pas affirmer qu'une fonction marche sans test ; le sandbox n'a pas d'accès Firebase réel (utiliser les faux
  Firebase des tests, ou le compte lecteur en lecture seule).
- Éviter les longues listes de questions ; recommander et agir quand Cobey dit « ok ».
