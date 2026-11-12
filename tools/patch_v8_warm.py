#!/usr/bin/env python3
"""v8 : tirets, onglets, icônes, À faire en vignettes, planning jour d'abord."""
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

# ---------- Tirets longs ----------
s = s.replace(' — ', ' · ')
s = s.replace("'—'", "'–'").replace('"—"', '"–"').replace('>—<', '>–<').replace("?'—'", "?'–'")
s = s.replace("return '—';", "return '–';").replace("'—')", "'–')").replace("('—')", "('–')")
s = s.replace("<b>—</b>", "<b>–</b>").replace("<b>${p.heure||'—'}", "<b>${p.heure||'–'}")
rep("const DIET_MISSING_MSG", "const DIET_MISSING_MSG")  # sanity

# ---------- Onglets de la fiche client ----------
replace_fn('switchTab', '''function switchTab(t){
  S.tab=t;
  document.querySelectorAll('#main .tabs .tab').forEach(el=>{ el.classList.toggle('active', el.dataset.tab===t); });
  renderTab();
}
''')
rep('''    <div class="tabs">${tabs.map(t=>`<div class="tab ${S.tab===t[0]?'active':''}" onclick="switchTab('${t[0]}')">${t[1]}</div>`).join('')}</div>''',
    '''    <div class="tabs">${tabs.map(t=>`<div class="tab ${S.tab===t[0]?'active':''}" data-tab="${t[0]}" onclick="switchTab('${t[0]}')">${t[1]}</div>`).join('')}</div>''')

# ---------- Icônes ----------
rep('''function initials(c){''', '''Object.assign(ICONS, {
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/></svg>',
  userplus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>',
  phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8.1 9.6a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.7a2 2 0 0 1 1.7 2z"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L19 7"/></svg>',
  euro:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6a7 7 0 0 0-11 1.5A7 7 0 0 0 7 16.5 7 7 0 0 0 18 18M4 10h9M4 14h9"/></svg>',
  scale:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 12l3-4M8 12a4 4 0 0 1 8 0"/></svg>',
  target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2zM4 19a2 2 0 0 1 2-2h12"/></svg>',
  trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 5M17 6h3a3 3 0 0 1-3 5"/></svg>',
  flag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h12l-2 4 2 4H5"/></svg>',
  pause:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16M6 15l4-5 4 3 4-6"/></svg>',
  cycle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-15.5 6.2M3 12a9 9 0 0 1 15.5-6.2M3 7v5h5M21 17v-5h-5"/></svg>',
  settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
  globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  calc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2M16 16h0"/></svg>'
});
// Vignette d'icône colorée (listes, en-têtes)
function ico(name, tone, size){ return `<span class="ic ${tone||''} ${size||''}">${ICONS[name]||''}</span>`; }
function initials(c){''')

# ---------- Journée : vignettes ----------
rep('''  allBilans.filter(b=>!b.valide).forEach(b=>{ const cl=clOf(b.id); if(cl) todo.push({dot:'blue', title:''', '''  allBilans.filter(b=>!b.valide).forEach(b=>{ const cl=clOf(b.id); if(cl) todo.push({dot:'blue', icon:'userplus', title:''')
rep('''todo.push({dot:'blue', title:(cl?cl.prenom:'?')+' demande un premier rendez-vous',''', '''todo.push({dot:'blue', icon:'phone', title:(cl?cl.prenom:'?')+' demande un premier rendez-vous',''')
rep('''todo.push({dot:'blue', title:(cl?cl.prenom:'?')+(r.type==='pause'?' demande une pause':' veut résilier'),''', '''todo.push({dot:'blue', icon:'pause', title:(cl?cl.prenom:'?')+(r.type==='pause'?' demande une pause':' veut résilier'),''')
rep('''todo.push({dot:'green', title:(cl?cl.prenom:'?')+' a fait « '+l.entrainementNom+' »',''', '''todo.push({dot:'green', icon:'check', title:(cl?cl.prenom:'?')+' a fait « '+l.entrainementNom+' »',''')
rep('''if(cl) todo.push({dot:'orange', title:'Vérifier les charges de '+cl.prenom,''', '''if(cl) todo.push({dot:'orange', icon:'training', title:'Vérifier les charges de '+cl.prenom,''')
rep('''if(tot>0) todo.push({dot:'orange', title:euro(tot)+' à encaisser · '+c.prenom,''', '''if(tot>0) todo.push({dot:'orange', icon:'euro', title:euro(tot)+' à encaisser · '+c.prenom,''')
rep('''<span class="dot ${t.dot}"></span><span class="body"><span class="title">${t.title}</span>''', '''${ico(t.icon||'bell', t.dot)}<span class="body"><span class="title">${t.title}</span>''')
# En-têtes de sections Journée
rep('''<div class="section-head"><h2>${todays.length? (todays.length+' séance'+(todays.length>1?'s':'')+' aujourd\\u2019hui') : 'Aucune séance aujourd\\u2019hui'}</h2>''',
    '''<div class="section-head"><h2>${ico('journee','orange','sm')}${todays.length? (todays.length+' séance'+(todays.length>1?'s':'')+' aujourd\\u2019hui') : 'Aucune séance aujourd\\u2019hui'}</h2>''')
rep('''<div class="section-head"><h2>Demandes de séance</h2></div>''', '''<div class="section-head"><h2>${ico('bell','blue','sm')}Demandes de séance</h2></div>''')
rep('''      <div class="section-head"><h2>À faire</h2></div>''', '''      <div class="section-head"><h2>${ico('flag','orange','sm')}À faire</h2></div>''')

# ---------- Fiche client : en-têtes avec icônes ----------
rep('''      <h2>Poids et mesures <button class="btn btn-secondary btn-sm" onclick="openEvoModal()">Nouvelle pesée</button></h2>''',
    '''      <h2>${ico('scale','orange','sm')}Poids et mesures <button class="btn btn-secondary btn-sm" onclick="openEvoModal()">Nouvelle pesée</button></h2>''')
rep('''      <h2>Suivi mensuel ${stopped?''', '''      <h2>${ico('cycle','blue','sm')}Suivi mensuel ${stopped?''')
rep('''    <div class="card">
      <h2>Cycle attribué</h2>''', '''    <div class="card">
      <h2>${ico('training','orange','sm')}Programme</h2>''')
rep('''  return `<div class="card"><h2>Cibles du jour</h2><div class="grid">''', '''  return `<div class="card"><h2>${ico('target','green','sm')}Cibles du jour</h2><div class="grid">''')
rep('''      <h2 style="flex-wrap:nowrap">Bilan initial <button''', '''      <h2 style="flex-wrap:nowrap">${ico('user','blue','sm')}Bilan initial <button''')
rep('''      <h2>Résultats caloriques <button''', '''      <h2>${ico('calc','green','sm')}Résultats caloriques <button''')
rep('''    <div class="section-head"><h2>À venir</h2><button class="btn btn-primary btn-sm" onclick="openNewSeanceModal()">Planifier une séance</button></div>''',
    '''    <div class="section-head"><h2>${ico('planning','orange','sm')}À venir</h2><button class="btn btn-primary btn-sm" onclick="openNewSeanceModal()">Planifier une séance</button></div>''')
rep('''<div class="section-head"><h2>Passées</h2></div>''', '''<div class="section-head"><h2>${ico('check','green','sm')}Passées</h2></div>''')

# ---------- Espace client : icônes ----------
rep('''      <div class="section-head"><h2>Ma prochaine séance</h2></div>''', '''      <div class="section-head"><h2>${ico('planning','orange','sm')}Ma prochaine séance</h2></div>''')
rep('''      <div class="section-head"><h2>Mon entraînement</h2></div>''', '''      <div class="section-head"><h2>${ico('training','blue','sm')}Mon entraînement</h2></div>''')
rep('''      <div class="section-head"><h2>Mon alimentation aujourd\\u2019hui</h2>''', '''      <div class="section-head"><h2>${ico('food','green','sm')}Mon alimentation aujourd\\u2019hui</h2>''')
rep('''<div class="item" onclick="clientViewRessource('${req.id}')"><span class="body">''', '''<div class="item" onclick="clientViewRessource('${req.id}')">${ico('book','blue')}<span class="body">''')
rep('''return `<div class="item" onclick="switchClientTab('plus','challenges')"><span class="body">''', '''return `<div class="item" onclick="switchClientTab('plus','challenges')">${ico('trophy','orange')}<span class="body">''')
rep('''      <div class="item" onclick="switchClientTab('plus','suivi')"><span class="body"><span class="title">Mon suivi</span>''', '''      <div class="item" onclick="switchClientTab('plus','suivi')">${ico('chart','orange')}<span class="body"><span class="title">Mon suivi</span>''')
rep('''      <div class="item" onclick="switchClientTab('plus','demande')"><span class="body"><span class="title">Demander une séance</span>''', '''      <div class="item" onclick="switchClientTab('plus','demande')">${ico('planning','blue')}<span class="body"><span class="title">Demander une séance</span>''')
rep('''      <div class="item" onclick="switchClientTab('plus','lecons')"><span class="body"><span class="title">Enseignements</span>''', '''      <div class="item" onclick="switchClientTab('plus','lecons')">${ico('book','green')}<span class="body"><span class="title">Enseignements</span>''')
rep('''      <div class="item" onclick="switchClientTab('plus','challenges')"><span class="body"><span class="title">Challenges</span>''', '''      <div class="item" onclick="switchClientTab('plus','challenges')">${ico('trophy','orange')}<span class="body"><span class="title">Challenges</span>''')

# ---------- Plus : tuiles avec icônes ----------
rep('''    ['Préparer les entraînements', [['bibcycles','Cycles','Modèles à attribuer'],['bibmouvements','Mouvements','Bibliothèque et fiches']]],
    ['Pour les clients', [['lecons','Enseignements','Dossiers, leçons, vidéos'],['aliments','Aliments et recettes',''],['challenges','Challenges',''],['niveaux','Niveaux','Paliers et récompenses']]],
    ['Gestion', [['compta','Compta','Paiements, mois, sauvegarde'],['diet','Calcul diététique','Outil libre'],['site','Mon site','Page d\\u2019accueil, contact'],['securite','Sécurité','Codes d\\u2019accès'],['affichage','Affichage','Clair / sombre']]]''',
'''    ['Préparer les entraînements', [['bibcycles','Cycles','Modèles à attribuer','cycle','orange'],['bibmouvements','Mouvements','Bibliothèque et fiches','training','orange']]],
    ['Pour les clients', [['lecons','Enseignements','Dossiers, leçons, vidéos','book','blue'],['aliments','Aliments et recettes','','food','green'],['challenges','Challenges','','trophy','blue'],['niveaux','Niveaux','Paliers et récompenses','flag','green']]],
    ['Gestion', [['compta','Compta','Paiements, mois, sauvegarde','euro','orange'],['diet','Calcul diététique','Outil libre','calc','green'],['site','Mon site','Page d\\u2019accueil, contact','globe','blue'],['securite','Sécurité','Codes d\\u2019accès','lock','blue'],['affichage','Affichage','Clair / sombre','sun','orange']]]''')
rep('''${items.map(([k,t,sub])=>`<button class="tile-btn" onclick="switchHomeTab('${k}')"><span class="t">${t}</span>${sub?`<span class="s">${sub}</span>`:''}</button>`).join('')}''',
    '''${items.map(([k,t,sub,icn,tone])=>`<button class="tile-btn" onclick="switchHomeTab('${k}')">${ico(icn,tone)}<span class="t">${t}</span>${sub?`<span class="s">${sub}</span>`:''}</button>`).join('')}''')

# ---------- Planning : jour choisi d'abord ----------
rep('''  const sel = S.planDay && days.includes(S.planDay) ? S.planDay : null;
  const shown = sel ? [sel] : days;''', '''  const sel = (S.planDay && days.includes(S.planDay)) ? S.planDay : (days.includes(today) ? today : days[0]);
  const shown = [sel];''')
rep('''    if(!sessions.length && !reqs.length && !evos.length && !sel) return '';''', '''''')
rep('''    return `<section class="section"><div class="section-head"><h2>${ds===today?'Aujourd\\u2019hui <span style="font-weight:500;color:var(--muted)">· '+fmtDayLong(ds).toLowerCase()+'</span>':fmtDayLong(ds)}</h2></div>${entries.length? entries.map(e=>e.h).join('') : '<div class="card"><div class="empty">Rien de prévu</div></div>'}</section>`;
  }).join('');''', '''    return `<section class="section"><div class="section-head"><h2>${ico('journee','orange','sm')}${ds===today?'Aujourd\\u2019hui':fmtDayLong(ds)}</h2><span class="note">${sessions.length? sessions.length+' séance'+(sessions.length>1?'s':'') : 'libre'}</span></div>${entries.length? entries.map(e=>e.h).join('') : '<div class="card"><div class="empty">Rien de prévu ce jour-là.</div></div>'}</section>`;
  }).join('');
  const others = days.filter(ds=>ds!==sel).map(ds=>{
    const sessions = allProg.filter(p=>p.type==='avec' && p.date===ds && p.statut!=='annulee').sort((a,b)=>(a.heure||'').localeCompare(b.heure||''));
    const reqs = pending.filter(d=>d.date===ds);
    return [...sessions.map(p=>{ const cl=clOf(p.clientId); return `<div class="item" onclick="selectPlanDay('${ds}')"><span class="when"><b>${fmtDayShort(ds)}</b><small>${p.heure}</small></span><span class="body"><span class="title">${cl?clientName(cl):'?'}</span><span class="sub">${formuleLabel(p.formule)}${p.entrainementNom?' · '+p.entrainementNom:''}</span></span>${p.statut==='faite'?'<span class="badge ok">Faite</span>':''}${ICONS.chev}</div>`; }),
            ...reqs.map(dm=>{ const cl=clOf(dm.clientId); return `<div class="item" onclick="selectPlanDay('${ds}')"><span class="when blue"><b>${fmtDayShort(ds)}</b><small>${dm.heureDebut}</small></span><span class="body"><span class="title">${cl?clientName(cl):'?'}</span><span class="sub">Demande · ${formuleLabel(dm.formule)}</span></span><span class="badge plan">À traiter</span></div>`; })].join('');
  }).join('');''')
rep('''    ${sections || '<div class="card"><div class="empty">Aucune séance cette semaine.</div></div>'}''',
    '''    ${sections}
    <section class="section"><div class="section-head"><h2>${ico('planning','blue','sm')}Le reste de la semaine</h2></div>${others? `<div class="list">${others}</div>` : '<div class="card"><div class="empty">Rien d\\u2019autre cette semaine.</div></div>'}</section>''')
rep('''      <div class="days">${days.map(ds=>{ const d=new Date(ds+'T00:00:00'); return `<button class="day ${sel===ds?'sel':''} ${ds===today?'today':''}" onclick="selectPlanDay('${sel===ds?'':ds}')"><small>${DAYSHORT[d.getDay()][0].toUpperCase()}</small><span class="n">${d.getDate()}</span><span class="m ${dayReq(ds)?'req':(dayHas(ds)?'on':'')}"></span></button>`; }).join('')}</div>''',
    '''      <div class="days">${days.map(ds=>{ const d=new Date(ds+'T00:00:00'); const n=allProg.filter(p=>p.type==='avec' && p.date===ds && p.statut!=='annulee').length; return `<button class="day ${sel===ds?'sel':''} ${ds===today?'today':''}" onclick="selectPlanDay('${ds}')"><small>${DAYSHORT[d.getDay()].replace('.','')}</small><span class="n">${d.getDate()}</span><span class="m ${dayReq(ds)?'req':(n?'on':'')}" title="${n} séance(s)"></span></button>`; }).join('')}</div>
      <div class="legend"><span><i class="on"></i>séance</span><span><i class="req"></i>demande à traiter</span><span><i class="today"></i>aujourd\\u2019hui</span></div>''')
p.write_text(s, encoding='utf-8')

c = root / 'style.css'; t = c.read_text(encoding='utf-8')
t += '''
/* ---------- Vignettes d'icônes ---------- */
.ic{width:38px;height:38px;border-radius:11px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;background:var(--panel);color:var(--muted);}
.ic svg{width:20px;height:20px;}
.ic.orange{background:var(--orange-soft);color:var(--orange-dark);} .ic.blue{background:var(--blue-soft);color:var(--blue);} .ic.green{background:var(--green-soft);color:var(--green);}
.ic.sm{width:28px;height:28px;border-radius:8px;margin-right:2px;} .ic.sm svg{width:16px;height:16px;}
h2 .ic.sm{margin-right:0;}
.tile-btn .ic{margin-bottom:6px;}
.item .when{width:58px;display:flex;flex-direction:column;align-items:center;line-height:1.15;flex-shrink:0;}
.item .when b{font-size:13px;} .item .when small{font-size:12px;color:var(--muted);}
.item .when.blue b{color:var(--blue);}
.weekcal .day small{font-size:11px;}
.legend{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:8px;font-size:11px;color:var(--muted);}
.legend span{display:inline-flex;align-items:center;gap:5px;}
.legend i{width:7px;height:7px;border-radius:50%;display:inline-block;background:var(--text);}
.legend i.req{background:var(--blue);} .legend i.today{background:transparent;border:1.5px solid var(--orange);width:9px;height:9px;}
'''
c.write_text(t, encoding='utf-8')
print('OK v8')
