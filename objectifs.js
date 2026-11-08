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
  function dateJour(iso){ var p = String(iso || '').split('-'); return p.length === 3 ? (+p[2]) + ' ' + ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'][+p[1] - 1] : ''; }
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
      + '#cl-accueil .cl-l2 span{min-width:0;overflow:hidden;text-overflow:ellipsis}#cl-accueil .cl-l2 small{flex:none;font-size:11.5px;color:#10241a;font-weight:800;background:rgba(255,255,255,.7);border-radius:99px;padding:2px 9px;white-space:nowrap}'
      + '#cl-accueil .ob-l1 .ph-mini{border:2px solid #fff;box-sizing:border-box}'
      + '#ob-accueil .cl-l2{display:flex;justify-content:space-between;align-items:baseline;gap:8px}#ob-accueil .cl-l2 span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#ob-accueil .cl-l2 small{flex:none;font-size:11px;color:#556;font-weight:800;background:rgba(255,255,255,.7);border-radius:99px;padding:2px 9px;white-space:nowrap}'
      + '#cl-pt{margin-top:-8px}'
      + '#cl-accueil .cl-wk{flex:none;font-size:11px;font-weight:800;color:#0a6b3d;background:rgba(26,138,92,.16);border-radius:99px;padding:1px 8px}'
      + '#cl-semaine{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:0 4px 6px;font-size:10.5px;color:var(--text3,#667);font-weight:700}#cl-semaine b{font-size:11px;letter-spacing:.06em;color:var(--text,#10241a);font-weight:800}#cl-semaine span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}'
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
    // Page « Objectifs » (bouton de la barre du bas) : mêmes cartes que les bannières, toutes visibles en même temps.
    st.textContent += st.textContent.replace(/#ob-pt/g, '#opg-pt-inutile').replace(/#cl-pt/g, '#opg-pt-inutile2').replace(/#ob-accueil|#cl-accueil/g, '#obj-page .opg')
      + '#obj-page .ob-m.cp{padding:7px 12px 8px}#obj-page .ob-m.cp .ob-bar{margin:5px 0 3px;height:7px}'
      + '#obj-page .ob-m.moi{outline:2.5px solid rgba(14,159,91,.75);outline-offset:-1px}'
      + '#obj-page .opg{margin:0 0 9px}'
      + '#obj-page .pg-t{font-size:10.5px;font-weight:800;letter-spacing:.09em;color:var(--text3,#667);margin:14px 4px 7px;display:flex;justify-content:space-between;gap:8px}#obj-page .pg-t span{font-weight:700;letter-spacing:0;white-space:nowrap}'
      + '#obj-page .pg-big{font-size:26px;font-weight:800;letter-spacing:-.02em}#obj-page .pg-big i{font-style:normal;font-size:13px;font-weight:700;opacity:.65}'
      + '#obj-page .pg-note{font-size:12px;font-weight:700;margin-top:3px}'
      + '#obj-page .pg-gr{display:flex;align-items:flex-end;gap:8px;height:92px;position:relative;margin-top:6px}'
      + '#obj-page .pg-col{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%;min-width:0}'
      + '#obj-page .pg-col b{font-size:11.5px;margin-bottom:2px}#obj-page .pg-bar{width:100%;max-width:38px;border-radius:8px 8px 3px 3px;background:linear-gradient(180deg,#6b79de,#3a4bb8);min-height:3px}'
      + '#obj-page .pg-col.ok .pg-bar{background:linear-gradient(180deg,#3fc58e,#1a8a5c)}#obj-page .pg-col.fut .pg-bar{background:rgba(0,0,0,.1)}#obj-page .pg-col.cur .pg-bar{box-shadow:0 0 0 2px rgba(14,159,91,.8)}'
      + '#obj-page .pg-col small{font-size:10.5px;font-weight:800;color:#556;margin-top:3px}'
      + '#obj-page .pg-obj{position:absolute;left:0;right:0;border-top:2px dashed rgba(224,138,30,.85)}#obj-page .pg-obj span{position:absolute;right:0;top:-15px;font-size:10px;font-weight:800;color:#a04800}'
      + '#obj-page .pg-duo{display:flex;align-items:flex-end;justify-content:center;gap:4px;width:100%}#obj-page .pg-b{flex:1;max-width:24px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end}'
      + '#obj-page .pg-b.p .pg-bar{background:linear-gradient(180deg,#3fc58e,#1a8a5c)}#obj-page .pg-col.cur .pg-b.p .pg-bar,#obj-page .pg-col.cur .pg-b.t .pg-bar{box-shadow:none}'
      + '#obj-page .pg-leg{display:flex;gap:14px;font-size:11px;font-weight:800;color:#334;margin-bottom:2px}#obj-page .pg-leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}#obj-page .pg-leg .lt{background:#4a55c8}#obj-page .pg-leg .lp{background:#1a8a5c}'
      + '#obj-page .pg-objp{border-top-color:rgba(26,138,92,.85)}#obj-page .pg-objp span{left:0;right:auto;color:#0a6b3d}'
      + '#obj-page .pg-vue{display:flex;align-items:center;gap:10px;margin:2px 4px 10px;padding:8px 12px;border-radius:14px;background:rgba(255,255,255,.7);border:1.5px solid rgba(255,255,255,.95)}#obj-page .pg-vue label{font-size:12px;font-weight:800;white-space:nowrap}#obj-page .pg-vue select{flex:1;min-width:0;padding:8px;border-radius:10px;border:1.5px solid var(--border,#ddd);font:700 15px var(--font,inherit);background:var(--white,#fff);color:inherit}'
      + '#obj-page .pg-gr2{display:grid;height:116px;align-items:end;border-bottom:2px solid rgba(0,0,0,.15);padding-top:18px;margin-top:2px}#obj-page .pg-c{height:100%;display:flex;align-items:flex-end;justify-content:center}'
      + '#obj-page .pg-duo{display:flex;align-items:flex-end;justify-content:center;gap:5px}#obj-page .pg-b{position:relative;width:22px;border-radius:6px 6px 0 0}'
      + '#obj-page .pg-b b{position:absolute;left:-6px;right:-6px;top:-17px;text-align:center;font-size:12px;font-weight:800;color:#10241a}'
      + '#obj-page .pg-b.t{background:linear-gradient(180deg,#6b79de,#3a4bb8)}#obj-page .pg-b.p{background:linear-gradient(180deg,#3fc58e,#1a8a5c)}'
      + '#obj-page .pg-lab{display:grid;margin-top:6px;text-align:center;font-weight:800;font-size:12.5px}#obj-page .pg-lab .cur{color:#0a6b3d}#obj-page .pg-lab .fut{opacity:.35}'
      + '#obj-page .pg-sum{display:grid;gap:6px;margin-top:12px}#obj-page .pg-sum > div{display:flex;gap:9px;align-items:flex-start;background:rgba(255,255,255,.62);border-radius:12px;padding:8px 10px;font-size:13px;font-weight:700;line-height:1.35;color:#16241e}#obj-page .pg-sum i{font-style:normal;flex:none}'
      + '#obj-page .pg-seg{display:flex;background:rgba(255,255,255,.7);border-radius:14px;padding:3px;margin:0 0 10px}#obj-page .pg-seg button{flex:1;border:0;background:transparent;padding:9px 0;border-radius:11px;font:800 13.5px var(--font,inherit);color:#556;cursor:pointer}#obj-page .pg-seg button.on{background:#0E9F5B;color:#fff;box-shadow:0 2px 8px rgba(14,159,91,.4)}'
      + '#obj-page .ob-m.ld{background:linear-gradient(135deg,#e0820f,#a8500a) !important;color:#fff;border:0;padding:12px 14px 13px}#obj-page .ld-j{float:right;text-align:right}#obj-page .ld-j b{display:block;font-size:30px;line-height:1;letter-spacing:-.02em}#obj-page .ld-j small{font-size:11.5px;font-weight:700;opacity:.9}'
      + '#obj-page .ld-l{font-size:10.5px;font-weight:800;letter-spacing:.1em;opacity:.85}#obj-page .ld-d{font-size:23px;font-weight:800;letter-spacing:-.02em;margin:2px 0}#obj-page .ld-c{font-size:12px;font-weight:700;opacity:.92}'
      + '#obj-page .ld-fr{display:flex;align-items:center;margin-top:11px;clear:both}#obj-page .ld-s{width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.3);font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center}#obj-page .ld-s.ok{background:rgba(255,255,255,.92);color:#a8500a}#obj-page .ld-s.cur{background:#fff;color:#0a6b3d;box-shadow:0 0 0 3px rgba(14,159,91,.65)}#obj-page .ld-b{flex:1;height:3px;background:rgba(255,255,255,.35)}#obj-page .ld-f{font-size:18px;margin-left:5px}'
      + '#obj-page .hs-card{display:flex;flex-wrap:wrap;gap:8px 11px;align-items:center;background:rgba(255,255,255,.72);border:1.5px solid rgba(255,255,255,.95);box-shadow:0 4px 14px rgba(30,60,45,.1);border-radius:18px;padding:10px 12px;cursor:pointer}#obj-page .hs-card.hs-cur{background:linear-gradient(135deg,rgba(224,130,15,.25),rgba(224,130,15,.08))}'
      + '#obj-page .hs-ic{flex:none;width:40px;height:40px;border-radius:12px;background:#e1e5fb;display:flex;align-items:center;justify-content:center;font-size:20px}#obj-page .hs-x{flex:1;min-width:0}#obj-page .hs-x b{font-size:15px}#obj-page .hs-x small{display:block;font-size:11.5px;color:#667;font-weight:700;margin:1px 0 3px}#obj-page .hs-ch{font-size:24px;color:#999}'
      + '#obj-page .hs-chip{display:inline-block;border-radius:99px;padding:2px 9px;font-size:10.5px;font-weight:800;background:#e1e5fb;color:#26338f}#obj-page .hs-bil{flex:0 0 100%;border-radius:11px;background:rgba(0,0,0,.05);padding:6px 10px;font-size:12.5px;font-weight:700;color:#334}#obj-page .hs-bil b{color:#10241a}'
      + '#obj-page .hs-back{color:#0a6b3d;font-weight:800;font-size:13.5px;margin:2px 4px 6px;cursor:pointer;display:inline-block}#obj-page .hs-titre{text-align:center;font-size:20px;font-weight:800;margin:0 0 6px}'
      + '#obj-page .hs-pl{display:flex;gap:10px;align-items:center}#obj-page .hs-md{font-size:36px;line-height:1;width:44px;text-align:center}#obj-page .hs-md.num{font-size:15px;width:26px;height:26px;border-radius:50%;background:rgba(0,0,0,.1);line-height:26px;margin:0 9px}#obj-page .hs-pl b{font-size:22px}#obj-page .hs-pl small{display:block;font-size:12px;color:#556;font-weight:700}'
      + '#obj-page .hs-tl{display:flex;gap:7px;margin-top:9px}#obj-page .hs-tl div{flex:1;border-radius:12px;background:rgba(255,255,255,.7);padding:6px 8px;font-size:10px;font-weight:800;color:#667;letter-spacing:.03em}#obj-page .hs-tl b{display:block;font-size:17px;color:#10241a;letter-spacing:-.02em;margin-top:1px}'
      + '#obj-page .hs-r{display:flex;align-items:center;gap:8px;padding:7px 4px;border-bottom:1px solid rgba(0,0,0,.07);font-size:13.5px;font-weight:700}#obj-page .hs-r:last-child{border:0}#obj-page .hs-r.moi{outline:2.5px solid rgba(14,159,91,.75);border-radius:10px;outline-offset:-1px}#obj-page .hs-r .hs-md{font-size:22px;width:28px}#obj-page .hs-r .hs-md.num{font-size:12px;width:24px;height:24px;line-height:24px;margin:0 2px}#obj-page .hs-n{flex:1;min-width:0}#obj-page .hs-k{font-size:11.5px;color:#556}#obj-page .hs-r b{font-size:14px}'
      + '#obj-page .pg-pied{font-size:11.5px;color:var(--text3,#667);font-weight:600;line-height:1.45;margin:10px 4px 20px}';
    document.head.appendChild(st);
  })();

  /* ---------- calcul ---------- */
  // Cobey (08/11/2026) : « il ne faut compter que les clients dont on a fait le ramassage, car c'est ceux-là qui sont validés » ; France : « seulement quand
  // on a validé (chauffeur externe, ou notre propre chauffeur) ». Collecte classique = validé dans un camion ; France = statut « ramassé » (ou « parti ») ;
  // dépôt direct = le client apporte son colis, il compte dès que la fiche existe.
  function valides(colId){
    var out = {};
    try{
      var t = ((window.dispatchParCollecte || {})[colId] || {}).trucks || {};
      Object.keys(t).forEach(function(k){
        var v = t[k] && t[k].validated; if(!v) return;
        (Array.isArray(v) ? v : Object.keys(v).map(function(i){ return v[i]; })).forEach(function(id){ out[id] = 1; });
      });
    }catch(e){}
    return out;
  }
  function fichesRamassees(departId){
    var out = [], vc = {};
    var fiches = typeof window._depToutesLesFiches === 'function' ? window._depToutesLesFiches() : [];
    fiches.forEach(function(x){
      var c = x.c; if(!c || c.departId !== departId) return;
      try{ if(typeof window._depEstFusionnee === 'function' && window._depEstFusionnee(c)) return; }catch(e){}
      var ok;
      if(x.src === 'depot') ok = true;
      else if(x.src === 'france') ok = (c.statut === 'ramasse' || c.statut === 'parti');
      else { if(!vc[x.collecteId]) vc[x.collecteId] = valides(x.collecteId); ok = !!vc[x.collecteId][x.clientId]; }
      if(ok) out.push(x);
    });
    return out;
  }
  function nbContainer(id){ return fichesRamassees(id).length; }
  function isoDe(j){ return new Date(j * 86400000).toISOString().slice(0, 10); }
  function isoTs(ts){ try{ return new Date(ts).toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' }); }catch(e){ return ''; } }
  // Date de ramasse d'une fiche (pour repérer le premier dimanche du container et les clients de la semaine).
  function dateRamasse(x){
    if(x.src === 'france') return x.c.ramasseTs ? isoTs(x.c.ramasseTs) : '';
    if(x.src === 'depot') return x.c.creeLe ? isoTs(x.c.creeLe) : '';
    var cols = (typeof collectes !== 'undefined' && Array.isArray(collectes)) ? collectes : [];
    for(var i = 0; i < cols.length; i++){ if(cols[i] && cols[i].id === x.collecteId) return isoDeLibelle(cols[i].date); }
    return '';
  }
  function containers(){
    var d = window.departsData || {};
    return Object.keys(d).map(function(k){ var o = d[k]; if(!o || typeof o !== 'object') return null; o = Object.assign({}, o); o._id = k; return o; })
      .filter(function(o){ return o && o.statut === 'preparation' && o.special !== 'depot'; })
      .sort(function(a, b){ return String(a.dateDepart || '').localeCompare(String(b.dateDepart || '')); });
  }
  // Un container se remplit en 4 semaines de ramasse (parfois 5) : du premier dimanche de ramasse jusqu'au jour de chargement.
  // Renvoie la semaine en cours (1..N), le rythme attendu (p = part du chemin faite aujourd'hui) et le « moment » des phrases (1, 2, 3, 4, D = dernière).
  function infoContainer(d){
    var fin = d.dateDepart; if(!fin || isNaN(jours(fin))) return null;
    var debut = null;
    fichesRamassees(d._id).forEach(function(x){ if(x.src === 'depot') return; var i = dateRamasse(x); if(i && (!debut || i < debut)) debut = i; });
    var f = jours(fin), dj = debut ? jours(debut) : f - 21;
    // Cobey : « la semaine dernière était la première semaine : le dernier chargement a été fait il y a 2 semaines, mais on n'a pas fait de ramasse faute de
    // clients ». Le container commence donc le premier DIMANCHE APRÈS LE CHARGEMENT DU PRÉCÉDENT (même pays), qu'il y ait eu une ramasse ou non.
    try{
      var dd = window.departsData || {}, prec = null, pays = d.pays || 'SN';
      Object.keys(dd).forEach(function(k){
        var o = dd[k]; if(!o || typeof o !== 'object' || k === d._id || o.special === 'depot' || !o.dateDepart) return;
        if((o.pays || 'SN') !== pays || String(o.dateDepart) >= String(fin)) return;
        if(!prec || String(o.dateDepart) > prec) prec = String(o.dateDepart);
      });
      if(prec && !isNaN(jours(prec))){ var jp = jours(prec), dow = (jp + 4) % 7; dj = jp + (((7 - dow) % 7) || 7); }
    }catch(e){}
    if(dj > f) dj = f - 21;
    var N = Math.max(3, Math.min(6, Math.floor((f - dj) / 7) + 1));
    var a = jours(auj());
    var sem = Math.max(1, Math.min(N, Math.floor((a - dj) / 7) + 1));
    var p = Math.max(0, Math.min(1, (a - dj + 1) / (f - dj + 1)));
    return { debut: isoDe(dj), fin: fin, N: N, sem: sem, p: p, bucket: sem >= N ? 'D' : String(Math.min(sem, 4)), dimanche: isoDe(dj + 7 * (sem - 1)) };
  }
  // Situation par rapport au rythme : en avance / dans les temps / en retard (jamais de reproche en semaine 1 : « début »).
  function situation(n, obj, info){
    if(n >= obj) return 'atteint';
    var att = obj * info.p;
    if(n >= att + obj * 0.08) return 'avance';
    if(n >= att - obj * 0.06) return 'temps';
    return info.sem === 1 ? 'debut' : 'retard';
  }
  // Objectif du dimanche = objectif du container ÷ nombre de semaines (25 sur 4 semaines, 20 sur 5) ; à défaut, la valeur des réglages.
  function objDimanche(){
    try{ var ct = containers()[0], inf = ct && infoContainer(ct); if(inf) return Math.max(1, Math.ceil(cfg.container / inf.N)); }catch(e){}
    return cfg.dimanche;
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
  var MX_EQUIPE = {
    '1': {
      'debut': ['🌱 Semaine {sem} : le container démarre, c’est parti !', '🚛 Début de container : chaque client compte', '🎬 On lance la ramasse : {obj} clients à viser', '☀️ Nouveau container : tout est à construire', '🚀 Premier dimanche : on pose les bases', '📒 Semaine {sem} : sortez les carnets d’adresses'],
      'temps': ['👍 Bon début de container, {n} déjà !', '🙂 Semaine {sem} bien lancée, on continue', '✅ On démarre dans le bon rythme', '💪 Début régulier, gardons ça', '🚛 {n} clients dès la première semaine', '🌿 Départ tranquille et efficace'],
      'avance': ['🔥 Départ en trombe : {n} clients déjà !', '🚀 Super début, on prend de l’avance', '😎 Semaine {sem} : on démarre fort', '⚡ Beau lancement : +{avance} d’avance', '🏃 Premier sprint réussi, bravo', '🌟 Un container qui démarre très fort'],
      'atteint': ['🎉 Déjà {obj} dès la semaine {sem} : incroyable !', '🏆 Container plein en une semaine, bravo !', '🥳 Objectif atteint, quel départ !', '💥 {obj} clients : record de rapidité', '🔥 Plein dès le début, du jamais vu', '👏 Déjà complet, merci à tous']
    },
    '2': {
      'avance': ['🔥 Semaine {sem}/{N} : en avance, bravo !', '🚀 On a de l’avance, ne ralentissez pas', '😎 Déjà {n} : on est devant le rythme', '💪 Beau rythme à ce stade, continuez', '⚡ +{avance} d’avance, quelle équipe', '🏃 Semaine {sem} : on court devant'],
      'temps': ['👍 Semaine {sem}/{N} : dans les temps', '✅ Le rythme est bon, on continue', '🙂 {n} clients, comme prévu à ce stade', '🧭 Pile dans le planning, gardez le cap', '💬 Encore {reste} : le planning est tenu', '🌿 Ça avance régulièrement, bravo'],
      'retard': ['⏳ Semaine {sem}/{N} : un peu de retard', '📣 Il manque {manque} pour être dans les temps', '📞 Relancez vos contacts : {manque} à rattraper', '🔔 On peut rattraper, il reste du temps', '🚨 Retard à combler : {manque} clients', '💪 Cette semaine, on remonte le rythme'],
      'atteint': ['🎉 {obj} clients en semaine {sem} : bravo !', '🏆 Objectif atteint avec de l’avance !', '🥳 Container plein, bien avant la fin', '💥 Déjà complet, quelle équipe', '🔥 Mission accomplie plus tôt que prévu', '👏 Objectif rempli, bravo à tous']
    },
    '3': {
      'avance': ['🔥 Semaine {sem}/{N} : en avance, on tient !', '🚀 Belle avance, plus que {reste} clients', '😎 On est devant : ça se joue bien', '💪 Encore {reste}, avec de l’avance', '⚡ +{avance} d’avance à ce stade', '🏃 Cap sur le container plein !'],
      'temps': ['👍 Semaine {sem}/{N} : toujours dans les temps', '✅ On suit le rythme, encore {reste}', '🙂 Milieu de parcours bien tenu', '🧭 {n} clients, comme prévu', '💬 Ça avance, ne relâchez pas', '🌿 Régulier : continuez ainsi'],
      'retard': ['⏳ Semaine {sem}/{N} : le retard se creuse', '📣 Il manque {manque} pour tenir le rythme', '🚨 Attention : {manque} à rattraper vite', '📞 Tous au téléphone : {manque} de retard', '🔔 Il reste du temps, mais il faut accélérer', '💪 Un effort collectif et on rattrape'],
      'atteint': ['🎉 Container plein en semaine {sem} : bravo !', '🏆 Objectif atteint, il reste du temps !', '🥳 Complet avant la fin, quelle équipe', '💥 {obj} clients : mission accomplie', '🔥 Objectif tenu, bravo à tous', '👏 Plein avant la dernière ligne droite']
    },
    '4': {
      'avance': ['🔥 Semaine {sem}/{N} : en avance avant la fin !', '🚀 Presque au bout, encore {reste}', '😎 La fin approche, on est devant', '💪 Plus que {reste}, avec de l’avance', '⚡ +{avance} d’avance, on finit fort', '🏃 L’avant-dernière ligne droite est bonne'],
      'temps': ['👍 Semaine {sem}/{N} : toujours dans les temps', '✅ On approche de la fin : encore {reste}', '🙂 Le container se remplit comme prévu', '🧭 Plus que {reste}, gardez le cap', '💬 La fin est proche, ne relâchez pas', '🌿 Un dernier élan et c’est plein'],
      'retard': ['⏳ Semaine {sem}/{N} : il faut accélérer', '🚨 Il manque {manque} pour tenir le rythme', '📣 La fin approche : {manque} à rattraper', '📞 Tous au téléphone, il reste peu de temps', '🔔 Le chargement approche : encore {reste}', '💪 Une grosse semaine pour rattraper'],
      'atteint': ['🎉 Container plein avant la fin, bravo !', '🏆 Objectif atteint en semaine {sem}', '🥳 Plein à craquer, quelle équipe', '💥 {obj} clients, et il reste du temps', '🔥 Mission accomplie, merci à tous', '👏 Bravo, on peut finir tranquille']
    },
    'D': {
      'avance': ['🏁 Dernière semaine : en avance, on finit fort !', '🚀 Ligne droite : encore {reste}, avec de l’avance', '😎 Dernière semaine, on est devant', '💪 Plus que {reste} avant le chargement', '⚡ +{avance} d’avance pour la dernière ligne', '🔥 On boucle ce container en beauté'],
      'temps': ['🏁 Dernière semaine : encore {reste}', '✅ Ligne droite, le rythme est tenu', '🙂 Plus que {reste} avant le chargement', '🧭 Dernier effort : le planning est tenu', '💬 Dernière semaine, tout le monde s’y met', '🚛 Le chargement approche, encore {reste}'],
      'retard': ['🚨 Dernière semaine : il manque {reste} !', '📣 Dernier effort : {reste} avant le chargement', '📞 Tous au téléphone, c’est la dernière semaine', '⏳ Le chargement approche : {reste} à trouver', '🔔 Dernière chance de remplir le container', '💪 Une grosse dernière semaine, on y croit'],
      'atteint': ['🎉 Container plein pour le chargement, bravo !', '🏆 Objectif atteint à la dernière semaine', '🥳 {obj} clients : tout est prêt', '💥 Mission accomplie, quel container', '🔥 Plein pour le chargement, merci à tous', '👏 Bravo, on charge un container complet']
    }
  };
  var MX_PERSO = {
    '1': {
      'debut': ['🌱 Semaine {sem} : lance-toi, ton objectif est {obj}', '🚛 Début de container : chaque contact compte', '📞 Premier dimanche : appelle tes contacts', '☀️ Rien d’urgent, mais commence cette semaine', '🎬 Le container démarre : à toi de jouer', '📒 Ouvre ton carnet d’adresses cette semaine'],
      'temps': ['👍 Bon début : {n} clients dès la semaine {sem}', '🙂 Tu démarres bien, continue', '✅ Début régulier, bravo', '💪 Premier pas réussi : {n} clients', '🌿 Beau départ, garde ce rythme', '🚛 Tu es dans les temps dès le début'],
      'avance': ['🔥 Départ en trombe : {n} clients déjà !', '🚀 Super début, tu prends de l’avance', '😎 Tu démarres très fort, bravo', '⚡ +{avance} d’avance dès la semaine {sem}', '🏃 Premier sprint réussi', '🌟 Un début remarquable'],
      'atteint': ['🎉 Objectif atteint dès la semaine {sem} !', '🏆 {obj} clients en une semaine : bravo !', '🥳 Déjà ton objectif, quel départ', '💥 Objectif rempli, incroyable', '🔥 Tu as déjà fini ton objectif !', '👏 Bravo, tu peux viser plus haut']
    },
    '2': {
      'avance': ['🔥 Semaine {sem}/{N} : tu as de l’avance !', '🚀 En avance sur ton rythme, continue', '😎 {n} clients : tu es devant', '💪 Beau rythme, ne ralentis pas', '⚡ +{avance} d’avance, bravo', '🏃 Tu cours devant le planning'],
      'temps': ['👍 Semaine {sem}/{N} : tu es dans les temps', '✅ Ton rythme est bon, continue', '🙂 {n} clients, comme prévu à ce stade', '🧭 Pile dans ton planning', '💬 Encore {reste} pour ton objectif', '🌿 Tu avances régulièrement'],
      'retard': ['⏳ Semaine {sem}/{N} : un peu de retard', '📣 Il te manque {manque} pour être dans les temps', '📞 Relance tes contacts : {manque} à rattraper', '🔔 Tu peux rattraper, il reste du temps', '🚨 {manque} clients de retard : cette semaine on y va', '💪 Remonte ton rythme cette semaine'],
      'atteint': ['🎉 Objectif atteint en semaine {sem} !', '🏆 {obj} clients : tu es en avance, bravo', '🥳 Ton objectif est rempli bien avant la fin', '💥 Déjà au bout de ton objectif', '🔥 Mission accomplie, bravo', '👏 Excellent, tu peux viser plus']
    },
    '3': {
      'avance': ['🔥 Semaine {sem}/{N} : en avance, tu tiens !', '🚀 Belle avance, encore {reste} clients', '😎 Tu es devant ton rythme', '💪 Plus que {reste}, avec de l’avance', '⚡ +{avance} d’avance à ce stade', '🏃 Cap sur ton objectif !'],
      'temps': ['👍 Semaine {sem}/{N} : toujours dans les temps', '✅ Tu suis ton rythme, encore {reste}', '🙂 Milieu de parcours bien tenu', '🧭 {n} clients, comme prévu', '💬 Ça avance, ne relâche pas', '🌿 Régulier : continue ainsi'],
      'retard': ['⏳ Semaine {sem}/{N} : le retard se creuse', '📣 Il te manque {manque} pour tenir ton rythme', '🚨 Attention : {manque} à rattraper vite', '📞 Appelle tes contacts : {manque} de retard', '🔔 Il reste du temps, mais il faut accélérer', '💪 Un effort cette semaine et tu rattrapes'],
      'atteint': ['🎉 Objectif atteint en semaine {sem} : bravo !', '🏆 Ton objectif est rempli, il reste du temps', '🥳 Terminé avant la fin, quelle performance', '💥 {obj} clients : mission accomplie', '🔥 Objectif tenu, félicitations', '👏 Tu as de l’avance, tu peux aider les autres']
    },
    '4': {
      'avance': ['🔥 Semaine {sem}/{N} : en avance avant la fin !', '🚀 Presque au bout, encore {reste}', '😎 La fin approche, tu es devant', '💪 Plus que {reste}, avec de l’avance', '⚡ +{avance} d’avance, finis fort', '🏃 Belle ligne droite pour toi'],
      'temps': ['👍 Semaine {sem}/{N} : toujours dans les temps', '✅ La fin approche : encore {reste}', '🙂 Ton objectif se remplit comme prévu', '🧭 Plus que {reste}, garde le cap', '💬 La fin est proche, ne relâche pas', '🌿 Un dernier élan et c’est bon'],
      'retard': ['⏳ Semaine {sem}/{N} : il faut accélérer', '🚨 Il te manque {manque} pour tenir ton rythme', '📣 La fin approche : {manque} à rattraper', '📞 Appelle tes contacts, il reste peu de temps', '🔔 Le chargement approche : encore {reste}', '💪 Une grosse semaine pour rattraper'],
      'atteint': ['🎉 Objectif atteint avant la fin, bravo !', '🏆 Ton objectif est rempli en semaine {sem}', '🥳 Plein pour toi, quelle performance', '💥 {obj} clients, et il reste du temps', '🔥 Mission accomplie, merci', '👏 Bravo, tu peux finir tranquille']
    },
    'D': {
      'avance': ['🏁 Dernière semaine : en avance, finis fort !', '🚀 Ligne droite : encore {reste}, avec de l’avance', '😎 Dernière semaine, tu es devant', '💪 Plus que {reste} avant le chargement', '⚡ +{avance} d’avance pour la dernière ligne', '🔥 Tu boucles ce container en beauté'],
      'temps': ['🏁 Dernière semaine : encore {reste}', '✅ Ligne droite, ton rythme est tenu', '🙂 Plus que {reste} avant le chargement', '🧭 Dernier effort, tu y es presque', '💬 Dernière semaine, appelle tes contacts', '🚛 Le chargement approche, encore {reste}'],
      'retard': ['🚨 Dernière semaine : il te manque {reste} !', '📣 Dernier effort : {reste} avant le chargement', '📞 Appelle tous tes contacts cette semaine', '⏳ Le chargement approche : {reste} à trouver', '🔔 Dernière chance pour ton objectif', '💪 Une grosse dernière semaine, tu peux le faire'],
      'atteint': ['🎉 Objectif atteint pour le chargement, bravo !', '🏆 Ton objectif est rempli à la dernière semaine', '🥳 {obj} clients : tu as réussi', '💥 Mission accomplie sur ce container', '🔥 Objectif tenu, merci pour ton travail', '👏 Bravo, tu finis ce container en beauté']
    }
  };
  var MX_DEB = {
    'tot': {
      'zero': ['📒 Semaine {sem} : ouvre ton carnet d’adresses', '👨‍👩‍👧 Pense à ta famille et à tes voisins', '☎️ Appelle tes contacts : un premier client suffit', '🌱 Un premier client et tu es lancé !', '🤝 Chaque contact peut devenir un client', '📲 Partage les numéros DCT à tes proches'],
      'encours': ['👏 Bravo, ton carnet commence à servir !', '🔥 Tu es lancé : encore {reste} pour ton objectif', '🌱 Beau début, continue d’enrichir ton carnet', '💪 Tes contacts répondent, bravo', '🎯 Encore {reste} et ton objectif est atteint', '😊 {n} sur {obj}, tu progresses'],
      'atteint': ['🎉 Objectif atteint, ton carnet a porté ses fruits !', '🏆 Bravo : tu as rempli ton objectif', '🥳 Premier objectif réussi, félicitations', '🌟 Beau travail, tu peux viser plus haut', '🔥 Objectif atteint, on monte la barre ?', '💪 Ton réseau fonctionne, bravo']
    },
    'tard': {
      'zero': ['📣 Semaine {sem}/{N} : il est temps d’ouvrir ton carnet', '☎️ Aucun client encore : appelle un contact aujourd’hui', '🔔 Le container avance : un seul client te lance', '📞 Il reste peu de temps, appelle tes proches', '🌱 Même un seul client change tout, essaie !', '🤝 Demande autour de toi avant le chargement'],
      'encours': ['👍 Semaine {sem}/{N} : {n} sur {obj}, continue !', '🔥 Encore {reste} avant le chargement', '📒 Ton carnet travaille, ne t’arrête pas', '💪 Bien parti, il reste {reste} à trouver', '🎯 Encore {reste} et ton objectif est atteint', '🚀 Le chargement approche, un dernier effort'],
      'atteint': ['🎉 Objectif atteint avant le chargement, bravo !', '🏆 Ton carnet a donné ses fruits', '🥳 Objectif rempli : félicitations', '🌟 Super, tu peux viser plus haut au prochain', '🔥 Objectif tenu, merci pour ton travail', '💪 Ton réseau fonctionne, continue']
    }
  };
  PANEL.dAvant = ['📅 Dimanche dans {jr} : objectif {obj} clients ramassés', '🎯 Bientôt dimanche : {obj} clients à ramasser', '🚛 Préparez la collecte : visons {obj} clients', '📞 Confirmez vos clients avant dimanche', '🔔 Dimanche approche, objectif {obj}', '📒 Dimanche : on vise {obj} clients ramassés'];
  function cellule(mx, info, sit){
    var b = mx[info.bucket] || mx['2'], c = b[sit] || b[sit === 'debut' ? 'temps' : 'retard'] || b['temps'];
    return c;
  }
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
    var info = infoContainer(d), reste = Math.max(0, obj - n), classe, liste, att = null, fk;
    var nom = String(d.nom || 'Container').replace(/^Chargement\s+/i, '') + (d.dateDepart ? ' · ' + dateCourte(d.dateDepart) : '');
    if(!info){ classe = 'b'; liste = PANEL.cSans; fk = 'cx'; }
    else {
      att = obj * info.p;
      var sit = situation(n, obj, info);
      classe = { atteint: 'd', avance: 'v', temps: 'b', retard: 'o', debut: 'b' }[sit];
      liste = cellule(MX_EQUIPE, info, sit); fk = 'c' + info.bucket + sit;
    }
    var vars = { obj: obj, n: n, pl: pl(reste, 'client'), reste: reste, date: dateCourte(d.dateDepart), sem: info ? info.sem : '', N: info ? info.N : '',
      manque: Math.max(1, Math.round((att || 0) - n)), avance: Math.max(1, Math.round(n - (att || 0))) };
    var fam = candidats(liste, vars), txt = phraseStable('c' + d._id, n + ':' + fk, fam);
    return { cle: 'c' + d._id, fk: fk, fam: fam, icone: '🚛', petit: info ? 'Semaine ' + info.sem + '/' + info.N : '', nom: nom, n: n, obj: obj, pct: pct, repere: att === null ? null : (att / obj * 100), classe: classe, txt: txt };
  }
  function messageDimanche(){
    var obj = objDimanche(), aujIso = auj(), ref = null, refIso = '';
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
    if(ref){ try{ var vd = valides(ref.id); n += Object.keys((typeof clientsParCollecte !== 'undefined' && clientsParCollecte[ref.id]) || {}).filter(function(id){ return vd[id]; }).length; }catch(e){} }
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
        var idsFr = (typeof _frClientsDeCollecte === 'function') ? _frClientsDeCollecte(rf) : Object.keys(cl).filter(function(id){ return cl[id] && cl[id].collecteId === rf._id; });
        n += idsFr.filter(function(id){ var f = cl[id]; return f && (f.statut === 'ramasse' || f.statut === 'parti'); }).length;
      }
    }catch(e){}
    if(!ref && !refIso) return null;
    var libelle = refIso ? 'Dimanche ' + dateJour(refIso) : (ref ? String(ref.date).replace(/\s+\d{4}\s*$/, '') : '');
    var jr = jours(refIso) - jours(aujIso), bilan = (jr === 0);
    libelle += bilan ? ' · bilan' : (jr > 0 ? ' · ' + (jr === 1 ? 'demain' : 'dans ' + jr + ' jours') : '');
    var reste = Math.max(0, obj - n), pct = Math.max(0, Math.min(100, obj ? n / obj * 100 : 0)), classe, liste;
    if(jr > 0){ classe = 'b'; liste = PANEL.dAvant; }
    else if(bilan){
      if(n >= obj){ classe = 'd'; liste = PANEL.bBien; }
      else if(n >= obj * 0.75){ classe = 'b'; liste = PANEL.bPresque; }
      else { classe = 'o'; liste = PANEL.bPas; }
    } else if(n >= obj){ classe = 'd'; liste = n > obj ? PANEL.dDepasse : PANEL.dAtteint; }
    else if(n >= obj * 0.7){ classe = 'v'; liste = PANEL.dProche; }
    else if(n >= obj * 0.4){ classe = 'b'; liste = PANEL.dMoyen; }
    else { classe = 'o'; liste = PANEL.dBas; }
    var fam = candidats(liste, { n: n, obj: obj, reste: reste, plus: n - obj, jr: (jr === 1 ? '1 jour' : jr + ' jours') }), txt = phraseStable('d' + refIso, n + ':' + classe + (bilan ? 'b' : '') + (jr > 0 ? 'a' : ''), fam);
    return { cle: 'd' + refIso, fk: (jr > 0 ? 'a' : (bilan ? 'b' : 'd')) + classe + (n > obj ? '+' : ''), fam: fam, icone: '📅', nom: libelle, n: n, obj: obj, pct: pct, repere: null, classe: classe, txt: txt };
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
      + '<span class="ob-n">' + m.n + ' <i>/ ' + m.obj + ' clients</i></span></div>'
      + '<div class="ob-bar"><i style="width:' + m.pct.toFixed(1) + '%"></i>' + (m.repere !== null && m.classe !== 'd' ? '<u style="left:calc(' + m.repere.toFixed(1) + '% - 1px)"></u>' : '') + '</div>'
      + '<div class="ob-l2 cl-l2"><span><i class="ob-t">' + esc(m.txt) + '</i></span>' + (m.petit ? '<small>' + esc(m.petit) + '</small>' : '') + '</div></div>';
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
    var conts = containers(), nbAvecClients = 0, memos = {};
    conts.forEach(function(d){
      var tot = {}; liste.forEach(function(co){ tot[co.id] = { co: co, n: 0, nSem: 0, eu: 0 }; });
      var info = infoContainer(d), xs = fichesRamassees(d._id), debutSem = info ? isoDe(jours(info.debut) + 7 * (info.sem - 1)) : '';
      xs.forEach(function(x){
        var co = auteurDe(x.c, liste); if(!co) return;
        tot[co.id].n++; tot[co.id].eu += parseFloat(x.c.prix) || 0;
        if(debutSem){ var di = dateRamasse(x); if(di && di >= debutSem) tot[co.id].nSem++; }
      });
      if(!xs.length) return;
      nbAvecClients++;
      var rang = liste.map(function(co){ return tot[co.id]; }).sort(function(a, b){ return (b.eu - a.eu) || (b.n - a.n) || a.co.name.localeCompare(b.co.name); });
      var chef = rang[0].eu;
      var nomC = String(d.nom || 'Container').replace(/^Chargement\s+/i, '') + (d.dateDepart ? ' · ' + dateCourte(d.dateDepart) : '');
      memos[d._id] = { nom: d.nom || 'Container', dateDepart: d.dateDepart || '', debut: info ? info.debut : '', nbSem: info ? info.N : 0, rang: [] };
      if(nbAvecClients === 1 && info) out.info = { sem: info.sem, N: info.N, dimanche: info.dimanche };
      rang.forEach(function(r, i){
        var obj = objPerso(r.co), debut = obj <= 10, ratio = chef > 0 ? r.eu / chef : 0, cc, liste2;
        var inf = info || { p: 0.5, sem: 2, N: 4, bucket: '2' };
        var sit = situation(r.n, obj, inf), att = obj * inf.p;
        // couleur de la case : propre au classement (podium), différente de celles des objectifs
        if(r.n === 0 && r.eu <= 0) cc = 'cn';
        else if(i === 0) cc = 'cg'; else if(i === 1) cc = 'cs'; else if(i === 2) cc = 'cz';
        else cc = ratio >= 0.4 ? 'cm' : 'cr';
        // phrases : petit objectif (carnet d'adresses) ou rythme × semaine
        var famCle;
        if(debut){ var zone = inf.sem >= 3 ? 'tard' : 'tot', etat = r.n >= obj ? 'atteint' : (r.n === 0 ? 'zero' : 'encours'); liste2 = MX_DEB[zone][etat]; famCle = 'd' + zone + etat; }
        else { liste2 = cellule(MX_PERSO, inf, sit); famCle = 'p' + inf.bucket + sit; }
        var fam = candidats(liste2, { n: r.n, obj: obj, reste: Math.max(0, obj - r.n), sem: inf.sem, N: inf.N,
          manque: Math.max(1, Math.round(att - r.n)), avance: Math.max(1, Math.round(r.n - att)) });
        var sigC = [r.n, Math.round(r.eu), famCle].join(':');
        memos[d._id].rang.push({ id: r.co.id, nom: r.co.name, n: r.n, nSem: r.nSem, eu: Math.round(r.eu * 100) / 100, obj: obj, place: i + 1 });
        out.push({ cle: 'k' + d._id + r.co.id, id: r.co.id, nom: r.co.name, i: i, medaille: r.eu > 0 && i < 3,
          rang: rangLib(i, false) + ' sur ' + rang.length, nSem: r.nSem,
          n: r.n, eu: r.eu, obj: obj, pct: obj > 0 ? Math.max(0, Math.min(100, r.n / obj * 100)) : 0, repere: info && obj > 0 ? Math.min(100, att / obj * 100) : null,
          classe: cc, container: nomC, fk: famCle + ':' + r.nSem + ':' + i, fam: fam, txt: phraseStable('k' + d._id + r.co.id, sigC, fam) });
      });
    });
    out.multi = nbAvecClients > 1;
    out.memos = memos;
    return out;
  }
  function htmlCl(m, k, tous){
    var av = (window.photosProfil && window.photosProfil.avatar) ? window.photosProfil.avatar(m.id, 28) : '';
    var md = m.medaille ? '<span class="cl-md">' + ['🥇', '🥈', '🥉'][m.i] + '</span>' : '<span class="cl-md num">' + (m.i + 1) + '</span>';
    var petit = '🎯 Objectif ' + m.n + ' / ' + m.obj;
    return '<div class="ob-m ' + m.classe + (k === 0 ? ' on' : '') + '"><div class="ob-l1">' + md + av + '<span class="cl-nom">' + esc(m.nom) + '</span><span class="cl-rk">' + (tous.multi ? esc(m.container) : '') + '</span>' + (m.nSem > 0 ? '<span class="cl-wk">+' + m.nSem + ' cette semaine</span>' : '')
      + '<span class="cl-n"><b>' + eurosFr(m.eu) + '</b></span></div>'
      + '<div class="ob-bar"><i style="width:' + m.pct.toFixed(1) + '%"></i>' + (m.repere !== null && m.n < m.obj ? '<u style="left:calc(' + m.repere.toFixed(1) + '% - 1px)"></u>' : '') + '</div>'
      + '<div class="ob-l2 cl-l2"><span><i class="ob-t">' + esc(m.txt) + '</i></span><small>' + esc(petit) + '</small></div></div>';
  }
  // Mémo du classement, lu par l'envoyeur de notifications (cloudflare-worker.js) : point de la semaine le dimanche 20h, bilan du container le lendemain du
  // chargement. Écrit à chaque changement des chiffres ; il reste après le départ du container (qui disparaît alors de l'accueil) pour le bilan final.
  var memoSig = {}, memoLe = 0;
  function ecrireMemos(memos){
    try{
      if(!memos || !window.db || !window.firebaseReady) return;
      Object.keys(memos).forEach(function(cid){
        var sg = JSON.stringify(memos[cid]);
        if(memoSig[cid] === sg || Date.now() - memoLe < 15000) return;
        memoSig[cid] = sg; memoLe = Date.now();
        var fiche = JSON.parse(sg); fiche.majLe = Date.now();
        db.ref('dct_classement_memo/' + cid).set(fiche).catch(function(e){ console.error('classement : mémo', e); });
      });
    }catch(e){ console.error('classement : mémo', e); }
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
    var el = document.getElementById('cl-accueil'), pt = document.getElementById('cl-pt'), lab = document.getElementById('cl-semaine');
    if(!listeCl.length){ if(el) el.remove(); if(pt) pt.remove(); if(lab) lab.remove(); return; }
    if(!el) return;
    var ancre = document.getElementById('ob-pt') || document.getElementById('ob-accueil') || document.getElementById('bd-accueil');
    var premier = lab || el;
    if(ancre){ if(ancre.nextElementSibling !== premier) ancre.insertAdjacentElement('afterend', premier); }
    else if(premier.parentNode !== contenu) contenu.insertBefore(premier, contenu.firstChild);
    if(lab && lab.nextElementSibling !== el) lab.insertAdjacentElement('afterend', el);
    if(pt && el.nextElementSibling !== pt) el.insertAdjacentElement('afterend', pt);
  }
  function dessinerCl(){
    var contenu = document.querySelector('#s-espaces .content'); if(!contenu) return;
    listeCl = slidesClassement();
    ecrireMemos(listeCl.memos);
    var el = document.getElementById('cl-accueil'), lab = document.getElementById('cl-semaine');
    if(!listeCl.length){ if(el) el.remove(); if(lab) lab.remove(); var p0 = document.getElementById('cl-pt'); if(p0) p0.remove(); sigCl = ''; if(minuteurCl){ clearTimeout(minuteurCl); minuteurCl = null; } return; }
    var inf = listeCl.info;
    var s2 = listeCl.map(function(m){ return [m.cle, m.n, Math.round(m.eu), m.obj, m.classe, m.fk, m.rang].join(':'); }).join('|') + (listeCl.multi ? '#m' : '') + (inf ? '#' + inf.sem + '/' + inf.N : '');
    if(el && s2 === sigCl){ placerCl(); return; }
    sigCl = s2;
    // Le classement est refait chaque semaine, après la ramasse du dimanche (Cobey : « classement semaine 1, classement semaine 2… »).
    if(inf){
      if(!lab){ lab = document.createElement('div'); lab.id = 'cl-semaine'; }
      lab.innerHTML = '<b>🏆 CLASSEMENT · SEMAINE ' + inf.sem + '/' + inf.N + '</b><span>mis à jour dimanche ' + esc(dateJour(inf.dimanche)) + '</span>';
    } else if(lab){ lab.remove(); lab = null; }
    if(lab && !lab.parentNode) contenu.insertBefore(lab, contenu.firstChild);
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

  /* ---------- Page « Objectifs » (bouton de la barre du bas, à la place d'« Activité ») ----------
     Cobey : « à la place d'Activité, un bouton pour le classement ou les objectifs qui récapitule tout ce qu'on vient de mettre en place : l'objectif du
     conteneur, le classement… on aura comme ça la vision d'un coup, sans le défilement. » (Activité reste accessible par l'horloge de l'accueil.) */
  function ecranPage(){
    var e = document.getElementById('s-objectifs'); if(e) return e;
    e = document.createElement('div'); e.className = 'screen'; e.id = 's-objectifs';
    e.innerHTML = '<div class="header"><button class="btn-back" onclick="goTo(\'s-espaces\');try{depRenderEspaces()}catch(e){}">&larr; Accueil</button>'
      + '<div style="text-align:center;flex:1"><div class="h-title">Objectifs</div><div class="h-sub" id="obj-sous">Container, dimanche et classement</div></div><span style="width:70px"></span></div>'
      + '<div class="content"><div id="obj-page"></div></div>';
    var frere = document.getElementById('s-activite') || document.getElementById('s-suivi') || document.getElementById('s-espaces');
    (frere && frere.parentNode ? frere.parentNode : document.body).appendChild(e);
    return e;
  }
  function estAdminVue(){
    var u = (window.currentUser || {}).id, l = window.COLLABS || [];
    for(var i = 0; i < l.length; i++){ if(l[i] && l[i].id === u) return !!l[i].admin; }
    return false;
  }
  function lireVue(){ try{ var v = localStorage.getItem('dct_obj_voir') || ''; return collabsClassement().some(function(c){ return c.id === v; }) ? v : ''; }catch(e){ return ''; } }
  document.addEventListener('change', function(e){
    var t = e.target; if(!t || t.id !== 'obj-vue') return;
    try{ localStorage.setItem('dct_obj_voir', t.value || ''); }catch(x){}
    pageSig = ''; rendrePage(true);
  });
  // Résumé écrit sous le graphique « Par dimanche » : trois courtes lignes (la ramasse de la semaine, l'objectif de la semaine, depuis le début du container),
  // choisies selon la semaine (1, 2, 3, 4, dernière) et le résultat de la personne (Cobey : « le texte doit changer pour chaque cas de figure »).
  var RS_R1 = {
    'aucune': ['Aucun client n’a encore été ramassé en semaine {sem}.', 'Semaine {sem} : la ramasse n’a pas encore commencé.', 'La ramasse de la semaine {sem} est encore vide.', 'Rien à comparer pour l’instant : la semaine {sem} démarre.'],
    'zero': ['Semaine {sem} : la ramasse compte {t} clients, mais {S} n’en {a} pas encore ramené.', '{S} {a} 0 client sur les {t} de la semaine {sem}.', 'La ramasse avance ({t} clients en semaine {sem}), mais {S} n’{a} pas encore participé.', 'Sur les {t} clients de la semaine {sem}, {S} n’en {a} encore aucun.'],
    'petit': ['{S} {a} ramené {n} client{s} sur les {t} de la semaine {sem}, soit {pc} %.', 'Semaine {sem} : {n} client{s} pour {S} sur {t} au total ({pc} %).', 'Sur la ramasse de la semaine {sem} ({t} clients), {S} {a} apporté {n} client{s} : {pc} %.', 'Une petite part de la ramasse cette semaine : {n} sur {t}, soit {pc} %.', '{S} {a} contribué à hauteur de {pc} % en semaine {sem} ({n} sur {t}).'],
    'moyen': ['{S} {a} ramené {n} clients sur les {t} de la semaine {sem} : {pc} % de la ramasse.', 'Belle participation en semaine {sem} : {n} clients sur {t}, soit {pc} %.', 'Sur {t} clients ramassés en semaine {sem}, {S} en {a} apporté {n} ({pc} %).', '{S} {a} apporté {pc} % de la ramasse de la semaine {sem} ({n} clients sur {t}).', 'Une vraie contribution en semaine {sem} : {n} clients sur {t}, soit {pc} %.'],
    'gros': ['{S} {a} porté la ramasse de la semaine {sem} : {n} clients sur {t}, soit {pc} %.', 'Semaine {sem} : {S} {a} ramené {n} clients sur {t}, soit {pc} % de la ramasse !', 'Énorme contribution en semaine {sem} : {n} clients sur {t} ({pc} %).', '{S} {a} fait le gros de la ramasse en semaine {sem} : {n} sur {t} ({pc} %).', '{S} {a} fait un gros travail en semaine {sem} : {n} clients sur {t} ({pc} %).']
  };
  var RS_R2 = {
    '1': {
      'atteint': ['{son} objectif de la semaine ({objS}) est atteint dès le départ, bravo !', 'Départ réussi : {son} objectif de la semaine ({objS}) est rempli.'],
      'proche': ['Presque : encore {reste} pour {son} objectif de la semaine ({objS}).', 'Très bon départ, il manque seulement {reste} pour l’objectif de la semaine ({objS}).'],
      'moyen': ['Bon début : {n} sur {objS} pour l’objectif de la semaine, il reste du temps.', 'La semaine {sem} est lancée : encore {reste} pour atteindre l’objectif de {objS}.'],
      'faible': ['Début tranquille : {n} sur {objS}, rien d’inquiétant en première semaine.', 'Le container démarre : l’objectif de la semaine ({objS}) est encore loin, mais tout reste possible.'],
      'zero': ['Pas de pression en première semaine : l’objectif est de {objS}, le premier client lance tout.', 'Le container démarre à peine : appelle tes contacts, l’objectif de la semaine est de {objS}.']
    },
    '2': {
      'atteint': ['{son} objectif de la semaine ({objS}) est atteint, belle régularité !', 'Objectif de la semaine rempli ({objS}) : {S} {es} dans les temps.'],
      'proche': ['Presque : il manque {reste} pour l’objectif de la semaine ({objS}).', 'Encore {reste} client{r} et l’objectif de la semaine ({objS}) est atteint.'],
      'moyen': ['À mi-chemin de l’objectif de la semaine : {n} sur {objS}, il reste {reste} à trouver.', 'Il faut encore {reste} client{r} pour atteindre l’objectif de la semaine ({objS}).'],
      'faible': ['L’objectif de la semaine ({objS}) est encore loin : {n} pour l’instant, relance tes contacts.', 'Semaine {sem} difficile : {n} sur {objS}, il faut accélérer.'],
      'zero': ['Aucun client en semaine {sem} : l’objectif de {objS} demande de relancer les contacts.', 'Il faut démarrer : {objS} client{os} à ramener pour atteindre l’objectif de la semaine.']
    },
    '3': {
      'atteint': ['Objectif de la semaine atteint ({objS}) : {S} {es} dans le rythme à mi-container.', '{son} objectif de la semaine ({objS}) est rempli, on garde le cap.'],
      'proche': ['À mi-container, il manque {reste} pour l’objectif de la semaine ({objS}).', 'Encore {reste} client{r} pour boucler l’objectif de la semaine ({objS}).'],
      'moyen': ['{n} sur {objS} cette semaine : il en manque {reste} pour rester dans le rythme.', 'Semaine {sem} : l’objectif de {objS} n’est qu’à moitié atteint, encore {reste} à trouver.'],
      'faible': ['Attention, l’objectif de la semaine ({objS}) s’éloigne : {n} seulement pour l’instant.', 'Semaine {sem} en retrait : {n} sur {objS}, il faut remonter.'],
      'zero': ['Rien cette semaine alors que le container avance : l’objectif est de {objS}, il faut s’y mettre.', 'Aucun client en semaine {sem} : {objS} à ramener pour rester dans le rythme.']
    },
    '4': {
      'atteint': ['{son} objectif de la semaine ({objS}) est atteint, la fin approche bien.', 'Objectif rempli ({objS}) : plus que quelques jours avant le chargement.'],
      'proche': ['La fin approche : il manque {reste} pour l’objectif de la semaine ({objS}).', 'Un dernier petit effort : encore {reste} client{r} cette semaine.'],
      'moyen': ['{n} sur {objS} : il reste {reste} à trouver avant la fin du container.', 'Le chargement se rapproche, encore {reste} pour l’objectif de la semaine ({objS}).'],
      'faible': ['Le chargement approche : {n} sur {objS}, il faut accélérer maintenant.', 'Peu de temps restant : l’objectif de la semaine ({objS}) est encore loin ({n}).'],
      'zero': ['Aucun client alors que la fin approche : appelle tous tes contacts, l’objectif est de {objS}.', 'Le chargement approche et le compteur de la semaine est à 0 : il faut s’y mettre.']
    },
    'D': {
      'atteint': ['Dernière semaine : {son} objectif ({objS}) est atteint, quel final !', 'Objectif rempli ({objS}) pour la dernière semaine, bravo !'],
      'proche': ['Dernière ligne droite : encore {reste} pour l’objectif de la semaine ({objS}).', 'Dernière semaine : il manque {reste} client{r} pour finir sur l’objectif.'],
      'moyen': ['Dernière semaine : {n} sur {objS}, il faut {reste} de plus avant le chargement.', 'Le chargement est proche : encore {reste} pour atteindre l’objectif de {objS}.'],
      'faible': ['Dernière semaine : {n} seulement sur {objS}, c’est le moment de tout donner.', 'Avant le chargement, il manque encore {reste} pour l’objectif de la semaine.'],
      'zero': ['Dernière semaine et aucun client : dernière chance de ramener {objS} client{os}.', 'Le chargement arrive : un seul client compte encore, appelle tes contacts maintenant.']
    }
  };
  var RS_R3 = {
    '1': {
      'atteint': ['Depuis le début : {cn} sur {objC}, {son} objectif pour le container est déjà atteint !', '{cn} client{cr} depuis le départ : l’objectif du container ({objC}) est rempli.'],
      'avance': ['Depuis le début : {cn} client{cr} sur {ct} ({cpc} %), {S} {es} en avance sur {son} rythme.', 'Bon départ au niveau du container : {cn} sur {objC}, déjà en avance.'],
      'temps': ['Depuis le début : {cn} client{cr} sur {ct} ({cpc} %), {S} {es} dans les temps.', 'Début de container : {cn} sur {objC}, {son} rythme est bon.'],
      'retard': ['Depuis le début : {cn} client{cr} sur {ct} ({cpc} %) — il faut lancer {son} container.', '{cn} sur {objC} pour le container : le départ est lent, il reste toutes les semaines à venir.']
    },
    '2': {
      'atteint': ['Depuis le début : {cn} sur {objC}, {son} objectif pour le container est atteint !', '{cn} clients : {S} {a} rempli {son} objectif pour le container avant la fin.'],
      'avance': ['Depuis le début : {cn} client{cr} sur {ct} ({cpc} %), {S} {es} en avance de {avance}.', 'Sur le container, {S} {es} en avance : {cn} sur {objC}.'],
      'temps': ['Depuis le début : {cn} client{cr} sur {ct} ({cpc} %), {S} {es} dans les temps pour {objC}.', 'Sur le container : {cn} sur {objC}, le rythme est tenu.'],
      'retard': ['Depuis le début : {cn} client{cr} sur {ct} ({cpc} %), il manque {manque} pour être dans les temps.', 'Sur le container : {cn} sur {objC}, {manque} de retard à rattraper.']
    },
    '3': {
      'atteint': ['Depuis le début : {cn} sur {objC}, objectif container atteint à mi-parcours !', '{cn} clients : {S} {a} déjà rempli {son} objectif pour le container.'],
      'avance': ['Depuis le début : {cn} client{cr} sur {ct} ({cpc} %), {S} {es} en avance de {avance} à mi-container.', 'À mi-container : {cn} sur {objC}, bien devant le rythme.'],
      'temps': ['Depuis le début : {cn} client{cr} sur {ct} ({cpc} %), {S} {es} dans les temps à mi-container.', 'À mi-container : {cn} sur {objC}, le rythme est tenu.'],
      'retard': ['Depuis le début : {cn} client{cr} sur {ct} ({cpc} %), {manque} de retard à mi-container.', 'À mi-container : {cn} sur {objC}, il faut rattraper {manque}.']
    },
    '4': {
      'atteint': ['Depuis le début : {cn} sur {objC}, objectif container atteint avant la fin !', '{cn} clients : {son} objectif pour le container est rempli, bravo.'],
      'avance': ['Depuis le début : {cn} client{cr} sur {ct} ({cpc} %), {S} {es} en avance de {avance}.', 'La fin approche : {cn} sur {objC}, {S} {es} devant le rythme.'],
      'temps': ['Depuis le début : {cn} client{cr} sur {ct} ({cpc} %), {S} {es} dans les temps pour finir.', 'La fin approche : {cn} sur {objC}, le rythme est tenu.'],
      'retard': ['Depuis le début : {cn} client{cr} sur {ct} ({cpc} %), il manque {manque} avant le chargement.', 'La fin approche : {cn} sur {objC}, {manque} de retard à rattraper vite.']
    },
    'D': {
      'atteint': ['Bilan du container : {cn} sur {objC}, objectif atteint, bravo !', '{cn} clients ramenés sur {ct} : {son} objectif pour le container est rempli.'],
      'avance': ['Bilan du container : {cn} client{cr} sur {ct} ({cpc} %), {S} {es} en avance sur {son} rythme.', 'Dernière semaine : {cn} sur {objC}, {S} finit devant le rythme.'],
      'temps': ['Bilan du container : {cn} client{cr} sur {ct} ({cpc} %), {S} {es} dans les temps.', 'Dernière semaine : {cn} sur {objC}, le rythme est tenu jusqu’au bout.'],
      'retard': ['Bilan du container : {cn} client{cr} sur {ct} ({cpc} %), il manque {manque} pour {son} objectif.', 'Dernière semaine : {cn} sur {objC}, {manque} de retard à la clôture.']
    }
  };
  var RS_EQ1 = {
    'aucune': ['Aucun client n’a encore été ramassé en semaine {sem}.', 'Semaine {sem} : la ramasse n’a pas encore commencé.', 'La ramasse de la semaine {sem} est encore vide.'],
    'faible': ['Semaine {sem} : {t} clients ramassés pour {od} attendus, il faut accélérer.', 'La ramasse de la semaine {sem} compte {t} clients sur les {od} visés.', '{t} clients cette semaine pour un objectif de {od} : le rythme est lent.'],
    'moyen': ['Semaine {sem} : {t} clients ramassés sur {od} attendus, ça avance.', 'La ramasse de la semaine {sem} est à {t} sur {od} : plus de la moitié du chemin.', '{t} clients sur {od} en semaine {sem}, encore un effort.'],
    'atteint': ['Semaine {sem} : objectif atteint avec {t} clients ramassés sur {od} attendus !', 'Bravo : la ramasse de la semaine {sem} atteint {t} clients (objectif {od}).', '{t} clients en semaine {sem} : l’objectif de {od} est rempli.']
  };
  var RS_EQ2 = {
    'tous': ['Depuis le début du container : {ct} clients ramassés sur {objC}.', 'Au total, le container compte {ct} clients sur {objC} visés.', 'Cumul depuis la semaine 1 : {ct} clients sur les {objC} du container.']
  };
  function rediger(liste, v, tu, nom, cle, sig){
    var jet = { S: tu ? 'tu' : nom, a: tu ? 'as' : 'a', es: tu ? 'es' : 'est', son: tu ? 'ton' : 'son', sa: tu ? 'ta' : 'sa', ses: tu ? 'tes' : 'ses',
      s: v.n > 1 ? 's' : '', r: v.reste > 1 ? 's' : '', cr: v.cn > 1 ? 's' : '', os: v.objS > 1 ? 's' : '', bs: v.bn > 1 ? 's' : '' };
    var fam = liste.map(function(t){
      var x = t.replace(/\{(\w+)\}/g, function(m, k){ return jet[k] != null ? jet[k] : (v[k] != null ? v[k] : m); });
      return x.charAt(0).toUpperCase() + x.slice(1);
    });
    return phraseStable(cle, sig, fam);
  }
  /* ---------- Historique des containers et bilan (Cobey : « un côté l'historique, un côté le container en cours, sans rien mélanger ») ---------- */
  var pageOnglet = 'cours', pageBilan = '';
  var JOURS_L = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  function jourLong(iso){ var j = jours(iso); if(isNaN(j)) return ''; var t = JOURS_L[(j + 4) % 7] + ' ' + dateJour(iso); return t.charAt(0).toUpperCase() + t.slice(1); }
  function qui(){
    var admin = estAdminVue(), reel = (window.currentUser || {}).id, moi = admin ? lireVue() : reel, nom = '';
    collabsClassement().forEach(function(c){ if(c.id === moi) nom = c.name; });
    return { admin: admin, reel: reel, moi: nom ? moi : '', tu: !admin && moi === reel && !!nom, nom: nom };
  }
  function statsContainer(d){
    var liste = collabsClassement(), xs = fichesRamassees(d._id), info = infoContainer(d), N = info ? info.N : 1, dj = info ? jours(info.debut) : 0;
    var tot = {}, cnt = [];
    for(var k = 0; k < N; k++) cnt.push(0);
    liste.forEach(function(co){ var c = []; for(var k2 = 0; k2 < N; k2++) c.push(0); tot[co.id] = { co: co, n: 0, eu: 0, cnt: c }; });
    var nT = 0, euT = 0;
    xs.forEach(function(x){
      var pr = parseFloat(x.c.prix) || 0; nT++; euT += pr;
      var di = dateRamasse(x), w = (info && di) ? Math.max(0, Math.min(N - 1, Math.floor((jours(di) - dj) / 7))) : -1;
      if(w >= 0) cnt[w]++;
      var co = auteurDe(x.c, liste); if(!co) return;
      tot[co.id].n++; tot[co.id].eu += pr; if(w >= 0) tot[co.id].cnt[w]++;
    });
    var rang = liste.map(function(co){ return tot[co.id]; }).sort(function(a, b){ return (b.eu - a.eu) || (b.n - a.n) || a.co.name.localeCompare(b.co.name); });
    return { d: d, info: info, N: N, cnt: cnt, tot: tot, rang: rang, nT: nT, euT: euT };
  }
  // Barres verticales alignées : toute la ramasse (bleu) et, à côté, la personne (vert).
  function barresHtml(cnt, cntP, N, sem, avecP){
    var mx = Math.max(Math.max.apply(null, cnt), avecP ? Math.max.apply(null, cntP) : 0, 1), bars = '', labs = '';
    var hh = function(v){ return v > 0 ? Math.max(4, Math.round(v / mx * 88)) : 2; };
    for(var w = 0; w < N; w++){
      var fut = w + 1 > sem;
      bars += '<div class="pg-c' + (fut ? ' fut' : '') + '"><div class="pg-duo">'
        + (fut ? '' : '<div class="pg-b t" style="height:' + hh(cnt[w]) + 'px"><b>' + cnt[w] + '</b></div>' + (avecP ? '<div class="pg-b p" style="height:' + hh(cntP[w]) + 'px"><b>' + cntP[w] + '</b></div>' : '')) + '</div></div>';
      labs += '<span class="' + (w + 1 === sem ? 'cur' : (fut ? 'fut' : '')) + '">S' + (w + 1) + '</span>';
    }
    return { bars: bars, labs: labs };
  }
  // Le chargement, en grand : date, compte à rebours et frise des semaines.
  function chargementHtml(d){
    var info = infoContainer(d); if(!info) return '';
    var reste = jours(info.fin) - jours(auj()), j = reste > 1 ? '<b>' + reste + '</b><small>jours</small>' : (reste === 1 ? '<b>demain</b>' : (reste === 0 ? '<b>aujourd’hui</b>' : '<b>chargé</b>')), fr = '';
    for(var k = 1; k <= info.N; k++){
      fr += '<div class="ld-s ' + (k < info.sem ? 'ok' : (k === info.sem ? 'cur' : '')) + '">' + (k < info.sem ? '✓' : k) + '</div>' + (k < info.N ? '<div class="ld-b"></div>' : '');
    }
    return '<div class="opg"><div class="ob-m ld on"><div class="ld-j">' + j + '</div><div class="ld-l">🚛 CHARGEMENT</div><div class="ld-d">' + esc(jourLong(info.fin)) + '</div>'
      + '<div class="ld-c">Container ' + esc(String(d.nom || '').replace(/^Chargement\s+/i, '')) + ' · semaine ' + info.sem + ' sur ' + info.N + '</div><div class="ld-fr">' + fr + '<span class="ld-f">🏁</span></div></div></div>';
  }
  var BILAN_R1 = {
    zero: ['{S} n’{a} pas ramené de client sur ce container.', 'Aucun client de {S} sur les {ct} de ce container.', 'Pas de client ramené cette fois : le prochain container est une nouvelle chance.'],
    petit: ['{S} {a} ramené {n} client{s} sur les {ct} du container ({pc} %).', 'Une petite contribution : {n} client{s} sur {ct}, soit {pc} %.', '{n} client{s} pour {S} sur {ct} au total : {pc} % du container.'],
    moyen: ['{S} {a} apporté {n} clients sur {ct} : {pc} % du container.', 'Belle participation : {n} clients sur les {ct} du container ({pc} %).', 'Sur {ct} clients, {S} en {a} ramené {n}, soit {pc} %.'],
    gros: ['{S} {a} porté ce container : {n} clients sur {ct}, soit {pc} % !', 'Énorme contribution : {n} clients sur {ct} ({pc} % du container).', '{S} {a} fait le gros du travail : {n} sur {ct} ({pc} %).']
  };
  var BILAN_R2 = {
    zero: ['Aucune semaine à retenir cette fois : rendez-vous au prochain container.', 'Le compteur est resté à zéro : le prochain container est une nouvelle chance.'],
    best: ['{sa} meilleure semaine : la semaine {bw}, avec {bn} client{bs}.', 'Le plus gros dimanche : semaine {bw}, {bn} client{bs} ramené{bs}.', 'C’est en semaine {bw} que {S} {a} le plus apporté : {bn} client{bs}.']
  };
  var BILAN_R3 = {
    premier: ['Premier du classement final : bravo !', 'Première place au classement final, félicitations !', 'Le meilleur du container, tout simplement !'],
    podium: ['Sur le podium du classement final : place {p} sur {nb}.', 'Belle place {p} sur {nb} au classement final.', 'Place {p} sur {nb} : un très bon container.'],
    autre: ['Place {p} sur {nb} au classement final : on fait mieux au prochain.', 'Classement final : {p}e sur {nb}, de la marge pour le prochain container.', '{p}e sur {nb} : le prochain container est l’occasion de monter.'],
    zero: ['Classement final : {p}e sur {nb}, rendez-vous au prochain container.', 'Pas de client cette fois, {p}e sur {nb} : on repart pour le prochain.']
  };
  function etatLib(o){ return o.statut === 'arrive' ? ((o.pays || 'SN') === 'ML' ? 'Arrivé à Bamako' : 'Arrivé à Dakar') : (o.statut === 'cloture' ? 'Clôturé' : 'Parti'); }
  function containersPartis(){
    var dd = window.departsData || {};
    return Object.keys(dd).map(function(k){ var o = dd[k]; if(!o || typeof o !== 'object') return null; o = Object.assign({}, o); o._id = k; return o; })
      .filter(function(o){ return o && o.statut !== 'preparation' && o.special !== 'depot' && o.dateDepart; })
      .sort(function(a, b){ return String(b.dateDepart).localeCompare(String(a.dateDepart)); });
  }
  function histoHtml(){
    var q = qui(), h = '', liste = containersPartis(), nb = 0;
    var cartes = '';
    liste.forEach(function(o){
      var st = statsContainer(o); if(!st.nT) return; nb++;
      var nomC = String(o.nom || 'Container').replace(/^Chargement\s+/i, '') + ' · ' + dateCourte(o.dateDepart);
      var bil;
      if(q.moi){
        var me = st.tot[q.moi], pl = st.rang.indexOf(me) + 1;
        bil = '<b>' + (q.tu ? 'Ton bilan' : 'Bilan de ' + esc(q.nom)) + ' :</b> ' + pl + (pl === 1 ? 'er' : 'e') + ' sur ' + st.rang.length + ' · ' + me.n + ' client' + (me.n > 1 ? 's' : '') + ' · ' + eurosFr(me.eu);
      } else bil = '<b>Container :</b> ' + st.nT + ' client' + (st.nT > 1 ? 's' : '') + ' · ' + eurosFr(st.euT);
      cartes += '<div class="opg"><div class="hs-card" data-bilan="' + esc(o._id) + '"><div class="hs-ic">🚛</div><div class="hs-x"><b>' + esc(nomC) + '</b><small>' + st.N + ' semaines · ' + st.nT + ' client' + (st.nT > 1 ? 's' : '') + '</small><span class="hs-chip">' + esc(etatLib(o)) + '</span></div><div class="hs-ch">›</div><div class="hs-bil">' + bil + '</div></div></div>';
    });
    h += '<div class="pg-t"><b>CONTAINERS TERMINÉS</b><span>' + nb + '</span></div>' + (cartes || '<div class="pg-pied" style="text-align:center">Aucun container terminé pour le moment.</div>');
    var cs = containers();
    if(cs.length){
      h += '<div class="pg-t"><b>🔎 EN PRÉPARATION</b></div>';
      cs.forEach(function(d){
        var inf = infoContainer(d);
        h += '<div class="opg"><div class="hs-card hs-cur" data-otab="cours"><div class="hs-ic">🚛</div><div class="hs-x"><b>' + esc(String(d.nom || 'Container').replace(/^Chargement\s+/i, '') + ' · ' + dateCourte(d.dateDepart || '')) + '</b><small>' + (inf ? 'semaine ' + inf.sem + ' sur ' + inf.N + ' · ' : '') + nbContainer(d._id) + ' client' + (nbContainer(d._id) > 1 ? 's' : '') + '</small></div><div class="hs-ch">›</div></div></div>';
      });
    }
    return h + '<div class="pg-pied">Les containers partis sont rangés ici, du plus récent au plus ancien. Touche-en un pour voir le bilan.</div>';
  }
  function bilanHtml(cid){
    var o = (window.departsData || {})[cid], q = qui();
    if(!o) return '<div class="pg-pied"><span class="hs-back" data-retour="1">← Historique</span><br>Container introuvable.</div>';
    o = Object.assign({}, o, { _id: cid });
    var st = statsContainer(o), nomC = String(o.nom || 'Container').replace(/^Chargement\s+/i, '') + ' · ' + dateCourte(o.dateDepart || '');
    var h = '<div class="hs-back" data-retour="1">← Historique</div><div class="hs-titre">' + esc(nomC) + '</div>'
      + '<div style="text-align:center;margin-bottom:6px"><span class="hs-chip">Chargé le ' + esc(jourLong(o.dateDepart).replace(/^./, function(c){ return c.toLowerCase(); })) + ' · ' + st.N + ' semaines</span></div>';
    var me = q.moi ? st.tot[q.moi] : null, pl = me ? st.rang.indexOf(me) + 1 : 0;
    if(me){
      var pc = st.nT > 0 ? Math.round(me.n / st.nT * 100) : 0, bw = 0, bn = 0;
      me.cnt.forEach(function(v, i){ if(v > bn){ bn = v; bw = i + 1; } });
      var v = { n: me.n, ct: st.nT, pc: pc, bw: bw, bn: bn, p: pl, nb: st.rang.length, N: st.N };
      var c1 = me.n === 0 ? 'zero' : (pc < 10 ? 'petit' : (pc < 25 ? 'moyen' : 'gros')), c3 = me.n === 0 ? 'zero' : (pl === 1 ? 'premier' : (pl <= 3 ? 'podium' : 'autre'));
      var base = 'bil' + q.moi + cid;
      var l1 = rediger(BILAN_R1[c1], v, q.tu, q.nom, base + 'a', me.n + ':' + st.nT + c1);
      var l2 = bn > 0 ? rediger(BILAN_R2.best, v, q.tu, q.nom, base + 'b', bw + ':' + bn) : rediger(BILAN_R2.zero, v, q.tu, q.nom, base + 'b', '0');
      var l3 = rediger(BILAN_R3[c3], v, q.tu, q.nom, base + 'c', pl + ':' + st.rang.length + c3);
      var md = me.eu > 0 && pl <= 3 ? '<span class="hs-md">' + ['🥇', '🥈', '🥉'][pl - 1] + '</span>' : '<span class="hs-md num">' + pl + '</span>';
      h += '<div class="pg-t"><b>🎯 ' + (q.tu ? 'TON BILAN' : 'BILAN DE ' + esc(q.nom.toUpperCase())) + '</b></div>'
        + '<div class="opg"><div class="ob-m b on" style="background:linear-gradient(135deg,rgba(74,85,200,.14),rgba(74,85,200,.04))"><div class="hs-pl">' + md + '<div><b>' + pl + (pl === 1 ? 'er' : 'e') + ' sur ' + st.rang.length + '</b><small>' + esc(q.nom) + '</small></div></div>'
        + '<div class="hs-tl"><div>CLIENTS<b>' + me.n + '</b></div><div>EUROS<b>' + eurosFr(me.eu) + '</b></div><div>PART DU CONTAINER<b>' + pc + ' %</b></div></div>'
        + '<div class="pg-sum"><div><i>📦</i><span>' + esc(l1) + '</span></div><div><i>📅</i><span>' + esc(l2) + '</span></div><div><i>🏅</i><span>' + esc(l3) + '</span></div></div></div></div>';
    } else {
      h += '<div class="pg-t"><b>📦 LE CONTAINER</b></div><div class="opg"><div class="ob-m b on" style="background:linear-gradient(135deg,rgba(74,85,200,.14),rgba(74,85,200,.04))"><div class="hs-tl"><div>CLIENTS<b>' + st.nT + '</b></div><div>EUROS<b>' + eurosFr(st.euT) + '</b></div><div>SEMAINES<b>' + st.N + '</b></div></div></div></div>';
    }
    var gb = barresHtml(st.cnt, me ? me.cnt : [], st.N, st.N, !!me);
    h += '<div class="pg-t"><b>📅 PAR DIMANCHE</b><span>' + (me ? (q.tu ? 'ta ramasse' : 'vue de ' + esc(q.nom)) : 'toute la ramasse') + '</span></div>'
      + '<div class="opg"><div class="ob-m b on" style="background:linear-gradient(135deg,rgba(74,85,200,.14),rgba(74,85,200,.04))"><div class="pg-leg"><span><i class="lt"></i>Toute la ramasse</span>' + (me ? '<span><i class="lp"></i>' + (q.tu ? 'Toi' : esc(q.nom)) + '</span>' : '') + '</div>'
      + '<div class="pg-gr2" style="grid-template-columns:repeat(' + st.N + ',1fr)">' + gb.bars + '</div><div class="pg-lab" style="grid-template-columns:repeat(' + st.N + ',1fr)">' + gb.labs + '</div></div></div>';
    h += '<div class="pg-t"><b>🏆 CLASSEMENT FINAL</b></div><div class="opg"><div class="ob-m b on hs-cl" style="background:rgba(255,255,255,.55)">';
    st.rang.forEach(function(r, i){
      var av = (window.photosProfil && window.photosProfil.avatar) ? window.photosProfil.avatar(r.co.id, 26) : '';
      var md = r.eu > 0 && i < 3 ? '<span class="hs-md">' + ['🥇', '🥈', '🥉'][i] + '</span>' : '<span class="hs-md num">' + (i + 1) + '</span>';
      h += '<div class="hs-r' + (r.co.id === q.moi ? ' moi' : '') + '">' + md + av + '<span class="hs-n">' + esc(r.co.name) + (r.co.id === q.moi ? (q.admin ? ' 👁️' : ' (toi)') : '') + '</span><span class="hs-k">' + r.n + ' client' + (r.n > 1 ? 's' : '') + '</span><b>' + eurosFr(r.eu) + '</b></div>';
    });
    return h + '</div></div><div class="pg-pied">Bilan calculé sur les clients ramassés de ce container (collecte validée, France ramassée, dépôt direct).</div>';
  }
  function htmlPage(){
    var q = qui(), h = '';
    if(q.admin){
      h += '<div class="pg-vue"><label for="obj-vue">👁️ Voir comme</label><select id="obj-vue"><option value="">Équipe</option>'
        + collabsClassement().map(function(c){ return '<option value="' + esc(c.id) + '"' + (c.id === lireVue() ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</select></div>';
    }
    if(pageBilan) return h + bilanHtml(pageBilan);
    h += '<div class="pg-seg"><button type="button" data-otab="cours" class="' + (pageOnglet === 'cours' ? 'on' : '') + '">🚛 En cours</button><button type="button" data-otab="histo" class="' + (pageOnglet === 'histo' ? 'on' : '') + '">🗂️ Historique</button></div>';
    return h + (pageOnglet === 'histo' ? histoHtml() : htmlEnCours());
  }
  function htmlEnCours(){
    var h = '', cs = containers(), classement = slidesClassement(), reel = (window.currentUser || {}).id;
    // Cobey : « un sous-menu pour avoir accès à chaque fenêtre de chacun, pour me éviter de me connecter dans leur profil : uniquement pour moi ».
    var admin = estAdminVue(), vue = lireVue(), moi = admin ? vue : reel, cibleNom = '';
    collabsClassement().forEach(function(c){ if(c.id === moi) cibleNom = c.name; });
    if(!cs.length) return '<div class="pg-pied" style="text-align:center;margin-top:40px">Aucun container en préparation pour le moment.<br>Les containers terminés sont dans l’onglet Historique.</div>';
    // « Pour chaque profil, en haut de la page, son objectif à lui » (Cobey) : la carte personnelle de la personne connectée.
    h += chargementHtml(cs[0]);
    var perso = classement.filter(function(x){ return x.id === moi; })[0], inf1 = infoContainer(cs[0]);
    if(perso){
      var fs1 = inf1 ? Math.min(1, (7 * inf1.sem) / ((jours(inf1.fin) - jours(inf1.debut)) + 1)) : null, cible = fs1 === null ? null : Math.round(perso.obj * fs1);
      var noteP = cible === null ? '' : (perso.n >= perso.obj ? '✅ Ton objectif est atteint, bravo !' : (perso.n >= cible ? '✅ Tu es dans les temps pour la semaine ' + inf1.sem + ' (' + cible + ' clients)' : '⏱️ Pour être dans les temps à la fin de la semaine ' + inf1.sem + ' : ' + cible + ' clients (il t’en manque ' + (cible - perso.n) + ')'));
      var avP = (window.photosProfil && window.photosProfil.avatar) ? window.photosProfil.avatar(perso.id, 28) : '';
      var mdP = perso.medaille ? '<span class="cl-md">' + ['🥇', '🥈', '🥉'][perso.i] + '</span>' : '<span class="cl-md num">' + (perso.i + 1) + '</span>';
      h += '<div class="pg-t"><b>🎯 TON OBJECTIF</b><span>' + esc(perso.rang) + '</span></div>'
        + '<div class="opg"><div class="ob-m ' + perso.classe + ' on moi"><div class="ob-l1">' + mdP + avP + '<span class="cl-nom">' + esc(perso.nom) + '</span><span class="cl-rk"></span><span class="cl-n"><b>' + eurosFr(perso.eu) + '</b></span></div>'
        + '<div class="pg-big">' + perso.n + ' <i>/ ' + perso.obj + ' clients ramassés</i></div>'
        + '<div class="ob-bar"><i style="width:' + perso.pct.toFixed(1) + '%"></i>' + (perso.repere !== null && perso.n < perso.obj ? '<u style="left:calc(' + perso.repere.toFixed(1) + '% - 1px)"></u>' : '') + '</div>'
        + '<div class="ob-l2 cl-l2"><span><i class="ob-t">' + esc(perso.txt) + '</i></span>' + (perso.nSem > 0 ? '<span class="cl-wk">+' + perso.nSem + ' cette semaine</span>' : '') + '</div>'
        + (noteP ? '<div class="pg-note">' + noteP + '</div>' : '') + '</div></div>';
    } else if(admin && !moi){
      h += '<div class="pg-pied" style="margin:0 4px 4px">Tu suis l’équipe depuis un profil administrateur : tu n’apparais pas dans le classement. Choisis une personne dans « Voir comme » pour voir sa page.</div>';
    }
    cs.forEach(function(d){
      var nomC = String(d.nom || 'Container').replace(/^Chargement\s+/i, '') + (d.dateDepart ? ' · ' + dateCourte(d.dateDepart) : '');
      var info = infoContainer(d), m = messageContainer(d), obj = cfg.container;
      // 1. le container
      var note = '';
      if(info && m.n < obj){
        var finSem = Math.min(1, (7 * info.sem) / ((jours(info.fin) - jours(info.debut)) + 1)), cible = Math.round(obj * finSem);
        note = '<div class="pg-note">' + (m.n >= cible ? '✅ Objectif de la semaine ' + info.sem + ' (' + cible + ') atteint' : '⏱️ Pour être dans les temps à la fin de la semaine ' + info.sem + ' : ' + cible + ' clients (il en manque ' + (cible - m.n) + ')') + '</div>';
      }
      h += '<div class="pg-t"><b>🚛 ' + esc(nomC) + '</b><span>' + (info ? 'Semaine ' + info.sem + ' sur ' + info.N : '') + '</span></div>'
        + '<div class="opg"><div class="ob-m ' + m.classe + ' on"><div class="ob-l1"><span class="ob-tag">OBJECTIF</span><span class="ob-nom">container</span></div>'
        + '<div class="pg-big">' + m.n + ' <i>/ ' + obj + ' clients ramassés</i></div>'
        + '<div class="ob-bar"><i style="width:' + m.pct.toFixed(1) + '%"></i>' + (m.repere !== null && m.classe !== 'd' ? '<u style="left:calc(' + m.repere.toFixed(1) + '% - 1px)"></u>' : '') + '</div>'
        + '<div class="ob-l2">' + esc(m.txt) + '</div>' + note + '</div></div>';
      // 2. par dimanche : barres verticales (toute la ramasse, et ce que la personne a ramené) + résumé écrit
      if(info){
        var dj = jours(info.debut), cnt = [], cntP = [], liste0 = collabsClassement(); for(var k = 0; k < info.N; k++){ cnt.push(0); cntP.push(0); }
        fichesRamassees(d._id).forEach(function(x){
          var di = dateRamasse(x); if(!di) return;
          var w = Math.max(0, Math.min(info.N - 1, Math.floor((jours(di) - dj) / 7))); cnt[w]++;
          if(moi){ var co = auteurDe(x.c, liste0); if(co && co.id === moi) cntP[w]++; }
        });
        var od = objDimanche(), gb = barresHtml(cnt, cntP, info.N, info.sem, !!moi), bars = gb.bars, labs = gb.labs;
        var tu = !admin && moi === reel, wk = info.sem - 1, nT = cnt[wk], nP = cntP[wk], pcw = nT > 0 ? Math.round(nP / nT * 100) : 0, sT = 0, sP = 0;
        cnt.forEach(function(v){ sT += v; }); cntP.forEach(function(v){ sP += v; });
        var resume = '';
        if(moi && perso){
          var objS = Math.max(1, Math.ceil(perso.obj / info.N)), ratioS = nP / objS, att2 = perso.obj * info.p;
          var c1 = nT === 0 ? 'aucune' : (nP === 0 ? 'zero' : (pcw < 25 ? 'petit' : (pcw < 50 ? 'moyen' : 'gros')));
          var c2 = ratioS >= 1 ? 'atteint' : (ratioS >= 0.7 ? 'proche' : (ratioS >= 0.4 ? 'moyen' : (nP > 0 ? 'faible' : 'zero')));
          var c3 = sP >= perso.obj ? 'atteint' : (sP >= att2 + perso.obj * 0.08 ? 'avance' : (sP >= att2 - perso.obj * 0.06 ? 'temps' : 'retard'));
          var v = { n: nP, t: nT, pc: pcw, sem: info.sem, N: info.N, objS: objS, reste: Math.max(0, objS - nP), cn: sP, ct: sT, cpc: sT > 0 ? Math.round(sP / sT * 100) : 0, objC: perso.obj,
            manque: Math.max(1, Math.round(att2 - sP)), avance: Math.max(1, Math.round(sP - att2)) };
          var bk = info.bucket, base = 'rs' + moi + d._id;
          var l1 = rediger(RS_R1[c1], v, tu, cibleNom, base + 'a', nP + ':' + nT + ':' + c1);
          var l2 = rediger((RS_R2[bk] || RS_R2['2'])[c2], v, tu, cibleNom, base + 'b', nP + ':' + objS + ':' + c2 + bk);
          var l3 = rediger((RS_R3[bk] || RS_R3['2'])[c3], v, tu, cibleNom, base + 'c', sP + ':' + sT + ':' + c3 + bk);
          resume = '<div class="pg-sum"><div><i>📅</i><span>' + esc(l1) + '</span></div><div><i>🎯</i><span>' + esc(l2) + '</span></div><div><i>📦</i><span>' + esc(l3) + '</span></div></div>';
        } else {
          var ce = nT === 0 ? 'aucune' : (nT / od < 0.5 ? 'faible' : (nT < od ? 'moyen' : 'atteint')), ve = { t: nT, od: od, sem: info.sem, ct: sT, objC: cfg.container, n: 0, reste: 0, cn: 0 };
          resume = '<div class="pg-sum"><div><i>📅</i><span>' + esc(rediger(RS_EQ1[ce], ve, false, '', 'rse' + d._id + 'a', nT + ':' + ce)) + '</span></div>'
            + '<div><i>📦</i><span>' + esc(rediger(RS_EQ2.tous, ve, false, '', 'rse' + d._id + 'b', String(sT))) + '</span></div></div>';
        }
        h += '<div class="pg-t"><b>📅 PAR DIMANCHE</b><span>' + (moi ? (tu ? 'ta ramasse' : 'vue de ' + esc(cibleNom)) : 'objectif ' + od + ' / dimanche') + '</span></div>'
          + '<div class="opg"><div class="ob-m b on" style="background:linear-gradient(135deg,rgba(74,85,200,.14),rgba(74,85,200,.04))">'
          + '<div class="pg-leg"><span><i class="lt"></i>Toute la ramasse</span>' + (moi ? '<span><i class="lp"></i>' + (tu ? 'Toi' : esc(cibleNom)) + '</span>' : '') + '</div>'
          + '<div class="pg-gr2" style="grid-template-columns:repeat(' + info.N + ',1fr)">' + bars + '</div>'
          + '<div class="pg-lab" style="grid-template-columns:repeat(' + info.N + ',1fr)">' + labs + '</div>' + resume + '</div></div>';
      }
      // 3. le classement, tout le monde en même temps
      var lignes = classement.filter(function(x){ return x.container === String(d.nom || 'Container').replace(/^Chargement\s+/i, '') + (d.dateDepart ? ' · ' + dateCourte(d.dateDepart) : ''); });
      if(lignes.length){
        h += '<div class="pg-t"><b>🏆 CLASSEMENT' + (info ? ' · SEMAINE ' + info.sem + '/' + info.N : '') + '</b><span>' + (info ? 'mis à jour dimanche ' + esc(dateJour(info.dimanche)) : '') + '</span></div>';
        lignes.forEach(function(x){
          var av = (window.photosProfil && window.photosProfil.avatar) ? window.photosProfil.avatar(x.id, 28) : '';
          var md = x.medaille ? '<span class="cl-md">' + ['🥇', '🥈', '🥉'][x.i] + '</span>' : '<span class="cl-md num">' + (x.i + 1) + '</span>';
          h += '<div class="opg"><div class="ob-m ' + x.classe + ' on cp' + (x.id === moi ? ' moi' : '') + '"><div class="ob-l1">' + md + av + '<span class="cl-nom">' + esc(x.nom) + (x.id === moi ? (admin ? ' 👁️' : ' (toi)') : '') + '</span><span class="cl-rk"></span>'
            + '<span class="cl-n"><b>' + eurosFr(x.eu) + '</b></span></div>'
            + '<div class="ob-bar"><i style="width:' + x.pct.toFixed(1) + '%"></i>' + (x.repere !== null && x.n < x.obj ? '<u style="left:calc(' + x.repere.toFixed(1) + '% - 1px)"></u>' : '') + '</div>'
            + '<div class="ob-l2 cl-l2"><span style="font-weight:800">🎯 Objectif ' + x.n + ' / ' + x.obj + '</span>' + (x.nSem > 0 ? '<span class="cl-wk">+' + x.nSem + ' cette semaine</span>' : '') + '</div></div></div>';
        });
      }
    });
    h += '<div class="pg-pied">Seuls les clients <b>ramassés</b> (validés) comptent : collecte validée dans un camion, France ramassée par notre chauffeur ou le chauffeur externe, dépôt direct. Le trait sur chaque barre montre où l’on devrait en être aujourd’hui. Le classement est refait chaque dimanche, après la ramasse.</div>';
    return h;
  }
  document.addEventListener('click', function(e){
    var t = e.target.closest ? e.target.closest('[data-otab],[data-bilan],[data-retour]') : null; if(!t) return;
    if(t.hasAttribute('data-otab')){ pageOnglet = t.getAttribute('data-otab'); pageBilan = ''; }
    else if(t.hasAttribute('data-bilan')){ pageBilan = t.getAttribute('data-bilan'); pageOnglet = 'histo'; }
    else { pageBilan = ''; pageOnglet = 'histo'; }
    pageSig = ''; rendrePage(true);
    try{ var c = document.querySelector('#s-objectifs .content'); if(c) c.scrollTop = 0; }catch(x){}
  });
  var pageSig = '';
  function rendrePage(force){
    try{
      var z = document.getElementById('obj-page'); if(!z) return;
      var h = htmlPage();
      if(!force && h === pageSig) return;
      pageSig = h; z.innerHTML = h;
      var cs = containers()[0], inf = cs && infoContainer(cs), sous = document.getElementById('obj-sous');
      if(sous) sous.textContent = (pageBilan ? 'Bilan du container' : (pageOnglet === 'histo' ? 'Historique des containers' : (inf ? 'Semaine ' + inf.sem + ' sur ' + inf.N : 'Container et classement'))) + (estAdminVue() && lireVue() ? ' · vue de ' + (collabsClassement().filter(function(c){ return c.id === lireVue(); })[0] || {}).name : '');
    }catch(e){ console.error('objectifs : page', e); }
  }
  function ouvrirPage(){
    ecranPage();
    try{ goTo('s-objectifs'); }catch(e){ console.error(e); }
    rendrePage(true);
  }
  // La page se remet à jour toute seule tant qu'elle est ouverte (une validation de ramasse, un client France…).
  setInterval(function(){ var a = document.querySelector('.screen.active'); if(a && a.id === 's-objectifs' && !document.hidden) rendrePage(false); }, 3000);

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
      + '<p>L’objectif du dimanche se calcule tout seul : objectif du container ÷ nombre de semaines de ramasse (25 sur 4 semaines, 20 sur 5). Seuls les clients <b>ramassés</b> (validés) comptent ; un container se remplit en 4 semaines, parfois 5.</p>'
      + '<label for="ob-champ-c">Clients par container</label><input type="number" inputmode="numeric" min="1" id="ob-champ-c" value="' + cfg.container + '">'
      + '<label for="ob-champ-d">Clients par dimanche (valeur de secours)</label><input type="number" inputmode="numeric" min="1" id="ob-champ-d" value="' + cfg.dimanche + '">'
      + '<h3 style="margin-top:22px">Objectif de chaque collaborateur</h3>'
      + '<p>Clients à ramener par container. Le classement de l’accueil montre le compteur de chacun (« 16 / 30 »). Laisse vide pour garder le chiffre de départ.</p>'
      + collabsClassement().map(function(co){
          return '<label for="ob-champ-p-' + esc(co.id) + '">' + esc(co.name) + '</label><input type="number" inputmode="numeric" min="1" class="ob-perso" data-id="' + esc(co.id) + '" id="ob-champ-p-' + esc(co.id) + '" value="' + objPerso(co) + '">';
        }).join('')
      + '<div id="ob-total" style="margin-top:12px;font-size:13px;font-weight:800"></div>'
      + '<h3 style="margin-top:22px">Notification du classement</h3>'
      + '<p>Chaque <b>dimanche à 20h</b> (heure de Paris), chaque collaborateur reçoit sa place, son compteur et un message selon sa semaine ; toi, tu reçois le récapitulatif de l’équipe. '
      + 'Le jour du chargement, rien n’est envoyé : le <b>lendemain à 19h</b>, chacun reçoit le <b>bilan du container</b>.</p>'
      + '<label for="ob-ex-pour">Voir l’exemple de</label><select id="ob-ex-pour" style="width:100%;box-sizing:border-box;padding:13px;border-radius:14px;border:1.5px solid var(--border,#ddd);font:700 16px var(--font,inherit);background:var(--white,#fff);color:inherit">'
      + collabsClassement().map(function(co){ return '<option value="' + esc(co.id) + '">' + esc(co.name) + '</option>'; }).join('') + '<option value="RECAP">Récapitulatif de l’équipe</option></select>'
      + '<div style="display:flex;gap:8px;margin-top:10px"><button type="button" class="ob-ok ob-ex" data-final="0" style="margin:0;background:#26338f">Point de la semaine</button><button type="button" class="ob-ok ob-ex" data-final="1" style="margin:0;background:#8a5a00">Bilan du container</button></div>'
      + '<p style="margin-top:8px">L’exemple arrive sur ton téléphone dans la minute (notifications à autoriser). Il porte les vrais chiffres du moment.</p>'
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
    var ex = e.target.closest ? e.target.closest('.ob-ex') : null;
    if(ex){
      var pour = (document.getElementById('ob-ex-pour') || {}).value, moi = (window.currentUser || {}).id;
      if(!pour || !moi){ try{ showToastNew('⚠️ Choisis une personne.'); }catch(x){} return; }
      if(!window.db || !window.firebaseReady){ try{ showToastNew('❌ Connexion indisponible.'); }catch(x){} return; }
      Promise.resolve(db.ref('dct_classement_demande').push({ pourId: pour, versId: moi, final: ex.getAttribute('data-final') === '1', creeLe: Date.now() })).then(function(){
        try{ showToastNew('📨 Exemple demandé : il arrive sur ton téléphone dans la minute'); }catch(x){}
      }).catch(function(err){ try{ showToastNew('❌ Échec : ' + ((err && err.message) || 'écriture refusée')); }catch(x){} });
      return;
    }
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
  window.objectifs = { page: ouvrirPage, html: htmlPage, afficher: maj, messages: messages, classement: slidesClassement, defiler: defiler, config: function(){ return cfg; } };
})();
