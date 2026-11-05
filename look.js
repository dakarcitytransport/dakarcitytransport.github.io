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

  var LOOK_DEFAUT = 'v2';          // V2 en ligne pour tous depuis le 04/11/2026 ; Eric peut tout remettre en V1 (Réglages > Apparence)
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
    try{ barreRecherche(); }catch(e){}
    try{ majDock(); }catch(e){}
    try{ actionsClients(); }catch(e){}
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


  /* ---------- barre du bas : Accueil · Clients · Suivi · Activité (V2 seulement) ----------
     Cobey : « dans la maquette il y avait des lignes en dessous avec client, accueil ». Visible sur
     les écrans de liste, pas sur les formulaires ni les documents (clavier, impression). */
  var DOCK_ECRANS = { 's-espaces':'accueil', 's-clients':'clients', 's-suivi':'suivi', 's-activite':'activite' };   // écrans principaux seulement
  var DOCK_SVG = {
    accueil:'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    clients:'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    suivi:'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    activite:'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0'
  };
  var DOCK_LIB = { accueil:'Accueil', clients:'Clients', suivi:'Suivi', activite:'Activité' };
  function dockAller(t){
    try{
      if(t === 'accueil'){ goTo('s-espaces'); if(typeof depRenderEspaces === 'function') depRenderEspaces(); }
      else if(t === 'clients'){ if(typeof depOuvrirEspaceClient === 'function') depOuvrirEspaceClient(); else setNav('clients'); }
      else setNav(t);
    }catch(e){ console.error('look : barre du bas', e); }
  }
  function majDock(){
    var h = document.documentElement;
    var actif = document.querySelector('.screen.active');
    var cle = actif ? DOCK_ECRANS[actif.id] : null;
    try{ surveillerActions(); actionsClients(); }catch(e){}
    var dock = document.getElementById('lk-dock');
    var voir = effectif() === 'v2' && !!cle && !!window.currentUser;
    if(!voir){ if(dock) dock.style.display = 'none'; h.classList.remove('lk-dock-on'); return; }
    if(!dock){
      dock = document.createElement('nav');
      dock.id = 'lk-dock'; dock.setAttribute('aria-label', 'Navigation principale');
      dock.innerHTML = ['accueil','clients','suivi','activite'].map(function(t){
        return '<button type="button" data-t="' + t + '"><svg class="lk-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="' + DOCK_SVG[t] + '"/></svg><span>' + DOCK_LIB[t] + '</span></button>';
      }).join('');
      dock.addEventListener('click', function(ev){ var b = ev.target.closest('button[data-t]'); if(b) dockAller(b.getAttribute('data-t')); });
      document.body.appendChild(dock);
    }
    var sans = !!(window.currentUser && typeof _sansActivite === 'function' && _sansActivite(window.currentUser.id));
    dock.style.display = '';
    h.classList.add('lk-dock-on');
    [].forEach.call(dock.querySelectorAll('button'), function(b){
      var t = b.getAttribute('data-t');
      b.classList.toggle('on', t === cle);
      b.style.display = (t === 'activite' && sans) ? 'none' : '';
    });
  }
  if(typeof window.goTo === 'function'){
    var origGoTo = window.goTo;
    window.goTo = function(){ var r = origGoTo.apply(this, arguments); try{ majDock(); }catch(e){} return r; };
  }


  /* ---------- une action principale par client, les autres en petites icônes (V2 seulement) ----------
     Maquette K : « Relancer le paiement » en grand, Facture / Photos / Copier en icônes. On ne touche pas
     au code des boutons (ils gardent leur clic) : on change seulement leur présentation. */
  var RE_PRINCIPAL = /Relancer|Relanc|Pr[ée]venir|Pr[ée]venu|Demander un avis|Avis demand/i;
  var ICONE_DE = { 'Déplacer':'⇄', 'Détacher':'✕' };
  function actionsClients(){
    var v2 = effectif() === 'v2';
    [].forEach.call(document.querySelectorAll('#s-depart-detail .dep-cli-btns'), function(g){
      if(!v2){
        if(g.getAttribute('data-lk')){
          [].forEach.call(g.children, function(b){ if(b.hasAttribute('data-lk-orig')){ b.innerHTML = b.getAttribute('data-lk-orig'); b.removeAttribute('data-lk-orig'); b.removeAttribute('title'); } b.classList.remove('lk-main','lk-ico'); });
          g.removeAttribute('data-lk');
        }
        return;
      }
      if(g.getAttribute('data-lk')) return;
      var btns = [].slice.call(g.children).filter(function(b){ return b.tagName === 'BUTTON'; });
      if(!btns.length) return;
      var princ = null;
      btns.forEach(function(b){ if(!princ && RE_PRINCIPAL.test(b.textContent)) princ = b; });
      if(!princ) btns.forEach(function(b){ if(!princ && /Facture/.test(b.textContent)) princ = b; });
      if(!princ) princ = btns[0];
      g.setAttribute('data-lk', '1');
      btns.forEach(function(b){
        if(b === princ){ b.classList.add('lk-main'); return; }
        var t = b.textContent.trim();
        var m = /^(\S+)\s+(.*)$/.exec(t);
        var ico = m ? m[1] : (ICONE_DE[t] || t.charAt(0));
        var lib = m ? m[2] : t;
        b.setAttribute('data-lk-orig', b.innerHTML);
        b.setAttribute('title', lib); b.setAttribute('aria-label', lib);
        b.innerHTML = '<span aria-hidden="true">' + ico + '</span>';
        b.classList.add('lk-ico');
      });
      g.insertBefore(princ, g.firstChild);
    });
  }
  var obsAction = null;
  function surveillerActions(){
    var zone = document.getElementById('s-depart-detail');
    if(obsAction || !zone || !window.MutationObserver) return;
    var en = false;
    obsAction = new MutationObserver(function(){ if(en) return; en = true; try{ actionsClients(); }catch(e){} en = false; });
    obsAction.observe(zone, { childList:true, subtree:true });
  }

  /* ---------- carrousel des départs, sur l'accueil (V2 seulement) ----------
     Cobey : « on swipe vers la gauche et on voit le conteneur suivant, vers la droite
     celui d'avant ; les clôturés, on ne les prend pas en compte. » Il s'ouvre sur
     le container sur lequel on travaille (en préparation). */
  var idxCarte = null;   // dernier container regardé, gardé quand l'écran se redessine
  function dateCourte(iso){ return iso ? iso.split('-').reverse().slice(0, 2).join('/') : ''; }
  function esc(t){ return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  // Décompte avant le départ (carte « En préparation ») : J-n d'après la date de départ prévue, jour calendaire à Paris.
  // Cobey : « on se base toujours sur la date de départ » ; date passée → rien (il la modifie).
  function decompte(iso){
    try{
      var aujourd = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' });   // AAAA-MM-JJ
      var a = aujourd.split('-'), b = String(iso).slice(0, 10).split('-');
      if(a.length !== 3 || b.length !== 3) return '';
      var n = Math.round((Date.UTC(+b[0], +b[1] - 1, +b[2]) - Date.UTC(+a[0], +a[1] - 1, +a[2])) / 86400000);
      if(isNaN(n) || n < 0) return '';
      return '<span class="lk-j">' + (n === 0 ? 'Départ aujourd’hui' : 'J-' + n) + '</span> ';
    }catch(e){ return ''; }
  }
  // Sous le nom : la date de départ, pour distinguer deux containers de même nom (Cobey, 05/11/2026 :
  // « on ne sait pas de quel conteneur on parle »). En préparation, la date figure déjà en bas de la carte.
  function sousNom(d){
    if(d.statut === 'preparation' || !d.depart) return '';
    var p = String(d.depart).slice(0, 10).split('-');
    if(p.length !== 3) return '';
    return '<div class="lk-dep">départ du ' + p[2] + '/' + p[1] + '</div>';
  }
  // Reste à solder (Cobey, 05/11/2026) : un container ne se clôture que soldé ; la carte explique pourquoi elle reste affichée.
  // Pas sur « En préparation » (personne n'a encore payé). Nombre de clients seulement, jamais de montant.
  function soldeLigne(d){
    if(d.statut === 'preparation' || !d.clients) return '';
    if(d.impayes > 0) return '<div class="lk-solde">' + d.impayes + ' client' + (d.impayes > 1 ? 's' : '') + ' à solder</div>';
    return '<div class="lk-solde ok">Tout est soldé ✓</div>';
  }
  function unDepart(d, i, ouvrable){
    var dest = d.pays === 'ML' ? 'BAMAKO' : 'DAKAR';
    var etat, sous;
    if(d.statut === 'preparation'){ etat = 'En préparation'; sous = d.ouvert ? 'Ouvert à l’inscription' : 'Inscriptions fermées'; }
    else if(d.statut === 'arrive'){ etat = 'Arrivé'; sous = d.pays === 'ML' ? 'à Bamako' : 'à Dakar'; }
    else { etat = 'En route'; sous = d.pays === 'ML' ? 'vers Bamako' : 'vers Dakar'; }
    var pct = d.statut === 'preparation' ? 0 : (d.etapes ? Math.round(100 * d.fait / d.etapes) : 0);
    var droite = d.statut === 'preparation'
      ? (d.depart ? (function(j){ return /aujourd/.test(j) ? j : j + 'Départ prévu <b>' + dateCourte(d.depart) + '</b>'; })(decompte(d.depart)) : '')
      : (d.statut === 'arrive' && d.arriveeReelle ? 'Arrivé le <b>' + d.arriveeReelle + '</b>'
        : (d.arrivee ? 'Arrivée prévue <b>' + dateCourte(d.arrivee) + '</b>' : ''));
    var classe = d.statut === 'preparation' ? 'lk-prep' : (d.statut === 'arrive' ? 'lk-arr' : 'lk-route-st');
    return '<button type="button" class="lk-hero lk-slide ' + classe + (ouvrable ? '' : ' lk-fixe') + '" data-i="' + i + '"' + (ouvrable ? ' onclick="depDetail(\'' + d.id + '\')"' : ' tabindex="-1" aria-disabled="true"') + '>'
      + '<span class="lk-pays">' + (d.pays === 'ML' ? '🇲🇱 MALI' : '🇸🇳 SÉNÉGAL') + '</span>'
      + '<small>' + etat + (d.statut === 'preparation' ? '' : ' · ' + sous) + '</small><h2>' + esc(d.nom) + '</h2>' + sousNom(d)
      + '<div class="lk-route"><span>MITRY</span><div class="lk-rail"><i style="width:' + (pct ? Math.max(8, pct) : 0) + '%"></i></div><span>' + dest + '</span></div>'
      + '<div class="lk-foot"><span><b>' + d.clients + '</b> client' + (d.clients > 1 ? 's' : '') + (d.statut === 'preparation' ? (d.ouvert ? ' · inscriptions ouvertes' : ' · inscriptions fermées') : '') + '</span><span>' + droite + '</span></div>'
      + soldeLigne(d) + '</button>';
  }

  /* ---------- barre de recherche de l'accueil (V2) : ouvre la liste Clients déjà filtrée ---------- */
  function barreRecherche(){
    var contenu = document.querySelector('#s-espaces .content');
    var b = document.getElementById('lk-rech');
    if(effectif() !== 'v2' || !contenu){ if(b) b.remove(); return; }
    if(b) return;
    b = document.createElement('form');
    b.id = 'lk-rech'; b.setAttribute('role', 'search');
    b.innerHTML = '<svg class="lk-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3"/></svg>'
      + '<input type="search" enterkeyhint="search" autocomplete="off" placeholder="Rechercher un client…" aria-label="Rechercher un client">';
    b.addEventListener('submit', function(ev){
      ev.preventDefault();
      var q = b.querySelector('input').value.trim();
      try{
        if(typeof depOuvrirEspaceClient === 'function') depOuvrirEspaceClient(); else goTo('s-clients');
        var ch = document.getElementById('contacts-search');
        if(ch){ ch.value = q; if(typeof renderContacts === 'function') renderContacts(); }
        b.querySelector('input').value = '';
        b.querySelector('input').blur();
      }catch(e){ console.error('look : recherche', e); }
    });
    var avant = document.getElementById('lk-hero') || contenu.querySelector('.dep-cases');
    if(avant) avant.parentNode.insertBefore(b, avant); else contenu.insertBefore(b, contenu.firstChild);
  }

  function carteDepart(){
    var contenu = document.querySelector('#s-espaces .content');
    if(!contenu) return;
    var vieux = document.getElementById('lk-hero');
    var r = null;
    if(effectif() === 'v2' && typeof window.depDepartsCarte === 'function'){ try{ r = window.depDepartsCarte(); }catch(e){} }
    if(!r || !r.liste.length){ if(vieux) vieux.remove(); return; }
    if(idxCarte === null || idxCarte >= r.liste.length) idxCarte = r.courant;
    var h = '<div id="lk-hero" class="lk-car" role="region" aria-label="Départs en cours">'
      + '<div class="lk-track">' + r.liste.map(function(d, i){ return unDepart(d, i, r.ouvrable !== false); }).join('') + '</div>'
      + (r.liste.length > 1 ? '<div class="lk-dots" aria-hidden="true">' + r.liste.map(function(_, i){ return '<i data-d="' + i + '"></i>'; }).join('') + '</div>' : '')
      + '</div>';
    if(vieux) vieux.outerHTML = h;
    else {
      var grille = contenu.querySelector('.dep-cases');
      if(grille) grille.insertAdjacentHTML('beforebegin', h); else contenu.insertAdjacentHTML('beforeend', h);
    }
    var piste = document.querySelector('#lk-hero .lk-track');
    if(!piste) return;
    var enPlace = false;   // vrai une fois la carte positionnée : avant, on ne retient aucun défilement
    function pas(){ return piste.firstElementChild ? piste.firstElementChild.offsetWidth + 12 : 1; }
    function majPoints(){
      document.querySelectorAll('#lk-hero .lk-dots i').forEach(function(p, k){ p.classList.toggle('on', k === idxCarte); });
    }
    function positionner(){
      if(!piste.offsetWidth) return false;                       // écran pas encore affiché
      var cible = piste.children[idxCarte];
      if(cible) piste.scrollLeft = Math.max(0, cible.getBoundingClientRect().left - piste.getBoundingClientRect().left - 16 + piste.scrollLeft);
      enPlace = true; majPoints();
      return true;
    }
    majPoints();
    if(!positionner()) window.requestAnimationFrame(function(){ if(!positionner()) setTimeout(positionner, 120); });
    piste.addEventListener('scroll', function(){
      if(!enPlace) return;
      window.requestAnimationFrame(function(){
        idxCarte = Math.max(0, Math.min(r.liste.length - 1, Math.round(piste.scrollLeft / pas())));
        majPoints();
      });
    }, { passive: true });
  }
  if(typeof window.depRenderEspaces === 'function'){
    var origEsp = window.depRenderEspaces;
    window.depRenderEspaces = function(){ var r = origEsp.apply(this, arguments); try{ boutonTheme(); carteDepart(); barreRecherche(); }catch(e){} return r; };
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
