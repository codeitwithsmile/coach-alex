// Tests du mode Firebase avec un faux SDK compat (pas de réseau) : parcours coach, client, codes d'invitation.
// Usage : node test/run_firebase_tests.js   (après python3 tools/build_firebase.py)
const fs = require('fs'), path = require('path');
const { JSDOM } = require(path.join(__dirname, 'node_modules', 'jsdom'));
let html = fs.readFileSync(path.join(__dirname, '..', 'firebase', 'public', 'index.html'), 'utf8');
// On retire les scripts externes (SDK + config.js) : ils sont remplacés par le faux SDK ci-dessous.
html = html.replace(/<script src="[^"]+"><\/script>\n/g, '');

function makeFakeFirestore() {
  const store = {}; let seq = 0;
  const clone = o => JSON.parse(JSON.stringify(o));
  const col = n => (store[n] = store[n] || {});
  const snap = (n, pred, order) => { const docs = Object.entries(col(n)).filter(([, v]) => pred(v)).map(([id, v]) => ({ id, data: () => clone(v) })); if (order) docs.sort((a, b) => String(a.data()[order]).localeCompare(String(b.data()[order]))); return { docs }; };
  const docRef = (n, id) => ({
    get: async () => ({ exists: id in col(n), id, data: () => (id in col(n) ? clone(col(n)[id]) : undefined) }),
    set: async o => { col(n)[id] = clone(o); },
    update: async o => { if (!(id in col(n))) throw new Error('update: doc absent ' + n + '/' + id); Object.assign(col(n)[id], clone(o)); },
    delete: async () => { delete col(n)[id]; },
  });
  const query = (n, pred, order) => ({ get: async () => snap(n, pred, order), where: (f, op, v) => query(n, d => pred(d) && d[f] === v, order), orderBy: f => query(n, pred, f) });
  return { store, settings() {}, doc: p => { const i = p.indexOf('/'); return docRef(p.slice(0, i), p.slice(i + 1)); }, collection: n => ({ ...query(n, () => true, null), add: async o => { const id = 'id' + (++seq); col(n)[id] = clone(o); return { id }; }, doc: id => docRef(n, id) }) };
}
function makeFakeAuth() {
  const users = {}; let current = null; const listeners = [];
  const err = code => Object.assign(new Error(code), { code });
  const fire = () => listeners.forEach(l => l(current));
  return {
    users, get currentUser() { return current; },
    useDeviceLanguage() {}, async setPersistence() {},
    onAuthStateChanged(l) { listeners.push(l); setTimeout(() => l(current), 0); return () => { const i = listeners.indexOf(l); if (i >= 0) listeners.splice(i, 1); }; },
    async signInWithEmailAndPassword(email, pass) { const u = users[email.toLowerCase()]; if (!u || u.pass !== pass) throw err('auth/invalid-credential'); current = { uid: u.uid, email }; fire(); return { user: current }; },
    async createUserWithEmailAndPassword(email, pass) { if (users[email.toLowerCase()]) throw err('auth/email-already-in-use'); if (pass.length < 6) throw err('auth/weak-password'); const uid = 'uid_' + Object.keys(users).length; users[email.toLowerCase()] = { uid, pass }; current = { uid, email }; fire(); return { user: current }; },
    async signOut() { current = null; fire(); },
    async sendPasswordResetEmail() {},
    async signInWithPopup() { const email = 'google.user@gmail.com'; users[email] = users[email] || { uid: 'uid_g', pass: null }; current = { uid: users[email].uid, email }; fire(); return { user: current }; },
  };
}
let failures = 0, passed = 0;
function ok(cond, label) { if (cond) passed++; else { failures++; console.log('  ✗ ÉCHEC :', label); } }
const tick = (ms = 0) => new Promise(r => setTimeout(r, ms));

async function openApp(fs_, auth) {
  const errors = [];
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, beforeParse(w) {
    w.COACH_ALEX_CONFIG = { coachEmail: 'Alex@Exemple.fr', firebase: { projectId: 'x' } };
    w.firebase = { apps: [], initializeApp() { this.apps.push({}); }, firestore: () => fs_, auth: () => auth };
    w.firebase.auth.Auth = { Persistence: { LOCAL: 'local', SESSION: 'session' } };
    w.firebase.auth.GoogleAuthProvider = function () { this.setCustomParameters = () => {}; };
    w.console.error = (...a) => errors.push(a.map(x => (x && x.stack) || String(x)).join(' '));
  } });
  await tick(60);
  return { w: dom.window, d: dom.window.document, errors };
}

(async () => {
  const fsx = makeFakeFirestore(), auth = makeFakeAuth();
  auth.users['alex@exemple.fr'] = { uid: 'uid_coach', pass: 'motdepasse1' };
  const set = (d, id, v) => { const el = d.getElementById(id); if (!el) throw new Error('champ absent : ' + id); el.value = v; };

  // --- visiteur : page publique, pas de session ---
  let { w, d, errors } = await openApp(fsx, auth);
  ok(d.getElementById('app').innerHTML.includes('Les formules'), 'site public affiché sans connexion');
  ok(w.eval('FIREBASE_MODE') === true, 'mode Firebase détecté');

  // --- coach : mauvais mot de passe puis bon ---
  w.renderAuth('coach'); await tick(30);
  ok(!!d.getElementById('auth-email') && !d.getElementById('setup-code'), 'mire coach e-mail + mot de passe (pas de code à créer)');
  set(d, 'auth-email', 'alex@exemple.fr'); set(d, 'auth-pass', 'faux'); await w.submitAuth(); await tick(30);
  ok(d.getElementById('auth-error').textContent.includes('incorrect'), 'mauvais mot de passe refusé');
  set(d, 'auth-pass', 'motdepasse1'); await w.submitAuth(); await tick(80);
  ok(!!d.querySelector('.tabbar'), 'espace coach ouvert');
  ok(w.eval('FB.role') === 'coach', 'rôle coach (e-mail comparé sans tenir compte de la casse)');

  // --- coach : nouveau client, validation du bilan => code + document codes/{code} ---
  await fsx.doc('clients/cl_test').set({ prenom: 'Maite', nom: 'Etcheverry', email: '', telephone: '', objectif: '', dateCreation: '2026-11-12' });
  await fsx.doc('bilans/cl_test').set({ date: '2026-11-12', valide: false, poids: 70, taille: 165, genre: 'femme', dateNaissance: '1990-01-01', niveauActivite: 'modere' });
  await fsx.doc('programmes/p1').set({ clientId: 'cl_test', date: '2026-11-20', heure: '10:00', type: 'avec', formule: 'express', statut: 'prevue', paiement: false, tarif: 60 });
  await fsx.doc('programmes/p2').set({ clientId: 'cl_autre', date: '2026-11-20', heure: '14:00', type: 'avec', formule: 'express', statut: 'prevue', paiement: false, tarif: 60 });
  await w.loadClients(); w.eval("S.currentId='cl_test'"); w.eval("S.bilan="+JSON.stringify(fsx.store.bilans.cl_test));
  await w.validateBilan(); await tick(30);
  const code = fsx.store.clients.cl_test.accessCode;
  ok(/^\d{6}$/.test(code), 'code client généré');
  ok(fsx.store.codes && fsx.store.codes[code] && fsx.store.codes[code].clientId === 'cl_test', 'document codes/{code} créé pour relier le compte');
  ok(d.getElementById('modalroot').innerHTML.includes('crée son compte'), 'modal de validation explique la création de compte');
  await w.logout(); await tick(30);
  ok(auth.currentUser === null && d.getElementById('app').innerHTML.includes('Les formules'), 'déconnexion coach');

  // --- client : création de compte avec un mauvais code puis le bon ---
  w.renderAuth('client'); await tick(20);
  w.eval("AUTH.fbMode='signup'"); await w.renderAuthBody(); await tick(20);
  set(d, 'auth-email', 'maite@exemple.fr'); set(d, 'auth-pass', 'secret123'); set(d, 'auth-code', '000000');
  await w.fbSignup(); await tick(50);
  ok(d.getElementById('auth-error').textContent.includes('Code inconnu'), 'mauvais code : compte créé mais non relié, message clair');
  ok(!!auth.users['maite@exemple.fr'], 'compte client créé');
  // il réessaie avec le bon code (écran « code » car compte déjà connecté)
  w.eval("AUTH.fbMode='code'"); await w.renderAuthBody(); await tick(20);
  set(d, 'auth-code', code); await w.fbLinkCode(); await tick(80);
  ok(fsx.store.users && fsx.store.users.uid_1 && fsx.store.users.uid_1.clientId === 'cl_test', 'users/{uid} relié au client');
  ok(w.eval("S.view==='client' && S.currentClientObj && S.currentClientObj.id==='cl_test'"), 'espace client ouvert après liaison');
  ok(w.eval('FB.role') === 'client' && w.eval('FB.clientId') === 'cl_test', 'rôle client');
  const prog = await w.loadAllProgrammes();
  ok(prog.length === 1 && prog[0].clientId === 'cl_test', 'un client ne charge que ses propres séances');

  // --- session persistante : rechargement => espace client direct ---
  ({ w, d, errors } = await openApp(fsx, auth)); await tick(120);
  ok(w.eval("S.view==='client' && S.currentClientObj && S.currentClientObj.id==='cl_test'"), 'rechargement : client reconnecté automatiquement');

  // --- bilan non validé : accès bloqué ---
  fsx.store.bilans.cl_test.valide = false;
  ({ w, d, errors } = await openApp(fsx, auth)); await tick(120);
  ok(d.getElementById('auth-error') && d.getElementById('auth-error').textContent.includes('validé'), 'bilan non validé : message au lieu de l\'espace');
  fsx.store.bilans.cl_test.valide = true;

  // --- un compte qui n'est pas le coach ne peut pas entrer côté coach ---
  await auth.signOut();
  ({ w, d, errors } = await openApp(fsx, auth)); await tick(60);
  w.renderAuth('coach'); await tick(20);
  set(d, 'auth-email', 'maite@exemple.fr'); set(d, 'auth-pass', 'secret123'); await w.submitAuth(); await tick(50);
  ok(d.getElementById('auth-error').textContent.includes('pas le compte coach') && auth.currentUser === null, 'compte client refusé sur la mire coach et déconnecté');

  // --- Google : nouveau compte, écran code, puis liaison ---
  await auth.signOut();
  ({ w, d, errors } = await openApp(fsx, auth)); await tick(60);
  w.renderAuth('client'); await tick(20);
  ok(d.getElementById('app').innerHTML.includes('Continuer avec Google'), 'bouton Google sur la mire');
  await w.fbGoogle(); await tick(60);
  ok(auth.currentUser && auth.currentUser.email === 'google.user@gmail.com' && d.getElementById('auth-code') && d.getElementById('app').innerHTML.includes('google.user@gmail.com'), 'compte Google sans fiche : écran « votre code »');
  set(d, 'auth-code', code); await w.fbLinkCode(); await tick(80);
  ok(w.eval("S.view==='client' && S.currentClientObj && S.currentClientObj.id==='cl_test'"), 'compte Google relié au client par le code');
  // Google côté coach avec un e-mail qui n'est pas celui du coach : refusé
  await auth.signOut();
  ({ w, d, errors } = await openApp(fsx, auth)); await tick(60);
  w.renderAuth('coach'); await tick(20); await w.fbGoogle(); await tick(60);
  ok(d.getElementById('auth-error').textContent.includes('pas le compte coach') && auth.currentUser === null, 'Google avec un autre e-mail refusé côté coach');

  // --- suppression du client : code et compte reliés nettoyés ---
  await auth.signInWithEmailAndPassword('alex@exemple.fr', 'motdepasse1');
  ({ w, d, errors } = await openApp(fsx, auth)); await tick(120);
  ok(!!d.querySelector('.tabbar'), 'coach reconnecté automatiquement');
  w.eval("S.currentId='cl_test'"); await w.deleteClient(); await tick(50);
  ok(!fsx.store.clients.cl_test && !(fsx.store.codes || {})[code] && !(fsx.store.users || {}).uid_1 && !(fsx.store.users || {}).uid_g, 'suppression : fiche, code et liaisons (mot de passe et Google) supprimées');

  // --- règles : le modèle contient bien l'e-mail injecté ---
  const rules = fs.readFileSync(path.join(__dirname, '..', 'firebase', 'firestore.rules'), 'utf8');
  ok(!rules.includes('__COACH_EMAIL__') && rules.includes('rules_version'), 'firestore.rules généré avec l\'e-mail du coach');
  const realErrors = errors.filter(e => !/auth\/invalid-credential|auth\/email-already|Code inconnu/.test(e));
  ok(realErrors.length === 0, 'aucune erreur JS : ' + realErrors.join(' | ').slice(0, 300));

  console.log(`\n${passed} réussis, ${failures} échec(s)`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
