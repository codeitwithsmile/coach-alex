#!/usr/bin/env python3
"""Construit le dossier firebase/ prêt à déployer (firebase deploy) :
  firebase/public/index.html   l'application (mode Firebase)
  firebase/public/config.js    e-mail du coach + config Firebase, lus depuis firebase/coach-config.json
  firebase/firestore.rules     règles de sécurité, avec l'e-mail du coach injecté
  firebase/.firebaserc         projet par défaut
Usage : python3 tools/build_firebase.py   (lance d'abord build_single.py)"""
import json, pathlib, re, subprocess, sys
root = pathlib.Path(__file__).resolve().parent.parent
subprocess.run([sys.executable, str(root/'tools'/'build_single.py')], check=True)
html = (root/'src'/'coach-alex.html').read_text(encoding='utf-8')
cfg_path = root/'firebase'/'coach-config.json'
cfg = json.loads(cfg_path.read_text(encoding='utf-8')) if cfg_path.exists() else json.loads((root/'firebase'/'coach-config.example.json').read_text(encoding='utf-8'))
if not cfg_path.exists():
    print('ATTENTION : firebase/coach-config.json absent, valeurs d\'exemple utilisées.')
coach_email = cfg['coachEmail'].strip().lower()
project = cfg['firebase'].get('projectId', 'coach-alex')
VER = '12.11.0'
sdk = ''.join('<script src="https://www.gstatic.com/firebasejs/%s/firebase-%s-compat.js"></script>\n' % (VER, m) for m in ('app', 'auth', 'firestore'))
sdk += '<script src="config.js"></script>\n'
marker = '<script>\n'
i = html.index(marker)  # premier script inline = l'application
html = html[:i] + sdk + html[i:]
pub = root/'firebase'/'public'; pub.mkdir(parents=True, exist_ok=True)
(pub/'index.html').write_text(html, encoding='utf-8')
(pub/'config.js').write_text('// Généré par tools/build_firebase.py à partir de firebase/coach-config.json\nwindow.COACH_ALEX_CONFIG = ' + json.dumps({'coachEmail': coach_email, 'firebase': cfg['firebase']}, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
rules = (root/'firebase'/'firestore.rules.template').read_text(encoding='utf-8').replace('__COACH_EMAIL__', coach_email)
(root/'firebase'/'firestore.rules').write_text(rules, encoding='utf-8')
(root/'firebase'/'.firebaserc').write_text(json.dumps({'projects': {'default': project}}, indent=2) + '\n', encoding='utf-8')
print('Dossier firebase/ prêt pour le projet', project, '· coach :', coach_email)
