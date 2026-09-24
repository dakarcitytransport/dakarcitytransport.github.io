# Mises à jour à faire — DCT

Notes prises le 22/09/2026, à traiter à partir du 23/09.
Rien de tout cela n'est codé. Les points marqués **?** sont à préciser
avant de commencer.

---

## 1 · Droits et profils

- ~~**Ablaye** passe administrateur, comme Issyaka.~~
  **Fait le 24/09 (v1.55.0).** Abdoulaye (AB) rejoint la direction, aux
  mêmes conditions qu'Issyaka : il garde son profil, son PIN et sa
  couleur, et voit en plus DÉPARTS, RAPPORT FINANCIER, STATISTIQUES et
  RÉGLAGES. Seule la case MAINTENANCE (passe-partout) reste à Cobey —
  comme pour Issyaka.
- **Nouveau profil : Aminata**, avec accès à :
  - Devis
  - Articles
  - Client
  - Collecte
  - France & Europe
  - Inscription au dépôt

  Son rôle : prendre les appels, enregistrer les devis, les clients et les
  dispatchs, tenir les réseaux sociaux.

  **?** Collaboratrice avec ces accès, ou administratrice ?
  **?** « numéro cette semaine » — à quoi cela correspond-il ?

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

### Lenteur
Après modification d'une facture, le prix met trop de temps à apparaître
sur la fiche client.

### Suivi du colis
- Retirer la date affichée à chaque étape.
- Ne garder que l'arrivée à Dakar et l'arrivée au dépôt, visibles au clic.
- Afficher la **date d'arrivée estimée au port de Dakar** sur la facture
  de suivi.

---

## 3 · Bug

- ~~Le **regroupement de factures** ne fonctionne pas pour tout le monde.~~
  **Réglé le 24/09 (v1.54.0).** Le bouton « Regrouper avec une autre
  facture » n'existait que sur les fiches de la Collecte. Le carré Départ,
  lui, comptait les doublons des trois parcours : il annonçait « 4 factures »
  puis ne proposait rien sur la fiche du Dépôt direct ni sur celle de
  France & Europe. Les trois parcours partagent désormais le même
  regroupement, dans les deux sens (regrouper et séparer).

- **Lenteur** — après modification d'une facture, le prix met trop de temps
  à apparaître sur la fiche client. *(à traiter)*

---

## 4 · Factures et étiquettes

- Pouvoir créer des **factures manuelles** rattachées à un container,
  pour le suivi.
- **Agrandir le QR code** de l'étiquette.
- Remplacer « Scanner en secours » par le **numéro de client**.

---

## 5 · Espace Mamadou — livreur à Dakar (lien externe)

Un accès séparé, sur le modèle du lien des chauffeurs externes.

**?** Confirmer : c'est bien le livreur à Dakar, avec son propre lien ?

### Ses écrans
- une **case QR code**, pour scanner une étiquette ;
- une **case container**, pour accéder aux clients comme le carré Départ,
  mais **sans aucun total d'argent du container**.

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

### Container
Total payé et total dû.

### ~~Anciennes données~~
**Abandonné le 24/09 (v1.73.0).** Pas de reprise du tout : la nouvelle
application repart de zéro en septembre 2026 et ne compte que ce qui
passe par elle. Le bloc « Bénéfice repris de 360 » a été retiré.

### Statistiques
Une case avec des graphiques, pour chaque poste.
