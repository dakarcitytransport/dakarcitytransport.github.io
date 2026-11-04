# Génère look-v2.css (V2). Les icônes des 18 menus sont des masques SVG encodés.
import urllib.parse, sys
ICONS = {
 'departs':'M16.5 9.4 7.5 4.2M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7zM3.3 7 12 12l8.7-5M12 22V12',
 'stockage':'M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35zM6 18h12M6 14h12',
 'client':'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
 'planning':'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM9 16l2 2 4-4',
 'collecte':'M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
 'france':'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z',
 'depot':'M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6',
 'devis':'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8',
 'fm':'M5 2v20l2.5-1.5L10 22l2-1.5L14 22l2.5-1.5L19 22V2zM9 8h6M9 12h6M9 16h3',
 'fid':'M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z',
 'pa':'M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8zM7 7h.01',
 'qr':'M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10',
 'arch':'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
 'rapfin':'M20 7H5a2 2 0 0 1 0-4h13v4M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H5M16 14h.01',
 'stats':'M4 20V10M10 20V4M16 20v-8M22 20H2',
 'reglages':'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
 'mamadou':'M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
 'annonce':'M3 11v2a2 2 0 0 0 2 2h1l2 5h2l-1.5-5H12l8 4V6l-8 4H5a2 2 0 0 0-2 1z',
}
# couleur de la pastille : g (vert) o (orange) v (violet) r (rouge) b (bleu)
TEINTE = {'departs':'g','stockage':'o','client':'v','planning':'r','collecte':'g','france':'b','depot':'o','devis':'b','fm':'v','fid':'o','pa':'r','qr':'g','arch':'g','rapfin':'b','stats':'o','reglages':'g','mamadou':'o','annonce':'r'}
def uri(d):
    svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'><path d='%s'/></svg>" % d
    return 'url("data:image/svg+xml,%s")' % urllib.parse.quote(svg, safe="/:='() ,")

LIGHT = """
  --font:'Hanken Grotesk','DM Sans',sans-serif; --radius:22px; --radius-sm:16px;
  --green:#0E9F5B; --green-dark:#0A7A45; --green-light:#DCEFE3;
  --bg:#F3F7F4; --white:#FFFFFF; --text:#0D1F17; --text2:#3F5147; --text3:#55675E; --border:rgba(13,31,23,.12);
  --shadow:0 10px 30px rgba(20,70,45,.10);
  --lk-aur1:#BDEBD3; --lk-aur2:#DCD3FF; --lk-aur3:#FFE0B8;
  --lk-glass:rgba(255,255,255,.66); --lk-edge:rgba(255,255,255,.9); --lk-field:rgba(255,255,255,.72);
  --lk-sheet:#FFFFFF; --lk-veil:rgba(8,20,14,.35); --lk-line:rgba(13,31,23,.10);
  --lk-on-g:#FFFFFF; --lk-hero-a:#0E9F5B; --lk-hero-b:#086E42;
  --lk-prep-a:#E0820F; --lk-prep-b:#A8500A; --lk-rte-a:#3D63E3; --lk-rte-b:#22389F;
  --lk-g:rgba(14,159,91,.14); --lk-o:rgba(245,158,11,.18); --lk-v:rgba(124,92,255,.14); --lk-r:rgba(220,59,46,.13); --lk-b:rgba(70,100,220,.14);
  --lk-tg:#0A7A45; --lk-to:#8A5300; --lk-tv:#5B3FD6; --lk-tr:#B02A1F; --lk-tb:#2744B8;
  color-scheme:light;"""
DARK = """
  --green:#3DDC84; --green-dark:#3DDC84; --green-light:rgba(61,220,132,.15);
  --bg:#080D0B; --white:#121A16; --text:#EDF6F1; --text2:#B7C7BE; --text3:#8CA196; --border:#26352C;
  --shadow:0 14px 30px rgba(0,0,0,.5);
  --lk-aur1:rgba(61,220,132,.18); --lk-aur2:rgba(110,162,255,.09); --lk-aur3:rgba(255,176,46,.07);
  --lk-glass:rgba(24,35,30,.72); --lk-edge:#26352C; --lk-field:rgba(24,35,30,.8);
  --lk-sheet:#121A16; --lk-veil:rgba(0,0,0,.55); --lk-line:rgba(237,246,241,.10);
  --lk-on-g:#04170C; --lk-hero-a:#134A2E; --lk-hero-b:#0B2A1B;
  --lk-prep-a:#6B430B; --lk-prep-b:#3A2406; --lk-rte-a:#1B3380; --lk-rte-b:#0F1D4D;
  --lk-g:rgba(61,220,132,.15); --lk-o:rgba(255,176,46,.16); --lk-v:rgba(150,130,255,.17); --lk-r:rgba(255,107,91,.16); --lk-b:rgba(110,162,255,.17);
  --lk-tg:#3DDC84; --lk-to:#FFB02E; --lk-tv:#B6A8FF; --lk-tr:#FF8E80; --lk-tb:#8FB5FF;
  color-scheme:dark;"""

out = []
out.append("""/* ═══════════════════════════════════════════════════════════
   DCT — V2 (nouveau look) · look-v2.css · 04/11/2026
   Rien ne s'applique sans la classe « look-v2 » sur <html> (voir look.js).
   Sans elle, l'application est exactement la V1.
   Mode clair / sombre / automatique : attribut data-mode sur <html>.
   Fichier GÉNÉRÉ par tools/gen_look_css.py (icônes encodées) — ne pas
   modifier à la main sans reporter dans le générateur.
   ═══════════════════════════════════════════════════════════ */
""")
# repli pour V1 : les couleurs --lk-* servent aussi à l'écran Réglages > Apparence, vu en V1
out.append(":root{%s}" % "".join(l + "\n" for l in LIGHT.split("\n") if l.strip().startswith("--lk-")))
out.append("html.look-v2{%s}" % LIGHT)
out.append("@media (prefers-color-scheme: dark){html.look-v2[data-mode=\"auto\"]{%s}}" % DARK)
out.append("html.look-v2[data-mode=\"dark\"]{%s}" % DARK)
out.append(r"""
/* ── base : fond aurore, en-têtes, typographie ── */
html.look-v2 body, html.look-v2 .app{background:var(--bg);font-family:var(--font)}
html.look-v2 .screen{background:radial-gradient(520px 340px at 92% -4%,var(--lk-aur1),transparent 70%),radial-gradient(460px 340px at -12% 38%,var(--lk-aur2),transparent 70%),radial-gradient(520px 380px at 104% 92%,var(--lk-aur3),transparent 70%),var(--bg)}
html.look-v2 .header{background:transparent;border-bottom:0;padding:calc(12px + env(safe-area-inset-top,0px)) 18px 8px}
html.look-v2 .h-title{font-size:16px;font-weight:800;letter-spacing:-.01em;color:var(--text)}
html.look-v2 .h-sub{font-size:14px;font-weight:600;color:var(--text3)}
html.look-v2 .btn-back{font-weight:700;color:var(--green-dark)}
html.look-v2 .content{padding:8px 16px 18px;padding-bottom:max(52px,calc(env(safe-area-inset-bottom) + 38px))}
html.look-v2 button:focus-visible,html.look-v2 .dep-case:focus-visible{outline:2.5px solid var(--green);outline-offset:2px}

/* ── écran de connexion : choix de l'espace, puis du profil ── */
html.look-v2 .login-screen,html.look-v2 .login-screen.dep-clair{background:transparent;padding-top:calc(26px + env(safe-area-inset-top,0px))}
html.look-v2 #dct-logo{width:76px !important;height:76px !important;margin-bottom:12px !important;border:3px solid var(--lk-edge);box-shadow:0 10px 28px rgba(14,159,91,.28) !important}
html.look-v2 .login-screen > div:first-of-type{font-size:22px !important;font-weight:800 !important;letter-spacing:-.02em;color:var(--text) !important}
html.look-v2 #dep-ligne-pays{font-size:12px !important;letter-spacing:.16em !important;color:var(--text3) !important;margin-top:2px}
html.look-v2 .dep-drap svg{box-shadow:none}
html.look-v2 #login-titre{font-size:12px !important;font-weight:800 !important;letter-spacing:.1em !important;color:var(--text3) !important;margin:26px 0 12px !important;text-align:left;width:100%}
html.look-v2 #app-version{background:transparent !important;color:var(--text3) !important;opacity:.7}
html.look-v2 #app-update,html.look-v2 #dep-login-version{color:var(--text3) !important;opacity:.6}
html.look-v2 #admin-message-login{width:100%}
html.look-v2 .dep-clair .dep-esp-c,html.look-v2 .dep-esp-c{background:var(--lk-glass) !important;border:1px solid var(--lk-edge);border-radius:26px;padding:16px 18px;gap:14px;box-shadow:var(--shadow);backdrop-filter:blur(18px) saturate(1.4);-webkit-backdrop-filter:blur(18px) saturate(1.4)}
html.look-v2 .dep-clair .dep-esp-c-ic{width:48px;height:48px;border-radius:15px;background:var(--lk-g);color:var(--lk-tg)}
html.look-v2 .dep-esp-c-ic svg{stroke:currentColor !important}
html.look-v2 .dep-clair .dep-esp-c-t{color:var(--text);font-size:17px}
html.look-v2 .dep-clair .dep-esp-c-s{color:var(--text3)}
html.look-v2 .dep-clair .dep-esp-c-n{background:var(--lk-line);color:var(--text3)}
html.look-v2 .dep-esp-c > svg:last-child{stroke:var(--text3) !important;opacity:.7}
html.look-v2 .dep-esp-c:nth-child(2) .dep-esp-c-ic{background:var(--lk-v);color:var(--lk-tv)}
html.look-v2 .dep-esp-c:nth-child(3) .dep-esp-c-ic{background:var(--lk-b);color:var(--lk-tb)}
html.look-v2 .dep-esp-c:nth-child(4) .dep-esp-c-ic{background:var(--lk-r);color:var(--lk-tr)}
html.look-v2 #login-retour > div > div:first-child{background:var(--lk-glass) !important;border:1px solid var(--lk-edge) !important;border-radius:50% !important;width:42px !important;height:42px !important;color:var(--text) !important}
html.look-v2 #login-soc-nom{font-size:22px !important;letter-spacing:-.02em;color:var(--text) !important}
html.look-v2 #login-soc-sous{color:var(--text3) !important}
html.look-v2 .login-card{background:var(--lk-glass) !important;border:1px solid var(--lk-edge) !important;border-left-width:1px !important;border-radius:26px;padding:14px 16px;box-shadow:var(--shadow);backdrop-filter:blur(18px) saturate(1.4);-webkit-backdrop-filter:blur(18px) saturate(1.4)}
html.look-v2 .login-card:active{border-color:var(--green) !important}
html.look-v2 .login-name{font-size:17px;font-weight:800;letter-spacing:-.01em;color:var(--text)}
html.look-v2 .login-role{color:var(--text3)}
html.look-v2 .login-card > svg:last-child{stroke:var(--text3) !important}

/* ── accueil : « Où souhaitez-vous travailler ? » ── */
html.look-v2 #s-espaces .content > div:first-child{font-size:22px !important;font-weight:800 !important;letter-spacing:-.025em;color:var(--text) !important;margin:6px 4px 14px !important}
html.look-v2 #dep-esp-activite-btn{background:var(--lk-glass) !important;color:var(--text) !important;border:1px solid var(--lk-edge) !important;border-radius:50% !important;width:42px;height:42px;padding:0 !important;box-shadow:var(--shadow);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
html.look-v2 #dep-esp-av{width:42px !important;height:42px !important;font-size:14px !important}
html.look-v2 #lk-theme-btn{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--lk-glass);color:var(--text);border:1px solid var(--lk-edge);box-shadow:var(--shadow);cursor:pointer;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
html.look-v2 #dep-bandeau-notifs{background:var(--lk-r) !important;border:0 !important;border-radius:18px !important}
html.look-v2 #dep-bandeau-notifs div{color:var(--lk-tr) !important}
/* icônes */
.lk-ic{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;flex:none}
html.look-v2 .lk-car{margin:0 -16px 16px}
html.look-v2 .lk-track{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 16px 4px;scroll-padding:0 16px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
html.look-v2 .lk-track::-webkit-scrollbar{display:none}
html.look-v2 .lk-prep{background:linear-gradient(150deg,var(--lk-prep-a),var(--lk-prep-b)) !important;box-shadow:0 14px 34px rgba(150,80,10,.28)}
html.look-v2 .lk-route-st{background:linear-gradient(150deg,var(--lk-rte-a),var(--lk-rte-b)) !important;box-shadow:0 14px 34px rgba(34,56,159,.28)}
html.look-v2 .lk-slide{flex:0 0 calc(100% - 44px);scroll-snap-align:start;margin:0 !important;min-width:0}
html.look-v2 .lk-dots{display:flex;justify-content:center;gap:6px;margin-top:10px}
html.look-v2 .lk-dots i{width:7px;height:7px;border-radius:99px;background:var(--lk-line);transition:width .2s,background .2s}
html.look-v2 .lk-dots i.on{width:20px;background:var(--green)}
@media (prefers-reduced-motion:reduce){html.look-v2 .lk-dots i{transition:none}}
html.look-v2 .lk-hero{display:block;width:100%;text-align:left;border:1px solid rgba(255,255,255,.22);cursor:pointer;margin:0 0 16px;padding:18px;border-radius:28px;color:#fff;font-family:var(--font);background:linear-gradient(150deg,var(--lk-hero-a),var(--lk-hero-b));box-shadow:0 14px 34px rgba(8,60,36,.28)}
html.look-v2 .lk-hero small{display:block;opacity:.85;font-weight:700;letter-spacing:.07em;text-transform:uppercase;font-size:11.5px}
html.look-v2 .lk-hero h2{font-size:24px;font-weight:800;letter-spacing:-.02em;margin:3px 0 14px}
html.look-v2 .lk-route{display:flex;align-items:center;gap:8px;font-size:11.5px;font-weight:800;letter-spacing:.08em}
html.look-v2 .lk-rail{flex:1;height:6px;border-radius:99px;background:rgba(255,255,255,.22);position:relative}
html.look-v2 .lk-rail i{position:absolute;inset:0 auto 0 0;border-radius:99px;background:#fff}
html.look-v2 .lk-foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:2px 12px;margin-top:12px;font-size:13px;opacity:.95}
html.look-v2 .lk-foot b{font-size:17px}

/* ── les cases (accueil, Réglages, Stockage…) ── */
html.look-v2 .dep-cases{gap:12px}
html.look-v2 .dep-case{background:var(--lk-glass) !important;border:1px solid var(--lk-edge);border-radius:24px;box-shadow:var(--shadow);backdrop-filter:blur(18px) saturate(1.4);-webkit-backdrop-filter:blur(18px) saturate(1.4);align-items:flex-start;text-align:left;justify-content:flex-start;min-height:118px;padding:14px}
html.look-v2 .dep-case-ico{width:40px;height:40px;border-radius:13px;background:var(--lk-g);color:var(--lk-tg);font-size:19px !important;display:flex;align-items:center;justify-content:center;margin-bottom:10px !important}
html.look-v2 .dep-case-tit{color:var(--text) !important;font-size:14px;letter-spacing:.02em;margin-bottom:4px !important}
html.look-v2 .dep-case-sub{color:var(--text3);font-size:12.5px;font-weight:500;line-height:1.35}
""")
# icônes des 18 menus
for k, d in ICONS.items():
    t = TEINTE[k]
    out.append("html.look-v2 #dep-case-%s .dep-case-ico{font-size:0 !important;background:var(--lk-%s);color:var(--lk-t%s)}" % (k, t, t))
    out.append("html.look-v2 #dep-case-%s .dep-case-ico::before{content:'';width:22px;height:22px;background:currentColor;-webkit-mask:%s center/contain no-repeat;mask:%s center/contain no-repeat}" % (k, uri(d), uri(d)))
out.append(r"""
/* ── feuille « Apparence » (clair / sombre / automatique) ── */
#lk-voile{position:fixed;inset:0;z-index:9000;background:var(--lk-veil,rgba(8,20,14,.35));display:flex;align-items:flex-end;justify-content:center;font-family:var(--font,'DM Sans',sans-serif)}
#lk-voile[hidden]{display:none}
.lk-feuille{width:100%;max-width:430px;padding:12px 18px max(20px,env(safe-area-inset-bottom,0px));background:var(--lk-sheet,#fff);color:var(--text,#111);border-radius:30px 30px 0 0;box-shadow:0 -10px 40px rgba(0,0,0,.25);animation:lkup .22s cubic-bezier(.2,.8,.2,1)}
.lk-grab{width:42px;height:5px;border-radius:99px;background:var(--lk-line,#ddd);margin:0 auto 14px}
.lk-feuille h2{font-size:21px;font-weight:800;letter-spacing:-.02em;margin:0}
.lk-aide{color:var(--text3,#666);font-size:13.5px;line-height:1.4;margin:4px 0 14px}
.lk-opt{display:flex;align-items:center;gap:14px;width:100%;padding:14px;border-radius:20px;border:1.5px solid transparent;margin-bottom:8px;background:var(--lk-field,#f4f4f4);color:inherit;font:inherit;text-align:left;cursor:pointer}
.lk-opt[aria-checked="true"]{border-color:var(--green);background:var(--lk-g)}
.lk-opt b{display:block;font-size:16px}
.lk-opt span span{display:block;font-size:13px;color:var(--text3,#666);font-weight:500}
.lk-bub{width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;background:var(--lk-g);color:var(--lk-tg);flex:none}
.lk-dot{margin-left:auto;width:22px;height:22px;border-radius:50%;border:2px solid var(--text3,#888);flex:none}
.lk-opt[aria-checked="true"] .lk-dot{border:7px solid var(--green)}
.lk-fermer{width:100%;height:50px;border-radius:18px;border:0;font:inherit;font-weight:800;background:var(--lk-line,#eee);color:inherit;margin-top:4px;cursor:pointer}
@keyframes lkup{from{transform:translateY(40px);opacity:.4}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.lk-feuille{animation:none}}

/* ── Réglages > Apparence ── */
.lk-reg h3{font-size:17px;font-weight:800;margin:0 0 4px}
.lk-reg .lk-opt{align-items:center}
.lk-appliquer{width:100%;height:50px;border-radius:18px;border:0;font:inherit;font-weight:800;background:var(--green);color:var(--lk-on-g,#fff);cursor:pointer;margin-top:4px}
.lk-appliquer:disabled{opacity:.45;cursor:default}
""")
open(sys.argv[1], 'w', encoding='utf-8').write("\n".join(out) + "\n")
print('ok', len("\n".join(out)), 'octets')
