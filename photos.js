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
  function fond(id){ return photos[id] ? 'url("' + photos[id] + '")' : ''; }
  function moi(){ return window.currentUser || null; }

  /* ---------- styles ---------- */
  (function(){
    var st = document.createElement('style');
    st.textContent = ''
      + '.ph-badge{position:absolute;right:-5px;bottom:-5px;width:20px;height:20px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 1px 4px rgba(0,0,0,.3);}'
      + '.ph-ov{position:fixed;left:0;right:0;top:0;bottom:0;z-index:9500;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center;}'
      + '.ph-sh{width:100%;max-width:430px;box-sizing:border-box;background:var(--white,#fff);color:var(--text,#111);border-radius:26px 26px 0 0;padding:18px 16px max(22px,env(safe-area-inset-bottom));}'
      + '.ph-tete{display:flex;align-items:center;gap:14px;margin-bottom:14px;}'
      + '.ph-grand{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;background-size:cover;background-position:center;flex:none;}'
      + '.ph-tete b{font-size:18px;display:block;}.ph-tete span{font-size:13px;color:var(--text3,#666);}'
      + '.ph-b{display:flex;align-items:center;gap:12px;width:100%;padding:15px;margin-top:8px;border:0;border-radius:16px;background:rgba(127,127,127,.12);color:inherit;font-family:inherit;font-size:15.5px;font-weight:700;text-align:left;cursor:pointer;}'
      + '.ph-b.rouge{color:#C0392B;}.ph-b.fin{justify-content:center;background:transparent;color:var(--text3,#666);}';
    document.head.appendChild(st);
  })();

  /* ---------- appliquer les photos partout ---------- */
  function poser(el, id){
    if(!el) return;
    var f = fond(id);
    if(f){
      el.style.backgroundImage = f;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.style.backgroundColor = 'transparent';
      el.style.color = 'transparent';
      el.setAttribute('data-ph', id);
    }else if(el.getAttribute('data-ph')){
      el.style.backgroundImage = ''; el.style.color = ''; el.removeAttribute('data-ph');
    }
  }
  function accueil(){
    var u = moi(), a = document.getElementById('dep-esp-av');
    if(!a || !u) return;
    if(photos[u.id]){ a.textContent = ''; poser(a, u.id); }
    else if(a.getAttribute('data-ph')){ poser(a, u.id); a.textContent = u.id || ''; a.style.background = u.bg || '#eee'; a.style.color = u.color || '#333'; }
    a.removeAttribute('onclick'); a.onclick = ouvrirMenu;   // ouvre un menu (changer la photo / se déconnecter)
    a.setAttribute('aria-label', 'Mon profil');
  }
  function idDeNom(nom){
    var liste = (window.COLLABS || []).slice();
    if(window.currentUser) liste.push(window.currentUser);
    for(var i = 0; i < liste.length; i++){ if(liste[i] && liste[i].name === nom) return liste[i].id; }
    return null;
  }
  function activite(){
    [].forEach.call(document.querySelectorAll('#activity-list .activity-item'), function(it){
      var dot = it.querySelector('.activity-dot');
      if(!dot) return;
      var fort = it.querySelector('.activity-text strong');
      var id = fort ? idDeNom(fort.textContent.trim()) : null;
      var deja = dot.getAttribute('data-ph');
      if(!id || !photos[id]){ if(deja){ dot.style.backgroundImage = ''; dot.removeAttribute('data-ph'); var b0 = dot.querySelector('.ph-badge'); if(b0) dot.textContent = b0.textContent; } return; }
      if(deja === id) return;
      var emoji = dot.querySelector('.ph-badge') ? dot.querySelector('.ph-badge').textContent : dot.textContent;
      dot.innerHTML = '<span class="ph-badge">' + esc(emoji) + '</span>';
      dot.style.position = 'relative';
      dot.style.backgroundImage = fond(id); dot.style.backgroundSize = 'cover'; dot.style.backgroundPosition = 'center';
      dot.setAttribute('data-ph', id);
    });
  }
  function tout(){ try{ accueil(); }catch(e){} try{ activite(); }catch(e){} }

  // Écran de connexion : les cartes de profil sont fabriquées en texte (window._carteProfil) → on y glisse la photo.
  if(typeof window._carteProfil === 'function'){
    var origCarte = window._carteProfil;
    window._carteProfil = function(c){
      var h = origCarte.apply(this, arguments);
      try{
        if(c && photos[c.id]){
          h = h.replace(/<div class="av" style="([^"]*)">[^<]*<\/div>/, function(m, style){
            return '<div class="av" style="' + style + ';background-image:' + fond(c.id) + ';background-size:cover;background-position:center;color:transparent;font-size:0;"></div>';
          });
        }
      }catch(e){}
      return h;
    };
  }
  if(typeof window.depRenderEspaces === 'function'){
    var origEsp = window.depRenderEspaces;
    window.depRenderEspaces = function(){ var r = origEsp.apply(this, arguments); tout(); return r; };
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
        sauver(); tout();
      }, function(e){ console.error('photos : lecture', e); });
    }catch(e){ console.error('photos', e); }
  }
  if(typeof window._demarrerEcoutesApresPin === 'function'){
    var origApres = window._demarrerEcoutesApresPin;
    window._demarrerEcoutesApresPin = function(){ var r = origApres.apply(this, arguments); ecouter(); return r; };
  }

  /* ---------- changer sa photo ---------- */
  function message(t){ try{ if(typeof showToastNew === 'function') showToastNew(t); else if(typeof toast === 'function') toast(t); }catch(e){} }
  function reduire(fichier, cb){
    var url = URL.createObjectURL(fichier), im = new Image();
    im.onload = function(){
      try{
        var s = Math.min(im.naturalWidth, im.naturalHeight), c = document.createElement('canvas');
        c.width = c.height = 192;
        c.getContext('2d').drawImage(im, (im.naturalWidth - s) / 2, (im.naturalHeight - s) / 2, s, s, 0, 0, 192, 192);
        URL.revokeObjectURL(url);
        cb(c.toDataURL('image/jpeg', 0.82));
      }catch(e){ cb(null); }
    };
    im.onerror = function(){ URL.revokeObjectURL(url); cb(null); };
    im.src = url;
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
      reduire(f, function(d){
        if(!d){ message('⚠️ Photo illisible, essaie une autre image.'); return; }
        enregistrer(u.id, d); message('✅ Photo de profil mise à jour');
      });
    };
    document.body.appendChild(inp);
    inp.click();
  }
  function fermer(){ var o = document.getElementById('ph-menu'); if(o) o.parentNode.removeChild(o); }
  function ouvrirMenu(){
    var u = moi(); if(!u) return;
    fermer();
    var a = photos[u.id]
      ? '<div class="ph-grand" style="background-image:' + fond(u.id) + ';"></div>'
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
  window.photosProfil = { appliquer: tout, menu: ouvrirMenu, photos: function(){ return photos; } };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tout); else tout();
})();
