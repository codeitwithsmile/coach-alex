#!/usr/bin/env python3
"""v5 : page de présentation publique + connexion par code (coach et clients) + réglages du site."""
import pathlib, re, sys
p = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'split' / 'app.js'
s = p.read_text(encoding='utf-8')

def find_fn(name):
    m = re.search(r'^(async )?function ' + re.escape(name) + r'\(', s, re.M)
    if not m: sys.exit('fonction introuvable : ' + name)
    nxt = re.compile(r'^(async function |function |const |let |// ---)', re.M)
    m2 = nxt.search(s, m.end())
    return m.start(), (m2.start() if m2 else len(s))
def replace_fn(name, new):
    global s
    a, b = find_fn(name); s = s[:a] + new.rstrip('\n') + '\n' + s[b:]
def rep(old, new, count=1):
    global s
    c = s.count(old)
    if c != count: sys.exit(f'ERREUR: {c} occurrence(s) (attendu {count}) pour:\n{old[:150]}')
    s = s.replace(old, new)

# ---------- Démarrage : session mémorisée ----------
rep('''  renderLanding();
}
function showLanding(){ S.view='landing'; renderLanding(); }
async function showCoach(){ S.view='coach'; await loadClients(); render(); }
function showClientSpace(){ S.view='client'; renderClientSpace(); }''',
'''  S.site = await loadSiteSettings();
  const sess = readSession();
  if(sess && sess.role==='coach'){ showCoach(); return; }
  if(sess && sess.role==='client' && sess.clientId){ const ok = await openClientProfileView(sess.clientId, true); if(ok) return; clearSession(); }
  renderLanding();
}
function showLanding(){ S.view='landing'; renderLanding(); }
async function showCoach(){ S.view='coach'; S.homeTab=S.homeTab||'journee'; await loadClients(); render(); }
function showClientSpace(){ S.view='client'; renderClientSpace(); }
function logout(){ clearSession(); S.currentId=null; S.currentClientObj=null; S.homeTab='journee'; showLanding(); }

// ---------- SESSION (mémorisée sur l'appareil) ----------
const SESSION_KEY = 'coachalex.session';
function readSession(){
  try{ const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null; }catch(e){ return null; }
}
function writeSession(obj, remember){
  try{ sessionStorage.setItem(SESSION_KEY, JSON.stringify(obj)); if(remember) localStorage.setItem(SESSION_KEY, JSON.stringify(obj)); else localStorage.removeItem(SESSION_KEY); }catch(e){}
}
function clearSession(){ try{ sessionStorage.removeItem(SESSION_KEY); localStorage.removeItem(SESSION_KEY); }catch(e){} }

// ---------- CODES D'ACCÈS ----------
async function sha256(str){
  try{
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }catch(e){ let h=0; for(const ch of str){ h=((h<<5)-h+ch.charCodeAt(0))|0; } return 'x'+Math.abs(h).toString(16); }
}
function randomCode(){
  let code='';
  try{ const a=new Uint32Array(6); crypto.getRandomValues(a); code = Array.from(a).map(n=>String(n%10)).join(''); }
  catch(e){ code = String(Math.floor(100000+Math.random()*900000)); }
  if(/^(\\d)\\1{5}$/.test(code) || code==='123456') return randomCode();
  return code;
}
function fmtCode(code){ return code ? String(code).replace(/(\\d{3})(\\d{3})/, '$1 $2') : ''; }
async function loadAuth(){ const d = await db.doc('settings/auth').get(); return d.exists ? d.data() : null; }
async function loadSiteSettings(){
  const d = await db.doc('settings/site').get();
  return Object.assign({}, SITE_DEFAULTS, d.exists ? d.data() : {});
}
const SITE_DEFAULTS = {
  accroche: 'Le coaching sportif qui vient chez vous.',
  sousTitre: 'Séances à domicile, programme sur mesure et suivi au quotidien, partout au Pays Basque.',
  zone: 'Pays Basque',
  bio: 'Je suis Alex, coach sportif indépendant. Je me déplace chez vous avec le matériel, je construis votre programme et je vous accompagne sur l\\u2019alimentation. L\\u2019objectif : des résultats qui tiennent, à votre rythme.',
  telephone: '', email: '', instagram: ''
};
async function ensureClientCode(clientId){
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
  const c = S.clients.find(x=>x.id===clientId); if(c) c.accessCode = code;
  toast('Nouveau code généré');
  openClientActions();
}

// ---------- AUTHENTIFICATION ----------
let AUTH = {role:'client', fails:0, lockedUntil:0, remember:true};
function renderAuth(role){
  S.view='auth';
  if(role) AUTH.role = role;
  AUTH.fails = 0;
  document.getElementById('app').innerHTML = `
    <div class="auth">
      <a class="auth-back" onclick="showLanding()">${ICONS.back}Accueil</a>
      <div class="auth-box">
        <img src="${LOGO_SRC}" alt="" class="auth-logo">
        <div class="seg" role="tablist" aria-label="Type de compte">
          <button role="tab" aria-selected="${AUTH.role==='client'}" class="${AUTH.role==='client'?'active':''}" onclick="renderAuth('client')">Client</button>
          <button role="tab" aria-selected="${AUTH.role==='coach'}" class="${AUTH.role==='coach'?'active':''}" onclick="renderAuth('coach')">Coach</button>
        </div>
        <div id="auth-body"></div>
      </div>
    </div>`;
  renderAuthBody();
}
async function renderAuthBody(){
  const el = document.getElementById('auth-body');
  if(AUTH.role==='coach'){
    const auth = await loadAuth();
    if(!auth){ renderCoachSetup(el); return; }
  }
  const isCoach = AUTH.role==='coach';
  el.innerHTML = `
    <h1 class="auth-title">${isCoach?'Espace coach':'Espace client'}</h1>
    <p class="auth-sub">${isCoach?'Saisissez votre code coach à 6 chiffres.':'Saisissez le code à 6 chiffres remis par votre coach.'}</p>
    <form onsubmit="event.preventDefault();submitAuth()" novalidate>
      <label for="auth-code">Code d\\u2019accès</label>
      ${codeInputHtml('auth-code')}
      <div id="auth-error" class="auth-error" role="alert" aria-live="polite"></div>
      <label class="checkline" style="margin-top:14px"><input type="checkbox" id="auth-remember" ${AUTH.remember?'checked':''}> Rester connecté sur cet appareil</label>
      <button type="submit" class="btn btn-primary btn-block" id="auth-submit" style="margin-top:16px">Se connecter</button>
    </form>
    ${isCoach ? '' : `<p class="auth-help">Pas encore de code ? <button class="link" onclick="startClientQuestionnaire()">Devenir client</button> ou demandez-le à votre coach.</p>`}
  `;
  setupCodeInput('auth-code', submitAuth);
}
function codeInputHtml(id){
  return `<div class="codefield"><input id="${id}" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]*" maxlength="7" placeholder="000 000" aria-describedby="auth-error" autofocus></div>`;
}
function setupCodeInput(id, onComplete){
  const inp = document.getElementById(id); if(!inp) return;
  inp.addEventListener('input', ()=>{
    const digits = inp.value.replace(/\\D/g,'').slice(0,6);
    inp.value = fmtCode(digits.length===6 ? digits : digits.padEnd(0)).trim() || digits;
    if(digits.length===6 && onComplete) onComplete();
  });
  setTimeout(()=>{ try{ inp.focus(); }catch(e){} }, 50);
}
function codeValue(id){ return (document.getElementById(id).value||'').replace(/\\D/g,''); }
function showAuthError(msg){ const e=document.getElementById('auth-error'); if(e) e.textContent = msg; }
async function submitAuth(){
  const now = Date.now();
  if(now < AUTH.lockedUntil){ showAuthError('Trop d\\u2019essais. Réessayez dans '+Math.ceil((AUTH.lockedUntil-now)/1000)+' s.'); return; }
  const code = codeValue('auth-code');
  if(code.length!==6){ showAuthError('Le code comporte 6 chiffres.'); return; }
  const btn = document.getElementById('auth-submit'); if(btn) btn.disabled = true;
  const remember = !!(document.getElementById('auth-remember')||{}).checked; AUTH.remember = remember;
  try{
    if(AUTH.role==='coach'){
      const auth = await loadAuth();
      const h = await sha256((auth.salt||'')+code);
      if(auth && h===auth.coachHash){ writeSession({role:'coach', at:now}, remember); AUTH.fails=0; await showCoach(); return; }
    } else {
      const snap = await db.collection('clients').where('accessCode','==',code).get();
      if(snap.docs.length){
        const id = snap.docs[0].id;
        const bilan = await db.doc('bilans/'+id).get();
        if(!bilan.exists || bilan.data().valide===false){ showAuthError('Votre bilan n\\u2019a pas encore été validé par votre coach.'); return; }
        writeSession({role:'client', clientId:id, at:now}, remember); AUTH.fails=0;
        await openClientProfileView(id); return;
      }
    }
    AUTH.fails++;
    if(AUTH.fails>=5){ AUTH.lockedUntil = Date.now()+30000; AUTH.fails=0; showAuthError('Trop d\\u2019essais. Réessayez dans 30 secondes.'); }
    else showAuthError('Code incorrect. '+(5-AUTH.fails)+' essai'+(5-AUTH.fails>1?'s':'')+' restant'+(5-AUTH.fails>1?'s':'')+'.');
    const inp=document.getElementById('auth-code'); if(inp){ inp.value=''; inp.focus(); }
  } finally { if(btn) btn.disabled = false; }
}
function renderCoachSetup(el){
  el.innerHTML = `
    <h1 class="auth-title">Créer votre code coach</h1>
    <p class="auth-sub">Première utilisation : choisissez un code à 6 chiffres. Il vous sera demandé pour ouvrir l\\u2019espace coach.</p>
    <form onsubmit="event.preventDefault();saveCoachSetup()" novalidate>
      <label for="setup-code">Nouveau code</label>${codeInputHtml('setup-code')}
      <label for="setup-code2">Confirmez le code</label>${codeInputHtml('setup-code2').replace('autofocus','')}
      <div id="auth-error" class="auth-error" role="alert" aria-live="polite"></div>
      <button type="submit" class="btn btn-primary btn-block" style="margin-top:16px">Enregistrer et entrer</button>
    </form>`;
  setupCodeInput('setup-code', ()=>document.getElementById('setup-code2').focus());
  setupCodeInput('setup-code2', null);
}
function weakCode(code){ return /^(\\d)\\1{5}$/.test(code) || ['123456','654321','000000','111111'].includes(code); }
async function saveCoachSetup(){
  const a = codeValue('setup-code'), b = codeValue('setup-code2');
  if(a.length!==6){ showAuthError('Le code comporte 6 chiffres.'); return; }
  if(weakCode(a)){ showAuthError('Choisissez un code moins évident.'); return; }
  if(a!==b){ showAuthError('Les deux codes ne correspondent pas.'); return; }
  const salt = randomCode()+randomCode();
  await db.doc('settings/auth').set({salt, coachHash: await sha256(salt+a), createdAt: todayStr()});
  writeSession({role:'coach', at:Date.now()}, true);
  toast('Code coach enregistré');
  await showCoach();
}
function openChangeCoachCode(){
  openModal(`<h3>Changer le code coach</h3>
    <label for="cc-old">Code actuel</label>${codeInputHtml('cc-old')}
    <label for="cc-new">Nouveau code</label>${codeInputHtml('cc-new').replace('autofocus','')}
    <div id="auth-error" class="auth-error" role="alert"></div>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveNewCoachCode()">Enregistrer</button></div>`);
  setupCodeInput('cc-old', ()=>document.getElementById('cc-new').focus()); setupCodeInput('cc-new', null);
}
async function saveNewCoachCode(){
  const auth = await loadAuth(); const old=codeValue('cc-old'), nw=codeValue('cc-new');
  if(!auth || (await sha256((auth.salt||'')+old))!==auth.coachHash){ showAuthError('Code actuel incorrect.'); return; }
  if(nw.length!==6 || weakCode(nw)){ showAuthError('Choisissez un nouveau code à 6 chiffres, moins évident.'); return; }
  const salt = randomCode()+randomCode();
  await db.doc('settings/auth').set({salt, coachHash: await sha256(salt+nw), createdAt: auth.createdAt||todayStr(), updatedAt: todayStr()});
  closeModal(); toast('Code coach modifié');
}
''')

# ---------- Page de présentation ----------
replace_fn('renderLanding', '''function renderLanding(){
  const site = S.site || SITE_DEFAULTS;
  const contact = [site.telephone, site.email, site.instagram?('@'+site.instagram.replace(/^@/,'')):''].filter(Boolean);
  document.getElementById('app').innerHTML = `
  <div class="site">
    <header class="site-nav">
      <a class="site-brand" onclick="showLanding()"><img src="${LOGO_SRC}" alt=""><span>Coach sportif Alex</span></a>
      <nav><a onclick="renderAuth('client')">Se connecter</a><button class="btn btn-primary btn-sm" onclick="startClientQuestionnaire()">Devenir client</button></nav>
    </header>
    <section class="site-hero">
      <div class="site-wrap">
        <span class="site-kicker">Coaching à domicile · ${site.zone}</span>
        <h1>${site.accroche}</h1>
        <p class="site-lead">${site.sousTitre}</p>
        <div class="site-cta"><button class="btn btn-primary" onclick="startClientQuestionnaire()">Faire mon bilan gratuit</button><button class="btn btn-secondary" onclick="document.getElementById('formules').scrollIntoView({behavior:'smooth'})">Voir les formules</button></div>
      </div>
    </section>
    <section class="site-section">
      <div class="site-wrap">
        <h2>Comment ça se passe</h2>
        <div class="site-steps">
          <div class="site-step"><span class="num">1</span><h3>Votre bilan</h3><p>Un questionnaire sur votre objectif, votre santé, votre rythme de vie et votre alimentation. Puis un premier rendez-vous, chez vous ou par téléphone.</p></div>
          <div class="site-step"><span class="num">2</span><h3>Vos séances</h3><p>Je viens chez vous avec le matériel. Chaque séance suit votre programme, construit pour vous et ajusté à chaque passage.</p></div>
          <div class="site-step"><span class="num">3</span><h3>Votre suivi</h3><p>Entre les séances, vous avez votre programme pour vous entraîner seul, vos objectifs alimentaires et mes enseignements, sur votre téléphone.</p></div>
        </div>
      </div>
    </section>
    <section class="site-section alt" id="formules">
      <div class="site-wrap">
        <h2>Les formules</h2>
        <div class="site-pricing">
          <div class="site-price"><span class="name">Séance Express</span><span class="amount">${EXPRESS_PRICE} €</span><span class="desc">45 à 60 minutes chez vous. Idéale pour garder le rythme.</span></div>
          <div class="site-price featured"><span class="name">Séance Classique</span><span class="amount">${CLASSIQUE_PRICE} €</span><span class="desc">1 h 30 à 2 h chez vous. Le temps de travailler en profondeur.</span></div>
          <div class="site-price"><span class="name">Suivi mensuel</span><span class="amount">89 €<small>/mois</small></span><span class="desc">Programme, alimentation, enseignements et suivi au quotidien. Dégressif selon vos séances : 62 € avec 3 séances, 36 € avec 4, offert à partir de 5.</span></div>
        </div>
      </div>
    </section>
    <section class="site-section">
      <div class="site-wrap">
        <h2>Ce que comprend l\\u2019accompagnement</h2>
        <div class="site-features">
          <div><h3>Un programme à vous</h3><p>Des cycles d\\u2019entraînement numérotés, des charges qui progressent automatiquement, validées par moi avant chaque séance.</p></div>
          <div><h3>L\\u2019alimentation sans régime</h3><p>Vos besoins calculés et recalculés à chaque pesée, un journal simple à tenir, des recettes partagées.</p></div>
          <div><h3>Comprendre pour durer</h3><p>Des leçons courtes sur le corps, l\\u2019entraînement, la nutrition et le mental, à lire à votre rythme.</p></div>
          <div><h3>Des challenges entre clients</h3><p>Des défis mensuels et des niveaux à franchir pour garder la motivation sur la durée.</p></div>
        </div>
      </div>
    </section>
    <section class="site-section alt">
      <div class="site-wrap site-about">
        <img src="${LOGO_SRC}" alt="">
        <div><h2>À propos</h2><p>${site.bio}</p></div>
      </div>
    </section>
    <section class="site-section" id="contact">
      <div class="site-wrap">
        <h2>On commence ?</h2>
        <p class="site-lead">Remplissez votre bilan en quelques minutes, je vous rappelle pour fixer un premier rendez-vous.</p>
        <div class="site-cta"><button class="btn btn-primary" onclick="startClientQuestionnaire()">Faire mon bilan gratuit</button></div>
        ${contact.length? `<p class="site-contact">${contact.join(' · ')}</p>` : ''}
      </div>
    </section>
    <footer class="site-foot"><span>Coach sportif Alex · ${site.zone}</span><a onclick="renderAuth('coach')">Espace coach</a></footer>
  </div>`;
}
''')
# Démarrer le questionnaire depuis le site : préparer la coque client
rep('''function startClientQuestionnaire(){
  S.wizardStep = 0; S.wizardData = {}; S.wizardMode = 'client';
  renderWizardStep();
}''', '''function startClientQuestionnaire(){
  S.wizardStep = 0; S.wizardData = {}; S.wizardMode = 'client';
  if(!document.getElementById('main') || S.view!=='client'){ S.view='client'; document.getElementById('app').innerHTML = `<div class="shell"><main class="main client-space" id="main" style="max-width:680px;margin:0 auto"></main></div>`; }
  renderWizardStep();
}''')
rep('''    : (S.wizardMode==='coach' ? '<button class="btn btn-secondary" onclick="closeModal()">Annuler</button>' : '<button class="btn btn-secondary" onclick="renderClientEntry()">Annuler</button>');''',
    '''    : (S.wizardMode==='coach' ? '<button class="btn btn-secondary" onclick="closeModal()">Annuler</button>' : '<button class="btn btn-secondary" onclick="showLanding()">Annuler</button>');''')
rep('''        <p>Votre dossier a bien été transmis à votre coach. Vous pourrez consulter votre profil une fois qu'il aura validé votre bilan.</p>
        <button class="btn btn-primary" onclick="renderClientEntry()">Retour</button>''',
    '''        <p>Votre dossier a bien été transmis à votre coach. Il vous contactera pour le premier rendez-vous et vous remettra votre code d\\u2019accès à l\\u2019espace client.</p>
        <button class="btn btn-primary" onclick="showLanding()">Retour à l\\u2019accueil</button>''')
# Ancienne entrée client / liste de profils : remplacées par l'authentification
replace_fn('renderClientEntry', '''function renderClientEntry(){ renderAuth('client'); }
''')
replace_fn('renderClientProfileList', '''async function renderClientProfileList(){ renderAuth('client'); }
''')
replace_fn('openConnexionChoice', '''function openConnexionChoice(){ renderAuth('client'); }
''')
rep('''async function openClientProfileView(id){
  const doc = await db.doc('clients/'+id).get();
  if(!doc.exists){ toast('Client introuvable'); return; }''', '''async function openClientProfileView(id, silent){
  const doc = await db.doc('clients/'+id).get();
  if(!doc.exists){ if(!silent) toast('Client introuvable'); return false; }
  S.view='client';''')
rep('''  await loadClientData(id);
  renderClientProfileArea();
}''', '''  await loadClientData(id);
  renderClientProfileArea();
  return true;
}''')
rep('''    <div class="menu"><div class="item" onclick="renderClientProfileList()"><span class="body"><span class="title">Changer de profil</span></span>${ICONS.chev}</div></div>`;''',
    '''    <div class="menu"><div class="item" onclick="logout()"><span class="body"><span class="title">Se déconnecter</span></span>${ICONS.chev}</div></div>`;''')
# Espace coach : Plus → Mon site, Sécurité, Se déconnecter ; bouton "Le client remplit" → questionnaire dans la coque client (déjà géré)
rep('''    ['compta','Compta','Paiements, récapitulatif par mois, sauvegarde']
  ];''', '''    ['compta','Compta','Paiements, récapitulatif par mois, sauvegarde'],
    ['site','Mon site','Textes de la page d\\u2019accueil et contact'],
    ['securite','Sécurité','Code coach et codes clients']
  ];''')
rep('''    <div class="menu"><div class="item" onclick="showLanding()"><span class="body"><span class="title">Quitter l\\u2019espace coach</span></span>${ICONS.chev}</div></div>`;''',
    '''    <div class="menu"><div class="item" onclick="logout()"><span class="body"><span class="title">Se déconnecter</span></span>${ICONS.chev}</div><div class="item" onclick="showLanding()"><span class="body"><span class="title">Voir le site public</span></span>${ICONS.chev}</div></div>`;''')
rep('''  const sub = {bibmouvements:'Mouvements', bibcycles:'Cycles', aliments:'Aliments et recettes', lecons:'Mes enseignements', challenges:'Challenges', niveaux:'Niveaux', diet:'Calcul diététique', compta:'Compta'};''',
    '''  const sub = {bibmouvements:'Mouvements', bibcycles:'Cycles', aliments:'Aliments et recettes', lecons:'Mes enseignements', challenges:'Challenges', niveaux:'Niveaux', diet:'Calcul diététique', compta:'Compta', site:'Mon site', securite:'Sécurité'};''')
rep('''    else if(t==='compta') renderCompta();
    return;''', '''    else if(t==='compta') renderCompta();
    else if(t==='site') renderSiteSettings();
    else if(t==='securite') renderSecurite();
    return;''')
rep("  const plusTabs = ['plus','bibmouvements','bibcycles','aliments','lecons','challenges','niveaux','diet','compta'];",
    "  const plusTabs = ['plus','bibmouvements','bibcycles','aliments','lecons','challenges','niveaux','diet','compta','site','securite'];")
rep('''// ---- NEW CLIENT MODAL ----''', '''// ---- MON SITE / SÉCURITÉ ----
function renderSiteSettings(){
  const el=document.getElementById('hometabcontent'); const site=S.site||SITE_DEFAULTS;
  el.innerHTML = `
    <div class="card">
      <p class="note">Ces textes apparaissent sur la page d\\u2019accueil publique. Les tarifs viennent de l\\u2019application.</p>
      <label>Accroche</label><input id="st-accroche" value="${site.accroche}">
      <label>Sous-titre</label><textarea id="st-sousTitre" rows="2">${site.sousTitre}</textarea>
      <label>Zone</label><input id="st-zone" value="${site.zone}">
      <label>À propos</label><textarea id="st-bio" rows="5">${site.bio}</textarea>
      <div class="formrow"><div><label>Téléphone</label><input id="st-telephone" value="${site.telephone||''}"></div><div><label>Email</label><input id="st-email" value="${site.email||''}"></div></div>
      <label>Instagram (sans @)</label><input id="st-instagram" value="${site.instagram||''}">
      <div class="modalbtns"><button class="btn btn-secondary" onclick="showLanding()">Voir le site</button><button class="btn btn-primary" onclick="saveSiteSettings()">Enregistrer</button></div>
    </div>`;
}
async function saveSiteSettings(){
  const data = {accroche:val('st-accroche').trim(), sousTitre:val('st-sousTitre').trim(), zone:val('st-zone').trim(), bio:val('st-bio').trim(), telephone:val('st-telephone').trim(), email:val('st-email').trim(), instagram:val('st-instagram').trim().replace(/^@/,'')};
  for(const k of Object.keys(data)) if(!data[k] && SITE_DEFAULTS[k]) data[k]=SITE_DEFAULTS[k];
  await db.doc('settings/site').set(data);
  S.site = Object.assign({}, SITE_DEFAULTS, data);
  toast('Site mis à jour');
}
async function renderSecurite(){
  const el=document.getElementById('hometabcontent');
  const clients = S.clients;
  el.innerHTML = `
    <div class="card">
      <h2>Code coach</h2>
      <p class="note">Demandé pour ouvrir l\\u2019espace coach. Il protège l\\u2019écran de votre téléphone, pas les données elles-mêmes : seul votre compte Claude peut les lire.</p>
      <button class="btn btn-secondary" onclick="openChangeCoachCode()">Changer le code</button>
    </div>
    <div class="card">
      <h2>Codes clients</h2>
      <p class="note">Chaque client reçoit un code à 6 chiffres à la validation de son bilan. Vous le retrouvez dans sa fiche (bouton Actions) pour le lui transmettre ou le changer.</p>
      ${clients.length? `<div class="list" style="margin:0">${clients.map(c=>`<div class="item" onclick="selectClient('${c.id}')"><span class="body"><span class="title">${clientName(c)}</span><span class="sub">${c.accessCode? 'Code : '+fmtCode(c.accessCode) : 'Pas encore de code'}</span></span>${ICONS.chev}</div>`).join('')}</div>` : '<div class="empty">Aucun client</div>'}
    </div>`;
}

// ---- NEW CLIENT MODAL ----''')
# Actions client : afficher / régénérer le code
rep('''      <div class="item" onclick="closeModal();openEvoModal()"><span class="body"><span class="title">Nouvelle pesée</span></span>${ICONS.chev}</div>
    </div>''', '''      <div class="item" onclick="closeModal();openEvoModal()"><span class="body"><span class="title">Nouvelle pesée</span></span>${ICONS.chev}</div>
      <div class="item static"><span class="body"><span class="title">${c.accessCode? 'Code d\\u2019accès : '+fmtCode(c.accessCode) : 'Pas encore de code d\\u2019accès'}</span><span class="sub">${c.accessCode? 'À transmettre au client pour son espace' : (S.bilan&&S.bilan.valide===false ? 'Généré à la validation du bilan' : 'Générez-en un')}</span></span><span class="side"><button class="btn btn-secondary btn-sm" onclick="regenerateClientCode('${c.id}')">${c.accessCode?'Changer':'Générer'}</button></span></div>
    </div>''')
# Validation du bilan : génère le code et l'affiche
replace_fn('validateBilan', '''async function validateBilan(){
  await db.doc('bilans/'+S.currentId).update({valide:true});
  S.bilan = {...S.bilan, valide:true};
  const code = await ensureClientCode(S.currentId);
  const c = S.clients.find(x=>x.id===S.currentId); if(c) c.accessCode = code;
  openModal(`<h3>Bilan validé</h3><p>${c?clientName(c):'Le client'} peut maintenant ouvrir son espace avec ce code :</p>
    <div class="codeshow">${fmtCode(code)}</div>
    <p class="note">Transmettez-le lui (SMS, en main propre). Vous le retrouverez dans sa fiche, bouton Actions.</p>
    <div class="modalbtns"><button class="btn btn-primary" onclick="closeModal();render()">Fermer</button></div>`);
}
''')
# Clients créés par le coach : bilan validé d'emblée → code généré à la création
rep('''    closeModal();
    await loadClients();
    selectClient(ref.id, 'bilan');''', '''    closeModal();
    await ensureClientCode(ref.id);
    await loadClients();
    selectClient(ref.id, 'bilan');''')
# Sauvegarde : inclure les réglages
rep("const ALL_COLLECTIONS = ['clients',", "const ALL_COLLECTIONS = ['settings','clients',")
# Actions verrouillées
rep("'sendResiliationDemande','deleteClient','exportBackup','markSeancePaidById'];",
    "'sendResiliationDemande','deleteClient','exportBackup','markSeancePaidById','submitAuth','saveCoachSetup','saveNewCoachCode','saveSiteSettings','regenerateClientCode'];")
p.write_text(s, encoding='utf-8')
print('OK v5')
