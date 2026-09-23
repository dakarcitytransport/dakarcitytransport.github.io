# Mises à jour à faire — DCT

Notes prises le 22/09/2026, à traiter à partir du 23/09.
Rien de tout cela n'est codé. Les points marqués **?** sont à préciser
avant de commencer.

---

## 1 · Droits et profils

- **Ablaye** passe administrateur, comme Issyaka.
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

### Carré Départ
Afficher côte à côte, avec des couleurs qui les distinguent :
- total **payé** et total **dû**, hors livraison
- total **livraison payée** et **livraison due**

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

- Le **regroupement de factures** ne fonctionne pas pour tout le monde.
  **?** Chez qui, et à quel moment exactement ?

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
