#!/usr/bin/env python3
"""v10 : mode Firebase (Firestore + Authentication e-mail/mot de passe), en plus des modes Claude et hors ligne."""
import pathlib, sys
p = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'split' / 'app.js'
js = p.read_text(encoding='utf-8')

def rep(old, new, count=1):
    global js
    if js.count(old) != count:
        print('ATTENDU %d, TROUVÉ %d :\n%s' % (count, js.count(old), old[:200])); sys.exit(1)
    js = js.replace(old, new)

# ---------------------------------------------------------------- 1. état Firebase
rep("function hasClaudeApi(){", r"""// Mode Firebase : la page est servie par Firebase Hosting avec un fichier config.js qui définit
// window.COACH_ALEX_CONFIG = { coachEmail, firebase:{...} }. Firestore (compat) expose la même API
// que la base Claude (doc/collection/where/orderBy/get/set/update/delete/add), donc makeSafeDb s'y branche tel quel.
let FIREBASE_MODE = false;
const FB = {auth:null, fs:null, user:null, role:null, clientId:null};
function fbConfig(){ return (typeof window !== 'undefined' && window.COACH_ALEX_CONFIG && window.COACH_ALEX_CONFIG.firebase) ? window.COACH_ALEX_CONFIG : null; }
function fbCoachEmail(){ const c = fbConfig(); return c && c.coachEmail ? String(c.coachEmail).trim().toLowerCase() : ''; }
function isCoachRole(){ return !FIREBASE_MODE || FB.role === 'coach'; }
function fbInit(){
  const cfg = fbConfig();
  if(!cfg || typeof firebase === 'undefined' || !firebase.initializeApp) return null;
  try{
    if(!firebase.apps || !firebase.apps.length) firebase.initializeApp(cfg.firebase);
    FB.fs = firebase.firestore();
    try{ FB.fs.settings({ignoreUndefinedProperties:true}); }catch(e){}
    FB.auth = firebase.auth();
    try{ FB.auth.useDeviceLanguage(); }catch(e){}
    FIREBASE_MODE = true;
    return FB.fs;
  }catch(e){ console.error('Firebase', e); return null; }
}
function fbWaitAuth(){
  return new Promise(resolve => { const off = FB.auth.onAuthStateChanged(u => { FB.user = u || null; off(); resolve(u || null); }); });
}
async function fbResolveRole(){
  FB.role = null; FB.clientId = null;
  const u = FB.auth.currentUser; if(!u) return null;
  const email = (u.email || '').toLowerCase();
  if(email && email === fbCoachEmail()){ FB.role = 'coach'; return 'coach'; }
  const link = await db.doc('users/'+u.uid).get();
  if(link.exists && link.data().clientId){ FB.role = 'client'; FB.clientId = link.data().clientId; return 'client'; }
  FB.role = 'pending'; return 'pending';
}
function fbErrorMessage(e){
  const code = (e && e.code) || '';
  const map = {
    'auth/invalid-email': 'Adresse e-mail invalide.',
    'auth/user-not-found': 'E-mail ou mot de passe incorrect.',
    'auth/wrong-password': 'E-mail ou mot de passe incorrect.',
    'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
    'auth/invalid-login-credentials': 'E-mail ou mot de passe incorrect.',
    'auth/email-already-in-use': 'Un compte existe déjà avec cet e-mail. Connectez-vous.',
    'auth/weak-password': 'Mot de passe trop court : 8 caractères minimum.',
    'auth/too-many-requests': 'Trop d’essais. Réessayez dans quelques minutes.',
    'auth/network-request-failed': 'Pas de connexion. Vérifiez votre réseau.',
    'auth/user-disabled': 'Ce compte a été désactivé.',
    'permission-denied': 'Accès refusé.'
  };
  return map[code] || 'Une erreur est survenue. Réessayez.';
}

function hasClaudeApi(){""")

# ---------------------------------------------------------------- 2. démarrage
rep("""  let raw=null;
  if(hasClaudeApi()){ try{ raw = await claude.use("db"); }catch(e){ raw=null; } }
  if(!raw){ raw = makeLocalDb(); LOCAL_MODE = !!raw; }
  db = raw ? makeSafeDb(raw) : null;
  if(!db){
    document.getElementById('app').innerHTML = '<div style="padding:40px;text-align:center;">Le stockage n\\'est pas disponible dans ce navigateur.</div>';
    return;
  }
  S.site = await loadSiteSettings();
  const sess = readSession();
""", """  let raw=null;
  raw = fbInit();
  if(!raw && hasClaudeApi()){ try{ raw = await claude.use("db"); }catch(e){ raw=null; } }
  if(!raw){ raw = makeLocalDb(); LOCAL_MODE = !!raw; }
  db = raw ? makeSafeDb(raw) : null;
  if(!db){
    document.getElementById('app').innerHTML = '<div style="padding:40px;text-align:center;">Le stockage n\\'est pas disponible dans ce navigateur.</div>';
    return;
  }
  if(FIREBASE_MODE){
    try{ S.site = await loadSiteSettings(); }catch(e){ console.error(e); S.site = Object.assign({}, SITE_DEFAULTS); }
    await fbWaitAuth();
    let role = null;
    try{ role = await fbResolveRole(); }catch(e){ console.error(e); }
    if(role==='coach'){ await showCoach(); return; }
    if(role==='client'){ const ok = await fbOpenClient(); if(ok) return; }
    if(role==='pending'){ renderAuth('client'); return; }
    renderLanding(); return;
  }
  const sess = readSession();
""")

rep("function logout(){ clearSession(); S.currentId=null; S.currentClientObj=null; S.homeTab='journee'; showLanding(); }",
    """async function logout(){
  clearSession(); S.currentId=null; S.currentClientObj=null; S.homeTab='journee';
  if(FIREBASE_MODE){ try{ await FB.auth.signOut(); }catch(e){} FB.user=null; FB.role=null; FB.clientId=null; }
  showLanding();
}
// Ouvre l'espace du client relié au compte connecté (mode Firebase).
async function fbOpenClient(){
  const id = FB.clientId; if(!id) return false;
  const bilan = await db.doc('bilans/'+id).get();
  if(!bilan.exists || bilan.data().valide===false){
    renderAuth('client'); showAuthError('Votre bilan n\\u2019a pas encore été validé par votre coach. Réessayez après son appel.'); return true;
  }
  return await openClientProfileView(id, true);
}""")

# ---------------------------------------------------------------- 3. codes d'invitation : miroir codes/{code}
rep("""async function ensureClientCode(clientId){
  const doc = await db.doc('clients/'+clientId).get();
  const c = doc.data()||{};
  if(c.accessCode) return c.accessCode;
  const all = (await db.collection('clients').get()).docs.map(d=>d.data().accessCode).filter(Boolean);
  let code = randomCode(); while(all.includes(code)) code = randomCode();
  await db.doc('clients/'+clientId).update({accessCode:code});
  return code;
}
async function regenerateClientCode(clientId){
  await db.doc('clients/'+clientId).update({accessCode:null});
  const code = await ensureClientCode(clientId);
""", """async function ensureClientCode(clientId){
  const doc = await db.doc('clients/'+clientId).get();
  const c = doc.data()||{};
  if(c.accessCode){ if(FIREBASE_MODE) await ensureCodeDoc(c.accessCode, clientId); return c.accessCode; }
  const all = (await db.collection('clients').get()).docs.map(d=>d.data().accessCode).filter(Boolean);
  let code = randomCode(); while(all.includes(code)) code = randomCode();
  await db.doc('clients/'+clientId).update({accessCode:code});
  if(FIREBASE_MODE) await ensureCodeDoc(code, clientId);
  return code;
}
// En mode Firebase, un document codes/{code} = {clientId} permet au client de relier son compte en toute sécurité.
async function ensureCodeDoc(code, clientId){
  const d = await db.doc('codes/'+code).get();
  if(!d.exists || d.data().clientId!==clientId) await db.doc('codes/'+code).set({clientId, createdAt:todayStr()});
}
async function regenerateClientCode(clientId){
  const old = (S.clients.find(x=>x.id===clientId)||{}).accessCode;
  await db.doc('clients/'+clientId).update({accessCode:null});
  if(FIREBASE_MODE && old){ try{ await db.doc('codes/'+old).delete(); }catch(e){} }
  const code = await ensureClientCode(clientId);
""")

# ---------------------------------------------------------------- 4. mire : e-mail + mot de passe en mode Firebase
rep("""async function renderAuthBody(){
  const el = document.getElementById('auth-body');
  if(AUTH.role==='coach'){""", """async function renderAuthBody(){
  const el = document.getElementById('auth-body');
  if(FIREBASE_MODE){ renderFbAuthBody(el); return; }
  if(AUTH.role==='coach'){""")

rep("""function renderCoachSetup(el){""", r"""// ---- Mire Firebase ----
function fbField(id, label, type, extra){
  return `<label for="${id}">${label}</label><div class="field"><input id="${id}" type="${type}" ${extra||''}></div>`;
}
function renderFbAuthBody(el){
  const isCoach = AUTH.role==='coach';
  const mode = AUTH.fbMode || 'login'; // login | signup | code
  if(isCoach || mode==='login'){
    el.innerHTML = `
      <h1 class="auth-title">${isCoach?'Espace coach':'Espace client'}</h1>
      <p class="auth-sub">${isCoach?'Connectez-vous avec votre e-mail et votre mot de passe.':'Connectez-vous avec l’e-mail et le mot de passe de votre compte.'}</p>
      <form onsubmit="event.preventDefault();submitAuth()" novalidate>
        ${fbField('auth-email','E-mail','email','autocomplete="email" inputmode="email" autofocus')}
        ${fbField('auth-pass','Mot de passe','password','autocomplete="current-password"')}
        <div id="auth-error" class="auth-error" role="alert" aria-live="polite"></div>
        <label class="checkline" style="margin-top:14px"><input type="checkbox" id="auth-remember" ${AUTH.remember?'checked':''}> Rester connecté sur cet appareil</label>
        <button type="submit" class="btn btn-primary btn-block" id="auth-submit" style="margin-top:16px">Se connecter</button>
      </form>
      <p class="auth-help"><button class="link" onclick="fbForgotPassword()">Mot de passe oublié ?</button></p>
      ${isCoach ? '' : `<p class="auth-help">Première connexion ? <button class="link" onclick="AUTH.fbMode='signup';renderAuthBody()">Créer mon compte</button><br>Pas encore client ? <button class="link" onclick="startClientQuestionnaire()">Faire mon bilan</button></p>`}`;
    return;
  }
  if(mode==='signup'){
    el.innerHTML = `
      <h1 class="auth-title">Créer mon compte</h1>
      <p class="auth-sub">Votre coach vous a remis un code à 6 chiffres. Choisissez un e-mail et un mot de passe, puis saisissez ce code.</p>
      <form onsubmit="event.preventDefault();fbSignup()" novalidate>
        ${fbField('auth-email','E-mail','email','autocomplete="email" inputmode="email" autofocus')}
        ${fbField('auth-pass','Mot de passe (8 caractères minimum)','password','autocomplete="new-password"')}
        <label for="auth-code">Code remis par votre coach</label>
        ${codeInputHtml('auth-code').replace('autofocus','')}
        <div id="auth-error" class="auth-error" role="alert" aria-live="polite"></div>
        <button type="submit" class="btn btn-primary btn-block" id="auth-submit" style="margin-top:16px">Créer mon compte</button>
      </form>
      <p class="auth-help">Déjà un compte ? <button class="link" onclick="AUTH.fbMode='login';renderAuthBody()">Se connecter</button></p>`;
    setupCodeInput('auth-code', null);
    return;
  }
  // mode 'code' : compte connecté mais pas encore relié à une fiche client
  el.innerHTML = `
    <h1 class="auth-title">Votre code</h1>
    <p class="auth-sub">Connecté en tant que ${esc((FB.user&&FB.user.email)||'')}. Saisissez le code à 6 chiffres remis par votre coach pour ouvrir votre espace.</p>
    <form onsubmit="event.preventDefault();fbLinkCode()" novalidate>
      <label for="auth-code">Code remis par votre coach</label>
      ${codeInputHtml('auth-code')}
      <div id="auth-error" class="auth-error" role="alert" aria-live="polite"></div>
      <button type="submit" class="btn btn-primary btn-block" id="auth-submit" style="margin-top:16px">Ouvrir mon espace</button>
    </form>
    <p class="auth-help"><button class="link" onclick="logout()">Utiliser un autre compte</button></p>`;
  setupCodeInput('auth-code', fbLinkCode);
}
function fbCreds(){
  const email = ((document.getElementById('auth-email')||{}).value||'').trim();
  const pass = (document.getElementById('auth-pass')||{}).value||'';
  return {email, pass};
}
async function fbSetPersistence(remember){
  try{ await FB.auth.setPersistence(remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION); }catch(e){}
}
async function fbAfterLogin(){
  const role = await fbResolveRole();
  if(AUTH.role==='coach'){
    if(role!=='coach'){ await FB.auth.signOut(); showAuthError('Ce compte n’est pas le compte coach.'); return; }
    await showCoach(); return;
  }
  if(role==='coach'){ await showCoach(); return; }
  if(role==='client'){ await fbOpenClient(); return; }
  AUTH.fbMode = 'code'; renderAuthBody();
}
async function fbLogin(){
  const {email, pass} = fbCreds();
  if(!email || !pass){ showAuthError('Saisissez votre e-mail et votre mot de passe.'); return; }
  const btn = document.getElementById('auth-submit'); if(btn) btn.disabled = true;
  const remember = !!(document.getElementById('auth-remember')||{}).checked; AUTH.remember = remember;
  try{
    await fbSetPersistence(remember);
    await FB.auth.signInWithEmailAndPassword(email, pass);
    FB.user = FB.auth.currentUser;
    await fbAfterLogin();
  }catch(e){ console.error(e); showAuthError(fbErrorMessage(e)); }
  finally{ if(btn) btn.disabled = false; }
}
async function fbSignup(){
  const {email, pass} = fbCreds(); const code = codeValue('auth-code');
  if(!email){ showAuthError('Saisissez votre e-mail.'); return; }
  if(pass.length<8){ showAuthError('Mot de passe trop court : 8 caractères minimum.'); return; }
  if(code.length!==6){ showAuthError('Le code comporte 6 chiffres.'); return; }
  const btn = document.getElementById('auth-submit'); if(btn) btn.disabled = true;
  try{
    const codeDoc = await db.doc('codes/'+code).get().catch(()=>null);
    await fbSetPersistence(true);
    await FB.auth.createUserWithEmailAndPassword(email, pass);
    FB.user = FB.auth.currentUser;
    const ok = await fbLinkWithCode(code);
    if(!ok) return;
    await fbAfterLogin();
  }catch(e){ console.error(e); showAuthError(fbErrorMessage(e)); }
  finally{ if(btn) btn.disabled = false; }
}
async function fbLinkCode(){
  const code = codeValue('auth-code');
  if(code.length!==6){ showAuthError('Le code comporte 6 chiffres.'); return; }
  const btn = document.getElementById('auth-submit'); if(btn) btn.disabled = true;
  try{ const ok = await fbLinkWithCode(code); if(ok) await fbAfterLogin(); }
  catch(e){ console.error(e); showAuthError(fbErrorMessage(e)); }
  finally{ if(btn) btn.disabled = false; }
}
async function fbLinkWithCode(code){
  const u = FB.auth.currentUser; if(!u){ showAuthError('Connectez-vous d’abord.'); return false; }
  let codeDoc = null;
  try{ codeDoc = await db.doc('codes/'+code).get(); }catch(e){ codeDoc = null; }
  if(!codeDoc || !codeDoc.exists){ showAuthError('Code inconnu. Vérifiez-le avec votre coach.'); return false; }
  const clientId = codeDoc.data().clientId;
  try{
    await db.doc('users/'+u.uid).set({clientId, code, email:(u.email||'').toLowerCase(), createdAt:todayStr()});
  }catch(e){ console.error(e); showAuthError('Impossible de relier ce code. Demandez un nouveau code à votre coach.'); return false; }
  return true;
}
async function fbForgotPassword(){
  const {email} = fbCreds();
  if(!email){ showAuthError('Saisissez votre e-mail, puis cliquez sur « Mot de passe oublié ».'); return; }
  try{ await FB.auth.sendPasswordResetEmail(email); toast('E-mail envoyé : suivez le lien pour choisir un nouveau mot de passe'); }
  catch(e){ showAuthError(fbErrorMessage(e)); }
}
function renderCoachSetup(el){""")

rep("""async function submitAuth(){
  const now = Date.now();""", """async function submitAuth(){
  if(FIREBASE_MODE){ await fbLogin(); return; }
  const now = Date.now();""")

# ---------------------------------------------------------------- 5. un client ne lit que ses propres séances (règles de sécurité)
rep("""async function loadAllProgrammes(){
  const snap = await db.collection('programmes').get();""", """async function loadAllProgrammes(){
  if(FIREBASE_MODE && FB.role==='client'){
    const snap = await db.collection('programmes').where('clientId','==',FB.clientId).get();
    return snap.docs.map(d=>({id:d.id,...d.data()}));
  }
  const snap = await db.collection('programmes').get();""")

# ---------------------------------------------------------------- 6. suppression client : code et comptes reliés
rep("""  await Promise.all([...dels, db.doc('bilans/'+id).delete(), db.doc('suivi_config/'+id).delete()]);
  await db.doc('clients/'+id).delete();""", """  await Promise.all([...dels, db.doc('bilans/'+id).delete(), db.doc('suivi_config/'+id).delete()]);
  if(FIREBASE_MODE){
    const c = S.clients.find(x=>x.id===id);
    if(c && c.accessCode){ try{ await db.doc('codes/'+c.accessCode).delete(); }catch(e){} }
    try{ const us = await db.collection('users').where('clientId','==',id).get(); await Promise.all(us.docs.map(d=>db.doc('users/'+d.id).delete())); }catch(e){}
  }
  await db.doc('clients/'+id).delete();""")

# ---------------------------------------------------------------- 7. onglet Sécurité
rep("""    <div class="card">
      <h2>Code coach</h2>
      <p class="note">Demandé pour ouvrir l\\u2019espace coach. Il protège l\\u2019écran de votre téléphone, pas les données elles-mêmes : seul votre compte Claude peut les lire.</p>
      <button class="btn btn-secondary" onclick="openChangeCoachCode()">Changer le code</button>
    </div>""", """    ${FIREBASE_MODE ? `<div class="card">
      <h2>Compte coach</h2>
      <p class="note">Connecté avec ${esc((FB.user&&FB.user.email)||'')}. Les données sont protégées côté serveur : seul ce compte peut tout lire et modifier, chaque client ne voit que son propre espace.</p>
      <button class="btn btn-secondary" onclick="fbCoachResetPassword()">Changer mon mot de passe</button>
    </div>` : `<div class="card">
      <h2>Code coach</h2>
      <p class="note">Demandé pour ouvrir l\\u2019espace coach. Il protège l\\u2019écran de votre téléphone, pas les données elles-mêmes.</p>
      <button class="btn btn-secondary" onclick="openChangeCoachCode()">Changer le code</button>
    </div>`}""")

rep("""      <p class="note">Chaque client reçoit un code à 6 chiffres à la validation de son bilan. Vous le retrouvez dans sa fiche (bouton Actions) pour le lui transmettre ou le changer.</p>""",
    """      <p class="note">${FIREBASE_MODE ? 'Chaque client reçoit un code à 6 chiffres à la validation de son bilan. Avec ce code, il crée son compte (e-mail et mot de passe) depuis la page d\\u2019accueil et accède à son espace de chez lui. Vous le retrouvez dans sa fiche (bouton Actions).' : 'Chaque client reçoit un code à 6 chiffres à la validation de son bilan. Vous le retrouvez dans sa fiche (bouton Actions) pour le lui transmettre ou le changer.'}</p>""")

rep("""function openChangeCoachCode(){""", """async function fbCoachResetPassword(){
  const email = (FB.user&&FB.user.email)||'';
  if(!email) return;
  try{ await FB.auth.sendPasswordResetEmail(email); toast('E-mail envoyé à '+email); }catch(e){ toast(fbErrorMessage(e)); }
}
function openChangeCoachCode(){""")

# ---------------------------------------------------------------- 8. texte du modal de validation
rep("""    <p class="note">Transmettez-le lui (SMS, en main propre). Vous le retrouverez dans sa fiche, bouton Actions.</p>""",
    """    <p class="note">${FIREBASE_MODE ? 'Transmettez-le lui : avec ce code, il crée son compte depuis « Se connecter » sur le site. Vous le retrouverez dans sa fiche, bouton Actions.' : 'Transmettez-le lui (SMS, en main propre). Vous le retrouverez dans sa fiche, bouton Actions.'}</p>""")

# ---------------------------------------------------------------- 9. verrou anti double-clic
rep("'importBackup','loadDemoData'];", "'importBackup','loadDemoData','fbLogin','fbSignup','fbLinkCode','fbForgotPassword','fbCoachResetPassword'];")

p.write_text(js, encoding='utf-8')
print('patch v10 appliqué')
