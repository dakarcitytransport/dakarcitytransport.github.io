/* ═══════════════════════════════════════════════════════════
   DCT — L'ENVOYEUR DE NOTIFICATIONS
   v1.12.0 · 08/11/2026

   Ce fichier ne fait PAS partie du site. Il se colle chez Cloudflare, et
   il y tourne tout seul, une fois par minute. C'est lui qui envoie
   réellement les notifications sur les téléphones.

   Ce qu'il fait, à chaque réveil :
     0. (v1.11.0) il envoie le classement des collaborateurs : point de la semaine le dimanche 20h, bilan du container le lendemain du chargement 19h (voir « Le classement des collaborateurs » plus bas) ;
     1. il gère le planning du dimanche (voir plus bas) — et note dans
        dct_annonces (visible dans l'appli, case Notification) chaque
        rappel automatique envoyé et à qui (v1.5.0) ;
     2. il lit la file d'attente dans Firebase (dct_file_push) ;
     3. pour chaque message pas encore envoyé, il retrouve les téléphones
        des personnes visées (dct_push) ;
     4. il chiffre le message pour chaque téléphone et l'envoie ;
     5. il marque le message comme envoyé, et oublie les téléphones qui
        n'existent plus.

   ── LE DÉLAI DU PLANNING : JEUDI 22H (v1.1.0) ──
   Cobey, le 26/09/2026 : « si le collaborateur n'a pas répondu avant le
   jeudi 22h précédent le dimanche, il ne pourra plus répondre et sera
   considéré comme absent, seuls les admins pourront modifier ça ».

   L'application (departs.js) empêche déjà, elle-même, qu'un collaborateur
   réponde après ce délai — ça marche sans dépendre de ce fichier. Ce qui
   ne peut se faire QUE depuis ici, qui tourne même quand personne n'a
   l'application ouverte :
     - rappeler ceux qui n'ont pas répondu (lundi 9h, mercredi 20h, jeudi
       18h — trois rappels avant le couperet) ;
     - à jeudi 22h passé, écrire « absent » pour ceux qui sont restés
       silencieux, et prévenir chacun des cinq de son statut final.

   Ce fichier ne connaît pas COLLABS (il n'a accès qu'à Firebase, pas à
   l'application) : departs.js lui laisse donc un mémo à jour dans
   dct_planning_participants chaque fois que la case Planning s'affiche.
   Tant que personne ne l'a ouverte au moins une fois après avoir posé ce
   fichier, ce mémo est vide et rien ne se passe ici — sans risque, juste
   sans effet.

   Pourquoi tout le chiffrement est écrit à la main ici : une notification
   web est chiffrée de bout en bout, et les bibliothèques qui font ça
   demandent un outil de compilation. Or ce fichier doit pouvoir se coller
   tel quel dans la fenêtre de Cloudflare, sans rien installer. Il ne
   dépend donc de rien.

   ── CE QU'IL FAUT RÉGLER CHEZ CLOUDFLARE ──
   Cinq variables, dans Settings → Variables and Secrets :
     VAPID_PUBLIC          la clé publique (la même que dans departs.js)
     VAPID_PRIVATE         la clé privée — À GARDER SECRÈTE, type « Secret »
     CONTACT               une adresse mail, exigée par les services d'envoi
     FIREBASE_CLIENT_EMAIL le « client_email » du compte de service (Text)
     FIREBASE_PRIVATE_KEY  le « private_key » du compte de service — À
                            GARDER SECRÈTE, type « Secret » (voir v1.7.0
                            ci-dessous pour comment l'obtenir)
   ═══════════════════════════════════════════════════════════ */

const BASE = 'https://dakar-collecte-default-rtdb.europe-west1.firebasedatabase.app';

/* ─── Petits outils ─── */

const enc = new TextEncoder();

function b64urlVersOctets(s){
  s = String(s || '').replace(/-/g, '+').replace(/_/g, '/');
  s += '='.repeat((4 - s.length % 4) % 4);
  const brut = atob(s);
  const out = new Uint8Array(brut.length);
  for(let i = 0; i < brut.length; i++) out[i] = brut.charCodeAt(i);
  return out;
}

function octetsVersB64url(b){
  let s = '';
  const a = new Uint8Array(b);
  for(let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function coller(...morceaux){
  const total = morceaux.reduce((n, m) => n + m.length, 0);
  const out = new Uint8Array(total);
  let d = 0;
  for(const m of morceaux){ out.set(m, d); d += m.length; }
  return out;
}

async function hmac(cle, donnees){
  const k = await crypto.subtle.importKey('raw', cle, { name:'HMAC', hash:'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, donnees));
}

/* ─── Connexion à Firebase, par compte de service (v1.7.0) ───

   Cobey, le 26/09/2026, juste après avoir resserré les règles de la
   base (« auth != null » en lecture et en écriture, voir
   MAJ-A-FAIRE.md) : une notification envoyée n'arrivait plus. Ce
   fichier a d'abord fait, pour s'identifier, exactement ce que fait
   l'application elle-même (_depConnexionAnonyme, departs.js) : une
   connexion « anonyme » à Firebase Authentication.

   v1.6.1/v1.6.2 (04/10/2026) — Eric puis Cobey : plus personne ne
   recevait rien ; l'adresse du Worker montrait « connexion Firebase
   anonyme : 400 (API key not valid. Please pass a valid API key.) ».
   Diagnostiqué en direct avec Cobey, en épuisant les causes une par
   une (authentification anonyme bien activée, clé API dédiée créée
   sans restriction de site, Identity Toolkit API bien autorisée) —
   et la clé elle-même vérifiée VALIDE par un appel direct à Google
   (curl), hors de Cloudflare. Donc pas la clé : Google refuse
   spécifiquement les connexions « anonymes » de ce type quand elles
   viennent d'une infrastructure serveur comme Cloudflare plutôt que
   d'un vrai navigateur — un garde-fou anti-abus, pas documenté
   clairement, contre lequel il n'y avait rien à régler côté clé API.

   Le vrai correctif : abandonner la connexion « anonyme » (pensée pour
   un utilisateur humain dans un navigateur) pour la méthode prévue
   PRÉCISÉMENT pour un serveur comme celui-ci — un compte de service
   (Service Account), avec sa propre clé privée RSA, qui signe lui-même
   un jeton (JWT) échangé ensuite contre un vrai jeton d'accès Google.
   Comme pour la signature VAPID plus bas, tout est fait à la main avec
   l'API de chiffrement du navigateur (crypto.subtle), sans bibliothèque
   à installer — ce fichier doit toujours pouvoir se coller tel quel
   dans Cloudflare. */

// Une clé privée PEM (texte, séparée par des retours à la ligne) décodée
// en octets, pour crypto.subtle.importKey — base64 standard, pas « url ».
function b64VersOctets(b64){
  const brut = atob(b64.replace(/\s/g, ''));
  const out = new Uint8Array(brut.length);
  for(let i = 0; i < brut.length; i++) out[i] = brut.charCodeAt(i);
  return out;
}

async function _cleServiceCompte(pem){
  // Le fichier .json téléchargé par Firebase écrit les retours à la
  // ligne en toutes lettres (\n, deux caractères) à l'intérieur de la
  // valeur JSON — un copier-coller depuis ce fichier les reprend souvent
  // tels quels plutôt qu'en vrais sauts de ligne. Les deux formes sont
  // acceptées : b64VersOctets retire déjà les vrais espaces/retours,
  // ceci retire en plus le \n littéral s'il est resté.
  const corps = String(pem || '')
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\\n/g, '');
  return crypto.subtle.importKey('pkcs8', b64VersOctets(corps),
    { name:'RSASSA-PKCS1-v1_5', hash:'SHA-256' }, false, ['sign']);
}

let _jeton = { valeur: '', expire: 0 };

async function jetonAuth(env){
  // 60s de marge, pour ne jamais partir avec un jeton sur le point d'expirer.
  if(_jeton.valeur && Date.now() < _jeton.expire - 60000) return _jeton.valeur;

  const maintenant = Math.floor(Date.now() / 1000);
  const entete = { alg:'RS256', typ:'JWT' };
  const corps  = {
    iss  : env.FIREBASE_CLIENT_EMAIL,
    // v1.7.1 — le jeton s'obtenait bien, mais Firebase répondait 401 à la
    // lecture : le périmètre (scope) demandé était trop étroit. Le SDK
    // officiel Firebase Admin, pour ce même usage, demande toujours ces
    // deux portées ensemble — jamais la base de données seule.
    scope: 'https://www.googleapis.com/auth/firebase.database '
         + 'https://www.googleapis.com/auth/userinfo.email',
    aud  : 'https://oauth2.googleapis.com/token',
    iat  : maintenant,
    exp  : maintenant + 3600
  };
  const aSigner = octetsVersB64url(enc.encode(JSON.stringify(entete)))
    + '.' + octetsVersB64url(enc.encode(JSON.stringify(corps)));

  const cle = await _cleServiceCompte(env.FIREBASE_PRIVATE_KEY);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cle, enc.encode(aSigner));
  const assertion = aSigner + '.' + octetsVersB64url(sig);

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=' + encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')
        + '&assertion=' + assertion
  });
  if(!r.ok){
    // La raison précise (clé privée mal recopiée, client_email erroné...)
    // au lieu d'un simple code, pour ne pas avoir à deviner.
    let raison = '';
    try{ raison = (await r.json()).error_description || ''; }catch(e){}
    throw new Error('connexion Firebase (compte de service) : ' + r.status + (raison ? ' (' + raison + ')' : ''));
  }
  const j = await r.json();
  _jeton = { valeur: j.access_token, expire: Date.now() + Number(j.expires_in || 3600) * 1000 };
  return _jeton.valeur;
}

/* ─── Firebase, par son interface web ─── */

async function lire(chemin, env){
  const jeton = await jetonAuth(env);
  const r = await fetch(BASE + '/' + chemin + '.json', { headers: { 'Authorization': 'Bearer ' + jeton } });
  if(!r.ok) throw new Error('lecture ' + chemin + ' : ' + r.status);
  return (await r.json()) || {};
}

async function ecrire(chemin, valeur, env){
  const jeton = await jetonAuth(env);
  await fetch(BASE + '/' + chemin + '.json', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jeton },
    body: JSON.stringify(valeur)
  });
}

async function effacer(chemin, env){
  const jeton = await jetonAuth(env);
  await fetch(BASE + '/' + chemin + '.json', { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + jeton } });
}

/* ─── La signature VAPID ───
   Elle prouve au service de notification (Google, Apple, Mozilla) que
   c'est bien nous qui envoyons. C'est un jeton signé, valable 12 heures,
   propre à chaque destinataire. */

async function jeton(adresse, env){
  const origine = new URL(adresse).origin;
  const entete  = { typ:'JWT', alg:'ES256' };
  const corps   = {
    aud: origine,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: env.CONTACT || 'mailto:contact@dakarcitytransport.fr'
  };
  const aSigner = octetsVersB64url(enc.encode(JSON.stringify(entete)))
    + '.' + octetsVersB64url(enc.encode(JSON.stringify(corps)));

  // La clé privée se reconstitue à partir de la publique : celle-ci
  // contient les deux moitiés du point (x et y) après un octet 0x04.
  const pub = b64urlVersOctets(env.VAPID_PUBLIC);
  const jwk = {
    kty:'EC', crv:'P-256', ext:true, key_ops:['sign'],
    d: env.VAPID_PRIVATE,
    x: octetsVersB64url(pub.slice(1, 33)),
    y: octetsVersB64url(pub.slice(33, 65))
  };
  const cle = await crypto.subtle.importKey('jwk', jwk,
    { name:'ECDSA', namedCurve:'P-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign({ name:'ECDSA', hash:'SHA-256' }, cle, enc.encode(aSigner));
  return aSigner + '.' + octetsVersB64url(sig);
}

/* ─── Le chiffrement du message ───
   Norme RFC 8291. Le message est chiffré pour CE téléphone précis, avec
   les deux clés qu'il nous a données en s'abonnant : personne d'autre ne
   peut le lire, pas même le service qui le transporte. */

async function chiffrer(texte, p256dhB64, authB64){
  const uaPub = b64urlVersOctets(p256dhB64);
  const auth  = b64urlVersOctets(authB64);

  const uaCle = await crypto.subtle.importKey('raw', uaPub,
    { name:'ECDH', namedCurve:'P-256' }, false, []);
  const ephemere = await crypto.subtle.generateKey(
    { name:'ECDH', namedCurve:'P-256' }, true, ['deriveBits']);
  const asPub = new Uint8Array(await crypto.subtle.exportKey('raw', ephemere.publicKey));
  const partage = new Uint8Array(await crypto.subtle.deriveBits(
    { name:'ECDH', public: uaCle }, ephemere.privateKey, 256));

  const un = new Uint8Array([1]);
  const prkCle = await hmac(auth, partage);
  const infoCle = coller(enc.encode('WebPush: info\0'), uaPub, asPub);
  const ikm = await hmac(prkCle, coller(infoCle, un));

  const sel = crypto.getRandomValues(new Uint8Array(16));
  const prk = await hmac(sel, ikm);
  const cek   = (await hmac(prk, coller(enc.encode('Content-Encoding: aes128gcm\0'), un))).slice(0, 16);
  const nonce = (await hmac(prk, coller(enc.encode('Content-Encoding: nonce\0'),    un))).slice(0, 12);

  // Le 0x02 final marque la fin du texte, avant le remplissage.
  const clair = coller(enc.encode(texte), new Uint8Array([2]));
  const aesCle = await crypto.subtle.importKey('raw', cek, { name:'AES-GCM' }, false, ['encrypt']);
  const chiffre = new Uint8Array(await crypto.subtle.encrypt(
    { name:'AES-GCM', iv: nonce, tagLength:128 }, aesCle, clair));

  // L'en-tête que le téléphone lira pour déchiffrer : le sel, la taille
  // de bloc, puis notre clé publique éphémère.
  const taille = new Uint8Array([0, 0, 16, 0]);       // 4096
  return coller(sel, taille, new Uint8Array([asPub.length]), asPub, chiffre);
}

/* ─── L'envoi à un téléphone ─── */

async function envoyerA(tel, message, env){
  const corps = await chiffrer(JSON.stringify(message), tel.p256dh, tel.auth);
  const jwt = await jeton(tel.adresse, env);
  const r = await fetch(tel.adresse, {
    method: 'POST',
    headers: {
      'Authorization'   : 'vapid t=' + jwt + ', k=' + env.VAPID_PUBLIC,
      'Content-Encoding': 'aes128gcm',
      'Content-Type'    : 'application/octet-stream',
      'TTL'             : '86400'
    },
    body: corps
  });
  return r.status;
}

/* ─── Le planning : rappels et couperet de jeudi 22h (v1.1.0) ─── */

const PL_MOIS = ['janvier','février','mars','avril','mai','juin','juillet',
                  'août','septembre','octobre','novembre','décembre'];

// Comme _depProchainsDimanches côté application, mais en UTC explicite :
// Dakar est à l'heure UTC toute l'année, et un Worker Cloudflare ne
// dépend d'aucun fuseau réglé sur un appareil — les deux calculs
// tombent donc bien sur le même dimanche.
function plProchainsDimanches(n){
  const out = [];
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0);
  if(d.getUTCDay() !== 0) d.setUTCDate(d.getUTCDate() + ((7 - d.getUTCDay()) % 7));
  for(let i = 0; i < n; i++){
    const iso = d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0')
              + '-' + String(d.getUTCDate()).padStart(2, '0');
    out.push({ iso, libelle: d.getUTCDate() + ' ' + PL_MOIS[d.getUTCMonth()] });
    d.setUTCDate(d.getUTCDate() + 7);
  }
  return out;
}

// Les échéances d'un dimanche donné, à partir de minuit UTC ce jour-là —
// jeudi22h reste exactement le calcul que fait _depPlEcheance côté
// application pour le couperet (délai de réponse, absence d'office) ;
// vendredi10h ne concerne QUE l'envoi de la notification de résultat —
// Cobey, le 27/09/2026 : « pour le résultat final on va plutôt le
// décaler à vendredi matin 10h, jeudi 22h ça peut être tard ».
function plDatesCles(iso){
  const dimanche = new Date(iso + 'T00:00:00Z');
  const j = 86400000, h = 3600000;
  return {
    lundi9h    : new Date(dimanche.getTime() - 6 * j + 9  * h),
    mercredi20h: new Date(dimanche.getTime() - 4 * j + 20 * h),
    jeudi18h   : new Date(dimanche.getTime() - 3 * j + 18 * h),
    jeudi22h   : new Date(dimanche.getTime() - 3 * j + 22 * h),
    vendredi10h: new Date(dimanche.getTime() - 2 * j + 10 * h)
  };
}

function plCleUnique(){
  return 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* v1.4.0 : Cobey, le 27/09/2026 : « rajoute-moi, j'ai besoin de savoir
   quand ça sera envoyé, pour vérifier si c'est fonctionnel ». Pas un
   participant (il ne roule pas le dimanche) — juste prévenu à chaque
   étape, pour contrôler que le minuteur tourne bien, même les semaines
   où il n'y a personne à relancer. */
const ID_OBSERVATEUR = 'AD';

async function plObserver(sujet, corps, env){
  await ecrire('dct_file_push/' + plCleUnique(), {
    titre  : 'Planning',
    corps  : corps,
    sujet  : sujet,
    url    : './dct-app.html?ouvrir=planning',
    cibles : [ID_OBSERVATEUR],
    par    : 'systeme',
    creeLe : Date.now(),
    envoye : false
  }, env);
}

/* v1.5.0 : Cobey, sur l'écran Notification (la liste "Déjà envoyé") :
   « il faudrait inscrire aussi les rappels automatiques envoyés, et à
   qui ils ont été envoyés ». Jusqu'ici un rappel automatique ne
   laissait aucune trace consultable dans l'application — seulement une
   notification à l'observateur (ID_OBSERVATEUR), facile à manquer et
   jamais relisible après coup. Écrit maintenant dans dct_annonces, la
   même liste que les messages manuels de Cobey — avec les noms des
   destinataires, que l'app n'a qu'à afficher. */
async function plJournaliser(texte, noms, env){
  await ecrire('dct_annonces/' + plCleUnique(), {
    texte  : texte,
    par    : 'systeme',
    parNom : 'Planning automatique',
    destinataires: noms,
    creeLe : Date.now()
  }, env);
}

const PL_LIBELLE_ETAPE = {
  rappelLundi:    'lundi 9h',
  rappelMercredi: 'mercredi 20h',
  rappelJeudi:    'jeudi 18h'
};

/* v1.6.0 — Cobey, capture d'écran du message « Résultat final envoyé
   pour dimanche 4 octobre : 2 disponibles, 3 absents » à l'appui :
   « il ne précise pas qui est là, qui n'est pas là et qui n'a pas
   répondu [...] il faut que ce message confirme qui est là, qui est
   présent à la collecte, qui n'est pas présent et qui n'a pas répondu. »
   Un simple compte ne distinguait pas un "non" assumé d'un silence
   auto-marqué absent à jeudi 22h (fiche.auto, posée plus haut) — les
   deux tombaient dans "absents" sans qu'on sache qui est qui. On
   construit ici le texte détaillé, nom par nom, dans les trois
   catégories, réutilisé à la fois pour le message à Cobey
   (plObserver) et pour la trace dans Notification (plJournaliser). */
function plRecapTexte(ids, jour, participants){
  var nomDe = function(id){ return (participants[id] || {}).nom || id; };
  var presents = [], absents = [], sansReponse = [];
  ids.forEach(function(id){
    var r = jour[id] || {};
    if(r.auto) sansReponse.push(nomDe(id));
    else if(r.dispo) presents.push(nomDe(id));
    else absents.push(nomDe(id));
  });
  var ligne = function(emoji, label, noms){
    return noms.length ? (emoji + ' ' + label + ' (' + noms.length + ') : ' + noms.join(', ')) : (emoji + ' ' + label + ' : aucun');
  };
  return ligne('✅', 'Présents', presents) + '\n'
    + ligne('❌', 'Absents', absents) + '\n'
    + ligne('🔇', 'Sans réponse (absent d\'office)', sansReponse);
}

async function plRelancer(iso, libelle, ids, env){
  if(!ids.length) return;
  // v1.5.1 : Cobey : « je voulais m'inclure dans les personnes qui
  // reçoivent, pour vérifier » — le message-observateur (plObserver)
  // n'est qu'un résumé texte ; il veut aussi recevoir le VRAI rappel,
  // sur son téléphone, pour constater lui-même que la notification
  // arrive. Toujours ajouté, jamais en double (ID_OBSERVATEUR n'est de
  // toute façon jamais dans `ids`, qui vient des participants — Cobey
  // en est exclu, voir _depGensPlanning côté application).
  const cibles = ids.indexOf(ID_OBSERVATEUR) >= 0 ? ids : ids.concat([ID_OBSERVATEUR]);
  await ecrire('dct_file_push/' + plCleUnique(), {
    // v1.2.0 : « Planning », pas « Dakar City Transport » — déjà affiché
    // tout seul par l'iPhone comme nom de l'application ; le répéter
    // comme titre créait « Dakar City Transport / from Dakar City
    // Transport » (Cobey, capture d'écran à l'appui).
    titre  : 'Planning',
    corps  : 'Êtes-vous disponible dimanche ' + libelle + ' ? Merci de répondre dans '
           + 'Planning avant jeudi 22h — passé ce délai, vous serez noté absent.',
    sujet  : 'planning-' + iso,
    url    : './dct-app.html?ouvrir=planning',
    cibles : cibles,
    par    : 'systeme',
    creeLe : Date.now(),
    envoye : false
  }, env);
}

async function traitePlanning(env){
  const bilan = { rappels: 0, clotures: 0 };
  const participants = await lire('dct_planning_participants', env);
  const ids = Object.keys(participants);
  if(!ids.length) return bilan;   // personne n'a encore ouvert Planning

  const dimanches = plProchainsDimanches(5);
  const maintenant = Date.now();

  for(const dim of dimanches){
    const dates = plDatesCles(dim.iso);
    // Un couperet à plus de 3 jours ne concerne encore personne — pas
    // besoin de lire le planning de ce dimanche-là pour rien.
    if(maintenant < dates.lundi9h.getTime() - 3 * 86400000) continue;

    const jour = (await lire('dct_planning/' + dim.iso, env)) || {};
    const etat = (await lire('dct_planning_etat/' + dim.iso, env)) || {};
    const muets = () => ids.filter(id => !jour[id]);

    const etapes = [
      ['rappelLundi',     dates.lundi9h],
      ['rappelMercredi',  dates.mercredi20h],
      ['rappelJeudi',     dates.jeudi18h]
    ];
    for(const [cle, quand] of etapes){
      if(maintenant >= quand.getTime() && !etat[cle]){
        const m = muets();
        const noms = m.map(id => (participants[id] || {}).nom || id);
        if(m.length){ await plRelancer(dim.iso, dim.libelle, m, env); bilan.rappels++; }
        await plObserver(
          'planning-observateur-' + dim.iso + '-' + cle,
          (m.length
            ? ('Rappel envoyé à ' + m.length + ' personne' + (m.length > 1 ? 's' : ''))
            : 'Personne à relancer, tout le monde avait déjà répondu')
          + ' pour dimanche ' + dim.libelle + '.',
          env
        );
        await plJournaliser(
          'Rappel automatique (' + (PL_LIBELLE_ETAPE[cle] || cle) + ') pour dimanche ' + dim.libelle
            + (m.length ? '' : ' — personne à relancer, tout le monde avait déjà répondu.'),
          noms,
          env
        );
        await ecrire('dct_planning_etat/' + dim.iso, { [cle]: true }, env);
      }
    }

    if(maintenant >= dates.jeudi22h.getTime() && !etat.verrouille){
      // Absent d'office pour qui n'a rien mis — Cobey : « il ne pourra
      // plus répondre et sera considéré comme absent ». Le délai lui-même
      // reste jeudi 22h, inchangé — seule la notification qui l'annonce
      // est décalée plus bas (vendredi10h).
      for(const id of muets()){
        const fiche = { dispo:false, mot:'', nom:(participants[id] || {}).nom || '',
                         le: maintenant, auto:true };
        await ecrire('dct_planning/' + dim.iso + '/' + id, fiche, env);
        jour[id] = fiche;
      }
      await ecrire('dct_planning_etat/' + dim.iso, { verrouille: true }, env);
    }

    if(maintenant >= dates.vendredi10h.getTime() && !etat.clos){
      // v1.4.0 : Cobey, le 27/09/2026 : « pour le résultat final on va
      // plutôt le décaler à vendredi matin 10h, jeudi 22h ça peut être
      // tard ». Le statut, lui, est déjà figé depuis jeudi 22h
      // ci-dessus — seul l'ENVOI de la confirmation attend le
      // lendemain matin, pour ne pas déranger l'équipe tard le soir.
      for(const id of ids){
        const r = jour[id] || { dispo:false };
        await ecrire('dct_file_push/' + plCleUnique(), {
          titre  : 'Planning',
          corps  : r.dispo
            ? ('Vous êtes noté disponible dimanche ' + dim.libelle + '.')
            : ('Vous êtes noté absent dimanche ' + dim.libelle + ' — le délai de réponse est passé.'),
          sujet  : 'planning-resultat-' + dim.iso,
          url    : './dct-app.html?ouvrir=planning',
          cibles : [id],
          par    : 'systeme',
          creeLe : maintenant,
          envoye : false
        }, env);
      }
      const recap = plRecapTexte(ids, jour, participants);
      await plObserver(
        'planning-observateur-resultat-' + dim.iso,
        'Planning clôturé pour dimanche ' + dim.libelle + ' :\n' + recap,
        env
      );
      await plJournaliser(
        'Résultat final pour dimanche ' + dim.libelle + ' :\n' + recap,
        ids.map(id => (participants[id] || {}).nom || id),
        env
      );
      await ecrire('dct_planning_etat/' + dim.iso, { clos: true }, env);
      bilan.clotures++;
    }
  }
  return bilan;
}

/* ─── Le classement des collaborateurs (v1.11.0 · 08/11/2026) ───

   Cobey : « on envoie un message, une notification personnelle à chaque collaborateur pour lui indiquer sa place dans le classement,
   ses objectifs, et un message personnalisé selon sa situation, un panel de messages » ; « le dimanche soir » ; « les jours de
   chargement, c'est fini, il n'y a pas besoin de recevoir : il faut juste recevoir un bilan, le lendemain du chargement (lundi soir) ».

   · Chaque DIMANCHE à 20h (heure de Paris) : « ton point de la semaine » à chaque collaborateur (place, compteur, évolution, phrase),
     pour chaque container encore « en préparation » — sauf si ce dimanche est son jour de chargement (dateDepart) : rien n'est envoyé.
   · Le LENDEMAIN du chargement, à 19h (Paris) : « bilan du container » (place finale, clients, euros, objectif atteint à X %).
   · Eric (AD) reçoit à chaque fois le récapitulatif de toute l'équipe (il n'est pas dans le classement).
   Les chiffres viennent du mémo `dct_classement_memo/<container>` que l'application met à jour à chaque affichage de l'accueil
   (objectifs.js) : le container disparaît de l'accueil une fois parti, mais son mémo reste, ce qui permet le bilan final.
   L'état (déjà envoyé / photo de la semaine d'avant, pour « +4 clients cette semaine ») vit dans dct_classement_etat et dct_classement_snap.
   Le bouton « Envoyer un exemple » de Réglages > OBJECTIFS dépose une demande dans dct_classement_demande, traitée ici à la minute. */

const CL_PHRASES = {
  finAtteint: ['🎉 Objectif atteint, bravo pour ce container !', '🏆 Container réussi : tu as rempli ton objectif', '🔥 Belle performance, objectif tenu', '🥳 Bravo, tu as fait le travail !', '💪 Objectif atteint : on remet ça au prochain ?', '🌟 Très beau container, merci à toi', '👏 Objectif réussi, félicitations', '✅ Mission accomplie sur ce container'],
  finPodium: ['🏅 Tu finis sur le podium, bravo !', '🔥 Très belle place, il manquait peu pour l’objectif', '👏 Bon container, tu peux viser plus haut', '💪 Belle performance, on fait encore mieux au prochain', '🚀 Tu étais dans les meilleurs, bravo', '🌟 Beau travail, continue comme ça', '🎯 Presque l’objectif : au prochain, on y est', '🙂 Bien joué, rendez-vous au prochain container'],
  finMilieu: ['💪 Bon container, au prochain on vise plus haut', '🙂 Un travail correct, tu peux faire mieux', '📈 Tu as de la marge, relance tes contacts', '🎯 Au prochain container, fixe-toi un but précis', '🔔 Prépare ton carnet pour le prochain container', '🤝 Merci pour ton travail, on continue', '📞 Garde le contact avec tes clients, ils reviendront', '🚀 Le prochain container est une nouvelle chance'],
  finDeb: ['👏 Bravo pour ce premier pas, ton carnet démarre', '🌱 Un beau début, continue d’enrichir ton carnet', '📒 Ton carnet d’adresses grandit, bravo', '🔥 C’est lancé : au prochain, on fait plus', '💪 Tu as commencé, c’est le plus dur', '🎯 Au prochain container, vise un client de plus', '🤝 Merci, ton réseau commence à marcher', '😊 Belle progression, continue'],
  finZero: ['🌱 Pas de client sur ce container : au prochain, on essaie ?', '📒 Prépare ton carnet d’adresses pour le prochain', '☎️ Appelle tes contacts, un seul client suffit pour commencer', '🤝 Parle de DCT autour de toi dès maintenant', '🎯 Le prochain container, c’est ta chance', '💬 Demande à tes proches, ça marche', '🚀 On repart à zéro : à toi de jouer', '🔔 Un premier client change tout, essaie !']
};

// Phrases par moment du container (semaine 1, 2, 3, 4, D = dernière) et par situation — les mêmes que dans l'application (objectifs.js).
const CL_MX_PERSO = {
  '1': {
    'debut': ['🌱 Semaine {sem} : lance-toi, ton objectif est {obj}', '🚛 Début de container : chaque contact compte', '📞 Premier dimanche : appelle tes contacts', '☀️ Rien d’urgent, mais commence cette semaine', '🎬 Le container démarre : à toi de jouer', '📒 Ouvre ton carnet d’adresses cette semaine'],
    'temps': ['👍 Bon début : {n} clients dès la semaine {sem}', '🙂 Tu démarres bien, continue', '✅ Début régulier, bravo', '💪 Premier pas réussi : {n} clients', '🌿 Beau départ, garde ce rythme', '🚛 Tu es dans les temps dès le début'],
    'avance': ['🔥 Départ en trombe : {n} clients déjà !', '🚀 Super début, tu prends de l’avance', '😎 Tu démarres très fort, bravo', '⚡ +{avance} d’avance dès la semaine {sem}', '🏃 Premier sprint réussi', '🌟 Un début remarquable'],
    'atteint': ['🎉 Objectif atteint dès la semaine {sem} !', '🏆 {obj} clients en une semaine : bravo !', '🥳 Déjà ton objectif, quel départ', '💥 Objectif rempli, incroyable', '🔥 Tu as déjà fini ton objectif !', '👏 Bravo, tu peux viser plus haut']
  },
  '2': {
    'avance': ['🔥 Semaine {sem}/{N} : tu as de l’avance !', '🚀 En avance sur ton rythme, continue', '😎 {n} clients : tu es devant', '💪 Beau rythme, ne ralentis pas', '⚡ +{avance} d’avance, bravo', '🏃 Tu cours devant le planning'],
    'temps': ['👍 Semaine {sem}/{N} : tu es dans les temps', '✅ Ton rythme est bon, continue', '🙂 {n} clients, comme prévu à ce stade', '🧭 Pile dans ton planning', '💬 Encore {reste} pour ton objectif', '🌿 Tu avances régulièrement'],
    'retard': ['⏳ Semaine {sem}/{N} : un peu de retard', '📣 Il te manque {manque} pour être dans les temps', '📞 Relance tes contacts : {manque} à rattraper', '🔔 Tu peux rattraper, il reste du temps', '🚨 {manque} clients de retard : cette semaine on y va', '💪 Remonte ton rythme cette semaine'],
    'atteint': ['🎉 Objectif atteint en semaine {sem} !', '🏆 {obj} clients : tu es en avance, bravo', '🥳 Ton objectif est rempli bien avant la fin', '💥 Déjà au bout de ton objectif', '🔥 Mission accomplie, bravo', '👏 Excellent, tu peux viser plus']
  },
  '3': {
    'avance': ['🔥 Semaine {sem}/{N} : en avance, tu tiens !', '🚀 Belle avance, encore {reste} clients', '😎 Tu es devant ton rythme', '💪 Plus que {reste}, avec de l’avance', '⚡ +{avance} d’avance à ce stade', '🏃 Cap sur ton objectif !'],
    'temps': ['👍 Semaine {sem}/{N} : toujours dans les temps', '✅ Tu suis ton rythme, encore {reste}', '🙂 Milieu de parcours bien tenu', '🧭 {n} clients, comme prévu', '💬 Ça avance, ne relâche pas', '🌿 Régulier : continue ainsi'],
    'retard': ['⏳ Semaine {sem}/{N} : le retard se creuse', '📣 Il te manque {manque} pour tenir ton rythme', '🚨 Attention : {manque} à rattraper vite', '📞 Appelle tes contacts : {manque} de retard', '🔔 Il reste du temps, mais il faut accélérer', '💪 Un effort cette semaine et tu rattrapes'],
    'atteint': ['🎉 Objectif atteint en semaine {sem} : bravo !', '🏆 Ton objectif est rempli, il reste du temps', '🥳 Terminé avant la fin, quelle performance', '💥 {obj} clients : mission accomplie', '🔥 Objectif tenu, félicitations', '👏 Tu as de l’avance, tu peux aider les autres']
  },
  '4': {
    'avance': ['🔥 Semaine {sem}/{N} : en avance avant la fin !', '🚀 Presque au bout, encore {reste}', '😎 La fin approche, tu es devant', '💪 Plus que {reste}, avec de l’avance', '⚡ +{avance} d’avance, finis fort', '🏃 Belle ligne droite pour toi'],
    'temps': ['👍 Semaine {sem}/{N} : toujours dans les temps', '✅ La fin approche : encore {reste}', '🙂 Ton objectif se remplit comme prévu', '🧭 Plus que {reste}, garde le cap', '💬 La fin est proche, ne relâche pas', '🌿 Un dernier élan et c’est bon'],
    'retard': ['⏳ Semaine {sem}/{N} : il faut accélérer', '🚨 Il te manque {manque} pour tenir ton rythme', '📣 La fin approche : {manque} à rattraper', '📞 Appelle tes contacts, il reste peu de temps', '🔔 Le chargement approche : encore {reste}', '💪 Une grosse semaine pour rattraper'],
    'atteint': ['🎉 Objectif atteint avant la fin, bravo !', '🏆 Ton objectif est rempli en semaine {sem}', '🥳 Plein pour toi, quelle performance', '💥 {obj} clients, et il reste du temps', '🔥 Mission accomplie, merci', '👏 Bravo, tu peux finir tranquille']
  },
  'D': {
    'avance': ['🏁 Dernière semaine : en avance, finis fort !', '🚀 Ligne droite : encore {reste}, avec de l’avance', '😎 Dernière semaine, tu es devant', '💪 Plus que {reste} avant le chargement', '⚡ +{avance} d’avance pour la dernière ligne', '🔥 Tu boucles ce container en beauté'],
    'temps': ['🏁 Dernière semaine : encore {reste}', '✅ Ligne droite, ton rythme est tenu', '🙂 Plus que {reste} avant le chargement', '🧭 Dernier effort, tu y es presque', '💬 Dernière semaine, appelle tes contacts', '🚛 Le chargement approche, encore {reste}'],
    'retard': ['🚨 Dernière semaine : il te manque {reste} !', '📣 Dernier effort : {reste} avant le chargement', '📞 Appelle tous tes contacts cette semaine', '⏳ Le chargement approche : {reste} à trouver', '🔔 Dernière chance pour ton objectif', '💪 Une grosse dernière semaine, tu peux le faire'],
    'atteint': ['🎉 Objectif atteint pour le chargement, bravo !', '🏆 Ton objectif est rempli à la dernière semaine', '🥳 {obj} clients : tu as réussi', '💥 Mission accomplie sur ce container', '🔥 Objectif tenu, merci pour ton travail', '👏 Bravo, tu finis ce container en beauté']
  }
};
const CL_MX_DEB = {
  'tot': {
    'zero': ['📒 Semaine {sem} : ouvre ton carnet d’adresses', '👨‍👩‍👧 Pense à ta famille et à tes voisins', '☎️ Appelle tes contacts : un premier client suffit', '🌱 Un premier client et tu es lancé !', '🤝 Chaque contact peut devenir un client', '📲 Partage les numéros DCT à tes proches'],
    'encours': ['👏 Bravo, ton carnet commence à servir !', '🔥 Tu es lancé : encore {reste} pour ton objectif', '🌱 Beau début, continue d’enrichir ton carnet', '💪 Tes contacts répondent, bravo', '🎯 Encore {reste} et ton objectif est atteint', '😊 {n} sur {obj}, tu progresses'],
    'atteint': ['🎉 Objectif atteint, ton carnet a porté ses fruits !', '🏆 Bravo : tu as rempli ton objectif', '🥳 Premier objectif réussi, félicitations', '🌟 Beau travail, tu peux viser plus haut', '🔥 Objectif atteint, on monte la barre ?', '💪 Ton réseau fonctionne, bravo']
  },
  'tard': {
    'zero': ['📣 Semaine {sem}/{N} : il est temps d’ouvrir ton carnet', '☎️ Aucun client encore : appelle un contact aujourd’hui', '🔔 Le container avance : un seul client te lance', '📞 Il reste peu de temps, appelle tes proches', '🌱 Même un seul client change tout, essaie !', '🤝 Demande autour de toi avant le chargement'],
    'encours': ['👍 Semaine {sem}/{N} : {n} sur {obj}, continue !', '🔥 Encore {reste} avant le chargement', '📒 Ton carnet travaille, ne t’arrête pas', '💪 Bien parti, il reste {reste} à trouver', '🎯 Encore {reste} et ton objectif est atteint', '🚀 Le chargement approche, un dernier effort'],
    'atteint': ['🎉 Objectif atteint avant le chargement, bravo !', '🏆 Ton carnet a donné ses fruits', '🥳 Objectif rempli : félicitations', '🌟 Super, tu peux viser plus haut au prochain', '🔥 Objectif tenu, merci pour ton travail', '💪 Ton réseau fonctionne, continue']
  }
};

function clHash(t){ let h = 0; for(let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h; }
function clChoisir(liste, graine){ return liste[clHash(graine) % liste.length]; }
function clPlace(i){ return i === 1 ? '1er' : i + 'e'; }
function clEuros(n){
  const r = Math.round((n || 0) * 100) / 100, t = String(r).split('.');
  t[0] = t[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return t.join(',') + ' €';
}

// Où en est le container : semaine en cours (1..N, sur 4 ou 5 semaines de ramasse), part du chemin faite, « moment » des phrases.
function clInfo(memo, iso){
  const J = d => Date.parse(d + 'T00:00:00Z') / 86400000;
  const fin = memo.dateDepart || '';
  if(!fin) return { sem: 2, N: 4, p: 0.5, bucket: '2' };
  const f = J(fin);
  let dj = memo.debut ? J(memo.debut) : f - 21;
  if(dj > f) dj = f - 21;
  const N = memo.nbSem || Math.max(3, Math.min(6, Math.floor((f - dj) / 7) + 1));
  const a = J(iso);
  const sem = Math.max(1, Math.min(N, Math.floor((a - dj) / 7) + 1));
  const p = Math.max(0, Math.min(1, (a - dj + 1) / (f - dj + 1)));
  return { sem, N, p, bucket: sem >= N ? 'D' : String(Math.min(sem, 4)) };
}

// En avance / dans les temps / en retard par rapport au rythme ; jamais de reproche en semaine 1.
function clSituation(n, obj, info){
  if(n >= obj) return 'atteint';
  const att = obj * info.p;
  if(n >= att + obj * 0.08) return 'avance';
  if(n >= att - obj * 0.06) return 'temps';
  return info.sem === 1 ? 'debut' : 'retard';
}

// Le message d'UNE personne. p = { id, nom, n, nSem, eu, obj, place } ; total = nombre de classés ; prev = sa photo de la semaine d'avant (ou null) ;
// info = clInfo(...).
function clMessagePerso(p, total, prev, nomContainer, final, graine, info){
  info = info || { sem: 2, N: 4, p: 0.5, bucket: '2' };
  const reste = Math.max(0, p.obj - p.n), debutant = p.obj <= 10, att = p.obj * info.p;
  const delta = (p.nSem != null) ? p.nSem : (prev ? p.n - prev.n : null), mouv = prev ? prev.place - p.place : 0;   // mouv > 0 : on a gagné des places
  let liste, famille;
  if(final){
    famille = p.n >= p.obj ? 'finAtteint' : p.n === 0 ? 'finZero' : debutant ? 'finDeb' : p.place <= 3 ? 'finPodium' : 'finMilieu';
    liste = CL_PHRASES[famille];
  } else if(debutant){
    const zone = info.sem >= 3 ? 'tard' : 'tot', etat = p.n >= p.obj ? 'atteint' : (p.n === 0 ? 'zero' : 'encours');
    famille = 'deb' + zone + etat; liste = CL_MX_DEB[zone][etat];
  } else {
    const sit = clSituation(p.n, p.obj, info), b = CL_MX_PERSO[info.bucket] || CL_MX_PERSO['2'];
    famille = 'p' + info.bucket + sit; liste = b[sit] || b[sit === 'debut' ? 'temps' : 'retard'] || b['temps'];
  }
  const phrase = clChoisir(liste, graine + p.id + famille + p.n)
    .replace(/\{reste\}/g, reste).replace(/\{n\}/g, p.n).replace(/\{obj\}/g, p.obj).replace(/\{sem\}/g, info.sem).replace(/\{N\}/g, info.N)
    .replace(/\{manque\}/g, Math.max(1, Math.round(att - p.n))).replace(/\{avance\}/g, Math.max(1, Math.round(p.n - att)));
  if(final){
    const pct = p.obj > 0 ? Math.round(p.n / p.obj * 100) : 0;
    return { titre: '🏁 Bilan du container ' + nomContainer,
      corps: 'Tu finis ' + clPlace(p.place) + ' sur ' + total + ' : ' + p.n + ' client' + (p.n > 1 ? 's' : '') + ' · ' + clEuros(p.eu)
           + '. Objectif ' + p.obj + ' : ' + pct + ' %.\n' + phrase };
  }
  let evo = '';
  if(delta !== null){
    evo = delta > 0 ? '+' + delta + ' client' + (delta > 1 ? 's' : '') + ' cette semaine' : 'Aucun nouveau client cette semaine';
    if(mouv > 0) evo += ' · tu gagnes ' + mouv + ' place' + (mouv > 1 ? 's' : '');
    else if(mouv < 0) evo += ' · tu perds ' + (-mouv) + ' place' + (mouv < -1 ? 's' : '');
    evo += '\n';
  }
  return { titre: '🏆 Classement · semaine ' + info.sem + '/' + info.N,
    corps: 'Tu es ' + clPlace(p.place) + ' sur ' + total + ' · 🎯 ' + p.n + ' / ' + p.obj + ' clients · ' + clEuros(p.eu) + '\n' + evo + phrase };
}

// Le récapitulatif de toute l'équipe (pour Eric).
function clMessageRecap(rang, final, nomContainer){
  const lignes = rang.map(p => clPlace(p.place) + ' ' + p.nom + ' · ' + p.n + ' / ' + p.obj + ' · ' + clEuros(p.eu));
  return { titre: final ? '🏁 Bilan final · ' + nomContainer : '🏆 Classement de la semaine', corps: lignes.join('\n') };
}

// Date et heure à Paris (le Worker, lui, vit en UTC).
function parisMaintenant(date){
  const f = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23' });
  const g = {};
  f.formatToParts(date || new Date()).forEach(x => { g[x.type] = x.value; });
  const jours = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { iso: g.year + '-' + g.month + '-' + g.day, h: parseInt(g.hour, 10) % 24, m: parseInt(g.minute, 10), dow: jours[g.weekday] };
}

function clNomContainer(memo, dep){
  const n = String((memo && memo.nom) || (dep && dep.nom) || 'Container').replace(/^Chargement\s+/i, '');
  const d = (memo && memo.dateDepart) || (dep && dep.dateDepart) || '';
  return n + (d ? ' · ' + d.slice(8, 10) + '/' + d.slice(5, 7) : '');
}

async function clEnvoyer(env, io, cibles, m, sujet){
  await io.ecrire('dct_file_push/' + plCleUnique(), {
    titre: m.titre, corps: m.corps, sujet: sujet, url: './dct-app.html',
    cibles: cibles, par: 'systeme', creeLe: Date.now(), envoye: false
  }, env);
}

// Envoie à chaque classé son message, et le récapitulatif à Eric. Renvoie le nombre de personnes prévenues.
async function clEnvoyerContainer(env, io, cid, memo, dep, final, prevSnap, graine, iso){
  const rang = (memo.rang || []).filter(p => p && p.id).sort((a, b) => a.place - b.place);
  if(!rang.length) return 0;
  const nom = clNomContainer(memo, dep);
  for(const p of rang){
    const prev = prevSnap && prevSnap.par ? prevSnap.par[p.id] : null;
    await clEnvoyer(env, io, [p.id], clMessagePerso(p, rang.length, prev, nom, final, graine, clInfo(memo, iso)), 'classement-' + (final ? 'final-' : '') + graine);
  }
  await clEnvoyer(env, io, [ID_OBSERVATEUR], clMessageRecap(rang, final, nom), 'classement-recap-' + graine);
  try{
    await plJournaliser((final ? 'Bilan final du container ' + nom + ' envoyé' : 'Point de la semaine du classement envoyé (' + nom + ')') + ' à ' + rang.length + ' collaborateurs.',
      rang.map(p => p.nom || p.id), env);
  }catch(e){}
  return rang.length;
}

const CL_IO = { lire: (c, env) => lire(c, env), ecrire: (c, v, env) => ecrire(c, v, env) };

async function traiteClassement(env, io, maintenant){
  io = io || CL_IO;
  const bilan = { hebdo: 0, finals: 0, demandes: 0 };
  const now = parisMaintenant(maintenant);
  const memos = (await io.lire('dct_classement_memo', env)) || {};
  const cids = Object.keys(memos).filter(k => memos[k] && memos[k].rang);

  // 1. Les demandes d'exemple (bouton de Réglages) : « montre-moi ce que recevrait X »
  const demandes = (await io.lire('dct_classement_demande', env)) || {};
  for(const k of Object.keys(demandes)){
    const dm = demandes[k];
    if(!dm || dm.traite || !dm.versId) continue;
    const prefere = cids.slice().sort((a, b) => (memos[b].majLe || 0) - (memos[a].majLe || 0))[0];
    if(prefere){
      const memo = memos[prefere], rang = (memo.rang || []).slice().sort((a, b) => a.place - b.place);
      const snap = (await io.lire('dct_classement_snap/' + prefere, env)) || {};
      const nom = clNomContainer(memo, null);
      const final = dm.final === true;
      let m;
      if(dm.pourId === 'RECAP') m = clMessageRecap(rang, final, nom);
      else { const p = rang.filter(x => x.id === dm.pourId)[0]; if(p) m = clMessagePerso(p, rang.length, snap && snap.par ? snap.par[p.id] : null, nom, final, 'exemple' + k, clInfo(memo, now.iso)); }
      if(m) { await clEnvoyer(env, io, [dm.versId], { titre: '(exemple) ' + m.titre, corps: m.corps }, 'classement-exemple-' + k); bilan.demandes++; }
    }
    await io.ecrire('dct_classement_demande/' + k, { traite: true, traiteLe: Date.now() }, env);
  }
  if(!cids.length) return bilan;
  const etat = (await io.lire('dct_classement_etat', env)) || {};

  // 2. Le point de la semaine : dimanche, 20h passées (Paris), une fois par dimanche.
  if(now.dow === 0 && now.h >= 20 && !etat['hebdo_' + now.iso]){
    for(const cid of cids){
      const dep = (await io.lire('departs/' + cid, env)) || {};
      if(dep.statut !== 'preparation') continue;
      if(dep.dateDepart === now.iso) continue;                      // jour de chargement : rien (le bilan viendra demain)
      const prevSnap = (await io.lire('dct_classement_snap/' + cid, env)) || null;
      const n = await clEnvoyerContainer(env, io, cid, memos[cid], dep, false, prevSnap && prevSnap.par ? prevSnap : null, now.iso + cid, now.iso);
      bilan.hebdo += n;
      const par = {}; (memos[cid].rang || []).forEach(p => { if(p && p.id) par[p.id] = { n: p.n, eu: p.eu, place: p.place }; });
      await io.ecrire('dct_classement_snap/' + cid, { iso: now.iso, par: par }, env);
    }
    await io.ecrire('dct_classement_etat', { ['hebdo_' + now.iso]: true }, env);
  }

  // 3. Le bilan final : le lendemain du chargement (ou après), 19h passées (Paris), une seule fois par container.
  for(const cid of cids){
    if(etat['final_' + cid]) continue;
    const dep = (await io.lire('departs/' + cid, env)) || {};
    const depart = dep.dateDepart || memos[cid].dateDepart;
    if(!depart || now.iso <= depart) continue;                      // pas encore chargé, ou jour même
    const ecart = (Date.parse(now.iso + 'T00:00:00Z') - Date.parse(depart + 'T00:00:00Z')) / 86400000;
    if(ecart === 1 && now.h < 19) continue;                         // lendemain, mais avant 19h
    if(ecart <= 3){
      const n = await clEnvoyerContainer(env, io, cid, memos[cid], dep, true, (await io.lire('dct_classement_snap/' + cid, env)) || null, 'final' + cid, now.iso);
      bilan.finals += n;
    }
    await io.ecrire('dct_classement_etat', { ['final_' + cid]: true }, env);   // trop ancien : on le marque sans envoyer
  }
  return bilan;
}

/* ─── Le travail, une fois par minute ─── */

async function vider(env){
  const journal = { traites:0, envois:0, echecs:0, oublies:0 };

  const file = await lire('dct_file_push', env);
  const aFaire = Object.keys(file).filter(k => file[k] && !file[k].envoye);
  if(!aFaire.length) return journal;

  const tels = await lire('dct_push', env);

  for(const id of aFaire){
    const m = file[id];
    const cibles = m.cibles || [];

    // Les téléphones des personnes visées. Une personne peut en avoir
    // deux (son portable et une tablette) : on envoie aux deux.
    const destinataires = Object.keys(tels)
      .filter(k => tels[k] && cibles.indexOf(tels[k].collab) >= 0)
      .map(k => ({ cle:k, ...tels[k] }));

    for(const tel of destinataires){
      let statut = 0;
      try{
        statut = await envoyerA(tel, {
          // v1.2.0 : repli neutre si jamais un message arrivait sans
          // titre — jamais le nom de l'application, déjà affiché tout
          // seul par l'iPhone (voir plRelancer et le statut final).
          titre: m.titre || 'Notification',
          corps: m.corps || '',
          sujet: m.sujet || 'dct',
          url  : m.url || './dct-app.html'
        }, env);
      }catch(e){
        journal.echecs++;
        continue;
      }
      if(statut === 201 || statut === 200){ journal.envois++; }
      else if(statut === 404 || statut === 410){
        // Le téléphone a désinstallé ou refusé : son adresse ne vaut
        // plus rien, on la retire pour ne pas réessayer indéfiniment.
        await effacer('dct_push/' + tel.cle, env);
        journal.oublies++;
      } else {
        journal.echecs++;
      }
    }

    await ecrire('dct_file_push/' + id, { envoye:true, envoyeLe: Date.now() }, env);
    journal.traites++;
  }
  return journal;
}

/* ─── LAISSEZ-PASSER FIREBASE (v1.8.0, 03/11/2026) ───

   Cobey : le mot de passe du compte staff@ est écrit en clair dans le
   code public du site (departs.js, mamadou.html, chauffeur.html) : toute
   personne qui lit le code peut ouvrir toute la base. Ici, le serveur
   garde la clé. Une page envoie POST /auth avec ce que la personne a
   tapé (PIN, mot de passe de Mamadou ou code du chauffeur) ; le Worker
   le vérifie dans la base avec le compte de service, puis renvoie un
   « jeton personnalisé » que la page échange contre une connexion
   Firebase (signInWithCustomToken). Le jeton porte l'étiquette
   staff:true (même droits qu'aujourd'hui) et role:'equipe' | 'mamadou'
   | 'chauffeur' (pour resserrer les règles plus tard).

   Aucune nouvelle variable à régler : on réutilise FIREBASE_CLIENT_EMAIL
   et FIREBASE_PRIVATE_KEY.

   Essais ratés : au bout de 5 sur un même profil, le profil est bloqué
   (dct_config/pins_blocked, comme dans l'appli) ; au bout de 10 depuis
   une même adresse en 15 minutes, l'adresse est refusée un moment. */

const AUTH_ORIGINES = ['https://dakarcitytransport.github.io'];
const AUDIENCE_JETON = 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit';

function enteteCors(request){
  const o = request.headers.get('Origin') || '';
  const ok = AUTH_ORIGINES.indexOf(o) !== -1;
  return {
    'Access-Control-Allow-Origin' : ok ? o : AUTH_ORIGINES[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function repJson(obj, statut, request){
  return new Response(JSON.stringify(obj), { status: statut,
    headers: Object.assign({ 'Content-Type':'application/json; charset=utf-8',
                             'Cache-Control':'no-store' }, enteteCors(request)) });
}

// Jeton personnalisé Firebase : signé par la clé du compte de service.
async function jetonPersonnalise(uid, claims, env){
  const maintenant = Math.floor(Date.now() / 1000);
  const entete = { alg:'RS256', typ:'JWT' };
  const corps = {
    iss: env.FIREBASE_CLIENT_EMAIL, sub: env.FIREBASE_CLIENT_EMAIL,
    aud: AUDIENCE_JETON, iat: maintenant, exp: maintenant + 3600,
    uid: uid, claims: claims
  };
  const aSigner = octetsVersB64url(enc.encode(JSON.stringify(entete)))
    + '.' + octetsVersB64url(enc.encode(JSON.stringify(corps)));
  const cle = await _cleServiceCompte(env.FIREBASE_PRIVATE_KEY);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cle, enc.encode(aSigner));
  return aSigner + '.' + octetsVersB64url(sig);
}

// Lecture / écriture d'une valeur simple (lire() renvoie {} pour « rien »).
async function lireValeur(chemin, env){
  const t = await jetonAuth(env);
  const r = await fetch(BASE + '/' + chemin + '.json', { headers: { 'Authorization': 'Bearer ' + t } });
  if(!r.ok) throw new Error('lecture ' + chemin + ' : ' + r.status);
  return await r.json();
}
async function poserValeur(chemin, valeur, env){
  const t = await jetonAuth(env);
  const r = await fetch(BASE + '/' + chemin + '.json', {
    method:'PUT', headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + t },
    body: JSON.stringify(valeur) });
  if(!r.ok) throw new Error('écriture ' + chemin + ' : ' + r.status);
}

// Comparaison en temps constant (pour ne pas deviner un PIN à la durée).
function egauxConstant(a, b){
  a = String(a); b = String(b);
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for(let i = 0; i < n; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

async function empreinte(texte){
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(texte)));
  return octetsVersB64url(h).slice(0, 22);
}

// Les profils administrateurs ne se bloquent pas (comme dans l'appli : ils
// n'avaient pas de blocage) — sinon un inconnu pourrait enfermer la direction
// dehors en tapant 5 mauvais codes. Ils restent protégés par la limite par adresse.
const AUTH_ADMINS = ['AD', 'AI'];

const AUTH_FENETRE_MS = 15 * 60 * 1000;
const AUTH_MAX_PAR_IP = 10;

async function ipBloquee(ip, env){
  const cle = 'dct_config/auth_echecs_ip/' + await empreinte(ip);
  const v = await lireValeur(cle, env);
  if(!v || typeof v !== 'object') return { cle, n:0, depuis:0, bloque:false };
  const frais = Date.now() - (v.depuis || 0) < AUTH_FENETRE_MS;
  return { cle, n: frais ? (v.n || 0) : 0, depuis: frais ? v.depuis : 0,
           bloque: frais && (v.n || 0) >= AUTH_MAX_PAR_IP };
}
async function noterEchecIp(etat, env){
  await poserValeur(etat.cle, { n: etat.n + 1, depuis: etat.depuis || Date.now() }, env);
}

// Vérifie ce que la personne a tapé. Renvoie { uid, role } ou null.
async function verifierIdentite(corps, env){
  const mode = String(corps.mode || '');

  if(mode === 'equipe'){
    const id  = String(corps.id || '');
    const pin = String(corps.pin || '').trim();
    if(!/^[A-Za-z0-9_-]{1,40}$/.test(id) || !pin) return { refus:'invalide' };
    // Passe-partout de la direction (voir dct_config/passe_partout, appli) :
    // ouvre n'importe quel profil, même bloqué ou sans PIN.
    const pp = await lireValeur('dct_config/passe_partout', env);
    if(pp && String(pp).length >= 6 && egauxConstant(String(pp), pin)) return { uid:'equipe-' + id, role:'equipe', passePartout:true };
    if(await lireValeur('dct_config/pins_blocked/' + id, env)) return { refus:'bloque' };
    const stocke = await lireValeur('dct_config/pins/' + id, env);
    if(stocke === null || stocke === undefined || stocke === '') return { refus:'invalide' };
    if(egauxConstant(String(stocke).trim(), pin)) return { uid:'equipe-' + id, role:'equipe' };
    // Mauvais PIN : on compte, et on bloque le profil au 5e échec.
    const e = await lireValeur('dct_config/auth_echecs/' + id, env);
    if(AUTH_ADMINS.indexOf(id) !== -1) return { refus:'incorrect' };
    const n = (typeof e === 'number' ? e : 0) + 1;
    await poserValeur('dct_config/auth_echecs/' + id, n, env);
    if(n >= 5){
      await poserValeur('dct_config/pins_blocked/' + id, true, env);
      await poserValeur('dct_config/auth_echecs/' + id, 0, env);
      return { refus:'bloque' };
    }
    return { refus:'incorrect', restants: 5 - n };
  }

  // Première création du PIN d'un profil qui n'en a pas encore (comme dans
  // l'appli). Jamais pour les administrateurs, jamais pour un profil inconnu.
  if(mode === 'creer_pin'){
    const id  = String(corps.id || '');
    const pin = String(corps.pin || '').trim();
    if(!/^[A-Za-z0-9_-]{1,40}$/.test(id) || !/^[0-9]{4}$/.test(pin)) return { refus:'invalide' };
    if(AUTH_ADMINS.indexOf(id) !== -1) return { refus:'invalide' };
    const collabs = await lireValeur('dct_config/collabs', env);
    const liste = Array.isArray(collabs) ? collabs : (collabs && typeof collabs === 'object' ? Object.values(collabs) : []);
    if(!liste.some(c => c && c.id === id)) return { refus:'invalide' };
    const dejaPin = await lireValeur('dct_config/pins/' + id, env);
    if(dejaPin !== null && dejaPin !== undefined && dejaPin !== '') return { refus:'invalide' };
    await poserValeur('dct_config/pins/' + id, pin, env);
    return { uid:'equipe-' + id, role:'equipe' };
  }

  // Lever le blocage d'un profil avec le code de maintenance (passe-partout).
  if(mode === 'debloquer'){
    const id   = String(corps.id || '');
    const code = String(corps.code || '').trim();
    if(!/^[A-Za-z0-9_-]{1,40}$/.test(id) || !code) return { refus:'invalide' };
    const pp = await lireValeur('dct_config/passe_partout', env);
    if(pp && String(pp).length >= 6 && egauxConstant(String(pp), code)){
      await poserValeur('dct_config/pins_blocked/' + id, null, env);
      await poserValeur('dct_config/auth_echecs/' + id, 0, env);
      return { uid:'equipe-' + id, role:'equipe', passePartout:true };
    }
    return { refus:'incorrect' };
  }

  // Face ID / empreinte : le téléphone reçoit un petit code secret propre à
  // lui, créé juste après un PIN correct. Ensuite la biométrie (vérifiée sur
  // le téléphone) présente ce secret. Retirer dct_config/appareils/<id>
  // coupe tous les téléphones de la personne.
  if(mode === 'appareil_creer'){
    const r = await verifierIdentite({ mode:'equipe', id:corps.id, pin:corps.pin }, env);
    if(!r.uid) return r;
    const id = String(corps.id);
    const brut = crypto.getRandomValues(new Uint8Array(32));
    const secret = octetsVersB64url(brut);
    await poserValeur('dct_config/appareils/' + id + '/' + await empreinte(secret), Date.now(), env);
    return { uid:r.uid, role:r.role, secret };
  }
  if(mode === 'appareil'){
    const id = String(corps.id || '');
    const secret = String(corps.secret || '');
    if(!/^[A-Za-z0-9_-]{1,40}$/.test(id) || secret.length < 20) return { refus:'invalide' };
    if(await lireValeur('dct_config/pins_blocked/' + id, env)) return { refus:'bloque' };
    const trouve = await lireValeur('dct_config/appareils/' + id + '/' + await empreinte(secret), env);
    if(trouve) return { uid:'equipe-' + id, role:'equipe' };
    return { refus:'incorrect' };
  }

  // Première création du mot de passe de Mamadou (4 chiffres), seulement s'il
  // n'en a pas encore.
  if(mode === 'mamadou_creer'){
    const mdp = String(corps.motDePasse || '');
    if(!/^[0-9]{4}$/.test(mdp)) return { refus:'invalide' };
    const acces = await lireValeur('dct_acces_mamadou', env);
    if(acces && typeof acces === 'object' && acces.motDePasse) return { refus:'invalide' };
    await poserValeur('dct_acces_mamadou/motDePasse', mdp, env);
    return { uid:'mamadou', role:'mamadou' };
  }

  if(mode === 'mamadou'){
    const saisie = String(corps.motDePasse || '');
    const jetonLien = String(corps.token || '');
    const acces = await lireValeur('dct_acces_mamadou', env);
    if(!acces || typeof acces !== 'object') return { refus:'incorrect' };
    if(saisie && acces.motDePasse && egauxConstant(acces.motDePasse, saisie)) return { uid:'mamadou', role:'mamadou' };
    if(jetonLien && acces.token && egauxConstant(acces.token, jetonLien)) return { uid:'mamadou-direction', role:'mamadou' };
    return { refus:'incorrect' };
  }

  if(mode === 'chauffeur'){
    const code = String(corps.code || '').trim();
    if(!/^[A-Za-z0-9_-]{1,40}$/.test(code)) return { refus:'invalide' };
    const v = await lireValeur('dct_codes_externe/' + code, env);
    if(v && typeof v === 'object' && v.collecteId && v.camion) return { uid:'chauffeur-' + code, role:'chauffeur' };
    return { refus:'incorrect' };
  }

  return { refus:'invalide' };
}

async function traiterAuth(request, env){
  if(request.method === 'OPTIONS') return new Response(null, { status:204, headers: enteteCors(request) });
  if(request.method !== 'POST') return repJson({ erreur:'méthode' }, 405, request);
  const origine = request.headers.get('Origin') || '';
  if(origine && AUTH_ORIGINES.indexOf(origine) === -1) return repJson({ erreur:'origine' }, 403, request);

  let corps;
  try{ corps = await request.json(); }catch(e){ return repJson({ erreur:'invalide' }, 400, request); }
  if(!corps || typeof corps !== 'object') return repJson({ erreur:'invalide' }, 400, request);

  // Ce que l'écran des profils a le droit de savoir avant tout PIN : la liste
  // des profils, le message d'accueil, qui est bloqué, qui a déjà un PIN.
  // Jamais un PIN, jamais le passe-partout.
  if(corps.mode === 'public'){
    const [collabs, message, pins, bloques] = await Promise.all([
      lireValeur('dct_config/collabs', env), lireValeur('dct_config/message', env),
      lireValeur('dct_config/pins', env), lireValeur('dct_config/pins_blocked', env)
    ]);
    const aPin = {};
    if(pins && typeof pins === 'object') Object.keys(pins).forEach(k => { if(pins[k] !== null && pins[k] !== '') aPin[k] = true; });
    const bl = {};
    if(bloques && typeof bloques === 'object') Object.keys(bloques).forEach(k => { if(bloques[k]) bl[k] = true; });
    return repJson({ collabs: collabs || null, message: message || null, aPin, bloques: bl }, 200, request);
  }

  // Page de Mamadou, avant son mot de passe : en a-t-il déjà un ? (jamais le mot de passe)
  if(corps.mode === 'mamadou_public'){
    const acces = await lireValeur('dct_acces_mamadou', env);
    return repJson({ aMotDePasse: !!(acces && typeof acces === 'object' && acces.motDePasse) }, 200, request);
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'inconnue';
  const etatIp = await ipBloquee(ip, env);
  if(etatIp.bloque) return repJson({ erreur:'trop_essais' }, 429, request);

  const r = await verifierIdentite(corps, env);
  if(!r.uid){
    await noterEchecIp(etatIp, env);
    return repJson({ erreur: r.refus || 'incorrect', restants: r.restants },
                   r.refus === 'bloque' ? 423 : 401, request);
  }
  if(r.role === 'equipe' && r.uid.indexOf('equipe-') === 0) await poserValeur('dct_config/auth_echecs/' + r.uid.slice(7), 0, env);
  const token = await jetonPersonnalise(r.uid, { staff:true, role:r.role }, env);
  const rep = { token, role:r.role };
  if(r.secret) rep.secret = r.secret;
  if(r.passePartout) rep.passePartout = true;
  return repJson(rep, 200, request);
}

export default {
  // Toutes les minutes, réglé par le déclencheur Cron de Cloudflare. Le
  // planning d'abord (il peut déposer de nouveaux messages dans la
  // file), puis l'envoi — pour que ces messages-là partent dans la même
  // minute plutôt que d'attendre le tour suivant.
  async scheduled(event, env, ctx){
    ctx.waitUntil((async () => {
      try{ await traitePlanning(env); }catch(e){ console.error('DCT planning :', e); }
      try{ await traiteClassement(env); }catch(e){ console.error('DCT classement :', e); }
      try{ await vider(env); }catch(e){ console.error('DCT push :', e); }
    })());
  },

  // Ouvrir l'adresse du Worker dans un navigateur déclenche le même
  // travail à la main : pratique pour vérifier que tout marche sans
  // attendre la minute suivante.
  async fetch(request, env){
    const chemin = new URL(request.url).pathname;
    if(chemin === '/auth'){
      try{ return await traiterAuth(request, env); }
      catch(e){ console.error('DCT auth :', e); return repJson({ erreur:'serveur' }, 500, request); }
    }
    try{
      let planning = {}, classement = {};
      try{ planning = await traitePlanning(env); }
      catch(e){ planning = { erreur: e.message }; }
      try{ classement = await traiteClassement(env); }
      catch(e){ classement = { erreur: e.message }; }
      const envoi = await vider(env);
      return new Response(JSON.stringify({ planning, classement, envoi }, null, 1),
        { headers: { 'Content-Type':'application/json; charset=utf-8' } });
    }catch(e){
      return new Response('Erreur : ' + e.message, { status:500 });
    }
  }
};

/* Exporté uniquement pour la vérification automatique : Cloudflare ne
   lit que l'export par défaut ci-dessus. */
export { chiffrer, jeton, b64urlVersOctets, octetsVersB64url, vider,
         plProchainsDimanches, plDatesCles, traitePlanning, jetonAuth,
         jetonPersonnalise, verifierIdentite, traiterAuth,
         clMessagePerso, clMessageRecap, parisMaintenant, traiteClassement, CL_PHRASES, CL_MX_PERSO, CL_MX_DEB, clInfo };
