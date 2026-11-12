#!/usr/bin/env python3
"""v7 : bilan en lecture avec modification par section, questionnaire plus agréable (échelles, progression),
menu Plus regroupé, erreurs d'affichage visibles."""
import pathlib, re, sys
root = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'split'
p = root / 'app.js'; s = p.read_text(encoding='utf-8')
def find_fn(name):
    m = re.search(r'^(async )?function ' + re.escape(name) + r'\(', s, re.M)
    if not m: sys.exit('fonction introuvable : ' + name)
    nxt = re.compile(r'^(async function |function |const |let |// ---)', re.M)
    m2 = nxt.search(s, m.end()); return m.start(), (m2.start() if m2 else len(s))
def replace_fn(name, new):
    global s; a,b = find_fn(name); s = s[:a] + new.rstrip('\n') + '\n' + s[b:]
def rep(old, new, count=1):
    global s; c = s.count(old)
    if c != count: sys.exit(f'ERREUR: {c} (attendu {count}) pour:\n{old[:150]}')
    s = s.replace(old, new)

# ---------- Champs : échelles, oui/non, textes longs ----------
for key in ('intensiteActivitePro','fatigueTravail','reactionStress','motivationSport','toleranceDifficulte'):
    s = re.sub(r"(\{key:'%s', label:'[^']*' ?, type:)'number'" % key, r"\1'scale'", s)
    s = re.sub(r'(\{key:\'%s\', label:"[^"]*", type:)\'number\'' % key, r"\1'scale'", s)
rep("{key:'niveauMotivation', label:'Niveau de motivation actuel (1 à 10)', type:'number'", "{key:'niveauMotivation', label:'Niveau de motivation actuel (1 à 10)', type:'scale10'")
for key in ('tabac','drogues','enfants','pretAjouterActivite','grossesse','problemesCycle'):
    s = re.sub(r"(\{key:'%s', label:'[^']*', type:)'text'" % key, r"\1'yesno'", s)
assert s.count("type:'scale'")==5 and s.count("type:'yesno'")>=5, (s.count("type:'scale'"), s.count("type:'yesno'"))
# Libellés plus courts, placeholders
LABELS = {
 'typeActivitePro':("Type d'activité professionnelle","Votre métier, et s'il est plutôt assis, debout ou physique"),
 'intensiteActivitePro':("Intensité de l'activité professionnelle (1 à 5)","Intensité physique du travail"),
 'horairesTravail':('Horaires / rythme de travail','Horaires de travail'),
 'fatigueTravail':('Niveau de fatigue après le travail (1 à 5)','Fatigue en fin de journée'),
 'reactionStress':('Réaction au stress hors travail (1 à 5)','Sensibilité au stress'),
 'motivationSport':('Motivation et envie liées au sport (1 à 5)','Motivation pour le sport'),
 'toleranceDifficulte':('Tolérance à la difficulté et à la faim (1 à 5)','Tolérance à la difficulté et à la faim'),
 'niveauMotivation':('Niveau de motivation actuel (1 à 10)','Motivation aujourd\\u2019hui'),
 'enfants':('A des enfants ?','Des enfants ?'),
 'pretAjouterActivite':('Prêt(e) à ajouter une activité supplémentaire ?','Prêt(e) à ajouter une activité ?'),
}
for k,(old,new) in LABELS.items():
    s = s.replace("label:'%s'" % old, "label:'%s'" % new).replace('label:"%s"' % old, 'label:"%s"' % new)
replace_fn('qFieldHtml', '''function qFieldHtml(f, value){
  value = (value===undefined||value===null) ? '' : value;
  const id = 'q-'+f.key;
  if(f.type==='select') return `<label for="${id}">${f.label}</label><select id="${id}">${f.options.map(([v,l])=>`<option value="${v}" ${value===v?'selected':''}>${l}</option>`).join('')}</select>`;
  if(f.type==='scale' || f.type==='scale10'){
    const max = f.type==='scale10'?10:5; const cur = parseInt(value,10);
    return `<label>${f.label}</label><div class="scale ${max===10?'ten':''}" role="radiogroup" aria-label="${f.label}">${[...Array(max)].map((_,i)=>`<button type="button" role="radio" aria-checked="${cur===i+1}" class="${cur===i+1?'active':''}" onclick="pickScale('${id}',${i+1},this)">${i+1}</button>`).join('')}</div><div class="scale-ends"><span>${max===10?'Pas du tout':'Faible'}</span><span>${max===10?'Au maximum':'Fort'}</span></div><input type="hidden" id="${id}" value="${value}">`;
  }
  if(f.type==='yesno'){
    const v = String(value).trim(); const isYes = /^oui/i.test(v), isNo = /^non/i.test(v);
    const detail = (isYes||isNo) ? v.replace(/^(oui|non)[\\s,:.-]*/i,'') : (v? v : '');
    return `<label>${f.label}</label><div class="yesno" role="radiogroup" aria-label="${f.label}">
      <button type="button" role="radio" aria-checked="${isNo}" class="${isNo?'active':''}" onclick="pickYesNo('${id}','Non',this)">Non</button>
      <button type="button" role="radio" aria-checked="${isYes}" class="${isYes?'active':''}" onclick="pickYesNo('${id}','Oui',this)">Oui</button>
    </div><input type="text" id="${id}-detail" placeholder="Précision (optionnel)" value="${detail}" style="margin-top:6px"><input type="hidden" id="${id}" value="${isYes?'Oui':(isNo?'Non':'')}">`;
  }
  if(f.type==='textarea') return `<label for="${id}">${f.label}</label><textarea id="${id}" rows="3">${value}</textarea>`;
  if(f.type==='number') return `<label for="${id}">${f.label}</label><input type="number" inputmode="decimal" id="${id}" value="${value}">`;
  if(f.type==='date') return `<label for="${id}">${f.label}</label><input type="date" id="${id}" value="${value}">`;
  return `<label for="${id}">${f.label}</label><input type="text" id="${id}" value="${value}">`;
}
function pickScale(id, v, btn){
  const inp=document.getElementById(id); if(inp) inp.value=String(v);
  const g=btn.parentElement; [...g.children].forEach(b=>{ b.classList.toggle('active', b===btn); b.setAttribute('aria-checked', b===btn?'true':'false'); });
}
function pickYesNo(id, v, btn){
  const inp=document.getElementById(id); if(inp) inp.value=v;
  const g=btn.parentElement; [...g.children].forEach(b=>{ b.classList.toggle('active', b===btn); b.setAttribute('aria-checked', b===btn?'true':'false'); });
}
// Valeur d'un champ du questionnaire (oui/non + précision fusionnés)
function qVal(key){
  const f = QFIELDS.find(x=>x.key===key); const id='q-'+key;
  if(!document.getElementById(id)) return undefined;
  if(f && f.type==='yesno'){ const base=val(id); const det=val(id+'-detail').trim(); return base ? (det? base+', '+det : base) : det; }
  return val(id);
}
function qDisplay(f, v){
  if(v===undefined||v===null||String(v).trim()==='') return '';
  if(f.type==='select'){ const o=f.options.find(x=>x[0]===v); return o?o[1]:v; }
  if(f.type==='scale') return v+' / 5';
  if(f.type==='scale10') return v+' / 10';
  return String(v);
}
''')
rep("    QFIELDS.filter(f=>f.section===sectionTitle).forEach(f=>{ S.wizardData[f.key] = val('q-'+f.key); });",
    "    QFIELDS.filter(f=>f.section===sectionTitle).forEach(f=>{ const v=qVal(f.key); if(v!==undefined) S.wizardData[f.key] = v; });")

# ---------- Questionnaire : progression, en-tête, mise en page ----------
rep('''  const body = `
    <h3>${sectionTitle} (${S.wizardStep+1}/${totalSteps})</h3>
    ${fieldsHtml}
    <div class="modalbtns">
      ${cancelBtn}
      <button class="btn btn-primary" onclick="wizardNext()">${isLast?(S.wizardMode==='coach'?'Créer le client':'Envoyer'):'Suivant'}</button>
    </div>
  `;
  if(S.wizardMode==='coach') openModal(body);
  else document.getElementById('main').innerHTML = `<div class="card">${body}</div>`;''',
'''  const intro = {
    'Identité':'Pour vous joindre et vous envoyer vos documents.',
    'Profil général':'Les bases pour calculer vos besoins.',
    'Activité professionnelle':'Votre travail compte dans la fatigue et les besoins.',
    'Santé':'Répondez simplement ; rien n\\u2019est partagé.',
    'Passé et contexte émotionnel':'Ce qui a déjà été tenté, et où vous en êtes.',
    'Sport et activité physique':'Votre pratique actuelle et le temps disponible.',
    'Mode de vie / habitudes':'Sommeil, repas, budget, entourage.',
    'Premier rendez-vous':'Comment et quand vous rencontrer.'
  }[sectionTitle]||'';
  const pct = Math.round(100*(S.wizardStep)/totalSteps);
  const body = `
    <div class="wiz-head">
      <span class="note">Étape ${S.wizardStep+1} sur ${totalSteps}</span>
      <span class="bar"><span style="width:${pct}%"></span></span>
      <h3 style="margin:10px 0 2px">${sectionTitle}</h3>
      ${intro?`<p class="note">${intro}</p>`:''}
    </div>
    <div class="wiz-fields">${fieldsHtml}</div>
    <div class="modalbtns">
      ${cancelBtn}
      <button class="btn btn-primary" onclick="wizardNext()">${isLast?(S.wizardMode==='coach'?'Créer le client':'Envoyer mon bilan'):'Continuer'}</button>
    </div>
  `;
  if(S.wizardMode==='coach') openModal(body);
  else document.getElementById('main').innerHTML = `<div class="card wiz" style="margin-top:38px">${body}</div>`;
  const first = document.querySelector('.wiz-fields input:not([type=hidden]), .wiz-fields select, .wiz-fields textarea'); if(first && S.wizardStep===0) setTimeout(()=>{ try{ first.focus(); }catch(e){} },60);''')
rep('''      <label>Prénom</label><input id="q-prenom" value="${S.wizardData.prenom||''}">
      <label>Nom</label><input id="q-nom" value="${S.wizardData.nom||''}">
      <label>Adresse mail (pour transmettre les documents)</label><input type="email" id="q-email" value="${S.wizardData.email||''}">
      <label>Numéro de téléphone</label><input type="tel" id="q-telephone" value="${S.wizardData.telephone||''}">
      <label>Objectif (perte de poids, prise de masse, recomposition...)</label><input id="q-objectif" value="${S.wizardData.objectif||''}">''',
'''      <div class="formrow"><div><label for="q-prenom">Prénom</label><input id="q-prenom" autocomplete="given-name" value="${S.wizardData.prenom||''}"></div><div><label for="q-nom">Nom</label><input id="q-nom" autocomplete="family-name" value="${S.wizardData.nom||''}"></div></div>
      <label for="q-email">Email</label><input type="email" inputmode="email" autocomplete="email" id="q-email" value="${S.wizardData.email||''}">
      <label for="q-telephone">Téléphone</label><input type="tel" inputmode="tel" autocomplete="tel" id="q-telephone" value="${S.wizardData.telephone||''}">
      <label for="q-objectif">Votre objectif</label><input id="q-objectif" placeholder="Perte de poids, prise de masse, recomposition, remise en forme…" value="${S.wizardData.objectif||''}">''')
# Profil général du questionnaire : mesures et chiffres sur deux colonnes
rep('''  } else {
    fieldsHtml = QFIELDS.filter(f=>f.section===sectionTitle).map(f=>qFieldHtml(f, S.wizardData[f.key])).join('');
  }''', '''  } else {
    fieldsHtml = sectionFieldsHtml(sectionTitle, S.wizardData);
  }''')
rep('''function wizardCaptureStep(){''', '''// Champs d'une section, avec les paires courtes sur deux colonnes
function sectionFieldsHtml(section, data, exclude){
  const fields = QFIELDS.filter(f=>f.section===section && !(exclude||[]).includes(f.key));
  const pairs = {taille:'poids', tourTaille:'tourHanches', tourCuisse:'tourBras'};
  const out=[]; const done=new Set();
  for(const f of fields){
    if(done.has(f.key)) continue;
    const partner = pairs[f.key] ? fields.find(x=>x.key===pairs[f.key]) : null;
    if(partner){ out.push(`<div class="formrow"><div>${qFieldHtml(f, data[f.key])}</div><div>${qFieldHtml(partner, data[partner.key])}</div></div>`); done.add(partner.key); }
    else out.push(qFieldHtml(f, data[f.key]));
    done.add(f.key);
  }
  return out.join('');
}
function wizardCaptureStep(){''')

# ---------- Bilan : lecture par sections, modification en fenêtre ----------
replace_fn('renderBilan', '''function renderBilan(el,c){
  const b=S.bilan||{};
  const age = b.dateNaissance ? ageFromBirthdate(b.dateNaissance)+' ans' : '';
  const dl = (rows) => `<dl class="dl">${rows.filter(r=>r[1]).map(r=>`<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('')}</dl>`;
  const m = b.mesures||{};
  const generalRows = [['Date du bilan', b.date?fmtDate(b.date):''], ['Genre', b.genre==='femme'?'Femme':(b.genre==='homme'?'Homme':'')], ['Naissance', b.dateNaissance? fmtDate(b.dateNaissance)+(age?' · '+age:'') : ''],
    ['Poids', b.poids? b.poids+' kg':''], ['Taille', b.taille? b.taille+' cm':''], ['Activité', ({sedentaire:'Sédentaire',leger:'Légèrement actif',actif:'Actif'})[b.niveauActivite]||''],
    ['Mesures', mesuresStr(m)!=='—'?mesuresStr(m):''], ['Objectif chiffré', b.estimationKilos||''], ['Adresse de coaching', b.adresseCoaching||''], ['Notes du coach', b.notes||'']];
  const sections = QSECTIONS_ORDER.filter(sec=>sec!=='Profil général').map(sec=>{
    const fields = QFIELDS.filter(f=>f.section===sec);
    const rows = fields.map(f=>[f.label.replace(/ \\(1 à \\d+\\)/,''), qDisplay(f, b[f.key])]);
    const filled = rows.filter(r=>r[1]).length;
    return `<details class="card fold" ${filled?'':''}><summary><span>${sec}</span><span class="side"><span class="note">${filled}/${fields.length}</span><button class="btn btn-secondary btn-sm" onclick="event.preventDefault();openBilanSection('${sec}')">Modifier</button></span></summary>${filled? dl(rows) : '<div class="empty">Rien de renseigné pour l\\u2019instant.</div>'}</details>`;
  }).join('');
  el.innerHTML = `
    <div class="card">
      <h2>Bilan initial <span class="note" style="font-weight:500">${b.maj?'mis à jour le '+fmtDate(b.maj):''}</span><button class="btn btn-secondary btn-sm" onclick="openBilanGeneral()">Modifier</button></h2>
      ${generalRows.some(r=>r[1]) ? dl(generalRows) : '<div class="empty">Aucun bilan enregistré.</div>'}
    </div>
    <div class="card">
      <h2>Résultats caloriques <button class="btn btn-secondary btn-sm" onclick="openBilanCalories()">Modifier</button></h2>
      ${b.proteines ? dietResultHtml(b) : '<div class="empty">Pas encore calculés. Renseignez genre, naissance, poids, taille, puis « Modifier » › Recalculer.</div>'}
    </div>
    ${sections}`;
}
function openBilanGeneral(){
  const b=S.bilan||{};
  openModal(`<h3>Bilan initial</h3>
    <div class="formrow"><div><label for="b-date">Date du bilan</label><input type="date" id="b-date" value="${b.date||todayStr()}"></div><div><label for="b-genre">Genre</label><select id="b-genre"><option value="homme" ${b.genre==='homme'?'selected':''}>Homme</option><option value="femme" ${b.genre==='femme'?'selected':''}>Femme</option></select></div></div>
    <label for="b-dateNaissance">Date de naissance</label><input type="date" id="b-dateNaissance" value="${b.dateNaissance||''}">
    <div class="formrow"><div><label for="b-poids">Poids (kg)</label><input type="number" inputmode="decimal" step="0.1" id="b-poids" value="${b.poids||''}"></div><div><label for="b-taille">Taille (cm)</label><input type="number" inputmode="numeric" id="b-taille" value="${b.taille||''}"></div></div>
    <label for="b-niveauActivite">Niveau d\\u2019activité</label>
    <select id="b-niveauActivite">
      <option value="sedentaire" ${b.niveauActivite==='sedentaire'?'selected':''}>Sédentaire (sans entraînement)</option>
      <option value="leger" ${b.niveauActivite==='leger'?'selected':''}>Légèrement actif (avec entraînement)</option>
      <option value="actif" ${b.niveauActivite==='actif'?'selected':''}>Actif (travail éprouvant + entraînement intense)</option>
    </select>
    <label>Mesures (cm)</label>${mesuresFields('b', b.mesures)}
    <label for="b-estimationKilos">Objectif chiffré (ex. 5 kg à perdre)</label><input id="b-estimationKilos" value="${b.estimationKilos||''}">
    <label for="b-adresseCoaching">Adresse de coaching</label><input id="b-adresseCoaching" autocomplete="street-address" value="${b.adresseCoaching||''}">
    <label for="b-notes">Notes du coach</label><textarea id="b-notes" rows="3">${b.notes||''}</textarea>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveBilanGeneral()">Enregistrer</button></div>`);
}
async function saveBilanGeneral(){
  const b=S.bilan||{};
  const data = {...b, date:val('b-date'), genre:val('b-genre'), dateNaissance:val('b-dateNaissance'), poids:val('b-poids'), taille:val('b-taille'),
    niveauActivite:val('b-niveauActivite'), estimationKilos:val('b-estimationKilos'), adresseCoaching:val('b-adresseCoaching'), mesures:readMesuresFields('b'), notes:val('b-notes'), maj:todayStr(), valide: b.valide!==false, typePlan: b.typePlan||null};
  await db.doc('bilans/'+S.currentId).set(data);
  S.bilan = data; closeModal(); toast('Bilan enregistré'); renderTab();
}
function openBilanCalories(){
  const b=S.bilan||{};
  openModal(`<h3>Résultats caloriques</h3>
    <p class="note">Calculés avec Mifflin-St Jeor depuis le bilan. Vous pouvez les ajuster à la main.</p>
    <div class="modalbtns" style="justify-content:flex-start;margin:0 0 6px"><button class="btn btn-secondary btn-sm" onclick="recalcBilan()">Recalculer depuis le bilan</button></div>
    <div class="formrow"><div><label>Protéines (g)</label><input type="number" id="b-proteines" value="${b.proteines||''}"></div><div><label>Lipides (g)</label><input type="number" id="b-lipides" value="${b.lipides||''}"></div></div>
    <div class="formrow"><div><label>Régime, avec entraînement</label><input type="number" id="b-regimeAvec" value="${b.regimeAvec||''}"></div><div><label>Régime, sans</label><input type="number" id="b-regimeSans" value="${b.regimeSans||''}"></div></div>
    <div class="formrow"><div><label>Maintien, avec entraînement</label><input type="number" id="b-maintienAvec" value="${b.maintienAvec||''}"></div><div><label>Maintien, sans</label><input type="number" id="b-maintienSans" value="${b.maintienSans||''}"></div></div>
    <label>Prise de masse, avec entraînement</label><input type="number" id="b-priseMasseAvec" value="${b.priseMasseAvec||''}">
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveBilanCalories()">Enregistrer</button></div>`);
}
async function saveBilanCalories(){
  const b=S.bilan||{};
  const data = {...b, proteines:val('b-proteines'), lipides:val('b-lipides'), regimeAvec:val('b-regimeAvec'), regimeSans:val('b-regimeSans'), maintienAvec:val('b-maintienAvec'), maintienSans:val('b-maintienSans'), priseMasseAvec:val('b-priseMasseAvec'), maj:todayStr(), valide: b.valide!==false};
  await db.doc('bilans/'+S.currentId).set(data);
  S.bilan = data; closeModal(); toast('Résultats enregistrés'); renderTab();
}
function openBilanSection(sec){
  const b=S.bilan||{};
  openModal(`<h3>${sec}</h3><div class="wiz-fields">${sectionFieldsHtml(sec, b)}</div>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="saveBilanSection('${sec}')">Enregistrer</button></div>`);
}
async function saveBilanSection(sec){
  const b=S.bilan||{}; const data={...b, maj:todayStr(), valide: b.valide!==false};
  QFIELDS.filter(f=>f.section===sec).forEach(f=>{ const v=qVal(f.key); if(v!==undefined) data[f.key]=v; });
  await db.doc('bilans/'+S.currentId).set(data);
  S.bilan = data; closeModal(); toast('Enregistré'); renderTab();
}
''')
replace_fn('recalcBilan', '''function recalcBilan(){
  const b=S.bilan||{};
  const d = calcDiet({genre:b.genre, age:ageFromBirthdate(b.dateNaissance), poids:b.poids, taille:b.taille, niveau:b.niveauActivite});
  if(!d){ toast(DIET_MISSING_MSG); return; }
  for(const k of ['proteines','lipides','regimeAvec','regimeSans','maintienAvec','maintienSans','priseMasseAvec']){ const e=document.getElementById('b-'+k); if(e) e.value=d[k]; }
}
''')
delete = find_fn('saveBilan'); s = s[:delete[0]] + s[delete[1]:]
# Les tests appellent saveBilan : alias vers la fenêtre générale (lecture des mêmes champs)
rep('''async function saveBilanGeneral(){''', '''async function saveBilan(){ return saveBilanGeneral(); }
async function saveBilanGeneral(){''')
rep("'saveEvo','deleteEvo','saveBilan','validateBilan',", "'saveEvo','deleteEvo','saveBilan','saveBilanGeneral','saveBilanCalories','saveBilanSection','validateBilan',")

# ---------- Erreurs d'affichage visibles ----------
replace_fn('renderTab', '''async function renderTab(){
  const c = S.clients.find(x=>x.id===S.currentId);
  const el = document.getElementById('tabcontent');
  if(!el || !c) return;
  const tab = S.tab;
  try{
    if(tab==='bilan') return renderBilan(el,c);
    if(tab==='seance') return await renderSeance(el,c);
    if(tab==='entrainement') return await renderEntrainement(el,c);
    if(tab==='planningAlim') return await renderPlanningAlimentaire(el,c);
    return await renderClientSuivi(el,c);
  }catch(e){
    console.error('renderTab', tab, e);
    if(S.tab===tab && document.getElementById('tabcontent')) el.innerHTML = `<div class="card"><h2>Cet onglet n\\u2019a pas pu s\\u2019afficher</h2><p class="note">${esc(String(e && e.message || e))}</p><button class="btn btn-secondary btn-sm" onclick="renderTab()">Réessayer</button></div>`;
  }
}
''')

# ---------- Plus : regroupé ----------
replace_fn('renderPlusTab', '''function renderPlusTab(){
  const el=document.getElementById('hometabcontent');
  const groups=[
    ['Préparer les entraînements', [['bibcycles','Cycles','Modèles à attribuer'],['bibmouvements','Mouvements','Bibliothèque et fiches']]],
    ['Pour les clients', [['lecons','Enseignements','Dossiers, leçons, vidéos'],['aliments','Aliments et recettes',''],['challenges','Challenges',''],['niveaux','Niveaux','Paliers et récompenses']]],
    ['Gestion', [['compta','Compta','Paiements, mois, sauvegarde'],['diet','Calcul diététique','Outil libre'],['site','Mon site','Page d\\u2019accueil, contact'],['securite','Sécurité','Codes d\\u2019accès'],['affichage','Affichage','Clair / sombre']]]
  ];
  el.innerHTML = `
    <div class="page-head"><h1>Plus</h1></div>
    ${groups.map(([title,items])=>`<div class="section-head"><h2>${title}</h2></div><div class="tiles">${items.map(([k,t,sub])=>`<button class="tile-btn" onclick="switchHomeTab('${k}')"><span class="t">${t}</span>${sub?`<span class="s">${sub}</span>`:''}</button>`).join('')}</div>`).join('')}
    <div class="menu" style="margin-top:6px"><div class="item" onclick="showLanding()"><span class="body"><span class="title">Voir le site public</span></span>${ICONS.chev}</div><div class="item" onclick="logout()"><span class="body"><span class="title">Se déconnecter</span></span>${ICONS.chev}</div></div>`;
}
''')
p.write_text(s, encoding='utf-8')

c = root / 'style.css'; t = c.read_text(encoding='utf-8')
t += '''
/* ---------- Formulaires agréables ---------- */
.scale{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin-top:6px;}
.scale.ten{grid-template-columns:repeat(5,minmax(0,1fr));}
.scale button{height:44px;border:1px solid var(--border);border-radius:10px;background:var(--card);font-weight:700;font-size:15px;cursor:pointer;color:var(--text);}
.scale button.active{background:var(--orange);border-color:var(--orange);color:#fff;}
.scale-ends{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:4px;}
.yesno{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px;}
.yesno button{height:44px;border:1px solid var(--border);border-radius:10px;background:var(--card);font-weight:700;cursor:pointer;color:var(--text);}
.yesno button.active{background:var(--text);border-color:var(--text);color:var(--card);}
.wiz-head .bar{margin-top:6px;}
.wiz label{margin-top:16px;}
.wiz-fields label:first-child{margin-top:4px;}
.dl{display:grid;grid-template-columns:1fr;gap:0;margin:0;}
.dl > div{display:grid;grid-template-columns:minmax(120px,38%) 1fr;gap:12px;padding:9px 0;border-bottom:1px solid var(--border-soft);}
.dl > div:last-child{border-bottom:none;}
.dl dt{font-size:13px;color:var(--muted);font-weight:600;}
.dl dd{margin:0;font-size:14px;white-space:pre-wrap;}
details.fold > summary .btn{margin-left:0;}
/* ---------- Plus : tuiles ---------- */
.tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:18px;}
.tile-btn{display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:14px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);text-align:left;cursor:pointer;min-height:68px;}
.tile-btn .t{font-size:15px;font-weight:700;}
.tile-btn .s{font-size:12px;color:var(--muted);}
@media (min-width:900px){ .tiles{grid-template-columns:repeat(3,minmax(0,1fr));} }
'''
c.write_text(t, encoding='utf-8')
print('OK v7')
