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

## 3 · Mettre les cinq clés

**Settings** → **Variables and Secrets** → **Add**.

| Nom | Type | Valeur |
|---|---|---|
| `VAPID_PUBLIC` | Text | `BA_ZoZeRbLL6oY8upT2gfESS3SbaqgHY-s1OafuI2ZuuiJeLV2_63zFpiEDO6uVq3qZgThDe6m-9sdykectvJEw` |
| `VAPID_PRIVATE` | **Secret** | *donnée à part — voir le message du 26/09* |
| `CONTACT` | Text | `mailto:` suivi de votre adresse mail |
| `FIREBASE_CLIENT_EMAIL` | Text | le `client_email` du compte de service (voir ci-dessous) |
| `FIREBASE_PRIVATE_KEY` | **Secret** | le `private_key` du compte de service, en entier (voir ci-dessous) |

> **`VAPID_PRIVATE` et `FIREBASE_PRIVATE_KEY` doivent être de type
> « Secret », pas « Text ».** Ce sont des clés qui permettent d'agir en
> votre nom. Elles ne doivent jamais apparaître dans le code du site, ni
> être envoyées par message une deuxième fois.

**Pour obtenir `FIREBASE_CLIENT_EMAIL` et `FIREBASE_PRIVATE_KEY`** (depuis
v1.7.0, 04/10/2026 — remplace l'ancienne connexion « anonyme », que
Google bloquait pour les appels venant d'un serveur comme Cloudflare) :

1. Console Firebase → **⚙️ Paramètres du projet** → onglet **Comptes de
   service**
2. **Générer une nouvelle clé privée** → un fichier `.json` se télécharge
3. Ouvrez ce fichier : il contient un champ `client_email` (une adresse
   du genre `firebase-adminsdk-xxxxx@dakar-collecte.iam.gserviceaccount.com`)
   et un champ `private_key` (un long texte commençant par
   `-----BEGIN PRIVATE KEY-----`)
4. Copiez `client_email` tel quel dans la variable `FIREBASE_CLIENT_EMAIL`
5. Copiez `private_key` **en entier** (avec les `-----BEGIN...-----` et
   `-----END...-----`) dans la variable `FIREBASE_PRIVATE_KEY`

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
| `Erreur : connexion Firebase (compte de service) : ...` | la connexion du Worker vers Firebase lui-même est refusée — **rien n'est envoyé à personne**. La parenthèse donne la raison exacte renvoyée par Google (depuis v1.7.0, 04/10/2026) : le plus souvent `invalid_grant` avec un détail du genre « account not found » (le `client_email` ne correspond à aucun compte de service de ce projet — à revérifier dans le fichier `.json` téléchargé) ou une clé signée qui ne vérifie pas (le `private_key` a été mal recopié — recopiez-le en entier, avec `-----BEGIN...-----` et `-----END...-----`). Voir étape 3 pour (re)générer ces deux variables. |
| *(historique)* `Erreur : connexion Firebase anonyme : 400 (...)` | ancien message, avant v1.7.0 — ce fichier essayait de se connecter en « anonyme » (comme un visiteur du site), que Google a fini par refuser systématiquement pour les appels venant d'un serveur (quelle que soit la clé API utilisée, vérifié). Remplacé par le compte de service ci-dessus, qui ne dépend plus de cette connexion anonyme du tout. |
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
