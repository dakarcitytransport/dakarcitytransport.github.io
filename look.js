/* ═══════════════════════════════════════════════════════════
   DCT — LE LOOK : V1 (apparence actuelle) et V2 (nouveau look)
   look.js v0.1.0 · 04/11/2026

   Cobey, 04/11/2026 : « on va appeler le look actuel V1 et le look prochain
   V2, comme ça, au cas où si un jour je voudrais rechanger, on aura des
   versions » ; « je veux pas que chacun choisisse. Je veux que moi, je puisse,
   si je veux, décider de revenir à l'ancienne » ; « quand on va faire le
   changement, elle sera mise à jour pour tout le monde. »

   COMMENT ÇA MARCHE
   - Le look de TOUTE l'équipe est dans Firebase : dct_config/look = 'v1' | 'v2'.
     Une seule personne le change : Eric (Réglages > Apparence).
   - V2 est une COUCHE posée par-dessus V1 : la classe « look-v2 » sur <html>
     active look-v2.css. Sans elle, l'application est exactement la V1.
     Revenir en arrière = retirer la classe, rien d'autre.
   - LOOK_DEFAUT dit quel look voit l'équipe tant que Firebase n'a rien dit.
     Il reste 'v1' pendant tout le chantier ; le jour de la mise en ligne, on
     le passe à 'v2' (une ligne) : tout le monde bascule, et le bouton d'Eric
     permet de revenir à V1 quand il veut.
   - Essai personnel (téléphone d'Eric uniquement, dct_look_test dans ce
     téléphone) : permet de voir V2 avant tout le monde.
   - Clair / sombre / automatique : un choix PERSONNEL, gardé dans le téléphone
     (dct_look_mode), qui ne vaut que dans V2.
   ═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var LOOK_DEFAUT = 'v1';          // ← 'v2' le jour de la mise en ligne pour tous
  var K_TEST = 'dct_look_test', K_CACHE = 'dct_look_cache', K_MODE = 'dct_look_mode';

  function lire(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function ecrire(k, v){ try{ if(v === null || v === undefined) localStorage.removeItem(k); else localStorage.setItem(k, v); }catch(e){} }
  function valide(v){ return v === 'v1' || v === 'v2'; }

  var equipe = valide(lire(K_CACHE)) ? lire(K_CACHE) : LOOK_DEFAUT;   // ce que voit l'équipe
  function effectif(){ var t = lire(K_TEST); return valide(t) ? t : equipe; }
  function mode(){ var m = lire(K_MODE); return (m === 'light' || m === 'dark') ? m : 'auto'; }
  function sombreMaintenant(){
    var m = mode();
    if(m === 'dark') return true;
    if(m === 'light') return false;
    return !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  }

  var SVG = {
    sun:'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
    moon:'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z',
    auto:'M2 4h20v13H2zM8 21h8M12 17v4',
    next:'M9 18l6-6-6-6'
  };
  function ic(n){ return '<svg class="lk-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="' + SVG[n] + '"/></svg>'; }

  /* ---------- appliquer ---------- */
  function appliquer(){
    var h = document.documentElement;
    var v2 = effectif() === 'v2';
    h.classList.toggle('look-v2', v2);
    h.setAttribute('data-mode', mode());
    try{ var tc = document.querySelector('meta[name="theme-color"]'); if(tc) tc.setAttribute('content', v2 && sombreMaintenant() ? '#080D0B' : '#F3F7F4'); }catch(e){}
    boutonTheme();
    carteDepart();
  }
  window.lookEffectif = effectif;
  window.lookAppliquer = appliquer;

  /* ---------- lecture dans Firebase (une fois connecté) ---------- */
  var ecoute = false;
  function ecouter(){
    if(ecoute || !window.db || !window.firebaseReady) return;
    ecoute = true;
    try{
      db.ref('dct_config/look').on('value', function(snap){
        var v = snap.val();
        equipe = valide(v) ? v : LOOK_DEFAUT;
        ecrire(K_CACHE, equipe);
        appliquer();
        var sec = document.getElementById('admin-section-apparence');
        if(sec && sec.style.display !== 'none') window.lookRenderApparence();
      }, function(e){ console.error('look : lecture', e); });
    }catch(e){ console.error('look', e); }
  }
  if(typeof window._demarrerEcoutesApresPin === 'function'){
    var origApresPin = window._demarrerEcoutesApresPin;
    window._demarrerEcoutesApresPin = function(){ var r = origApresPin.apply(this, arguments); ecouter(); return r; };
  }

  /* ---------- bouton soleil / lune sur l'accueil (V2 seulement) ---------- */
  function boutonTheme(){
    var groupe = document.querySelector('#s-espaces .header > div:last-child');
    if(!groupe) return;
    var b = document.getElementById('lk-theme-btn');
    if(effectif() !== 'v2'){ if(b) b.remove(); return; }
    if(!b){
      b = document.createElement('button');
      b.id = 'lk-theme-btn'; b.type = 'button';
      b.setAttribute('aria-label', 'Apparence : clair, sombre ou automatique');
      b.addEventListener('click', ouvrirFeuille);
      groupe.insertBefore(b, groupe.firstChild);
    }
    b.innerHTML = ic(sombreMaintenant() ? 'moon' : 'sun');
  }
  if(window.matchMedia){ try{ matchMedia('(prefers-color-scheme: dark)').addEventListener('change', boutonTheme); }catch(e){} }

  /* ---------- carte « Prochain départ » de l'accueil (V2 seulement) ---------- */
  function carteDepart(){
    var contenu = document.querySelector('#s-espaces .content');
    if(!contenu) return;
    var vieille = document.getElementById('lk-hero');
    if(effectif() !== 'v2' || typeof window.depProchainDepart !== 'function'){ if(vieille) vieille.remove(); return; }
    var d = null;
    try{ d = window.depProchainDepart(); }catch(e){}
    if(!d){ if(vieille) vieille.remove(); return; }
    var pct = d.etapes ? Math.round(100 * d.fait / d.etapes) : 0;
    var arr = d.arrivee ? d.arrivee.split('-').reverse().slice(0, 2).join('/') : '';
    var dest = d.pays === 'ML' ? 'BAMAKO' : 'DAKAR';
    var h = '<button type="button" class="lk-hero" id="lk-hero" onclick="depDetail(\'' + d.id + '\')">'
      + '<small>Prochain départ</small><h2>' + String(d.nom).replace(/</g, '&lt;') + '</h2>'
      + '<div class="lk-route"><span>MITRY</span><div class="lk-rail"><i style="width:' + Math.max(8, pct) + '%"></i></div><span>' + dest + '</span></div>'
      + '<div class="lk-foot"><span><b>' + d.clients + '</b> client' + (d.clients > 1 ? 's' : '') + '</span>' + (arr ? '<span>Arrivée prévue <b>' + arr + '</b></span>' : '') + '</div></button>';
    if(vieille) vieille.outerHTML = h;
    else {
      var grille = contenu.querySelector('.dep-cases');
      if(grille) grille.insertAdjacentHTML('beforebegin', h); else contenu.insertAdjacentHTML('beforeend', h);
    }
  }
  if(typeof window.depRenderEspaces === 'function'){
    var origEsp = window.depRenderEspaces;
    window.depRenderEspaces = function(){ var r = origEsp.apply(this, arguments); try{ boutonTheme(); carteDepart(); }catch(e){} return r; };
  }

  /* ---------- feuille « Apparence » (clair / sombre / automatique) ---------- */
  var voile = null;
  function construireFeuille(){
    if(voile) return;
    voile = document.createElement('div');
    voile.id = 'lk-voile'; voile.hidden = true;
    voile.innerHTML = '<div class="lk-feuille" role="dialog" aria-modal="true" aria-labelledby="lk-ft">'
      + '<div class="lk-grab"></div><h2 id="lk-ft">Apparence</h2>'
      + '<p class="lk-aide">Chacun choisit pour son téléphone. Ce choix est gardé sur cet appareil.</p>'
      + '<div id="lk-choix" role="radiogroup" aria-label="Apparence"></div>'
      + '<button type="button" class="lk-fermer" id="lk-fermer">Fermer</button></div>';
    document.body.appendChild(voile);
    voile.addEventListener('click', function(e){
      if(e.target === voile) fermerFeuille();
      var o = e.target.closest && e.target.closest('[data-lkmode]');
      if(o){ var m = o.getAttribute('data-lkmode'); ecrire(K_MODE, m === 'auto' ? null : m); appliquer(); dessinerChoix(); }
    });
    document.getElementById('lk-fermer').addEventListener('click', fermerFeuille);
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && voile && !voile.hidden) fermerFeuille(); });
  }
  function dessinerChoix(){
    var m = mode();
    var L = [['auto', 'Automatique', 'Suit le réglage du téléphone', 'auto'], ['light', 'Clair', 'Fond lumineux, verre dépoli', 'sun'], ['dark', 'Sombre', 'Repose les yeux le soir', 'moon']];
    document.getElementById('lk-choix').innerHTML = L.map(function(c){
      return '<button type="button" class="lk-opt" role="radio" data-lkmode="' + c[0] + '" aria-checked="' + (m === c[0]) + '"><span class="lk-bub">' + ic(c[3]) + '</span><span><b>' + c[1] + '</b><span>' + c[2] + '</span></span><span class="lk-dot"></span></button>';
    }).join('');
  }
  function ouvrirFeuille(){ construireFeuille(); dessinerChoix(); voile.hidden = false; var f = voile.querySelector('[aria-checked="true"]'); if(f) f.focus(); }
  function fermerFeuille(){ if(voile) voile.hidden = true; var b = document.getElementById('lk-theme-btn'); if(b) b.focus(); }

  /* ---------- Réglages > Apparence (Eric seulement) ---------- */
  var choixEquipe = null;   // choix en cours, avant « Appliquer »
  window.lookRenderApparence = function(){
    var sec = document.getElementById('admin-section-apparence');
    if(!sec) return;
    var u = window.currentUser || {};
    if(u.id !== 'AD'){ sec.innerHTML = '<p class="lk-aide">Réservé à Eric.</p>'; return; }
    if(choixEquipe === null) choixEquipe = equipe;
    var test = lire(K_TEST); if(!valide(test)) test = '';
    var opt = function(nom, v, titre, sous, coche){
      return '<button type="button" class="lk-opt" role="radio" data-lk' + nom + '="' + v + '" aria-checked="' + coche + '"><span><b>' + titre + '</b><span>' + sous + '</span></span><span class="lk-dot"></span></button>';
    };
    var diff = choixEquipe !== equipe;
    sec.innerHTML = '<div class="lk-reg">'
      + '<h3>Apparence de l’application</h3>'
      + '<p class="lk-aide">Aujourd’hui, toute l’équipe voit : <b>' + (equipe === 'v2' ? 'V2 (nouveau look)' : 'V1 (apparence actuelle)') + '</b>.</p>'
      + '<div role="radiogroup" aria-label="Look de l’équipe">'
      + opt('equipe', 'v1', 'V1 · apparence actuelle', 'L’application telle qu’elle est aujourd’hui', choixEquipe === 'v1')
      + opt('equipe', 'v2', 'V2 · nouveau look', 'Verre dépoli, mode clair ou sombre au choix de chacun', choixEquipe === 'v2')
      + '</div>'
      + '<button type="button" class="lk-appliquer" id="lk-appliquer"' + (diff ? '' : ' disabled') + '>Appliquer à toute l’équipe</button>'
      + '<p class="lk-aide" id="lk-retour"></p>'
      + '<h3 style="margin-top:22px">Sur ce téléphone seulement</h3>'
      + '<p class="lk-aide">Pour essayer avant l’équipe. Ne change rien pour les autres.</p>'
      + '<div role="radiogroup" aria-label="Essai sur ce téléphone">'
      + opt('test', '', 'Comme l’équipe', 'Suit le réglage ci-dessus', test === '')
      + opt('test', 'v2', 'Essayer V2', 'Voir le nouveau look ici, pas chez les autres', test === 'v2')
      + opt('test', 'v1', 'Forcer V1', 'Voir l’apparence actuelle ici', test === 'v1')
      + '</div></div>';
    sec.onclick = function(e){
      var a = e.target.closest && e.target.closest('[data-lkequipe]');
      if(a){ choixEquipe = a.getAttribute('data-lkequipe'); return window.lookRenderApparence(); }
      var t = e.target.closest && e.target.closest('[data-lktest]');
      if(t){ ecrire(K_TEST, t.getAttribute('data-lktest') || null); appliquer(); return window.lookRenderApparence(); }
      if(e.target.id === 'lk-appliquer' && choixEquipe !== equipe){
        var r = document.getElementById('lk-retour');
        try{
          db.ref('dct_config/look').set(choixEquipe).then(function(){
            if(r) r.textContent = 'C’est fait : toute l’équipe passe en ' + (choixEquipe === 'v2' ? 'V2' : 'V1') + ' à sa prochaine ouverture.';
            try{ if(typeof addActivity === 'function') addActivity('🎨', u.bg || '#eee', '<strong>' + (u.name || 'Eric') + '</strong> a mis toute l’équipe en <strong>' + (choixEquipe === 'v2' ? 'V2 (nouveau look)' : 'V1 (apparence actuelle)') + '</strong>', "À l'instant"); }catch(x){}
          }).catch(function(){ if(r) r.textContent = 'Échec : vérifiez la connexion et réessayez.'; });
        }catch(x){ if(r) r.textContent = 'Échec : connexion à la base indisponible.'; }
      }
    };
  };

  /* ---------- départ ---------- */
  appliquer();
  if(window.firebaseReady) ecouter();
  document.addEventListener('DOMContentLoaded', appliquer);
})();
