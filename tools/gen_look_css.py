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
html.look-v2 .dep-cli.lk-bl{background-color:var(--lk-glass) !important;background-image:linear-gradient(135deg,color-mix(in srgb,var(--pc,#888) 26%,transparent),color-mix(in srgb,var(--pc,#888) 6%,transparent) 70%,color-mix(in srgb,var(--pc,#888) 14%,transparent)) !important;border:1px solid color-mix(in srgb,var(--pc,#888) 50%,#fff) !important;border-left-width:1px !important;border-radius:24px !important;box-shadow:var(--shadow);backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4)}
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
html.look-v2 #pl-contenu .pl-st{justify-self:end;text-align:center;padding:4px 12px;border-radius:99px;font-size:12.5px;font-weight:800 !important;background:color-mix(in srgb,currentColor 13%,transparent);white-space:nowrap}
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
html.look-v2 .dep-cli-btn.lk-ico{flex:1 1 0;min-width:44px;height:44px;padding:0;border-radius:16px;font-size:18px;line-height:1;display:flex;align-items:center;justify-content:center}
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
