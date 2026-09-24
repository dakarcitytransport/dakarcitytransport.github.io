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

### Dépenses par camion
Sous « imprimer les étiquettes » de chaque camion, une case de dépenses :
carburant, déjeuner, autres. Ces montants sont **déduits du gain du
camion**, et datés avec l'heure.

**?** Qui les saisit : le collecteur lui-même, ou seulement la direction ?

### Écran recettes / dépenses / bénéfice
Par container, ou en total, pour chaque poste.

Exemple donné pour septembre 2026 :

| | |
|---|---|
| Recettes | 84 120 € |
| Dépenses | 12 895 € *(données encore incomplètes)* |
| **Bénéfice** | **71 225 €** |

Le bénéfice suit les recettes et les dépenses : il monte ou descend.

### Dépenses fixes, saisies à la main
loyer · dédouanement · container · salaires · location · autres

### Container
Total payé et total dû.

### Anciennes données
Récupérer les données de l'ancienne application.

**?** Où sont-elles, et que faut-il en reprendre ?

### Statistiques
Une case avec des graphiques, pour chaque poste.
