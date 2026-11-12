#!/usr/bin/env python3
"""v11 : paiement en un clic (lien PayPal.Me / Lydia / virement) + « J'ai payé » côté client + confirmation côté coach."""
import pathlib, sys
p = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'split' / 'app.js'
js = p.read_text(encoding='utf-8')
def rep(old, new, count=1):
    global js
    if js.count(old) != count:
        print('ATTENDU %d, TROUVÉ %d :\n%s' % (count, js.count(old), old[:200])); sys.exit(1)
    js = js.replace(old, new)

# 1. unpaidForClient : expose la déclaration de paiement
rep("""    const item={type:'seance', id:p.id, label:(p.formule==='express'?'Coaching Express':'Coaching Classique')+' du '+fmtDate(p.date)+(p.heure?' à '+p.heure:''), montant:p.tarif, date:p.date, clientId};""",
    """    const item={type:'seance', id:p.id, label:(p.formule==='express'?'Coaching Express':'Coaching Classique')+' du '+fmtDate(p.date)+(p.heure?' à '+p.heure:''), montant:p.tarif, date:p.date, clientId, declare:!!p.paiementDeclare, declareAt:p.paiementDeclareAt||null};""")
rep("""    const item={type:'suivi', id:s.id, label:'Suivi mensuel du '+fmtDate(s.periodeDebut)+' au '+fmtDate(s.periodeFin), montant:s.tarif, date:s.periodeDebut, clientId};""",
    """    const item={type:'suivi', id:s.id, label:'Suivi mensuel du '+fmtDate(s.periodeDebut)+' au '+fmtDate(s.periodeFin), montant:s.tarif, date:s.periodeDebut, clientId, declare:!!s.paiementDeclare, declareAt:s.paiementDeclareAt||null};""")

# 2. réglages de paiement (settings/paiement) + helpers
rep("""// ---------- RENDER ----------
function clientName(c){return c.prenom+' '+c.nom;}""", r"""// ---------- PAIEMENT EN UN CLIC ----------
// settings/paiement = {paypalMe, lydia, iban, note}. Le client paie via le lien, puis déclare « J'ai payé » ;
// le coach confirme (il reçoit de toute façon la notification de PayPal / de sa banque).
const PAIEMENT_DEFAULTS = {paypalMe:'', lydia:'', iban:'', note:''};
async function loadPaiementSettings(){
  if(S.paiement) return S.paiement;
  try{ const d = await db.doc('settings/paiement').get(); S.paiement = Object.assign({}, PAIEMENT_DEFAULTS, d.exists ? d.data() : {}); }
  catch(e){ S.paiement = Object.assign({}, PAIEMENT_DEFAULTS); }
  return S.paiement;
}
function paypalHandle(v){ return String(v||'').trim().replace(/^https?:\/\/(www\.)?paypal\.me\//i,'').replace(/^@/,'').replace(/\/.*$/,''); }
function paypalUrl(handle, montant){ const h = paypalHandle(handle); return h ? 'https://www.paypal.me/'+encodeURIComponent(h)+'/'+Number(montant).toFixed(2)+'EUR' : ''; }
function payButtonsHtml(item, pay){
  const url = paypalUrl(pay.paypalMe, item.montant);
  const other = [pay.lydia ? 'Lydia : '+pay.lydia : '', pay.iban ? 'Virement : '+pay.iban : '', pay.note||''].filter(Boolean).join(' · ');
  if(item.declare) return `<div class="chips" style="margin-top:8px"><span class="badge plan">Paiement envoyé le ${fmtDate(item.declareAt||todayStr())} · en attente de confirmation</span></div>`;
  return `<div class="chips" style="margin-top:8px">
      ${url ? `<a class="btn btn-primary btn-sm" href="${url}" target="_blank" rel="noopener">Payer ${euro(item.montant)} avec PayPal</a>` : ''}
      <button class="btn btn-secondary btn-sm" onclick="declarePaiement('${item.type}','${item.id}')">J’ai payé</button>
    </div>${other ? `<p class="note" style="margin-top:6px">${other}</p>` : (url ? '' : '<p class="note" style="margin-top:6px">Réglez directement auprès de votre coach, puis touchez « J’ai payé ».</p>')}`;
}
async function declarePaiement(type, id){
  if(!confirm('Confirmer que vous avez envoyé le paiement ? Votre coach le validera de son côté.')) return;
  const path = (type==='suivi' ? 'suivis/' : 'programmes/')+id;
  await db.doc(path).update({paiementDeclare:true, paiementDeclareAt:todayStr()});
  const list = type==='suivi' ? S.suivis : S.programmes;
  const it = (list||[]).find(x=>x.id===id); if(it){ it.paiementDeclare=true; it.paiementDeclareAt=todayStr(); }
  toast('Merci, votre coach va confirmer');
  renderClientProfileArea();
}
function clientPayCardHtml(unpaid, pay){
  const items = [...unpaid.retard, ...unpaid.avenir.filter(i=>i.type==='suivi')];
  if(!items.length) return '';
  const total = unpaid.retard.reduce((a,i)=>a+i.montant,0);
  return `<section class="section">
      <div class="section-head"><h2>${ico('euro','orange','sm')}À régler</h2>${total>0?`<span class="badge warn">${euro(total)}</span>`:''}</div>
      <div class="card">${items.map(i=>`<div class="seance-row" style="flex-direction:column;align-items:stretch;gap:2px"><div style="display:flex;justify-content:space-between;gap:10px"><span>${i.label}</span><b>${euro(i.montant)}</b></div>${payButtonsHtml(i, pay)}</div>`).join('')}</div>
    </section>`;
}
function openPaiementSettings(){
  const pay = S.paiement || PAIEMENT_DEFAULTS;
  openModal(`<h3>Moyens de paiement</h3>
    <p class="note">Affichés aux clients sur leurs séances et suivis à régler. Le bouton PayPal pré-remplit le montant.</p>
    <label for="pay-paypal">Lien PayPal.Me (identifiant ou adresse)</label><div class="field"><input id="pay-paypal" value="${pay.paypalMe||''}" placeholder="coachalex"></div>
    <label for="pay-lydia">Lydia (numéro ou identifiant)</label><div class="field"><input id="pay-lydia" value="${pay.lydia||''}" placeholder="06 00 00 00 00"></div>
    <label for="pay-iban">IBAN pour virement</label><div class="field"><input id="pay-iban" value="${pay.iban||''}" placeholder="FR76 …"></div>
    <label for="pay-note">Consigne (facultatif)</label><div class="field"><input id="pay-note" value="${pay.note||''}" placeholder="Espèces acceptées en fin de séance"></div>
    <div class="modalbtns"><button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="savePaiementSettings()">Enregistrer</button></div>`);
}
async function savePaiementSettings(){
  const data = {paypalMe:paypalHandle(val('pay-paypal')), lydia:val('pay-lydia').trim(), iban:val('pay-iban').trim(), note:val('pay-note').trim()};
  await db.doc('settings/paiement').set(data);
  S.paiement = Object.assign({}, PAIEMENT_DEFAULTS, data);
  closeModal(); toast('Moyens de paiement enregistrés'); renderCompta();
}

// ---------- RENDER ----------
function clientName(c){return c.prenom+' '+c.nom;}""")

# 3. accueil client : carte « À régler »
rep("""  const actifs = challenges.filter(ch=>(ch.clientsCible==='all' || ch.clientsCible.includes(c.id)) && ch.dateFin>=today && ch.dateDebut<=today);
  el.innerHTML = `""", """  const actifs = challenges.filter(ch=>(ch.clientsCible==='all' || ch.clientsCible.includes(c.id)) && ch.dateFin>=today && ch.dateDebut<=today);
  const pay = await loadPaiementSettings();
  const unpaidHome = unpaidForClient(c.id, S.programmes, S.suivis);
  el.innerHTML = `""")
rep("""      <button class="link" onclick="switchClientTab('plus','demande')">Demander une séance</button>
    </section>
    <section class="section">
      <div class="section-head"><h2>${ico('training','blue','sm')}Mon entraînement</h2></div>""", """      <button class="link" onclick="switchClientTab('plus','demande')">Demander une séance</button>
    </section>
    ${clientPayCardHtml(unpaidHome, pay)}
    <section class="section">
      <div class="section-head"><h2>${ico('training','blue','sm')}Mon entraînement</h2></div>""")

# 4. « Mon suivi » client : boutons sur chaque impayé
rep("""  const unpaid = unpaidForClient(c.id, S.programmes, S.suivis);
  const bilan = S.bilan;""", """  const unpaid = unpaidForClient(c.id, S.programmes, S.suivis);
  const pay = await loadPaiementSettings();
  const bilan = S.bilan;""")
rep("""      ${unpaidAll.length? unpaidAll.map(u=>`<div class="seance-row"><span>${u.label}${u.date>today?' <span class="badge plan">À venir</span>':''}</span><span>${euro(u.montant)}</span></div>`).join('') : '<div class="badge ok">Aucun paiement en retard</div>'}""",
    """      ${unpaidAll.length? unpaidAll.map(u=>`<div class="seance-row" style="flex-direction:column;align-items:stretch;gap:2px"><div style="display:flex;justify-content:space-between;gap:10px"><span>${u.label}${u.date>today?' <span class="badge plan">À venir</span>':''}</span><b>${euro(u.montant)}</b></div>${payButtonsHtml(u, pay)}</div>`).join('') : '<div class="badge ok">Aucun paiement en retard</div>'}""")

# 5. coach : À faire « X dit avoir payé » avec confirmation, et impayés sans déclaration
rep("""  S.clients.forEach(c=>{ const u=unpaidForClient(c.id, allProg, allSuivis); const tot=u.retard.reduce((x,i)=>x+i.montant,0); if(tot>0) todo.push({dot:'orange', icon:'euro', title:euro(tot)+' à encaisser · '+c.prenom, sub:u.retard.map(i=>i.label).join(' + '), onclick:`selectClient('${c.id}','suivi')`}); });""",
    """  S.clients.forEach(c=>{
    const u=unpaidForClient(c.id, allProg, allSuivis);
    const all=[...u.retard, ...u.avenir];
    all.filter(i=>i.declare).forEach(i=>todo.push({dot:'green', icon:'euro', title:c.prenom+' dit avoir payé '+euro(i.montant), sub:i.label+(i.declareAt?' · envoyé le '+fmtDate(i.declareAt):''), action:`<button class="btn btn-secondary btn-sm" onclick="confirmPaiement('${i.type}','${i.id}')">Confirmer</button>`}));
    const rest=u.retard.filter(i=>!i.declare); const tot=rest.reduce((x,i)=>x+i.montant,0);
    if(tot>0) todo.push({dot:'orange', icon:'euro', title:euro(tot)+' à encaisser · '+c.prenom, sub:rest.map(i=>i.label).join(' + '), onclick:`selectClient('${c.id}','suivi')`});
  });""")
rep("""async function markSeancePaidById(id){ await markSeancePaid(id); }""", """async function markSeancePaidById(id){ await markSeancePaid(id); }
async function confirmPaiement(type, id){
  if(type==='suivi') await db.doc('suivis/'+id).update({paiement:true, paiementDeclare:false});
  else await db.doc('programmes/'+id).update({paiement:true, paiementDeclare:false});
  toast('Paiement confirmé'); renderJournee();
}""")

# 6. Compta : carte « Moyens de paiement »
rep("""    ${backupCardHtml()}
""", """    <div class="card">
      <h2>Moyens de paiement</h2>
      <p class="note">${(S.paiement&&S.paiement.paypalMe) ? 'PayPal.Me : '+esc(S.paiement.paypalMe)+(S.paiement.lydia?' · Lydia : '+esc(S.paiement.lydia):'')+(S.paiement.iban?' · virement':'') : 'Aucun moyen de paiement configuré : les clients voient seulement « J\\u2019ai payé ».'}</p>
      <button class="btn btn-secondary btn-sm" onclick="openPaiementSettings()">Modifier</button>
    </div>
    ${backupCardHtml()}
""")

# 7. verrous
rep("'fbCoachResetPassword','fbGoogle'];", "'fbCoachResetPassword','fbGoogle','declarePaiement','confirmPaiement','savePaiementSettings'];")
p.write_text(js, encoding='utf-8')
print('patch v11 appliqué')
