# Mode sombre : les couleurs écrites en dur dans les styles en ligne (fonds pastel, textes foncés)
# sont remplacées par des versions sombres, sans toucher au code de l'appli. Lu par gen_look_css.py.
import re, os
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCES = ['departs.js', 'dct-app.html', 'look.js']
FOND = (0x12, 0x1A, 0x16)   # --white en sombre

def norm(h):
    h = h.lstrip('#').lower()
    if len(h) == 3: h = ''.join(c * 2 for c in h)
    return h

def formes(h):
    c = [h]
    if h[0]==h[1] and h[2]==h[3] and h[4]==h[5]: c.append(h[0]+h[2]+h[4])
    return c

def rgb(h): return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
def lum(c):
    f = lambda v: (v / 255) ** 2.2
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])
def sat(c): return (max(c) - min(c)) / 255
def mix(a, b, t): return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))
def hexa(c): return '#%02X%02X%02X' % c

def fond_sombre(h):
    c = rgb(h); L = lum(c)
    if L < 0.35: return None                      # fond déjà soutenu : on garde
    if L > 0.93 and sat(c) < 0.12: return '#16211B'   # blanc / quasi blanc → carte sombre
    return hexa(mix(FOND, c, 0.22))               # pastel → teinte sombre de la même couleur
def texte_clair(h):
    c = rgb(h); L = lum(c)
    if L > 0.4: return None
    if sat(c) < 0.16: return '#EDF6F1' if L < 0.2 else '#B7C7BE'
    return hexa(mix(c, (255, 255, 255), 0.50))

def couleurs():
    fonds, textes = set(), set()
    for f in SOURCES:
        s = open(os.path.join(RACINE, f), encoding='utf-8').read()
        for m in re.finditer(r'#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b', s): fonds.add(norm(m.group(0))); textes.add(norm(m.group(0)))
    return sorted(fonds), sorted(textes)

def regles_classes():
    """Règles CSS écrites dans les sources (ex. .dep-etapes-resume{background:#fff}) : version sombre."""
    vus, out = set(), []
    for f in SOURCES:
        t = open(os.path.join(RACINE, f), encoding='utf-8').read()
        t = re.sub(r'\n\s*//[^\n]*', '', t)
        t = re.sub(r"'\s*\+\s*'", '', t)
        t = re.sub(r"'\s*\+\s*\n\s*'", '', t)
        for m in re.finditer(r'([.#][A-Za-z0-9_\-\s.:>#,\[\]=~+*]*?)\s*\{([^{}]*)\}', t):
            sel, dec = m.group(1).strip(), m.group(2)
            if len(sel) > 160 or "'" in sel or '"' in sel or '\n' in sel: continue
            bg = re.search(r'(?<![-\w])background:\s*(#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?)\b', dec)
            fg = re.search(r'(?<![-\w])color:\s*(#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?)\b', dec)
            d = []
            if bg:
                c = rgb(norm(bg.group(1))); v = fond_sombre(norm(bg.group(1)))
                if v: d.append('background:%s' % ('var(--lk-glass)' if v == '#16211B' else v))
            if fg:
                v = texte_clair(norm(fg.group(1)))
                if v: d.append('color:%s' % v)
            for bm in re.finditer(r'(?<![-\w])(border(?:-(?:top|right|bottom|left))?):[^;}]*?(#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?)\b', dec):
                if lum(rgb(norm(bm.group(2)))) > 0.6: d.append('%s-color:rgba(237,246,241,.16)' % bm.group(1))
            if not d: continue
            for one in [x.strip() for x in sel.split(',') if x.strip()]:
                if not re.match(r'^[.#][\w\-]', one) or one.startswith('#lk-') or '.lk-' in one: continue
                k = (one, ';'.join(d))
                if k in vus: continue
                vus.add(k); out.append('%s{%s}' % (one, ';'.join(d)))
    return out

def regles():
    fonds, textes = couleurs()
    out = ['[style*="background:white" i],[style*="background: white" i],[style*="background-color:white" i],[style*="background-color: white" i]{background:#16211B !important}']
    for h in fonds:
        v = fond_sombre(h)
        if not v: continue
        sel = ','.join('[style*="background:#%s" i],[style*="background: #%s" i]' % (f, f) for f in formes(h))
        c = rgb(h)
        if lum(c) > 0.85:   # style réécrit par le navigateur (cssText / JS) : background: rgb(r, g, b)
            sel += ',[style*="background: rgb(%d, %d, %d)" i],[style*="background:rgb(%d, %d, %d)" i]' % (c + c)
        out.append('%s{background:%s !important}' % (sel, v))
    for h in fonds:
        if lum(rgb(h)) > 0.6:
            sel = ','.join('[style*="solid #%s" i]' % f for f in formes(h))
            out.append('%s{border-color:rgba(237,246,241,.16) !important}' % sel)
    for h in textes:
        v = texte_clair(h)
        if not v: continue
        sel = ','.join('[style*=";color:#%s" i],[style^="color:#%s" i],[style*=" color:#%s" i],[style*="\\"color:#%s" i]' % (f, f, f, f) for f in formes(h))
        out.append('%s{color:%s !important}' % (sel, v))
    return out

def css_sombre():
    r = regles() + regles_classes()
    def prefixe(p): return '\n'.join(p + ' ' + x.replace(',[', ',' + p + ' [') for x in r)
    a = prefixe('html.look-v2[data-mode="auto"]')
    b = prefixe('html.look-v2[data-mode="dark"]')
    return '/* ── Mode sombre : couleurs écrites en dur (générées) ── */\n@media (prefers-color-scheme: dark){\n' + a + '\n}\n' + b + '\n'
if __name__ == '__main__':
    t = css_sombre(); print(len(t), 'octets', t.count('\n'), 'lignes')
