/* ═══════════════════════════════════════════════════════════
   DCT — Bannière des objectifs de l'accueil · objectifs.js · 08/11/2026
   Cobey : « une bannière de progression d'objectifs : 100 clients par conteneur, au moins 20 clients par dimanche, une barre de
   progression dynamique avec un message d'encouragement (performance, retard…) » ; « le message d'information doit rester distinct
   des objectifs » → verre clair teinté, étiquette « OBJECTIF » (les messages d'information sont en couleur pleine : violet / rose / rouge) ; « les chiffres se règlent dans Réglages ».
   - Sous la bannière de messages (bandeau.js), à l'accueil, pour toute l'équipe. Les messages alternent toutes les 5 s :
       · un par container « en préparation » : clients rentrés dans CE container (collecte classique + dépôt direct + France) / objectif,
       · un pour le dimanche : clients de la collecte en cours (ou de la prochaine) + clients France du même jour / objectif.
   - Réglages > OBJECTIFS (Eric) : dct_config/objectifs = { container: 100, dimanche: 20 }.
   - Le petit trait sur la barre = « où on devrait en être aujourd'hui » (rythme régulier entre l'ouverture du container et son départ).
   ═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var DUREE = 5000;
  var DEFAUT = { container: 100, dimanche: 20 };
  var cfg = { container: DEFAUT.container, dimanche: DEFAUT.dimanche };
  try{ var c0 = JSON.parse(localStorage.getItem('dct_objectifs_cache') || 'null'); if(c0 && c0.container) cfg = c0; }catch(e){}
  var MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  function esc(t){ return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function auj(){ try{ return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' }); }catch(e){ return new Date().toISOString().slice(0, 10); } }
  function jours(iso){ var p = String(iso || '').split('-'); if(p.length !== 3) return NaN; return Date.UTC(+p[0], +p[1] - 1, +p[2]) / 86400000; }
  function dateCourte(iso){ var p = String(iso || '').split('-'); return p.length === 3 ? p[2] + '/' + p[1] : ''; }
  // « Dimanche 8 novembre 2026 » → '2026-11-08'
  function isoDeLibelle(t){
    var m = /(\d{1,2})\s+([a-zéûè]+)\s+(\d{4})/i.exec(String(t || '').toLowerCase());
    if(!m) return '';
    var k = MOIS.indexOf(m[2]); if(k < 0) return '';
    return m[3] + '-' + ('0' + (k + 1)).slice(-2) + '-' + ('0' + m[1]).slice(-2);
  }

  /* ---------- styles ---------- */
  (function(){
    var st = document.createElement('style');
    st.textContent = ''
      + '#ob-accueil{position:relative;margin:0 0 14px;border-radius:20px;color:#10241a;overflow:hidden;background:rgba(255,255,255,.55);border:1.5px solid rgba(255,255,255,.9);box-shadow:0 6px 16px rgba(30,60,45,.1);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}'
      + '#ob-accueil .ob-m{display:none;padding:9px 14px 10px}#ob-accueil .ob-m.on{display:block;animation:obIn .35s ease}'
      + '@keyframes obIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}'
      + '#ob-accueil .ob-l1{display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:800;white-space:nowrap}'
      + '#ob-accueil .ob-tag{flex:none;font-size:9.5px;font-weight:800;letter-spacing:.09em;padding:2px 7px;border-radius:6px;background:#10241a;color:#fff}'
      + '#ob-accueil .ob-nom{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}'
      + '#ob-accueil .ob-n{flex:none;font-size:16px;letter-spacing:-.02em}#ob-accueil .ob-n i{font-style:normal;font-size:11px;opacity:.6;font-weight:700}'
      + '#ob-accueil .ob-bar{height:8px;border-radius:99px;margin:6px 0 4px;position:relative;background:rgba(255,255,255,.7)}'
      + '#ob-accueil .ob-bar i{display:block;height:100%;border-radius:99px;transition:width .6s ease}'
      + '#ob-accueil .ob-bar u{position:absolute;top:-3px;width:2px;height:14px;background:#10241a;opacity:.5;border-radius:2px}'
      + '#ob-accueil .ob-l2{font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
      + '#ob-accueil .ob-m.v{background:linear-gradient(135deg,rgba(46,178,124,.28),rgba(46,178,124,.1))}#ob-accueil .ob-m.v .ob-bar i{background:linear-gradient(90deg,#2fb27c,#1a8a5c)}#ob-accueil .ob-m.v .ob-l2{color:#0a6b3d}'
      + '#ob-accueil .ob-m.b{background:linear-gradient(135deg,rgba(74,85,200,.26),rgba(74,85,200,.09))}#ob-accueil .ob-m.b .ob-bar i{background:linear-gradient(90deg,#4a55c8,#26338f)}#ob-accueil .ob-m.b .ob-l2{color:#26338f}'
      + '#ob-accueil .ob-m.o{background:linear-gradient(135deg,rgba(245,166,35,.34),rgba(245,166,35,.1))}#ob-accueil .ob-m.o .ob-bar i{background:linear-gradient(90deg,#f5a623,#e07a10)}#ob-accueil .ob-m.o .ob-l2{color:#a04800}'
      + '#ob-accueil .ob-m.d{background:linear-gradient(135deg,rgba(245,197,66,.45),rgba(245,197,66,.16))}#ob-accueil .ob-m.d .ob-bar i{background:linear-gradient(90deg,#f5c542,#e0a010)}#ob-accueil .ob-m.d .ob-l2{color:#8a5a00}'
      + '#ob-accueil.fin{box-shadow:0 0 0 2px rgba(245,197,66,.7),0 6px 16px rgba(30,60,45,.1)}'
      + '#ob-pt{display:flex;gap:5px;justify-content:center;margin:-8px 0 12px}#ob-pt i{width:6px;height:6px;border-radius:50%;background:rgba(127,127,127,.35)}#ob-pt i.on{width:16px;border-radius:4px;background:rgba(127,127,127,.8)}'
      + '.ob-reg h3{font-size:17px;font-weight:800;margin:0 0 4px}.ob-reg p{font-size:13px;color:var(--text3,#666);margin:0 0 14px;line-height:1.45}'
      + '.ob-reg label{display:block;font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--text3,#666);margin:14px 0 6px}'
      + '.ob-reg input{width:100%;box-sizing:border-box;padding:13px;border-radius:14px;border:1.5px solid var(--border,#ddd);font:700 18px var(--font,inherit);background:var(--white,#fff);color:inherit}'
      + '.ob-reg .ob-ok{width:100%;margin-top:18px;height:50px;border:0;border-radius:16px;background:#0E9F5B;color:#fff;font:800 16px var(--font,inherit);cursor:pointer}';
    // La bannière « classement » reprend l'habillage de celle des objectifs (mêmes classes), sous un autre identifiant.
    st.textContent += st.textContent.replace(/#ob-accueil/g, '#cl-accueil').replace(/#ob-pt/g, '#cl-pt')
      + '#cl-accueil .cl-nom{flex:none;max-width:40%;overflow:hidden;text-overflow:ellipsis}'
      + '#cl-accueil .cl-rk{flex:1;min-width:0;font-size:11px;font-weight:800;color:#556;overflow:hidden;text-overflow:ellipsis}'
      + '#cl-accueil .cl-n{flex:none;font-size:12px;font-weight:700;color:#445}#cl-accueil .cl-n b{font-size:16px;color:#10241a;letter-spacing:-.02em}'
      + '#cl-accueil .cl-l2{display:flex;justify-content:space-between;align-items:baseline;gap:8px}'
      + '#cl-accueil .cl-l2 span{min-width:0;overflow:hidden;text-overflow:ellipsis}#cl-accueil .cl-l2 small{flex:none;font-size:10.5px;color:#667;font-weight:700}'
      + '#cl-accueil .ob-l1 .ph-mini{border:2px solid #fff;box-sizing:border-box}'
      + '#cl-pt{margin-top:-8px}';
    document.head.appendChild(st);
  })();

  /* ---------- calcul ---------- */
  function nbContainer(id){
    try{ if(typeof window.compteursDepart === 'function') return (window.compteursDepart(id) || {}).clients || 0; }catch(e){}
    return 0;
  }
  function containers(){
    var d = window.departsData || {};
    return Object.keys(d).map(function(k){ var o = d[k]; if(!o || typeof o !== 'object') return null; o = Object.assign({}, o); o._id = k; return o; })
      .filter(function(o){ return o && o.statut === 'preparation' && o.special !== 'depot'; })
      .sort(function(a, b){ return String(a.dateDepart || '').localeCompare(String(b.dateDepart || '')); });
  }
  // Là où on devrait en être aujourd'hui (0..objectif), en rythme régulier entre l'ouverture et le départ.
  function attendu(d, objectif){
    var dep = jours(d.dateDepart); if(isNaN(dep)) return null;
    var fin = dep;
    var debut = NaN;
    var ts = d.creeLe || d.creeTs || d.ts;
    if(ts){ try{ debut = jours(new Date(ts).toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' })); }catch(e){} }
    if(isNaN(debut) || debut >= fin) debut = fin - 28;
    var a = jours(auj());
    var p = (a - debut) / (fin - debut);
    return Math.max(0, Math.min(1, p)) * objectif;
  }
  // Panel de messages : plusieurs phrases par situation, une différente chaque jour (stable dans la journée, pas de clignotement).
  function hash(t){ var h = 0; for(var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h; }
  function pl(n, mot){ return n + ' ' + mot + (n > 1 ? 's' : ''); }
  function choisir(liste, cle, vars){
    var t = liste[hash(auj() + '|' + cle) % liste.length];
    return t.replace(/\{(\w+)\}/g, function(m, k){ return vars[k] != null ? vars[k] : m; });
  }
  var PANEL = {
    cAtteint: ['🎉 {obj} clients, bravo l’équipe !', '🏆 Container plein, on peut être fiers', '🎉 Objectif rempli, le reste est du bonus', '💪 {obj} clients : mission accomplie !'],
    cAvance: ['🔥 En avance — il reste {pl}', '🚀 Beau rythme : {n} déjà !', '🔥 L’équipe assure, encore {pl}', '😎 On prend de l’avance, continuez'],
    cTemps: ['👍 Bon rythme — il reste {pl}', '✅ Dans les temps, ne lâchez rien', '👍 Ça avance bien, encore {pl}', '🙂 On garde ce cap : {pl} à trouver'],
    cRetard: ['⏳ Il faut accélérer — {pl} avant le {date}', '📣 Un coup de collier : {pl} à trouver', '⏳ Un peu de retard, on s’y met !', '💥 Allez, {pl} avant le {date}'],
    cSans: ['Il reste {pl} à trouver', 'Encore {pl} pour remplir le container', '{pl} à trouver, on y va'],
    dAtteint: ['🎯 Objectif atteint, bravo !', '🎉 Objectif rempli, bien joué', '💪 On y est : objectif atteint !'],
    dDepasse: ['🎯 Objectif dépassé de {plus} !', '🔥 +{plus} au-dessus de l’objectif', '🏆 Dépassé de {plus}, bravo !'],
    dProche: ['Encore {reste} pour atteindre l’objectif', 'Presque ! Plus que {reste}', '👀 Il manque seulement {reste}'],
    dMoyen: ['Courage, {reste} de plus pour l’objectif', 'On avance : encore {reste} à trouver', '💬 {reste} de plus et c’est bon'],
    dBas: ['Il en manque {reste} : on s’y met !', '📞 Il faut en trouver {reste}, allez !', '⏳ Encore {reste} à chercher, on s’y met'],
    bBien: ['🎯 Dépassé de {plus}, belle journée !', '🎉 {n} clients aujourd’hui, bravo !', '🏆 Objectif atteint, super dimanche !'],
    bPresque: ['👍 {n} clients, presque ! Dimanche prochain', '🙂 Pas loin de l’objectif, bon travail', '💪 Presque, on vise l’objectif la prochaine fois'],
    bPas: ['{n} clients seulement : on fera mieux la semaine prochaine', 'Dimanche calme, on vise plus haut', '📈 Objectif manqué, on se rattrape dimanche prochain']
  };
  function messageContainer(d){
    var obj = cfg.container, n = nbContainer(d._id), pct = Math.max(0, Math.min(100, obj ? n / obj * 100 : 0));
    var att = attendu(d, obj), reste = Math.max(0, obj - n), classe, liste;
    var nom = (d.nom || 'Container') + (d.dateDepart ? ' · ' + dateCourte(d.dateDepart) : '');
    if(n >= obj){ classe = 'd'; liste = PANEL.cAtteint; }
    else if(att === null){ classe = 'b'; liste = PANEL.cSans; }
    else if(n >= att + obj * 0.08){ classe = 'v'; liste = PANEL.cAvance; }
    else if(n >= att - obj * 0.05){ classe = 'b'; liste = PANEL.cTemps; }
    else { classe = 'o'; liste = PANEL.cRetard; }
    var txt = choisir(liste, 'c' + d._id + classe, { obj: obj, n: n, pl: pl(reste, 'client'), date: dateCourte(d.dateDepart) });
    return { cle: 'c' + d._id, icone: '🚛', nom: nom, n: n, obj: obj, pct: pct, repere: att === null ? null : (att / obj * 100), classe: classe, txt: txt };
  }
  function messageDimanche(){
    var obj = cfg.dimanche, aujIso = auj(), ref = null, refIso = '';
    var cols = (typeof collectes !== 'undefined' && Array.isArray(collectes)) ? collectes.filter(function(c){ return c && c.date; }) : [];
    // Le dimanche même : bilan de la collecte du jour (quel que soit son statut). Sinon : le prochain dimanche.
    var duJour = cols.filter(function(c){ return isoDeLibelle(c.date) === aujIso; })[0];
    if(duJour){ ref = duJour; refIso = aujIso; }
    else {
      var avenir = cols.filter(function(c){ var i = isoDeLibelle(c.date); return c.statut !== 'terminee' && i && i > aujIso; })
        .sort(function(a, b){ return isoDeLibelle(a.date).localeCompare(isoDeLibelle(b.date)); })[0];
      var enCours = cols.filter(function(c){ return c.statut === 'en_cours'; })[0];
      ref = avenir || enCours || null; refIso = ref ? isoDeLibelle(ref.date) : '';
    }
    var n = 0;
    if(ref){ try{ n += Object.keys((typeof clientsParCollecte !== 'undefined' && clientsParCollecte[ref.id]) || {}).length; }catch(e){} }
    // Collecte France du même dimanche (ou, à défaut de collecte classique, la France en cours / la prochaine)
    try{
      var fr = (window.franceData || {}), rs = fr.collectes || {}, cl = fr.clients || {}, rf = null;
      Object.keys(rs).forEach(function(k){
        var r = rs[k]; if(!r) return;
        if(refIso && r.dateIso === refIso){ rf = r; r._id = k; }
        else if(!refIso && !rf && (r.statut === 'en_cours' || (r.statut === 'a_venir' && r.dateIso >= aujIso))){ rf = r; r._id = k; }
      });
      if(rf){
        if(!refIso) refIso = rf.dateIso || '';
        if(typeof _frClientsDeCollecte === 'function') n += _frClientsDeCollecte(rf).length;
        else n += Object.keys(cl).filter(function(id){ return cl[id] && cl[id].collecteId === rf._id; }).length;
      }
    }catch(e){}
    if(!ref && !refIso) return null;
    var libelle = ref ? String(ref.date).replace(/\s+\d{4}\s*$/, '') : '';
    if(!libelle && refIso){ var p = refIso.split('-'); libelle = 'Dimanche ' + (+p[2]) + ' ' + MOIS[+p[1] - 1]; }
    var jr = jours(refIso) - jours(aujIso), bilan = (jr === 0);
    libelle += bilan ? ' · bilan' : (jr > 0 ? ' · ' + (jr === 1 ? 'demain' : 'dans ' + jr + ' jours') : '');
    var reste = Math.max(0, obj - n), pct = Math.max(0, Math.min(100, obj ? n / obj * 100 : 0)), classe, liste;
    if(bilan){
      if(n >= obj){ classe = 'd'; liste = PANEL.bBien; }
      else if(n >= obj * 0.75){ classe = 'b'; liste = PANEL.bPresque; }
      else { classe = 'o'; liste = PANEL.bPas; }
    } else if(n >= obj){ classe = 'd'; liste = n > obj ? PANEL.dDepasse : PANEL.dAtteint; }
    else if(n >= obj * 0.7){ classe = 'v'; liste = PANEL.dProche; }
    else if(n >= obj * 0.4){ classe = 'b'; liste = PANEL.dMoyen; }
    else { classe = 'o'; liste = PANEL.dBas; }
    var txt = choisir(liste, 'd' + refIso + classe, { n: n, obj: obj, reste: reste, plus: n - obj });
    return { cle: 'd' + refIso, icone: '📅', nom: libelle, n: n, obj: obj, pct: pct, repere: null, classe: classe, txt: txt };
  }
  function messages(){
    var l = containers().map(messageContainer), d = messageDimanche();
    if(d) l.push(d);
    return l;
  }

  /* ---------- affichage ---------- */
  var liste = [], idx = 0, minuteur = null, sig = '';
  function html(m, i){
    return '<div class="ob-m ' + m.classe + (i === 0 ? ' on' : '') + '"><div class="ob-l1"><span class="ob-tag">OBJECTIF</span><span class="ob-nom">' + m.icone + ' ' + esc(m.nom) + '</span>'
      + '<span class="ob-n">' + m.n + ' <i>/ ' + m.obj + '</i></span></div>'
      + '<div class="ob-bar"><i style="width:' + m.pct.toFixed(1) + '%"></i>' + (m.repere !== null && m.classe !== 'd' ? '<u style="left:calc(' + m.repere.toFixed(1) + '% - 1px)"></u>' : '') + '</div>'
      + '<div class="ob-l2">' + esc(m.txt) + '</div></div>';
  }
  function suivant(){
    var el = document.getElementById('ob-accueil'); if(!el || liste.length < 2) return;
    var a = document.querySelector('.screen.active');
    if(document.hidden || !a || a.id !== 's-espaces'){ minuteur = setTimeout(suivant, 1000); return; }
    idx = (idx + 1) % liste.length;
    [].forEach.call(el.querySelectorAll('.ob-m'), function(n, k){ n.classList.toggle('on', k === idx); });
    [].forEach.call(document.querySelectorAll('#ob-pt i'), function(n, k){ n.classList.toggle('on', k === idx); });
    el.classList.toggle('fin', liste[idx].classe === 'd');
    minuteur = setTimeout(suivant, DUREE);
  }
  function placer(){
    var contenu = document.querySelector('#s-espaces .content'); if(!contenu) return;
    var el = document.getElementById('ob-accueil'), pt = document.getElementById('ob-pt');
    if(!liste.length){ if(el) el.remove(); if(pt) pt.remove(); return; }
    if(!el) return;
    var bd = document.getElementById('bd-accueil');
    var apres = bd ? bd : null;
    var voulu = apres ? apres.nextElementSibling : contenu.firstElementChild;
    if(voulu !== el){ if(apres) apres.insertAdjacentElement('afterend', el); else contenu.insertBefore(el, contenu.firstChild); }
    if(pt && el.nextElementSibling !== pt) el.insertAdjacentElement('afterend', pt);
  }
  function dessiner(){
    var contenu = document.querySelector('#s-espaces .content'); if(!contenu) return;
    liste = messages();
    var s = liste.map(function(m){ return [m.cle, m.n, m.obj, m.classe, m.txt, m.repere === null ? '' : Math.round(m.repere)].join(':'); }).join('|') + '#' + cfg.container + '/' + cfg.dimanche;
    var el = document.getElementById('ob-accueil');
    if(!liste.length){ if(el) el.remove(); var p0 = document.getElementById('ob-pt'); if(p0) p0.remove(); sig = ''; if(minuteur){ clearTimeout(minuteur); minuteur = null; } return; }
    if(el && s === sig){ placer(); return; }
    var garde = (liste[idx] && el) ? idx : 0;
    sig = s;
    if(!el){ el = document.createElement('div'); el.id = 'ob-accueil'; el.setAttribute('role', 'status'); }
    if(idx >= liste.length) idx = 0;
    el.innerHTML = liste.map(html).join('');
    [].forEach.call(el.querySelectorAll('.ob-m'), function(n, k){ n.classList.toggle('on', k === idx); });
    el.classList.toggle('fin', liste[idx].classe === 'd');
    var pt = document.getElementById('ob-pt');
    if(liste.length > 1){
      if(!pt){ pt = document.createElement('div'); pt.id = 'ob-pt'; }
      pt.innerHTML = liste.map(function(m, k){ return '<i' + (k === idx ? ' class="on"' : '') + '></i>'; }).join('');
    } else if(pt){ pt.remove(); pt = null; }
    if(!el.parentNode) contenu.insertBefore(el, contenu.firstChild);
    placer();
    if(minuteur){ clearTimeout(minuteur); minuteur = null; }
    if(liste.length > 1) minuteur = setTimeout(suivant, DUREE);
  }
  function maj(){ try{ dessiner(); }catch(e){ console.error('objectifs', e); } try{ dessinerCl(); }catch(e){ console.error('classement', e); } }

  if(typeof window.depRenderEspaces === 'function'){
    var orig = window.depRenderEspaces;
    window.depRenderEspaces = function(){ var r = orig.apply(this, arguments); setTimeout(maj, 0); return r; };
  }
  if(typeof window.goTo === 'function'){
    var origGoTo = window.goTo;
    window.goTo = function(id){ var r = origGoTo.apply(this, arguments); if(id === 's-espaces') setTimeout(maj, 60); return r; };
  }
  // Les chiffres (clients enregistrés, collectes) changent sans prévenir : on vérifie régulièrement, on ne redessine que si quelque chose a changé.
  setInterval(function(){ var a = document.querySelector('.screen.active'); if(a && a.id === 's-espaces' && !document.hidden) maj(); }, 2000);
  // bandeau.js redessine sa bannière quand un message change : on se replace dessous.
  if(window.MutationObserver){
    var enCours = false;
    var cible = function(){ return document.querySelector('#s-espaces .content'); };
    var surveille = function(){
      var c = cible(); if(!c || c._obObs) return;
      c._obObs = true;
      new MutationObserver(function(){ if(enCours) return; enCours = true; try{ placer(); placerCl(); }catch(e){} enCours = false; }).observe(c, { childList: true });
    };
    setInterval(surveille, 3000); surveille();
  }

  /* ---------- classement des collaborateurs (2e bannière, sous les objectifs) ----------
     Cobey (08/11/2026) : « le nombre de clients que chaque collaborateur a ramené par conteneur, du premier dimanche de ramasse
     jusqu'au dernier, et le nombre d'euros, en faisant un classement » ; « une case par collaborateur, avec sa photo, le nombre de
     clients, les euros et un petit mot selon sa situation » ; « moi, tu me mets pas, tout le monde y compris Aminata » ;
     « le prix facturé : au final ce sera le prix encaissé ».
     Ramené par = auteur de la fiche (c.by, ou c.creePar côté France). Euros = prix du colis des fiches du container
     (collecte + dépôt direct + France, sans les fiches fusionnées). Les profils administrateurs ne figurent pas au classement. */
  var PANEL_CL = {
    tete: ['👑 En tête du container, bravo !', '🥇 La première place, bien joué !', '🔥 Le meilleur du container, continue !', '🏆 Au sommet du classement !'],
    belle: ['🔥 Belle place, continue comme ça', '👏 Très bon travail, accroche-toi', '💪 Dans le trio de tête, bravo !', '🚀 Bonne dynamique, ça tient !'],
    moyen: ['💪 Bien parti, on peut faire mieux', '🙂 Bon début, il faut en ramener plus', '📈 Continue, tu peux monter', '👍 Pas mal, un petit effort !'],
    faible: ['📣 Il faut en ramener plus', '⏳ Pas assez pour l’instant, on s’y met', '🎯 Tu peux faire bien mieux, allez !', '💬 Appelle tes contacts, ça peut décoller'],
    zero: ['📣 Aucun client : à toi de jouer !', '🚀 C’est le moment de commencer !', '☎️ Zéro pour l’instant, on y va !', '🌱 Premier client à trouver !']
  };
  function eurosFr(n){ var r = Math.round(n * 100) / 100, t = String(r).split('.'); t[0] = t[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' '); return t.join(',') + ' €'; }
  function rangLib(i, medaille){ var m = medaille ? ['🥇 ', '🥈 ', '🥉 '][i] || '' : ''; return m + (i === 0 ? '1er' : (i + 1) + 'e'); }
  function collabsClassement(){
    return (window.COLLABS || []).filter(function(c){ return c && !c.admin; });
  }
  function auteurDe(c, liste){
    var v = String((c && (c.by || c.creePar)) || '');
    if(!v) return null;
    for(var i = 0; i < liste.length; i++){ if(liste[i].id === v || liste[i].name === v) return liste[i]; }
    return null;
  }
  function slidesClassement(){
    var out = [], liste = collabsClassement();
    if(!liste.length || typeof window._depToutesLesFiches !== 'function') return out;
    var fiches = window._depToutesLesFiches();
    containers().forEach(function(d){
      var tot = {}; liste.forEach(function(co){ tot[co.id] = { co: co, n: 0, eu: 0 }; });
      var nb = 0;
      fiches.forEach(function(x){
        var c = x.c; if(!c || c.departId !== d._id) return;
        try{ if(typeof window._depEstFusionnee === 'function' && window._depEstFusionnee(c)) return; }catch(e){}
        nb++;
        var co = auteurDe(c, liste); if(!co) return;
        tot[co.id].n++; tot[co.id].eu += parseFloat(c.prix) || 0;
      });
      if(!nb) return;
      var rang = liste.map(function(co){ return tot[co.id]; }).sort(function(a, b){ return (b.eu - a.eu) || (b.n - a.n) || a.co.name.localeCompare(b.co.name); });
      var chef = rang[0].eu, nomC = String(d.nom || 'Container').replace(/^Chargement\s+/i, '') + (d.dateDepart ? ' · ' + dateCourte(d.dateDepart) : '');
      rang.forEach(function(r, i){
        var ratio = chef > 0 ? r.eu / chef : 0, classe, famille;
        if(r.eu <= 0 && r.n === 0){ classe = 'o'; famille = 'zero'; }
        else if(i === 0 || r.eu >= chef){ classe = 'd'; famille = 'tete'; }
        else if(i <= 2){ classe = 'v'; famille = 'belle'; }
        else if(ratio >= 0.4){ classe = 'b'; famille = 'moyen'; }
        else { classe = 'o'; famille = 'faible'; }
        out.push({ cle: 'k' + d._id + r.co.id, id: r.co.id, nom: r.co.name, rang: rangLib(i, r.eu > 0) + ' sur ' + rang.length, n: r.n, eu: r.eu,
          pct: chef > 0 ? Math.max(0, Math.min(100, r.eu / chef * 100)) : 0, classe: classe, container: nomC,
          txt: choisir(PANEL_CL[famille], 'k' + d._id + r.co.id + famille, {}) });
      });
    });
    return out;
  }
  function htmlCl(m, i){
    var av = (window.photosProfil && window.photosProfil.avatar) ? window.photosProfil.avatar(m.id, 28) : '';
    return '<div class="ob-m ' + m.classe + (i === 0 ? ' on' : '') + '"><div class="ob-l1">' + av + '<span class="cl-nom">' + esc(m.nom) + '</span><span class="cl-rk">' + esc(m.rang) + '</span>'
      + '<span class="cl-n">' + m.n + ' client' + (m.n > 1 ? 's' : '') + ' · <b>' + eurosFr(m.eu) + '</b></span></div>'
      + '<div class="ob-bar"><i style="width:' + m.pct.toFixed(1) + '%"></i></div>'
      + '<div class="ob-l2 cl-l2"><span>' + esc(m.txt) + '</span><small>' + esc(m.container) + '</small></div></div>';
  }
  var listeCl = [], idxCl = 0, minuteurCl = null, sigCl = '';
  function suivantCl(){
    var el = document.getElementById('cl-accueil'); if(!el || listeCl.length < 2) return;
    var a = document.querySelector('.screen.active');
    if(document.hidden || !a || a.id !== 's-espaces'){ minuteurCl = setTimeout(suivantCl, 1000); return; }
    idxCl = (idxCl + 1) % listeCl.length;
    [].forEach.call(el.querySelectorAll('.ob-m'), function(n, k){ n.classList.toggle('on', k === idxCl); });
    [].forEach.call(document.querySelectorAll('#cl-pt i'), function(n, k){ n.classList.toggle('on', k === idxCl); });
    minuteurCl = setTimeout(suivantCl, DUREE);
  }
  function placerCl(){
    var contenu = document.querySelector('#s-espaces .content'); if(!contenu) return;
    var el = document.getElementById('cl-accueil'), pt = document.getElementById('cl-pt');
    if(!listeCl.length){ if(el) el.remove(); if(pt) pt.remove(); return; }
    if(!el) return;
    var ancre = document.getElementById('ob-pt') || document.getElementById('ob-accueil') || document.getElementById('bd-accueil');
    if(ancre){ if(ancre.nextElementSibling !== el) ancre.insertAdjacentElement('afterend', el); }
    else if(el.parentNode !== contenu) contenu.insertBefore(el, contenu.firstChild);
    if(pt && el.nextElementSibling !== pt) el.insertAdjacentElement('afterend', pt);
  }
  function dessinerCl(){
    var contenu = document.querySelector('#s-espaces .content'); if(!contenu) return;
    listeCl = slidesClassement();
    var el = document.getElementById('cl-accueil');
    if(!listeCl.length){ if(el) el.remove(); var p0 = document.getElementById('cl-pt'); if(p0) p0.remove(); sigCl = ''; if(minuteurCl){ clearTimeout(minuteurCl); minuteurCl = null; } return; }
    var s2 = listeCl.map(function(m){ return [m.cle, m.n, Math.round(m.eu), m.classe, m.txt, m.rang].join(':'); }).join('|');
    if(el && s2 === sigCl){ placerCl(); return; }
    sigCl = s2;
    if(!el){ el = document.createElement('div'); el.id = 'cl-accueil'; el.setAttribute('role', 'status'); }
    if(idxCl >= listeCl.length) idxCl = 0;
    el.innerHTML = listeCl.map(htmlCl).join('');
    [].forEach.call(el.querySelectorAll('.ob-m'), function(n, k){ n.classList.toggle('on', k === idxCl); });
    var pt = document.getElementById('cl-pt');
    if(listeCl.length > 1){
      if(!pt){ pt = document.createElement('div'); pt.id = 'cl-pt'; }
      pt.innerHTML = listeCl.map(function(m, k){ return '<i' + (k === idxCl ? ' class="on"' : '') + '></i>'; }).join('');
    } else if(pt){ pt.remove(); }
    if(!el.parentNode) contenu.insertBefore(el, contenu.firstChild);
    placerCl();
    if(minuteurCl){ clearTimeout(minuteurCl); minuteurCl = null; }
    if(listeCl.length > 1) minuteurCl = setTimeout(suivantCl, DUREE + 1500);
  }

  /* ---------- lecture des chiffres dans Firebase ---------- */
  var ecoute = false;
  function ecouter(){
    if(ecoute || !window.db || !window.firebaseReady) return;
    ecoute = true;
    try{
      db.ref('dct_config/objectifs').on('value', function(snap){
        var v = snap.val();
        if(v && typeof v === 'object'){
          cfg = { container: Math.max(1, parseInt(v.container, 10) || DEFAUT.container), dimanche: Math.max(1, parseInt(v.dimanche, 10) || DEFAUT.dimanche) };
          try{ localStorage.setItem('dct_objectifs_cache', JSON.stringify(cfg)); }catch(e){}
        }
        maj();
        var sec = document.getElementById('admin-section-objectifs');
        if(sec && sec.style.display !== 'none' && !document.getElementById('ob-champ-c')) window.objectifsRenderReglage();
        var sub = document.getElementById('dep-regl-sub-objectifs'); if(sub) sub.textContent = cfg.container + ' par container · ' + cfg.dimanche + ' par dimanche';
      }, function(e){ console.error('objectifs : lecture', e); });
    }catch(e){ console.error('objectifs', e); }
  }
  if(typeof window._demarrerEcoutesApresPin === 'function'){
    var origApres = window._demarrerEcoutesApresPin;
    window._demarrerEcoutesApresPin = function(){ var r = origApres.apply(this, arguments); ecouter(); return r; };
  }

  /* ---------- Réglages > OBJECTIFS (Eric) ---------- */
  window.objectifsRenderReglage = function(){
    var sec = document.getElementById('admin-section-objectifs'); if(!sec) return;
    sec.innerHTML = '<div class="ob-reg"><h3>Objectifs de l’accueil</h3>'
      + '<p>La bannière « Objectif » sous les messages, à l’accueil de toute l’équipe, compare le nombre de clients à ces deux objectifs. Le container suivi est celui qui est « en préparation » ; il compte tous ses clients (collecte, dépôt direct, France).</p>'
      + '<label for="ob-champ-c">Clients par container</label><input type="number" inputmode="numeric" min="1" id="ob-champ-c" value="' + cfg.container + '">'
      + '<label for="ob-champ-d">Clients par dimanche</label><input type="number" inputmode="numeric" min="1" id="ob-champ-d" value="' + cfg.dimanche + '">'
      + '<button type="button" class="ob-ok" id="ob-enregistrer">Enregistrer</button></div>';
  };
  document.addEventListener('click', function(e){
    var t = e.target.closest ? e.target.closest('#ob-enregistrer') : null; if(!t) return;
    var c = Math.max(1, parseInt((document.getElementById('ob-champ-c') || {}).value, 10) || 0);
    var d = Math.max(1, parseInt((document.getElementById('ob-champ-d') || {}).value, 10) || 0);
    if(!c || !d){ try{ showToastNew('⚠️ Écris deux nombres.'); }catch(x){} return; }
    if(!window.db || !window.firebaseReady){ try{ showToastNew('❌ Connexion indisponible.'); }catch(x){} return; }
    Promise.resolve(db.ref('dct_config/objectifs').set({ container: c, dimanche: d, ts: Date.now() })).then(function(){
      cfg = { container: c, dimanche: d };
      try{ if(typeof _tracerReglage === 'function') _tracerReglage('🎯', 'a réglé les objectifs : <strong>' + c + '</strong> clients par container, <strong>' + d + '</strong> par dimanche'); }catch(x){}
      try{ showToastNew('✅ Objectifs enregistrés'); }catch(x){}
      maj();
    }).catch(function(err){ try{ showToastNew('❌ Échec : ' + ((err && err.message) || 'écriture refusée')); }catch(x){} });
  });
  window.objectifs = { afficher: maj, messages: messages, classement: slidesClassement, config: function(){ return cfg; } };
})();
