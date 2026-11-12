#!/usr/bin/env python3
"""Reconstruit le fichier unique autonome (src/coach-alex.html) à partir de src/split/.
Usage : python3 tools/build_single.py   (depuis la racine du projet)
Le logo est ré-encodé en base64 et réinjecté dans app.js."""
import base64, pathlib
root = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'split'
html = (root/'index.html').read_text(encoding='utf-8')
css = (root/'style.css').read_text(encoding='utf-8')
js = (root/'app.js').read_text(encoding='utf-8')
logo = base64.b64encode((root/'assets'/'logo.png').read_bytes()).decode()
js = js.replace('const LOGO_SRC = "assets/logo.png";', 'const LOGO_SRC = "data:image/png;base64,'+logo+'";')
for name in ('hero','about'):
    f = root/'assets'/(name+'.jpg')
    if f.exists():
        b64 = base64.b64encode(f.read_bytes()).decode()
        js = js.replace('const %s_SRC = "assets/%s.jpg";' % (name.upper(), name), 'const %s_SRC = "data:image/jpeg;base64,%s";' % (name.upper(), b64))
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n'+css+'</style>')
html = html.replace('<script src="app.js"></script>', '<script>\n'+js+'</script>')
out = root.parent / 'coach-alex.html'
out.write_text(html, encoding='utf-8')
print('Écrit :', out)

# Version hors ligne : mêmes fichiers + données de démo embarquées (chargées à la demande).
import json, glob, sys
if '--local' in sys.argv:
    ops = []
    for f in sorted(glob.glob(str(root.parent.parent / 'out' / 'demo_ops_*.json'))):
        ops += json.load(open(f, encoding='utf-8'))
    demo = json.dumps(ops, ensure_ascii=False).replace('</', '<\\/')
    local = html.replace('const DEMO_OPS = null;', 'const DEMO_OPS = ' + demo + ';')
    assert local != html, 'DEMO_OPS introuvable'
    outl = root.parent / 'coach-alex-local.html'
    outl.write_text(local, encoding='utf-8')
    print('Écrit :', outl, '(%d documents de démo)' % len(ops))
