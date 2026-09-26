# Brancher les notifications — les 6 étapes

*Pour Cobey. Compte Cloudflare déjà créé le 26/09/2026.*
*Tout est gratuit. Aucune carte bancaire n'est demandée à aucun moment.*

---

## 1 · Créer le Worker

Sur le tableau de bord Cloudflare :

**Compute (Workers)** → **Create** → **Start with Hello World!** → **Deploy**

Nommez-le **`dct-notifications`**.

---

## 2 · Coller le programme

Une fois créé : **Edit code**.

Effacez tout ce qu'il y a dans la fenêtre, et collez à la place le contenu
du fichier **`cloudflare-worker.js`** de ce dépôt.

Puis **Deploy**.

---

## 3 · Mettre les trois clés

**Settings** → **Variables and Secrets** → **Add**.

| Nom | Type | Valeur |
|---|---|---|
| `VAPID_PUBLIC` | Text | `BA_ZoZeRbLL6oY8upT2gfESS3SbaqgHY-s1OafuI2ZuuiJeLV2_63zFpiEDO6uVq3qZgThDe6m-9sdykectvJEw` |
| `VAPID_PRIVATE` | **Secret** | *donnée à part — voir le message du 26/09* |
| `CONTACT` | Text | `mailto:` suivi de votre adresse mail |

> **`VAPID_PRIVATE` doit être de type « Secret », pas « Text ».**
> C'est la clé qui permet d'envoyer en votre nom. Elle ne doit jamais
> apparaître dans le code du site, ni être envoyée par message une
> deuxième fois.

Puis **Deploy** à nouveau.

---

## 4 · Régler le minuteur

**Settings** → **Trigger Events** → **Add** → **Cron Trigger**

Mettez : `* * * * *`

C'est « toutes les minutes ». C'est le maximum du plan gratuit, et
largement suffisant.

---

## 5 · Vérifier que Firebase répond

Le Worker a une adresse, du genre
`https://dct-notifications.VOTRE-NOM.workers.dev`.

Ouvrez-la dans un navigateur. Vous devez voir quelque chose comme :

```json
{ "traites": 0, "envois": 0, "echecs": 0, "oublies": 0 }
```

**Si vous voyez une erreur `lecture dct_file_push : 401`**, c'est que la
base Firebase est protégée. Dites-le moi, j'ajouterai une quatrième
variable `FIREBASE_SECRET`.

---

## 6 · L'essai en vrai

1. Sur votre téléphone, ouvrez l'application **depuis l'écran d'accueil**
2. Dans les cases, touchez **Activer** sur le bandeau vert
3. Acceptez la demande du téléphone
4. Allez dans **Planning** → onglet **L'équipe**
5. Touchez **Relancer**
6. Attendez une minute

La notification doit arriver, même application fermée.

---

## Si rien n'arrive

Ouvrez l'adresse du Worker : les chiffres disent où ça coince.

| Ce que vous voyez | Ce que ça veut dire |
|---|---|
| `traites: 0` | la relance n'est pas arrivée dans Firebase |
| `envois: 0` et `echecs` > 0 | les clés VAPID sont mal recopiées |
| `oublies` > 0 | le téléphone avait refusé — refaites l'étape 6 |
| `envois` > 0 mais rien sur le téléphone | les notifications sont coupées dans les réglages du téléphone |

---

## Ce qui est déjà vérifié

Le chiffrement et la signature ont été testés automatiquement : un
message chiffré puis déchiffré comme le ferait un téléphone revient
identique, la signature se vérifie avec la clé publique, la file se vide
correctement, les bonnes personnes sont visées et les téléphones qui ne
répondent plus sont oubliés.

**Ce qui n'a pas pu être testé ici** : l'envoi réel, qui exige de joindre
les serveurs de Google — bloqués depuis l'environnement de développement.
C'est l'étape 6 qui le dira.
