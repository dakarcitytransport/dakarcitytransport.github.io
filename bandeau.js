/* ═══════════════════════════════════════════════════════════
   DCT — Bandeau animé de l'accueil · bandeau.js · 05/11/2026
   Cobey : « un bandeau animé où je pourrais afficher des messages à tout le monde » ; « fais-moi une case spéciale
   dans les réglages pour que je puisse bien mettre les informations » ; le message de l'écran de connexion est retiré.
   - Messages dans Firebase : dct_bandeau/<id> = { titre, detail, type: info|attention|urgent, fin: 'AAAA-MM-JJ' | '', ts, par }
   - Affichage : sous « Bonjour … » à l'accueil, pour toute l'équipe. Un message = fixe ; plusieurs = ils alternent toutes les 5 s.
   - Pas de croix : un message ne disparaît que quand Eric le supprime ou que sa date de fin est passée.
   - Écriture : réglage « BANDEAU » (Réglages), réservé à Eric (profil AD).
   ═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var COULEURS = {
    info:      { lib: 'Info',      icone: '📢', a: '#7C5CFF', b: '#5236D6' },
    attention: { lib: 'Attention', icone: '⚠️', a: '#E0488A', b: '#A82A63' },
    urgent:    { lib: 'Urgent',    icone: '🚨', a: '#D32F2F', b: '#8E1A1A' }
  };
  var DUREE = 5000;
  var messages = {};                      // id -> message
  var cache = 'dct_bandeau_cache', ferme = 'dct_bandeau_ferme';
  try{ messages = JSON.parse(localStorage.getItem(cache) || '{}') || {}; }catch(e){ messages = {}; }
  function esc(t){ return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function aujourdhui(){ try{ return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' }); }catch(e){ return new Date().toISOString().slice(0, 10); } }
  function fermes(){ try{ return JSON.parse(localStorage.getItem(ferme) || '{}') || {}; }catch(e){ return {}; } }

  (function(){
    var st = document.createElement('style');
    st.textContent = ''
      + '#bd-accueil{position:relative;height:54px;margin:0 0 14px;border-radius:20px;color:#fff;overflow:hidden;display:flex;align-items:center;box-shadow:0 8px 22px rgba(60,30,120,.28);transition:background .5s;}'
      + '#bd-accueil::after{content:"";position:absolute;top:0;bottom:0;width:70px;left:-90px;background:linear-gradient(100deg,transparent,rgba(255,255,255,.35),transparent);animation:bd-lueur 5s ease-in-out infinite;pointer-events:none;}'
      + '@keyframes bd-lueur{0%{left:-90px}45%,100%{left:110%}}'
      + '#bd-accueil .bd-ic{flex:none;width:36px;height:36px;margin-left:9px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:18px;animation:bd-puls 1.9s ease-in-out infinite;}'
      + '@keyframes bd-puls{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,255,255,.55)}50%{transform:scale(1.08);box-shadow:0 0 0 8px rgba(255,255,255,0)}}'
      + '#bd-accueil .bd-liste{position:relative;flex:1;height:100%;margin:0 14px 0 8px;min-width:0;}'
      + '#bd-accueil .bd-m{position:absolute;left:0;right:0;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;opacity:0;transform:translateY(16px);transition:opacity .45s,transform .45s;pointer-events:none;min-width:0;}'
      + '#bd-accueil .bd-m.on{opacity:1;transform:none;}#bd-accueil .bd-m.out{opacity:0;transform:translateY(-16px);}'
      + '#bd-accueil .bd-m .bd-l{display:block;white-space:nowrap;overflow:hidden;line-height:1.25;}'
      + '#bd-accueil .bd-m .bd-l i{display:inline-block;font-style:normal;will-change:transform;white-space:nowrap;}'
      + '#bd-accueil .bd-m .bd-t1{font-size:14px;font-weight:700;}#bd-accueil .bd-m .bd-t2{font-size:12.5px;opacity:.92;}'
      + '#bd-accueil .bd-barre{position:absolute;left:0;bottom:0;height:3px;background:rgba(255,255,255,.75);}'
      + '#bd-accueil .bd-barre.go{animation:bd-prog var(--bd-d,5s) linear forwards;}@keyframes bd-prog{from{width:0}to{width:100%}}'
      + '@media (prefers-reduced-motion:reduce){#bd-accueil::after,#bd-accueil .bd-ic,#bd-accueil .bd-barre.go{animation:none}#bd-accueil .bd-m{transition:none}}'
      // réglage
      + '.bd-reg h3{font-size:17px;font-weight:800;margin:0 0 4px}.bd-reg .bd-aide{font-size:13px;color:var(--text3,#666);margin:0 0 14px;line-height:1.45}'
      + '.bd-msg{display:flex;align-items:center;gap:12px;padding:12px;border-radius:18px;background:rgba(127,127,127,.1);margin-bottom:8px}'
      + '.bd-pastille{flex:none;width:12px;height:12px;border-radius:50%}.bd-msg .bd-t{flex:1;min-width:0}.bd-msg b{display:block;font-size:14.5px}.bd-msg small{display:block;font-size:12px;color:var(--text3,#666)}'
      + '.bd-btn{border:0;border-radius:12px;padding:8px 12px;font:700 13px var(--font,inherit);cursor:pointer;background:rgba(127,127,127,.18);color:inherit}.bd-btn.rouge{color:#C0392B}'
      + '.bd-form{margin-top:16px;padding:14px;border-radius:20px;background:rgba(127,127,127,.08)}.bd-form label{display:block;font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--text3,#666);margin:10px 0 5px}'
      + '.bd-form input[type=text],.bd-form input[type=date]{width:100%;box-sizing:border-box;padding:12px;border-radius:14px;border:1.5px solid var(--border,#ddd);background:var(--white,#fff);color:inherit;font:600 15px var(--font,inherit)}'
      + '.bd-types{display:flex;gap:8px}.bd-type{flex:1;border:2px solid transparent;border-radius:14px;padding:11px 4px;color:#fff;font:800 13px var(--font,inherit);cursor:pointer;opacity:.55}.bd-type.sel{opacity:1;border-color:var(--text,#111)}'
      + '.bd-pub{width:100%;margin-top:16px;height:50px;border:0;border-radius:16px;background:#0E9F5B;color:#fff;font:800 16px var(--font,inherit);cursor:pointer}'
      + '.bd-apercu{margin:10px 0 0;position:relative;height:54px;border-radius:20px;color:#fff;display:flex;align-items:center;overflow:hidden}.bd-apercu .bd-ic{width:36px;height:36px;margin-left:9px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:18px}.bd-apercu .bd-tx{margin:0 12px;min-width:0}.bd-apercu b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bd-apercu span{display:block;font-size:12.5px;opacity:.92;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}';
    document.head.appendChild(st);
  })();

  /* ---------- affichage à l'accueil ---------- */
  var visibles = [], idx = 0, minuteur = null, anims = [];
  var VITESSE = 55, PAUSE_DEBUT = 1600, PAUSE_FIN = 1400;   // px par seconde ; pauses en ms
  function actifs(){
    var auj = aujourdhui();
    return Object.keys(messages).map(function(id){ var m = messages[id]; if(m && typeof m === 'object'){ m = Object.assign({}, m); m._id = id; return m; } return null; })
      .filter(function(m){ return m && m.titre && (!m.fin || m.fin >= auj); })
      .sort(function(a, b){ return (a.ts || 0) - (b.ts || 0); });
  }
  function fond(m){ var c = COULEURS[m.type] || COULEURS.info; return 'linear-gradient(120deg,' + c.a + ',' + c.b + ')'; }
  function arreter(){ if(minuteur){ clearTimeout(minuteur); minuteur = null; } anims.forEach(function(a){ try{ a.cancel(); }catch(e){} }); anims = []; }
  // Défilement à la main (requestAnimationFrame) : marche sur tous les téléphones, contrairement à Element.animate().
  // Il n'est PAS coupé par « Réduire les animations » de l'iPhone : c'est une information à lire, pas une décoration.
  function glisser(i, trop, T){
    var debut = null, stop = false, raf = null;
    function pas(t){
      if(stop) return;
      if(debut === null) debut = t;
      var e = t - debut, x;
      if(e <= PAUSE_DEBUT) x = 0;
      else if(e >= T - PAUSE_FIN) x = trop;
      else x = trop * (e - PAUSE_DEBUT) / (T - PAUSE_DEBUT - PAUSE_FIN);
      i.style.transform = 'translate3d(-' + x.toFixed(1) + 'px,0,0)';
      if(e < T) raf = requestAnimationFrame(pas);
    }
    i.style.transform = 'translate3d(0,0,0)';
    raf = requestAnimationFrame(pas);
    anims.push({ cancel: function(){ stop = true; if(raf) cancelAnimationFrame(raf); i.style.transform = ''; } });
  }
  // Lance le défilement des lignes trop longues du message affiché ; renvoie combien de temps le message doit rester (ms).
  function defiler(msg){
    var duree = DUREE;
    [].forEach.call(msg.querySelectorAll('.bd-l'), function(ligne){
      var i = ligne.firstChild; if(!i) return;
      var trop = i.offsetWidth - ligne.clientWidth;
      if(trop <= 2) return;
      var defil = Math.round(trop / VITESSE * 1000), T = PAUSE_DEBUT + defil + PAUSE_FIN;
      glisser(i, trop, T);
      duree = Math.max(duree, T + 300);
    });
    return duree;
  }
  function afficher(i){
    var el = document.getElementById('bd-accueil'); if(!el || !visibles.length) return;
    // L'accueil n'est pas forcément à l'écran quand le bandeau est construit (largeur nulle : impossible de mesurer le texte,
    // donc pas de défilement). On attend qu'il soit affiché, puis on lance.
    if(!el.offsetWidth || !el.offsetParent){ arreterMinuteur(); minuteur = setTimeout(function(){ afficher(i); }, 300); return; }
    var anc = idx; idx = i % visibles.length;
    anims.forEach(function(a){ try{ a.cancel(); }catch(e){} }); anims = [];
    var ms = el.querySelectorAll('.bd-m');
    [].forEach.call(ms, function(n, k){ n.classList.remove('on', 'out'); if(k === anc && anc !== idx) n.classList.add('out'); if(k === idx) n.classList.add('on'); });
    var m = visibles[idx], c = COULEURS[m.type] || COULEURS.info;
    el.style.background = fond(m);
    var ic = el.querySelector('.bd-ic'); if(ic) ic.textContent = c.icone;
    var duree = defiler(ms[idx]);
    var barre = el.querySelector('.bd-barre');
    var bouge = visibles.length > 1 || duree > DUREE;
    if(barre){ barre.classList.remove('go'); void barre.offsetWidth; el.style.setProperty('--bd-d', duree + 'ms'); if(bouge) barre.classList.add('go'); }
    arreterMinuteur();
    if(bouge) minuteur = setTimeout(function suite(){
      var a = document.querySelector('.screen.active');
      if(document.hidden || !a || a.id !== 's-espaces' || !document.getElementById('bd-accueil')){ minuteur = setTimeout(suite, 1000); return; }   // on attend de revenir sur l'accueil
      afficher(idx + 1);
    }, duree);
  }
  function arreterMinuteur(){ if(minuteur){ clearTimeout(minuteur); minuteur = null; } }
  function bandeau(){
    var contenu = document.querySelector('#s-espaces .content');
    var el = document.getElementById('bd-accueil');
    visibles = actifs();
    if(!contenu || !visibles.length){ if(el) el.remove(); arreter(); return; }
    var sig = visibles.map(function(m){ return m._id + ':' + (m.ts || 0); }).join('|');
    if(el && el.getAttribute('data-sig') === sig) return;   // rien n'a changé : on ne redessine pas (sinon l'animation repart)
    if(el) el.remove();
    arreter();
    el = document.createElement('div');
    el.id = 'bd-accueil'; el.setAttribute('role', 'status'); el.setAttribute('data-sig', sig);
    el.innerHTML = '<div class="bd-ic" aria-hidden="true"></div><div class="bd-liste">'
      + visibles.map(function(m){ return '<div class="bd-m"><span class="bd-l bd-t1"><i>' + esc(m.titre) + '</i></span>' + (m.detail ? '<span class="bd-l bd-t2"><i>' + esc(m.detail) + '</i></span>' : '') + '</div>'; }).join('')
      + '</div><div class="bd-barre"></div>';
    // Pas de croix : le message ne disparaît que quand Eric le décide (suppression ou date de fin), Cobey 05/11/2026.
    contenu.insertBefore(el, contenu.firstChild);
    idx = 0; afficher(0);
  }
  window.addEventListener('resize', function(){ try{ if(document.getElementById('bd-accueil') && visibles.length) afficher(idx); }catch(e){} });
  if(typeof window.depRenderEspaces === 'function'){
    var origEsp = window.depRenderEspaces;
    window.depRenderEspaces = function(){ var r = origEsp.apply(this, arguments); try{ bandeau(); }catch(e){} return r; };
  }

  /* ---------- lecture dans Firebase (après le code) ---------- */
  var ecoute = false;
  function ecouter(){
    if(ecoute || !window.db || !window.firebaseReady) return;
    ecoute = true;
    try{
      db.ref('dct_bandeau').on('value', function(snap){
        var v = snap.val();
        messages = (v && typeof v === 'object') ? v : {};
        try{ localStorage.setItem(cache, JSON.stringify(messages)); }catch(e){}
        try{ bandeau(); }catch(e){}
        var sec = document.getElementById('admin-section-bandeau');
        if(sec && sec.style.display !== 'none' && !document.getElementById('bd-titre-champ')) window.bandeauRenderReglage();
      }, function(e){ console.error('bandeau : lecture', e); });
    }catch(e){ console.error('bandeau', e); }
  }
  if(typeof window._demarrerEcoutesApresPin === 'function'){
    var origApres = window._demarrerEcoutesApresPin;
    window._demarrerEcoutesApresPin = function(){ var r = origApres.apply(this, arguments); ecouter(); return r; };
  }

  /* ---------- Réglages > BANDEAU (Eric) ---------- */
  var edition = null;   // id du message en cours de modification, ou null
  var typeChoisi = 'info';
  function date(iso){ return iso ? iso.split('-').reverse().join('/') : ''; }
  function ecrireListe(){
    var ids = Object.keys(messages).filter(function(id){ return messages[id] && messages[id].titre; })
      .sort(function(a, b){ return (messages[a].ts || 0) - (messages[b].ts || 0); });
    var auj = aujourdhui();
    if(!ids.length) return '<div style="text-align:center;color:var(--text3,#888);padding:18px 8px;font-size:14px">Aucun message pour l’instant.<br>Le bandeau n’apparaît pas à l’accueil.</div>';
    return ids.map(function(id){
      var m = messages[id], c = COULEURS[m.type] || COULEURS.info, fini = m.fin && m.fin < auj;
      return '<div class="bd-msg"' + (fini ? ' style="opacity:.55"' : '') + '><span class="bd-pastille" style="background:' + c.a + '"></span><div class="bd-t"><b>' + esc(m.titre) + '</b>'
        + (m.detail ? '<small>' + esc(m.detail) + '</small>' : '')
        + '<small>' + c.lib + ' · ' + (fini ? 'terminé le ' + date(m.fin) : (m.fin ? 'jusqu’au ' + date(m.fin) : 'sans date de fin')) + '</small></div>'
        + '<button type="button" class="bd-btn" data-a="mod" data-id="' + esc(id) + '">Modifier</button>'
        + '<button type="button" class="bd-btn rouge" data-a="sup" data-id="' + esc(id) + '">Supprimer</button></div>';
    }).join('');
  }
  function apercu(){
    var t = (document.getElementById('bd-titre-champ') || {}).value || 'Ton message apparaîtra ici';
    var d = (document.getElementById('bd-detail-champ') || {}).value || '';
    var c = COULEURS[typeChoisi];
    var ap = document.getElementById('bd-apercu'); if(!ap) return;
    ap.style.background = 'linear-gradient(120deg,' + c.a + ',' + c.b + ')';
    ap.innerHTML = '<div class="bd-ic">' + c.icone + '</div><div class="bd-tx"><b>' + esc(t) + '</b>' + (d ? '<span>' + esc(d) + '</span>' : '') + '</div>';
  }
  window.bandeauRenderReglage = function(){
    var sec = document.getElementById('admin-section-bandeau'); if(!sec) return;
    var m = edition ? messages[edition] : null;
    if(m) typeChoisi = m.type || 'info';
    sec.innerHTML = '<div class="bd-reg"><h3>Bandeau de l’accueil</h3>'
      + '<p class="bd-aide">Les messages ci-dessous s’affichent en haut de l’accueil de toute l’équipe, en s’alternant toutes les 5 secondes s’il y en a plusieurs. Les messages restent affichés jusqu’à ce que tu les supprimes ou que leur date de fin soit passée.</p>'
      + '<div id="bd-liste">' + ecrireListe() + '</div>'
      + '<div class="bd-form"><b style="font-size:15px">' + (m ? 'Modifier le message' : 'Nouveau message') + '</b>'
      + '<label for="bd-titre-champ">Titre</label><input type="text" id="bd-titre-champ" maxlength="300" placeholder="Ex. Dernier jour pour s’inscrire : jeudi" value="' + esc(m ? m.titre : '') + '">'
      + '<label for="bd-detail-champ">Détail (facultatif)</label><input type="text" id="bd-detail-champ" maxlength="500" placeholder="Ex. Container DKR · départ le 22/11" value="' + esc(m ? (m.detail || '') : '') + '">'
      + '<label>Couleur</label><div class="bd-types">' + Object.keys(COULEURS).map(function(k){ return '<button type="button" class="bd-type' + (k === typeChoisi ? ' sel' : '') + '" data-type="' + k + '" style="background:linear-gradient(120deg,' + COULEURS[k].a + ',' + COULEURS[k].b + ')">' + COULEURS[k].icone + ' ' + COULEURS[k].lib + '</button>'; }).join('') + '</div>'
      + '<label for="bd-fin-champ">Date de fin (facultatif)</label><input type="date" id="bd-fin-champ" value="' + esc(m ? (m.fin || '') : '') + '">'
      + '<label>Aperçu</label><div class="bd-apercu" id="bd-apercu"></div>'
      + '<button type="button" class="bd-pub" id="bd-publier">' + (m ? 'Enregistrer les changements' : 'Publier dans le bandeau') + '</button>'
      + (m ? '<button type="button" class="bd-btn" id="bd-annuler" style="width:100%;margin-top:8px;padding:12px">Annuler la modification</button>' : '')
      + '</div></div>';
    apercu();
  };
  document.addEventListener('input', function(e){ if(e.target && (e.target.id === 'bd-titre-champ' || e.target.id === 'bd-detail-champ')) apercu(); });
  document.addEventListener('click', function(e){
    var t = e.target.closest ? e.target.closest('#admin-section-bandeau button') : null;
    if(!t) return;
    var u = window.currentUser || {};
    if(t.classList.contains('bd-type')){ typeChoisi = t.getAttribute('data-type'); [].forEach.call(document.querySelectorAll('#admin-section-bandeau .bd-type'), function(b){ b.classList.toggle('sel', b === t); }); apercu(); return; }
    if(t.id === 'bd-annuler'){ edition = null; typeChoisi = 'info'; window.bandeauRenderReglage(); return; }
    var a = t.getAttribute('data-a'), id = t.getAttribute('data-id');
    if(a === 'mod'){ edition = id; window.bandeauRenderReglage(); var f = document.getElementById('bd-titre-champ'); if(f && f.scrollIntoView) f.scrollIntoView({ block: 'center' }); return; }
    if(a === 'sup'){
      if(!confirm('Supprimer ce message du bandeau ?')) return;
      var tit = (messages[id] || {}).titre || '';
      Promise.resolve(db.ref('dct_bandeau/' + id).remove()).then(function(){
        try{ if(typeof _tracerReglage === 'function') _tracerReglage('🗑️', 'a retiré un message du bandeau de l’accueil : <strong>' + esc(tit) + '</strong>'); }catch(x){}
        if(edition === id){ edition = null; }
        try{ if(typeof showToastNew === 'function') showToastNew('🗑️ Message supprimé'); }catch(x){}
      });
      return;
    }
    if(t.id === 'bd-publier'){
      var titre = ((document.getElementById('bd-titre-champ') || {}).value || '').trim();
      var detail = ((document.getElementById('bd-detail-champ') || {}).value || '').trim();
      var fin = ((document.getElementById('bd-fin-champ') || {}).value || '').trim();
      if(!titre){ try{ showToastNew('⚠️ Écris un titre.'); }catch(x){} return; }
      if(!window.db || !window.firebaseReady){ try{ showToastNew('❌ Connexion indisponible.'); }catch(x){} return; }
      var obj = { titre: titre, detail: detail, type: typeChoisi, fin: fin, ts: Date.now(), par: u.name || u.id || '' };
      var r = edition ? db.ref('dct_bandeau/' + edition).set(obj) : db.ref('dct_bandeau').push(obj);
      var verbe = edition ? 'a modifié' : 'a publié';
      Promise.resolve(r).then(function(){
        try{ if(typeof _tracerReglage === 'function') _tracerReglage('📢', verbe + ' un message dans le bandeau de l’accueil : <strong>' + esc(titre) + '</strong>'); }catch(x){}
        try{ showToastNew('✅ Bandeau mis à jour'); }catch(x){}
        edition = null; typeChoisi = 'info'; window.bandeauRenderReglage();
      }).catch(function(err){ try{ showToastNew('❌ Échec : ' + ((err && err.message) || 'écriture refusée')); }catch(x){} });
    }
  });
  window.bandeau = { afficher: bandeau, messages: function(){ return messages; } };
})();
