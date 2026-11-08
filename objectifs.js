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
  var DUREE = 7000, DUREE_CL = 9000;   // temps d'affichage d'une case (objectifs / classement)
  var DEFAUT = { container: 100, dimanche: 20 };
  // Objectif de chaque collaborateur (clients par container), réglable dans Réglages > OBJECTIFS. Issyaka et Abdoulaye : numéros dans les
  // publicités depuis le début ; Aminata : arrivée en octobre 2026 ; les autres : petit objectif de départ pour se faire un carnet d'adresses.
  var PERSO_DEFAUT = { IS: 30, AB: 30, AM: 25, SA: 5, IB: 5, BO: 5 };
  var cfg = { container: DEFAUT.container, dimanche: DEFAUT.dimanche, perso: {} };
  try{ var c0 = JSON.parse(localStorage.getItem('dct_objectifs_cache') || 'null'); if(c0 && c0.container){ cfg = c0; if(!cfg.perso) cfg.perso = {}; } }catch(e){}
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
      + '#cl-pt{margin-top:-8px}'
      + '#cl-accueil .ob-l1{min-height:30px}'
      + '#cl-accueil .cl-md{flex:none;width:30px;text-align:center;font-size:27px;line-height:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,.25))}'
      + '#cl-accueil .cl-md.num{width:26px;height:26px;margin:0 2px;border-radius:50%;background:rgba(0,0,0,.12);font-size:13px;font-weight:800;line-height:26px;color:#445;filter:none}'
      + '#cl-accueil .cl-rk{font-size:12px !important;font-weight:800 !important;color:#334 !important}'
      + '#cl-accueil .ob-m.cg{background:linear-gradient(135deg,rgba(245,197,66,.5),rgba(245,197,66,.16))}#cl-accueil .ob-m.cg .ob-bar i{background:linear-gradient(90deg,#f5c542,#e0a010)}#cl-accueil .ob-m.cg .ob-l2{color:#8a5a00}'
      + '#cl-accueil .ob-m.cs{background:linear-gradient(135deg,rgba(120,135,155,.34),rgba(120,135,155,.1))}#cl-accueil .ob-m.cs .ob-bar i{background:linear-gradient(90deg,#9aabc0,#5d6f86)}#cl-accueil .ob-m.cs .ob-l2{color:#3f4d60}'
      + '#cl-accueil .ob-m.cz{background:linear-gradient(135deg,rgba(176,112,64,.36),rgba(176,112,64,.1))}#cl-accueil .ob-m.cz .ob-bar i{background:linear-gradient(90deg,#d08f5a,#8f5424)}#cl-accueil .ob-m.cz .ob-l2{color:#7a431a}'
      + '#cl-accueil .ob-m.cm{background:linear-gradient(135deg,rgba(122,92,240,.28),rgba(122,92,240,.08))}#cl-accueil .ob-m.cm .ob-bar i{background:linear-gradient(90deg,#8b6cf0,#5a3fc4)}#cl-accueil .ob-m.cm .ob-l2{color:#4b2fa8}'
      + '#cl-accueil .ob-m.cr{background:linear-gradient(135deg,rgba(232,90,140,.3),rgba(232,90,140,.09))}#cl-accueil .ob-m.cr .ob-bar i{background:linear-gradient(90deg,#ee6a9b,#c93a72)}#cl-accueil .ob-m.cr .ob-l2{color:#a3235a}'
      + '#cl-accueil .ob-m.cn{background:linear-gradient(135deg,rgba(100,110,120,.24),rgba(100,110,120,.07))}#cl-accueil .ob-m.cn .ob-bar i{background:linear-gradient(90deg,#8a949e,#5c6670)}#cl-accueil .ob-m.cn .ob-l2{color:#44505a}';
    st.textContent += '.ob-l2 .ob-t{display:inline-block;white-space:nowrap;font-style:normal}'
      + '.ob-l2.ob-mq,.cl-l2 span.ob-mq{text-overflow:clip !important}'
      + '.ob-mq .ob-t{animation:obMq var(--dur,6s) ease-in-out infinite alternate}'
      + '@keyframes obMq{0%,20%{transform:translateX(0)}80%,100%{transform:translateX(var(--dx,0px))}}';
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
  // Les phrases : plusieurs dizaines par situation ; à chaque passage de la case, on tire une phrase différente de celle d'avant (jamais deux fois la même d'affilée).
  function formater(t, vars){ return t.replace(/\{(\w+)\}/g, function(m, k){ return vars[k] != null ? vars[k] : m; }); }
  function candidats(liste, vars){ return liste.map(function(t){ return formater(t, vars); }); }
  function tirer(fam, exclure){
    var c = fam.length > 1 ? fam.filter(function(t){ return t !== exclure; }) : fam;
    return c[Math.floor(Math.random() * c.length)];
  }
  // Cobey : « je veux pas que ça change à chaque passage ; je veux que ça change quand les chiffres évoluent ». La phrase est choisie à
  // partir des chiffres (même phrase pour tout le monde tant que rien ne bouge) ; quand ils changent, on en prend une autre que la précédente.
  function phraseStable(cle, sigChiffres, fam){
    var cleLs = 'dct_phr_' + cle, st = null;
    try{ st = JSON.parse(localStorage.getItem(cleLs) || 'null'); }catch(e){}
    if(st && st.sig === sigChiffres && fam.indexOf(st.txt) >= 0) return st.txt;
    var i = hash(cle + '|' + sigChiffres) % fam.length, t = fam[i];
    if(st && st.txt === t && fam.length > 1) t = fam[(i + 1) % fam.length];
    try{ localStorage.setItem(cleLs, JSON.stringify({ sig: sigChiffres, txt: t })); }catch(e){}
    return t;
  }
  var PANEL = {
    cAtteint: ['🎉 {obj} clients, bravo l’équipe !', '🏆 Container plein, on peut être fiers', '🎉 Objectif rempli, le reste est du bonus', '💪 {obj} clients : mission accomplie !', '🥳 Le container est complet, bravo !', '👏 Objectif atteint, quelle équipe !', '🔥 On l’a fait : {obj} clients !', '🚛 Plein de clients, le camion est content', '✅ Objectif validé, merci à tous', '🌟 Du grand travail, l’équipe !', '🎯 En plein dans le mille : {obj} !', '🙌 Bravo à tous, c’est rempli', '🏅 Container bouclé, félicitations', '😎 Objectif atteint, on souffle un peu', '💥 Cent pour cent, bien joué !', '🍾 On fête ça : container complet !'],
    cAvance: ['🔥 En avance — il reste {pl}', '🚀 Beau rythme : {n} déjà !', '🔥 L’équipe assure, encore {pl}', '😎 On prend de l’avance, continuez', '🏃 On court plus vite que prévu !', '💪 Super rythme, plus que {pl}', '👏 Devant le planning, bravo !', '⚡ Ça file : {n} clients déjà', '🌟 Belle avance, ne ralentissez pas', '🚀 Cap sur le container plein !', '😄 Mieux que prévu, continuez ainsi', '📈 Courbe au-dessus de l’objectif', '🔝 On est devant, gardons ça', '🎯 Presque là : encore {pl}', '🙌 Excellente cadence, l’équipe', '💥 {n} clients, et ça continue !'],
    cTemps: ['👍 Bon rythme — il reste {pl}', '✅ Dans les temps, ne lâchez rien', '👍 Ça avance bien, encore {pl}', '🙂 On garde ce cap : {pl} à trouver', '🧭 Pile dans le planning, continuez', '👌 Rythme régulier, c’est parfait', '💬 Encore {pl}, on est dans la course', '🚛 Le container se remplit bien', '📅 On suit le planning, bravo', '🙂 Tout va bien, encore un effort', '🔄 Cadence tenue, ne relâchez pas', '⏱️ À l’heure, il reste {pl}', '🤝 Bon travail d’équipe, on continue', '👏 Ça se passe comme prévu', '🎯 {pl} et c’est complet', '🌿 Sans stress, on avance bien'],
    cRetard: ['⏳ Il faut accélérer — {pl} avant le {date}', '📣 Un coup de collier : {pl} à trouver', '⏳ Un peu de retard, on s’y met !', '💥 Allez, {pl} avant le {date}', '📞 Appelez vos contacts, il en manque', '🚨 On est en retard, on accélère', '⏰ Le {date} approche : {pl} à trouver', '💪 On peut rattraper, il suffit de s’y mettre', '🔔 Il faut relancer les contacts !', '🏃 On accélère : {pl} avant le {date}', '📈 Un effort collectif et c’est rattrapé', '🧩 Il manque {pl}, cherchons ensemble', '🔥 Tous ensemble pour rattraper le retard', '📣 Pensez à vos proches : {pl} à trouver', '⚠️ Retard à rattraper avant le {date}', '☎️ Un coup de fil, un client de plus !'],
    cSans: ['Il reste {pl} à trouver', 'Encore {pl} pour remplir le container', '{pl} à trouver, on y va', 'Objectif : {pl} de plus', '📣 Il manque {pl} pour le container', '🎯 {pl} et c’est complet', '🚛 Remplissons le container : {pl} à trouver', '💪 {pl} à aller chercher'],
    dAtteint: ['🎯 Objectif atteint, bravo !', '🎉 Objectif rempli, bien joué', '💪 On y est : objectif atteint !', '🏆 Dimanche réussi : objectif atteint', '👏 Pile à l’objectif, félicitations', '✅ Objectif validé pour ce dimanche', '🙌 L’équipe a tenu son objectif !', '🔥 Objectif en poche, bravo'],
    dDepasse: ['🎯 Objectif dépassé de {plus} !', '🔥 +{plus} au-dessus de l’objectif', '🏆 Dépassé de {plus}, bravo !', '🚀 {plus} de plus que l’objectif !', '👏 Au-delà de l’objectif : +{plus}', '💥 L’objectif explosé de {plus} !', '🌟 Dépassement de {plus}, quelle équipe', '🎉 +{plus} : on voit grand !', '💪 Mieux que prévu de {plus}', '🥳 Objectif battu de {plus} !'],
    dProche: ['Encore {reste} pour atteindre l’objectif', 'Presque ! Plus que {reste}', '👀 Il manque seulement {reste}', '🔥 Plus que {reste}, on y est presque', '🏁 Ligne d’arrivée en vue : {reste}', '💪 {reste} et l’objectif est tenu', '😮 Si près du but : encore {reste}', '⚡ Un dernier effort : {reste}', '🎯 À {reste} de l’objectif', '👏 Belle avance, plus que {reste}', '📞 Encore {reste} et c’est gagné', '🚀 On touche au but, {reste} !'],
    dMoyen: ['Courage, {reste} de plus pour l’objectif', 'On avance : encore {reste} à trouver', '💬 {reste} de plus et c’est bon', '💪 La moitié est faite, encore {reste}', '📈 Ça monte, il reste {reste}', '🙂 Bon début, {reste} à aller chercher', '☎️ Encore {reste} à trouver, appelez !', '🧭 À mi-chemin : encore {reste}', '🤝 Ensemble, encore {reste}', '⏳ Il reste du temps, {reste} à trouver', '🔔 Relancez vos contacts : {reste}', '🌱 Ça pousse, encore {reste}'],
    dBas: ['Il en manque {reste} : on s’y met !', '📞 Il faut en trouver {reste}, allez !', '⏳ Encore {reste} à chercher, on s’y met', '🚨 {reste} à trouver pour cet objectif', '📣 Il manque {reste} : tous au téléphone', '💪 On peut y arriver : {reste} à trouver', '🏃 On accélère : {reste} à aller chercher', '☎️ Un appel, un client : {reste} à trouver', '🔔 Le dimanche approche : encore {reste}', '🧩 {reste} à compléter, cherchons', '🔥 Mobilisation : {reste} à trouver', '📅 Il reste {reste} à ajouter, on s’y met'],
    bBien: ['🎯 Dépassé de {plus}, belle journée !', '🎉 {n} clients aujourd’hui, bravo !', '🏆 Objectif atteint, super dimanche !', '👏 Très belle journée : {n} clients', '🔥 Objectif tenu, bravo à tous', '🥳 Dimanche réussi, {n} clients !', '💪 Du solide aujourd’hui : {n} clients', '🌟 Belle journée, l’équipe a assuré', '✅ Objectif atteint, merci à tous', '🚀 {n} clients : un très bon dimanche', '🙌 Bravo, dimanche au top', '🍾 Journée gagnée, félicitations'],
    bPresque: ['👍 {n} clients, presque ! Dimanche prochain', '🙂 Pas loin de l’objectif, bon travail', '💪 Presque, on vise l’objectif la prochaine fois', '👏 Bonne journée, très proche du but', '😮 Il s’en est fallu de peu, bravo', '📈 {n} clients : encore un peu et c’était bon', '🎯 Si près de l’objectif, bien joué', '🔥 Beau dimanche, on fera encore mieux', '🤝 Belle équipe, presque au but', '🙂 Un petit effort de plus dimanche prochain', '💬 Presque réussi, on y retourne', '👌 Bon dimanche, l’objectif est proche'],
    bPas: ['{n} clients : on fera mieux dimanche prochain', 'Dimanche calme, on vise plus haut', '📈 Objectif manqué, on se rattrape dimanche prochain', '🙂 Pas cette fois, la semaine prochaine sera la bonne', '💪 On se relève : dimanche prochain, on y va', '📣 Dimanche difficile, on remobilise tout le monde', '☎️ Relançons les contacts pour dimanche prochain', '🌱 Un dimanche calme, on repart de plus belle', '🔔 Objectif non atteint : on s’organise pour la suite', '🤝 On fera mieux ensemble dimanche prochain', '🧭 Ce n’est pas grave, on ajuste et on repart', '⏭️ Page tournée, cap sur dimanche prochain']
  };
  // Phrase plus longue que la case : elle défile doucement de gauche à droite (aller-retour), comme ailleurs dans l'appli.
  function defiler(slide){
    try{
      var l2 = slide && (slide.querySelector('.cl-l2 span') || slide.querySelector('.ob-l2')); if(!l2) return;
      var t = l2.querySelector('.ob-t'); if(!t) return;
      l2.classList.remove('ob-mq');
      var diff = t.offsetWidth - l2.clientWidth;
      if(diff > 2){ l2.style.setProperty('--dx', (-diff - 6) + 'px'); l2.style.setProperty('--dur', Math.max(4, diff / 22 + 3) + 's'); l2.classList.add('ob-mq'); }
    }catch(e){}
  }
  function messageContainer(d){
    var obj = cfg.container, n = nbContainer(d._id), pct = Math.max(0, Math.min(100, obj ? n / obj * 100 : 0));
    var att = attendu(d, obj), reste = Math.max(0, obj - n), classe, liste;
    var nom = (d.nom || 'Container') + (d.dateDepart ? ' · ' + dateCourte(d.dateDepart) : '');
    if(n >= obj){ classe = 'd'; liste = PANEL.cAtteint; }
    else if(att === null){ classe = 'b'; liste = PANEL.cSans; }
    else if(n >= att + obj * 0.08){ classe = 'v'; liste = PANEL.cAvance; }
    else if(n >= att - obj * 0.05){ classe = 'b'; liste = PANEL.cTemps; }
    else { classe = 'o'; liste = PANEL.cRetard; }
    var fam = candidats(liste, { obj: obj, n: n, pl: pl(reste, 'client'), date: dateCourte(d.dateDepart) }), txt = phraseStable('c' + d._id, n + ':' + classe, fam);
    return { cle: 'c' + d._id, fk: 'c' + classe + (att === null ? 'x' : ''), fam: fam, icone: '🚛', nom: nom, n: n, obj: obj, pct: pct, repere: att === null ? null : (att / obj * 100), classe: classe, txt: txt };
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
    var fam = candidats(liste, { n: n, obj: obj, reste: reste, plus: n - obj }), txt = phraseStable('d' + refIso, n + ':' + classe + (bilan ? 'b' : ''), fam);
    return { cle: 'd' + refIso, fk: (bilan ? 'b' : 'd') + classe + (n > obj ? '+' : ''), fam: fam, icone: '📅', nom: libelle, n: n, obj: obj, pct: pct, repere: null, classe: classe, txt: txt };
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
      + '<div class="ob-l2"><i class="ob-t">' + esc(m.txt) + '</i></div></div>';
  }
  function suivant(){
    var el = document.getElementById('ob-accueil'); if(!el || liste.length < 1) return;
    var a = document.querySelector('.screen.active');
    if(document.hidden || !a || a.id !== 's-espaces'){ minuteur = setTimeout(suivant, 1000); return; }
    idx = (idx + 1) % liste.length;
    [].forEach.call(el.querySelectorAll('.ob-m'), function(n, k){ n.classList.toggle('on', k === idx); if(k === idx) defiler(n); });
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
    var s = liste.map(function(m){ return [m.cle, m.n, m.obj, m.classe, m.fk, m.repere === null ? '' : Math.round(m.repere)].join(':'); }).join('|') + '#' + cfg.container + '/' + cfg.dimanche;
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
    minuteur = setTimeout(suivant, DUREE);
    setTimeout(function(){ defiler(el.querySelector('.ob-m.on')); }, 120);
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
    teteLarge: ['👑 En tête, personne ne te rattrape !', '🥇 Première place, avec une belle avance', '🔥 Tu domines le classement, bravo !', '🏆 Au sommet, très loin devant', '🚀 Cap sur le haut du podium, bravo', '💪 Avance confortable : +{ecart}', '👏 Du très grand travail, chef de file', '⭐ Le meilleur du container, tout simplement', '🎯 Tu as de l’avance, garde le rythme', '🥳 Première place, félicitations', '😎 En tête et bien devant', '🌟 Un modèle pour l’équipe, bravo', '🔝 Numéro un, et avec la manière', '🏅 Tu mènes la danse, continue', '🦁 Le roi du container !', '✨ Dominant, bravo à toi'],
    teteJuste: ['👑 En tête, mais ça se joue de près !', '🥇 Première place de peu, ne lâche rien', '⚔️ Tu es premier d’un souffle, accroche-toi', '🔥 Ça se joue à {ecart}, reste devant', '😮 Les autres sont tout près, attention', '🏆 En tête, mais la course est serrée', '💪 Garde ta place, ça tient à peu', '🎯 Premier de justesse, bravo', '⏱️ Le podium se joue à rien, continue', '🥇 Devant, mais ne ralentis pas !', '👀 Derrière toi, ça pousse fort', '🚀 Premier, mais il faut tenir', '🔔 Course serrée en tête, ne lâche pas', '🌶️ Ça chauffe en haut du classement', '🧗 Tiens bon, la première place est à toi', '⚡ Premier à un cheveu, bravo'],
    belleProche: ['🔥 Belle place, le premier est tout proche', '🥈 Tu talonnes la tête, allez !', '💪 Un petit effort et tu passes devant', '🚀 À {ecart} du premier, fonce !', '👏 Très bon travail, la tête est proche', '🎯 Tu es au contact de la tête', '😮 Si près du sommet, ne lâche rien', '⚡ Un client de plus et ça se joue !', '🏃 Tu reviens sur le premier, continue', '🔝 Dans le trio de tête et proche du but', '🤩 Belle remontée, le podium est à toi', '🧗 Tu grimpes, la tête est à portée', '🔥 Ça va vite pour toi, bravo', '💬 À {ecart} de la première place', '🥉 Bien placé, tu peux encore monter', '🌟 Très belle dynamique, continue'],
    belleLoin: ['👏 Belle place, continue comme ça', '🔥 Dans le trio de tête, bravo !', '💪 Très bon travail, on vise plus haut', '🚀 Bonne dynamique, ça tient !', '🙂 Bien placé, il reste de la marge', '🎯 Tu es sur le podium, bravo', '📈 Beau score, tu peux encore monter', '👍 Solide, à {ecart} de la tête', '🌟 Bravo, ta place est méritée', '🧭 Sur le podium, garde le cap', '💬 Bonne place, le premier est à {ecart}', '😊 Du bon travail, continue', '🏅 Dans les meilleurs, félicitations', '🔥 Beau parcours, ne relâche pas', '🥈 Une belle place, on vise le haut', '⭐ Du très bon, encore un effort'],
    moyen: ['💪 Bien parti, on peut faire mieux', '🙂 Bon début, il faut en ramener plus', '📈 Continue, tu peux monter', '👍 Pas mal, un petit effort !', '🧭 Milieu de classement, vise plus haut', '🎯 Tu peux monter, il suffit de continuer', '🔥 Ça avance, encore quelques clients', '☎️ Un coup de fil de plus, ça change tout', '🌱 Ça pousse, continue', '💬 À {ecart} du premier, c’est jouable', '🏃 Tu es dans la course, accélère', '🤝 Bonne base, il faut ajouter des clients', '🔔 Relance tes contacts, ça va monter', '😊 Du travail correct, on peut viser plus', '🚀 Encore un effort et tu passes devant', '📣 Tu progresses, continue ainsi'],
    faible: ['📣 Il faut en ramener plus', '⏳ Pas assez pour l’instant, on s’y met', '🎯 Tu peux faire bien mieux, allez !', '💬 Appelle tes contacts, ça peut décoller', '☎️ Un coup de fil, un client : go !', '🔔 Il est temps de relancer tes contacts', '💪 Tu as de la marge, on s’y met', '🌱 Un début, il faut en faire plus', '🏃 Accélère, le classement t’attend', '🧩 Il manque des clients, cherche autour de toi', '📈 Tu peux remonter vite, motive-toi', '🚨 En bas du classement, mais ça se rattrape', '😤 C’est le moment de s’y mettre !', '🤝 Demande à tes proches, ça marche', '🔥 Un bon dimanche et tout change', '⚡ Ne lâche rien, un client à la fois'],
    zero: ['📣 Aucun client : à toi de jouer !', '🚀 C’est le moment de commencer !', '☎️ Zéro pour l’instant, on y va !', '🌱 Premier client à trouver !', '🎯 Le compteur est à zéro, lance-toi', '🔔 Il est temps d’appeler tes contacts', '💪 Tout est à faire, tu peux le faire', '🏁 Le départ est donné, à toi !', '😊 Pas encore de client, ça va venir', '📞 Un appel et le compteur démarre', '🤝 Parle de DCT autour de toi', '🧭 Cherche ton premier client aujourd’hui', '⏳ Il est encore temps de démarrer', '🔥 Premier client, premier pas', '🌟 Le classement t’attend, lance-toi', '⚡ Zéro, mais ça se corrige vite']
  };

  PANEL_CL.objAtteint = ['🎯 Objectif perso atteint : {n} clients !', '🏆 {n} sur {obj} : objectif rempli, bravo !', '🔥 Objectif tenu, tu peux être fier', '👏 Mission accomplie : {n} clients', '🥳 Objectif atteint, quelle performance !', '💪 Tu as rempli ton objectif, bravo', '🌟 {obj} atteints, du beau travail', '✅ Objectif validé, félicitations', '🍾 Objectif atteint, on lève son verre', '😎 Objectif en poche, bravo', '🎉 Ton objectif est atteint !', '🏅 {n} clients : objectif réussi', '🙌 Bravo, objectif rempli'];
  PANEL_CL.debZero = ['📒 Ton carnet d’adresses est ton meilleur atout', '👨‍👩‍👧 Pense à ta famille et à tes voisins', '☎️ Appelle tes contacts : un client suffit', '🌱 Un premier client et tu es lancé !', '📞 Parle de DCT à dix personnes aujourd’hui', '🤝 Chaque contact peut devenir un client', '🗒️ Note ceux qui envoient des colis au pays', '💬 Demande autour de toi, ça marche', '🎯 Objectif {obj} : commence par un seul', '🚀 Lance-toi, le premier est le plus dur', '📲 Partage les numéros DCT à tes proches', '🌟 Construis ton carnet, un contact à la fois', '🏁 Le départ est donné, à toi de jouer', '👋 Pense à ceux qui ont de la famille au pays'];
  PANEL_CL.debEnCours = ['🔥 {n} sur {obj} : bien parti, continue !', '🌱 Ton carnet commence à servir, bravo', '👏 Déjà {n} : encore {reste} pour l’objectif', '💪 Beau début, ça se remplit', '📒 Continue d’enrichir ton carnet d’adresses', '🚀 {n} clients, tu es lancé !', '🎯 Encore {reste} et ton objectif est atteint', '🙂 Bravo pour ce début, ne t’arrête pas', '📞 Un coup de fil de plus et ça monte', '🤝 Tes contacts commencent à répondre', '😊 {n} sur {obj}, tu progresses', '🔝 Bon début, vise {obj} !'];
  PANEL_CL.debAtteint = ['🎉 Objectif atteint : {n} clients, bravo !', '🏆 Ton carnet d’adresses a porté ses fruits', '👏 Tu as réussi : {n} sur {obj} !', '🥳 Premier objectif rempli, félicitations', '🌟 Beau travail, tu peux viser plus haut', '🔥 Objectif atteint, on monte la barre ?', '💪 {n} clients : ça marche pour toi', '🚀 Bravo, ton réseau fonctionne', '✅ Objectif validé, continue !', '🙌 Excellent, tu as lancé ton réseau', '😎 Objectif en poche, bien joué', '🍾 Bravo pour ce bel objectif'];
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
  function objPerso(co){
    var v = parseInt(cfg.perso && cfg.perso[co.id], 10);
    if(v > 0) return v;
    if(PERSO_DEFAUT[co.id] > 0) return PERSO_DEFAUT[co.id];
    return Math.max(1, Math.round(cfg.container / Math.max(1, collabsClassement().length)));
  }
  function slidesClassement(){
    var out = [], liste = collabsClassement();
    if(!liste.length || typeof window._depToutesLesFiches !== 'function') return out;
    var fiches = window._depToutesLesFiches(), conts = containers(), multi = false, nbAvecClients = 0;
    conts.forEach(function(d){
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
      nbAvecClients++;
      var rang = liste.map(function(co){ return tot[co.id]; }).sort(function(a, b){ return (b.eu - a.eu) || (b.n - a.n) || a.co.name.localeCompare(b.co.name); });
      var chef = rang[0].eu, second = rang.length > 1 ? rang[1].eu : 0;
      var nomC = String(d.nom || 'Container').replace(/^Chargement\s+/i, '') + (d.dateDepart ? ' · ' + dateCourte(d.dateDepart) : '');
      rang.forEach(function(r, i){
        var obj = objPerso(r.co), debut = obj <= 10, ratio = chef > 0 ? r.eu / chef : 0, famille, cc;
        var medaille = r.eu > 0 && i < 3;
        // couleur de la case : propre au classement (podium), différente de celles des objectifs
        if(r.n === 0 && r.eu <= 0) cc = 'cn';
        else if(i === 0) cc = 'cg'; else if(i === 1) cc = 'cs'; else if(i === 2) cc = 'cz';
        else cc = ratio >= 0.4 ? 'cm' : 'cr';
        // famille de phrases
        if(r.n >= obj) famille = debut ? 'debAtteint' : 'objAtteint';
        else if(debut) famille = r.n === 0 ? 'debZero' : 'debEnCours';
        else if(r.eu <= 0 && r.n === 0) famille = 'zero';
        else if(i === 0 || r.eu >= chef) famille = (r.eu - second >= r.eu * 0.3) ? 'teteLarge' : 'teteJuste';
        else if(i <= 2) famille = ratio >= 0.75 ? 'belleProche' : 'belleLoin';
        else famille = ratio >= 0.4 ? 'moyen' : 'faible';
        var ecart = i === 0 ? r.eu - second : Math.max(0, chef - r.eu);
        var fam = candidats(PANEL_CL[famille], { ecart: eurosFr(ecart), n: r.n, obj: obj, reste: Math.max(0, obj - r.n), eu: eurosFr(r.eu) });
        var sigC = [r.n, Math.round(r.eu), i, famille].join(':');
        out.push({ cle: 'k' + d._id + r.co.id, id: r.co.id, nom: r.co.name, i: i, medaille: medaille, rang: rangLib(i, false) + ' sur ' + rang.length,
          n: r.n, eu: r.eu, obj: obj, pct: obj > 0 ? Math.max(0, Math.min(100, r.n / obj * 100)) : 0, classe: cc, container: nomC,
          fk: sigC, fam: fam, txt: phraseStable('k' + d._id + r.co.id, sigC, fam) });
      });
    });
    out.multi = nbAvecClients > 1;
    return out;
  }
  function htmlCl(m, k, tous){
    var av = (window.photosProfil && window.photosProfil.avatar) ? window.photosProfil.avatar(m.id, 28) : '';
    var md = m.medaille ? '<span class="cl-md">' + ['🥇', '🥈', '🥉'][m.i] + '</span>' : '<span class="cl-md num">' + (m.i + 1) + '</span>';
    var petit = (tous.multi ? m.container + ' · ' : '') + m.n + ' / ' + m.obj + ' client' + (m.obj > 1 ? 's' : '');
    return '<div class="ob-m ' + m.classe + (k === 0 ? ' on' : '') + '"><div class="ob-l1">' + md + av + '<span class="cl-nom">' + esc(m.nom) + '</span><span class="cl-rk">' + esc(m.rang) + '</span>'
      + '<span class="cl-n"><b>' + eurosFr(m.eu) + '</b></span></div>'
      + '<div class="ob-bar"><i style="width:' + m.pct.toFixed(1) + '%"></i></div>'
      + '<div class="ob-l2 cl-l2"><span><i class="ob-t">' + esc(m.txt) + '</i></span><small>' + esc(petit) + '</small></div></div>';
  }
  var listeCl = [], idxCl = 0, minuteurCl = null, sigCl = '';
  function suivantCl(){
    var el = document.getElementById('cl-accueil'); if(!el || listeCl.length < 1) return;
    var a = document.querySelector('.screen.active');
    if(document.hidden || !a || a.id !== 's-espaces'){ minuteurCl = setTimeout(suivantCl, 1000); return; }
    idxCl = (idxCl + 1) % listeCl.length;
    [].forEach.call(el.querySelectorAll('.ob-m'), function(n, k){ n.classList.toggle('on', k === idxCl); if(k === idxCl) defiler(n); });
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
    var s2 = listeCl.map(function(m){ return [m.cle, m.n, Math.round(m.eu), m.obj, m.classe, m.fk, m.rang].join(':'); }).join('|') + (listeCl.multi ? '#m' : '');
    if(el && s2 === sigCl){ placerCl(); return; }
    sigCl = s2;
    if(!el){ el = document.createElement('div'); el.id = 'cl-accueil'; el.setAttribute('role', 'status'); }
    if(idxCl >= listeCl.length) idxCl = 0;
    el.innerHTML = listeCl.map(function(m, k){ return htmlCl(m, k, listeCl); }).join('');
    [].forEach.call(el.querySelectorAll('.ob-m'), function(n, k){ n.classList.toggle('on', k === idxCl); });
    var pt = document.getElementById('cl-pt');
    if(listeCl.length > 1){
      if(!pt){ pt = document.createElement('div'); pt.id = 'cl-pt'; }
      pt.innerHTML = listeCl.map(function(m, k){ return '<i' + (k === idxCl ? ' class="on"' : '') + '></i>'; }).join('');
    } else if(pt){ pt.remove(); }
    if(!el.parentNode) contenu.insertBefore(el, contenu.firstChild);
    placerCl();
    if(minuteurCl){ clearTimeout(minuteurCl); minuteurCl = null; }
    minuteurCl = setTimeout(suivantCl, DUREE_CL);
    setTimeout(function(){ defiler(el.querySelector('.ob-m.on')); }, 120);
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
          cfg = { container: Math.max(1, parseInt(v.container, 10) || DEFAUT.container), dimanche: Math.max(1, parseInt(v.dimanche, 10) || DEFAUT.dimanche), perso: (v.perso && typeof v.perso === 'object') ? v.perso : {} };
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
      + '<h3 style="margin-top:22px">Objectif de chaque collaborateur</h3>'
      + '<p>Clients à ramener par container. Le classement de l’accueil montre le compteur de chacun (« 16 / 30 »). Laisse vide pour garder le chiffre de départ.</p>'
      + collabsClassement().map(function(co){
          return '<label for="ob-champ-p-' + esc(co.id) + '">' + esc(co.name) + '</label><input type="number" inputmode="numeric" min="1" class="ob-perso" data-id="' + esc(co.id) + '" id="ob-champ-p-' + esc(co.id) + '" value="' + objPerso(co) + '">';
        }).join('')
      + '<div id="ob-total" style="margin-top:12px;font-size:13px;font-weight:800"></div>'
      + '<button type="button" class="ob-ok" id="ob-enregistrer">Enregistrer</button></div>';
    totalPerso();
  };
  // Total des objectifs de chacun comparé à celui du container.
  function totalPerso(){
    var z = document.getElementById('ob-total'); if(!z) return;
    var c = Math.max(1, parseInt((document.getElementById('ob-champ-c') || {}).value, 10) || cfg.container), t = 0;
    [].forEach.call(document.querySelectorAll('.ob-perso'), function(i){ t += Math.max(0, parseInt(i.value, 10) || 0); });
    var diff = c - t, bon = Math.abs(diff) <= Math.round(c * 0.1);
    z.style.color = bon ? '#0a6b3d' : '#b45a00';
    z.textContent = 'Total des objectifs de chacun : ' + t + ' / ' + c + (diff === 0 ? ' ✓' : (diff > 0 ? ' — il manque ' + diff : ' — il y en a ' + (-diff) + ' de trop'));
  }
  document.addEventListener('input', function(e){ var t = e.target; if(t && t.classList && (t.classList.contains('ob-perso') || t.id === 'ob-champ-c')) totalPerso(); });
  document.addEventListener('click', function(e){
    var t = e.target.closest ? e.target.closest('#ob-enregistrer') : null; if(!t) return;
    var c = Math.max(1, parseInt((document.getElementById('ob-champ-c') || {}).value, 10) || 0);
    var d = Math.max(1, parseInt((document.getElementById('ob-champ-d') || {}).value, 10) || 0);
    if(!c || !d){ try{ showToastNew('⚠️ Écris deux nombres.'); }catch(x){} return; }
    if(!window.db || !window.firebaseReady){ try{ showToastNew('❌ Connexion indisponible.'); }catch(x){} return; }
    var perso = {};
    [].forEach.call(document.querySelectorAll('.ob-perso'), function(i){ var v = parseInt(i.value, 10); if(v > 0) perso[i.getAttribute('data-id')] = v; });
    Promise.resolve(db.ref('dct_config/objectifs').set({ container: c, dimanche: d, perso: perso, ts: Date.now() })).then(function(){
      cfg = { container: c, dimanche: d, perso: perso };
      try{ if(typeof _tracerReglage === 'function') _tracerReglage('🎯', 'a réglé les objectifs : <strong>' + c + '</strong> clients par container, <strong>' + d + '</strong> par dimanche, et ceux de chaque collaborateur'); }catch(x){}
      try{ showToastNew('✅ Objectifs enregistrés'); }catch(x){}
      maj();
    }).catch(function(err){ try{ showToastNew('❌ Échec : ' + ((err && err.message) || 'écriture refusée')); }catch(x){} });
  });
  window.objectifs = { afficher: maj, messages: messages, classement: slidesClassement, defiler: defiler, config: function(){ return cfg; } };
})();
