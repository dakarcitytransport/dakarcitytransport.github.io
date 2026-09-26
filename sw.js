/* ═══════════════════════════════════════════════════════════
   DCT — Service worker, uniquement pour les notifications
   v1.1.0 · 26/09/2026

   Cobey, le 26/09/2026 : « c'est possible d'avoir des notifications push
   de l'appli ? ». Oui, mais il faut ce fichier : un téléphone ne peut
   recevoir une notification que si un service worker est là pour
   l'attraper, y compris quand l'application est fermée.

   ── CE FICHIER NE MET RIEN EN CACHE, ET C'EST VOULU ──

   Un service worker sait aussi servir les fichiers depuis une copie
   locale. C'est tentant, et c'est le piège classique : l'équipe se
   retrouverait bloquée sur une vieille version de l'application, sans
   comprendre pourquoi les corrections n'arrivent pas. On pousse plusieurs
   fois par jour ici — hors de question.

   Il n'y a donc volontairement AUCUN écouteur « fetch ». Sans lui, le
   navigateur va chercher les fichiers comme avant, et rien ne change au
   fonctionnement de l'application. Ce fichier ne sert qu'à trois choses :
   afficher la notification, ouvrir l'application quand on la touche, et
   se remplacer proprement quand une nouvelle version arrive.
   ═══════════════════════════════════════════════════════════ */

// Ne pas attendre que tous les onglets soient fermés pour prendre la
// main : une correction de ce fichier doit s'appliquer tout de suite.
self.addEventListener('install', function(e){ self.skipWaiting(); });

self.addEventListener('activate', function(e){
  e.waitUntil(self.clients.claim());
});

/* La notification arrive. Le contenu est envoyé par Cloudflare, en JSON.
   On se méfie quand même du format : si le message est illisible, on
   affiche quelque chose plutôt que rien — une notification vide serait
   plus déroutante qu'un libellé générique. */
self.addEventListener('push', function(e){
  var d = {};
  try{ d = e.data ? e.data.json() : {}; }
  catch(err){
    try{ d = { corps: e.data.text() }; }catch(err2){ d = {}; }
  }

  var titre = d.titre || 'Dakar City Transport';
  var options = {
    body: d.corps || '',
    icon: './icone-192.png',
    badge: './icone-192.png',
    lang: 'fr',
    // Deux notifications du même sujet se remplacent au lieu de
    // s'empiler : dix rappels « un colis attend » seraient du bruit.
    tag: d.sujet || 'dct',
    renotify: true,
    data: { url: d.url || './dct-app.html' }
  };
  e.waitUntil(self.registration.showNotification(titre, options));
});

/* On touche la notification : on revient sur l'application si elle est
   déjà ouverte quelque part, sinon on l'ouvre. Rouvrir un deuxième
   onglet alors qu'un premier existe ferait perdre à l'utilisateur ce
   qu'il était en train de saisir.

   v2.5.3 : la notification porte parfois une destination précise (par
   exemple « amène-moi sur Planning », pour la relance des
   disponibilités — Cobey, le 26/09/2026 : « ça ouvre l'application, mais
   pas directement sur Planning »). Une adresse neuve suffit à y
   atterrir directement ; un onglet qu'on ramène au premier plan, lui, ne
   change pas de page tout seul — on le prévient donc par message, que
   dct-app.html écoute pour naviguer à sa place. */
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var cible = (e.notification.data && e.notification.data.url) || './dct-app.html';
  var m = /[?&]ouvrir=([^&]+)/.exec(cible);
  var destination = m ? decodeURIComponent(m[1]) : '';
  e.waitUntil(
    self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(function(liste){
      for(var i = 0; i < liste.length; i++){
        if(liste[i].url.indexOf('dct-app') >= 0 && 'focus' in liste[i]){
          if(destination) liste[i].postMessage({ dct:'ouvrir', cible: destination });
          return liste[i].focus();
        }
      }
      if(self.clients.openWindow) return self.clients.openWindow(cible);
    })
  );
});

/* Le navigateur peut renouveler l'abonnement de lui-même (changement de
   clé, expiration). Sans ce relais, le téléphone cesserait de recevoir
   les notifications en silence. On prévient l'application, qui
   réenregistrera le nouvel abonnement dans Firebase à sa prochaine
   ouverture. */
self.addEventListener('pushsubscriptionchange', function(e){
  e.waitUntil(
    self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(function(liste){
      liste.forEach(function(c){ c.postMessage({ dct:'abonnement-a-refaire' }); });
    })
  );
});
