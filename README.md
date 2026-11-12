# Coach Alex · Gestion Client

Application de gestion pour un coach sportif à domicile (planning, clients, bilans, entraînements, alimentation, suivi mensuel, paiements) avec site de présentation et espace client.

- `src/split/` : code source (index.html, style.css, app.js, assets).
- `tools/build_single.py [--local]` : assemble le fichier unique `src/coach-alex.html` (et `coach-alex-local.html`, version hors ligne avec données de démo).
- `tools/build_firebase.py` : prépare le dossier `firebase/` à déployer (voir `firebase/MISE-EN-LIGNE.md`).
- `test/run_tests.js`, `test/run_firebase_tests.js` : tests automatiques (`cd test && npm i jsdom`, puis `node test/run_tests.js`).
- `docs/index.html` : version de test publiée sur GitHub Pages (données gardées dans le navigateur de chaque appareil).
- `exemples/coach-alex-exemples.json` : jeu de données de démonstration, à restaurer via Plus → Compta.

Trois modes détectés au démarrage : Firebase (production), artefact Claude, ou hors ligne (localStorage).
