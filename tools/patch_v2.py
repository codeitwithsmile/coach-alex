#!/usr/bin/env python3
"""Applique les corrections v2 à src/split/app.js (script à usage unique, conservé pour traçabilité)."""
import pathlib, sys
p = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'split' / 'app.js'
s = p.read_text(encoding='utf-8')
n_done = 0

def rep(old, new, count=1):
    global s, n_done
    c = s.count(old)
    if c != count:
        sys.exit(f'ERREUR: attendu {count} occurrence(s), trouvé {c} pour:\n{old[:160]}')
    s = s.replace(old, new)
    n_done += 1

# ---------- 1. Échappement + enveloppe base (cache, écritures brutes) ----------
rep('''function uid(){return Math.random().toString(36).slice(2,10)+Date.now().toString(36);}

let db=null;''', r'''
// ---------- ÉCHAPPEMENT HTML ----------
// Règle unique : tout texte présent en mémoire est déjà « prêt pour innerHTML ».
// Les textes sont échappés à la lecture (base : escDeep ; champs : val) et
// dé-échappés à l'écriture en base (unescDeep). La base contient donc toujours le texte brut.
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function unesc(s){ return String(s).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&amp;/g,'&'); }
function mapDeep(v, f){
  if(typeof v==='string') return f(v);
  if(Array.isArray(v)) return v.map(x=>mapDeep(x,f));
  if(v && typeof v==='object'){ const o={}; for(const k in v) o[k]=mapDeep(v[k],f); return o; }
  return v;
}
function escDeep(v){ return mapDeep(v, esc); }
function unescDeep(v){ return mapDeep(v, unesc); }

// Enveloppe autour de la base Claude : échappement, et cache de 30 s sur les lectures de
// collections entières (vidé à chaque écriture dans la collection concernée).
function makeSafeDb(raw){
  const cache = {}; const TTL = 30000;
  const invalidate = path => { delete cache[String(path).split('/')[0]]; };
  const exists = s => (typeof s.exists==='function' ? !!s.exists() : !!s.exists);
  const snapDoc = s => ({exists: exists(s), id: s.id, data: () => escDeep(s.data())});
  const snapQuery = s => ({docs: s.docs.map(d=>({id:d.id, data:()=>escDeep(d.data())}))});
  const write = async (path, fn) => { invalidate(path); try{ return await fn(); } finally{ invalidate(path); } };
  const wrapDoc = (ref, path) => ({
    get: async () => snapDoc(await ref.get()),
    set: o => write(path, () => ref.set(unescDeep(o))),
    update: o => write(path, () => ref.update(unescDeep(o))),
    delete: () => write(path, () => ref.delete())
  });
  const wrapQuery = q => ({
    get: async () => snapQuery(await q.get()),
    where: (...a) => wrapQuery(q.where(...a)),
    orderBy: (...a) => wrapQuery(q.orderBy(...a))
  });
  return {
    doc: path => wrapDoc(raw.doc(path), path),
    collection: name => {
      const c = raw.collection(name);
      return {
        get: async () => {
          const hit = cache[name];
          if(hit && Date.now()-hit.t < TTL) return snapQuery(await hit.p);
          const entry = {t:Date.now(), p:c.get()};
          cache[name] = entry;
          try{ return snapQuery(await entry.p); }
          catch(e){ if(cache[name]===entry) delete cache[name]; throw e; }
        },
        where: (...a) => wrapQuery(c.where(...a)),
        orderBy: (...a) => wrapQuery(c.orderBy(...a)),
        add: o => write(name, () => c.add(unescDeep(o))),
        doc: id => wrapDoc(c.doc(id), name+'/'+id)
      };
    }
  };
}

let db=null;''')

rep('''async function boot(){
  try{ db = await claude.use("db"); }catch(e){ db=null; }''',
'''async function boot(){
  document.getElementById('app').innerHTML = '<div style="padding:40px;text-align:center;width:100%">Chargement…</div>';
  let raw=null;
  try{ raw = await claude.use("db"); }catch(e){ raw=null; }
  db = raw ? makeSafeDb(raw) : null;''')

rep('''function val(id){return document.getElementById(id).value;}''',
'''function val(id){ const el=document.getElementById(id); return el ? esc(el.value) : ''; }''')

rep('''  const t=document.createElement('div'); t.className='toast'; t.textContent=msg;''',
'''  const t=document.createElement('div'); t.className='toast'; t.textContent=unesc(msg);''')

rep('''    if(elx) data[f.key]=elx.value;''', '''    if(elx) data[f.key]=esc(elx.value);''')

# ---------- 2. Calcul diététique : données manquantes ----------
rep('''  const genre = inp.genre==='femme'?'femme':'homme';
  const niveau = ['sedentaire','leger','actif'].includes(inp.niveau)?inp.niveau:'sedentaire';''',
'''  if(!(poids>0 && taille>0 && age>0)) return null;
  const genre = inp.genre==='femme'?'femme':'homme';
  const niveau = ['sedentaire','leger','actif'].includes(inp.niveau)?inp.niveau:'sedentaire';''')
rep('''function dietResultHtml(d){
  return `<div class="grid">''',
'''const DIET_MISSING_MSG = 'Renseignez le genre, la date de naissance (ou l\\u2019âge), le poids et la taille pour lancer le calcul.';
function dietResultHtml(d){
  if(!d) return `<div class="empty">${DIET_MISSING_MSG}</div>`;
  return `<div class="grid">''')
rep('''  const d = calcDiet({genre:val('b-genre'), age:ageFromBirthdate(val('b-dateNaissance')), poids:val('b-poids'), taille:val('b-taille'), niveau:val('b-niveauActivite')});
''', '''  const d = calcDiet({genre:val('b-genre'), age:ageFromBirthdate(val('b-dateNaissance')), poids:val('b-poids'), taille:val('b-taille'), niveau:val('b-niveauActivite')});
  if(!d){ toast(DIET_MISSING_MSG); return; }
''')
rep('''  const d = calcDiet({genre:b.genre, age:ageFromBirthdate(b.dateNaissance), taille:b.taille, niveau:b.niveauActivite, poids:val('e-poids')});
''', '''  const d = calcDiet({genre:b.genre, age:ageFromBirthdate(b.dateNaissance), taille:b.taille, niveau:b.niveauActivite, poids:val('e-poids')});
  if(!d){ toast('Calcul impossible : vérifiez le poids saisi ici, et la date de naissance et la taille dans le Bilan.'); return; }
''')
rep('''    ...diet
  };''', '''    ...(diet||{})
  };''')

# ---------- 3. Bilan : ne plus effacer le type de plan ----------
rep('''    notes:val('b-notes'), maj: todayStr(), valide: b.valide!==false
  };''', '''    notes:val('b-notes'), maj: todayStr(), valide: b.valide!==false,
    typePlan: b.typePlan||null
  };''')

# ---------- 4. Suivi mensuel ----------
old_start = s.index('function computePeriods(config, upToStr){')
old_end = s.index('function unpaidForClient(clientId, programmes, suivis){')
s = s[:old_start] + '''// Date de début + k mois, au même quantième ; si le mois est trop court, dernier jour du mois
// (31/01 → 28/02 → 31/03), toujours calculé depuis la date de départ pour ne pas dériver.
function addMonthsClamped(startStr, k){
  const [y,m,d] = startStr.split('-').map(Number);
  const first = new Date(y, m-1+k, 1);
  const last = new Date(first.getFullYear(), first.getMonth()+1, 0).getDate();
  return toLocalISO(new Date(first.getFullYear(), first.getMonth(), Math.min(d,last)));
}
// Périodes [start, end[ ; « tronquee » = arrêtée par une pause/annulation (fin incluse).
function computePeriods(config, upToStr){
  if(!config || !config.segments) return [];
  const periods=[]; const upTo = upToStr || todayStr();
  for(const seg of config.segments){
    if(!seg.start) continue;
    for(let k=0; k<1200; k++){
      const start = addMonthsClamped(seg.start, k);
      if(start > upTo) break;
      if(seg.end && (start > seg.end || (k>0 && start === seg.end))) break;
      const next = addMonthsClamped(seg.start, k+1);
      const tronquee = !!(seg.end && next >= seg.end);
      periods.push({start, end: tronquee ? seg.end : next, tronquee});
    }
  }
  return periods;
}
function suiviTarif(n){ if(n>=5)return 0; if(n===4)return 36; if(n===3)return 62; return 89; }
function inPeriod(date, p){ return date>=p.start && (date<p.end || (p.tronquee && date<=p.end)); }
// Séances avec coach payées ou offertes, non annulées, dans la période.
function countPaidSessions(programmes, clientId, p){
  return programmes.filter(pr=>pr.clientId===clientId && pr.type==='avec' && pr.paiement && pr.statut!=='annulee' && inPeriod(pr.date, p)).length;
}
// Crée / met à jour les périodes de suivi d'un client (les périodes payées ou annulées sont figées).
async function syncSuiviDocs(clientId, cfg, programmes, suivis){
  for(const p of computePeriods(cfg)){
    const id = clientId+'_'+p.start;
    const existing = suivis.find(x=>x.id===id);
    const nb = countPaidSessions(programmes, clientId, p);
    const tarif = suiviTarif(nb);
    if(!existing){
      const rec = {clientId, periodeDebut:p.start, periodeFin:p.end, nbSeances:nb, tarif, paiement:false, annule:false};
      await db.collection('suivis').doc(id).set(rec);
      suivis.push({id, ...rec});
    } else if(!existing.paiement && !existing.annule){
      if(existing.nbSeances!==nb || existing.tarif!==tarif || existing.periodeFin!==p.end){
        await db.collection('suivis').doc(id).update({nbSeances:nb, tarif, periodeFin:p.end});
        existing.nbSeances=nb; existing.tarif=tarif; existing.periodeFin=p.end;
      }
    }
  }
}
async function ensurePeriodDocs(clientId){
  if(S.suiviConfig) await syncSuiviDocs(clientId, S.suiviConfig, S.programmes, S.suivis);
}

''' + s[old_end:]
n_done += 1

rep('''  const periods = computePeriods(cfg);
  await ensurePeriodDocs(c.id, periods);''', '''  const periods = computePeriods(cfg);
  await ensurePeriodDocs(c.id);''')
rep('''    const paidCount = S.programmes.filter(pr=>pr.type==='avec' && pr.paiement && pr.date>=last.start && pr.date<=last.end).length;''',
    '''    const paidCount = countPaidSessions(S.programmes, S.currentId, last);''')

# Tableau de bord : générer les périodes de tous les clients avant de calculer les impayés
rep('''  // unpaid across all clients, split retard/à venir''',
'''  // périodes de suivi à jour pour tous les clients (sinon des impayés manquent)
  for(const cfg of allConfigs){
    if(S.clients.some(c=>c.id===cfg.id)) await syncSuiviDocs(cfg.id, cfg, allProg.filter(p=>p.clientId===cfg.id), allSuivis);
  }

  // unpaid across all clients, split retard/à venir''')

# Profil client (espace client) et profil coach : utiliser les données du client déjà chargées
rep('''  const [allProg, allSuivis, levelInfo] = await Promise.all([loadAllProgrammes(), loadAllSuivis(), computeClientLevel(c.id)]);
  const unpaid = unpaidForClient(c.id, allProg, allSuivis);''',
'''  await ensurePeriodDocs(c.id);
  const levelInfo = await computeClientLevel(c.id);
  const unpaid = unpaidForClient(c.id, S.programmes, S.suivis);''')
rep('''  const latestNut = S.nutritions.filter(n=>n.date<=today)[0] || null;
''', '')
rep('''  const allProg = await loadAllProgrammes();
  const allSuivis = await loadAllSuivis();
  const unpaid = unpaidForClient(c.id, allProg, allSuivis);''',
'''  await ensurePeriodDocs(c.id);
  const unpaid = unpaidForClient(c.id, S.programmes, S.suivis);''')
rep('''  const latestNut = S.nutritions.filter(n=>n.date<=todayStr())[0] || null;
''', '')
rep('''  const [bilanDoc, evoSnap, nutSnap, progSnap, cfgDoc, suiviSnap] = await Promise.all([
    db.doc('bilans/'+id).get(),
    db.collection('evolutions').where('clientId','==',id).get(),
    db.collection('nutritions').where('clientId','==',id).get(),''',
'''  const [bilanDoc, evoSnap, progSnap, cfgDoc, suiviSnap] = await Promise.all([
    db.doc('bilans/'+id).get(),
    db.collection('evolutions').where('clientId','==',id).get(),''')
rep('''  S.nutritions = nutSnap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>b.date.localeCompare(a.date));
''', '')

# ---------- 5. Entraînements : répétitions vides, double validation, bouton coach ----------
rep('''    if(mv && mv.surchargeProgressive){
      chargeChanged = true;''', '''    if(mv && mv.surchargeProgressive && typeof r.repsMin==='number' && !isNaN(r.repsMin)){
      chargeChanged = true;''')
rep('''  const entIdx = S.clientCurrentEntIdx;
  const ent = attr.entrainements[entIdx];
  const resultats = ent.mouvements.map((mv,i)=>({
    mouvementIndex:i, nom:mv.nom,
    repsMin: parseInt(val('log-reps-'+i)||'0',10),
    commentaire: val('log-comment-'+i)
  }));''',
'''  const entIdx = S.clientCurrentEntIdx;
  const ent = attr.entrainements[entIdx];
  if(!attr.active || attr.currentEntrainementIndex!==entIdx || !ent || !ent.valide){
    toast('Cet entraînement a déjà été enregistré ou n\\u2019est plus disponible.');
    switchClientTab('entrainement'); return;
  }
  const resultats = readRepsResults(ent, 'log-reps-', 'log-comment-');
  if(!resultats) return;''')
rep('''async function processEntrainementLog(''', '''// Lit les répétitions saisies. Champ vide = « non renseigné » (null), jamais 0.
// Obligatoire pour les mouvements en surcharge progressive (la charge suivante en dépend).
function readRepsResults(ent, repsPrefix, commentPrefix){
  const out=[];
  for(let i=0;i<ent.mouvements.length;i++){
    const mv = ent.mouvements[i];
    const rawv = val(repsPrefix+i).trim();
    const reps = rawv==='' ? null : parseInt(rawv,10);
    if(reps!==null && (isNaN(reps) || reps<0)){ toast('Répétitions invalides pour : '+mv.nom); return null; }
    if(mv.surchargeProgressive && reps===null){ toast('Indiquez les répétitions réalisées pour : '+mv.nom); return null; }
    out.push({mouvementIndex:i, nom:mv.nom, repsMin:reps, commentaire:val(commentPrefix+i)});
  }
  return out;
}
function repsStr(r){ return (typeof r.repsMin==='number' && !isNaN(r.repsMin)) ? r.repsMin+' répétitions min' : 'répétitions non renseignées'; }
async function processEntrainementLog(''')
rep('''${r.nom} : ${r.repsMin} répétitions min''', '''${r.nom} : ${repsStr(r)}''', 2)
rep('''  const ent = attr.entrainements[ctx.entIdx];
  const resultats = ent.mouvements.map((mv,i)=>({mouvementIndex:i, nom:mv.nom, repsMin:parseInt(val('cv-reps-'+i)||'0',10), commentaire:val('cv-comment-'+i)}));''',
'''  const ent = attr.entrainements[ctx.entIdx];
  if(!ent || attr.currentEntrainementIndex!==ctx.entIdx){ closeModal(); toast('Cet entraînement a déjà été validé.'); await loadClientData(S.currentId); renderTab(); return; }
  const resultats = readRepsResults(ent, 'cv-reps-', 'cv-comment-');
  if(!resultats) return;''')
rep('''(p.type==='avec' && p.cycleId && !p.entrainementValide && !isAnnulee)''',
    '''(p.type==='avec' && p.attributionId && !p.entrainementValide && !isAnnulee)''')

def attr_guard(expr_old, expr_new):
    rep(expr_old, expr_new)
rep('''function clientName(c){return c.prenom+' '+c.nom;}''',
'''function clientName(c){return c.prenom+' '+c.nom;}
function attrNeedsValidation(a){
  const ent = a.active && a.entrainements && a.entrainements[a.currentEntrainementIndex];
  return !!ent && !ent.valide;
}''')
rep('''    + allAttrs.filter(a=>a.active && !a.entrainements[a.currentEntrainementIndex].valide).length;''',
    '''    + allAttrs.filter(attrNeedsValidation).length;''')
rep('''  const needingAttention = allAttrs.filter(a=>a.active && !a.entrainements[a.currentEntrainementIndex].valide);''',
    '''  const needingAttention = allAttrs.filter(attrNeedsValidation);''')

# ---------- 6. Demande de séance : pas de date passée ----------
rep('''  const date=val('dm-date'), heure=val('dm-heure'), formule=val('dm-formule');
''', '''  const date=val('dm-date'), heure=val('dm-heure'), formule=val('dm-formule');
  if(!date || date<todayStr()){ document.getElementById('dm-msg').innerHTML = `<div class="badge warn">Choisissez une date à partir d\\u2019aujourd\\u2019hui.</div>`; return; }
''')

# ---------- 7. Recettes / aliments ----------
rep('''function addRecetteIngredient(){
''', '''function captureRecetteBuilder(){
  if(S.recetteBuilder && document.getElementById('rc-nom')){ S.recetteBuilder.nom=val('rc-nom'); S.recetteBuilder.guide=val('rc-guide'); }
}
function addRecetteIngredient(){
  captureRecetteBuilder();
''')
rep('''function removeRecetteIngredient(i){
''', '''function removeRecetteIngredient(i){
  captureRecetteBuilder();
''')
rep('''  closeModal(); toast('Recette enregistrée'); renderClientTabContent();''', '''  closeModal(); toast('Recette enregistrée'); refreshAlimView();''')
rep('''  await db.doc('recettes/'+id).delete();
  closeModal(); renderClientTabContent();''', '''  await db.doc('recettes/'+id).delete();
  closeModal(); refreshAlimView();''')
rep('''  toast('Liste de départ ajoutée'); renderClientTabContent();''', '''  toast('Liste de départ ajoutée'); refreshAlimView();''')
rep('''      <button class="btn btn-danger" onclick="deleteRecette('${id}')">Supprimer</button>
      <button class="btn btn-primary" onclick="logRecetteToJournal('${id}')">Ajouter à mon journal</button>''',
'''      <button class="btn btn-danger" onclick="askDelete('deleteRecette','${id}','Supprimer cette recette ?')">Supprimer</button>
      ${S.view==='client'?`<button class="btn btn-primary" onclick="logRecetteToJournal('${id}')">Ajouter à mon journal</button>`:''}''')
rep('''${byDay[d].map(e=>`<div class="empty">${e.produitNom} — ${e.quantiteG} g</div>`).join('')}''',
    '''${byDay[d].map(e=>`<div class="empty">${e.produitNom}${qteStr(e)}</div>`).join('')}''')
rep('''${byDay[d].map(e=>`<div class="empty">${e.produitNom} — ${e.quantiteG} g (${Math.round(e.kcal)} kcal)</div>`).join('')}''',
    '''${byDay[d].map(e=>`<div class="empty">${e.produitNom}${qteStr(e)} (${Math.round(e.kcal)} kcal)</div>`).join('')}''')
rep('''function journalDayTotals(dayEntries){''', '''function qteStr(e){ return (e.quantiteG===null || e.quantiteG===undefined) ? '' : ' — '+e.quantiteG+' g'; }
function journalDayTotals(dayEntries){''')

# Onglet coach « Aliments & recettes »
rep('''      <div class="tab ${S.homeTab==='lecons'?'active':''}" onclick="switchHomeTab('lecons')">Mes enseignements</div>''',
'''      <div class="tab ${S.homeTab==='aliments'?'active':''}" onclick="switchHomeTab('aliments')">Aliments &amp; recettes</div>
      <div class="tab ${S.homeTab==='lecons'?'active':''}" onclick="switchHomeTab('lecons')">Mes enseignements</div>''')
rep('''  else if(S.homeTab==='lecons') renderLeconsTab();''', '''  else if(S.homeTab==='aliments') renderAlimentsTab();
  else if(S.homeTab==='lecons') renderLeconsTab();''')
rep('''async function loadAllRecettes(){''', '''// ---- ALIMENTS & RECETTES (vue coach) ----
function refreshAlimView(){ if(S.view==='client') renderClientTabContent(); else renderAlimentsTab(); }
async function renderAlimentsTab(editId){
  const el=document.getElementById('hometabcontent');
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const [produits, recettes] = await Promise.all([loadAllProduitsBib(), loadAllRecettes()]);
  if(S.homeTab!=='aliments' || !document.getElementById('hometabcontent')) return;
  S.produitsBibCache = produits; S.recettesCache = recettes;
  const ed = editId ? produits.find(p=>p.id===editId) : null;
  const v = k => (ed && ed[k]!==undefined && ed[k]!==null) ? ed[k] : '';
  document.getElementById('hometabcontent').innerHTML = `
    <div class="card">
      <h2>🥗 ${ed?'Modifier un aliment':'Ajouter un aliment'}</h2>
      <p class="empty">Bibliothèque partagée avec les clients (ils peuvent aussi y ajouter des produits). Les entrées déjà saisies dans les journaux ne sont pas modifiées.</p>
      <div class="formrow">
        <div><label>Nom</label><input id="al-nom" value="${v('nom')}"></div>
        <div><label>Marque</label><input id="al-marque" value="${v('marque')}"></div>
      </div>
      <label>Catégorie</label><select id="al-categorie">${FOOD_CATEGORIES.map(c=>`<option value="${c}" ${ed&&ed.categorie===c?'selected':''}>${c}</option>`).join('')}</select>
      <div class="formrow">
        <div><label>Kcal /100g</label><input type="number" step="0.1" id="al-kcal100" value="${v('kcal100')}"></div>
        <div><label>Protéines /100g</label><input type="number" step="0.1" id="al-prot100" value="${v('proteines100')}"></div>
        <div><label>Lipides /100g</label><input type="number" step="0.1" id="al-lip100" value="${v('lipides100')}"></div>
        <div><label>Glucides /100g</label><input type="number" step="0.1" id="al-gluc100" value="${v('glucides100')}"></div>
      </div>
      <div class="modalbtns">
        ${ed?`<button class="btn btn-secondary" onclick="renderAlimentsTab()">Annuler</button>`:''}
        <button class="btn btn-primary" onclick="saveProduitCoach(${ed?`'${ed.id}'`:'null'})">${ed?'Enregistrer les modifications':'+ Ajouter'}</button>
      </div>
    </div>
    <div class="card">
      <h2>Bibliothèque d\\u2019aliments (${produits.length})</h2>
      ${produits.length===0?`<button class="btn btn-secondary btn-sm" onclick="seedProduitsBib()">Charger une liste de départ (aliments courants — valeurs estimées, à vérifier)</button>`:''}
      <input id="al-search" placeholder="Rechercher un nom ou une marque..." oninput="filterAlimentsCoach()">
      <div id="al-list" style="margin-top:8px"></div>
    </div>
    <div class="card">
      <h2>🍽️ Recettes</h2>
      <button class="btn btn-secondary btn-sm" onclick="openRecetteBuilder()">+ Nouvelle recette</button>
      <div style="margin-top:10px">
      ${recettes.length? recettes.map(r=>`<div class="seance-row" style="cursor:pointer" onclick="viewRecette('${r.id}')"><span>${r.nom}</span><span class="empty">${Math.round(r.kcal)} kcal</span></div>`).join('') : '<div class="empty">Aucune recette enregistrée</div>'}
      </div>
    </div>
  `;
  filterAlimentsCoach();
}
function filterAlimentsCoach(){
  const box = document.getElementById('al-list'); if(!box) return;
  const search = (val('al-search')||'').toLowerCase();
  const list = (S.produitsBibCache||[]).filter(p=>!search || (p.nom||'').toLowerCase().includes(search) || (p.marque||'').toLowerCase().includes(search))
    .sort((a,b)=>(a.nom||'').localeCompare(b.nom||''));
  box.innerHTML = list.length ? list.map(p=>`<div class="seance-row"><span>${p.nom}${p.marque?' ('+p.marque+')':''}${p.categorie?' · '+p.categorie:''}<br><span class="empty">${p.kcal100||0} kcal · ${p.proteines100||0}g P · ${p.lipides100||0}g L · ${p.glucides100||0}g G (/100g)</span></span>
    <span><button class="btn btn-secondary btn-sm" onclick="renderAlimentsTab('${p.id}')">Modifier</button> <button class="btn btn-danger btn-sm" onclick="askDelete('deleteProduit','${p.id}','Supprimer cet aliment ?')">Supprimer</button></span></div>`).join('') : '<div class="empty">Aucun aliment</div>';
}
async function saveProduitCoach(editId){
  const nom = val('al-nom').trim();
  if(!nom){ toast('Nom requis'); return; }
  const data = {nom, marque:val('al-marque').trim(), categorie:val('al-categorie'),
    kcal100:parseFloat(val('al-kcal100'))||0, proteines100:parseFloat(val('al-prot100'))||0, lipides100:parseFloat(val('al-lip100'))||0, glucides100:parseFloat(val('al-gluc100'))||0};
  if(editId){ await db.doc('produits_bib/'+editId).update(data); toast('Aliment modifié'); }
  else { await db.collection('produits_bib').add(data); toast('Aliment ajouté'); }
  renderAlimentsTab();
}
async function deleteProduit(id){
  await db.doc('produits_bib/'+id).delete();
  renderAlimentsTab();
}
// Modale de confirmation générique pour les suppressions.
function askDelete(fnName, id, label){
  openModal(`<h3>${label}</h3><p class="empty">Cette action est définitive.</p><div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-danger" onclick="closeModal();${fnName}('${id}')">Supprimer</button></div>`);
}
async function loadAllRecettes(){''')

# ---------- 8. Confirmations de suppression ----------
rep('''onclick="deleteJournalEntry('${e.id}')"''', '''onclick="askDelete('deleteJournalEntry','${e.id}','Supprimer cette entrée ?')"''')
rep('''onclick="deleteIndispo('${i.id}')"''', '''onclick="askDelete('deleteIndispo','${i.id}','Supprimer cette indisponibilité ?')"''')
rep('''onclick="deleteMouvementBib('${m.id}')"''', '''onclick="askDelete('deleteMouvementBib','${m.id}','Supprimer ce mouvement ?')"''')
rep('''onclick="deleteCycleTemplate('${t.id}')"''', '''onclick="askDelete('deleteCycleTemplate','${t.id}','Supprimer ce modèle de cycle ?')"''')
rep('''onclick="deleteChallenge('${ch.id}')"''', '''onclick="askDelete('deleteChallenge','${ch.id}','Supprimer ce challenge ?')"''')
rep('''onclick="deleteNiveau('${nv.id}')"''', '''onclick="askDelete('deleteNiveau','${nv.id}','Supprimer ce niveau ?')"''')
rep('''async function deleteChallenge(id){
  await db.doc('challenges/'+id).delete();''', '''async function deleteChallenge(id){
  const parts = await db.collection('challenge_participations').where('challengeId','==',id).get();
  await Promise.all(parts.docs.map(d=>db.doc('challenge_participations/'+d.id).delete()));
  await db.doc('challenges/'+id).delete();''')

# ---------- 9. Suppression d'un client : cascade complète ----------
a = s.index('async function deleteClient(){')
b = s.index('// ---- CLIENT PAGE ----')
s = s[:a] + '''async function deleteClient(){
  const id=S.currentId;
  const cols=['evolutions','programmes','suivis','attributions','entrainement_logs','journal_alimentaire','demandes','demandes_rdv','demandes_resiliation','challenge_participations','lecons_vues'];
  const snaps = await Promise.all(cols.map(c=>db.collection(c).where('clientId','==',id).get()));
  const dels=[];
  snaps.forEach((snap,i)=>snap.docs.forEach(d=>dels.push(db.doc(cols[i]+'/'+d.id).delete())));
  await Promise.all([...dels, db.doc('bilans/'+id).delete(), db.doc('suivi_config/'+id).delete()]);
  await db.doc('clients/'+id).delete();
  closeModal(); toast('Client supprimé');
  S.currentId=null; await loadClients(); render();
}

''' + s[b:]
n_done += 1
rep('''<ul><li>Bilan initial</li><li>Évolutions mensuelles</li><li>Suivi alimentaire</li><li>Séances</li><li>Suivi mensuel</li><li>Paiements associés</li></ul>''',
    '''<ul><li>Bilan initial et évolutions</li><li>Séances, suivi mensuel et paiements associés</li><li>Cycle attribué et historique d\\u2019entraînement</li><li>Journal alimentaire</li><li>Demandes en attente, challenges et leçons vues</li></ul>''')

# ---------- 10. Questionnaire : nom/prénom contrôlés dès la 1re étape ----------
rep('''async function wizardNext(){
  wizardCaptureStep();
''', '''async function wizardNext(){
  wizardCaptureStep();
  if(S.wizardStep===0 && (!(S.wizardData.prenom||'').trim() || !(S.wizardData.nom||'').trim())){ toast('Prénom et nom requis'); return; }
''')

# ---------- 11. Modèles de cycle : ne plus perdre les noms saisis ----------
rep('''function addEntrainementToBuilder(){
''', '''function captureCycleBuilder(){
  const b = S.cycleBuilder;
  if(!b || !document.getElementById('cb-template-nom')) return;
  b.nom = val('cb-template-nom');
  b.entrainements.forEach((ent,i)=>{ if(document.getElementById('ent-nom-'+i)) ent.nom = val('ent-nom-'+i); });
}
function addEntrainementToBuilder(){
  captureCycleBuilder();
''')
rep('''function removeEntrainementFromBuilder(idx){
''', '''function removeEntrainementFromBuilder(idx){
  captureCycleBuilder();
''')
rep('''function removeMouvementFromBuilder(entIdx, mvIdx){
''', '''function removeMouvementFromBuilder(entIdx, mvIdx){
  captureCycleBuilder();
''')
rep('''  S.cycleBuilder.entrainements[entIdx].mouvements.push(mv);''', '''  captureCycleBuilder();
  S.cycleBuilder.entrainements[entIdx].mouvements.push(mv);''')
rep('''  const nom = val('cb-template-nom') || 'Modèle sans nom';
  const b = S.cycleBuilder;''', '''  captureCycleBuilder();
  const b = S.cycleBuilder;
  const nom = (b.nom||'').trim() || 'Modèle sans nom';''')

# ---------- 12. Détails ----------
rep('''Charger la bibliothèque des 5 piliers (40 leçons)''', '''Charger la bibliothèque des 5 piliers (51 leçons)''')
rep('''Bibliothèque des 5 piliers intégrée (40 leçons)''', '''Bibliothèque des 5 piliers intégrée (51 leçons)''')
rep('''async function markPaidFromProfil(type,date){
  toast("Rendez-vous dans l'onglet Séance ou Suivi pour valider ce paiement.");
}
''', '')
rep('''  bindSeanceForm();
''', '')
rep('''function bindSeanceForm(){}
''', '')
rep(''',nutritions:[],programmes:[]''', ''',programmes:[]''')

# ---------- 13. Sauvegarde (export JSON) sur le tableau de bord ----------
rep('''    <div class="card">
      <h2>📈 Récapitulatif des mois précédents</h2>''', '''    <div class="card">
      <h2>💾 Sauvegarde</h2>
      <p class="empty">Télécharge toutes les données (clients, bilans, séances, suivis, entraînements, alimentation…) dans un fichier. À faire régulièrement. Les vidéos ne sont pas incluses.</p>
      <button class="btn btn-secondary btn-sm" onclick="exportBackup()">Télécharger une sauvegarde</button>
    </div>
    <div class="card">
      <h2>📈 Récapitulatif des mois précédents</h2>''')
rep('''function changeHomeWeek(delta){''', '''const ALL_COLLECTIONS = ['clients','bilans','evolutions','programmes','suivi_config','suivis','indisponibilites','demandes','demandes_rdv','demandes_resiliation','mouvements_bib','cycles_bib','attributions','entrainement_logs','produits_bib','journal_alimentaire','recettes','challenges','challenge_participations','niveaux_config','lecons','lecons_vues'];
async function exportBackup(){
  let downloads=null;
  try{ downloads = await claude.use('downloads'); }catch(e){ downloads=null; }
  if(!downloads){ toast('Sauvegarde indisponible dans cette vue.'); return; }
  const out = {application:'Coach Alex — Gestion Client', exporteLe:new Date().toISOString(), collections:{}};
  for(const name of ALL_COLLECTIONS){
    const snap = await db.collection(name).get();
    out.collections[name] = snap.docs.map(d=>({id:d.id, ...unescDeep(d.data())}));
  }
  try{
    await downloads.save({filename:'coach-alex-sauvegarde-'+todayStr()+'.json', data:JSON.stringify(out,null,1)});
    toast('Sauvegarde téléchargée');
  }catch(e){
    toast(e && e.code==='declined' ? 'Sauvegarde annulée' : 'Sauvegarde impossible pour le moment');
  }
}
function changeHomeWeek(delta){''')

# ---------- 14. Anti double-clic + message en cas d'erreur ----------
rep('''
boot();''', '''
// ---------- ANTI DOUBLE-CLIC / ERREURS ----------
// Chaque action qui écrit en base est verrouillée pendant son exécution : un second clic est ignoré.
// En cas d'erreur (réseau, base), l'utilisateur est prévenu au lieu d'un écran figé.
const LOCKED_ACTIONS = ['wizardNext','createSeance','saveEditSeance','envoyerDemande','accepterDemande','refuserDemande','traiterRdv','traiterResiliation','marquerLogVu',
  'submitEntrainementLog','confirmValiderEntrainementSeance','confirmValidateEntrainementAttr','bulkValidateAttribution','assignCycleToClient','saveCycle','confirmAddMouvement',
  'addJournalEntry','saveJournalEntryEdit','deleteJournalEntry','logRecetteToJournal','saveRecette','deleteRecette','saveProduitCoach','deleteProduit','seedProduitsBib',
  'saveEvo','deleteEvo','saveBilan','validateBilan','saveTypePlan','saveIndispo','deleteIndispo','saveChallenge','deleteChallenge','declareChallenge','saveNiveau','deleteNiveau',
  'saveLeconDossier','saveLeconRessource','removeLeconVideo','deleteLeconCascade','seedLecons','seedMouvementsBib','seedMouvementsLecons','addMouvementBibGlobal','deleteMouvementBib','deleteCycleTemplate',
  'markSeancePaid','markSeanceOfferte','markSeanceFaite','cancelSeance','cancelSeanceConfirmed','deleteSeance','startSuivi','pauseSuivi','cancelSuiviEnCours','restartSuivi','markSuiviPaid','cancelSuiviPeriod',
  'sendResiliationDemande','deleteClient','exportBackup'];
LOCKED_ACTIONS.forEach(name=>{
  const fn = window[name];
  if(typeof fn!=='function'){ console.warn('Action inconnue :', name); return; }
  let busy=false;
  window[name] = async function(...args){
    if(busy) return;
    busy=true;
    try{ return await fn.apply(this,args); }
    catch(e){ console.error(name, e); toast('Une erreur est survenue. Vérifiez votre connexion puis réessayez.'); }
    finally{ busy=false; }
  };
});

boot();''')

p.write_text(s, encoding='utf-8')
print('OK —', n_done, 'modifications appliquées')
