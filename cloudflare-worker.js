/* ═══════════════════════════════════════════════════════════
   DCT — L'ENVOYEUR DE NOTIFICATIONS
   v1.0.0 · 26/09/2026

   Ce fichier ne fait PAS partie du site. Il se colle chez Cloudflare, et
   il y tourne tout seul, une fois par minute. C'est lui qui envoie
   réellement les notifications sur les téléphones.

   Ce qu'il fait, à chaque réveil :
     1. il lit la file d'attente dans Firebase (dct_file_push) ;
     2. pour chaque message pas encore envoyé, il retrouve les téléphones
        des personnes visées (dct_push) ;
     3. il chiffre le message pour chaque téléphone et l'envoie ;
     4. il marque le message comme envoyé, et oublie les téléphones qui
        n'existent plus.

   Pourquoi tout le chiffrement est écrit à la main ici : une notification
   web est chiffrée de bout en bout, et les bibliothèques qui font ça
   demandent un outil de compilation. Or ce fichier doit pouvoir se coller
   tel quel dans la fenêtre de Cloudflare, sans rien installer. Il ne
   dépend donc de rien.

   ── CE QU'IL FAUT RÉGLER CHEZ CLOUDFLARE ──
   Trois variables, dans Settings → Variables and Secrets :
     VAPID_PUBLIC   la clé publique (la même que dans departs.js)
     VAPID_PRIVATE  la clé privée — À GARDER SECRÈTE, type « Secret »
     CONTACT        une adresse mail, exigée par les services d'envoi
   Et une quatrième, seulement si la base Firebase est protégée :
     FIREBASE_SECRET
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

/* ─── Firebase, par son interface web ─── */

function url(chemin, env){
  const a = env.FIREBASE_SECRET ? ('?auth=' + encodeURIComponent(env.FIREBASE_SECRET)) : '';
  return BASE + '/' + chemin + '.json' + a;
}

async function lire(chemin, env){
  const r = await fetch(url(chemin, env));
  if(!r.ok) throw new Error('lecture ' + chemin + ' : ' + r.status);
  return (await r.json()) || {};
}

async function ecrire(chemin, valeur, env){
  await fetch(url(chemin, env), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(valeur)
  });
}

async function effacer(chemin, env){
  await fetch(url(chemin, env), { method: 'DELETE' });
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
          titre: m.titre || 'Dakar City Transport',
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

export default {
  // Toutes les minutes, réglé par le déclencheur Cron de Cloudflare.
  async scheduled(event, env, ctx){
    ctx.waitUntil(vider(env).catch(e => console.error('DCT push :', e)));
  },

  // Ouvrir l'adresse du Worker dans un navigateur déclenche le même
  // travail à la main : pratique pour vérifier que tout marche sans
  // attendre la minute suivante.
  async fetch(request, env){
    try{
      const j = await vider(env);
      return new Response(JSON.stringify(j, null, 1),
        { headers: { 'Content-Type':'application/json; charset=utf-8' } });
    }catch(e){
      return new Response('Erreur : ' + e.message, { status:500 });
    }
  }
};

/* Exporté uniquement pour la vérification automatique : Cloudflare ne
   lit que l'export par défaut ci-dessus. */
export { chiffrer, jeton, b64urlVersOctets, octetsVersB64url, vider };
