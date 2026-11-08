# Génère look-v2.css (V2). Les icônes des 18 menus sont des masques SVG encodés.
import urllib.parse, sys
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
import gen_dark_remap
ICONS = {
 'departs':['M12 2v2','M12 9.189V13','M19 12V6a2 2 0 00-2-2H7a2 2 0 00-2 2v6','M19.38 19A11.6 11.6 0 0021 13l-8.188-3.639a2 2 0 00-1.624 0L3 13.001a11.6 11.6 0 002.81 7.76','M2 20c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'],   # cargo (Cobey : départs = containers par bateau)
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
 'mamadou':['M12 22V12','m16 17 2 2 4-4','M21 11.127V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.32-.753','M3.29 7 12 12l8.71-5','m7.5 4.27 8.997 5.148'],   # colis remis (Mamadou donne les colis aux clients)
 'annonce':'M3 11v2a2 2 0 0 0 2 2h1l2 5h2l-1.5-5H12l8 4V6l-8 4H5a2 2 0 0 0-2 1z',
}
# couleur de la pastille : g (vert) o (orange) v (violet) r (rouge) b (bleu)
def uri_duo(d, fill=".30", sw="2"):
    chemins = d if isinstance(d, (list, tuple)) else [d]
    corps = ''.join(c if c.startswith('<') else "<path d='%s'/>" % c for c in chemins)
    svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' fill-opacity='%s' stroke='white' stroke-width='%s' stroke-linecap='round' stroke-linejoin='round'>%s</svg>" % (fill, sw, corps)
    return 'url("data:image/svg+xml,%s")' % urllib.parse.quote(svg, safe="/:='() ,")
COUL = {'g':'#2e8f6a','o':'#d9892b','v':'#7a5cf0','r':'#e0583f','b':'#4a63d6'}
# 4 icônes redessinées de l'écran de connexion (maquette validée par Cobey le 05/11/2026)
LOGIN_ICO = [
 ["<rect x='3' y='8' width='18' height='12' rx='4'/>","<path d='M9 8V7a3 3 0 0 1 3-3 3 3 0 0 1 3 3v1'/>","<path d='M3 13.5h5m8 0h5'/>","<rect x='9.5' y='11.8' width='5' height='3.4' rx='1.4'/>"],
 ["<path d='M4 21V6.5A2.5 2.5 0 0 1 6.5 4h6A2.5 2.5 0 0 1 15 6.5V21z'/>","<path d='M15 10h2.5A2.5 2.5 0 0 1 20 12.5V21'/>","<path d='M2.5 21h19'/>","<path d='M8 8.5h3M8 12h3M8 15.5h3'/>"],
 ["<rect x='2' y='6' width='12' height='9.5' rx='2.4'/>","<path d='M14 9.5h3.6a2 2 0 0 1 1.6.8l1.9 2.5a2 2 0 0 1 .4 1.2v1.5a1.5 1.5 0 0 1-1.5 1.5H14'/>","<circle cx='7' cy='17.5' r='2.3'/>","<circle cx='17' cy='17.5' r='2.3'/>"],
 ["<path d='M12 2.8 4.5 5.6v5.7c0 4.7 3.1 8.2 7.5 9.9 4.4-1.7 7.5-5.2 7.5-9.9V5.6z'/>","<rect x='9' y='10.5' width='6' height='4.7' rx='1.4'/>","<path d='M10.2 10.5V9.3a1.8 1.8 0 0 1 3.6 0v1.2'/>"],
]
TEINTE = {'departs':'g','stockage':'o','client':'v','planning':'r','collecte':'g','france':'b','depot':'o','devis':'b','fm':'v','fid':'o','pa':'r','qr':'g','arch':'g','rapfin':'b','stats':'o','reglages':'g','mamadou':'o','annonce':'r'}
def uri(d):
    chemins = d if isinstance(d, (list, tuple)) else [d]      # une icône peut avoir plusieurs tracés
    corps = ''.join("<path d='%s'/>" % c for c in chemins)
    svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'>%s</svg>" % corps
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
  --green:#2E9E68; --green-dark:#6CC79A; --green-light:rgba(46,158,104,.18);
  --bg:#080D0B; --white:#121A16; --text:#EDF6F1; --text2:#B7C7BE; --text3:#8CA196; --border:#26352C;
  --shadow:0 14px 30px rgba(0,0,0,.5);
  --lk-aur1:rgba(46,158,104,.16); --lk-aur2:rgba(110,150,230,.08); --lk-aur3:rgba(220,160,70,.06);
  --lk-glass:rgba(24,35,30,.72); --lk-edge:#26352C; --lk-field:rgba(24,35,30,.8);
  --lk-sheet:#121A16; --lk-veil:rgba(0,0,0,.55); --lk-line:rgba(237,246,241,.10);
  --lk-on-g:#F2FBF6; --lk-hero-a:#134A2E; --lk-hero-b:#0B2A1B;
  --lk-prep-a:#6B430B; --lk-prep-b:#3A2406; --lk-rte-a:#1B3380; --lk-rte-b:#0F1D4D;
  --lk-g:rgba(46,158,104,.20); --lk-o:rgba(214,150,60,.18); --lk-v:rgba(140,125,225,.19); --lk-r:rgba(214,100,88,.18); --lk-b:rgba(100,140,215,.19);
  --lk-tg:#7BD0A5; --lk-to:#E3B26A; --lk-tv:#B7ACEB; --lk-tr:#E8A196; --lk-tb:#A2BDEB;
  color-scheme:dark;"""


# ── Couleurs pastel par case (accueil) et par espace (connexion) : retour de Cobey du 04/11 ──
import re as _re
_src = open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.dirname(__import__('os').path.abspath(__file__))), 'departs.js'), encoding='utf-8').read()
_tuiles = dict(_re.findall(r'id="dep-case-([a-z]+)" style="background:(#[0-9A-Fa-f]{6})', _src))
def _rgb(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
def _sombre(h):
    import colorsys
    r, g, b = [v / 255 for v in _rgb(h)]
    hh, ss, vv = colorsys.rgb_to_hsv(r, g, b)
    r2, g2, b2 = colorsys.hsv_to_rgb(hh, min(.62, max(ss * 2.0, .38)), .36)
    return (round(r2 * 255), round(g2 * 255), round(b2 * 255))
_clair, _fonce = [], []
for k, h in sorted(_tuiles.items()):
    r, g, b = _rgb(h); d = _sombre(h)
    _clair.append("html.look-v2 body #dep-case-%s{background-image:linear-gradient(rgba(%d,%d,%d,.72),rgba(%d,%d,%d,.72)) !important}" % (k, r, g, b, r, g, b))
    _fonce.append("html.look-v2 body #dep-case-%s{background-image:linear-gradient(rgba(%d,%d,%d,.80),rgba(%d,%d,%d,.80)) !important}" % (k, d[0], d[1], d[2], d[0], d[1], d[2]))
_ESP = [(58, 58, 184), (194, 38, 107), (15, 147, 180), (196, 38, 44)]
for i, (r, g, b) in enumerate(_ESP, 1):
    _clair.append("html.look-v2 body .dep-esp-c:nth-child(%d){background-image:linear-gradient(135deg,rgba(%d,%d,%d,.20),rgba(%d,%d,%d,.07)) !important}" % (i, r, g, b, r, g, b))
    _fonce.append("html.look-v2 body .dep-esp-c:nth-child(%d){background-image:linear-gradient(135deg,rgba(%d,%d,%d,.34),rgba(%d,%d,%d,.12)) !important}" % (i, r, g, b, r, g, b))
TEINTES = "\n/* ── Teintes pastel par case et par espace ── */\n" + "\n".join(_clair) + "\n@media (prefers-color-scheme: dark){\n" + "\n".join('html.look-v2[data-mode="auto"] ' + x[len('html.look-v2 '):] for x in _fonce) + "\n}\n" + "\n".join('html.look-v2[data-mode="dark"] ' + x[len('html.look-v2 '):] for x in _fonce) + "\n"

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
/* Photo de fond de l'écran de connexion (Cobey, 05/11/2026) : image faite avec Higgsfield (port de Dakar au crépuscule) ; voile pour garder les cartes lisibles. */
html.look-v2 #s-login{background:linear-gradient(180deg,rgba(6,16,12,.30) 0%,rgba(6,16,12,0) 35%,rgba(6,16,12,.10) 100%),url(fond-connexion.jpg?v=1) 64% 0%/auto 124% no-repeat #0a1410 !important}
@supports selector(:has(*)){
html.look-v2:has(#s-login.active){min-height:100%;background:linear-gradient(180deg,rgba(6,16,12,.30) 0%,rgba(6,16,12,0) 35%,rgba(6,16,12,.10) 100%),url(fond-connexion.jpg?v=1) 64% 0%/auto 124% no-repeat #0a1410 !important}
html.look-v2:has(#s-login.active) body,html.look-v2:has(#s-login.active) .app,html.look-v2 #s-login.active{background:transparent !important}
html.look-v2:has(#s-login.active) #modal-collab-pin,html.look-v2:has(#s-login.active) #modal-admin-pin{background:rgba(4,10,8,.35) !important;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
html.look-v2:has(#s-login.active) #modal-collab-pin .modal-sheet,html.look-v2:has(#s-login.active) #modal-admin-pin .modal-sheet{background:rgba(255,255,255,.12) !important;background-image:linear-gradient(135deg,rgba(255,255,255,.26),rgba(255,255,255,.04) 55%,rgba(255,255,255,.12)) !important;border:1px solid rgba(255,255,255,.6) !important;border-radius:28px !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 14px 40px rgba(0,0,0,.4) !important;backdrop-filter:blur(18px) saturate(1.6) brightness(.8);-webkit-backdrop-filter:blur(18px) saturate(1.6) brightness(.8)}
html.look-v2:has(#s-login.active) #modal-collab-pin .modal-sheet[style*="--pc"],html.look-v2:has(#s-login.active) #modal-admin-pin .modal-sheet[style*="--pc"]{background-image:linear-gradient(135deg,color-mix(in srgb,var(--pc) 52%,transparent),color-mix(in srgb,var(--pc) 16%,transparent) 70%,color-mix(in srgb,var(--pc) 28%,transparent)) !important;border-color:color-mix(in srgb,var(--pc) 70%,#fff) !important}
html.look-v2:has(#s-login.active) #collab-pin-titre,html.look-v2:has(#s-login.active) #modal-admin-pin .modal-confirm-title{color:#fff !important;text-shadow:0 1px 6px rgba(0,0,0,.5)}
html.look-v2:has(#s-login.active) #collab-pin-sous-titre{color:rgba(255,255,255,.88) !important}
html.look-v2:has(#s-login.active) #collab-pin-input,html.look-v2:has(#s-login.active) #admin-pin-input{background:rgba(255,255,255,.16) !important;color:#fff !important;border:1.5px solid rgba(255,255,255,.65) !important;border-radius:16px !important}
html.look-v2:has(#s-login.active) #collab-pin-input::placeholder,html.look-v2:has(#s-login.active) #admin-pin-input::placeholder{color:rgba(255,255,255,.6)}
html.look-v2:has(#s-login.active) #collab-pin-btn,html.look-v2:has(#s-login.active) #modal-admin-pin .btn-sm:not(.btn-gray-sm){background:rgba(255,255,255,.92) !important;color:#0b3d24 !important;border:0 !important;border-radius:16px !important}
html.look-v2:has(#s-login.active) #modal-collab-pin button:not(#collab-pin-btn),html.look-v2:has(#s-login.active) #modal-admin-pin .btn-gray-sm{background:rgba(255,255,255,.14) !important;color:#fff !important;border:1px solid rgba(255,255,255,.5) !important;border-radius:16px !important}
html.look-v2:has(#s-login.active) #modal-admin-pin .modal-emoji{filter:drop-shadow(0 2px 6px rgba(0,0,0,.4))}
}
html.look-v2 #s-login .login-screen > div:first-of-type{color:#fff !important;text-shadow:0 2px 14px rgba(0,0,0,.45)}
html.look-v2 #s-login #dep-ligne-pays,html.look-v2 #s-login #login-titre,html.look-v2 #s-login #login-soc-sous,html.look-v2 #s-login #app-version,html.look-v2 #s-login #app-update,html.look-v2 #s-login #dep-login-version{color:rgba(255,255,255,.86) !important;text-shadow:0 1px 8px rgba(0,0,0,.5)}
html.look-v2 #s-login #login-soc-nom{color:#fff !important;text-shadow:0 1px 8px rgba(0,0,0,.5)}
html.look-v2 #s-login #dct-logo{content:url(logo-dct.png?v=2);width:84px !important;height:84px !important;object-fit:contain;border:0 !important;border-radius:0 !important;box-shadow:none !important;background:transparent !important;filter:drop-shadow(0 8px 14px rgba(0,0,0,.55)) drop-shadow(0 2px 4px rgba(0,0,0,.4))}
html.look-v2 #s-login .dep-esp-c{background-color:rgba(255,255,255,.10) !important;background-image:linear-gradient(135deg,rgba(255,255,255,.26),rgba(255,255,255,.04) 55%,rgba(255,255,255,.12)) !important;border:1px solid rgba(255,255,255,.55) !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -1px 0 rgba(255,255,255,.12),0 8px 24px rgba(0,0,0,.28) !important;backdrop-filter:blur(14px) saturate(1.6) brightness(.82);-webkit-backdrop-filter:blur(14px) saturate(1.6) brightness(.82)}
html.look-v2 #s-login .dep-esp-c-t{color:#fff !important;font-weight:800;text-shadow:0 1px 6px rgba(0,0,0,.5)}
html.look-v2 #s-login .dep-esp-c-n{background:rgba(255,255,255,.18) !important;color:#fff !important}
html.look-v2 #s-login .dep-esp-c-s{color:rgba(255,255,255,.88) !important;font-weight:600;text-shadow:0 1px 5px rgba(0,0,0,.5)}
html.look-v2 #s-login .dep-esp-c > svg:last-child{stroke:#fff !important}
html.look-v2 #s-login .dep-esp-c-ic{width:54px !important;height:54px !important;border-radius:18px !important;background:linear-gradient(145deg,rgba(255,255,255,.34),rgba(255,255,255,.08)) !important;border:1px solid rgba(255,255,255,.6);box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 6px 16px rgba(0,0,0,.25) !important;color:#fff !important;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
html.look-v2 #s-login .dep-esp-c-ic svg{width:30px !important;height:30px !important;stroke:#fff !important;stroke-width:2.1 !important;stroke-linecap:round;stroke-linejoin:round;fill:rgba(255,255,255,.26);filter:drop-shadow(0 0 6px rgba(255,255,255,.55))}
html.look-v2 #s-login .dep-esp-c:nth-child(1) .dep-esp-c-ic{background:linear-gradient(145deg,rgba(88,88,235,.62),rgba(88,88,235,.22)) !important}
html.look-v2 #s-login .dep-esp-c:nth-child(2) .dep-esp-c-ic{background:linear-gradient(145deg,rgba(235,64,140,.62),rgba(235,64,140,.22)) !important}
html.look-v2 #s-login .dep-esp-c:nth-child(3) .dep-esp-c-ic{background:linear-gradient(145deg,rgba(30,175,215,.62),rgba(30,175,215,.22)) !important}
html.look-v2 #s-login .dep-esp-c:nth-child(4) .dep-esp-c-ic{background:linear-gradient(145deg,rgba(235,70,76,.62),rgba(235,70,76,.22)) !important}
html.look-v2 #s-login .dep-esp-c:nth-child(1){background-image:linear-gradient(135deg,rgba(88,88,235,.52),rgba(88,88,235,.16) 70%,rgba(88,88,235,.28)) !important;border-color:rgba(128,128,255,.85) !important}
html.look-v2 #s-login .dep-esp-c:nth-child(2){background-image:linear-gradient(135deg,rgba(235,64,140,.52),rgba(235,64,140,.16) 70%,rgba(235,64,140,.28)) !important;border-color:rgba(255,104,180,.85) !important}
html.look-v2 #s-login .dep-esp-c:nth-child(3){background-image:linear-gradient(135deg,rgba(30,175,215,.52),rgba(30,175,215,.16) 70%,rgba(30,175,215,.28)) !important;border-color:rgba(70,215,255,.85) !important}
html.look-v2 #s-login .dep-esp-c:nth-child(4){background-image:linear-gradient(135deg,rgba(235,70,76,.52),rgba(235,70,76,.16) 70%,rgba(235,70,76,.28)) !important;border-color:rgba(255,110,116,.85) !important}
html.look-v2 #s-login .login-card{background-color:rgba(255,255,255,.10) !important;background-image:linear-gradient(135deg,rgba(255,255,255,.26),rgba(255,255,255,.04) 55%,rgba(255,255,255,.12)) !important;border:1px solid rgba(255,255,255,.55) !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -1px 0 rgba(255,255,255,.12),0 8px 24px rgba(0,0,0,.28) !important;backdrop-filter:blur(14px) saturate(1.6) brightness(.82);-webkit-backdrop-filter:blur(14px) saturate(1.6) brightness(.82)}
html.look-v2 #s-login .login-card[style*="--pc"]{background-image:linear-gradient(135deg,color-mix(in srgb,var(--pc) 52%,transparent),color-mix(in srgb,var(--pc) 16%,transparent) 70%,color-mix(in srgb,var(--pc) 28%,transparent)) !important;border-color:color-mix(in srgb,var(--pc) 70%,#fff) !important}
html.look-v2 #s-login .login-name{color:#fff !important;text-shadow:0 1px 6px rgba(0,0,0,.5)}
html.look-v2 #s-login .login-role{color:rgba(255,255,255,.88) !important;text-shadow:0 1px 5px rgba(0,0,0,.5)}
html.look-v2 #s-login .login-card > svg:last-child{stroke:#fff !important}
html.look-v2 #s-login #login-retour > div > div:first-child{background:rgba(255,255,255,.16) !important;border-color:rgba(255,255,255,.55) !important;color:#fff !important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
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


/* ── cartes de menu en verre : Départs, Stockage, Archivage, liste des départs, Statistiques ── */
.lk-pp,.lk-pn{display:none}
html.look-v2 .lk-cv{position:relative;background-color:var(--lk-glass) !important;background-image:linear-gradient(135deg,color-mix(in srgb,var(--pc,#888) 34%,transparent),color-mix(in srgb,var(--pc,#888) 8%,transparent) 70%,color-mix(in srgb,var(--pc,#888) 18%,transparent)) !important;border:1px solid color-mix(in srgb,var(--pc,#888) 55%,#fff) !important;border-left-width:1px !important;border-radius:26px !important;padding:16px 18px !important;margin-bottom:12px !important;box-shadow:var(--shadow) !important;backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4)}
html.look-v2 .lk-cv .dep-card-top{display:flex;align-items:center;gap:14px;margin-bottom:6px}
html.look-v2 .lk-cv .dep-nom{font-size:19px !important;font-weight:800;letter-spacing:-.02em;color:var(--text) !important;flex:1}
html.look-v2 .lk-cv .dep-meta{font-size:13px;color:var(--text3);font-weight:600}
html.look-v2 .lk-cv .dep-badge{border:1px solid rgba(255,255,255,.8);font-weight:800}
html.look-v2 .lk-ct{width:50px;height:50px;border-radius:16px;flex:none;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,var(--pc,#888),color-mix(in srgb,var(--pc,#888) 60%,transparent));border:1px solid rgba(255,255,255,.7);box-shadow:inset 0 1px 0 rgba(255,255,255,.7),0 6px 14px rgba(0,0,0,.16)}
html.look-v2 .lk-ct svg{width:27px;height:27px;fill:rgba(255,255,255,.3);stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 5px rgba(255,255,255,.5))}
html.look-v2 .lk-ct.lk-em{background:rgba(255,255,255,.72);font-size:28px;line-height:1}
html.look-v2 .lk-cv-ch .dep-card-top{padding-right:40px}
html.look-v2 .lk-cv-ch::after{content:'';position:absolute;right:16px;top:30px;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.7) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310241a' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18l6-6-6-6'/%3E%3C/svg%3E") center/15px no-repeat}
html.look-v2 .lk-cv:has(.lk-pp) .dep-meta{display:none}
html.look-v2 .lk-cv .lk-pp{display:flex;gap:10px;margin-top:12px}
html.look-v2 .lk-cv .lk-pp > div{flex:1;border-radius:18px;padding:10px 12px;background:rgba(255,255,255,.62);border:1px solid rgba(255,255,255,.9)}
html.look-v2 .lk-cv .lk-pp b{display:block;font-size:30px;letter-spacing:-.03em;line-height:1;color:var(--text)}
html.look-v2 .lk-cv .lk-pp > div:first-child b{color:var(--green-dark,#0a7a45)}
html.look-v2 .lk-cv .lk-pp > div:last-child b{color:#b45f06}
html.look-v2 .lk-cv .lk-pp > div.z b{color:#9aa39e}
html.look-v2 #dep-departs-pays-content .lk-cv:nth-child(1){--pc:#2e8f6a !important}
html.look-v2 #dep-departs-pays-content .lk-cv:nth-child(2){--pc:#e0a020 !important}
html.look-v2 .lk-cv .lk-pp span{font-size:11.5px;font-weight:800;letter-spacing:.04em;color:var(--text2)}
html.look-v2 .lk-cv .lk-pn{display:flex;justify-content:space-between;gap:10px;margin-top:12px;padding-top:11px;border-top:1px dashed rgba(0,0,0,.14);font-size:13px;color:var(--text2)}
html.look-v2 .lk-cv .lk-pn b{color:var(--text)}


/* ── Réglages / Rapport financier : tuiles colorées + en-tête clair ── */
html.look-v2 #s-admin > .header{background:transparent !important;color:var(--text) !important;border:0 !important}
html.look-v2 #s-admin > .header .h-title{color:var(--text) !important}
html.look-v2 #s-admin > .header .btn-back{color:var(--lk-tg,#0a7a45) !important;background:transparent !important;border:0 !important}
html.look-v2 #s-admin .content{padding-left:16px !important;padding-right:16px !important}
html.look-v2 .dep-case-ico.lk-tv{width:46px;height:46px;border-radius:15px;font-size:0 !important;background:linear-gradient(145deg,var(--pc,#2e8f6a),color-mix(in srgb,var(--pc,#2e8f6a) 60%,transparent)) !important;border:1px solid rgba(255,255,255,.7);box-shadow:inset 0 1px 0 rgba(255,255,255,.7),0 6px 14px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center}
html.look-v2 .dep-case-ico.lk-tv svg{width:26px;height:26px;fill:rgba(255,255,255,.3);stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 5px rgba(255,255,255,.5))}
html.look-v2 .dep-case-ico.lk-tv-em{background:rgba(255,255,255,.72) !important;font-size:26px !important;line-height:1}


/* ── vague 3 : Collecte, Dépôt Dakar, boutons de cartes, Devis, Facture manuelle, Planning ── */
html.look-v2 .collecte-card{background-color:var(--lk-glass) !important;border:1px solid var(--lk-edge) !important;border-radius:26px !important;box-shadow:var(--shadow);backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4)}
html.look-v2 .collecte-card.border-green{background-image:linear-gradient(135deg,rgba(46,143,106,.30),rgba(46,143,106,.07) 70%,rgba(46,143,106,.16)) !important;border-color:rgba(46,143,106,.55) !important}
html.look-v2 .collecte-card.border-blue{background-image:linear-gradient(135deg,rgba(60,70,200,.26),rgba(60,70,200,.06) 70%,rgba(60,70,200,.14)) !important;border-color:rgba(60,70,200,.45) !important}
html.look-v2 .collecte-card-date{font-size:14.5px;font-weight:800;letter-spacing:-.01em}
html.look-v2 .collecte-card-top .badge,html.look-v2 .collecte-card-top [class*="badge"]{white-space:nowrap}
html.look-v2 .lk-bl{background-color:var(--lk-glass) !important;background-image:linear-gradient(135deg,color-mix(in srgb,var(--pc,#888) 26%,transparent),color-mix(in srgb,var(--pc,#888) 6%,transparent) 70%,color-mix(in srgb,var(--pc,#888) 14%,transparent)) !important;border:1px solid color-mix(in srgb,var(--pc,#888) 50%,#fff) !important;border-left-width:1px !important;border-radius:24px !important;box-shadow:var(--shadow);backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4)}
html.look-v2 .dep-cli-btn{border-radius:16px;min-height:42px;font-weight:800;font-size:13px;border-width:1px}
html.look-v2 #dep-devis-liste .dep-card,html.look-v2 #dep-fm-liste .dep-card{background-color:var(--lk-glass) !important;border:1px solid var(--lk-edge) !important;border-left-width:1px !important;border-radius:26px !important;padding:16px 18px !important;box-shadow:var(--shadow);backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4)}
html.look-v2 #dep-devis-liste .dep-nom,html.look-v2 #dep-fm-liste .dep-nom{font-size:19px;letter-spacing:-.02em}
html.look-v2 #dep-devis-liste .dep-badge,html.look-v2 #dep-fm-liste .dep-badge{border-radius:99px !important;font-weight:800}
/* Planning : onglets segmentés, cartes de jours en verre, gros boutons Dispo / Pas dispo */
html.look-v2 #pl-contenu > div:first-child{background:var(--lk-field);border:1px solid var(--lk-edge);border-radius:99px;padding:4px;gap:4px !important}
html.look-v2 #pl-contenu > div:first-child > div{border-radius:99px !important;border:0 !important;padding:11px !important;background:transparent !important;color:var(--text2,#6b7b72) !important}
html.look-v2 #pl-contenu > div:first-child > div[style*="background:#E65100"],html.look-v2 #pl-contenu > div:first-child > div[style*="background:var(--green"],html.look-v2 #pl-contenu > div:first-child > div[style*="color:#fff"]{background:linear-gradient(145deg,#f07a1a,#d9560a) !important;color:#fff !important;box-shadow:0 6px 14px rgba(217,86,10,.3)}
html.look-v2 #pl-contenu > div[style*="border-radius:13px"]{background:var(--lk-glass) !important;border:1px solid var(--lk-edge) !important;border-radius:26px !important;padding:18px !important;box-shadow:var(--shadow) !important;backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4)}
html.look-v2 #pl-contenu > div[style*="border-radius:13px"] > div:first-child > div:first-child{font-size:19px !important;letter-spacing:-.02em}
html.look-v2 #pl-contenu > div[style*="background:#F3F3F5"]{background-image:linear-gradient(135deg,rgba(60,70,200,.16),rgba(60,70,200,.04)) !important}
html.look-v2 #pl-contenu div[style*="background:#FBEAEA"]{border-radius:18px !important;border:1px solid rgba(192,57,43,.45) !important;background:rgba(192,57,43,.1) !important}
html.look-v2 #pl-contenu div[style*="background:#EAF7EF"]{border-radius:18px !important;border:1px solid rgba(0,154,68,.45) !important;background:rgba(0,154,68,.1) !important}
html.look-v2 #pl-contenu div[style*="background:#FFD54F"]{border-radius:18px !important;border:1px solid rgba(184,134,11,.6) !important;background:linear-gradient(135deg,#ffd54f,#f5b82e) !important;box-shadow:0 6px 14px rgba(184,134,11,.25)}
html.look-v2 #pl-contenu [onclick^="depPlanningPoser("]{border-radius:18px !important;min-height:52px;display:flex !important;align-items:center;justify-content:center;gap:8px;border-width:1px !important;font-size:15px !important;font-weight:800 !important;padding:0 !important}
html.look-v2 #pl-contenu [onclick$=",true)"][onclick^="depPlanningPoser("]::before{content:'\2713';font-size:17px}
html.look-v2 #pl-contenu [onclick$=",false)"][onclick^="depPlanningPoser("]::before{content:'\2715';font-size:15px}
html.look-v2 #pl-contenu [onclick^="depPlanningPoser("][style*="background:#fff"]{background:rgba(255,255,255,.6) !important}
html.look-v2 #pl-contenu [onclick^="depPlanningPoser("][style*="background:#009A44"]{background:linear-gradient(145deg,#12b05a,#0a8a44) !important;box-shadow:0 8px 18px rgba(0,154,68,.35)}
html.look-v2 #pl-contenu [onclick^="depPlanningPoser("][style*="background:#c0392b"]{background:linear-gradient(145deg,#e0503f,#b8301f) !important;box-shadow:0 8px 18px rgba(192,57,43,.35)}
/* Planning > L'équipe : une ligne = icône | nom | statut (colonnes alignées), « modifié par… » en dessous */
html.look-v2 #pl-contenu .pl-lg{display:grid !important;grid-template-columns:26px 1fr auto;align-items:center;column-gap:10px;row-gap:3px;padding:11px 0 6px !important}
html.look-v2 #pl-contenu .pl-ic{font-size:17px;text-align:center;line-height:1}
html.look-v2 #pl-contenu .pl-nm{display:flex !important;align-items:center !important;min-width:0 !important;gap:9px !important;line-height:1.2}
html.look-v2 #pl-contenu .pl-nm > *{flex:none}
html.look-v2 #pl-contenu .pl-nm > b{display:block}
html.look-v2 #pl-contenu .pl-nm > :not(b){display:inline-flex !important;align-items:center;justify-content:center;line-height:1}
html.look-v2 #pl-contenu .pl-ic,html.look-v2 #pl-contenu .pl-st{align-self:center;margin:0 !important}
html.look-v2 #pl-contenu .pl-nm b{font-size:15px;font-weight:800}
html.look-v2 #pl-contenu .pl-st{justify-self:end;text-align:center;padding:4px 12px;border-radius:99px;font-size:12.5px;font-weight:800 !important;background:color-mix(in srgb,currentColor 13%,transparent);white-space:normal;max-width:48vw;line-height:1.25}
html.look-v2 #pl-contenu .pl-qd{grid-column:2 / 4;font-size:11.5px !important;padding-left:2px}
html.look-v2 #pl-contenu > div[style*="border-radius:13px"]:has(span[style*="background:#e8e8e8"]){position:relative}
html.look-v2 #pl-contenu span[style*="background:#e8e8e8"]{position:absolute;top:21px;right:18px;font-size:11px !important;padding:3px 9px !important;background:rgba(0,0,0,.07) !important;white-space:nowrap}
html.look-v2 #pl-contenu > div[style*="border-radius:13px"]:has(span[style*="background:#e8e8e8"]) > div:first-child{padding-right:104px}
html.look-v2 #pl-contenu [onclick^="depPlanningForcer"],html.look-v2 #pl-contenu [onclick^="depPlanningRetirer"]{border-radius:99px !important}
html.look-v2 #pl-contenu input.fi{border-radius:16px !important;border-width:1px !important;background:var(--lk-field) !important}
html.look-v2 #fid-liste-contenu .dep-cli{position:relative;background-color:var(--lk-glass) !important;background-image:linear-gradient(135deg,rgba(224,140,30,.22),rgba(224,140,30,.05) 70%,rgba(224,140,30,.12)) !important;border:1px solid rgba(224,140,30,.45) !important;border-radius:24px !important;padding:14px 52px 14px 74px !important;box-shadow:var(--shadow);backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4);min-height:76px}
html.look-v2 #fid-liste-contenu .dep-cli::before{content:'';position:absolute;left:16px;top:50%;margin-top:-23px;width:46px;height:46px;border-radius:15px;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' fill-opacity='.3' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z'/%3E%3C/svg%3E") center/26px no-repeat,linear-gradient(145deg,#e0901e,#e0901e99);border:1px solid rgba(255,255,255,.7);box-shadow:inset 0 1px 0 rgba(255,255,255,.7),0 6px 14px rgba(0,0,0,.16)}
html.look-v2 #fid-liste-contenu .dep-cli::after{content:'';position:absolute;right:16px;top:50%;margin-top:-15px;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.7) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310241a' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18l6-6-6-6'/%3E%3C/svg%3E") center/15px no-repeat}
html.look-v2 #fid-liste-contenu .dep-cli-n{font-size:17px;font-weight:800;letter-spacing:-.01em}
html.look-v2 #fid-liste-contenu .dep-cli-s{flex-wrap:wrap}
html.look-v2 #fid-liste-contenu .dep-cli-s b{display:inline-block;padding:3px 11px;border-radius:99px;background:rgba(224,140,30,.18);border:1px solid rgba(224,140,30,.45)}


/* ── vague 4 : détail d'une collecte, Équipe, Codes admin ── */
html.look-v2 #s-collecte .sbar{margin:12px 16px 8px;border-radius:24px;padding:14px 10px;background:linear-gradient(135deg,#1fae74,#0d7a50) !important;box-shadow:0 10px 24px rgba(13,122,80,.28);border:1px solid rgba(255,255,255,.4)}
html.look-v2 #s-collecte .sbar-label{color:rgba(255,255,255,.88);font-size:11.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
html.look-v2 #s-collecte .sbar-val{font-size:22px;letter-spacing:-.02em}
html.look-v2 #s-collecte .subtabs{margin:0 16px 10px;background:var(--lk-field);border:1px solid var(--lk-edge);border-radius:99px;padding:4px;gap:4px}
html.look-v2 #s-collecte .subtab{border:0;margin:0;border-radius:99px;padding:10px 8px;color:var(--text2,#6b7b72)}
html.look-v2 #s-collecte .subtab.active{background:linear-gradient(145deg,#2fb27c,#1a8a5c);color:#fff;box-shadow:0 6px 14px rgba(26,138,92,.3)}
html.look-v2 #s-collecte .collab-card{border-radius:22px;padding:13px}
html.look-v2 .filter-pill{border-width:1px;border-color:var(--lk-edge);background:var(--lk-glass);padding:8px 15px;font-size:12.5px}
html.look-v2 .filter-pill.active{background:linear-gradient(145deg,#2fb27c,#1a8a5c);color:#fff;border-color:transparent;box-shadow:0 6px 14px rgba(26,138,92,.3)}
html.look-v2 .search-wrap input{border-radius:99px;border-width:1px;background:var(--lk-field)}
html.look-v2 .add-banner{border-radius:24px;border-width:1px}
html.look-v2 #admin-section-equipe > div.lk-bl,html.look-v2 #s-admin div.lk-bl{border-radius:24px !important;padding:12px 14px !important;margin-bottom:12px !important;flex-wrap:wrap}
html.look-v2 #admin-section-equipe > div.lk-bl > div[style*="flex:1"],html.look-v2 #admin-section-equipe > div.lk-bl > div[style*="flex: 1"]{flex:1 1 130px !important}
html.look-v2 #admin-section-equipe > div.lk-bl > button,html.look-v2 #s-admin .lk-bl > button{border-radius:13px !important;min-width:42px;min-height:38px;border-width:1px !important;font-size:15px !important}
html.look-v2 #admin-section-equipe > div.lk-bl > button:first-of-type{margin-left:0}
html.look-v2 #admin-section-equipe > div.lk-bl > div:first-child{box-shadow:0 4px 10px rgba(0,0,0,.12)}
html.look-v2 #s-admin .lk-bl > button{border-radius:16px}


/* ── fenêtres (modales) : verre dépoli, coins très arrondis, boutons arrondis ── */
html.look-v2 .modal-overlay{background:rgba(6,16,12,.38) !important;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
html.look-v2 .modal-sheet{background:rgba(250,252,251,.82) !important;border:1px solid var(--lk-edge);border-bottom:0;border-radius:30px 30px 0 0 !important;box-shadow:0 -12px 40px rgba(0,0,0,.22);backdrop-filter:blur(22px) saturate(1.5);-webkit-backdrop-filter:blur(22px) saturate(1.5)}
html.look-v2 .modal-sheet::before{content:'';display:block;width:42px;height:5px;border-radius:99px;background:rgba(120,130,125,.4);margin:-8px auto 14px}
html.look-v2 .modal-title,html.look-v2 .modal-confirm-title{font-size:20px;font-weight:800;letter-spacing:-.02em;color:var(--text)}
html.look-v2 .modal-confirm-sub{color:var(--text2)}
html.look-v2 .modal-sheet .btn{border-radius:18px !important;min-height:52px;border-width:1px !important;font-size:15px;font-weight:800;box-shadow:0 4px 12px rgba(0,0,0,.08)}
html.look-v2 .modal-sheet .btn-gray,html.look-v2 .modal-sheet .btn-gray-sm,html.look-v2 .btn-modal-cancel{background:rgba(120,135,128,.16) !important;color:var(--text) !important;border:1px solid var(--lk-edge) !important;box-shadow:none}
html.look-v2 .modal-sheet .btn-sm,html.look-v2 .btn-modal-cancel{border-radius:16px !important;padding:14px !important;font-size:14.5px;font-weight:800}
html.look-v2 .modal-sheet .btn-green,html.look-v2 .modal-sheet .btn-modal-ok{background:linear-gradient(145deg,#2fb27c,#1a8a5c) !important;color:#fff !important;border:0 !important;box-shadow:0 8px 18px rgba(26,138,92,.3)}
html.look-v2 .modal-option{border-radius:18px;border-width:1px;background:var(--lk-field)}
html.look-v2 .modal-sheet input,html.look-v2 .modal-sheet select,html.look-v2 .modal-sheet textarea{border-radius:14px !important}


/* ── couche générale : boutons, formulaires, cartes, blocs (tous les écrans) ── */
html.look-v2 .btn{border-radius:20px;min-height:54px;font-size:15.5px;font-weight:800;border-width:1px;letter-spacing:-.005em;box-shadow:0 6px 16px rgba(0,0,0,.08)}
html.look-v2 .btn-green,html.look-v2 .btn-green-sm,html.look-v2 .btn-pdf{background:linear-gradient(145deg,#2fb27c,#1a8a5c) !important;color:#fff !important;border:1px solid rgba(255,255,255,.4) !important;box-shadow:0 8px 20px rgba(26,138,92,.3)}
html.look-v2 .btn-gray,html.look-v2 .btn-gray-sm{background:rgba(120,135,128,.16) !important;color:var(--text) !important;border:1px solid var(--lk-edge) !important;box-shadow:none}
html.look-v2 .btn-red{background:linear-gradient(145deg,#e0503f,#b8301f) !important;border:1px solid rgba(255,255,255,.35) !important;box-shadow:0 8px 20px rgba(192,57,43,.3)}
html.look-v2 .btn-sm,html.look-v2 .btn-pdf{border-radius:14px;min-height:40px;padding:9px 16px}
html.look-v2 .fl{font-size:12px;font-weight:800;color:var(--text2);letter-spacing:.03em;text-transform:uppercase;margin-bottom:7px}
html.look-v2 .fi,html.look-v2 .screen select,html.look-v2 .screen textarea,html.look-v2 .screen input[type=text],html.look-v2 .screen input[type=tel],html.look-v2 .screen input[type=number],html.look-v2 .screen input[type=date],html.look-v2 .screen input[type=search]{border:1px solid var(--lk-edge) !important;border-radius:16px !important;background:var(--lk-field) !important;color:var(--text);padding:13px 15px;font-size:15px;box-shadow:inset 0 1px 2px rgba(0,0,0,.04)}
html.look-v2 .fi:focus,html.look-v2 .screen select:focus,html.look-v2 .screen textarea:focus,html.look-v2 .screen input:focus{border-color:var(--green) !important;box-shadow:0 0 0 3px color-mix(in srgb,var(--green) 22%,transparent)}
html.look-v2 .fg{margin-bottom:14px}
html.look-v2 .slabel{font-size:11.5px;font-weight:800;letter-spacing:.09em;color:var(--text3);margin:20px 4px 10px}
html.look-v2 .card,html.look-v2 .dept-block,html.look-v2 .suivi-card{background:var(--lk-glass) !important;border:1px solid var(--lk-edge) !important;border-radius:26px !important;box-shadow:var(--shadow);backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4)}
html.look-v2 .dept-head{background:rgba(120,135,128,.1);border-bottom:1px solid var(--lk-line);padding:13px 16px}
html.look-v2 .dept-name{font-size:14.5px;font-weight:800;color:var(--text)}
html.look-v2 .dept-count{background:rgba(26,138,92,.14);color:var(--green-dark);border-radius:99px;padding:3px 11px}
html.look-v2 .client-row{padding:13px 16px;border-bottom:1px solid var(--lk-line)}
html.look-v2 .client-name{font-size:14.5px;font-weight:800;color:var(--text)}
html.look-v2 .client-sub{font-size:12px;color:var(--text3)}
html.look-v2 .client-price{font-size:14.5px}
html.look-v2 .badge{border-radius:99px;padding:4px 11px;font-weight:800}
html.look-v2 .truck-pill{border-radius:99px;border-width:1px}
html.look-v2 .progress-bg{height:9px;border-radius:99px;background:rgba(120,135,128,.2);border:0}
html.look-v2 .progress-bar{border-radius:99px}
html.look-v2 .suivi-band{background:linear-gradient(135deg,#1a3a5c,#0f2740) !important;border-radius:24px;margin:8px 16px}
html.look-v2 .toast{border-radius:18px;border-width:1px}
html.look-v2 .tab-bar,html.look-v2 .stabs{border-radius:99px}


/* ── onglets, fonds plats et blocs à bordure épaisse (case France, camions, etc.) ── */
html.look-v2 .subtabs{margin:0 16px 10px;background:var(--lk-field);border:1px solid var(--lk-edge);border-radius:99px;padding:4px;gap:4px;border-bottom:1px solid var(--lk-edge)}
html.look-v2 .subtab{border:0 !important;margin:0 !important;border-radius:99px;padding:10px 6px;color:var(--text2,#6b7b72)}
html.look-v2 .subtab.active{background:linear-gradient(145deg,#2fb27c,#1a8a5c);color:#fff !important;box-shadow:0 6px 14px rgba(26,138,92,.3)}
html.look-v2 #france-content,html.look-v2 .screen .content[style*="background:#F2F3F5"],html.look-v2 .screen [style*="background:#F2F3F5"]{background:transparent !important}
html.look-v2 #fr-recherche{background:transparent !important;border:0 !important;padding:2px 16px 8px !important}
html.look-v2 .screen [style*="border:2px solid #1a237e"][style*="border-radius"],html.look-v2 .screen [style*="border:2.5px solid #1a237e"][style*="border-radius"]{background:var(--lk-glass) !important;border:1px solid rgba(60,70,200,.4) !important;border-radius:26px !important;box-shadow:var(--shadow);backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4)}
html.look-v2 .screen button[style*="background:#111"],html.look-v2 .screen button[style*="background:#000"]{background:linear-gradient(145deg,#2a3a34,#10201a) !important;border:1px solid rgba(255,255,255,.2) !important;border-radius:20px !important;min-height:52px;box-shadow:0 8px 20px rgba(0,0,0,.25)}
html.look-v2 .screen [style*="background:white"][style*="border-radius"],html.look-v2 .screen [style*="background:#fff"][style*="border-radius:var(--radius)"]{background:var(--lk-glass) !important}
html.look-v2 .screen [style*="background:#e8eaf6"][style*="border-radius"],html.look-v2 .screen [style*="background:#E8EAF6"][style*="border-radius"]{border-radius:16px !important;border-width:1px !important}

html.look-v2 .screen > div[style*="background:#fff"][style*="border-bottom"],html.look-v2 .screen > div[style*="background:#fff"][style*="border-top"]{background:var(--lk-glass) !important;border-color:var(--lk-line) !important;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
html.look-v2 #s-fr-proches > div[style*="min-height:230px"]{margin:6px 16px;border-radius:24px;overflow:hidden;border:1px solid var(--lk-edge)}
html.look-v2 #fr-proches-contenu{background:transparent !important}


/* ── liste des clients de la case France : cartes, puces, avertissements ── */
html.look-v2 .fr-carte{background-color:var(--lk-glass) !important;border:1px solid var(--lk-edge) !important;border-radius:24px !important;padding:14px 16px !important;margin-bottom:12px !important;box-shadow:var(--shadow) !important;backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4)}
html.look-v2 .fr-carte.fr-anc{border-left-width:1px !important}
html.look-v2 .fr-carte.fr-sel{background-image:linear-gradient(135deg,rgba(46,143,106,.30),rgba(46,143,106,.07)) !important;border-color:rgba(46,143,106,.6) !important}
html.look-v2 .fr-carte > div:first-child > div:first-child > div:last-child{font-size:16.5px !important;font-weight:800 !important;letter-spacing:-.015em}
html.look-v2 .fr-carte .badge{font-size:11.5px}
html.look-v2 .fr-chip{background:var(--lk-glass) !important;color:var(--text2) !important;border:1px solid var(--lk-edge) !important;border-radius:99px !important;padding:8px 14px !important;font-size:12.5px !important;font-weight:700 !important}
html.look-v2 .fr-chip.on{background:linear-gradient(145deg,#2fb27c,#1a8a5c) !important;color:#fff !important;border-color:transparent !important;box-shadow:0 6px 14px rgba(26,138,92,.3)}
html.look-v2 #france-content .slabel{margin:16px 4px 10px}
html.look-v2 #france-content > div[onclick^="ouvrirProchesFrance"]{border-radius:22px !important;border-width:1px !important;background:linear-gradient(135deg,rgba(60,70,200,.18),rgba(60,70,200,.05)) !important;padding:14px 16px !important}
html.look-v2 #france-content > div[style*="background:#FFF"],html.look-v2 #france-content > div[style*="background:#fff3"],html.look-v2 #france-content > div[style*="background:#fde"]{border-radius:20px !important}

html.look-v2 #s-home .header img[alt="DCT"]{display:none !important}

/* ── gros boutons : contour épais d'ancien look → dégradé, bords fins et arrondis (écrans, hors modales déjà traitées) ── */
html.look-v2 .add-banner,html.look-v2 .new-btn{background:linear-gradient(145deg,#2fb27c,#1a8a5c) !important;border:1px solid rgba(255,255,255,.4) !important;border-radius:26px !important;box-shadow:0 10px 24px rgba(26,138,92,.32)}
html.look-v2 .screen button[style*="border:2px solid"],html.look-v2 .screen button[style*="border:2.5px solid"],html.look-v2 .screen div[onclick][style*="border:2px solid"][style*="text-align:center"],html.look-v2 .screen div[onclick][style*="border:2.5px solid"][style*="text-align:center"]{border-width:1px !important;border-radius:18px !important}
html.look-v2 .screen button[style*="background:#1a237e"],html.look-v2 .screen button[style*="background:#0d47a1"],html.look-v2 .screen div[onclick][style*="background:#1a237e"]{background:linear-gradient(145deg,#4a55c8,#26338f) !important;border-color:rgba(255,255,255,.35) !important;box-shadow:0 8px 20px rgba(38,51,143,.3)}
html.look-v2 .screen button[style*="background:#006b2d"],html.look-v2 .screen button[style*="background:#009A44"],html.look-v2 .screen button[style*="background:#0E9F5B"],html.look-v2 .screen button[style*="background:var(--green)"]{background:linear-gradient(145deg,#2fb27c,#1a8a5c) !important;border-color:rgba(255,255,255,.35) !important;box-shadow:0 8px 20px rgba(26,138,92,.3)}
html.look-v2 .screen button[style*="background:#c0392b"],html.look-v2 .screen button[style*="background:#B3261E"]{background:linear-gradient(145deg,#e0503f,#b8301f) !important;border-color:rgba(255,255,255,.35) !important}
html.look-v2 .screen button[style*="background:#e65100"],html.look-v2 .screen button[style*="background:#E65100"]{background:linear-gradient(145deg,#f07a1a,#d9560a) !important;border-color:rgba(255,255,255,.35) !important}
html.look-v2 .screen button[style*="background:#FFF3E0"],html.look-v2 .screen button[style*="background:#fff3e0"],html.look-v2 .screen button[style*="background:#FFF8E1"]{border-radius:18px !important;border-width:1px !important}
html.look-v2 .screen button[style*="background:#555"],html.look-v2 .screen button[style*="background:#444"],html.look-v2 .screen button[style*="background:#333"]{background:rgba(120,135,128,.18) !important;color:var(--text) !important;border:1px solid var(--lk-edge) !important;border-radius:18px !important}

html.look-v2 .modal-sheet button[style*="border:2px solid"],html.look-v2 .modal-sheet button[style*="border:2.5px solid"],html.look-v2 .modal-sheet div[onclick][style*="border:2px solid"]{border-width:1px !important;border-radius:18px !important}
html.look-v2 .modal-sheet button[style*="background:#1a237e"]{background:linear-gradient(145deg,#4a55c8,#26338f) !important;border-color:rgba(255,255,255,.35) !important}
html.look-v2 .modal-sheet button[style*="background:#006b2d"],html.look-v2 .modal-sheet button[style*="background:#009A44"]{background:linear-gradient(145deg,#2fb27c,#1a8a5c) !important;border-color:rgba(255,255,255,.35) !important}
html.look-v2 .modal-sheet button[style*="background:#c0392b"]{background:linear-gradient(145deg,#e0503f,#b8301f) !important;border-color:rgba(255,255,255,.35) !important}

/* ── détail d'une collecte : chaque client est une carte en verre (et non plus une ligne dans un bloc) ── */
html.look-v2 #collecte-content .dept-block{background:transparent !important;border:0 !important;box-shadow:none !important;backdrop-filter:none;-webkit-backdrop-filter:none;overflow:visible;margin-bottom:6px}
html.look-v2 #collecte-content .dept-head{background:transparent;border:0;padding:12px 6px 8px}
html.look-v2 #collecte-content .dept-name{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--text3)}
html.look-v2 #collecte-content .client-price{font-size:16px;font-weight:800;letter-spacing:-.01em}


/* ── pastilles auteur / camion : verre teinté + photo ou icône ronde ── */
html.look-v2 .pl{display:inline-flex !important;align-items:center;gap:6px;padding:3px 12px 3px 3px !important;border-radius:99px !important;font-size:12px !important;font-weight:800 !important;border:1px solid rgba(255,255,255,.9) !important;background:linear-gradient(135deg,color-mix(in srgb,var(--pc,#888) 26%,transparent),color-mix(in srgb,var(--pc,#888) 8%,transparent)) !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.8),0 3px 8px rgba(0,0,0,.08);white-space:nowrap;max-width:100%}
html.look-v2 .pl .pl-i{display:flex;width:22px;height:22px;border-radius:50%;background:linear-gradient(145deg,var(--pc,#555),color-mix(in srgb,var(--pc,#555) 60%,#000));color:#fff;font-style:normal;font-size:8.5px;font-weight:800;align-items:center;justify-content:center;flex:none;overflow:hidden}
html.look-v2 .pl .pl-i.pl-camion{font-size:0;background:linear-gradient(145deg,var(--pc,#555),color-mix(in srgb,var(--pc,#555) 60%,#000)) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' fill-opacity='.3' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='1.5' y='4' width='14' height='11.5' rx='2'/%3E%3Cpath d='M15.5 8.5h3.6a2 2 0 0 1 1.6.8l1.8 2.4a2 2 0 0 1 .4 1.2V15a1.5 1.5 0 0 1-1.5 1.5h-5.9'/%3E%3Ccircle cx='6' cy='18' r='2.2'/%3E%3Ccircle cx='17.5' cy='18' r='2.2'/%3E%3C/svg%3E") center/14px no-repeat}
html.look-v2 .pl.pl-cam{font-size:0 !important}
html.look-v2 .pl.pl-cam > *{font-size:0}
html.look-v2 .pl.pl-cam{font-size:12px !important}

html.look-v2 button[title="Changer de collecte"],html.look-v2 button.cr-chg{width:34px;height:34px;border-radius:12px !important;background:rgba(255,255,255,.75) !important;border:1px solid #fff !important;box-shadow:0 4px 10px rgba(0,0,0,.1);padding:0 !important;font-size:15px !important;color:#26338f !important;display:flex;align-items:center;justify-content:center}

/* carte client d'une collecte : haut (avatar, nom, prix) / milieu (adresse, colis) / bas (pastilles + bouton) */


/* carte client France : nom sur toute la largeur, puces de statut dessous, adresse / colis, bande basse (date + auteur) */
html.look-v2 .fr-carte .pl-v1{display:none !important}
html.look-v2 .fr-carte .fr-h{flex-wrap:wrap}
html.look-v2 .fr-carte .fr-nm{flex:1 1 100% !important}
html.look-v2 .fr-carte .fr-nm > div:last-child{font-size:17px !important;font-weight:800 !important;letter-spacing:-.02em}
html.look-v2 .fr-carte .fr-ch{flex-wrap:wrap;margin-top:7px}
html.look-v2 .fr-carte .fr-ad{font-size:12.5px !important;margin-top:8px !important;line-height:1.4}
html.look-v2 .fr-carte .fr-co{font-size:12.5px !important;margin-top:6px !important}
html.look-v2 .fr-carte .fr-co b{font-size:15px}
html.look-v2 .fr-carte .fr-bas{margin-top:11px !important;padding-top:11px;border-top:1px solid var(--lk-line);justify-content:space-between}
html.look-v2 .fr-carte button[onclick*="supprimerClientFranceListe"],html.look-v2 .fr-carte button[onclick*="retirerClientCollecteFrance"]{border-radius:12px !important;width:30px !important;height:30px !important;border-width:1px !important}


/* notes, état de collecte, barres du bas (case France) */
html.look-v2 .fr-carte .fr-etat{display:inline-flex;align-items:center;gap:6px;margin-top:10px !important;padding:6px 12px;border-radius:99px;background:rgba(60,70,200,.1);font-size:12.5px !important;font-weight:700}
html.look-v2 .fr-note{margin-top:11px !important;background:linear-gradient(135deg,rgba(60,70,200,.14),rgba(60,70,200,.04)) !important;border:1px solid rgba(60,70,200,.28) !important;border-radius:18px !important;padding:11px 14px !important}
html.look-v2 .fr-note > div:first-child{flex-wrap:wrap}
html.look-v2 .fr-note > div:nth-child(2){font-size:13.5px !important;color:var(--text) !important}
html.look-v2 .fr-note.vide{background:rgba(120,135,128,.1) !important;border:1px dashed rgba(120,135,128,.5) !important;border-radius:99px !important;padding:7px 13px !important;color:var(--text3) !important}
html.look-v2 #fr-barre,html.look-v2 #s-france > div[style*="border-top"]{background:linear-gradient(180deg,transparent,var(--lk-glass) 40%) !important;border-top:0 !important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
html.look-v2 #fr-btn-tournee{background:linear-gradient(145deg,#4a55c8,#26338f) !important;border:1px solid rgba(255,255,255,.35) !important;border-radius:20px !important}


/* prix du client France : en évidence en haut à droite, comme dans une collecte */
html.look-v2 .fr-carte .fr-nm{flex:1 1 0 !important;min-width:0}
html.look-v2 .fr-carte .fr-px{display:block;order:2;font-size:19px;font-weight:800;letter-spacing:-.02em;color:var(--green-dark,#0a7a45);white-space:nowrap}
html.look-v2 .fr-carte .fr-ch{order:3;flex:1 1 100%}
html.look-v2 .fr-carte .fr-co b,html.look-v2 .fr-carte .fr-sep{display:none}


/* carte client France : adresse / colis / déplacement bien distincts, toujours à la même place */
html.look-v2 .fr-carte .fr-ad{display:flex;gap:6px;align-items:flex-start;color:var(--text3) !important;font-weight:500}
html.look-v2 .fr-carte .fr-ad::before{content:'\1F4CD';font-size:13px;flex:none}
html.look-v2 .fr-carte .fr-co{flex-direction:column !important;align-items:flex-start !important;flex-wrap:nowrap !important;gap:7px !important;margin-top:9px !important}
html.look-v2 .fr-carte .fr-co > span:first-child{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:14px;background:rgba(26,138,92,.1);border:1px solid rgba(26,138,92,.22);color:var(--text) !important;font-size:13px !important;font-weight:700;line-height:1.3}
html.look-v2 .fr-carte .fr-co .badge{display:inline-flex;align-items:center;border-radius:99px;padding:5px 12px;font-size:12px;font-weight:800;border:1px solid rgba(0,120,130,.25)}


/* ── client d'un container : haut (rang, nom, prix) / état / action principale / boutons secondaires écrits ── */
html.look-v2 .dep-cli-btns{display:grid !important;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px !important}
html.look-v2 .dep-cli-btn.lk-main{grid-column:1 / -1}
html.look-v2 .dep-cli-btn.lk-ico{grid-column:auto;height:auto;min-height:44px;width:auto;min-width:0;flex:none;padding:10px 8px;border-radius:15px;font-size:13px;font-weight:800;background:rgba(255,255,255,.8) !important;border:1px solid #fff !important;color:#26338f !important;box-shadow:0 3px 8px rgba(0,0,0,.07);display:flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap}
html.look-v2 .dep-cli-btn.lk-det{grid-column:1 / -1;color:#a02a1e !important;background:rgba(192,57,43,.1) !important;border-color:rgba(192,57,43,.25) !important}
html.look-v2 .dep-cli-btns > .dep-cli-btn:not(.lk-main):not(.lk-ico){grid-column:1 / -1}

html.look-v2 .screen .dep-cli-btns > button.dep-cli-btn.lk-ico[style]{background:rgba(255,255,255,.8) !important;color:#26338f !important;border:1px solid #fff !important;box-shadow:0 3px 8px rgba(0,0,0,.07)}
html.look-v2 .screen .dep-cli-btns > button.dep-cli-btn.lk-det[style]{background:rgba(192,57,43,.1) !important;color:#a02a1e !important;border:1px solid rgba(192,57,43,.25) !important}
html.look-v2 .screen .dep-cli-btns > button.dep-cli-btn.lk-main{min-height:50px;font-size:15px}

html.look-v2 .dep-cli-btns > .lk-ln{grid-column:1 / -1;display:flex;gap:8px;align-items:stretch}
html.look-v2 .dep-cli-btns > .lk-ln > .lk-main{flex:1 1 auto}
html.look-v2 .screen .dep-cli-btns > .lk-ln > button.dep-cli-btn.lk-cop[style],html.look-v2 .dep-cli-btn.lk-cop{flex:0 0 64px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:6px 4px;border-radius:18px;font-size:10.5px;font-weight:800;background:rgba(255,255,255,.85) !important;color:#26338f !important;border:1px solid #fff !important;box-shadow:0 3px 8px rgba(0,0,0,.08)}
html.look-v2 .dep-cli-btn.lk-cop svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
html.look-v2 .dep-cli-btns > .dep-cli-btn.lk-annul{grid-column:1 / -1;min-height:34px !important;padding:6px !important;font-size:12px !important;font-weight:700 !important;background:transparent !important;border:0 !important;box-shadow:none !important;color:#7d8e85 !important}

/* ── client d'un container : bandeau coloré (numéro, nom, prix, téléphone) / corps blanc (état, actions) ── */
html.look-v2 #s-depart-detail .dep-cli{padding:0 !important;border-radius:24px !important;overflow:hidden;background:var(--lk-glass) !important;border:1px solid var(--lk-edge) !important;box-shadow:var(--shadow);margin-bottom:12px}
html.look-v2 #s-depart-detail .cli-hd{display:grid;grid-template-columns:auto 1fr auto auto;column-gap:10px;row-gap:2px;align-items:center;padding:13px 14px 11px}
html.look-v2 #s-depart-detail .cli-hd.hk{background:linear-gradient(135deg,rgba(224,80,63,.22),rgba(224,80,63,.07))}
html.look-v2 #s-depart-detail .cli-hd.ho{background:linear-gradient(135deg,rgba(26,138,92,.22),rgba(26,138,92,.07))}
html.look-v2 #s-depart-detail .cli-hd.hn{background:linear-gradient(135deg,rgba(60,70,200,.18),rgba(60,70,200,.05))}
html.look-v2 #s-depart-detail .cli-hd .dep-cli-n{display:contents !important}
html.look-v2 #s-depart-detail .cli-hd .dep-cli-s{display:contents !important}
html.look-v2 #s-depart-detail .rg-n{grid-column:1;grid-row:1 / span 2;min-width:42px !important;height:42px;border-radius:13px !important;background:linear-gradient(145deg,#3b4a45,#1c2a25) !important;color:#fff !important;border:0 !important;display:flex !important;flex-direction:column;align-items:center;justify-content:center;font-size:17px !important;font-weight:800;line-height:1;letter-spacing:-.02em;padding:0 !important;margin:0 !important;box-shadow:0 4px 10px rgba(0,0,0,.22)}
html.look-v2 #s-depart-detail .rg-l{font-style:normal;font-size:7.5px;font-weight:800;letter-spacing:.08em;opacity:.7;margin-bottom:2px}
html.look-v2 #s-depart-detail .cli-nom{grid-column:2;grid-row:1;font-size:16.5px;font-weight:800;letter-spacing:-.015em;min-width:0}
html.look-v2 #s-depart-detail .cli-tags{grid-column:2;grid-row:2;display:flex;flex-wrap:wrap;gap:4px 8px;font-size:12px;color:var(--text3)}
html.look-v2 #s-depart-detail .cli-tags > span{font-size:12px !important;font-weight:600 !important;color:var(--text3) !important}
html.look-v2 #s-depart-detail .cli-px{grid-column:3;grid-row:1 / span 2;font-size:18px;font-weight:800;letter-spacing:-.02em;color:var(--green-dark,#0a7a45);white-space:nowrap}
html.look-v2 #s-depart-detail .cli-liv{display:none}
html.look-v2 #s-depart-detail .cli-liv2{display:inline !important}
html.look-v2 #s-depart-detail .cli-hd > :not(.rg-n):not(.cli-nom):not(.cli-tags):not(.cli-px):not(.dep-cli-n):not(.dep-cli-s){grid-column:4;grid-row:1 / span 2}
html.look-v2 #s-depart-detail .cli-hd .dep-cli-s > :not(.cli-px){grid-column:4;grid-row:1 / span 2}
html.look-v2 #s-depart-detail .cli-bd{padding:10px 14px 14px;background:rgba(255,255,255,.55)}
html.look-v2 #s-depart-detail .lk-main{min-height:42px !important;font-size:13.5px !important;border-radius:14px !important}
html.look-v2 #s-depart-detail .dep-cli-btn.lk-ico{min-height:38px !important;padding:8px 6px !important;border-radius:13px !important}
html.look-v2 #s-depart-detail .lk-cop{border-radius:14px !important}

html.look-v2 #s-depart-detail .dep-cli-btn.lk-main[style*="#FFF4E0"],html.look-v2 #s-depart-detail .dep-cli-btn.lk-main[style*="background:#fff;border-color:#E58A00"]{background:linear-gradient(145deg,#e08a2b,#c26a00) !important;color:#fff !important;border:0 !important;box-shadow:0 6px 14px rgba(194,106,0,.28)}
html.look-v2 #s-depart-detail .dep-cli-btn.lk-main[style*="#D4F0E0"]{background:rgba(26,138,92,.14) !important;color:#0a6b3d !important;border:1px solid rgba(26,138,92,.3) !important;box-shadow:none}

/* ── pastilles de paiement (Colis soldé / reste à payer / Livraison…) ── */
html.look-v2 .pp{display:inline-flex !important;align-items:center;gap:6px;border:0 !important;border-radius:99px !important;padding:5px 12px 5px 8px !important;font-size:12.5px !important;font-weight:800 !important;margin:2px 6px 2px 0 !important}
html.look-v2 .pp-e,html.look-v2 .pp-l{display:none}
html.look-v2 .pp-c{display:inline}
html.look-v2 .pp-i{display:inline-block;width:14px;height:14px;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 6L6 18M6 6l12 12'/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 6L6 18M6 6l12 12'/%3E%3C/svg%3E") center/contain no-repeat}
html.look-v2 .pp-v{background:rgba(26,138,92,.16) !important;color:#0a6b3d !important}
html.look-v2 .pp-v .pp-i{-webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6L9 17l-5-5'/%3E%3C/svg%3E");mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6L9 17l-5-5'/%3E%3C/svg%3E")}
html.look-v2 .pp-k{background:rgba(224,80,63,.16) !important;color:#a02a1e !important}
html.look-v2 .pp-o{background:rgba(224,140,30,.18) !important;color:#8a5200 !important}
html.look-v2 .pp-o .pp-i{-webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6L9 17l-5-5'/%3E%3C/svg%3E");mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6L9 17l-5-5'/%3E%3C/svg%3E");opacity:.6}
html.look-v2 .pp-liv .pp-i{-webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='1.5' y='4' width='14' height='11.5' rx='2'/%3E%3Cpath d='M15.5 8.5h3.6a2 2 0 0 1 1.6.8l1.8 2.4a2 2 0 0 1 .4 1.2V15a1.5 1.5 0 0 1-1.5 1.5h-5.9'/%3E%3Ccircle cx='6' cy='18' r='2.2'/%3E%3Ccircle cx='17.5' cy='18' r='2.2'/%3E%3C/svg%3E");mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='1.5' y='4' width='14' height='11.5' rx='2'/%3E%3Cpath d='M15.5 8.5h3.6a2 2 0 0 1 1.6.8l1.8 2.4a2 2 0 0 1 .4 1.2V15a1.5 1.5 0 0 1-1.5 1.5h-5.9'/%3E%3Ccircle cx='6' cy='18' r='2.2'/%3E%3Ccircle cx='17.5' cy='18' r='2.2'/%3E%3C/svg%3E")}
html.look-v2 #s-depart-detail .cli-b1:empty{display:none}
html.look-v2 #s-depart-detail .cli-bd > * + *{border-top:1px solid var(--lk-line);margin-top:10px;padding-top:10px}
html.look-v2 #s-depart-detail .cli-bd > .cli-b1{margin:0 0 0}
html.look-v2 #s-depart-detail .cli-ct{display:flex;gap:10px;align-items:flex-start}
html.look-v2 #s-depart-detail .cli-n{flex:none;min-width:30px;height:30px;border-radius:10px;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.08);display:flex;align-items:center;justify-content:center;font-weight:800;color:#26338f;font-size:14px;padding:0 6px}
html.look-v2 #s-depart-detail .cli-t{font-size:13.5px;font-weight:700;line-height:1.35;padding-top:5px;white-space:pre-line}
html.look-v2 #s-depart-detail .cli-bd .dep-cli-btns{margin-top:10px !important}

/* ── clients d'une collecte : même carte que dans un container (bandeau / paiement / contenu / auteur-camion-bouton) ── */
html.look-v2 #collecte-content .client-row:has(> .cr-hd){display:block !important;padding:0 !important;overflow:hidden;background:var(--lk-glass);border:1px solid var(--lk-edge) !important;border-radius:24px;margin:0 0 12px;box-shadow:var(--shadow);backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4)}
html.look-v2 #collecte-content .client-row:has(> .cr-hd):last-child{border-bottom:1px solid var(--lk-edge) !important}
html.look-v2 #collecte-content .cr-hd{display:grid;grid-template-columns:auto 1fr auto;column-gap:12px;align-items:center;padding:13px 14px}
html.look-v2 #collecte-content .cr-hd.hk{background:linear-gradient(135deg,rgba(224,80,63,.22),rgba(224,80,63,.07))}
html.look-v2 #collecte-content .cr-hd.ho{background:linear-gradient(135deg,rgba(26,138,92,.22),rgba(26,138,92,.07))}
html.look-v2 #collecte-content .cr-hd.hn{background:linear-gradient(135deg,rgba(60,70,200,.14),rgba(60,70,200,.04))}
html.look-v2 #collecte-content .cr-hd .av{width:42px;height:42px;font-size:13px}
html.look-v2 #collecte-content .cr-hd .client-name{font-size:16.5px;font-weight:800;letter-spacing:-.015em;white-space:normal}
html.look-v2 #collecte-content .cr-hd .client-sub{white-space:normal;overflow:visible;text-overflow:clip;font-size:12.5px;line-height:1.35;color:var(--text3)}
html.look-v2 #collecte-content .cr-colis1{display:none}
html.look-v2 #collecte-content .cr-px{display:block;font-size:18px;font-weight:800;letter-spacing:-.02em;color:var(--green-dark,#0a7a45);white-space:nowrap}
html.look-v2 #collecte-content .cr-bd{display:block;padding:10px 14px 13px;background:rgba(255,255,255,.55)}
html.look-v2 #collecte-content .cr-b1:empty{display:none}
html.look-v2 #collecte-content .cr-b1,html.look-v2 #collecte-content .cr-ct{display:block}
html.look-v2 #collecte-content .cr-ct{display:flex;gap:10px;align-items:flex-start;border-top:1px solid var(--lk-line);margin-top:10px;padding-top:10px}
html.look-v2 #collecte-content .cr-b1:empty + .cr-ct{border-top:0;margin-top:0;padding-top:0}
html.look-v2 #collecte-content .cr-n{flex:none;min-width:30px;height:30px;border-radius:10px;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.08);display:flex;align-items:center;justify-content:center;font-weight:800;color:#26338f;font-size:14px;padding:0 6px}
html.look-v2 #collecte-content .cr-t{font-size:13.5px;font-weight:700;line-height:1.35;padding-top:5px;white-space:pre-line}
html.look-v2 #collecte-content .cr-dr{display:flex !important;flex-direction:row !important;align-items:center !important;gap:8px;border-top:1px solid var(--lk-line);margin-top:10px;padding-top:10px}
html.look-v2 #collecte-content .cr-dr .client-price{display:none}
html.look-v2 #collecte-content .cr-dr .cr-bas{display:flex;flex-wrap:wrap;gap:8px;align-items:center;flex:1}
html.look-v2 #collecte-content .cr-dr button.cr-chg{margin-left:auto}

/* ── clients France : même carte (bandeau coloré, corps blanc, traits fins) ── */
html.look-v2 .fr-carte{padding:0 !important;overflow:hidden;background:var(--lk-glass) !important}
html.look-v2 .fr-hd{padding:13px 14px 11px}
html.look-v2 .fr-hd.hk{background:linear-gradient(135deg,rgba(224,80,63,.2),rgba(224,80,63,.06))}
html.look-v2 .fr-hd.ha{background:linear-gradient(135deg,rgba(235,150,30,.26),rgba(235,150,30,.08))}
html.look-v2 .fr-hd.ho{background:linear-gradient(135deg,rgba(26,138,92,.22),rgba(26,138,92,.07))}
html.look-v2 .fr-hd.hn{background:linear-gradient(135deg,rgba(60,70,200,.16),rgba(60,70,200,.05))}
html.look-v2 .fr-hd .fr-h{display:flex;flex-wrap:wrap;align-items:center}
html.look-v2 .fr-hd .fr-ch{margin-top:8px}
html.look-v2 .fr-bd{padding:10px 14px 13px;background:rgba(255,255,255,.55)}
html.look-v2 .fr-bd > .fr-ad{margin-top:0 !important}
html.look-v2 .fr-bd > .fr-pay{margin-bottom:8px}
html.look-v2 .fr-pay .pp{margin:0 !important}
html.look-v2 .fr-pay + .fr-ad{border-top:1px solid var(--lk-line);padding-top:10px}
html.look-v2 .fr-bd > .fr-co{border-top:1px solid var(--lk-line);margin-top:10px !important;padding-top:10px}
html.look-v2 .fr-bd > .fr-bas{border-top:1px solid var(--lk-line);margin-top:10px !important;padding-top:10px}
html.look-v2 .fr-bd > .fr-note,html.look-v2 .fr-bd > .fr-etat{margin-top:10px !important}
html.look-v2 button.cr-chg{width:auto !important;height:auto !important;min-height:34px;padding:7px 12px !important;border-radius:12px !important;font-size:12.5px !important;font-weight:800 !important;gap:6px;white-space:nowrap}
html.look-v2 button.cr-chg .cr-chg-i{display:inline-flex}
html.look-v2 button.cr-chg .cr-chg-t{display:inline}
html.look-v2 .fr-carte .fr-px{font-size:24px !important;display:flex !important;flex-direction:column;align-items:flex-end;text-align:right;line-height:1.15}
html.look-v2 .fr-carte .fr-dp{display:inline-block;font-size:12px;font-weight:800;letter-spacing:0;color:#00636b;background:rgba(0,140,150,.14);border-radius:99px;padding:3px 9px;margin-top:5px}
html.look-v2 .fr-carte .fr-dpb{display:none !important}
html.look-v2 .fr-carte .fr-tot{font-size:27px;line-height:1.05;font-weight:800;letter-spacing:-.02em;color:var(--green-dark,#0a7a45)}
html.look-v2 .fr-carte .fr-tot i{font-style:normal;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--text3);margin-right:3px}
html.look-v2 .fr-carte .fr-ln{display:block;font-size:12.5px;font-weight:700;color:var(--text2);margin-top:3px}

/* mention « Livraison à Dakar » (hors caisse) sur les cartes client */
html.look-v2 .liv-dk{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:800;color:#6b3fa0;background:rgba(122,92,240,.14);border-radius:99px;padding:5px 12px 5px 8px;margin:4px 6px 2px 0}
html.look-v2 .liv-dk-i{display:inline-block;width:14px;height:14px;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='1.5' y='4' width='14' height='11.5' rx='2'/%3E%3Cpath d='M15.5 8.5h3.6a2 2 0 0 1 1.6.8l1.8 2.4a2 2 0 0 1 .4 1.2V15a1.5 1.5 0 0 1-1.5 1.5h-5.9'/%3E%3Ccircle cx='6' cy='18' r='2.2'/%3E%3Ccircle cx='17.5' cy='18' r='2.2'/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='1.5' y='4' width='14' height='11.5' rx='2'/%3E%3Cpath d='M15.5 8.5h3.6a2 2 0 0 1 1.6.8l1.8 2.4a2 2 0 0 1 .4 1.2V15a1.5 1.5 0 0 1-1.5 1.5h-5.9'/%3E%3Ccircle cx='6' cy='18' r='2.2'/%3E%3Ccircle cx='17.5' cy='18' r='2.2'/%3E%3C/svg%3E") center/contain no-repeat}
html.look-v2 .cr-b1 .liv-dk{display:inline-flex}

/* ── bloc des prix : TOTAL À PAYER (bandeau sombre) + détail (colis bleu, déplacement turquoise, livraison violet) ── */
html.look-v2 .pb{display:block;margin-bottom:10px}
html.look-v2 .pb-t{display:flex;justify-content:space-between;align-items:center;border-radius:16px;padding:10px 14px;background:linear-gradient(145deg,#3b4a45,#1c2a25);color:#fff;box-shadow:0 6px 14px rgba(0,0,0,.2)}
html.look-v2 .pb-t span{font-size:11.5px;font-weight:800;letter-spacing:.1em;opacity:.8}
html.look-v2 .pb-t b{font-size:26px;letter-spacing:-.02em;line-height:1.1}
html.look-v2 .pb-g{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:6px;margin-top:7px}
html.look-v2 .pb-g > div{border-radius:12px;padding:6px 10px;min-width:0}
html.look-v2 .pb-h{display:flex;align-items:baseline;justify-content:space-between;gap:6px}
html.look-v2 .pb-g small{display:block;font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
html.look-v2 .pb-g b{font-size:15px;white-space:nowrap}
html.look-v2 .pb-g em{display:block;font-style:normal;font-size:11.5px;font-weight:800;margin-top:1px;white-space:nowrap}
html.look-v2 .pb-c em{color:#a04800}html.look-v2 .pb-d em{color:#a04800}html.look-v2 .pb-l em{color:#a82020}html.look-v2 .pb-g em.pb-s{color:#0a6b3d}
html.look-v2 .pb-t.pb-3{display:block;padding:9px 14px 10px}
html.look-v2 .pb-r{display:flex}
html.look-v2 .pb-k{flex:1;min-width:0;padding:0 10px;border-left:1px solid rgba(255,255,255,.18)}
html.look-v2 .pb-k:first-child{border:0;padding-left:0}
html.look-v2 .pb-k small{display:block;font-size:9.5px;font-weight:800;letter-spacing:.1em;opacity:.65;margin-bottom:1px}
html.look-v2 .pb-k b{display:block;font-size:18px;white-space:nowrap;line-height:1.15}
html.look-v2 .pb-kp b{color:#6fe0a5}
html.look-v2 .pb-kr{flex:1.3}html.look-v2 .pb-kr small{opacity:1;color:#ffc46b}html.look-v2 .pb-kr b{font-size:23px;color:#ffb347}
html.look-v2 .pb-bar{height:6px;border-radius:99px;background:rgba(255,255,255,.16);margin-top:8px;overflow:hidden}
html.look-v2 .pb-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#4ddc98,#2fb27c)}
html.look-v2 .pb-t.pb-ok{padding:10px 16px}html.look-v2 .pb-t.pb-ok b{font-size:24px}
/* les pastilles « reste » sont maintenant DANS le bloc des prix */
html.look-v2 .pb ~ .cr-b1 .pp-ln,html.look-v2 .pb ~ .fr-pay,html.look-v2 .pb + .cli-b1 .pp-ln{display:none !important}
html.look-v2 .pb-c{background:rgba(60,70,200,.12);color:#26338f}.pb-c small{color:#7d8e85}
html.look-v2 .pb-d{background:rgba(0,140,150,.14);color:#00636b}.pb-d small{color:#6a8f93}
html.look-v2 .pb-l{background:rgba(122,92,240,.14);color:#6b3fa0}.pb-l small{color:#8a7fb0}
/* prix du bandeau remplacés par ce bloc */
html.look-v2 #collecte-content .cr-px{display:none !important}
html.look-v2 .fr-carte .fr-px{display:none !important}
html.look-v2 .liv-dk{display:none !important}
/* pastilles « reste à payer » : toujours sur la MÊME ligne */
html.look-v2 .pp-ln,html.look-v2 .cr-b1 > div,html.look-v2 .fr-pay{display:flex !important;flex-wrap:nowrap;gap:6px}
html.look-v2 .pp-ln .pp{flex:0 1 auto;min-width:0;white-space:nowrap;margin:0 !important;padding:5px 9px 5px 7px !important;font-size:11.5px !important;gap:4px !important}
html.look-v2 .pp-ln .pp-i{width:12px;height:12px;flex:none}
html.look-v2 .fr-hd > .fr-ad{margin:7px 0 0 !important;padding:0 !important;border:0 !important;font-size:12.5px !important;color:var(--text3);display:block !important}
html.look-v2 .fr-hd > .fr-ad::before{content:none !important}
html.look-v2 .fr-pay + .fr-ad,html.look-v2 .fr-bd > .fr-co:first-child{border-top:0}
html.look-v2 .fr-hd{display:flex;flex-direction:column}
html.look-v2 .fr-hd .fr-h{display:contents !important}
html.look-v2 .fr-hd .fr-nm{order:1;flex:none !important;display:flex !important}
html.look-v2 .fr-hd > .fr-ad{order:2}
html.look-v2 .fr-hd .fr-ch{order:3;margin-top:8px}
/* onglet Dispatch : lignes simples (avatar, nom, ville, prix, camion) en cartes de verre */
html.look-v2 #collecte-content .client-row:not(:has(> .cr-hd)){display:flex !important;align-items:center;gap:12px;background:var(--lk-glass);border:1px solid var(--lk-edge) !important;border-radius:22px;margin:0 0 10px;padding:12px 14px !important;box-shadow:var(--shadow)}
html.look-v2 #collecte-content .client-row:not(:has(> .cr-hd)) .av{width:42px;height:42px;font-size:13px;flex:none}
html.look-v2 #collecte-content .client-row:not(:has(> .cr-hd)) .client-info{flex:1;min-width:0}
html.look-v2 #collecte-content .client-row:not(:has(> .cr-hd)) .client-name{font-size:15.5px;font-weight:800;white-space:normal}
html.look-v2 #collecte-content .client-row:not(:has(> .cr-hd)) .client-sub{white-space:normal;font-size:12px}
html.look-v2 #collecte-content .client-row:not(:has(> .cr-hd)) > div:last-child{display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex:none}
html.look-v2 #collecte-content .client-row:not(:has(> .cr-hd)) .truck-pill{border-radius:99px;font-size:11.5px;font-weight:800;padding:5px 12px;white-space:nowrap}
/* bas de carte de collecte : auteur + camion + « Changer de date » toujours sur UNE ligne */
html.look-v2 #collecte-content .cr-dr{flex-wrap:nowrap !important;gap:6px !important}
html.look-v2 #collecte-content .cr-dr .cr-bas{flex-wrap:nowrap !important;gap:6px !important;min-width:0;flex:1 1 auto}
html.look-v2 #collecte-content .cr-dr .pl{min-width:0;flex:0 1 auto;font-size:11px !important;padding:2px 9px 2px 2px !important;overflow:hidden;text-overflow:ellipsis;gap:4px !important}
html.look-v2 #collecte-content .cr-dr .pl .pl-i{width:20px;height:20px;flex:none}
html.look-v2 #collecte-content .cr-dr button.cr-chg{flex:none;padding:6px 9px !important;font-size:11.5px !important;gap:4px;min-height:30px}
html.look-v2 .pb-t.pb-ok{background:linear-gradient(145deg,#2fb27c,#1a8a5c);box-shadow:0 6px 14px rgba(26,138,92,.35)}
html.look-v2 #s-depart-detail .cli-px,html.look-v2 #s-depart-detail .cli-liv2{display:none !important}
html.look-v2 #s-depart-detail .cli-bd > .pb{margin-bottom:10px}
html.look-v2 #s-depart-detail .cli-bd > .pb + .cli-b1{border-top:0;padding-top:0;margin-top:0}

/* ── feuille de route d'un camion (collecte et France) ── */
html.look-v2 #s-camion .content > div[style*="border:2px solid var(--green)"],html.look-v2 #s-fr-camion .content > div[style*="border:2px solid var(--green)"],html.look-v2 #s-camion .content > div[style*="border:2px solid #1a237e"],html.look-v2 #s-fr-camion .content > div[style*="border:2px solid #1a237e"]{background:var(--lk-glass) !important;border:1px solid var(--lk-edge) !important;border-radius:26px !important;box-shadow:var(--shadow);backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4);padding:16px !important}
html.look-v2 #s-camion div[style*="background:#F9F9F7"],html.look-v2 #s-fr-camion div[style*="background:#F9F9F7"]{background:rgba(255,255,255,.55) !important;border:1px solid var(--lk-edge) !important;border-radius:20px !important}
html.look-v2 .finance-bar-bg{height:10px;border-radius:99px !important;background:rgba(120,135,128,.2) !important;border:0 !important;overflow:hidden}
html.look-v2 .finance-bar-bg > div{border-radius:99px !important}
html.look-v2 .route-card{background:var(--lk-glass) !important;border:1px solid var(--lk-edge) !important;border-radius:26px !important;box-shadow:var(--shadow);backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4);margin-bottom:12px}
html.look-v2 .route-top{padding:13px 14px;background:linear-gradient(135deg,rgba(60,70,200,.12),rgba(60,70,200,.03))}
html.look-v2 .route-num{width:38px;height:38px;font-size:15px;box-shadow:0 4px 10px rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.5)}
html.look-v2 .route-client-name{font-size:16px;letter-spacing:-.015em;text-decoration:none}
html.look-v2 .route-top [style*="border:2px solid"],html.look-v2 .route-top [style*="border:2.5px solid"],html.look-v2 .route-time{border-width:1px !important;border-radius:99px !important}
html.look-v2 .route-details{background:rgba(255,255,255,.55);border-top:1px solid var(--lk-line);padding:11px 14px}
html.look-v2 .route-detail-row{font-size:13.5px;margin-bottom:7px}
html.look-v2 .route-actions{gap:8px;padding:10px 14px 14px}
html.look-v2 .route-action-btn{border-width:1px !important;border-radius:16px !important;min-height:48px;font-size:14px}
html.look-v2 .route-action-validate{background:linear-gradient(145deg,#2fb27c,#1a8a5c) !important;border-color:rgba(255,255,255,.4) !important;box-shadow:0 8px 18px rgba(26,138,92,.3)}
html.look-v2 .route-action-refuse{background:linear-gradient(145deg,#e0503f,#b8301f) !important;border-color:rgba(255,255,255,.35) !important}
html.look-v2 .route-action-more{background:rgba(255,255,255,.85) !important;color:#26338f !important;border:1px solid #fff !important;box-shadow:0 3px 8px rgba(0,0,0,.07)}
html.look-v2 .route-action-done-g{background:rgba(26,138,92,.14) !important;border-color:rgba(26,138,92,.35) !important}
html.look-v2 .route-action-done-r{background:rgba(224,80,63,.14) !important;border-color:rgba(224,80,63,.35) !important}
html.look-v2 .route-actions.dep-extra-camion button,html.look-v2 .route-card button[style*="border:2px solid #bbb"],html.look-v2 .route-card button[style*="border:2px solid #E58A00"],html.look-v2 .route-card button[style*="border:2px solid #1a237e"]{border-width:1px !important;border-radius:14px !important;min-height:40px;background-color:rgba(255,255,255,.85) !important;box-shadow:0 3px 8px rgba(0,0,0,.06)}
html.look-v2 .route-card .route-actions button[style*="#25D366"],html.look-v2 .route-card button[style*="background:#25D366"]{border-radius:14px !important;border-width:0 !important}
html.look-v2 .route-card button[style*="background:#1a237e"]{background:linear-gradient(145deg,#4a55c8,#26338f) !important;border-radius:14px !important;border-width:0 !important;color:#fff !important}
html.look-v2 #s-camion .content > button[style*="background:#111"],html.look-v2 #s-camion .content > button[style*="background:#000"],html.look-v2 #s-fr-camion .content > button[style*="background:#111"]{background:linear-gradient(145deg,#2a3a34,#10201a) !important;border-radius:20px !important;min-height:52px}

/* feuille de route : « Ajouté par » en bande + blocs Adresse / Téléphone / Colis et prix */
html.look-v2 .route-top .by-v1,html.look-v2 .route-top > div:nth-child(2) > div:nth-child(2){display:none}
html.look-v2 .route-top > div:nth-child(2)::after{content:'Tap pour modifier';display:block;font-size:11px;color:var(--text3);margin-top:2px}
html.look-v2 .route-by{display:flex;align-items:center;gap:9px;padding:9px 14px;background:rgba(255,255,255,.6);border-top:1px solid var(--lk-line)}
html.look-v2 .rb-l{display:inline;font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--text3)}
html.look-v2 .route-by .pl{font-size:14px !important;padding:4px 14px 4px 4px !important;box-shadow:0 3px 8px rgba(0,0,0,.1)}
html.look-v2 .route-by .pl .pl-i{width:28px;height:28px}
html.look-v2 .route-details{padding:2px 14px 4px}
html.look-v2 .route-detail-row{display:flex;align-items:center;gap:11px;padding:10px 0;margin:0 !important}
html.look-v2 .rd-adr,html.look-v2 .rd-col{border-top:1px solid var(--lk-line)}
html.look-v2 .rd-adr{border-top:0}
html.look-v2 .rd-tel{padding-top:2px}
html.look-v2 .rd-ic{flex:none;width:32px;height:32px;border-radius:11px;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.08);display:flex;align-items:center;justify-content:center;font-size:15px}
html.look-v2 .rd-t{flex:1;min-width:0;display:block}
html.look-v2 .rd-l{display:block;font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--text3);margin-bottom:1px}
html.look-v2 .rd-px{display:block;font-size:19px;font-weight:800;letter-spacing:-.02em;color:var(--green-dark,#0a7a45);white-space:nowrap}
html.look-v2 .rd-prix1{display:none !important}
html.look-v2 .rd-tel .rd-t a{display:inline-block;margin-right:10px}
html.look-v2 .dep-obs-avant{width:auto !important;display:block;margin:10px 14px 0 !important;border-radius:14px !important;border-width:1px !important;min-height:42px;font-size:13px !important;background-color:rgba(255,255,255,.85) !important;box-shadow:0 3px 8px rgba(0,0,0,.06);width:calc(100% - 28px) !important}
html.look-v2 .route-actions.dep-extra-camion{padding:10px 14px 0}
html.look-v2 .rd-liv,html.look-v2 .rd-dep{display:flex}
html.look-v2 .rd-tot{display:block;padding:4px 0 10px}
html.look-v2 .rd-tot .pb{display:block;margin:0}
html.look-v2 .rd-col .rd-px{color:#26338f;font-size:17px}
html.look-v2 .rd-liv .rd-ic{background:rgba(122,92,240,.16)}
html.look-v2 .rd-liv .rd-l,html.look-v2 .rd-liv .rd-t{color:#6b3fa0}
html.look-v2 .rd-liv .rd-px{color:#6b3fa0;font-size:17px}
html.look-v2 .rd-dep .rd-ic{background:rgba(0,140,150,.16)}
html.look-v2 .rd-dep .rd-l,html.look-v2 .rd-dep .rd-t{color:#00636b}
html.look-v2 .rd-dep .rd-px{color:#00636b;font-size:17px}
html.look-v2 .rd-liv,html.look-v2 .rd-dep{padding-top:0 !important}

/* états d'une étape : à faire (bleu) / ramassé (vert) / reporté (orange) / annulé (violet) / refusé (rouge) */
html.look-v2 .route-card.done{border-color:rgba(26,138,92,.55) !important;background-image:none !important}
html.look-v2 .route-card.done .route-top{background:linear-gradient(135deg,rgba(26,138,92,.32),rgba(26,138,92,.1))}
html.look-v2 .route-card.done .route-num{background:#0a6b3d !important}
html.look-v2 .route-card.done .route-top > div:last-child::before{content:'\2713 '}
html.look-v2 .route-card.done .route-top > div:last-child{background:#fff;border-radius:99px;padding:6px 12px;box-shadow:0 2px 6px rgba(0,0,0,.08);color:#0a6b3d !important}
html.look-v2 .route-card.reported{border-color:rgba(235,150,30,.6) !important}
html.look-v2 .route-card.reported .route-top{background:linear-gradient(135deg,rgba(235,150,30,.34),rgba(235,150,30,.1))}
html.look-v2 .route-card.reported .route-num{background:#d9560a !important}
html.look-v2 .route-card.cancelled{border-color:rgba(122,92,240,.5) !important}
html.look-v2 .route-card.cancelled .route-top{background:linear-gradient(135deg,rgba(122,92,240,.28),rgba(122,92,240,.08))}
html.look-v2 .route-card.cancelled .route-num{background:#6b3fa0 !important}
html.look-v2 .route-card.refused{border-color:rgba(224,80,63,.55) !important;background-image:none !important}
html.look-v2 .route-card.refused .route-top{background:linear-gradient(135deg,rgba(224,80,63,.3),rgba(224,80,63,.08))}
html.look-v2 .route-card.refused .route-num{background:#b8301f !important}
html.look-v2 .route-card.reported .route-action-btn:not(button),html.look-v2 .route-card .route-actions div.route-action-btn[style*="#e65100"]{background:rgba(235,150,30,.18) !important;color:#a04800 !important;border:1px solid rgba(235,150,30,.4) !important;border-radius:16px !important;min-height:48px}
html.look-v2 .route-card .route-actions div.route-action-btn[style*="#6b21a8"]{background:rgba(122,92,240,.14) !important;color:#6b3fa0 !important;border:1px solid rgba(122,92,240,.35) !important;border-radius:16px !important;min-height:48px}
html.look-v2 .route-card .route-actions button.route-action-btn[style*="#856404"]{background:rgba(255,255,255,.9) !important;border:1px solid #fff !important;border-radius:16px !important;box-shadow:0 2px 8px rgba(0,0,0,.07);flex:0 0 48px;min-height:48px;padding:0 !important}
html.look-v2 .route-actions button.route-action-btn:not(.route-action-validate):not(.route-action-refuse):not(.route-action-more){background:rgba(255,255,255,.9) !important;color:#26338f !important;border:1px solid #fff !important;border-radius:16px !important;box-shadow:0 2px 8px rgba(0,0,0,.07);flex:0 0 48px;min-height:48px;padding:0 !important}
html.look-v2 .route-card.reported .route-actions div.route-action-btn{background:rgba(235,150,30,.18) !important;color:#a04800 !important;border:1px solid rgba(235,150,30,.4) !important;border-radius:16px !important;min-height:48px}
html.look-v2 .route-card.cancelled .route-actions div.route-action-btn{background:rgba(122,92,240,.14) !important;color:#6b3fa0 !important;border:1px solid rgba(122,92,240,.35) !important;border-radius:16px !important;min-height:48px}
html.look-v2 .route-actions .route-action-done-g,html.look-v2 .route-actions .route-action-done-r{flex:1 1 auto;min-width:0;white-space:nowrap;font-size:12.5px;padding:0 6px !important;display:flex;align-items:center;justify-content:center}
html.look-v2 .route-card.done .route-actions button[onclick*="Facture"],html.look-v2 .route-card.done .route-actions button:not(.route-action-btn){border-radius:14px !important;border-width:1px !important}
/* toute la carte prend la couleur de l'état (pas seulement le bandeau) */
html.look-v2 .route-card .route-details,html.look-v2 .route-card .route-by{background:transparent !important}
html.look-v2 .route-card{background-image:linear-gradient(180deg,rgba(60,70,200,.07),rgba(60,70,200,.04)) !important}
html.look-v2 .route-card.done{background-image:linear-gradient(180deg,rgba(26,138,92,.2),rgba(26,138,92,.13)) !important}
html.look-v2 .route-card.reported{background-image:linear-gradient(180deg,rgba(235,150,30,.22),rgba(235,150,30,.14)) !important}
html.look-v2 .route-card.cancelled{background-image:linear-gradient(180deg,rgba(122,92,240,.18),rgba(122,92,240,.11)) !important}
html.look-v2 .route-card.refused{background-image:linear-gradient(180deg,rgba(224,80,63,.19),rgba(224,80,63,.12)) !important}
html.look-v2 .route-card.done .route-top{background:linear-gradient(135deg,rgba(26,138,92,.42),rgba(26,138,92,.2))}
html.look-v2 .route-card.reported .route-top{background:linear-gradient(135deg,rgba(235,150,30,.46),rgba(235,150,30,.22))}
html.look-v2 .route-card.cancelled .route-top{background:linear-gradient(135deg,rgba(122,92,240,.38),rgba(122,92,240,.18))}
html.look-v2 .route-card.refused .route-top{background:linear-gradient(135deg,rgba(224,80,63,.4),rgba(224,80,63,.18))}
/* observation à lire : orange bien visible (c'est important avant d'aller chez le client) */
html.look-v2 .dep-obs-avant.dep-obs-lire,html.look-v2 button.dep-obs-lire{background:linear-gradient(145deg,#f5a623,#e07a10) !important;background-color:#f08a1a !important;color:#fff !important;border:1px solid rgba(255,255,255,.5) !important;font-weight:800 !important;box-shadow:0 8px 20px rgba(224,122,16,.4) !important;min-height:46px;font-size:14px !important;text-shadow:0 1px 2px rgba(0,0,0,.2)}

/* ── Dispatch : barre de boutons + cartes de camion repliables, à la couleur de chaque camion ── */
html.look-v2 .cam-map-v1,html.look-v2 .cam-add-v1{display:none !important}
html.look-v2 .cam-tb{display:flex;gap:8px;margin:2px 0 14px}
html.look-v2 .cam-tb button{border-radius:16px;padding:13px 10px;font-weight:800;font-size:13.5px;font-family:inherit;cursor:pointer;border:0}
html.look-v2 .cam-tb-a{flex:1.3;color:#fff;background:linear-gradient(145deg,#4a55c8,#26338f);box-shadow:0 8px 18px rgba(38,51,143,.3)}
html.look-v2 .cam-tb-b{flex:1;color:#26338f;background:rgba(255,255,255,.9);box-shadow:0 2px 8px rgba(0,0,0,.07)}
html.look-v2 .truck-card.lk-cam{display:grid;grid-template-columns:1fr 1fr;padding:0 !important;overflow:hidden;background:var(--lk-glass) !important;border:1px solid color-mix(in srgb,var(--tc) 45%,#fff) !important;border-radius:24px !important;box-shadow:var(--shadow);margin-bottom:12px;backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4)}
html.look-v2 .lk-cam .truck-head{grid-column:1 / -1;padding:13px 14px !important;margin:0 !important;border:0 !important;background:linear-gradient(135deg,color-mix(in srgb,var(--tc) 34%,transparent),color-mix(in srgb,var(--tc) 9%,transparent)) !important;display:flex;align-items:center;gap:10px}
html.look-v2 .lk-cam .truck-name{font-size:17px;font-weight:800;letter-spacing:-.01em;color:var(--text) !important}
html.look-v2 .lk-cam .truck-head [onclick*="toggleRename"],html.look-v2 .lk-cam .truck-head [onclick*="demanderSupprimerCamion"]{width:34px;height:34px;padding:0 !important;border-radius:11px !important;background:#fff !important;border:0 !important;box-shadow:0 2px 6px rgba(0,0,0,.08);display:inline-flex;align-items:center;justify-content:center;font-size:14px !important}
html.look-v2 .lk-cam .truck-count{border:0 !important;border-radius:99px !important;background:#fff !important;font-weight:800;padding:5px 11px;box-shadow:0 2px 6px rgba(0,0,0,.08)}
html.look-v2 .lk-cam .rename-zone{grid-column:1 / -1}
html.look-v2 .lk-cam .truck-finance{margin:12px 4px 0 14px !important;padding:9px 12px !important;border-radius:14px;background:rgba(120,135,128,.1) !important;border:0 !important}
html.look-v2 .lk-cam .truck-ramasse{margin:12px 14px 0 4px !important;padding:9px 12px !important;border-radius:14px;background:rgba(120,135,128,.1) !important;border:0 !important}
html.look-v2 .lk-cam .truck-pills-wrap{display:none !important}
html.look-v2 .lk-cam .cam-next{display:block;grid-column:1 / -1;padding:10px 14px 12px;font-size:12.5px;font-weight:700;color:var(--text2)}
html.look-v2 .lk-cam .cam-next b{color:color-mix(in srgb,var(--tc) 70%,#000)}
html.look-v2 .lk-cam .cam-list{display:none;grid-column:1 / -1;padding:6px 14px 8px;border-top:1px solid var(--lk-line)}
html.look-v2 .lk-cam.ouvert .cam-list{display:block}
html.look-v2 .lk-cam .cam-r{display:flex;align-items:center;gap:10px;padding:7px 0;font-size:14px;font-weight:700}
html.look-v2 .lk-cam .cam-r + .cam-r{border-top:1px solid var(--lk-line)}
html.look-v2 .lk-cam .cam-h{flex:none;width:58px;text-align:center;border-radius:10px;padding:5px 0;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.08);font-weight:800;font-size:13px;color:color-mix(in srgb,var(--tc) 70%,#000)}
html.look-v2 .lk-cam .cam-more{color:var(--text3)}
html.look-v2 .lk-cam .cam-more .cam-h{background:transparent;box-shadow:none}
html.look-v2 .lk-cam .cam-toggle{display:flex;grid-column:1 / -1;justify-content:center;padding:11px;border-top:1px solid var(--lk-line);font-weight:800;font-size:13px;color:#26338f;cursor:pointer}
html.look-v2 .lk-cam .cam-t-f{display:none}
html.look-v2 .lk-cam.ouvert .cam-t-o{display:none}
html.look-v2 .lk-cam.ouvert .cam-t-f{display:inline}
html.look-v2 .cam-tb{width:100%;flex:0 0 100%;box-sizing:border-box}
html.look-v2 .cam-tb button{white-space:nowrap}
html.look-v2 .lk-cam .truck-head > div:first-child{flex-wrap:nowrap !important}
html.look-v2 .lk-cam .truck-name{min-width:0;flex:1 1 auto}
html.look-v2 #collecte-content > button[onclick*="Externe"],html.look-v2 #collecte-content > button[onclick*="externe"]{width:100%;border-radius:16px !important;border-width:1px !important;margin-bottom:12px}
/* feuille de route d'un camion (collecte et France) : cartes sobres — suivi financier, kilométrage, boutons */
html.look-v2 :is(#s-camion,#s-fr-camion) .content > div:first-child{background:var(--lk-glass) !important;border:1px solid var(--lk-edge) !important;border-radius:22px !important;padding:12px 16px 12px !important;box-shadow:0 4px 14px rgba(30,60,45,.1)}
html.look-v2 :is(#s-camion,#s-fr-camion) .content > div:first-child > div:first-child{margin-bottom:8px !important}
html.look-v2 :is(#c-pct,#frc-pct){display:none !important}
html.look-v2 :is(#s-camion,#s-fr-camion) .finance-bar-bg{height:8px !important;border:0 !important;background:rgba(0,0,0,.08);border-radius:99px !important;margin:6px 0 0 !important}
html.look-v2 :is(#s-camion,#s-fr-camion) .finance-bar-bg > div{border-radius:99px !important}
html.look-v2 :is(#c-bar,#frc-bar){background:linear-gradient(90deg,#2fb27c,#1a8a5c) !important}
html.look-v2 :is(#s-camion,#s-fr-camion) div:has(> .finance-pct){background:transparent !important;border:0 !important;padding:0 !important;display:flex;flex-wrap:wrap}
html.look-v2 :is(#s-camion,#s-fr-camion) div:has(> .finance-pct) > *{width:100%;box-sizing:border-box}
html.look-v2 :is(#s-camion,#s-fr-camion) div:has(> .finance-pct) > div:first-child{order:0;font-size:0 !important;margin:2px 0 0 !important}
html.look-v2 :is(#s-camion,#s-fr-camion) div:has(> .finance-pct) > div:first-child::after{content:"SUIVI FINANCIER";font-size:10.5px;font-weight:800;letter-spacing:.09em;color:var(--text3)}
html.look-v2 :is(#s-camion,#s-fr-camion) div:has(> .finance-pct) > .finance-row{order:6;margin:0 !important;padding:7px 0;border-bottom:1px solid rgba(0,0,0,.07)}
html.look-v2 :is(#s-camion,#s-fr-camion) .finance-row .finance-label{font-size:0 !important}
html.look-v2 :is(#s-camion,#s-fr-camion) .finance-row .finance-label::after{font-size:14px;font-weight:600;color:var(--text2)}
html.look-v2 :is(#s-camion,#s-fr-camion) .finance-row .finance-val{font-size:15.5px}
html.look-v2 :is(#s-camion,#s-fr-camion) div:has(> .finance-pct) > .finance-row:not([id]){order:1}
html.look-v2 :is(#s-camion,#s-fr-camion) div:has(> .finance-pct) > .finance-row:not([id]) .finance-label::after{content:"Facturé";font-weight:800;color:var(--text);font-size:15px}
html.look-v2 :is(#s-camion,#s-fr-camion) div:has(> .finance-pct) > .finance-row:not([id]) .finance-val{font-size:19px;color:#26338f !important}
html.look-v2 :is(#s-camion,#s-fr-camion) [id$="finance-encaisse"]{order:2 !important}
html.look-v2 :is(#s-camion,#s-fr-camion) [id$="finance-adu"]{order:3 !important;border-bottom:0 !important}
html.look-v2 :is(#s-camion,#s-fr-camion) :is([id$="finance-encaisse"],[id$="finance-adu"]) .finance-label::before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:8px;vertical-align:1px}
html.look-v2 :is(#s-camion,#s-fr-camion) [id$="finance-encaisse"] .finance-label::before{background:#1a8a5c}
html.look-v2 :is(#s-camion,#s-fr-camion) [id$="finance-adu"] .finance-label::before{background:#e08a1e}
html.look-v2 :is(#s-camion,#s-fr-camion) [id$="finance-encaisse"] .finance-label::after{content:"Encaissé"}
html.look-v2 :is(#s-camion,#s-fr-camion) [id$="finance-adu"] .finance-label::after{content:"Encore dû"}
html.look-v2 :is(#s-camion,#s-fr-camion) [id$="finance-encaisse"] .finance-val{color:#0a6b3d !important}
html.look-v2 :is(#s-camion,#s-fr-camion) [id$="finance-adu"] .finance-val{color:#b45a00 !important}
html.look-v2 :is(#s-camion,#s-fr-camion) .finance-bar-bg{order:4}
html.look-v2 :is(#s-camion,#s-fr-camion) .finance-pct{order:5;text-align:left !important;font-size:11.5px !important;font-weight:700 !important;color:var(--text3) !important;margin:4px 0 8px !important}
html.look-v2 :is(#s-camion,#s-fr-camion) div:has(> .finance-pct):has([id$="finance-especes"])::after{content:"ENCAISSÉ PAR MODE";order:7;width:100%;font-size:10.5px;font-weight:800;letter-spacing:.09em;color:var(--text3);padding:8px 0 4px;border-top:1px solid rgba(0,0,0,.08)}
html.look-v2 :is(#s-camion,#s-fr-camion) :is([id$="finance-especes"],[id$="finance-virement"]){order:8 !important;width:50% !important;flex-direction:column;align-items:flex-start !important;border:0 !important;padding:2px 0 !important}
html.look-v2 :is(#s-camion,#s-fr-camion) [id$="finance-virement"]{border-left:1px solid rgba(0,0,0,.08) !important;padding-left:14px !important}
html.look-v2 :is(#s-camion,#s-fr-camion) [id$="finance-especes"] .finance-label::after{content:"💵 Espèces";font-size:11.5px;font-weight:700;color:#00796b}
html.look-v2 :is(#s-camion,#s-fr-camion) [id$="finance-virement"] .finance-label::after{content:"🏦 Virement";font-size:11.5px;font-weight:700;color:#6b3fa0}
html.look-v2 :is(#s-camion,#s-fr-camion) :is([id$="finance-especes"],[id$="finance-virement"]) .finance-val{font-size:16px}
html.look-v2 :is(#s-camion,#s-fr-camion) [id$="finance-especes"] .finance-val{color:#00796b !important}html.look-v2 :is(#s-camion,#s-fr-camion) [id$="finance-virement"] .finance-val{color:#6b3fa0 !important}
html.look-v2 :is(#s-camion,#s-fr-camion) .content > div:has(> button[id$="km-btn"]){background:var(--lk-glass) !important;border:1px solid var(--lk-edge) !important;border-radius:22px !important;padding:10px 16px !important;display:grid;grid-template-columns:1fr auto;align-items:center;gap:4px 10px;box-shadow:0 4px 14px rgba(30,60,45,.1)}
html.look-v2 :is(#s-camion,#s-fr-camion) .content > div:has(> button[id$="km-btn"]) > div:first-child{grid-column:1 / 3;margin:0 !important}
html.look-v2 :is(#s-camion,#s-fr-camion) [id$="km-btn"]{grid-row:2;grid-column:2;width:auto !important;height:34px !important;min-height:0 !important;line-height:1;white-space:nowrap;align-self:center;padding:0 14px !important;font-size:12.5px !important;border-radius:12px !important;background:transparent !important;color:#1a8a5c !important;border:1.5px solid #1a8a5c !important}
html.look-v2 :is(#s-camion,#s-fr-camion) [id$="km-note"]{grid-row:2;grid-column:1;margin:0 !important}
html.look-v2 :is(#dep-btn-etq-camion,#dep-btn-depenses,#dep-btn-carte-camion){display:flex !important;align-items:center;gap:10px;height:42px;padding:0 16px !important;margin-bottom:7px !important;border-radius:14px !important;text-align:left;font-size:14px !important;background:var(--lk-glass) !important;color:var(--text) !important;border:1.5px solid var(--lk-edge) !important}
html.look-v2 #dep-btn-etq-camion{background:#1d2b26 !important;color:#fff !important;border:0 !important}
html.look-v2 :is(#dep-btn-etq-camion,#dep-btn-depenses,#dep-btn-carte-camion)::after{content:"›";margin-left:auto;font-size:20px;opacity:.5}
/* code couleur : Facturé = indigo, Espèces = turquoise, Virement = violet (Encaissé = vert, Reste = orange) */
html.look-v2 .c-fa{color:#26338f !important}html.look-v2 .c-es{color:#00796b !important}html.look-v2 .c-vi{color:#6b3fa0 !important}html.look-v2 .c-du{color:#b45a00 !important}
/* Dispatch : suivi financier global, tous les camions */
html.look-v2 #collecte-content .finance-global{background:var(--lk-glass) !important;border:1px solid var(--lk-edge) !important;border-radius:22px !important;padding:4px 16px 12px !important;box-shadow:0 4px 14px rgba(30,60,45,.1)}
html.look-v2 .finance-global > .finance-title,html.look-v2 .finance-global > .finance-row,html.look-v2 .finance-global > .finance-bar-bg,html.look-v2 .finance-global > .finance-pct{display:none !important}
html.look-v2 .fg2{display:block}
html.look-v2 .fg2-h,html.look-v2 .fg2-mh{font-size:10.5px;font-weight:800;letter-spacing:.09em;color:var(--text3);padding:12px 0 4px}
html.look-v2 .fg2-mh{border-top:1px solid rgba(0,0,0,.08);margin-top:10px;padding-top:10px}
html.look-v2 .fg2-r{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid rgba(0,0,0,.07);font-size:14px}
html.look-v2 .fg2-r span{color:var(--text2);font-weight:600;display:flex;align-items:center}html.look-v2 .fg2-r b{font-size:15.5px}
html.look-v2 .fg2-big span{color:var(--text);font-weight:800;font-size:15px}html.look-v2 .fg2-big b{font-size:19px}
html.look-v2 .fg2-last{border-bottom:0}
html.look-v2 .fg2-d{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:8px}html.look-v2 .d-g{background:#1a8a5c}html.look-v2 .d-o{background:#e08a1e}
html.look-v2 .fg2-r b.c-en{color:#0a6b3d}
html.look-v2 .fg2-bar{height:8px;border-radius:99px;background:#f2d9b8;overflow:hidden;margin-top:3px}html.look-v2 .fg2-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#2fb27c,#1a8a5c)}
html.look-v2 .fg2-cap{display:flex;justify-content:space-between;font-size:11.5px;font-weight:700;color:var(--text3);padding-top:4px}
html.look-v2 .fg2-md{display:flex}html.look-v2 .fg2-md > div{flex:1;min-width:0}html.look-v2 .fg2-md > div + div{border-left:1px solid rgba(0,0,0,.08);padding-left:14px}
html.look-v2 .fg2-md small{display:block;font-size:11.5px;font-weight:700}html.look-v2 .fg2-md b{font-size:16px}
html.look-v2 .fg2-tg{display:flex;width:100%;justify-content:space-between;align-items:center;margin-top:10px;padding:10px 12px;border-radius:12px;border:0;background:rgba(0,0,0,.05);font:800 13.5px var(--font,inherit);color:var(--text);cursor:pointer}
html.look-v2 .fg2-ch{font-size:18px;color:#1a8a5c;line-height:1;transition:transform .2s}html.look-v2 .fg2.open .fg2-ch{transform:rotate(180deg)}
html.look-v2 .fg2-tb{display:none}html.look-v2 .fg2.open .fg2-tb{display:block}
html.look-v2 .fg2-tb table{width:100%;border-collapse:collapse;margin-top:4px;font-variant-numeric:tabular-nums}
html.look-v2 .fg2-tb th{font-size:9px;font-weight:800;text-align:right;padding:4px 0 6px;width:15%}html.look-v2 .fg2-tb th:first-child{text-align:left;width:auto;color:var(--text3)}
html.look-v2 .fg2-tb td{font-size:13.5px;font-weight:700;text-align:right;padding:9px 0;border-top:1px solid rgba(0,0,0,.07)}
html.look-v2 .fg2-tb td:first-child{text-align:left;font-weight:800;font-size:13px;line-height:1.2}
html.look-v2 .fg2-tb td:first-child i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:7px;vertical-align:1px}
html.look-v2 .fg2-tb .fg2-tot td{font-weight:800;font-size:14.5px;border-top:2px solid rgba(0,0,0,.18);background:rgba(0,0,0,.03)}html.look-v2 .fg2-tb .fg2-tot td:first-child{padding-left:6px}
html.look-v2 .fg-aff{border-top:1px solid rgba(0,0,0,.08) !important;margin-top:12px !important;padding-top:10px !important}
html.look-v2 .fg-aff-t{font-size:10.5px !important;letter-spacing:.09em;color:var(--text3)}html.look-v2 .fg-aff-t span:first-child{text-transform:uppercase}
html.look-v2 .fg-aff .progress-bg{height:8px !important;border-radius:99px !important;border:0 !important}html.look-v2 .fg-aff .progress-bar{border-radius:99px !important;background:linear-gradient(90deg,#2fb27c,#1a8a5c) !important}
/* ── accueil ── */
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

/* ── Départs, Container et listes : surfaces en verre (les teintes en ligne restent prioritaires) ── */
html.look-v2 .dep-card,html.look-v2 .dep-cli,html.look-v2 .dep-switch,html.look-v2 .pa-row,html.look-v2 .dep-fc-champ{background:var(--lk-glass);border:1px solid var(--lk-edge);border-radius:22px;box-shadow:var(--shadow);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
html.look-v2 .dep-card{border-left-width:5px}
html.look-v2 .dep-cli{padding:14px 15px}
html.look-v2 .dep-st,html.look-v2 .pa-chip{background:var(--lk-field);border:1px solid var(--lk-edge);border-radius:99px}
html.look-v2 .dep-st.on,html.look-v2 .pa-chip.on{background:var(--lk-g);border-color:var(--green);color:var(--lk-tg)}
html.look-v2 .dep-cli-btn{background:var(--lk-b);border:1px solid transparent;color:var(--lk-tb);border-radius:14px;padding:10px 8px;font-size:12px}
html.look-v2 .dep-cli-btns{gap:8px;align-items:stretch;flex-wrap:wrap}
html.look-v2 .dep-cli-btn.lk-main{flex:1 1 100%;min-height:46px;border-radius:16px;font-size:14px;font-weight:800;padding:6px 12px;white-space:normal;line-height:1.25;text-align:center}
html.look-v2 .dep-alert{background:var(--lk-o);border:1px solid transparent;color:var(--lk-to);border-radius:18px}
html.look-v2 .dep-photo-box{background:var(--lk-field);border-radius:20px}
html.look-v2 .dep-badge{border-radius:99px}
html.look-v2 body .dep-case[style]{background:var(--lk-glass) !important}
html.look-v2 body .dep-case .dep-case-tit[style],html.look-v2 body .dep-case .dep-case-tit [style]{color:var(--text) !important}
html.look-v2 #dep-fm-suivi-container{background:var(--lk-v) !important;border:1px solid transparent !important;border-radius:20px !important}
html.look-v2 #s-departs button[onclick="depNouveau()"]{position:fixed;right:max(20px,calc(50% - 195px));bottom:max(24px,calc(env(safe-area-inset-bottom) + 12px));width:auto;height:56px;margin:0 !important;padding:0 22px;border-radius:99px;z-index:50;display:flex;align-items:center;gap:8px;font-size:15px;font-weight:800;background:var(--green);color:var(--lk-on-g,#fff);border:0;box-shadow:0 12px 28px rgba(14,159,91,.4)}
html.look-v2 #s-departs .content{padding-bottom:110px}
/* ── Maquette : recherche d'accueil, gros titres, en-tête container, filtres en barre, cartes de départ ── */
html.look-v2 #lk-rech{display:flex;align-items:center;gap:10px;margin:0 0 14px;padding:0 16px;height:50px;border-radius:18px;background:var(--lk-glass);border:1px solid var(--lk-edge);box-shadow:var(--shadow);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);color:var(--text3)}
html.look-v2 #lk-rech input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:500 15px var(--font);color:var(--text);-webkit-appearance:none}
html.look-v2 #lk-rech input::placeholder{color:var(--text3)}
html.look-v2 .header .h-title{font-size:22px;font-weight:800;letter-spacing:-.025em}
html.look-v2 .header .h-sub{font-size:13px}
html.look-v2 .dep-card{padding:18px 18px 16px;margin-bottom:14px}
html.look-v2 .dep-nom{font-size:19px;font-weight:800;letter-spacing:-.02em}
html.look-v2 .dep-badge{font-size:11.5px;padding:5px 12px}
html.look-v2 .dep-meta{font-size:13.5px;gap:14px}
html.look-v2 #dep-d-content div[style*="grid-template-columns:1fr 1fr"] div[style*="font-size:20px"]{font-size:34px !important;letter-spacing:-.04em;line-height:1.05}
html.look-v2 #dep-d-content div[style*="grid-template-columns:1fr 1fr"] div[style*="font-size:14px;font-weight:800"]{font-size:24px !important;letter-spacing:-.03em;margin-top:2px !important;line-height:1.2}
html.look-v2 #dep-d-content div[style*="grid-template-columns:1fr 1fr"] div[style*="font-size:10.5px"]{font-size:12px !important;margin-top:3px}
html.look-v2 #dep-d-content div:has(> .dep-chip){display:flex !important;gap:0 !important;padding:4px;border-radius:99px;background:var(--lk-field);border:1px solid var(--lk-edge);margin:4px 0 12px !important}
html.look-v2 .dep-chip{flex:1;display:flex;align-items:center;justify-content:center;text-align:center;border:0 !important;border-radius:99px !important;background:transparent !important;padding:10px 4px !important;font-size:13.5px !important;font-weight:700;color:var(--text3)}
html.look-v2 .dep-chip.on{background:var(--lk-sheet) !important;color:var(--text) !important;box-shadow:0 3px 10px rgba(20,70,45,.16)}
html.look-v2 .dep-vide{color:var(--text3)}
html.look-v2 .bottomnav{display:none !important}
html.look-v2 #lk-dock{position:fixed;left:50%;transform:translateX(-50%);bottom:max(12px,env(safe-area-inset-bottom));width:min(calc(100% - 24px),406px);z-index:60;display:flex;gap:4px;padding:6px;border-radius:26px;background:var(--lk-glass);border:1px solid var(--lk-edge);box-shadow:0 10px 30px rgba(8,30,20,.22);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
html.look-v2 #lk-dock button{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 0 7px;border:0;border-radius:20px;background:transparent;color:var(--text2,#6b7b72);font:700 11px/1 var(--font);cursor:pointer}
html.look-v2 #lk-dock button.on{background:linear-gradient(145deg,#2fb27c,#1a8a5c);color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 6px 14px rgba(20,120,80,.3)}
html.look-v2 #lk-dock button.on .lk-ic{fill-opacity:.32;filter:drop-shadow(0 0 4px rgba(255,255,255,.5))}
html.look-v2 #lk-dock .lk-ic{width:23px;height:23px;fill:currentColor;fill-opacity:.2;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
html.look-v2.lk-dock-on .screen .content{padding-bottom:110px}
html.look-v2 .lk-hero{position:relative}
html.look-v2 .lk-solde{display:inline-block;margin-top:10px;padding:4px 12px;border-radius:99px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);font-size:12.5px;font-weight:800;letter-spacing:.01em}
html.look-v2 .lk-solde.non{background:#D93025;color:#fff;border-color:rgba(255,255,255,.55);box-shadow:0 2px 8px rgba(160,20,10,.35)}
html.look-v2 .lk-solde.ok{background:#12985A;color:#fff;border-color:rgba(255,255,255,.55);box-shadow:0 2px 8px rgba(5,80,40,.35)}
html.look-v2 .lk-j{display:inline-block;margin-right:8px;padding:3px 10px;border-radius:99px;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.4);font-weight:800;font-size:13px;letter-spacing:.02em;white-space:nowrap}
html.look-v2 .lk-fixe{cursor:default;pointer-events:none}
html.look-v2 .lk-car .lk-track{pointer-events:auto}
html.look-v2 .lk-pays{position:absolute;top:12px;right:12px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:3px 8px;font-size:10px;font-weight:800;letter-spacing:.06em}
html.look-v2 .lk-hero small{display:block;opacity:.85;font-weight:700;letter-spacing:.07em;text-transform:uppercase;font-size:11.5px}
html.look-v2 .lk-dep{margin:-10px 0 12px;font-size:13px;font-weight:700;opacity:.85;letter-spacing:.01em}
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
    c = COUL[t]
    out.append("html.look-v2 #dep-case-%s .dep-case-ico{font-size:0 !important;width:46px;height:46px;border-radius:15px;background:linear-gradient(145deg,%s,%s99);border:1px solid rgba(255,255,255,.7);box-shadow:inset 0 1px 0 rgba(255,255,255,.7),0 6px 14px rgba(0,0,0,.18)}" % (k, c, c))
    out.append("html.look-v2 #dep-case-%s .dep-case-ico::before{content:'';width:26px;height:26px;background:%s center/contain no-repeat;filter:drop-shadow(0 0 5px rgba(255,255,255,.5))}" % (k, uri_duo(d)))
for k in range(1, 5):
    out.append("html.look-v2 #s-login .dep-esp-c:nth-child(%d) .dep-esp-c-ic{display:flex !important;align-items:center;justify-content:center}\nhtml.look-v2 #s-login .dep-esp-c:nth-child(%d) .dep-esp-c-ic svg{display:none !important}" % (k, k))
    out.append("html.look-v2 #s-login .dep-esp-c:nth-child(%d) .dep-esp-c-ic::before{content:'';width:32px;height:32px;background:%s center/contain no-repeat;filter:drop-shadow(0 0 6px rgba(255,255,255,.55))}" % (k, uri_duo(LOGIN_ICO[k-1], '.30', '1.9')))
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
out.append(gen_dark_remap.css_sombre())
out.append(TEINTES)
open(sys.argv[1], 'w', encoding='utf-8').write("\n".join(out) + "\n")
print('ok', len("\n".join(out)), 'octets')
