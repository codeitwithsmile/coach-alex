#!/usr/bin/env python3
"""v6 : site public (frise, FAQ, zone, thème clair forcé), réglage de thème, et simplification des espaces."""
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

# ---------- Thème : réglage Clair / Sombre / Auto ----------
rep('''async function boot(){''', '''function applyTheme(){
  let t='auto'; try{ t = localStorage.getItem('coachalex.theme') || 'auto'; }catch(e){}
  const root = document.documentElement;
  if(t==='auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t);
  return t;
}
function setTheme(t){ try{ localStorage.setItem('coachalex.theme', t); }catch(e){} applyTheme(); render(); }
async function boot(){
  applyTheme();''')
# Entrée « Affichage » dans Plus (coach) et Plus client
rep('''    ['site','Mon site','Textes de la page d\\u2019accueil et contact'],''', '''    ['site','Mon site','Textes de la page d\\u2019accueil et contact'],
    ['affichage','Affichage','Clair, sombre ou automatique'],''')
rep("compta:'Compta', site:'Mon site', securite:'Sécurité'};", "compta:'Compta', site:'Mon site', securite:'Sécurité', affichage:'Affichage'};")
rep('''    else if(t==='securite') renderSecurite();
    return;''', '''    else if(t==='securite') renderSecurite();
    else if(t==='affichage') renderAffichage();
    return;''')
rep("'compta','site','securite'];", "'compta','site','securite','affichage'];")
rep('''// ---- MON SITE / SÉCURITÉ ----''', '''// ---- AFFICHAGE ----
function themeChoicesHtml(){
  const cur = applyTheme();
  return `<div class="chips">${[['auto','Automatique'],['light','Clair'],['dark','Sombre']].map(([k,l])=>`<button class="chip ${cur===k?'active':''}" onclick="setTheme('${k}')">${l}</button>`).join('')}</div><p class="note">« Automatique » suit le réglage de votre téléphone. Le site public reste toujours clair.</p>`;
}
function renderAffichage(){
  document.getElementById('hometabcontent').innerHTML = `<div class="card"><h2>Thème</h2>${themeChoicesHtml()}</div>`;
}

// ---- MON SITE / SÉCURITÉ ----''')
rep('''    <div class="menu"><div class="item" onclick="logout()"><span class="body"><span class="title">Se déconnecter</span></span>${ICONS.chev}</div></div>`;
}
async function renderClientHome(el, c){''', '''    <div class="card"><h2>Affichage</h2>${themeChoicesHtml()}</div>
    <div class="menu"><div class="item" onclick="logout()"><span class="body"><span class="title">Se déconnecter</span></span>${ICONS.chev}</div></div>`;
}
async function renderClientHome(el, c){''')
# setTheme appelle render() : côté client, il faut rendre l'espace client
rep("function setTheme(t){ try{ localStorage.setItem('coachalex.theme', t); }catch(e){} applyTheme(); render(); }",
    "function setTheme(t){ try{ localStorage.setItem('coachalex.theme', t); }catch(e){} applyTheme(); if(S.view==='client' && S.currentClientObj) renderClientProfileArea(); else if(S.view==='coach') render(); }")

# ---------- Site public : FAQ + zone ----------
rep('''  specialites: 'Perte de poids, Débutants, Renforcement, Prise de masse',''', '''  specialites: 'Perte de poids, Débutants, Renforcement, Prise de masse',
  communes: 'Bayonne, Anglet, Biarritz, Ustaritz, Saint-Pierre-d\\u2019Irube, Mouguerre',
  faq: 'Faut-il du matériel ?|Non. Je viens avec ce qu\\u2019il faut : haltères, élastiques, tapis. Un peu de place dans le salon suffit.\\nJe n\\u2019ai jamais fait de sport, est-ce pour moi ?|Oui. Les débutants sont l\\u2019une de mes spécialités : on part de votre niveau, avec des charges qui progressent à votre rythme.\\nComment se passe le paiement ?|Chaque séance se règle après la séance. Le suivi mensuel se règle au début de chaque période, et devient moins cher à mesure que vous faites des séances.\\nQue contient le suivi mensuel ?|Votre programme d\\u2019entraînement pour vous entraîner seul, vos objectifs alimentaires recalculés à chaque pesée, mes enseignements et les challenges, le tout sur votre téléphone.',''')
rep('''    <section class="site-section" id="contact">''', '''    ${faq.length? `<section class="site-section">
      <div class="site-wrap">
        <h2>Vos questions</h2>
        <div class="site-faq">${faq.map(([q,a],i)=>`<details ${i===0?'open':''}><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>
      </div>
    </section>`:''}
    ${communes.length? `<section class="site-section alt">
      <div class="site-wrap">
        <h2>Où je me déplace</h2>
        <p class="site-lead">À domicile, autour de ${site.zone}. 30 minutes de trajet sont prévues entre deux séances.</p>
        <div class="site-communes">${communes.map(x=>`<span>${x}</span>`).join('')}</div>
      </div>
    </section>`:''}
    <section class="site-section" id="contact">''')
rep('''  const bioHtml = (site.bio||'').split(/\\n+/).map(x=>x.trim()).filter(Boolean).map(x=>`<p>${x}</p>`).join('');''',
    '''  const bioHtml = (site.bio||'').split(/\\n+/).map(x=>x.trim()).filter(Boolean).map(x=>`<p>${x}</p>`).join('');
  const communes = (site.communes||'').split(',').map(x=>x.trim()).filter(Boolean);
  const faq = (site.faq||'').split(/\\n+/).map(l=>l.split('|')).filter(x=>x.length===2 && x[0].trim() && x[1].trim()).map(x=>[x[0].trim(), x[1].trim()]);''')
rep('''      <label>Instagram (sans @)</label><input id="st-instagram" value="${site.instagram||''}">''',
    '''      <label>Instagram (sans @)</label><input id="st-instagram" value="${site.instagram||''}">
      <label>Communes desservies (séparées par des virgules)</label><input id="st-communes" value="${site.communes||''}">
      <label>Questions fréquentes (une par ligne : question | réponse)</label><textarea id="st-faq" rows="8">${site.faq||''}</textarea>''')
rep("bio:val('st-bio').trim(), specialites:val('st-specialites').trim(),", "bio:val('st-bio').trim(), specialites:val('st-specialites').trim(), communes:val('st-communes').trim(), faq:val('st-faq').trim(),")

# ---------- Journée : « À faire » replié au-delà de 4 ----------
rep('''      ${todo.length? `<div class="list">${todo.map(t=>`<div class="item ${t.onclick?'':'static'}" ${t.onclick?`onclick="${t.onclick}"`:''}><span class="dot ${t.dot}"></span><span class="body"><span class="title">${t.title}</span><span class="sub">${t.sub}</span></span>${t.action?`<span class="side">${t.action}</span>`:ICONS.chev}</div>`).join('')}</div>` : '<div class="card"><div class="empty">Rien à traiter. Belle journée.</div></div>'}''',
'''      ${todo.length? `<div class="list">${todo.map((t,i)=>`<div class="item ${t.onclick?'':'static'} ${i>=4&&!S.todoAll?'hid':''}" ${t.onclick?`onclick="${t.onclick}"`:''}><span class="dot ${t.dot}"></span><span class="body"><span class="title">${t.title}</span><span class="sub">${t.sub}</span></span>${t.action?`<span class="side">${t.action}</span>`:ICONS.chev}</div>`).join('')}${todo.length>4&&!S.todoAll?`<button class="item morebtn" onclick="S.todoAll=true;renderJournee()">Voir les ${todo.length-4} autres</button>`:''}</div>` : '<div class="card"><div class="empty">Rien à traiter. Belle journée.</div></div>'}''')

# ---------- Fiche client · Suivi : cibles → Alimentation ; pesées et historique repliés ----------
rep('''    <div class="card">
      <h2>Cibles du jour <span class="note" style="margin-left:auto;font-weight:500">${typePlan? TYPE_PLAN_LABELS[typePlan].toLowerCase() : 'aucun plan défini'}</span></h2>
      ${d && d.proteines ? `<div class="grid">
        <div class="stat"><span class="n">${kcal!==null? kcal : '—'}</span><span class="l">kcal${kcal===null?' (choisir un plan)':''}</span></div>
        <div class="stat"><span class="n">${d.proteines} g</span><span class="l">protéines</span></div>
        <div class="stat"><span class="n">${d.lipides} g</span><span class="l">lipides</span></div>
      </div><p class="note" style="margin-top:8px">${d===bilan?'Calculées au bilan':'Recalculées à la pesée du '+fmtDate(d.date)}. <button class="link" onclick="switchTab('planningAlim')">Changer le plan</button></p>` : '<div class="empty">Pas encore de calcul : lancez-le depuis le Bilan.</div>'}
    </div>
''', '')
rep('''    ${(S.evolutions||[]).length? `<div class="card"><h2>Pesées</h2>${S.evolutions.map(e=>`<div class="seance-row">''',
    '''    ${(S.evolutions||[]).length? `<details class="card fold"><summary>Toutes les pesées (${S.evolutions.length})</summary>${S.evolutions.map(e=>`<div class="seance-row">''')
rep('''<button class="btn btn-danger btn-sm" onclick="confirmDeleteEvo('${e.id}')">Supprimer</button></span></div>`).join('')}</div>`:''}''',
    '''<button class="btn btn-danger btn-sm" onclick="confirmDeleteEvo('${e.id}')">Supprimer</button></span></div>`).join('')}</details>`:''}''')
# Alimentation (coach) : cibles en tête
rep('''async function renderPlanningAlimentaire(el,c){
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const entries = await loadJournalForClient(c.id);
  const b = S.bilan||{};''', '''function ciblesCardHtml(){
  const bilan=S.bilan||{}; const d=currentDietSource(); const typePlan=bilan.typePlan;
  const kcalField = typePlan ? TYPE_PLAN_KCAL_FIELD[typePlan] : null;
  const kcal = kcalField ? (parseFloat(d[kcalField])||0) : null;
  if(!(d && d.proteines)) return '<div class="card"><h2>Cibles du jour</h2><div class="empty">Pas encore de calcul : lancez-le depuis le Bilan.</div></div>';
  return `<div class="card"><h2>Cibles du jour</h2><div class="grid">
      <div class="stat"><span class="n">${kcal!==null? kcal : '—'}</span><span class="l">kcal${kcal===null?' (choisir un plan)':''}</span></div>
      <div class="stat"><span class="n">${d.proteines} g</span><span class="l">protéines</span></div>
      <div class="stat"><span class="n">${d.lipides} g</span><span class="l">lipides</span></div>
    </div><p class="note" style="margin-top:8px">${d===bilan?'Calculées au bilan':'Recalculées à la pesée du '+fmtDate(d.date)}.</p></div>`;
}
async function renderPlanningAlimentaire(el,c){
  el.innerHTML = '<div class="empty">Chargement...</div>';
  const entries = await loadJournalForClient(c.id);
  const b = S.bilan||{};''')
rep('''  el.innerHTML = `
    <div class="card">
      <h2>Type de plan alimentaire</h2>''', '''  el.innerHTML = `
    ${ciblesCardHtml()}
    <div class="card">
      <h2>Type de plan alimentaire</h2>''')
rep('''    <div class="card">
      <h2>Historique (lecture seule)</h2>
      ${days.length? days.map(d=>{''', '''    <div class="card">
      <h2>Journal du client</h2>
      ${days.length? days.map(d=>{''')

# ---------- Suivi mensuel : une seule carte, historique replié ----------
rep('''  el.innerHTML = `
    <div class="card">
      <h2>Suivi mensuel</h2>
      ${stopped ? `<p><span class="badge lock">En pause depuis le ${fmtDate(cfg.segments[cfg.segments.length-1].end)}</span></p>
                   <button class="btn btn-primary btn-sm" onclick="openRestartSuivi()">Redémarrer le suivi</button>`
                : `<button class="btn btn-secondary btn-sm" onclick="pauseSuivi()">Mettre le suivi en pause</button>
                   <button class="btn btn-danger btn-sm" onclick="confirmCancelEnCours()">Annuler le suivi en cours</button>`}
    </div>
    ${current ? `
    <div class="card">
      <h2>Période en cours</h2>
      <p>Du ${fmtDate(current.periodeDebut)} au ${fmtDate(current.periodeFin)}</p>
      <p>Séances avec coach payées : <b>${current.nbSeances}</b></p>
      <p>Tarif calculé : <b>${euro(current.tarif)}</b></p>
      ${periodStatusHtml(current, true)}
    </div>` : ''}
    <div class="card">
      <h2>Historique des périodes</h2>
      ${history.length? history.map(h=>`
        <div class="seance-row"><span>${fmtDate(h.periodeDebut)} → ${fmtDate(h.periodeFin)} · ${h.nbSeances} séances payées</span>
        <span>${h.tarif===0&&!h.annule?'Gratuit':euro(h.tarif)} ${periodStatusHtml(h,false)}</span></div>
      `).join('') : '<div class="empty">Aucune période précédente</div>'}
    </div>
  `;''', '''  el.innerHTML = `
    <div class="card">
      <h2>Suivi mensuel ${stopped?`<span class="badge lock">En pause depuis le ${fmtDate(cfg.segments[cfg.segments.length-1].end)}</span>`:'<span class="badge ok">Actif</span>'}</h2>
      ${current && !stopped ? `<div class="seance-row"><span><b>Période en cours</b> · ${fmtDate(current.periodeDebut)} → ${fmtDate(current.periodeFin)}<br><span class="note">${current.nbSeances} séance${current.nbSeances>1?'s':''} payée${current.nbSeances>1?'s':''} · ${current.tarif===0?'gratuit':euro(current.tarif)}</span></span><span>${periodStatusHtml(current, true)}</span></div>` : ''}
      <div class="row-actions" style="margin-top:10px">${stopped ? `<button class="btn btn-primary btn-sm" onclick="openRestartSuivi()">Redémarrer le suivi</button>` : `<button class="btn btn-secondary btn-sm" onclick="pauseSuivi()">Mettre en pause</button><button class="btn btn-danger btn-sm" onclick="confirmCancelEnCours()">Annuler la période en cours</button>`}</div>
      ${history.length? `<details class="fold" style="margin-top:12px"><summary>Périodes précédentes (${history.length})</summary>${history.map(h=>`
        <div class="seance-row"><span>${fmtDate(h.periodeDebut)} → ${fmtDate(h.periodeFin)} · ${h.nbSeances} séance${h.nbSeances>1?'s':''} payée${h.nbSeances>1?'s':''}</span>
        <span>${h.tarif===0&&!h.annule?'Gratuit':euro(h.tarif)} ${periodStatusHtml(h,false)}</span></div>`).join('')}</details>`:''}
    </div>
  `;''')
rep('''    if(p.paiement) return `<span class="badge lock">Payée, verrouillée</span> <button class="btn btn-secondary btn-sm" onclick="confirmCancelSuivi('${p.id}')">Annuler</button>`;
    if(p.tarif===0) return `<span class="badge ok">Gratuit</span> <button class="btn btn-secondary btn-sm" onclick="confirmCancelSuivi('${p.id}')">Annuler</button>`;
    return `<button class="btn btn-primary btn-sm" onclick="markSuiviPaid('${p.id}')">Marquer payé</button> <button class="btn btn-secondary btn-sm" onclick="confirmCancelSuivi('${p.id}')">Annuler</button>`;''',
'''    if(p.paiement) return `<span class="badge ok">Payée</span>`;
    if(p.tarif===0) return `<span class="badge ok">Offerte</span>`;
    return `<button class="btn btn-primary btn-sm" onclick="markSuiviPaid('${p.id}')">Encaisser</button> <button class="btn btn-secondary btn-sm" onclick="confirmCancelSuivi('${p.id}')">Annuler</button>`;''')

# ---------- Entraînement (coach) : seul le prochain est déplié ----------
rep('''        ${attribution.entrainements.map((ent,i)=>`
          <div class="card" style="background:var(--bg)">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
              <b>${i+1}. ${ent.nom} ${i===attribution.currentEntrainementIndex?'<span class="badge plan">Prochain</span>':''}</b>
              ${ent.valide?'<span class="badge ok">Validé</span>':'<span class="badge warn">À valider</span>'}
            </div>
            ${ent.mouvements.map(mv=>`<div class="empty">${mv.nom} — ${mvSpec(mv)}${mv.surchargeProgressive?' <span class="tag">progressif</span>':''}</div>`).join('')}
            <button class="btn btn-secondary btn-sm" style="margin-top:6px" onclick="openValidateEntrainementAttr('${attribution.id}',${i})">${ent.valide?'Modifier / revalider':'Valider'}</button>
          </div>
        `).join('')}''', '''        ${attribution.entrainements.map((ent,i)=>`
          <details class="card fold" ${i===attribution.currentEntrainementIndex?'open':''}>
            <summary><span>${i+1}. ${ent.nom}</span><span class="side">${i===attribution.currentEntrainementIndex?'<span class="badge plan">Prochain</span>':''}${ent.valide?'<span class="badge ok">Validé</span>':'<span class="badge warn">À valider</span>'}</span></summary>
            ${ent.mouvements.map(mv=>`<div class="empty">${mv.nom} — ${mvSpec(mv)}${mv.surchargeProgressive?' <span class="tag">progressif</span>':''}</div>`).join('')}
            <button class="btn ${ent.valide?'btn-secondary':'btn-primary'} btn-sm" style="margin-top:8px" onclick="openValidateEntrainementAttr('${attribution.id}',${i})">${ent.valide?'Modifier les charges':'Valider'}</button>
          </details>
        `).join('')}''')
rep('''      ${attribution? `
        <p><b>${attribution.cycleNom}</b></p>
        ${cycleSelectHtml}
        <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="bulkValidateAttribution('${attribution.id}')">Tout valider</button>''',
'''      ${attribution? `
        <p><b>${attribution.cycleNom}</b> <span class="note">· ${attribution.entrainements.length} entraînements en boucle</span></p>
        <div class="row-actions" style="margin-bottom:6px"><button class="btn btn-secondary btn-sm" onclick="bulkValidateAttribution('${attribution.id}')">Tout valider</button><button class="btn btn-secondary btn-sm" onclick="openChangeCycle()">Changer de cycle</button></div>''')
rep('''      ` : `
        <p class="empty">Aucun cycle attribué.</p>
        ${cycleSelectHtml}
      `}
    </div>
    <div class="card">
      <h2>Historique des entraînements réalisés</h2>
      ${logs.length? logs.map(l=>`
        <div class="seance-row" style="flex-direction:column;align-items:stretch">
          <b>${fmtDate(l.date)} — ${l.entrainementNom}</b>
          ${l.resultats.map(r=>`<div>${r.nom} : ${repsStr(r)} ${r.commentaire?'— '+r.commentaire:''}</div>`).join('')}
        </div>
      `).join('') : '<div class="empty">Aucun entraînement réalisé pour le moment</div>'}
    </div>''', '''      ` : `
        <p class="empty">Aucun cycle attribué.</p>
        ${cycleSelectHtml}
      `}
    </div>
    ${logs.length? `<details class="card fold"><summary>Entraînements réalisés (${logs.length})</summary>
      ${logs.map(l=>`<div class="seance-row" style="flex-direction:column;align-items:stretch"><b>${fmtDate(l.date)} — ${l.entrainementNom}${l.seanceId?'':' <span class="tag">seul</span>'}</b><span class="note">${l.resultats.map(r=>r.nom+' : '+(typeof r.repsMin==='number'?r.repsMin:'—')+(r.commentaire?' (« '+r.commentaire+' »)':'')).join(' · ')}</span></div>`).join('')}
    </details>` : ''}''')
rep('''async function assignCycleToClient(cycleBibId){''', '''async function openChangeCycle(){
  const bibCycles = await loadAllCyclesBib();
  openModal(`<h3>Changer de cycle</h3><p class="note">Le cycle actuel sera archivé ; le nouveau repart au premier entraînement, avec ses charges de départ.</p>
    <label>Modèle</label><select id="attr-cycle-select">${bibCycles.map(t=>`<option value="${t.id}">${t.nom}</option>`).join('')}</select>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="closeModal();assignCycleToClient(val('attr-cycle-select'))">Attribuer</button></div>`);
}
async function assignCycleToClient(cycleBibId){''')

# ---------- Séances (fiche client) : formulaire en modale, historique compact ----------
replace_fn('renderSeance', '''async function renderSeance(el,c){
  const visibles = S.programmes.filter(p=>p.statut!=='annulee');
  const today = todayStr();
  const future = visibles.filter(p=>p.date>=today && p.statut==='prevue').sort((a,b)=>(a.date+(a.heure||'')).localeCompare(b.date+(b.heure||'')));
  const past = visibles.filter(p=>!(p.date>=today && p.statut==='prevue'));
  el.innerHTML = `
    <div class="section-head"><h2>À venir</h2><button class="btn btn-primary btn-sm" onclick="openNewSeanceModal()">Planifier une séance</button></div>
    ${future.length? `<div class="card">${future.map(p=>seanceCard(p)).join('')}</div>` : '<div class="card"><div class="empty">Aucune séance prévue.</div></div>'}
    ${past.length? `<div class="section-head"><h2>Passées</h2></div><div class="card">${past.slice(0,8).map(p=>seanceCard(p)).join('')}${past.length>8?`<details class="fold" style="margin-top:8px"><summary>${past.length-8} séances plus anciennes</summary>${past.slice(8).map(p=>seanceCard(p)).join('')}</details>`:''}</div>` : ''}
  `;
}
function openNewSeanceModal(){
  openModal(`<h3>Nouvelle séance</h3>${seanceForm()}`);
  toggleFormule();
}
''')
replace_fn('seanceForm', '''function seanceForm(){
  return `
    <label>Type de séance</label>
    <select id="s-type" onchange="toggleFormule()">
      <option value="avec">Avec coach, à domicile</option>
      <option value="sans">Sans coach</option>
    </select>
    <div class="formrow">
      <div><label>Date</label><input type="date" id="s-date" value="${todayStr()}"></div>
      <div id="s-heure-block"><label>Heure de début</label><input type="time" id="s-heure"></div>
    </div>
    <div id="s-avec-block">
      <label>Formule</label>
      <select id="s-formule">
        <option value="express">Express · ${EXPRESS_PRICE} € · 45 à 60 min</option>
        <option value="classique">Classique · ${CLASSIQUE_PRICE} € · 1 h 30 à 2 h</option>
      </select>
      <p class="note" style="margin-top:6px">Entre 9 h et 22 h, 30 min de trajet entre deux séances.</p>
    </div>
    <label>Résumé (optionnel)</label><input id="s-resume">
    <label>Notes (optionnel)</label><textarea id="s-notes" rows="2"></textarea>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="createSeance()">Enregistrer</button></div>
  `;
}
''')
replace_fn('toggleFormule', '''function toggleFormule(){
  const type=val('s-type');
  const b=document.getElementById('s-avec-block'); if(b) b.style.display = type==='avec'?'block':'none';
  const h=document.getElementById('s-heure-block'); if(h) h.style.display = type==='avec'?'block':'none';
}
''')
rep('''  await db.collection('programmes').add(data);
  await loadClientData(S.currentId); renderTab(); toast('Enregistré avec succès');''', '''  await db.collection('programmes').add(data);
  closeModal(); await loadClientData(S.currentId); renderTab(); toast('Séance enregistrée');''')
# seanceCard : actions plus sobres
rep('''    actions = `<span class="badge lock">Payée, verrouillée</span> <button class="btn btn-secondary btn-sm" onclick="confirmCancelSeanceLocked('${p.id}')">Annuler</button>`;''',
    '''    actions = `<button class="btn btn-secondary btn-sm" onclick="confirmCancelSeanceLocked('${p.id}')">Annuler</button>`;''')
rep('''        ${p.type==='avec' && !p.paiement ? `<button class="btn btn-primary btn-sm" onclick="markSeancePaid('${p.id}')">Marquer payé</button> <button class="btn btn-secondary btn-sm" onclick="markSeanceOfferte('${p.id}')">Marquer offerte</button>` : ''}
        ${p.statut==='prevue' ? `<button class="btn btn-secondary btn-sm" onclick="markSeanceFaite('${p.id}')">Faite</button>` : ''}
        <button class="btn btn-secondary btn-sm" onclick="cancelSeance('${p.id}')">Annuler</button>''',
'''        ${p.statut==='prevue' ? `<button class="btn btn-primary btn-sm" onclick="markSeanceFaite('${p.id}')">Séance faite</button>` : ''}
        ${p.type==='avec' && !p.paiement ? `<button class="btn ${p.statut==='prevue'?'btn-secondary':'btn-primary'} btn-sm" onclick="markSeancePaid('${p.id}')">Encaisser</button> <button class="btn btn-secondary btn-sm" onclick="markSeanceOfferte('${p.id}')">Offrir</button>` : ''}
        <button class="btn btn-secondary btn-sm" onclick="cancelSeance('${p.id}')">Annuler</button>''')
rep('''    else payBadge = p.paiement?`<span class="badge ok">Payée · ${p.tarif} €</span>`:`<span class="badge warn">Non payée · ${p.tarif} €</span>`;''',
    '''    else payBadge = p.paiement?`<span class="badge ok">Payée · ${p.tarif} €</span>`:`<span class="badge warn">${p.tarif} € à encaisser</span>`;''')
rep('''  let statutBadge = isAnnulee?'<span class="badge lock">Annulée</span>':(p.statut==='prevue'?'<span class="badge plan">Prévue</span>':'<span class="badge ok">Faite</span>');''',
    '''  let statutBadge = isAnnulee?'<span class="badge lock">Annulée</span>':(p.statut==='prevue'?'':'<span class="badge ok">Faite</span>');''')

# ---------- Espace client · Alimentation : ajout replié ----------
rep('''    <div class="card">
      <h2>Mes recettes <button class="btn btn-secondary btn-sm" onclick="openRecetteBuilder()">Nouvelle recette</button></h2>''',
    '''    <details class="card fold" ${todayEntries.length?'':'open'}>
      <summary>Ajouter un aliment</summary>''')
rep('''      <div style="margin-top:10px">
      ${recettes.length? recettes.map(r=>`<div class="seance-row" style="cursor:pointer" onclick="viewRecette('${r.id}')"><span>${r.nom}</span><span class="empty">${Math.round(r.kcal)} kcal</span></div>`).join('') : '<div class="empty">Aucune recette enregistrée</div>'}
      </div>
    </div>
    <div class="card">
      <h2>Ajouter un aliment</h2>
      <label>Rechercher un produit</label>''', '''      <label>Rechercher un produit</label>''')
rep('''      <label>Quantité (g)</label><input type="number" id="ja-quantite" value="100">
      <div class="modalbtns"><button class="btn btn-primary" onclick="addJournalEntry()">Ajouter</button></div>
    </div>''', '''      <label>Quantité (g)</label><input type="number" id="ja-quantite" value="100">
      <div class="modalbtns"><button class="btn btn-primary" onclick="addJournalEntry()">Ajouter</button></div>
    </details>
    <details class="card fold">
      <summary>Mes recettes (${recettes.length})</summary>
      ${recettes.length? recettes.map(r=>`<div class="seance-row" style="cursor:pointer" onclick="viewRecette('${r.id}')"><span>${r.nom}</span><span class="empty">${Math.round(r.kcal)} kcal</span></div>`).join('') : '<div class="empty">Aucune recette enregistrée</div>'}
      <div class="modalbtns"><button class="btn btn-secondary btn-sm" onclick="openRecetteBuilder()">Nouvelle recette</button></div>
    </details>''')
rep('''    <div class="card">
      <h2>Historique</h2>
      ${pastDates.length? pastDates.map(d=>{''', '''    <details class="card fold">
      <summary>Jours précédents (${pastDates.length})</summary>
      ${pastDates.length? pastDates.map(d=>{''')
rep('''      }).join('') : '<div class="empty">Aucun historique</div>'}
    </div>
  `;
  S.jaSelectedProduitId = null;''', '''      }).join('') : '<div class="empty">Aucun historique</div>'}
    </details>
  `;
  S.jaSelectedProduitId = null;''')

# Actions verrouillées
rep("'saveSiteSettings','regenerateClientCode'];", "'saveSiteSettings','regenerateClientCode','openChangeCycle'];")
p.write_text(s, encoding='utf-8')

# ---------- CSS ----------
c = root / 'style.css'; t = c.read_text(encoding='utf-8')
def crep(a,b):
    global t
    if t.count(a)!=1: sys.exit('CSS introuvable : '+a[:80])
    t = t.replace(a,b)
# Frise : trait porté par chaque étape vers la suivante
crep('.site-timeline::before{content:"";position:absolute;left:calc(16.66% + 26px);right:calc(16.66% + 26px);top:26px;height:2px;background:var(--border);}',
     '.site-timeline li:not(:last-child)::after{content:"";position:absolute;top:26px;left:62px;right:-20px;height:2px;background:var(--border);}')
crep('  .site-timeline::before{left:26px;right:auto;top:30px;bottom:30px;width:2px;height:auto;}',
     '  .site-timeline li:not(:last-child)::after{top:62px;bottom:-8px;left:26px;right:auto;width:2px;height:auto;}')
# Bouton clair et site public toujours clair
crep('.btn-light{background:#fff;color:var(--text);border-color:#fff;}', '.btn-light{background:#fff;color:#1C1B19;border-color:#fff;}')
crep('.site{background:var(--card);color:var(--text);min-height:100vh;}',
     '.site{--bg:#F6F5F2; --card:#FFFFFF; --panel:#F6F5F2; --text:#1C1B19; --muted:#6E6A63; --border:#E6E3DD; --border-soft:#EEECE7; --border-strong:#D5D1C9; --orange-soft:#FBE9DC; --green-soft:#E3F0E8; --blue-soft:#E5ECF8; background:var(--card);color:var(--text);min-height:100vh;}')
t += '''
/* ---------- Thème forcé ---------- */
:root[data-theme="dark"]{ --bg:#15140F; --card:#1E1D18; --panel:#26241E; --text:#F1EFEA; --muted:#A39F96; --border:#302E27; --border-soft:#2A2822; --border-strong:#3F3C33; --orange-soft:#3A2416; --green-soft:#16301F; --blue-soft:#1A2538; --red-soft:#3A1B19; }
:root[data-theme="dark"] .tile.orange b, :root[data-theme="dark"] .tile.orange small, :root[data-theme="dark"] .badge.warn, :root[data-theme="dark"] .avatar{color:#F08A3E;}
:root[data-theme="dark"] .badge.ok, :root[data-theme="dark"] .tile.green b{color:#5CC284;}
:root[data-theme="dark"] .badge.plan, :root[data-theme="dark"] .tile.blue b, :root[data-theme="dark"] .tile.blue small, :root[data-theme="dark"] .avatar.blue{color:#7FA3E0;}
.auth{--bg:#F6F5F2; --card:#FFFFFF; --panel:#F6F5F2; --text:#1C1B19; --muted:#6E6A63; --border:#E6E3DD; --border-strong:#D5D1C9; --orange-soft:#FBE9DC;}

/* ---------- Blocs repliables ---------- */
details.fold > summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:10px;font-weight:700;font-size:15px;}
details.fold > summary::-webkit-details-marker{display:none;}
details.fold > summary::after{content:"";width:9px;height:9px;border-right:2px solid var(--muted);border-bottom:2px solid var(--muted);transform:rotate(45deg);margin:0 6px 4px auto;flex-shrink:0;transition:transform .15s;}
details.fold[open] > summary::after{transform:rotate(-135deg);margin-bottom:-2px;}
details.fold > summary .side{display:inline-flex;gap:6px;margin-left:auto;}
details.fold[open] > summary{margin-bottom:10px;}
details.fold.card{padding:14px 16px;}
.card details.fold{padding:0;}
.item.hid{display:none;}
.morebtn{justify-content:center;color:var(--orange);font-weight:700;background:none;border:none;width:100%;font-size:14px;}

/* ---------- Site : FAQ, communes ---------- */
.site-faq details{border-bottom:1px solid var(--border);padding:14px 0;}
.site-faq summary{cursor:pointer;font-weight:700;font-size:16px;list-style:none;display:flex;justify-content:space-between;gap:12px;}
.site-faq summary::-webkit-details-marker{display:none;}
.site-faq summary::after{content:"+";font-size:22px;line-height:1;color:var(--orange);flex-shrink:0;}
.site-faq details[open] summary::after{content:"–";}
.site-faq p{margin:10px 0 0;}
.site-communes{display:flex;flex-wrap:wrap;gap:8px;}
.site-communes span{background:var(--card);border:1px solid var(--border);padding:8px 14px;border-radius:999px;font-weight:600;font-size:14px;}
'''
c.write_text(t, encoding='utf-8')
print('OK v6')
