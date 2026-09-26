/* ═══════════════════════════════════════════════════════════
   DCT — L'ENVOYEUR DE NOTIFICATIONS
   v1.1.0 · 26/09/2026

   Ce fichier ne fait PAS partie du site. Il se colle chez Cloudflare, et
   il y tourne tout seul, une fois par minute. C'est lui qui envoie
   réellement les notifications sur les téléphones.

   Ce qu'il fait, à chaque réveil :
     1. il gère le planning du dimanche (voir plus bas) ;
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

// Les trois échéances d'un dimanche donné, à partir de minuit UTC ce
// jour-là — exactement le calcul que fait _depPlEcheance côté
// application pour le couperet, complété ici des deux rappels
// antérieurs.
function plDatesCles(iso){
  const dimanche = new Date(iso + 'T00:00:00Z');
  const j = 86400000, h = 3600000;
  return {
    lundi9h    : new Date(dimanche.getTime() - 6 * j + 9  * h),
    mercredi20h: new Date(dimanche.getTime() - 4 * j + 20 * h),
    jeudi18h   : new Date(dimanche.getTime() - 3 * j + 18 * h),
    jeudi22h   : new Date(dimanche.getTime() - 3 * j + 22 * h)
  };
}

function plCleUnique(){
  return 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function plRelancer(iso, libelle, ids, env){
  if(!ids.length) return;
  await ecrire('dct_file_push/' + plCleUnique(), {
    titre  : 'Dakar City Transport',
    corps  : 'Êtes-vous disponible dimanche ' + libelle + ' ? Merci de répondre dans '
           + 'Planning avant jeudi 22h — passé ce délai, vous serez noté absent.',
    sujet  : 'planning-' + iso,
    url    : './dct-app.html?ouvrir=planning',
    cibles : ids,
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
        if(m.length){ await plRelancer(dim.iso, dim.libelle, m, env); bilan.rappels++; }
        await ecrire('dct_planning_etat/' + dim.iso, { [cle]: true }, env);
      }
    }

    if(maintenant >= dates.jeudi22h.getTime() && !etat.clos){
      // Absent d'office pour qui n'a rien mis — Cobey : « il ne pourra
      // plus répondre et sera considéré comme absent ».
      for(const id of muets()){
        const fiche = { dispo:false, mot:'', nom:(participants[id] || {}).nom || '',
                         le: maintenant, auto:true };
        await ecrire('dct_planning/' + dim.iso + '/' + id, fiche, env);
        jour[id] = fiche;
      }
      // Le statut final, à tout le monde — pour que même ceux qui
      // avaient répondu à temps aient la confirmation, pas seulement les
      // absents d'office.
      for(const id of ids){
        const r = jour[id] || { dispo:false };
        await ecrire('dct_file_push/' + plCleUnique(), {
          titre  : 'Dakar City Transport',
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
      await ecrire('dct_planning_etat/' + dim.iso, { clos: true }, env);
      bilan.clotures++;
    }
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
  // Toutes les minutes, réglé par le déclencheur Cron de Cloudflare. Le
  // planning d'abord (il peut déposer de nouveaux messages dans la
  // file), puis l'envoi — pour que ces messages-là partent dans la même
  // minute plutôt que d'attendre le tour suivant.
  async scheduled(event, env, ctx){
    ctx.waitUntil((async () => {
      try{ await traitePlanning(env); }catch(e){ console.error('DCT planning :', e); }
      try{ await vider(env); }catch(e){ console.error('DCT push :', e); }
    })());
  },

  // Ouvrir l'adresse du Worker dans un navigateur déclenche le même
  // travail à la main : pratique pour vérifier que tout marche sans
  // attendre la minute suivante.
  async fetch(request, env){
    try{
      let planning = {};
      try{ planning = await traitePlanning(env); }
      catch(e){ planning = { erreur: e.message }; }
      const envoi = await vider(env);
      return new Response(JSON.stringify({ planning, envoi }, null, 1),
        { headers: { 'Content-Type':'application/json; charset=utf-8' } });
    }catch(e){
      return new Response('Erreur : ' + e.message, { status:500 });
    }
  }
};

/* Exporté uniquement pour la vérification automatique : Cloudflare ne
   lit que l'export par défaut ci-dessus. */
export { chiffrer, jeton, b64urlVersOctets, octetsVersB64url, vider,
         plProchainsDimanches, plDatesCles, traitePlanning };
