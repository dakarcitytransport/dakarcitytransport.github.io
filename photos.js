/* ═══════════════════════════════════════════════════════════
   DCT — Photos de profil · photos.js · 05/11/2026
   Cobey : « c'est possible de mettre des photos de profil au lieu des initiales ? Tout le monde peut changer sa
   photo de profil, à l'accueil, à la connexion et dans l'activité. »
   - Chacun change SA photo : toucher la pastille en haut à droite de l'accueil > « Changer ma photo ».
   - La photo est réduite (carré 192 px, JPEG) puis écrite dans Firebase : dct_profils_photos/<ID> (~10 Ko).
   - Copie gardée dans le téléphone (localStorage) : l'écran de connexion, avant le code, l'utilise.
   - Sans photo : les initiales, comme avant. Marche en V1 et en V2.
   ═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var CLE = 'dct_profils_photos_cache';
  var photos = {};
  try{ photos = JSON.parse(localStorage.getItem(CLE) || '{}') || {}; }catch(e){ photos = {}; }
  function sauver(){ try{ localStorage.setItem(CLE, JSON.stringify(photos)); }catch(e){} }
  function esc(t){ return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  // Photos mises « d'office » par la direction en attendant que la personne mette la sienne (Cobey, 05/11/2026) :
  // fichiers rangés dans photos-defaut/ (ID.jpg, 192 px). Dès que la personne enregistre sa propre photo, c'est la sienne qui s'affiche.
  var DEFAUT = { IB: 'photos-defaut/IB.jpg?v=1', BO: 'photos-defaut/BO.jpg?v=1', SA: 'photos-defaut/SA.jpg?v=1', AM: 'photos-defaut/AM.jpg?v=1', IS: 'photos-defaut/IS.jpg?v=1', MN: 'photos-defaut/MN.jpg?v=1' };   // Ibrahima (Cobey, 05/11/2026). AB retirée : Abdoulaye a déjà mis la sienne.
  function source(id){ return photos[id] || DEFAUT[id] || ''; }
  function fond(id){ var f = source(id); return f ? 'url("' + f + '")' : ''; }
  function moi(){ return window.currentUser || null; }

  /* ---------- styles ---------- */
  (function(){
    var st = document.createElement('style');
    st.textContent = ''
      + '.ph-mini{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;flex:none;font-weight:800;vertical-align:middle;overflow:hidden;line-height:1;}'
      + '.ph-badge{color:#222;position:absolute;right:-5px;bottom:-5px;width:20px;height:20px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 1px 4px rgba(0,0,0,.3);}'
      + '.ph-ov{position:fixed;left:0;right:0;top:0;bottom:0;z-index:9500;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center;}'
      + '.ph-sh{width:100%;max-width:430px;box-sizing:border-box;background:var(--white,#fff);color:var(--text,#111);border-radius:26px 26px 0 0;padding:18px 16px max(22px,env(safe-area-inset-bottom));}'
      + '.ph-tete{display:flex;align-items:center;gap:14px;margin-bottom:14px;}'
      + '.ph-grand{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;background-size:cover;background-position:center;flex:none;}'
      + '.ph-tete b{font-size:18px;display:block;}.ph-tete span{font-size:13px;color:var(--text3,#666);}'
      + '.ph-cad{display:flex;flex-direction:column;align-items:center;gap:16px;padding:8px 0 4px;}'
      + '.ph-rond{width:280px;height:280px;border-radius:50%;overflow:hidden;position:relative;touch-action:none;cursor:grab;box-shadow:0 0 0 3px rgba(255,255,255,.9),0 8px 30px rgba(0,0,0,.35);background:#222;}'
      + '.ph-rond canvas{width:280px;height:280px;display:block;}'
      + '.ph-aide{font-size:13px;color:var(--text3,#666);text-align:center;}'
      + '.ph-zoom{width:280px;display:flex;align-items:center;gap:10px;color:var(--text3,#666);font-size:18px;}.ph-zoom input{flex:1;}'
      + '.ph-lig{display:flex;gap:10px;width:100%;}.ph-lig .ph-b{margin-top:0;justify-content:center;}.ph-lig .ph-ok{background:#0E9F5B;color:#fff;}'
      + '.ph-b{display:flex;align-items:center;gap:12px;width:100%;padding:15px;margin-top:8px;border:0;border-radius:16px;background:rgba(127,127,127,.12);color:inherit;font-family:inherit;font-size:15.5px;font-weight:700;text-align:left;cursor:pointer;}'
      + '.ph-b.rouge{color:#C0392B;}.ph-b.fin{justify-content:center;background:transparent;color:var(--text3,#666);}';
    document.head.appendChild(st);
  })();

  /* ---------- appliquer les photos partout ----------
     La photo n'est écrite qu'UNE fois, dans une feuille de style (règle [data-ph="ID"]) ; les éléments portent seulement
     l'attribut data-ph. (Première version : la photo était recopiée dans le style de chaque ligne de l'Activité,
     1,6 Mo de DOM, 24 s de lenteur.) Sélecteur répété pour passer devant les règles « sombre » (!important). */
  var feuille = null, derniere = '';
  function regles(){
    var h = '';
    var ids = {}; Object.keys(DEFAUT).forEach(function(k){ ids[k] = 1; }); Object.keys(photos).forEach(function(k){ ids[k] = 1; });
    Object.keys(ids).forEach(function(id){
      var src = source(id);
      if(!/^[A-Za-z0-9_-]+$/.test(id) || !src || (src.indexOf('data:image/') !== 0 && src.indexOf('photos-defaut/') !== 0)) return;
      h += '[data-ph="' + id + '"][data-ph][data-ph][data-ph]{background-image:url("' + src + '") !important;background-size:cover !important;background-position:center !important;background-repeat:no-repeat !important;background-origin:border-box !important;background-clip:border-box !important;background-color:transparent !important;color:transparent !important;border-radius:50% !important;}';
    });
    return h;
  }
  function majFeuille(){
    var h = regles();
    if(h === derniere) return;
    derniere = h;
    if(!feuille){ feuille = document.createElement('style'); feuille.id = 'ph-photos'; document.head.appendChild(feuille); }
    feuille.textContent = h;
  }
  function poser(el, id){
    if(!el) return;
    if(source(id)){ if(el.getAttribute('data-ph') !== id) el.setAttribute('data-ph', id); }
    else if(el.getAttribute('data-ph')) el.removeAttribute('data-ph');
  }
  function accueil(){
    var u = moi(), a = document.getElementById('dep-esp-av');
    if(!a || !u) return;
    if(source(u.id)){ a.textContent = ''; poser(a, u.id); }
    else if(a.getAttribute('data-ph')){ poser(a, u.id); a.textContent = u.id || ''; }
    a.removeAttribute('onclick'); a.onclick = ouvrirMenu;   // ouvre un menu (changer la photo / se déconnecter)
    a.setAttribute('aria-label', 'Mon profil');
  }
  function idDeNom(nom){
    var liste = (window.COLLABS || []).slice();
    if(window.currentUser) liste.push(window.currentUser);
    for(var i = 0; i < liste.length; i++){ if(liste[i] && liste[i].name === nom) return liste[i].id; }
    if(nom === 'Mamadou Niass') return 'MN';   // pas dans COLLABS : sa photo n'apparaît que dans l'Activité (pas dans son propre espace)
    return null;
  }
  function activite(){
    [].forEach.call(document.querySelectorAll('#activity-list .activity-item'), function(it){
      var dot = it.querySelector('.activity-dot');
      if(!dot) return;
      var fort = it.querySelector('.activity-text strong');
      var id = fort ? idDeNom(fort.textContent.trim()) : null;
      var deja = dot.getAttribute('data-ph');
      if(!id || !source(id)){
        if(deja){ dot.removeAttribute('data-ph'); var b0 = dot.querySelector('.ph-badge'); if(b0) dot.textContent = b0.textContent; }
        return;
      }
      if(deja === id) return;
      var emoji = dot.querySelector('.ph-badge') ? dot.querySelector('.ph-badge').textContent : dot.textContent;
      dot.innerHTML = '<span class="ph-badge">' + esc(emoji) + '</span>';
      dot.style.position = 'relative';
      dot.setAttribute('data-ph', id);
    });
  }
  function tout(){ try{ majFeuille(); }catch(e){} try{ accueil(); }catch(e){} try{ activite(); }catch(e){} }

  // Écran de connexion : les cartes de profil sont fabriquées en texte (window._carteProfil) → on y glisse la photo.
  if(typeof window._carteProfil === 'function'){
    var origCarte = window._carteProfil;
    window._carteProfil = function(c){
      var h = origCarte.apply(this, arguments);
      try{
        if(c && source(c.id)){
          h = h.replace('<div class="av" style=', '<div class="av" data-ph="' + c.id + '" style=');
        }
      }catch(e){}
      return h;
    };
  }
  // Fenêtre du code PIN : la photo de la personne à la place des initiales (Cobey, 05/11/2026 : « il manque la photo de profil là »).
  if(typeof window._ouvrirModalPinCollab === 'function'){
    var origPin = window._ouvrirModalPinCollab;
    window._ouvrirModalPinCollab = function(collab){
      var r = origPin.apply(this, arguments);
      try{
        var av = document.getElementById('collab-pin-avatar');
        if(av){
          if(collab && source(collab.id)) av.setAttribute('data-ph', collab.id); else av.removeAttribute('data-ph');
        }
      }catch(e){}
      return r;
    };
  }
  // Partout où une pastille d'initiales (.av) porte l'identifiant d'une personne qui a une photo (détail d'une collecte,
  // Administration > Équipe, Codes admin…), on y met sa photo. Cobey, 06/11/2026 : « au niveau des initiales, on aurait
  // pu mettre leurs photos, maintenant on a des photos. » (Observation légère : une passe par image d'écran.)
  function pastilles(){
    [].forEach.call(document.querySelectorAll('.collab-card .av:not([data-ph]):not([data-phx]), #col-av:not([data-ph]):not([data-phx]), .header > .av:not([data-ph]):not([data-phx])'), function(el){
      var t = (el.textContent || '').trim();
      if(!/^[A-Z]{2,3}$/.test(t) || !source(t)){ if(t.length > 3 || /[^A-Z]/.test(t)) el.setAttribute('data-phx', '1'); return; }
      el.setAttribute('data-ph', t);
    });
    // Administration (Équipe, Codes admin) : pastilles rondes écrites en style direct, sans la classe .av
    [].forEach.call(document.querySelectorAll('#s-admin [id^="admin-section-"] div:not([data-ph]):not([data-phx])'), function(el){
      if(el.children.length) return;
      var t = (el.textContent || '').trim();
      if(!/^[A-Z]{2,3}$/.test(t) || !source(t)) return;
      if(String(el.style.borderRadius).indexOf('50%') < 0) return;
      el.setAttribute('data-ph', t);
    });
  }
  if(window.MutationObserver){
    var planifie = false;
    new MutationObserver(function(){
      if(planifie) return; planifie = true;
      (window.requestAnimationFrame || setTimeout)(function(){ planifie = false; try{ pastilles(); }catch(e){} });
    }).observe(document.body, { childList:true, subtree:true });
    try{ pastilles(); }catch(e){}
  }
  if(typeof window.depRenderEspaces === 'function'){
    var origEsp = window.depRenderEspaces;
    window.depRenderEspaces = function(){ var r = origEsp.apply(this, arguments); tout(); try{ nouveautes(); }catch(e){} return r; };
  }
  if(window.MutationObserver){
    var liste = document.getElementById('activity-list');
    if(liste){
      var en = false;
      new MutationObserver(function(){ if(en) return; en = true; try{ activite(); }catch(e){} en = false; }).observe(liste, { childList: true });
    }
  }

  /* ---------- lecture dans Firebase (après le code) ---------- */
  var ecoute = false;
  function ecouter(){
    if(ecoute || !window.db || !window.firebaseReady) return;
    ecoute = true;
    try{
      db.ref('dct_profils_photos').on('value', function(snap){
        var v = snap.val();
        photos = (v && typeof v === 'object') ? v : {};
        sauver(); tout(); redessiner();
      }, function(e){ console.error('photos : lecture', e); });
    }catch(e){ console.error('photos', e); }
  }
  if(typeof window._demarrerEcoutesApresPin === 'function'){
    var origApres = window._demarrerEcoutesApresPin;
    window._demarrerEcoutesApresPin = function(){ var r = origApres.apply(this, arguments); ecouter(); return r; };
  }

  /* ---------- changer sa photo ---------- */
  function message(t){ try{ if(typeof showToastNew === 'function') showToastNew(t); else if(typeof toast === 'function') toast(t); }catch(e){} }
  // Cadrage : on déplace (doigt / souris) et on zoome (pincement / curseur) la photo dans le rond, puis on valide.
  var V = 280;
  // Charge la photo en tenant compte de son orientation (les photos d'iPhone portent une rotation dans le fichier :
  // sans cela, le rectangle découpé peut sortir de l'image et laisser des bords noirs).
  function charger(fichier, cb){
    function viaImage(){
      var url = URL.createObjectURL(fichier), im = new Image();
      im.onload = function(){ URL.revokeObjectURL(url); cb(im, im.naturalWidth, im.naturalHeight); };
      im.onerror = function(){ URL.revokeObjectURL(url); cb(null); };
      im.src = url;
    }
    if(window.createImageBitmap){
      createImageBitmap(fichier, { imageOrientation: 'from-image' }).then(function(b){ cb(b, b.width, b.height); }).catch(viaImage);
    } else viaImage();
  }
  function cadrer(fichier, cb){
    charger(fichier, function(im, W, H){
      if(!im || !W || !H){ cb(null); return; }
      var smin = Math.max(V / W, V / H), s = smin, cx = W / 2, cy = H / 2;
      fermer();
      var o = document.createElement('div');
      o.id = 'ph-menu'; o.className = 'ph-ov';
      o.innerHTML = '<div class="ph-sh" role="dialog" aria-label="Cadrer ma photo"><div class="ph-cad">'
        + '<b style="font-size:18px;">Cadre ta photo</b>'
        + '<div class="ph-rond" id="ph-rond"><canvas id="ph-cv" width="560" height="560"></canvas></div>'
        + '<div class="ph-aide">Glisse pour déplacer · pince ou curseur pour zoomer</div>'
        + '<div class="ph-zoom">−<input type="range" id="ph-z" min="0" max="100" value="0" aria-label="Zoom">+</div>'
        + '<div class="ph-lig"><button type="button" class="ph-b fin" data-a="non">Annuler</button><button type="button" class="ph-b ph-ok" data-a="ok">Valider</button></div>'
        + '</div></div>';
      document.body.appendChild(o);
      var cv = o.querySelector('#ph-cv'), g = cv.getContext('2d'), z = o.querySelector('#ph-z'), rond = o.querySelector('#ph-rond');
      function borne(){
        var m = V / (2 * s);
        cx = Math.min(Math.max(cx, m), W - m); cy = Math.min(Math.max(cy, m), H - m);
      }
      function dessiner(){
        borne(); var m = V / (2 * s);
        g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
        g.drawImage(im, cx - m, cy - m, 2 * m, 2 * m, 0, 0, cv.width, cv.height);
      }
      function zoomer(ns){ s = Math.min(Math.max(ns, smin), smin * 4); z.value = Math.round((s / smin - 1) / 3 * 100); dessiner(); }
      var pts = {}, dist0 = 0, s0 = s;
      rond.addEventListener('pointerdown', function(e){ try{ rond.setPointerCapture(e.pointerId); }catch(x){} pts[e.pointerId] = { x: e.clientX, y: e.clientY }; var k = Object.keys(pts); if(k.length === 2){ dist0 = Math.hypot(pts[k[0]].x - pts[k[1]].x, pts[k[0]].y - pts[k[1]].y); s0 = s; } });
      rond.addEventListener('pointermove', function(e){
        if(!pts[e.pointerId]) return;
        var k = Object.keys(pts), p = pts[e.pointerId];
        if(k.length === 1){ cx -= (e.clientX - p.x) / s; cy -= (e.clientY - p.y) / s; p.x = e.clientX; p.y = e.clientY; dessiner(); }
        else { p.x = e.clientX; p.y = e.clientY; var d = Math.hypot(pts[k[0]].x - pts[k[1]].x, pts[k[0]].y - pts[k[1]].y); if(dist0) zoomer(s0 * d / dist0); }
      });
      var fin = function(e){ delete pts[e.pointerId]; };
      rond.addEventListener('pointerup', fin); rond.addEventListener('pointercancel', fin);
      rond.addEventListener('wheel', function(e){ e.preventDefault(); zoomer(s * (e.deltaY < 0 ? 1.08 : 0.92)); }, { passive: false });
      z.addEventListener('input', function(){ zoomer(smin * (1 + 3 * z.value / 100)); });
      o.addEventListener('click', function(ev){
        var b = ev.target.closest('button[data-a]');
        if(ev.target === o || (b && b.getAttribute('data-a') === 'non')){ fermer(); return; }
        if(b && b.getAttribute('data-a') === 'ok'){
          try{
            borne(); var m = V / (2 * s), c = document.createElement('canvas'); c.width = c.height = 192;
            var g2 = c.getContext('2d'); g2.fillStyle = '#fff'; g2.fillRect(0, 0, 192, 192);
            g2.drawImage(im, cx - m, cy - m, 2 * m, 2 * m, 0, 0, 192, 192);
            var d = c.toDataURL('image/jpeg', 0.82);
            fermer(); cb(d);
          }catch(e){ fermer(); cb(null); }
        }
      });
      dessiner();
    });
  }
  function enregistrer(id, dataUrl){
    if(dataUrl){ photos[id] = dataUrl; } else { delete photos[id]; }
    sauver(); tout();
    try{
      if(window.db && window.firebaseReady){
        var r = db.ref('dct_profils_photos/' + id);
        (dataUrl ? r.set(dataUrl) : r.remove());
      }
    }catch(e){ console.error('photos : écriture', e); }
  }
  function choisir(){
    var u = moi(); if(!u) return;
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*'; inp.id = 'ph-fichier'; inp.style.display = 'none';
    inp.onchange = function(){
      var f = inp.files && inp.files[0];
      if(inp.parentNode) inp.parentNode.removeChild(inp);
      if(!f) return;
      cadrer(f, function(d){
        if(!d){ message('⚠️ Photo illisible, essaie une autre image.'); return; }
        enregistrer(u.id, d); message('✅ Photo de profil mise à jour');
      });
    };
    document.body.appendChild(inp);
    inp.click();
  }
  function fermer(){ var o = document.getElementById('ph-menu'); if(o && o.parentNode) o.parentNode.removeChild(o); }
  function ouvrirMenu(){
    var u = moi(); if(!u) return;
    fermer();
    var a = source(u.id)
      ? '<div class="ph-grand" data-ph="' + esc(u.id) + '"></div>'
      : '<div class="ph-grand" style="background:' + esc(u.bg || '#eee') + ';color:' + esc(u.color || '#333') + ';">' + esc(u.id) + '</div>';
    var o = document.createElement('div');
    o.id = 'ph-menu'; o.className = 'ph-ov';
    o.innerHTML = '<div class="ph-sh" role="dialog" aria-label="Mon profil">'
      + '<div class="ph-tete">' + a + '<div><b>' + esc(u.name || u.id) + '</b><span>Ma photo de profil</span></div></div>'
      + '<button type="button" class="ph-b" data-a="photo">📷 ' + (photos[u.id] ? 'Changer ma photo' : 'Ajouter ma photo') + '</button>'
      + (photos[u.id] ? '<button type="button" class="ph-b" data-a="retirer">🗑️ Retirer ma photo</button>' : '')
      + '<button type="button" class="ph-b rouge" data-a="sortir">🚪 Se déconnecter</button>'
      + '<button type="button" class="ph-b fin" data-a="fermer">Annuler</button>'
      + '</div>';
    o.addEventListener('click', function(ev){
      if(ev.target === o){ fermer(); return; }
      var b = ev.target.closest('button[data-a]'); if(!b) return;
      var act = b.getAttribute('data-a');
      fermer();
      if(act === 'photo') choisir();
      else if(act === 'retirer') enregistrer(u.id, null);
      else if(act === 'sortir' && typeof window.depDeconnexion === 'function') window.depDeconnexion();
    });
    document.body.appendChild(o);
  }

  /* ---------- Fenêtre « Nouveauté » : à la première connexion après la mise à jour, une seule fois par personne ----------
     Cobey : « à leur prochaine connexion, un pop-up pour leur indiquer qu'ils peuvent mettre une photo de profil,
     et expliquer comment ; comme dans une application, on le voit à la première connexion, après ça disparaît. »
     Mémorisé dans Firebase (dct_nouveautes_vues/<ID>/<nouveauté>) : une fois par personne, pas par téléphone.
     Pas affichée à qui a déjà une photo. Pour une future nouveauté : ajouter une entrée à NOUVEAUTES. */
  var NOUVEAUTES = [
    { id: 'photo_profil',
      deja: function(u){ return !!source(u.id); },   // déjà fait : on ne dérange pas
      html: function(){
        var etape = function(n, t, d){ return '<div style="display:flex;gap:12px;align-items:center;background:rgba(14,159,91,.1);border-radius:18px;padding:11px 14px"><div style="width:30px;height:30px;border-radius:50%;background:#0E9F5B;color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center;flex:none">' + n + '</div><div><b style="font-size:14.5px;display:block">' + t + '</b><span style="font-size:12.5px;color:var(--text3,#55675E)">' + d + '</span></div></div>'; };
        var u = moi() || {};
        return '<div style="display:flex;justify-content:center;margin:6px 0 10px"><div style="position:relative;width:92px;height:92px">'
          + '<div style="width:92px;height:92px;border-radius:50%;background:linear-gradient(135deg,#BDEBD3,#DCD3FF);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:30px;color:#0A7A45">' + esc(u.id || '') + '</div>'
          + '<div style="position:absolute;right:-4px;bottom:-4px;width:38px;height:38px;border-radius:50%;background:#0E9F5B;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(14,159,91,.45);border:3px solid var(--white,#fff)"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div></div></div>'
          + '<div style="text-align:center;font-size:12px;font-weight:800;letter-spacing:.08em;color:#0A7A45;margin-bottom:4px">NOUVEAUTÉ</div>'
          + '<div style="text-align:center;font-size:22px;font-weight:800;letter-spacing:-.02em;margin-bottom:6px">Ajoute ta photo de profil</div>'
          + '<div style="text-align:center;font-size:14px;color:var(--text3,#55675E);margin-bottom:16px;line-height:1.4">Ta photo remplace tes initiales à l’accueil, à la connexion et dans l’activité de l’équipe.</div>'
          + '<div style="display:grid;gap:10px;margin-bottom:18px">'
          + etape('1', 'Touche ta pastille', 'en haut à droite de l’accueil (tes initiales)')
          + etape('2', 'Choisis « Ajouter ma photo »', 'prends-la ou choisis-la dans ton téléphone')
          + etape('3', 'Cadre et valide', 'déplace avec le doigt, pince pour zoomer')
          + '</div>';
      },
      action: { texte: '📷 Ajouter ma photo maintenant', faire: function(){ choisir(); } } },
    // Cobey, 08/11/2026 : « à leur prochaine connexion, un pop-up d'explication de cette nouveauté (objectifs et classement) ; moi aussi je veux le voir ».
    { id: 'objectifs_classement', seul: true,
      deja: function(){ return false; },
      html: function(){
        var cfgOb = { container: 100, dimanche: 20 }; try{ var cf = window.objectifs && window.objectifs.config(); if(cf){ cfgOb.container = cf.container || 100; cfgOb.dimanche = cf.dimanche || 20; } }catch(e){}
        var carte = function(ic, t, d){ return '<div style="display:flex;gap:12px;align-items:center;background:rgba(14,159,91,.1);border-radius:18px;padding:11px 14px"><div style="flex:none;width:34px;height:34px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:19px;box-shadow:0 1px 4px rgba(0,0,0,.12)">' + ic + '</div><div><div style="font-weight:800;font-size:14.5px">' + t + '</div><div style="font-size:12.5px;color:var(--text3,#55675E);line-height:1.35;margin-top:1px">' + d + '</div></div></div>'; };
        return '<div style="display:flex;justify-content:center;margin:6px 0 10px"><div style="width:92px;height:92px;border-radius:50%;background:linear-gradient(135deg,#FFE9A8,#DCD3FF);display:flex;align-items:center;justify-content:center;font-size:46px">🏆</div></div>'
          + '<div style="text-align:center;font-size:12px;font-weight:800;letter-spacing:.08em;color:#0A7A45;margin-bottom:4px">NOUVEAUTÉ</div>'
          + '<div style="text-align:center;font-size:22px;font-weight:800;letter-spacing:-.02em;margin-bottom:6px">Objectifs et classement</div>'
          + '<div style="text-align:center;font-size:14px;color:var(--text3,#55675E);margin-bottom:16px;line-height:1.4">À l’accueil, deux bandes suivent la progression de toute l’équipe.</div>'
          + '<div style="display:grid;gap:10px;margin-bottom:18px">'
          + carte('🎯', 'Les objectifs', cfgOb.container + ' clients par container et ' + cfgOb.dimanche + ' par dimanche : la barre avance à chaque client.')
          + carte('🥇', 'Le classement', 'Ta case montre ta photo, ta place, tes clients et tes euros.')
          + carte('📒', 'Ton objectif perso', 'Chacun a le sien. Pense à ton carnet d’adresses : chaque client que tu ramènes compte !')
          + '</div>';
      },
      action: { texte: 'J’ai compris', faire: function(){} } },
    // Cobey, 08/11/2026 : « tu codes et tu mets un pop-up pour expliquer cette nouveauté » (le bouton Objectifs de la barre du bas, à la place d'Activité).
    { id: 'page_objectifs',
      deja: function(){ try{ return !(window.lookEffectif && window.lookEffectif() === 'v2'); }catch(e){ return true; } },   // la barre du bas n'existe qu'en nouveau look
      html: function(){
        var carte = function(ic, t, d){ return '<div style="display:flex;gap:12px;align-items:center;background:rgba(14,159,91,.1);border-radius:18px;padding:11px 14px"><div style="flex:none;width:34px;height:34px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:19px;box-shadow:0 1px 4px rgba(0,0,0,.12)">' + ic + '</div><div><div style="font-weight:800;font-size:14.5px">' + t + '</div><div style="font-size:12.5px;color:var(--text3,#55675E);line-height:1.35;margin-top:1px">' + d + '</div></div></div>'; };
        return '<div style="display:flex;justify-content:center;margin:6px 0 10px"><div style="width:92px;height:92px;border-radius:50%;background:linear-gradient(135deg,#BDEBD3,#FFE9A8);display:flex;align-items:center;justify-content:center;font-size:46px">🏆</div></div>'
          + '<div style="text-align:center;font-size:12px;font-weight:800;letter-spacing:.08em;color:#0A7A45;margin-bottom:4px">NOUVEAUTÉ</div>'
          + '<div style="text-align:center;font-size:22px;font-weight:800;letter-spacing:-.02em;margin-bottom:6px">La page Objectifs</div>'
          + '<div style="text-align:center;font-size:14px;color:var(--text3,#55675E);margin-bottom:16px;line-height:1.4">En bas de l’écran, le bouton <b>🏆 Objectifs</b> remplace Activité.</div>'
          + '<div style="display:grid;gap:10px;margin-bottom:18px">'
          + carte('🎯', 'Ton objectif', 'En haut : ta place, tes clients, tes euros, et ce qu’il te faut cette semaine pour être dans les temps.')
          + carte('🏆', 'Le classement', 'Toute l’équipe d’un coup d’œil, mis à jour chaque dimanche après la ramasse.')
          + carte('🕑', 'Et Activité ?', 'Elle est toujours là : touche l’horloge, en haut à droite de l’accueil.')
          + '</div>';
      },
      action: { texte: '🏆 Voir la page Objectifs', faire: function(){ try{ if(window.objectifs && window.objectifs.page) window.objectifs.page(); }catch(e){} } } }
  ];
  var nvEnCours = false, nvVerifiePour = '';
  function nvVu(id, nv){ try{ return localStorage.getItem('dct_nv_' + id + '_' + nv) === '1'; }catch(e){ return false; } }
  function nvMarquer(id, nv){
    try{ localStorage.setItem('dct_nv_' + id + '_' + nv, '1'); }catch(e){}
    try{ if(window.db && window.firebaseReady) db.ref('dct_nouveautes_vues/' + id + '/' + nv).set(Date.now()); }catch(e){}
  }
  function nvAfficher(nv, u){
    nvEnCours = true;
    var o = document.createElement('div');
    o.id = 'ph-nouveaute'; o.className = 'ph-ov';
    o.style.zIndex = '9600';
    o.innerHTML = '<div class="ph-sh" role="dialog" aria-label="Nouveauté"><div style="width:42px;height:5px;border-radius:99px;background:rgba(127,127,127,.3);margin:0 auto 12px"></div>'
      + nv.html()
      + '<button type="button" class="ph-b" data-a="ok" style="justify-content:center;background:#0E9F5B;color:#fff;height:52px;font-size:16px;font-weight:800;margin-top:0">' + nv.action.texte + '</button>'
      + (nv.seul ? '' : '<button type="button" class="ph-b fin" data-a="plus">Plus tard</button>') + '</div>';
    o.addEventListener('click', function(ev){
      var b = ev.target.closest('button[data-a]');
      if(!b && ev.target !== o) return;
      var a = b ? b.getAttribute('data-a') : 'plus';
      if(o.parentNode) o.parentNode.removeChild(o);
      nvEnCours = false;
      nvMarquer(u.id, nv.id);
      if(a === 'ok') nv.action.faire();
      if(!(a === 'ok' && !nv.seul)) setTimeout(function(){ nvVerifiePour = ''; try{ nouveautes(); }catch(e){} }, 700);
    });
    document.body.appendChild(o);
  }
  function nouveautes(){
    var u = moi();
    if(!u || !u.id || u.societe || nvEnCours || nvVerifiePour === u.id) return;
    if(!window.db || !window.firebaseReady) return;
    var sur = function(){ var a = document.querySelector('.screen.active'); return !!a && a.id === 's-espaces'; };
    if(!sur()) return;   // seulement sur l'accueil, une fois connecté (pas sur l'écran de connexion)
    nvVerifiePour = u.id;
    var a_voir = NOUVEAUTES.filter(function(nv){ return !nvVu(u.id, nv.id); });
    if(!a_voir.length) return;
    db.ref('dct_nouveautes_vues/' + u.id).once('value', function(snap){
      var vues = snap.val() || {};
      setTimeout(function(){
        var nv = a_voir.filter(function(x){ if(vues[x.id]){ try{ localStorage.setItem('dct_nv_' + u.id + '_' + x.id, '1'); }catch(e){} return false; } return true; })[0];
        if(!nv || (moi() || {}).id !== u.id || !sur() || nvEnCours) return;
        if(nv.deja(u)){ nvMarquer(u.id, nv.id); return; }   // a déjà sa photo : rien à annoncer
        nvAfficher(nv, u);
      }, 1500);
    });
  }
  // Petit rond « photo ou initiales » pour les listes (Planning…). Sans photo : initiales aux couleurs du profil.
  function avatar(id, px){
    px = px || 22;
    var c = null, liste = (window.COLLABS || []);
    for(var i = 0; i < liste.length; i++){ if(liste[i] && liste[i].id === id){ c = liste[i]; break; } }
    var base = 'width:' + px + 'px;height:' + px + 'px;font-size:' + Math.max(8, Math.round(px * 0.42)) + 'px;';
    if(source(id)) return '<span class="ph-mini" data-ph="' + esc(id) + '" style="' + base + '"></span>';
    return '<span class="ph-mini" style="' + base + 'background:' + esc((c && c.bg) || '#e5e5e5') + ';color:' + esc((c && c.color) || '#444') + ';">' + esc(String(id).slice(0, 2)) + '</span>';
  }
  // Quand une photo change, on redessine les écrans qui affichent des petits ronds (Planning, accueil).
  function redessiner(){
    try{
      var a = document.querySelector('.screen.active'); if(!a) return;
      if(a.id === 's-planning' && typeof window.depRenderPlanning === 'function') window.depRenderPlanning();
      else if(a.id === 's-espaces' && typeof window.depRenderEspaces === 'function') window.depRenderEspaces();
    }catch(e){}
  }
  window.photosProfil = { avatar: avatar, nouveautes: nouveautes, appliquer: tout, menu: ouvrirMenu, photos: function(){ return photos; } };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tout); else tout();
})();
