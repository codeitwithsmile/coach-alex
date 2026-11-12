#!/usr/bin/env python3
"""v4 : nouvelle structure (coque à 4 onglets côté coach et côté client) selon les maquettes validées.
Remplace les fonctions de navigation/écrans d'ensemble, conserve tous les modules métier."""
import pathlib, re, sys
p = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'split' / 'app.js'
s = p.read_text(encoding='utf-8')

def find_fn(name):
    m = re.search(r'^(async )?function ' + re.escape(name) + r'\(', s, re.M)
    if not m: sys.exit('fonction introuvable : ' + name)
    start = m.start()
    nxt = re.compile(r'^(async function |function |const |let |// ---)', re.M)
    m2 = nxt.search(s, m.end())
    end = m2.start() if m2 else len(s)
    return start, end

def replace_fn(name, new):
    global s
    a, b = find_fn(name)
    s = s[:a] + new.rstrip('\n') + '\n' + s[b:]

def delete_fn(name): replace_fn(name, '')

def rep(old, new, count=1):
    global s
    c = s.count(old)
    if c != count: sys.exit(f'ERREUR: {c} occurrence(s) (attendu {count}) pour:\n{old[:150]}')
    s = s.replace(old, new)

# ---------- État ----------
rep("let S={view:'landing',clients:[],currentId:null,tab:'profil',homeTab:'dashboard',",
    "let S={view:'landing',clients:[],currentId:null,tab:'suivi',homeTab:'journee',planDay:null,clientsSearch:'',clientsFilter:'all',clientTab:'accueil',")

# ---------- Icônes ----------
rep('''// ---------- ÉCHAPPEMENT HTML ----------''', '''const ICONS = {
  journee:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  planning:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  clients:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z"/></svg>',
  training:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h12M6 8v8M18 8v8M3 10v4M21 10v4"/></svg>',
  food:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M17 3c-2 0-3 3-3 6v3h3v9"/></svg>',
  chev:'<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  prev:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  next:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>'
};
function initials(c){ return ((c.prenom||'')[0]||'')+((c.nom||'')[0]||''); }
const DAYSHORT=['dim.','lun.','mar.','mer.','jeu.','ven.','sam.'];
const DAYLONG=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
function fmtDayLong(ds){ const d=new Date(ds+'T00:00:00'); return DAYLONG[d.getDay()]+' '+d.getDate(); }
function fmtDayShort(ds){ const d=new Date(ds+'T00:00:00'); return DAYSHORT[d.getDay()]+' '+d.getDate(); }
function fmtMonthYear(ds){ const [y,m]=ds.split('-'); return MONTHNAMES[parseInt(m,10)-1]+' '+y; }
function dureeLabel(formule){ return formule==='express'?'1 h':'2 h'; }
function formuleLabel(formule){ return formule==='express'?'Express':'Classique'; }

// ---------- ÉCHAPPEMENT HTML ----------''')

# ---------- Coque coach ----------
replace_fn('render', '''async function render(){
  const app=document.getElementById('app');
  const current = S.clients.find(c=>c.id===S.currentId);
  const pendingCount = await countPending();
  const plusTabs = ['plus','bibmouvements','bibcycles','aliments','lecons','challenges','niveaux','diet','compta'];
  const act = current ? 'clients' : (plusTabs.includes(S.homeTab) ? 'plus' : S.homeTab);
  app.innerHTML = `
  <div class="shell">
    <nav class="tabbar" aria-label="Navigation principale">
      <div class="brandmini"><img src="${LOGO_SRC}" alt="">Gestion Client</div>
      <a class="${act==='journee'?'active':''}" onclick="switchHomeTab('journee')">${ICONS.journee}Journée${pendingCount>0?`<span class="count">${pendingCount}</span>`:''}</a>
      <a class="${act==='planning'?'active':''}" onclick="switchHomeTab('planning')">${ICONS.planning}Planning</a>
      <a class="${act==='clients'?'active':''}" onclick="switchHomeTab('clients')">${ICONS.clients}Clients</a>
      <a class="${act==='plus'?'active':''}" onclick="switchHomeTab('plus')">${ICONS.plus}Plus</a>
    </nav>
    <main class="main" id="main"></main>
  </div>`;
  if(current) renderClientPage(current); else renderHomeArea();
}
async function countPending(){
  const [allBilans, allDemandes, allRdv, allResil, allLogs, allAttrs] = await Promise.all([loadAllBilans(), loadAllDemandes(), loadAllDemandesRdv(), loadAllDemandesResiliation(), loadAllEntrainementLogs(), loadAllAttributions()]);
  return allBilans.filter(b=>!b.valide).length + allDemandes.filter(d=>d.statut==='attente').length + allRdv.filter(d=>d.statut==='attente').length
    + allResil.filter(d=>d.statut==='attente').length + allLogs.filter(l=>!l.vu).length + allAttrs.filter(attrNeedsValidation).length;
}
''')
replace_fn('renderHomeArea', '''function renderHomeArea(){
  const main=document.getElementById('main');
  const t = S.homeTab;
  const sub = {bibmouvements:'Mouvements', bibcycles:'Cycles', aliments:'Aliments et recettes', lecons:'Mes enseignements', challenges:'Challenges', niveaux:'Niveaux', diet:'Calcul diététique', compta:'Compta'};
  if(sub[t]){
    main.innerHTML = `<a class="backlink" onclick="switchHomeTab('plus')">${ICONS.back}Plus</a><h1>${sub[t]}</h1><div id="hometabcontent"></div>`;
    if(t==='diet') renderDietTool();
    else if(t==='bibmouvements') renderBibMouvementsTab();
    else if(t==='bibcycles') renderBibCyclesTab();
    else if(t==='aliments') renderAlimentsTab();
    else if(t==='lecons') renderLeconsTab();
    else if(t==='challenges') renderChallengesTab();
    else if(t==='niveaux') renderNiveauxTab();
    else if(t==='compta') renderCompta();
    return;
  }
  main.innerHTML = '<div id="hometabcontent"></div>';
  if(t==='planning') renderPlanningTab();
  else if(t==='clients') renderClientsTab();
  else if(t==='plus') renderPlusTab();
  else renderJournee();
}
''')
replace_fn('switchHomeTab', '''function switchHomeTab(t){ S.homeTab=t; S.currentId=null; S.leconsPath=[]; S.cycleBuilder=null; render(); }
''')
replace_fn('goHome', '''function goHome(){ S.currentId=null; S.homeTab='journee'; render(); }
''')
replace_fn('selectClient', '''function selectClient(id, tab){
  S.currentId=id; S.tab=tab||'suivi';
  loadClientData(id).then(render);
}
''')
rep("function changeHomeWeek(delta){ S.weekOffset+=delta; if(S.homeTab==='planning') renderPlanningTab(); else renderHome(); }",
    "function changeHomeWeek(delta){ S.weekOffset+=delta; S.planDay=null; renderPlanningTab(); }\nfunction selectPlanDay(ds){ S.planDay=ds; renderPlanningTab(); }")

# L'ancien tableau de bord devient « Compta » (dans Plus)
a,b = find_fn('renderHome')
s = s[:a] + s[a:b].replace('async function renderHome(){', 'async function renderCompta(){', 1) + s[b:]

# ---------- Journée ----------
rep('''// ---- HOME ----''', '''// ---- JOURNÉE ----
function seanceRowHtml(p, cl, opts){
  opts = opts||{};
  const tile = p.statut==='faite' ? 'green' : (opts.tile||'');
  let state='';
  if(p.statut==='faite') state = p.paiement ? '<span class="badge ok">Fait</span>' : '<span class="badge warn">À encaisser</span>';
  else if(p.statut==='prevue' && opts.needsValidation) state = '<span class="badge warn">À préparer</span>';
  else if(p.statut==='prevue' && p.entrainementNom) state = '<span class="badge lock">Prévue</span>';
  const sub = [formuleLabel(p.formule), opts.lieu, p.entrainementNom].filter(Boolean).join(' · ');
  return `<div class="row ${opts.now?'now':''}" onclick="selectClient('${p.clientId}','seance')">
    <span class="tile ${tile}"><b>${p.heure||'—'}</b><small>${dureeLabel(p.formule)}</small></span>
    <span class="body"><span class="title">${cl?clientName(cl):'?'}</span><span class="sub">${sub}</span></span>
    <span class="side">${state}</span>
  </div>`;
}
function demandeRowHtml(dm, cl){
  return `<div class="row request">
    <span class="tile blue"><b>${dm.heureDebut}</b><small>${dureeLabel(dm.formule)}</small></span>
    <span class="body"><span class="title">${cl?clientName(cl):'?'}</span><span class="sub">${formuleLabel(dm.formule)} · ${fmtDate(dm.date)} · demande de séance</span></span>
    <span class="side"><span class="badge plan">Demande</span></span>
    <span class="actions"><button class="btn btn-secondary" onclick="refuserDemande('${dm.id}')">Refuser</button><button class="btn btn-primary" onclick="accepterDemande('${dm.id}')">Accepter</button></span>
  </div>`;
}
async function renderJournee(){
  const el=document.getElementById('hometabcontent');
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const [allProg, allBilans, allDemandes, allRdv, allResil, allLogs, allAttrs, allSuivis, allConfigs, allIndispos] = await Promise.all([
    loadAllProgrammes(), loadAllBilans(), loadAllDemandes(), loadAllDemandesRdv(), loadAllDemandesResiliation(), loadAllEntrainementLogs(), loadAllAttributions(), loadAllSuivis(), loadAllSuiviConfigs(), loadAllIndispos()]);
  if(S.homeTab!=='journee' || !document.getElementById('hometabcontent')) return;
  for(const cfg of allConfigs){ if(S.clients.some(c=>c.id===cfg.id)) await syncSuiviDocs(cfg.id, cfg, allProg.filter(p=>p.clientId===cfg.id), allSuivis); }
  const today = todayStr();
  const bilanMap={}; allBilans.forEach(b=>{ bilanMap[b.id]=b; });
  const clOf = id => S.clients.find(c=>c.id===id);
  const needAttr = {}; allAttrs.filter(attrNeedsValidation).forEach(a=>{ needAttr[a.clientId]=a; });
  const todays = allProg.filter(p=>p.type==='avec' && p.date===today && p.statut!=='annulee').sort((a,b)=>(a.heure||'').localeCompare(b.heure||''));
  const nowMin = (()=>{ const d=new Date(); return d.getHours()*60+d.getMinutes(); })();
  const nextIdx = todays.findIndex(p=>p.statut==='prevue' && timeToMin(p.heure)+seanceDureeMin(p.formule) >= nowMin);
  const dow = new Date(today+'T00:00:00').getDay();
  const indToday = allIndispos.filter(i=>(i.type==='ponctuelle'&&i.date===today)||(i.type==='recurrente'&&Number(i.jourSemaine)===dow));

  // À faire
  const todo=[];
  allBilans.filter(b=>!b.valide).forEach(b=>{ const cl=clOf(b.id); if(cl) todo.push({dot:'blue', title:'Valider le bilan de '+cl.prenom, sub:'Inscription à vérifier', onclick:`selectClient('${b.id}','bilan')`}); });
  allRdv.filter(r=>r.statut==='attente').forEach(r=>{ const cl=clOf(r.clientId); todo.push({dot:'blue', title:(cl?cl.prenom:'?')+' demande un premier rendez-vous', sub:(r.type==='reel'?'En personne':'Par téléphone')+(r.disponibilites?' · '+r.disponibilites:'')+(cl&&cl.telephone?' · '+cl.telephone:''), action:`<button class="btn btn-secondary btn-sm" onclick="traiterRdv('${r.id}')">Traité</button>`}); });
  allResil.filter(r=>r.statut==='attente').forEach(r=>{ const cl=clOf(r.clientId); todo.push({dot:'blue', title:(cl?cl.prenom:'?')+(r.type==='pause'?' demande une pause':' veut résilier'), sub:'À rappeler'+(r.disponibilites?' : '+r.disponibilites:'')+(cl&&cl.telephone?' · '+cl.telephone:''), action:`<button class="btn btn-secondary btn-sm" onclick="traiterResiliation('${r.id}')">Traité</button>`}); });
  const demandes = allDemandes.filter(d=>d.statut==='attente').sort((a,b)=>a.date.localeCompare(b.date));
  allLogs.filter(l=>!l.vu).sort((a,b)=>b.date.localeCompare(a.date)).forEach(l=>{ const cl=clOf(l.clientId); todo.push({dot:'green', title:(cl?cl.prenom:'?')+' a fait « '+l.entrainementNom+' »', sub:fmtDayShort(l.date)+' · '+l.resultats.map(r=>r.nom.split(' ')[0]+' '+(typeof r.repsMin==='number'?r.repsMin:'—')).join(' · ')+(l.resultats.some(r=>r.commentaire)?' · « '+l.resultats.filter(r=>r.commentaire).map(r=>r.commentaire).join(' / ')+' »':''), action:`<button class="btn btn-secondary btn-sm" onclick="marquerLogVu('${l.id}')">Vu</button>`}); });
  Object.values(needAttr).forEach(a=>{ const cl=clOf(a.clientId); if(cl) todo.push({dot:'orange', title:'Vérifier les charges de '+cl.prenom, sub:a.entrainements[a.currentEntrainementIndex].nom+' · prochain entraînement', onclick:`selectClient('${a.clientId}','entrainement')`}); });
  S.clients.forEach(c=>{ const u=unpaidForClient(c.id, allProg, allSuivis); const tot=u.retard.reduce((x,i)=>x+i.montant,0); if(tot>0) todo.push({dot:'orange', title:euro(tot)+' à encaisser · '+c.prenom, sub:u.retard.map(i=>i.label).join(' + '), onclick:`selectClient('${c.id}','suivi')`}); });

  const curKey = monthKey(today); const st = statsForMonth(curKey, allProg, allSuivis);
  const upcoming = allProg.filter(p=>p.type==='avec' && p.statut==='prevue' && p.date>=today).length;
  const d = new Date();
  el.innerHTML = `
    <div class="page-head"><div><span class="kicker">${DAYLONG[d.getDay()]} ${d.getDate()} ${MONTHNAMES[d.getMonth()].toLowerCase()}</span><h1>Ma journée</h1></div><span class="avatar" aria-hidden="true">A</span></div>
    <section class="section">
      <div class="section-head"><h2>${todays.length? (todays.length+' séance'+(todays.length>1?'s':'')+' aujourd\\u2019hui') : 'Aucune séance aujourd\\u2019hui'}</h2><button class="link" onclick="switchHomeTab('planning')">Planning</button></div>
      ${todays.map((p,i)=>seanceRowHtml(p, clOf(p.clientId), {now:i===nextIdx, tile:i===nextIdx?'orange':'', needsValidation:!!(p.attributionId && needAttr[p.clientId]), lieu:(bilanMap[p.clientId]||{}).adresseCoaching})).join('')}
      ${indToday.map(i=>`<div class="row-muted"><span class="t">${i.heureDebut}</span><span>${i.motif||'Indisponible'} jusqu\\u2019à ${i.heureFin}</span></div>`).join('')}
    </section>
    ${demandes.length? `<section class="section"><div class="section-head"><h2>Demandes de séance</h2></div>${demandes.map(dm=>demandeRowHtml(dm, clOf(dm.clientId))).join('')}</section>`:''}
    <section class="section">
      <div class="section-head"><h2>À faire</h2></div>
      ${todo.length? `<div class="list">${todo.map(t=>`<div class="item ${t.onclick?'':'static'}" ${t.onclick?`onclick="${t.onclick}"`:''}><span class="dot ${t.dot}"></span><span class="body"><span class="title">${t.title}</span><span class="sub">${t.sub}</span></span>${t.action?`<span class="side">${t.action}</span>`:ICONS.chev}</div>`).join('')}</div>` : '<div class="card"><div class="empty">Rien à traiter. Belle journée.</div></div>'}
    </section>
    <section class="section" style="display:flex;justify-content:space-between;align-items:center;padding:0 2px">
      <span class="note">${monthLabel(curKey)} : <b style="color:var(--text)">${euro(st.total)}</b> encaissés · ${upcoming} séance${upcoming>1?'s':''} à venir</span>
      <button class="link" onclick="switchHomeTab('compta')">Compta</button>
    </section>`;
}

// ---- COMPTA (ancien tableau de bord) ----''')

# ---------- Planning ----------
replace_fn('renderPlanningTab', '''async function renderPlanningTab(){
  const el=document.getElementById('hometabcontent');
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const [allProg, allEvo, allIndispos, allBilans, allDemandes, allAttrs] = await Promise.all([loadAllProgrammes(), loadAllEvolutions(), loadAllIndispos(), loadAllBilans(), loadAllDemandes(), loadAllAttributions()]);
  if(S.homeTab!=='planning' || !document.getElementById('hometabcontent')) return;
  S.indisposCache = allIndispos;
  const bilanMap = {}; allBilans.forEach(b=>{ bilanMap[b.id]=b; });
  const needAttr = {}; allAttrs.filter(attrNeedsValidation).forEach(a=>{ needAttr[a.clientId]=a; });
  const clOf = id => S.clients.find(c=>c.id===id);
  const today = todayStr();
  const weekStart = startOfWeek(S.weekOffset);
  const days = [...Array(7)].map((_,i)=>isoDate(addDays(weekStart,i)));
  const pending = allDemandes.filter(d=>d.statut==='attente');
  const dayHas = ds => allProg.some(p=>p.type==='avec' && p.date===ds && p.statut!=='annulee');
  const dayReq = ds => pending.some(d=>d.date===ds);
  const sel = S.planDay && days.includes(S.planDay) ? S.planDay : null;
  const shown = sel ? [sel] : days;
  const sections = shown.map(ds=>{
    const dow = new Date(ds+'T00:00:00').getDay();
    const sessions = allProg.filter(p=>p.type==='avec' && p.date===ds && p.statut!=='annulee').sort((a,b)=>(a.heure||'').localeCompare(b.heure||''));
    const reqs = pending.filter(d=>d.date===ds);
    const evos = allEvo.filter(e=>e.date===ds);
    const ind = allIndispos.filter(i=>(i.type==='ponctuelle'&&i.date===ds)||(i.type==='recurrente'&&Number(i.jourSemaine)===dow));
    if(!sessions.length && !reqs.length && !evos.length && !sel) return '';
    const entries = [
      ...sessions.map(p=>({t:p.heure||'', h:seanceRowHtml(p, clOf(p.clientId), {now:ds===today && p.statut==='prevue', tile:(ds===today && p.statut==='prevue')?'orange':'', needsValidation:!!(p.attributionId && needAttr[p.clientId]), lieu:(bilanMap[p.clientId]||{}).adresseCoaching})})),
      ...reqs.map(dm=>({t:dm.heureDebut, h:demandeRowHtml(dm, clOf(dm.clientId))})),
      ...ind.map(i=>({t:i.heureDebut, h:`<div class="row-muted"><span class="t">${i.heureDebut}</span><span>${i.motif||'Indisponible'} jusqu\\u2019à ${i.heureFin}</span></div>`})),
      ...evos.map(e=>{ const cl=clOf(e.clientId); return {t:'00:00', h:`<div class="row-muted"><span class="t">—</span><span>Pesée programmée · ${cl?clientName(cl):'?'}</span></div>`}; })
    ].sort((a,b)=>a.t.localeCompare(b.t));
    return `<section class="section"><div class="section-head"><h2>${ds===today?'Aujourd\\u2019hui <span style="font-weight:500;color:var(--muted)">· '+fmtDayLong(ds).toLowerCase()+'</span>':fmtDayLong(ds)}</h2></div>${entries.length? entries.map(e=>e.h).join('') : '<div class="card"><div class="empty">Rien de prévu</div></div>'}</section>`;
  }).join('');
  const recurrents = allIndispos.filter(i=>i.type==='recurrente').map(i=>JOURS_FULL[Number(i.jourSemaine)]+' '+i.heureDebut+'–'+i.heureFin+(i.motif?' ('+i.motif+')':''));
  const ponct = allIndispos.filter(i=>i.type==='ponctuelle' && i.date>=today).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,2).map(i=>(i.motif||'Indisponible')+' le '+fmtDate(i.date));
  el.innerHTML = `
    <div class="page-head"><div><span class="kicker">${fmtMonthYear(days[0])}</span><h1>Planning</h1></div><div class="actions"><button class="btn btn-primary btn-sm" onclick="openNewSeanceChooser()">Nouvelle séance</button></div></div>
    <div class="weekcal">
      <div class="nav"><button aria-label="Semaine précédente" onclick="changeHomeWeek(-1)">${ICONS.prev}</button><span>Semaine du ${new Date(days[0]+'T00:00:00').getDate()} au ${new Date(days[6]+'T00:00:00').getDate()}</span><button aria-label="Semaine suivante" onclick="changeHomeWeek(1)">${ICONS.next}</button></div>
      <div class="days">${days.map(ds=>{ const d=new Date(ds+'T00:00:00'); return `<button class="day ${sel===ds?'sel':''} ${ds===today?'today':''}" onclick="selectPlanDay('${sel===ds?'':ds}')"><small>${DAYSHORT[d.getDay()][0].toUpperCase()}</small><span class="n">${d.getDate()}</span><span class="m ${dayReq(ds)?'req':(dayHas(ds)?'on':'')}"></span></button>`; }).join('')}</div>
    </div>
    ${sections || '<div class="card"><div class="empty">Aucune séance cette semaine.</div></div>'}
    <div class="section" style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:0 2px">
      <span class="note">${[...recurrents, ...ponct].join(' · ') || 'Aucune indisponibilité enregistrée'}</span>
      <button class="link" style="white-space:nowrap" onclick="openIndisposModal()">Indisponibilités</button>
    </div>`;
}
const JOURS_FULL=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
function openNewSeanceChooser(){
  if(!S.clients.length){ toast('Créez d\\u2019abord un client'); return; }
  openModal(`<h3>Nouvelle séance</h3><label>Pour quel client ?</label><select id="ns-client">${S.clients.map(c=>`<option value="${c.id}">${clientName(c)}</option>`).join('')}</select>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="closeModal();selectClient(val('ns-client'),'seance')">Continuer</button></div>`);
}
function openIndisposModal(){
  const all = S.indisposCache||[];
  openModal(`<h3>Indisponibilités</h3>
    ${all.length? all.map(i=>`<div class="seance-row"><span>${i.type==='ponctuelle'?fmtDate(i.date):JOURS_FULL[Number(i.jourSemaine)]+' (chaque semaine)'} · ${i.heureDebut}–${i.heureFin}${i.motif?' · '+i.motif:''}</span><button class="btn btn-danger btn-sm" onclick="closeModal();askDelete('deleteIndispo','${i.id}','Supprimer cette indisponibilité ?')">Supprimer</button></div>`).join('') : '<div class="empty">Aucune indisponibilité enregistrée</div>'}
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Fermer</button><button class="btn btn-primary" onclick="openAddIndispo()">Ajouter</button></div>`);
}
''')

# ---------- Clients ----------
rep('''// ---- NEW CLIENT MODAL ----''', '''// ---- CLIENTS ----
async function renderClientsTab(){
  const el=document.getElementById('hometabcontent');
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const [allBilans, allProg, allSuivis, allConfigs, allEvo] = await Promise.all([loadAllBilans(), loadAllProgrammes(), loadAllSuivis(), loadAllSuiviConfigs(), loadAllEvolutions()]);
  if(S.homeTab!=='clients' || !document.getElementById('hometabcontent')) return;
  const bilanMap={}; allBilans.forEach(b=>{ bilanMap[b.id]=b; });
  const today=todayStr();
  const q = (S.clientsSearch||'').toLowerCase();
  const activeIds = new Set(allConfigs.filter(cfg=>(cfg.segments||[]).some(sg=>!sg.end)).map(cfg=>cfg.id));
  const list = S.clients.filter(c=>{
    if(q && !clientName(c).toLowerCase().includes(q)) return false;
    if(S.clientsFilter==='avalider') return bilanMap[c.id] && bilanMap[c.id].valide===false;
    if(S.clientsFilter==='suivi') return activeIds.has(c.id);
    return true;
  });
  const nbAV = S.clients.filter(c=>bilanMap[c.id] && bilanMap[c.id].valide===false).length;
  el.innerHTML = `
    <div class="page-head"><h1>Clients</h1><div class="actions"><button class="btn btn-primary btn-sm" onclick="openNewClientModal()">Nouveau client</button></div></div>
    <label style="margin:0 0 10px"><span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Rechercher un client</span><input type="search" id="cl-search" placeholder="Rechercher" value="${S.clientsSearch||''}" oninput="S.clientsSearch=this.value;renderClientsList()" style="margin:0"></label>
    <div class="chips">
      <button class="chip ${S.clientsFilter==='all'?'active':''}" onclick="S.clientsFilter='all';renderClientsTab()">Tous · ${S.clients.length}</button>
      <button class="chip ${S.clientsFilter==='avalider'?'active':''}" onclick="S.clientsFilter='avalider';renderClientsTab()">À valider · ${nbAV}</button>
      <button class="chip ${S.clientsFilter==='suivi'?'active':''}" onclick="S.clientsFilter='suivi';renderClientsTab()">Suivi actif · ${activeIds.size}</button>
    </div>
    <div id="clients-list"></div>
    <section class="section">
      <div class="section-head"><h2>Inscrire un nouveau client</h2></div>
      <div class="card">
        <p class="note">Vous remplissez le bilan avec le client, ou vous lui tendez le téléphone : il répond seul au questionnaire et vous validez ensuite.</p>
        <div class="modalbtns" style="justify-content:stretch"><button class="btn btn-secondary" style="flex:1" onclick="openNewClientModal()">Je remplis</button><button class="btn btn-secondary" style="flex:1" onclick="showClientSpace();startClientQuestionnaire()">Le client remplit</button></div>
      </div>
    </section>`;
  S.clientsCtx = {bilanMap, allProg, allSuivis, allEvo, activeIds};
  renderClientsList();
}
function renderClientsList(){
  const box=document.getElementById('clients-list'); if(!box || !S.clientsCtx) return;
  const {bilanMap, allProg, allSuivis, allEvo, activeIds} = S.clientsCtx;
  const q=(S.clientsSearch||'').toLowerCase(); const today=todayStr();
  const list = S.clients.filter(c=>{
    if(q && !clientName(c).toLowerCase().includes(q)) return false;
    if(S.clientsFilter==='avalider') return bilanMap[c.id] && bilanMap[c.id].valide===false;
    if(S.clientsFilter==='suivi') return activeIds.has(c.id);
    return true;
  });
  box.innerHTML = list.length? `<div class="list">${list.map(c=>{
    const b=bilanMap[c.id]||{}; const pending=b.valide===false;
    const evos=allEvo.filter(e=>e.clientId===c.id && e.date<=today && parseFloat(e.poids)>0).sort((a,b2)=>b2.date.localeCompare(a.date));
    const poids = evos.length? parseFloat(evos[0].poids) : parseFloat(b.poids);
    const delta = (evos.length && parseFloat(b.poids)>0) ? (poids-parseFloat(b.poids)) : null;
    const next = allProg.filter(p=>p.clientId===c.id && p.type==='avec' && p.statut==='prevue' && p.date>=today).sort((a,b2)=>(a.date+a.heure).localeCompare(b2.date+b2.heure))[0];
    const due = unpaidForClient(c.id, allProg, allSuivis).retard.reduce((x,i)=>x+i.montant,0);
    const l2 = [c.objectif, poids>0? poids+' kg'+(delta!==null?' ('+(delta>0?'+':'')+delta.toFixed(1).replace('.',',')+')':'') : null].filter(Boolean).join(' · ');
    const l3 = next ? ('Prochaine séance '+(next.date===today?'aujourd\\u2019hui':fmtDayShort(next.date))+' '+next.heure) : (pending?'Inscrit le '+fmtDate(c.dateCreation):'Aucune séance prévue');
    return `<div class="item" onclick="selectClient('${c.id}')"><span class="avatar ${pending?'blue':''}" aria-hidden="true">${initials(c)}</span>
      <span class="body"><span class="title" style="font-size:15px">${clientName(c)}</span>${l2?`<span class="sub" style="font-size:13px">${l2}</span>`:''}<span class="sub">${l3}</span></span>
      <span class="side">${pending?'<span class="badge plan">Bilan à valider</span>':(due>0?`<span class="badge warn">${euro(due)} dus</span>`:'')}</span></div>`;
  }).join('')}</div>` : '<div class="card"><div class="empty">Aucun client ne correspond.</div></div>';
}

// ---- PLUS ----
function renderPlusTab(){
  const el=document.getElementById('hometabcontent');
  const items=[
    ['bibcycles','Cycles d\\u2019entraînement','Modèles de cycles à attribuer aux clients'],
    ['bibmouvements','Mouvements','Bibliothèque et fiches d\\u2019exécution'],
    ['aliments','Aliments et recettes','Bibliothèque partagée avec les clients'],
    ['lecons','Mes enseignements','Dossiers, leçons, vidéos'],
    ['challenges','Challenges','Lancer et suivre les challenges'],
    ['niveaux','Niveaux','Paliers, leçons requises, récompenses'],
    ['diet','Calcul diététique','Outil libre, sans client'],
    ['compta','Compta','Paiements, récapitulatif par mois, sauvegarde']
  ];
  el.innerHTML = `
    <div class="page-head"><h1>Plus</h1></div>
    <div class="menu">${items.map(([k,t,sub])=>`<div class="item" onclick="switchHomeTab('${k}')"><span class="body"><span class="title">${t}</span><span class="sub">${sub}</span></span>${ICONS.chev}</div>`).join('')}</div>
    <div class="menu"><div class="item" onclick="showLanding()"><span class="body"><span class="title">Quitter l\\u2019espace coach</span></span>${ICONS.chev}</div></div>`;
}

// ---- NEW CLIENT MODAL ----''')

# ---------- Fiche client ----------
replace_fn('renderClientPage', '''function renderClientPage(c){
  const main=document.getElementById('main');
  const tabs=[['suivi','Suivi'],['entrainement','Entraînement'],['planningAlim','Alimentation'],['seance','Séances'],['bilan','Bilan']];
  const b=S.bilan||{};
  const age = b.dateNaissance ? ageFromBirthdate(b.dateNaissance)+' ans' : null;
  const since = c.dateCreation ? 'client depuis '+fmtMonthYear(c.dateCreation).toLowerCase() : null;
  main.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin:38px 0 10px" class="clienthead-top"><a class="backlink" style="margin:0" onclick="switchHomeTab('clients')">${ICONS.back}Clients</a><button class="btn btn-secondary btn-sm" onclick="openClientActions()">Actions</button></div>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
      <span class="avatar lg ${b.valide===false?'blue':''}" aria-hidden="true">${initials(c)}</span>
      <div style="display:flex;flex-direction:column;gap:2px;min-width:0"><h1 style="margin:0;font-size:24px">${clientName(c)}</h1><span class="note">${[age, c.objectif, since].filter(Boolean).join(' · ')}</span></div>
    </div>
    ${b.valide===false?`<div class="badge plan" style="display:block;margin-bottom:12px;padding:10px"><span>Ce client s\\u2019est inscrit lui-même : vérifiez son bilan puis validez-le pour lui ouvrir l\\u2019espace client.</span><button class="btn btn-primary btn-sm" onclick="validateBilan()">Valider le bilan</button></div>`:''}
    <div class="tabs">${tabs.map(t=>`<div class="tab ${S.tab===t[0]?'active':''}" onclick="switchTab('${t[0]}')">${t[1]}</div>`).join('')}</div>
    <div id="tabcontent"></div>
  `;
  renderTab();
}
function openClientActions(){
  const c = S.clients.find(x=>x.id===S.currentId);
  openModal(`<h3>${clientName(c)}</h3>
    <div class="menu" style="margin:0">
      ${c.telephone?`<div class="item static"><span class="body"><span class="title">${c.telephone}</span><span class="sub">Téléphone</span></span></div>`:''}
      ${c.email?`<div class="item static"><span class="body"><span class="title">${c.email}</span><span class="sub">Email</span></span></div>`:''}
      <div class="item" onclick="closeModal();switchTab('seance')"><span class="body"><span class="title">Planifier une séance</span></span>${ICONS.chev}</div>
      <div class="item" onclick="closeModal();openEvoModal()"><span class="body"><span class="title">Nouvelle pesée</span></span>${ICONS.chev}</div>
    </div>
    <div class="modalbtns"><button class="btn btn-danger" onclick="closeModal();confirmDeleteClient()">Supprimer le client</button><button class="btn btn-secondary" onclick="closeModal()">Fermer</button></div>`);
}
''')
replace_fn('renderTab', '''async function renderTab(){
  const c = S.clients.find(x=>x.id===S.currentId);
  const el = document.getElementById('tabcontent');
  if(!el || !c) return;
  if(S.tab==='bilan') return renderBilan(el,c);
  if(S.tab==='seance') return renderSeance(el,c);
  if(S.tab==='entrainement') return renderEntrainement(el,c);
  if(S.tab==='planningAlim') return renderPlanningAlimentaire(el,c);
  return renderClientSuivi(el,c);
}
function weightSummary(){
  const bilan=S.bilan||{}; const today=todayStr();
  const past = (S.evolutions||[]).filter(e=>e.date<=today && parseFloat(e.poids)>0).sort((a,b)=>b.date.localeCompare(a.date));
  const start = parseFloat(bilan.poids)||null;
  const current = past.length? parseFloat(past[0].poids) : start;
  const currentDate = past.length? past[0].date : bilan.date;
  const points=[]; if(start) points.push({date:bilan.date, poids:start});
  (S.evolutions||[]).forEach(ev=>{ if(parseFloat(ev.poids)>0) points.push({date:ev.date, poids:parseFloat(ev.poids)}); });
  points.sort((a,b)=>a.date.localeCompare(b.date));
  return {start, current, currentDate, delta:(start&&current)?current-start:null, points, latest:past[0]||null, future:(S.evolutions||[]).filter(e=>e.date>today)};
}
async function renderClientSuivi(el,c){
  await ensurePeriodDocs(c.id);
  const unpaid = unpaidForClient(c.id, S.programmes, S.suivis);
  const w = weightSummary();
  const bilan=S.bilan||{};
  const d = currentDietSource();
  const typePlan = bilan.typePlan;
  const kcalField = typePlan ? TYPE_PLAN_KCAL_FIELD[typePlan] : null;
  const kcal = kcalField ? (parseFloat(d[kcalField])||0) : null;
  const mes = w.latest ? w.latest.mesures : bilan.mesures;
  const mesTxt = [];
  if(bilan.mesures && mes){ if(bilan.mesures.tourTaille && mes.tourTaille) mesTxt.push('taille '+bilan.mesures.tourTaille+' → '+mes.tourTaille+' cm'); if(bilan.mesures.tourHanches && mes.tourHanches) mesTxt.push('hanches '+bilan.mesures.tourHanches+' → '+mes.tourHanches+' cm'); }
  const fmtKg = n => (n%1===0? String(n) : n.toFixed(1).replace('.',',')) ;
  el.innerHTML = `
    <div class="card">
      <h2>Poids et mesures <button class="btn btn-secondary btn-sm" onclick="openEvoModal()">Nouvelle pesée</button></h2>
      ${w.current? `<div style="display:flex;align-items:flex-end;gap:14px;margin-bottom:10px">
        <div style="display:flex;flex-direction:column"><span style="font-size:30px;font-weight:800;letter-spacing:-0.02em;line-height:1">${fmtKg(w.current)} kg</span><span class="note" style="margin-top:4px">${w.currentDate===todayStr()?'aujourd\\u2019hui':'le '+fmtDate(w.currentDate)}</span></div>
        ${w.delta!==null && w.points.length>1? `<div style="display:flex;flex-direction:column;padding-bottom:2px"><span style="font-size:15px;font-weight:700;color:${w.delta<0?'var(--green)':'var(--orange-dark)'}">${w.delta>0?'+':''}${fmtKg(w.delta)} kg</span><span class="note">depuis le bilan du ${fmtDate(bilan.date)}</span></div>`:''}
      </div>` : '<div class="empty">Aucun poids enregistré. Renseignez-le dans le Bilan.</div>'}
      ${w.points.length>1? svgWeightChart(w.points) : ''}
      ${mesTxt.length || w.future.length ? `<p class="note" style="margin-top:8px">${[...mesTxt, ...w.future.map(f=>'prochaine pesée le '+fmtDate(f.date))].join(' · ')}</p>`:''}
    </div>
    <div class="card">
      <h2>Cibles du jour <span class="note" style="margin-left:auto;font-weight:500">${typePlan? TYPE_PLAN_LABELS[typePlan].toLowerCase() : 'aucun plan défini'}</span></h2>
      ${d && d.proteines ? `<div class="grid">
        <div class="stat"><span class="n">${kcal!==null? kcal : '—'}</span><span class="l">kcal${kcal===null?' (choisir un plan)':''}</span></div>
        <div class="stat"><span class="n">${d.proteines} g</span><span class="l">protéines</span></div>
        <div class="stat"><span class="n">${d.lipides} g</span><span class="l">lipides</span></div>
      </div><p class="note" style="margin-top:8px">${d===bilan?'Calculées au bilan':'Recalculées à la pesée du '+fmtDate(d.date)}. <button class="link" onclick="switchTab('planningAlim')">Changer le plan</button></p>` : '<div class="empty">Pas encore de calcul : lancez-le depuis le Bilan.</div>'}
    </div>
    ${(unpaid.retard.length||unpaid.avenir.length)? `<div class="list">${[...unpaid.retard, ...unpaid.avenir].map(u=>`<div class="item static"><span class="body"><span class="title">${u.label}</span><span class="sub">${u.date>todayStr()?'À venir':'À encaisser'} · ${euro(u.montant)}</span></span><span class="side">${u.date>todayStr()?'':(u.type==='seance'?`<button class="btn btn-primary btn-sm" onclick="markSeancePaidById('${u.id}')">Encaisser</button>`:`<button class="btn btn-primary btn-sm" onclick="markSuiviPaid('${u.id}')">Encaisser</button>`)}</span></div>`).join('')}</div>` : '<div class="card"><span class="badge ok">Aucun paiement en attente</span></div>'}
    <div id="suivi-mensuel"></div>
    ${(S.evolutions||[]).length? `<div class="card"><h2>Pesées</h2>${S.evolutions.map(e=>`<div class="seance-row"><span>${fmtDate(e.date)} ${e.date>todayStr()?'<span class="badge plan">Programmée</span>':''} ${e.poids?'— '+e.poids+' kg':''} ${e.mesures&&mesuresStr(e.mesures)!=='—'?'· '+mesuresStr(e.mesures):''} ${e.notes?'· '+e.notes:''}</span><span><button class="btn btn-secondary btn-sm" onclick="openEvoModal('${e.id}')">Modifier</button> <button class="btn btn-danger btn-sm" onclick="confirmDeleteEvo('${e.id}')">Supprimer</button></span></div>`).join('')}</div>`:''}
  `;
  renderSuivi(document.getElementById('suivi-mensuel'), c);
}
async function markSeancePaidById(id){ await markSeancePaid(id); }
''')
delete_fn('renderProfil')
delete_fn('renderEvolution')
# unpaidForClient : exposer l'id
rep("    const item={type:'seance', label:(p.formule==='express'?'Coaching Express':'Coaching Classique')+' du '+fmtDate(p.date)+(p.heure?' à '+p.heure:''), montant:p.tarif, date:p.date, clientId};",
    "    const item={type:'seance', id:p.id, label:(p.formule==='express'?'Coaching Express':'Coaching Classique')+' du '+fmtDate(p.date)+(p.heure?' à '+p.heure:''), montant:p.tarif, date:p.date, clientId};")
rep("    const item={type:'suivi', label:'Suivi mensuel du '+fmtDate(s.periodeDebut)+' au '+fmtDate(s.periodeFin), montant:s.tarif, date:s.periodeDebut, clientId};",
    "    const item={type:'suivi', id:s.id, label:'Suivi mensuel du '+fmtDate(s.periodeDebut)+' au '+fmtDate(s.periodeFin), montant:s.tarif, date:s.periodeDebut, clientId};")
# Courbe : hauteur réduite
rep("  const w=600,h=200,pad=36;", "  const w=600,h=150,pad=28;")

# ---------- Suivi mensuel : titre + wording ----------
rep('''    el.innerHTML = `<div class="card"><h2>Suivi mensuel</h2>
      <label>Date de début du suivi</label><input type="date" id="sv-debut" value="${todayStr()}">
      <div class="modalbtns"><button class="btn btn-primary" onclick="startSuivi()">Démarrer</button></div>
    </div>`;''', '''    el.innerHTML = `<div class="card"><h2>Suivi mensuel</h2><p class="note">Pas de suivi mensuel pour ce client. Démarrez-le pour facturer les périodes glissantes.</p>
      <label>Date de début du suivi</label><input type="date" id="sv-debut" value="${todayStr()}">
      <div class="modalbtns"><button class="btn btn-primary" onclick="startSuivi()">Démarrer</button></div>
    </div>`;''')

# ---------- Séances (fiche client) : en-tête ----------
rep('''    <div class="card">
      <h2>Mini-planning hebdomadaire</h2>''', '''    <div class="card">
      <h2>Semaine</h2>''')

# ---------- Espace client ----------
replace_fn('renderClientSpace', '''function renderClientSpace(){
  document.getElementById('app').innerHTML = `<div class="shell"><main class="main client-space" id="main" style="max-width:680px;margin:0 auto"></main></div>`;
  renderClientEntry();
}
''')
replace_fn('renderClientEntry', '''function renderClientEntry(){
  document.getElementById('main').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin:38px 0 20px"><img src="${LOGO_SRC}" style="width:48px;height:48px;object-fit:contain"><div><h1 style="margin:0;font-size:22px">Espace client</h1><div class="empty">Coach sportif Alex</div></div></div>
    <div class="card">
      <h2>Nouveau client</h2>
      <p class="note">Remplissez le questionnaire de bilan initial et demandez un premier rendez-vous.</p>
      <div class="modalbtns" style="justify-content:flex-start"><button class="btn btn-primary" onclick="startClientQuestionnaire()">Commencer le questionnaire</button></div>
    </div>
    <div class="card">
      <h2>Déjà client</h2>
      <p class="note">Retrouvez votre suivi, votre planning et votre programme d\\u2019entraînement.</p>
      <div class="modalbtns" style="justify-content:flex-start"><button class="btn btn-secondary" onclick="renderClientProfileList()">Consulter mon profil</button></div>
    </div>
    <div style="margin-top:16px"><button class="btn btn-secondary btn-sm" onclick="showLanding()">Retour à l\\u2019accueil</button></div>`;
}
''')
rep('''  S.clientTab = 'profil';
  S.clientWeekOffset = 0;''', '''  S.clientTab = 'accueil'; S.clientPlusView = null;
  S.clientWeekOffset = 0;''')
replace_fn('renderClientProfileArea', '''function renderClientProfileArea(){
  const c = S.currentClientObj;
  const t = S.clientTab;
  document.getElementById('app').innerHTML = `
  <div class="shell">
    <nav class="tabbar" aria-label="Navigation">
      <div class="brandmini"><img src="${LOGO_SRC}" alt="">${c.prenom}</div>
      <a class="${t==='accueil'?'active':''}" onclick="switchClientTab('accueil')">${ICONS.home}Accueil</a>
      <a class="${t==='entrainement'?'active':''}" onclick="switchClientTab('entrainement')">${ICONS.training}Entraînement</a>
      <a class="${t==='planningAlim'?'active':''}" onclick="switchClientTab('planningAlim')">${ICONS.food}Alimentation</a>
      <a class="${t==='plus'?'active':''}" onclick="switchClientTab('plus')">${ICONS.plus}Plus</a>
    </nav>
    <main class="main" id="main"><div id="clienttabcontent"></div></main>
  </div>`;
  renderClientTabContent();
}
''')
replace_fn('switchClientTab', '''function switchClientTab(t, sub){ S.clientTab=t; S.clientPlusView=sub||null; S.leconsPath=[]; renderClientProfileArea(); }
''')
replace_fn('renderClientTabContent', '''function renderClientTabContent(){
  const el = document.getElementById('clienttabcontent');
  const c = S.currentClientObj;
  if(!el || !c) return;
  const heads = {entrainement:'Mon entraînement', planningAlim:'Mon alimentation'};
  if(S.clientTab==='entrainement'){ el.innerHTML = `<div class="page-head"><h1>${heads.entrainement}</h1></div><div id="clientsub"></div>`; return renderClientEntrainement(document.getElementById('clientsub'), c); }
  if(S.clientTab==='planningAlim'){ el.innerHTML = `<div class="page-head"><h1>${heads.planningAlim}</h1></div><div id="clientsub"></div>`; return renderClientPlanningAlim(document.getElementById('clientsub'), c); }
  if(S.clientTab==='plus') return renderClientPlus(el, c);
  return renderClientHome(el, c);
}
function renderClientPlus(el, c){
  const v = S.clientPlusView;
  const views = {suivi:['Mon suivi', renderClientMergedProfil], demande:['Demander une séance', renderClientDemande], lecons:['Enseignements', renderClientLecons], challenges:['Challenges', renderClientChallenges]};
  if(v && views[v]){
    el.innerHTML = `<a class="backlink" onclick="switchClientTab('plus')">${ICONS.back}Plus</a><h1>${views[v][0]}</h1><div id="clientsub"></div>`;
    return views[v][1](document.getElementById('clientsub'), c);
  }
  el.innerHTML = `
    <div class="page-head"><h1>Plus</h1></div>
    <div class="menu">
      <div class="item" onclick="switchClientTab('plus','suivi')"><span class="body"><span class="title">Mon suivi</span><span class="sub">Poids, niveau, historique, paiements</span></span>${ICONS.chev}</div>
      <div class="item" onclick="switchClientTab('plus','demande')"><span class="body"><span class="title">Demander une séance</span><span class="sub">Voir les créneaux libres de la semaine</span></span>${ICONS.chev}</div>
      <div class="item" onclick="switchClientTab('plus','lecons')"><span class="body"><span class="title">Enseignements</span><span class="sub">Les leçons du coach</span></span>${ICONS.chev}</div>
      <div class="item" onclick="switchClientTab('plus','challenges')"><span class="body"><span class="title">Challenges</span><span class="sub">En cours et classements</span></span>${ICONS.chev}</div>
    </div>
    <div class="menu"><div class="item" onclick="renderClientProfileList()"><span class="body"><span class="title">Changer de profil</span></span>${ICONS.chev}</div></div>`;
}
async function renderClientHome(el, c){
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const [attr, levelInfo, entries, challenges, participations] = await Promise.all([loadActiveAttribution(c.id), computeClientLevel(c.id), loadJournalForClient(c.id), loadAllChallenges(), loadAllParticipations()]);
  if(S.clientTab!=='accueil' || !document.getElementById('clienttabcontent')) return;
  const today = todayStr();
  const d0 = new Date();
  const next = S.programmes.filter(p=>p.type==='avec' && p.statut==='prevue' && p.date>=today).sort((a,b)=>(a.date+(a.heure||'')).localeCompare(b.date+(b.heure||'')))[0];
  const ent = attr ? attr.entrainements[attr.currentEntrainementIndex] : null;
  const nextLevelPts = levelInfo.nextNiveau ? levelInfo.nextNiveau.niveau*POINTS_PAR_NIVEAU : null;
  const prevPts = levelInfo.currentLevel*POINTS_PAR_NIVEAU;
  const pct = nextLevelPts ? Math.min(100, Math.round(100*(levelInfo.points-prevPts)/Math.max(1,nextLevelPts-prevPts))) : 100;
  const lecons = S.leconsAllCache || await loadAllLecons(); S.leconsAllCache = lecons;
  const req = levelInfo.nextNiveau && levelInfo.nextNiveau.leconRequiseId && !levelInfo.vuesSet.has(levelInfo.nextNiveau.leconRequiseId) ? lecons.find(l=>l.id===levelInfo.nextNiveau.leconRequiseId) : null;
  const typePlan=(S.bilan||{}).typePlan; const ds=currentDietSource();
  const kcalField = typePlan ? TYPE_PLAN_KCAL_FIELD[typePlan] : null;
  const kcalT = kcalField ? (parseFloat(ds[kcalField])||0) : null;
  const protT = parseFloat(ds.proteines)||0, lipT = parseFloat(ds.lipides)||0;
  const t = journalDayTotals(entries.filter(e=>e.date===today));
  const bar = (v,max,cls) => `<span class="bar"><span class="${cls||''}" style="width:${max>0?Math.min(100,Math.round(100*v/max)):0}%"></span></span>`;
  const actifs = challenges.filter(ch=>(ch.clientsCible==='all' || ch.clientsCible.includes(c.id)) && ch.dateFin>=today && ch.dateDebut<=today);
  el.innerHTML = `
    <div class="page-head"><div><span class="kicker">${DAYLONG[d0.getDay()]} ${d0.getDate()} ${MONTHNAMES[d0.getMonth()].toLowerCase()}</span><h1>Bonjour ${c.prenom}</h1></div>
      <button class="btn btn-secondary btn-sm" onclick="switchClientTab('plus','suivi')"><span class="count" style="margin:0 6px 0 0;background:var(--orange)">${levelInfo.currentLevel}</span>Niveau ${levelInfo.currentLevel}</button></div>
    <section class="section">
      <div class="section-head"><h2>Ma prochaine séance</h2></div>
      ${next? `<div class="row ${next.date===today?'now':''}" style="cursor:default"><span class="tile ${next.date===today?'orange':''}"><b>${next.heure}</b><small>${next.date===today?'ce soir':fmtDayShort(next.date)}</small></span><span class="body"><span class="title">Avec Alex, chez vous</span><span class="sub">${formuleLabel(next.formule)} · ${dureeLabel(next.formule)}${next.entrainementNom?' · '+next.entrainementNom:''}</span></span></div>` : '<div class="card"><div class="empty">Aucune séance prévue pour le moment.</div></div>'}
      <button class="link" onclick="switchClientTab('plus','demande')">Demander une séance</button>
    </section>
    <section class="section">
      <div class="section-head"><h2>Mon entraînement</h2></div>
      <div class="card">
        ${ent ? `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span style="display:flex;flex-direction:column;gap:2px"><span style="font-size:15px;font-weight:700">${ent.nom}</span><span class="note">${ent.valide? 'À faire seul'+(S.bilan&&S.bilan.genre==='femme'?'e':'')+' · '+ent.mouvements.length+' exercices' : 'En attente de validation du coach'}</span></span>${ent.valide?`<button class="btn btn-dark btn-sm" onclick="switchClientTab('entrainement');setTimeout(renderClientEntrainementDetail,50)">Commencer</button>`:''}</div>` : '<div class="empty">Votre coach ne vous a pas encore attribué de programme.</div>'}
        <div style="display:flex;gap:8px;align-items:center;margin-top:12px">${bar(levelInfo.points-prevPts, nextLevelPts?nextLevelPts-prevPts:1)}<span class="note" style="white-space:nowrap">${levelInfo.points}${nextLevelPts?' / '+nextLevelPts:''} pts</span></div>
      </div>
    </section>
    <section class="section">
      <div class="section-head"><h2>Mon alimentation aujourd\\u2019hui</h2><button class="link" onclick="switchClientTab('planningAlim')">Ajouter</button></div>
      <div class="card">
        ${kcalT!==null? `<div class="barline"><div class="lbl"><span>Calories</span><span><b style="color:var(--text)">${Math.round(t.kcal)}</b> / ${kcalT} · reste ${Math.max(0,Math.round(kcalT-t.kcal))}</span></div>${bar(t.kcal,kcalT)}</div>` : '<p class="note">Votre coach n\\u2019a pas encore défini votre plan calorique.</p>'}
        ${protT? `<div class="barline"><div class="lbl"><span>Protéines</span><span><b style="color:var(--text)">${Math.round(t.proteines)} g</b> / ${protT} g</span></div>${bar(t.proteines,protT,'green')}</div>`:''}
        ${lipT? `<div class="barline"><div class="lbl"><span>Lipides</span><span><b style="color:var(--text)">${Math.round(t.lipides)} g</b> / ${lipT} g</span></div>${bar(t.lipides,lipT,'blue')}</div>`:''}
      </div>
    </section>
    ${req? `<div class="list"><div class="item" onclick="clientViewRessource('${req.id}')"><span class="body"><span class="title">À lire : « ${req.nom} »</span><span class="sub">Débloque le niveau ${levelInfo.nextNiveau.niveau}</span></span>${ICONS.chev}</div></div>`:''}
    ${actifs.length? `<div class="list">${actifs.map(ch=>{ const mine=participations.find(p=>p.challengeId===ch.id && p.clientId===c.id); return `<div class="item" onclick="switchClientTab('plus','challenges')"><span class="body"><span class="title">Challenge « ${ch.nom} »</span><span class="sub">Jusqu\\u2019au ${fmtDate(ch.dateFin)}</span></span><span class="side">${mine?(mine.statut==='reussi'?'<span class="badge ok">Réussi</span>':'<span class="badge lock">Non réussi</span>'):'<span class="badge plan">En cours</span>'}</span></div>`; }).join('')}</div>`:''}
  `;
}
''')
# L'ancien profil client (fusionné) perd son bloc « Paiements en retard » dupliqué ; renderClientProfileList : en-tête
rep('''    <div class="card">
      <h2>Paiements en retard <span class="badge ${unpaid.retard.length?'warn':'ok'}">${unpaid.retard.length}</span></h2>
    </div>
    ${suiviActive ? `<div class="card" style="text-align:center">''', '''    ${suiviActive ? `<div class="card" style="text-align:center">''')
rep('''  document.getElementById('main').innerHTML = `
    <div class="card">
      <h2>Sélectionnez votre profil</h2>''', '''  document.getElementById('app').innerHTML = `<div class="shell"><main class="main client-space" id="main" style="max-width:680px;margin:0 auto"></main></div>`;
  document.getElementById('main').innerHTML = `
    <div class="card" style="margin-top:38px">
      <h2>Sélectionnez votre profil</h2>''')
# Entraînement client : "Commencer" déjà présent ; le détail revient à l'onglet
rep('''  toast('Entraînement validé, bravo !');
  switchClientTab('entrainement');''', '''  toast('Entraînement validé, bravo !');
  switchClientTab('accueil');''')
rep('''<div class="modalbtns"><button class="btn btn-secondary" onclick="switchClientTab('entrainement')">Annuler</button><button class="btn btn-primary" onclick="submitEntrainementLog()">Valider mon entraînement</button></div>''',
    '''<div class="modalbtns"><button class="btn btn-secondary" onclick="switchClientTab('entrainement')">Annuler</button><button class="btn btn-primary" onclick="submitEntrainementLog()">J\\u2019ai terminé</button></div>''')
# Le détail d'entraînement client écrit dans clienttabcontent : il doit cibler le sous-conteneur s'il existe
rep('''  document.getElementById('clienttabcontent').innerHTML = `
    <div class="card">
      <h2>${ent.nom}</h2>''', '''  (document.getElementById('clientsub')||document.getElementById('clienttabcontent')).innerHTML = `
    <div class="card">
      <h2>${ent.nom}</h2>''')
# Saisie des répétitions côté client : compteur
rep('''          <label>Répétitions minimales réalisées</label><input type="number" id="log-reps-${i}">''',
    '''          <label>Répétitions minimales réalisées</label><div class="stepper"><button type="button" aria-label="Moins" onclick="stepInput('log-reps-${i}',-1)">−</button><input type="text" inputmode="numeric" id="log-reps-${i}" placeholder="—"><button type="button" aria-label="Plus" onclick="stepInput('log-reps-${i}',1)">+</button></div>''')
rep('''function readRepsResults(ent, repsPrefix, commentPrefix){''', '''function stepInput(id, delta){ const el=document.getElementById(id); if(!el) return; const v=parseInt(el.value,10); el.value = String(Math.max(0,(isNaN(v)?0:v)+delta)); }
function readRepsResults(ent, repsPrefix, commentPrefix){''')
# Renvoi des modules vers la coque : les fonctions qui rappellent renderClientTabContent après une action continuent de marcher.
# Le badge ⚠ compteur n'existe plus ; goHome après suppression client → clients
rep('''  S.currentId=null; await loadClients(); render();
}''', '''  S.currentId=null; S.homeTab='clients'; await loadClients(); render();
}''')
# Après création d'un client par le coach : ouvrir sa fiche
rep('''    closeModal();
    await loadClients();
    selectClient(ref.id);''', '''    closeModal();
    await loadClients();
    selectClient(ref.id, 'bilan');''')
# Actions verrouillées : ajouter les nouvelles
rep("'sendResiliationDemande','deleteClient','exportBackup'];", "'sendResiliationDemande','deleteClient','exportBackup','markSeancePaidById'];")

p.write_text(s, encoding='utf-8')
print('OK v4')
